import {
  createUsdtBscWithdrawal,
  fetchUsdtBscMinimums,
  CoinpaymentsError,
  ensureFiatPrecision,
} from "@/lib/coinpayment";
import { protectedProcedure } from "../../init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import prisma from "@/lib/prismadb";
import { randomUUID } from "node:crypto";

const withdrawInputSchema = z.object({
  amount: z.number().positive(),
  address: z.string().trim().min(10).max(120),
  // Client-generated idempotency key to prevent double-withdrawals on retries/refresh.
  requestId: z.string().uuid().optional(),
});

// Withdrawal fee constants
const MIN_WITHDRAWAL_AMOUNT = 10; // $10 minimum (what user types)
const FEE_THRESHOLD = 30; // $30 threshold for fee-free withdrawals
const WITHDRAWAL_FEE_PERCENTAGE = 0.06; // 6% fee for withdrawals under $30

/**
 * Calculate withdrawal fee based on total amount user wants to withdraw
 * The amount user types is the TOTAL they want deducted, fee comes out of that
 * @param totalAmount - The total amount user wants to withdraw (what they type)
 * @returns The fee amount (0 for $30+, 6% for under $30)
 */
function calculateWithdrawalFee(totalAmount: number): number {
  if (totalAmount >= FEE_THRESHOLD) {
    return 0;
  }
  return totalAmount * WITHDRAWAL_FEE_PERCENTAGE;
}

/**
 * Calculate the actual amount to send to CoinPayments (after fee deduction)
 * @param totalAmount - The total amount user wants to withdraw (what they type)
 * @returns The amount to send (totalAmount - fee)
 */
function calculateAmountToSend(totalAmount: number): number {
  const fee = calculateWithdrawalFee(totalAmount);
  return totalAmount - fee;
}

/**
 * Calculate minimum amount user will receive after fees
 * If user types MIN_WITHDRAWAL_AMOUNT ($10), they receive $10 - 6% = $9.40
 * @returns The minimum amount user will receive
 */
function calculateMinimumReceiveAmount(): number {
  if (MIN_WITHDRAWAL_AMOUNT >= FEE_THRESHOLD) {
    return MIN_WITHDRAWAL_AMOUNT; // No fee for $30+
  }
  // User types MIN_WITHDRAWAL_AMOUNT, receives MIN_WITHDRAWAL_AMOUNT - fee
  return calculateAmountToSend(MIN_WITHDRAWAL_AMOUNT);
}

