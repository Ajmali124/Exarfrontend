import {
  createUsdtBscDepositAddress,
  CoinpaymentsError,
  fetchUsdtBscMinimums,
} from "@/lib/coinpayment";
import { protectedProcedure } from "../../init";
import { TRPCError } from "@trpc/server";
import prisma from "@/lib/prismadb";

export const depositRouter = {
  generateDepositAddress: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const userId = ctx.auth.user.id;
      const minimums = await fetchUsdtBscMinimums();

      const existingAddress =
        await prisma.coinpaymentsDepositAddress.findUnique({
          where: { userId },
        });

      if (existingAddress) {
        return {
          address: existingAddress.address,
          paymentId: existingAddress.paymentId ?? existingAddress.id,
          orderId: existingAddress.label,
          payCurrency: existingAddress.payCurrency,
          payAmount: undefined,
          minPayAmount: {
            crypto: minimums.cryptoAmount,
            fiat: minimums.fiatAmount,
          },
          network: "BNB Smart Chain (BEP20)",
          contractAddress: "0x55d398326f99059ff775485246999027b3197955",
          currency: "USDT",
        };
      }

      const result = await createUsdtBscDepositAddress({
        userId,
      });

      await prisma.coinpaymentsDepositAddress.create({
        data: {
          userId,
          label: result.orderId,
          address: result.address,
          payCurrency: result.payCurrency ?? "usdtbep20",
          paymentId: result.paymentId ? String(result.paymentId) : null,
        },
      });

      return {
        address: result.address,
        paymentId: result.paymentId,
        orderId: result.orderId,
        payCurrency: result.payCurrency,
        payAmount: result.payAmount,
        minPayAmount:
          result.minPayAmount ?? {
            crypto: minimums.cryptoAmount,
            fiat: minimums.fiatAmount,
          },
        network: "BNB Smart Chain (BEP20)",
        contractAddress: "0x55d398326f99059ff775485246999027b3197955",
        currency: "USDT",
      };
    } catch (error) {
      if (error instanceof CoinpaymentsError) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate deposit address",
      });
    }
  }),
};

