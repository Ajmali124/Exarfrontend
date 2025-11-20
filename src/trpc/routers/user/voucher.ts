import { protectedProcedure } from "../../init";
import prisma from "@/lib/prismadb";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  findPackageForAmount,
  calculateMaxEarning,
  STAKING_PACKAGES,
} from "@/lib/staking-packages";

/**
 * Voucher-related tRPC procedures
 * Handles user vouchers, redemption, and management
 */
export const voucherRouter = {
  // Get all vouchers for the authenticated user
  getVouchers: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(["active", "used", "expired", "all"]).optional(),
          type: z
            .enum(["package", "withdraw", "futures", "bonus", "trading_fee"])
            .optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        const where: any = {
          userId: ctx.auth.user.id,
        };

        // Filter by status
        if (input?.status && input.status !== "all") {
          where.status = input.status;
        }

        // Filter by type
        if (input?.type) {
          where.type = input.type;
        }

        // Filter out expired vouchers if status is 'active'
        if (input?.status === "active" || !input?.status) {
          where.OR = [
            { status: "active", expiresAt: { gt: new Date() } },
            { status: { not: "active" } },
          ];
        }

        const vouchers = await prisma.voucher.findMany({
          where,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            code: true,
            value: true,
            currency: true,
            type: true,
            title: true,
            badge: true,
            badgeColor: true,
            description: true,
            linkText: true,
            linkHref: true,
            packageId: true,
            packageName: true,
            roiValidityDays: true,
            roiEndDate: true,
            appliedToStakeId: true,
            affectsMaxCap: true,
            status: true,
            expiresAt: true,
            usedAt: true,
            usedOnPackageId: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        // Mark expired vouchers if status filter isn't applied
        const processedVouchers = vouchers.map((voucher) => {
          const isExpired =
            voucher.status === "active" &&
            voucher.expiresAt < new Date();
          return {
            ...voucher,
            status: isExpired ? "expired" : voucher.status,
          };
        });

        return processedVouchers;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch vouchers",
        });
      }
    }),

  // Get a specific voucher by ID
  getVoucherById: protectedProcedure
    .input(
      z.object({
        voucherId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const voucher = await prisma.voucher.findFirst({
          where: {
            id: input.voucherId,
            userId: ctx.auth.user.id,
          },
          select: {
            id: true,
            code: true,
            value: true,
            currency: true,
            type: true,
            title: true,
            badge: true,
            badgeColor: true,
            description: true,
            linkText: true,
            linkHref: true,
            packageId: true,
            packageName: true,
            status: true,
            expiresAt: true,
            usedAt: true,
            usedOnPackageId: true,
            transactionId: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!voucher) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Voucher not found",
          });
        }

        // Check if expired
        const isExpired =
          voucher.status === "active" && voucher.expiresAt < new Date();

        return {
          ...voucher,
          status: isExpired ? "expired" : voucher.status,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch voucher",
        });
      }
    }),

  // Redeem a voucher (mark as used and apply its value)
  redeemVoucher: protectedProcedure
    .input(
      z.object({
        voucherId: z.string(),
        packageId: z.number().optional(), // If redeeming for a package
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the voucher
        const voucher = await prisma.voucher.findFirst({
          where: {
            id: input.voucherId,
            userId: ctx.auth.user.id,
          },
        });

        if (!voucher) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Voucher not found",
          });
        }

        // Check if voucher is active
        if (voucher.status !== "active") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Voucher is already ${voucher.status}`,
          });
        }

        // Check if voucher is expired
        if (voucher.expiresAt < new Date()) {
          // Update status to expired
          await prisma.voucher.update({
            where: { id: voucher.id },
            data: { status: "expired" },
          });

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Voucher has expired",
          });
        }

        // Check type-specific requirements
        if (voucher.type === "package" && !input.packageId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Package ID is required for package vouchers",
          });
        }

        // Use a transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
          // Mark voucher as used
          const updatedVoucher = await tx.voucher.update({
            where: { id: voucher.id },
            data: {
              status: "used",
              usedAt: new Date(),
              usedOnPackageId: input.packageId || null,
            },
          });

          // Apply voucher value based on type
          if (voucher.type === "withdraw") {
            // Add to user balance (instant withdrawable)
            await tx.userBalance.upsert({
              where: { userId: ctx.auth.user.id },
              create: {
                userId: ctx.auth.user.id,
                balance: voucher.value,
              },
              update: {
                balance: { increment: voucher.value },
              },
            });

            // Create transaction record
            await tx.transactionRecord.create({
              data: {
                userId: ctx.auth.user.id,
                type: "reward",
                amount: voucher.value,
                currency: voucher.currency,
                status: "completed",
                description: `Voucher redeemed: ${voucher.title}`,
              },
            });
          } else if (voucher.type === "package" && input.packageId) {
            // Package voucher - can be used during staking package purchase
            // The actual application happens during the staking purchase flow
            // For now, we just mark it as used
          }

          return updatedVoucher;
        });

        return {
          success: true,
          voucher: result,
          message: "Voucher redeemed successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to redeem voucher",
        });
      }
    }),

  // Redeem voucher by code (for manual voucher codes)
  redeemVoucherByCode: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        packageId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const voucher = await prisma.voucher.findUnique({
          where: {
            code: input.code,
          },
        });

        if (!voucher) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invalid voucher code",
          });
        }

        // Check if voucher belongs to user or is unassigned
        if (voucher.userId && voucher.userId !== ctx.auth.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This voucher does not belong to you",
          });
        }

        // If voucher is unassigned, assign it to the user
        if (!voucher.userId) {
          await prisma.voucher.update({
            where: { id: voucher.id },
            data: { userId: ctx.auth.user.id },
          });
        }

        // Then redeem it using the existing redeem logic
        // This is a simplified version - you might want to refactor this
        if (voucher.status !== "active") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Voucher is already ${voucher.status}`,
          });
        }

        if (voucher.expiresAt < new Date()) {
          await prisma.voucher.update({
            where: { id: voucher.id },
            data: { status: "expired" },
          });

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Voucher has expired",
          });
        }

        // Use transaction with double-check to prevent race conditions
        const result = await prisma.$transaction(async (tx) => {
          // Double-check voucher is still active before updating (prevents race conditions)
          const currentVoucher = await tx.voucher.findUnique({
            where: { id: voucher.id },
            select: { status: true, userId: true },
          });

          if (!currentVoucher) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Voucher not found",
            });
          }

          if (currentVoucher.status !== "active") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Voucher is already ${currentVoucher.status}`,
            });
          }

          // Check if voucher belongs to another user
          if (currentVoucher.userId && currentVoucher.userId !== ctx.auth.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "This voucher does not belong to you",
            });
          }

          const updatedVoucher = await tx.voucher.update({
            where: { id: voucher.id },
            data: {
              userId: ctx.auth.user.id,
              status: "used",
              usedAt: new Date(),
              usedOnPackageId: input.packageId || null,
            },
          });

          if (voucher.type === "withdraw") {
            await tx.userBalance.upsert({
              where: { userId: ctx.auth.user.id },
              create: {
                userId: ctx.auth.user.id,
                balance: voucher.value,
              },
              update: {
                balance: { increment: voucher.value },
              },
            });

            await tx.transactionRecord.create({
              data: {
                userId: ctx.auth.user.id,
                type: "reward",
                amount: voucher.value,
                currency: voucher.currency,
                status: "completed",
                description: `Voucher redeemed: ${voucher.title}`,
              },
            });
          }

          return updatedVoucher;
        });

        return {
          success: true,
          voucher: result,
          message: "Voucher code redeemed successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to redeem voucher code",
        });
      }
    }),

  // Use voucher to create staking entry directly
  useVoucherForStake: protectedProcedure
    .input(
      z.object({
        voucherId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the voucher
        const voucher = (await prisma.voucher.findFirst({
          where: {
            id: input.voucherId,
            userId: ctx.auth.user.id,
          },
        })) as any; // Type assertion until Prisma client is regenerated

        if (!voucher) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Voucher not found",
          });
        }

        // Check if voucher is active
        if (voucher.status !== "active") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Voucher is already ${voucher.status}`,
          });
        }

        // Check if voucher is expired
        if (voucher.expiresAt < new Date()) {
          await prisma.voucher.update({
            where: { id: voucher.id },
            data: { status: "expired" },
          });

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Voucher has expired",
          });
        }

        // Check if voucher is for package type
        if (voucher.type !== "package") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This voucher cannot be used for staking packages",
          });
        }

        // Find matching package based on voucher value or packageId
        let packageInfo;
        if (voucher.packageId !== null && voucher.packageId !== undefined) {
          packageInfo = STAKING_PACKAGES.find((p) => p.id === voucher.packageId);
        } else {
          packageInfo = findPackageForAmount(voucher.value);
        }

        if (!packageInfo) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `No matching package found for voucher value: $${voucher.value}`,
          });
        }

        // Verify voucher value matches package amount
        if (voucher.value !== packageInfo.amount) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Voucher value ($${voucher.value}) does not match package amount ($${packageInfo.amount})`,
          });
        }

        // Check if voucher requires a real package purchase
        const requiresRealPackage = (voucher as any).requiresRealPackage === true;
        const affectsMaxCap = (voucher as any).affectsMaxCap === true;

        // If voucher requires real package, check if user has purchased one (not from voucher)
        if (requiresRealPackage) {
          // Get all active stakes
          const activeStakes = await prisma.stakingEntry.findMany({
            where: {
              userId: ctx.auth.user.id,
              status: "active",
            },
            select: { id: true },
          });

          // Get all stake IDs that are linked to vouchers (voucher-based stakes)
          const voucherLinkedStakeIds = await prisma.voucher
            .findMany({
              where: {
                userId: ctx.auth.user.id,
                appliedToStakeId: { not: null },
                status: "used",
              },
              select: { appliedToStakeId: true },
            })
            .then((vouchers) =>
              vouchers
                .map((v) => (v as any).appliedToStakeId)
                .filter((id) => id !== null) as string[]
            );

          // Check if user has any active stake that is NOT from a voucher (real package)
          const hasRealPackage = activeStakes.some(
            (stake) => !voucherLinkedStakeIds.includes(stake.id)
          );

          // If user only has voucher-based stakes or no stakes, they don't have a real package
          if (!hasRealPackage) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "This voucher requires you to have purchased a real package first. Please purchase a package before using this voucher.",
            });
          }
        }

        // Calculate max earning based on voucher type
        let maxEarning = 0;
        if (affectsMaxCap) {
          // Voucher has its own independent max cap
          maxEarning = calculateMaxEarning(voucher.value, packageInfo.cap);
        } else {
          // Voucher provides ROI but no max cap tracking (flushed ROI)
          maxEarning = 0; // No max cap, ROI is flushed
        }

        // Calculate ROI end date if voucher has validity period
        let roiEndDate: Date | null = null;
        if ((voucher as any).roiValidityDays) {
          roiEndDate = new Date();
          roiEndDate.setDate(roiEndDate.getDate() + (voucher as any).roiValidityDays);
        }

        // Find sponsor for team rewards
        const invitedMember = await prisma.invitedMember.findFirst({
          where: { userId: ctx.auth.user.id },
          select: { sponsorId: true },
        });

        // Create stake entry and mark voucher as used in transaction
        const result = await prisma.$transaction(async (tx) => {
          // Check if user already has this voucher applied to a stake
          if ((voucher as any).appliedToStakeId) {
            const existingStake = await tx.stakingEntry.findUnique({
              where: { id: (voucher as any).appliedToStakeId },
            });

            if (existingStake && existingStake.status === "active") {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "This voucher is already applied to an active stake",
              });
            }
          }

          // Create stake entry
          // Note: If maxEarning is 0, ROI will be flushed (no max cap tracking)
          const stakeEntry = await tx.stakingEntry.create({
            data: {
              userId: ctx.auth.user.id,
              packageName: packageInfo.name,
              packageId: packageInfo.id,
              amount: voucher.value, // Stake amount = voucher value
              currency: voucher.currency || "USDT",
              dailyROI: packageInfo.roi,
              cap: packageInfo.cap,
              maxEarning, // If affectsMaxCap=true: has max cap, else: 0 (flushed ROI)
              totalEarned: 0,
              status: "active",
              startDate: new Date(),
            },
          });

          // Mark voucher as used and link to stake entry
          const updatedVoucher = await tx.voucher.update({
            where: { id: voucher.id },
            data: {
              status: "used",
              usedAt: new Date(),
              usedOnPackageId: packageInfo.id,
              appliedToStakeId: stakeEntry.id, // Link voucher to stake
              roiEndDate, // Set ROI end date based on validity period
            } as any, // Type assertion until Prisma client is regenerated
          });

          // Add to onStaking (not from balance since it's a voucher)
          await tx.userBalance.upsert({
            where: { userId: ctx.auth.user.id },
            create: {
              userId: ctx.auth.user.id,
              onStaking: voucher.value,
            },
            update: {
              onStaking: { increment: voucher.value },
            },
          });

          // NO direct bonus or team earning for sponsor when voucher is used
          // Vouchers are promotional rewards and don't generate sponsor benefits

          // Create transaction record for voucher redemption
          await tx.transactionRecord.create({
            data: {
              userId: ctx.auth.user.id,
              type: "reward",
              amount: voucher.value,
              currency: voucher.currency || "USDT",
              status: "completed",
              description: `Voucher redeemed for ${packageInfo.name} package`,
            },
          });

          return {
            voucher: updatedVoucher,
            stakeEntry,
          };
        });

        return {
          success: true,
          voucher: result.voucher,
          stakeEntry: result.stakeEntry,
          message: `Successfully created ${packageInfo.name} stake entry using voucher`,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to use voucher for stake",
        });
      }
    }),
};

