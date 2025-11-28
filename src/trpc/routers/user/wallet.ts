import { protectedProcedure } from "../../init";
import prisma from "@/lib/prismadb";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

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

  // Get recent transaction history for the authenticated user
  getTransactions: protectedProcedure.query(async ({ ctx }) => {
    try {
      const transactions = await prisma.transactionRecord.findMany({
        where: {
          userId: ctx.auth.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          type: true,
          description: true,
          transactionHash: true,
          fromAddress: true,
          toAddress: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Get team earnings grouped by date
      const teamEarnings = await prisma.teamEarningRecord.findMany({
        where: {
          userId: ctx.auth.user.id,
        },
        select: {
          amount: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Group team earnings by date (YYYY-MM-DD)
      const earningsByDate = new Map<string, number>();
      const earningsDates = new Map<string, Date>();

      for (const earning of teamEarnings) {
        const dateKey = new Date(earning.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD
        const existing = earningsByDate.get(dateKey) || 0;
        earningsByDate.set(dateKey, existing + earning.amount);
        
        // Store the first occurrence date for sorting
        if (!earningsDates.has(dateKey)) {
          earningsDates.set(dateKey, new Date(earning.createdAt));
        }
      }

      // Create aggregated team earning entries
      const teamEarningEntries = Array.from(earningsByDate.entries()).map(([dateKey, totalAmount]) => {
        const date = new Date(dateKey);
        const formattedDate = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        return {
          id: `team-earning-${dateKey}`, // Unique ID for team earnings
          amount: totalAmount,
          currency: "USDT",
          status: "completed",
          type: "team_earning",
          description: `Team Commission - ${formattedDate}`,
          transactionHash: null,
          fromAddress: null,
          toAddress: null,
          createdAt: earningsDates.get(dateKey)!,
          updatedAt: earningsDates.get(dateKey)!,
          isTeamEarning: true, // Flag to identify team earnings
          teamEarningDate: dateKey, // Store date for detail page
        };
      });

      // Combine transactions and team earnings, then sort by date
      const allEntries = [...transactions, ...teamEarningEntries].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return allEntries.slice(0, 100); // Return top 100 entries
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch transaction history",
      });
    }
  }),

  // Get team earnings for a specific date
  getTeamEarningsByDate: protectedProcedure
    .input(
      z.object({
        date: z.string(), // YYYY-MM-DD format
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const startDate = new Date(input.date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(input.date);
        endDate.setHours(23, 59, 59, 999);

        const earnings = await prisma.teamEarningRecord.findMany({
          where: {
            userId: ctx.auth.user.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            sourceUser: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        const total = earnings.reduce((sum, e) => sum + e.amount, 0);

        return {
          date: input.date,
          total,
          earnings,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch team earnings",
        });
      }
    }),
};

