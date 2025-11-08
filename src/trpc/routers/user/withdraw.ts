import { createUsdtBscWithdrawal, getUsdtBscMinimums, NowPaymentsError } from "@/lib/nowpayments";
import { protectedProcedure } from "../../init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import prisma from "@/lib/prismadb";

const withdrawInputSchema = z.object({
  amount: z.number().positive(),
  address: z.string().trim().min(10).max(120),
});

export const withdrawRouter = {
  getWithdrawalSettings: protectedProcedure.query(async () => {
    const minimums = await getUsdtBscMinimums();

    return {
      minAmount: minimums.cryptoAmount ?? null,
      minAmountFiat: minimums.fiatAmount ?? null,
      currency: "USDT",
      network: "BNB Smart Chain (BEP20)",
    };
  }),

  requestWithdrawal: protectedProcedure
    .input(withdrawInputSchema)
    .mutation(async ({ ctx, input }) => {
      const amount = Number(input.amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Withdrawal amount must be a positive number.",
        });
      }

      const address = input.address.trim();
      if (!address) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Withdrawal address is required.",
        });
      }

      const wallet = await prisma.userBalance.findUnique({
        where: { userId: ctx.auth.user.id },
        select: { balance: true },
      });

      if (!wallet || wallet.balance < amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient balance for withdrawal.",
        });
      }

      try {
        const withdrawal = await createUsdtBscWithdrawal({
          userId: ctx.auth.user.id,
          amount,
          address,
        });

        await prisma.$transaction([
          prisma.userBalance.update({
            where: { userId: ctx.auth.user.id },
            data: {
              balance: {
                decrement: amount,
              },
            },
          }),
          prisma.transactionRecord.create({
            data: {
              userId: ctx.auth.user.id,
              type: "withdrawal",
              amount,
              currency: "USDT",
              status: withdrawal.status ?? "pending",
              description: "NOWPayments USDT-BSC withdrawal",
              transactionHash: null,
              fromAddress: null,
              toAddress: withdrawal.address,
            },
          }),
        ]);

        return {
          withdrawalId: withdrawal.withdrawalId,
          status: withdrawal.status,
        };
      } catch (error) {
        if (error instanceof NowPaymentsError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create withdrawal.",
        });
      }
    }),
};

