import { protectedProcedure } from "../../init";
import prisma from "@/lib/prismadb";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import {
  findPackageForAmount,
  calculateMaxEarning,
  STAKING_PACKAGES,
} from "@/lib/staking-packages";

/**
 * Staking-related tRPC procedures
 * Handles staking packages, stake creation, and unstaking
 */
export const stakingRouter = {
  // Get all staking packages (filtered to only show visible ones)
  getStakingPackages: protectedProcedure.query(async () => {
    // Filter out packages where visible is explicitly false
    // This allows hiding packages (like Silver) from UI while keeping them in data for backward compatibility
    return STAKING_PACKAGES.filter((pkg) => pkg.visible !== false);
  }),

  // Get active staking entries for user
  getStakingEntries: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Query all active/unstaking entries
      const entries = await prisma.stakingEntry.findMany({
        where: {
          userId: ctx.auth.user.id,
          status: { in: ["active", "unstaking"] },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Filter and map entries, ensuring all required fields exist
      // This handles edge cases where old entries might not have new fields
      const validEntries = entries
        .filter((entry) => {
          // Only include entries that have all required fields
          return (
            entry.packageName &&
            typeof entry.packageId === "number" &&
            typeof entry.dailyROI === "number" &&
            typeof entry.cap === "number" &&
            typeof entry.maxEarning === "number" &&
            typeof entry.totalEarned === "number"
          );
        })
        .map((entry) => ({
          id: entry.id,
          userId: entry.userId,
          packageName: entry.packageName,
          packageId: entry.packageId,
          amount: entry.amount ?? 0,
          currency: entry.currency ?? "USDT",
          dailyROI: entry.dailyROI ?? 0,
          cap: entry.cap ?? 0,
          maxEarning: entry.maxEarning ?? 0,
          totalEarned: entry.totalEarned ?? 0,
          status: entry.status ?? "active",
          startDate: entry.startDate,
          unstakeRequestedDate: entry.unstakeRequestedDate ?? null,
          cooldownEndDate: entry.cooldownEndDate ?? null,
          endDate: entry.endDate ?? null,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        }));

      return validEntries;
    } catch (error: any) {
      console.error("Error fetching staking entries:", {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack,
      });
      // Return empty array instead of throwing for production
      // This prevents UI from breaking if there's a database issue
      return [];
    }
  }),

  // Create a new stake
  createStake: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(10).positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { amount } = input;

        // Find matching package (must be exact amount match)
        const packageInfo = findPackageForAmount(amount);
        if (!packageInfo) {
          const availableAmounts = STAKING_PACKAGES.map((p) => p.amount).join(", ");
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Invalid amount. Available package amounts: ${availableAmounts} USDT`,
          });
        }

        // Check user balance
        const userBalance = await prisma.userBalance.findUnique({
          where: { userId: ctx.auth.user.id },
        });

        if (!userBalance) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User balance not found. Please contact support.",
          });
        }

        const availableBalance = userBalance.balance ?? 0;
        if (availableBalance < amount) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient balance. Available: ${availableBalance.toFixed(2)} USDT`,
          });
        }

        // Calculate max earning
        const maxEarning = calculateMaxEarning(amount, packageInfo.cap);

        // Find sponsor (the user who invited this user)
        const invitedMember = await prisma.invitedMember.findFirst({
          where: { userId: ctx.auth.user.id },
          select: { sponsorId: true },
        });

        // Create stake entry and update balance in transaction
        const result = await prisma.$transaction(async (tx) => {
          // Double-check balance hasn't changed (race condition protection)
          const currentBalance = await tx.userBalance.findUnique({
            where: { userId: ctx.auth.user.id },
            select: { balance: true },
          });

          if (!currentBalance || (currentBalance.balance ?? 0) < amount) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Insufficient balance. Available: ${(currentBalance?.balance ?? 0).toFixed(2)} USDT`,
            });
          }

          // Create stake entry
          const stakeEntry = await tx.stakingEntry.create({
            data: {
              userId: ctx.auth.user.id,
              packageName: packageInfo.name,
              packageId: packageInfo.id,
              amount,
              currency: "USDT",
              dailyROI: packageInfo.roi,
              cap: packageInfo.cap,
              maxEarning,
              totalEarned: 0,
              status: "active",
              startDate: new Date(),
            },
          });

          // Deduct from balance and add to onStaking
          await tx.userBalance.update({
            where: { userId: ctx.auth.user.id },
            data: {
              balance: {
                decrement: amount,
              },
              onStaking: {
                increment: amount,
              },
            },
          });

          // Distribute direct bonus to sponsor (5% of package amount)
          // This follows the same cap-checking logic as team earnings distribution
          // Priority: Real package entries first, then voucher positions (if no real packages)
          if (invitedMember?.sponsorId) {
            const directBonus = amount * 0.05; // 5% direct bonus

            // Get sponsor's active staking entries to check remaining cap space
            const sponsorActiveStakes = await tx.stakingEntry.findMany({
              where: {
                userId: invitedMember.sponsorId,
                status: { in: ["active", "unstaking"] },
              },
              orderBy: {
                createdAt: "asc",
              },
            });

            // Separate real package entries from voucher position entries
            const realPackageEntries = sponsorActiveStakes.filter(
              (entry) => entry.packageName !== "Voucher Position"
            );
            const voucherPositionEntries = sponsorActiveStakes.filter(
              (entry) => entry.packageName === "Voucher Position" && (entry.maxEarning ?? 0) > 0
            );

            // Determine which entries to use for distribution
            // Priority: Real packages first, then voucher positions (only if no real packages)
            const entriesToUse = realPackageEntries.length > 0 
              ? realPackageEntries 
              : voucherPositionEntries;

            // Only give bonus if sponsor has eligible entries (real packages or voucher positions with maxCap)
            if (entriesToUse.length > 0) {
              // Get sponsor balance
              const sponsorBalance = await tx.userBalance.findUnique({
                where: { userId: invitedMember.sponsorId },
              });

              if (sponsorBalance) {
                let remainingBonus = directBonus;
                let credited = 0;
                let missed = 0;
                let onStakingReleased = 0;

                // Distribute bonus across eligible entries respecting their max caps
                // (Real packages prioritized, or voucher positions if no real packages)
                for (const entry of entriesToUse) {
                  if (remainingBonus <= 0) {
                    break;
                  }

                  const maxEarning = entry.maxEarning ?? 0;
                  const totalEarned = entry.totalEarned ?? 0;
                  const remainingCap = Math.max(0, maxEarning - totalEarned);

                  // Skip entries that have reached their cap
                  if (remainingCap <= 0) {
                    continue;
                  }

                  // Apply only what fits within this entry's remaining cap
                  const applied = Math.min(remainingBonus, remainingCap);
                  const newTotal = totalEarned + applied;
                  const reachedCap = newTotal >= maxEarning;

                  // Update entry with the applied bonus
                  await tx.stakingEntry.update({
                    where: { id: entry.id },
                    data: {
                      totalEarned: newTotal,
                      status: reachedCap ? "completed" : entry.status,
                      endDate: reachedCap ? new Date() : entry.endDate,
                    },
                  });

                  credited += applied;
                  remainingBonus -= applied;

                  // Track onStaking release if cap reached
                  if (reachedCap) {
                    onStakingReleased += entry.amount ?? 0;
                  }
                }

                // Any remaining bonus that couldn't fit goes to missed earnings
                missed = remainingBonus;

                // Update sponsor balance (single update for all changes)
                const balanceUpdate: Prisma.UserBalanceUpdateInput = {};
                if (credited > 0) {
                  balanceUpdate.balance = { increment: credited };
                  balanceUpdate.maxEarn = { increment: credited };
                }
                if (onStakingReleased > 0) {
                  balanceUpdate.onStaking = { decrement: onStakingReleased };
                }
                if (missed > 0) {
                  balanceUpdate.missedEarnings = { increment: missed };
                }

                if (Object.keys(balanceUpdate).length > 0) {
                  await tx.userBalance.update({
                    where: { userId: invitedMember.sponsorId },
                    data: balanceUpdate,
                  });
                }

                // Create transaction record only for credited amount
                if (credited > 0) {
                  await tx.transactionRecord.create({
                    data: {
                      userId: invitedMember.sponsorId,
                      type: "reward",
                      amount: credited,
                      currency: "USDT",
                      status: "completed",
                      description: `Direct bonus from ${ctx.auth.user.email || ctx.auth.user.id} package subscription${missed > 0 ? ` (${missed.toFixed(2)} USDT missed due to cap limit)` : ""}`,
                    },
                  });
                }
              }
            }
            // If sponsor has no active package, bonus is flushed out (not given)
          }

          return stakeEntry;
        });

        return result;
      } catch (error: any) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to create stake",
        });
      }
    }),

  // Request unstake (starts 3-day cooldown)
  requestUnstake: protectedProcedure
    .input(
      z.object({
        stakeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { stakeId } = input;

        // Get the stake entry
        const stake = await prisma.stakingEntry.findFirst({
          where: {
            id: stakeId,
            userId: ctx.auth.user.id,
            status: "active",
          },
        });

        if (!stake) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Stake not found or already unstaking/completed",
          });
        }

        // Calculate cooldown end date (3 days from now)
        const cooldownEndDate = new Date();
        cooldownEndDate.setDate(cooldownEndDate.getDate() + 3);

        // Update stake to unstaking status
        const updated = await prisma.stakingEntry.update({
          where: { id: stakeId },
          data: {
            status: "unstaking",
            unstakeRequestedDate: new Date(),
            cooldownEndDate,
          },
        });

        return updated;
      } catch (error: any) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to request unstake",
        });
      }
    }),

  // Complete unstake (after cooldown period)
  completeUnstake: protectedProcedure
    .input(
      z.object({
        stakeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { stakeId } = input;

        // Get the stake entry
        const stake = await prisma.stakingEntry.findFirst({
          where: {
            id: stakeId,
            userId: ctx.auth.user.id,
            status: "unstaking",
          },
        });

        if (!stake) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Stake not found or not in unstaking status",
          });
        }

        // Check if cooldown period has ended
        if (!stake.cooldownEndDate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cooldown date not set. Please contact support.",
          });
        }

        const cooldownEnd = new Date(stake.cooldownEndDate);
        const now = new Date();

        if (now < cooldownEnd) {
          const remainingMs = cooldownEnd.getTime() - now.getTime();
          const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Cooldown period has not ended yet. ${remainingHours} hours remaining.`,
          });
        }

        // Safety checks
        const totalEarned = stake.totalEarned ?? 0;
        const stakeAmount = stake.amount ?? 0;

        // Calculate principal return (amount - totalEarned)
        // ROI is deducted from principal, so user gets back less principal
        const principalReturn = Math.max(0, stakeAmount - totalEarned);
        const totalWithdrawal = principalReturn + totalEarned;

        // Complete unstake in transaction
        const result = await prisma.$transaction(async (tx) => {
          // Update stake to completed
          const updated = await tx.stakingEntry.update({
            where: { id: stakeId },
            data: {
              status: "completed",
              endDate: new Date(),
            },
          });

          // Return principal (minus earned ROI) to balance
          // Remove from onStaking
          await tx.userBalance.update({
            where: { userId: ctx.auth.user.id },
            data: {
              balance: {
                increment: principalReturn,
              },
              onStaking: {
                decrement: stakeAmount,
              },
            },
          });

          return {
            ...updated,
            principalReturn,
            totalWithdrawal,
          };
        });

        return result;
      } catch (error: any) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to complete unstake",
        });
      }
  }),
};

