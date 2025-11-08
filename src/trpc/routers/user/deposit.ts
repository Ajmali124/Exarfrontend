import { createUsdtBscDepositAddress, NowPaymentsError } from "@/lib/nowpayments";
import { protectedProcedure } from "../../init";
import { TRPCError } from "@trpc/server";

export const depositRouter = {
  generateDepositAddress: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const result = await createUsdtBscDepositAddress({
        userId: ctx.auth.user.id,
      });

      return {
        address: result.address,
        paymentId: result.paymentId,
        orderId: result.orderId,
        payCurrency: result.payCurrency,
        payAmount: result.payAmount,
        minPayAmount: result.minPayAmount,
        network: "BNB Smart Chain (BEP20)",
        contractAddress: "0x55d398326f99059ff775485246999027b3197955",
        currency: "USDT",
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
        message: "Failed to generate deposit address",
      });
    }
  }),
};

