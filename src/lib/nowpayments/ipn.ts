// IPN (Instant Payment Notification) webhook handling for NOWPayments

import crypto from "crypto";
import { NOWPAYMENTS_IPN_SECRET } from "./shared";
import prisma from "@/lib/prismadb";

export interface NowPaymentsIPNPayload {
  payment_id: number;
  invoice_id?: string | number;
  payment_status: string;
  pay_address?: string;
  price_amount: number;
  price_currency: string;
  pay_amount?: number;
  actually_paid?: number;
  pay_currency: string;
  order_id: string;
  order_description?: string;
  purchase_id?: string;
  outcome_amount?: number;
  outcome_currency?: string;
  payin_extra_id?: string | null;
  smart_contract?: string | null;
  network?: string | null;
  network_precision?: number | null;
  time_limit?: string | null;
  expiration_estimate_date?: string | null;
  payment_extra_id?: string | null;
  purchase?: {
    id: string;
    external_id: string;
    status: string;
    amount: number;
    currency: string;
    created_at: string;
    updated_at: string;
  };
}

/**
 * Validates the IPN webhook signature from NOWPayments
 * @param payload - The IPN payload as an object
 * @param signature - The signature from x-nowpayments-sig header
 * @returns true if signature is valid, false otherwise
 */
export function validateIPNSignature(
  payload: Record<string, any>,
  signature: string | null
): boolean {
  if (!NOWPAYMENTS_IPN_SECRET) {
    console.error("NOWPAYMENTS_IPN_SECRET is not configured");
    return false;
  }

  if (!signature) {
    return false;
  }

  try {
    // Sort payload keys alphabetically and create a string
    const sortedKeys = Object.keys(payload).sort();
    const sortedPayload: Record<string, any> = {};
    for (const key of sortedKeys) {
      sortedPayload[key] = payload[key];
    }

    // Create string representation (NOWPayments uses JSON.stringify on sorted object)
    const payloadString = JSON.stringify(sortedPayload);

    // Generate HMAC-SHA512 signature
    const hmac = crypto.createHmac("sha512", NOWPAYMENTS_IPN_SECRET);
    hmac.update(payloadString);
    const generatedSignature = hmac.digest("hex");

    // Compare signatures (use constant-time comparison to prevent timing attacks)
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch (error) {
    console.error("Error validating IPN signature:", error);
    return false;
  }
}

/**
 * Extracts userId from order_id
 * Format: deposit-{userId}-{timestamp}
 */
export function extractUserIdFromOrderId(orderId: string): string | null {
  const match = orderId.match(/^deposit-(.+?)-(\d+)$/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

/**
 * Processes a successful deposit payment
 * Updates user balance and creates transaction record
 */
export async function processDepositPayment(
  payload: NowPaymentsIPNPayload
): Promise<{ success: boolean; message: string }> {
  const userId = extractUserIdFromOrderId(payload.order_id);

  if (!userId) {
    return {
      success: false,
      message: `Invalid order_id format: ${payload.order_id}`,
    };
  }

  // Determine the amount to credit
  // Use actually_paid if available (amount actually received), otherwise use pay_amount
  const amountToCredit =
    typeof payload.actually_paid === "number" && payload.actually_paid > 0
      ? payload.actually_paid
      : typeof payload.pay_amount === "number" && payload.pay_amount > 0
        ? payload.pay_amount
        : 0;

  if (amountToCredit <= 0) {
    return {
      success: false,
      message: `Invalid payment amount for payment_id: ${payload.payment_id}`,
    };
  }

  try {
    // Check if this payment has already been processed
    // We'll use payment_id as a unique identifier to prevent duplicate processing
    // Check by description containing payment_id and matching amount
    const existingTransaction = await prisma.transactionRecord.findFirst({
      where: {
        userId,
        type: "deposit",
        amount: amountToCredit,
        status: "completed",
        description: {
          contains: `Payment ID: ${payload.payment_id}`,
        },
        createdAt: {
          // Only check transactions from last 30 days to avoid false positives
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingTransaction) {
      console.log(
        `Payment ${payload.payment_id} already processed (transaction: ${existingTransaction.id})`
      );
      return {
        success: true,
        message: `Payment ${payload.payment_id} already processed`,
      };
    }

    // Process the deposit in a transaction
    await prisma.$transaction(async (tx) => {
      // Ensure user balance exists
      await tx.userBalance.upsert({
        where: { userId },
        create: {
          userId,
          balance: amountToCredit,
          onStaking: 0,
          maxEarn: 0,
          dailyEarning: 0,
          teamEarning: 0,
          earningWithdraw: 0,
          latestEarning: 0,
          teamEarningWithdraw: 0,
          missedEarnings: 0,
        },
        update: {
          balance: {
            increment: amountToCredit,
          },
        },
      });

      // Create transaction record
      await tx.transactionRecord.create({
        data: {
          userId,
          type: "deposit",
          amount: amountToCredit,
          currency: payload.pay_currency.toUpperCase() || "USDT",
          status: "completed",
          description: `NOWPayments deposit - Payment ID: ${payload.payment_id}, Order: ${payload.order_id}`,
          transactionHash: payload.payin_extra_id || null,
          fromAddress: null,
          toAddress: payload.pay_address || null,
        },
      });
    });

    return {
      success: true,
      message: `Successfully processed deposit of ${amountToCredit} ${payload.pay_currency.toUpperCase()}`,
    };
  } catch (error: any) {
    console.error(`Error processing deposit payment ${payload.payment_id}:`, error);
    return {
      success: false,
      message: error?.message || "Failed to process deposit",
    };
  }
}

