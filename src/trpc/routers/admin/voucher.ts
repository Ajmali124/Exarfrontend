import { protectedProcedure } from "../../init";
import prisma from "@/lib/prismadb";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createVouchersInBulk } from "@/lib/voucher/generate";

/**
 * Admin voucher management router
 * For creating vouchers in bulk
 */
export const adminVoucherRouter = {
  // Create vouchers in bulk
  createVouchers: protectedProcedure
    .input(
      z.object({
        value: z.number().positive(),
        currency: z.string().default("USDT"),
        type: z.enum(["package", "withdraw", "futures", "bonus", "trading_fee"]),
        title: z.string().min(1),
        badge: z.string().optional(),
        badgeColor: z.enum(["orange", "blue", "green", "purple"]).optional(),
        description: z.string().optional(),
        linkText: z.string().optional(),
        linkHref: z.string().optional(),
        packageId: z.number().optional(),
        packageName: z.string().optional(),
        expiresAt: z.date(),
        quantity: z.number().int().min(1).max(100), // Limit to 100 at a time
        userId: z.string().optional(), // Optional - if not provided, vouchers are unassigned
        roiValidityDays: z.number().int().positive().optional(), // For package vouchers: 3, 7, 14, 30 days
        affectsMaxCap: z.boolean().default(false), // If true: voucher has its own max cap. If false: no max cap (ROI flushed)
        requiresRealPackage: z.boolean().default(false), // If true: voucher only works if user has purchased a real package
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Add admin check here
        // For now, any authenticated user can create vouchers
        // You might want to check ctx.auth.user.role === "admin"

        const result = await createVouchersInBulk({
          value: input.value,
          currency: input.currency,
          type: input.type,
          title: input.title,
          badge: input.badge,
          badgeColor: input.badgeColor,
          description: input.description,
          linkText: input.linkText,
          linkHref: input.linkHref,
          packageId: input.packageId,
          packageName: input.packageName,
          expiresAt: input.expiresAt,
          quantity: input.quantity,
          userId: input.userId || undefined,
          roiValidityDays: input.roiValidityDays,
          affectsMaxCap: input.affectsMaxCap,
          requiresRealPackage: input.requiresRealPackage,
        });

        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to create vouchers",
        });
      }
    }),

  // Get all unassigned vouchers (for admin to see available vouchers)
  getUnassignedVouchers: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(["active", "used", "expired", "all"]).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Add admin check
        const where: any = {
          userId: null, // Unassigned vouchers
        };

        if (input?.status && input.status !== "all") {
          where.status = input.status;
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
            status: true,
            expiresAt: true,
            createdAt: true,
          },
        });

        return vouchers;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch unassigned vouchers",
        });
      }
    }),
};

