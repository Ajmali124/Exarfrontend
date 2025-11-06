import { protectedProcedure } from "../../init";
import prisma from "@/lib/prismadb";
import { TRPCError } from "@trpc/server";

/**
 * Wallet/Balance-related tRPC procedures
 * Handles user wallet balance and earnings
 */
export const walletRouter = {
  // Get user wallet balance and daily earnings (fast, optimized query)
  getWalletBalance: protectedProcedure.query(async ({ ctx }) => {
    try {
      const balance = await prisma.userBalance.findUnique({
        where: {
          userId: ctx.auth.user.id,
        },
        select: {
          balance: true,
          dailyEarning: true,
          latestEarning: true,
        },
      });

      // If balance doesn't exist, return defaults (should be created during registration)
      if (!balance) {
        return {
          balance: 0,
          dailyEarning: 0,
          latestEarning: 0,
        };
      }

      return {
        balance: balance.balance,
        dailyEarning: balance.dailyEarning,
        latestEarning: balance.latestEarning,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch wallet balance",
      });
    }
  }),
};