export const withdrawRouter = {
  getWithdrawalSettings: protectedProcedure.query(async () => {
    const minimums = await fetchUsdtBscMinimums();
    // Minimum amount user must type is MIN_WITHDRAWAL_AMOUNT ($10)
    // Use the higher of our minimum or CoinPayments minimum
    const effectiveMin = Math.max(
      MIN_WITHDRAWAL_AMOUNT,
      minimums.cryptoAmount ?? MIN_WITHDRAWAL_AMOUNT
    );
    
    // Calculate minimum amount user will receive after fees
    const minReceiveAmount = calculateMinimumReceiveAmount();

    return {
      minAmount: effectiveMin, // Minimum amount user must type
      minAmountFiat: minimums.fiatAmount ?? null,
      currency: "USDT",
      network: "BNB Smart Chain (BEP20)",
      feeThreshold: FEE_THRESHOLD,
      feePercentage: WITHDRAWAL_FEE_PERCENTAGE * 100, // Return as percentage
      minReceiveAmount: minReceiveAmount, // Minimum amount user will receive after fees
    };
  }),

  requestWithdrawal: protectedProcedure
    .input(withdrawInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;
      const requestId = input.requestId ?? randomUUID();
      const totalAmount = ensureFiatPrecision(Number(input.amount)); // This is what user types (total to deduct)

      // Require Basic KYC before allowing withdrawals.
      const kycRow = await (prisma as any).kycSubmission?.findUnique?.({
        where: { userId },
        select: { basicStatus: true },
      });
      if (kycRow?.basicStatus !== "approved") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Basic KYC is required to withdraw. Please complete KYC first.",
        });
      }

      if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Withdrawal amount must be a positive number.",
        });
      }

      // Validate minimum: user must type at least MIN_WITHDRAWAL_AMOUNT ($10)
      if (totalAmount < MIN_WITHDRAWAL_AMOUNT) {
        const minReceive = calculateMinimumReceiveAmount();
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Minimum withdrawal is $${MIN_WITHDRAWAL_AMOUNT} USDT (you will receive $${minReceive.toFixed(2)} USDT after fees).`,
        });
      }

      const address = input.address.trim();
      if (!address) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Withdrawal address is required.",
        });
      }

      // Calculate fee and amount to send
      const fee = ensureFiatPrecision(calculateWithdrawalFee(totalAmount));
      const amountToSend = ensureFiatPrecision(calculateAmountToSend(totalAmount)); // Amount sent to CoinPayments

      // Validate that amount to send meets CoinPayments minimum
      const { cryptoAmount: coinpaymentsMin } = await fetchUsdtBscMinimums();
      if (coinpaymentsMin && amountToSend < coinpaymentsMin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `After fees, the amount to send (${amountToSend.toFixed(2)} USDT) is below CoinPayments minimum (${coinpaymentsMin} USDT). Please increase your withdrawal amount.`,
        });
      }

      // Idempotency: if we've already created a withdrawal record for this requestId,
      // return it without creating a second CoinPayments withdrawal or double-deducting balance.
      const existingByRequestId = await prisma.transactionRecord.findUnique({
        where: { id: requestId },
        select: {
          id: true,
          status: true,
          transactionHash: true,
          amount: true,
          currency: true,
        },
      });

      if (existingByRequestId) {
        return {
          requestId: existingByRequestId.id,
          withdrawalId: existingByRequestId.transactionHash,
          status: existingByRequestId.status,
          amountSent: existingByRequestId.amount,
          currency: existingByRequestId.currency,
          fee,
          totalDeduction: totalAmount,
        };
      }

      try {
        // Step 1 (DB-first): reserve/deduct balance and create a local withdrawal record.
        // This prevents duplicates even if the client retries due to poor internet.
        await prisma.$transaction(async (tx) => {
          // Serialize withdrawal creation per user (prevents race conditions / double submits).
          // MySQL advisory lock is per-connection, so this works inside the transaction callback.
          const lockName = `withdraw:${userId}`;
          const lockRows = (await tx.$queryRaw<
            Array<{ acquired: number | null }>
          >`SELECT GET_LOCK(${lockName}, 10) as acquired`) ?? [];

          if (!lockRows[0]?.acquired) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Withdrawal is already being processed. Please try again.",
            });
          }

          try {
            // Prevent multiple in-flight withdrawals (covers initiated/pending states).
            const inFlight = await tx.transactionRecord.findFirst({
              where: {
                userId,
                type: "withdrawal",
                status: { in: ["initiated", "pending"] },
              },
              select: { id: true },
            });

            if (inFlight) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message:
                  "You have a pending withdrawal. Please wait for it to complete before creating a new one.",
              });
            }

            // Deduct total amount (what user typed) from balance, but ONLY if sufficient.
            const updated = await tx.userBalance.updateMany({
              where: {
                userId,
                balance: { gte: totalAmount },
              },
              data: {
                balance: {
                  decrement: totalAmount,
                },
              },
            });

            if (updated.count !== 1) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Insufficient balance. You need ${totalAmount.toFixed(2)} USDT (you will receive ${amountToSend.toFixed(2)} USDT after ${fee.toFixed(2)} fee).`,
              });
            }

            // Create local withdrawal record (idempotent via requestId primary key).
            await tx.transactionRecord.create({
              data: {
                id: requestId,
                userId,
                type: "withdrawal",
                amount: amountToSend, // Amount that will be sent to CoinPayments
                currency: "USDT",
                status: "initiated",
                description:
                  fee > 0
                    ? `CoinPayments USDT-BSC withdrawal (initiated): ${amountToSend.toFixed(2)} USDT to send (${totalAmount.toFixed(2)} USDT total deducted, ${fee.toFixed(2)} USDT fee)`
                    : `CoinPayments USDT-BSC withdrawal (initiated): ${amountToSend.toFixed(2)} USDT to send (${totalAmount.toFixed(2)} USDT total deducted)`,
                transactionHash: null,
                fromAddress: null,
                toAddress: address,
              },
            });
          } finally {
            // Best-effort lock release (also releases automatically if connection ends).
            await tx.$executeRaw`SELECT RELEASE_LOCK(${lockName})`;
          }
        });

        // Step 2: call CoinPayments (external side effect) AFTER we've made the operation safe/idempotent.
        const withdrawal = await createUsdtBscWithdrawal({
          userId,
          amount: amountToSend,
          address,
          requestId,
        });

        // Step 3: persist CoinPayments withdrawal id + create fee record (if any).
        await prisma.$transaction(async (tx) => {
          await tx.transactionRecord.update({
            where: { id: requestId },
            data: {
              status: withdrawal.status ?? "pending",
              transactionHash: withdrawal.withdrawalId,
              toAddress: withdrawal.address ?? address,
            },
          });

          if (fee > 0) {
            await tx.transactionRecord.create({
              data: {
                userId,
                type: "withdrawal_fee",
                amount: fee,
                currency: "USDT",
                status: "completed",
                description: `Withdrawal fee (${(WITHDRAWAL_FEE_PERCENTAGE * 100).toFixed(0)}% for withdrawals under $${FEE_THRESHOLD}) - Withdrawal ID: ${withdrawal.withdrawalId}`,
                transactionHash: withdrawal.withdrawalId,
                fromAddress: null,
                toAddress: null,
              },
            });
          }
        });

        return {
          requestId,
          withdrawalId: withdrawal.withdrawalId,
          status: withdrawal.status,
          amountSent: amountToSend, // Amount sent to CoinPayments
          amountReceived: amountToSend, // What user will receive
          fee: fee,
          totalDeduction: totalAmount, // Total deducted from balance
        };
      } catch (error) {
        // If CoinPayments call fails after we've reserved/deducted balance, we must refund.
        if (error instanceof CoinpaymentsError) {
          await prisma.$transaction(async (tx) => {
            // Refund reserved funds (best-effort; if record wasn't created, this will no-op).
            await tx.userBalance.updateMany({
              where: { userId },
              data: {
                balance: {
                  increment: totalAmount,
                },
              },
            });

            await tx.transactionRecord.updateMany({
              where: { id: requestId },
              data: {
                status: "failed",
                description: `CoinPayments withdrawal failed: ${error.message}`,
              },
            });
          });

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

