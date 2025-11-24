import {
  createUsdtBscWithdrawal,
  fetchUsdtBscMinimums,
  CoinpaymentsError,
} from "@/lib/coinpayment";
import { protectedProcedure } from "../../init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import prisma from "@/lib/prismadb";

const withdrawInputSchema = z.object({
  amount: z.number().positive(),
  address: z.string().trim().min(10).max(120),
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
      const totalAmount = Number(input.amount); // This is what user types (total to deduct)

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
      const fee = calculateWithdrawalFee(totalAmount);
      const amountToSend = calculateAmountToSend(totalAmount); // Amount sent to CoinPayments

      // Validate that amount to send meets CoinPayments minimum
      const { cryptoAmount: coinpaymentsMin } = await fetchUsdtBscMinimums();
      if (coinpaymentsMin && amountToSend < coinpaymentsMin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `After fees, the amount to send (${amountToSend.toFixed(2)} USDT) is below CoinPayments minimum (${coinpaymentsMin} USDT). Please increase your withdrawal amount.`,
        });
      }

      // Check wallet balance - user types totalAmount, that's what we deduct
      const wallet = await prisma.userBalance.findUnique({
        where: { userId: ctx.auth.user.id },
        select: { balance: true },
      });

      if (!wallet || wallet.balance < totalAmount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient balance. You need ${totalAmount.toFixed(2)} USDT (you will receive ${amountToSend.toFixed(2)} USDT after ${fee.toFixed(2)} fee).`,
        });
      }

      // Check for existing pending withdrawal to prevent race conditions
      const existingPending = await prisma.transactionRecord.findFirst({
        where: {
          userId: ctx.auth.user.id,
          type: "withdrawal",
          status: "pending",
        },
      });

      if (existingPending) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have a pending withdrawal. Please wait for it to complete before creating a new one.",
        });
      }

      try {
        // Create withdrawal with CoinPayments (amount after fee deduction)
        const withdrawal = await createUsdtBscWithdrawal({
          userId: ctx.auth.user.id,
          amount: amountToSend, // Send amount after fee deduction
          address,
        });

        // Create transaction record with fee information
        await prisma.$transaction(async (tx) => {
          // Deduct total amount (what user typed) from balance
          await tx.userBalance.update({
            where: { userId: ctx.auth.user.id },
            data: {
              balance: {
                decrement: totalAmount,
              },
            },
          });

          // Create withdrawal transaction record (amount sent to CoinPayments)
          // Store totalAmount in description for refund calculation clarity
          await tx.transactionRecord.create({
            data: {
              userId: ctx.auth.user.id,
              type: "withdrawal",
              amount: amountToSend, // Amount actually sent to CoinPayments
              currency: "USDT",
              status: withdrawal.status ?? "pending",
              description: fee > 0 
                ? `CoinPayments USDT-BSC withdrawal: ${amountToSend.toFixed(2)} USDT sent (${totalAmount.toFixed(2)} USDT total deducted, ${fee.toFixed(2)} USDT fee)` 
                : `CoinPayments USDT-BSC withdrawal: ${amountToSend.toFixed(2)} USDT sent (${totalAmount.toFixed(2)} USDT total deducted)`,
              transactionHash: withdrawal.withdrawalId,
              fromAddress: null,
              toAddress: withdrawal.address,
            },
          });

          // If there's a fee, create a separate fee transaction record
          // Store withdrawal ID in description for linking during refunds
          if (fee > 0) {
            await tx.transactionRecord.create({
              data: {
                userId: ctx.auth.user.id,
                type: "withdrawal_fee",
                amount: fee,
                currency: "USDT",
                status: "completed",
                description: `Withdrawal fee (6% for withdrawals under $${FEE_THRESHOLD}) - Withdrawal ID: ${withdrawal.withdrawalId}`,
                transactionHash: withdrawal.withdrawalId, // Link to withdrawal for easier lookup
                fromAddress: null,
                toAddress: null,
              },
            });
          }
        });

        return {
          withdrawalId: withdrawal.withdrawalId,
          status: withdrawal.status,
          amountSent: amountToSend, // Amount sent to CoinPayments
          amountReceived: amountToSend, // What user will receive
          fee: fee,
          totalDeduction: totalAmount, // Total deducted from balance
        };
      } catch (error) {
        // If CoinPayments call fails, we haven't deducted balance yet, so no refund needed
        if (error instanceof CoinpaymentsError) {
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

