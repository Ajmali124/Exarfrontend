// Utility script to test IPN webhook without real payments
// This simulates the webhook payload that NOWPayments would send

import crypto from "crypto";
import { NOWPAYMENTS_IPN_SECRET } from "./shared";

/**
 * Generates a valid HMAC-SHA512 signature for testing
 */
function generateTestSignature(payload: Record<string, any>): string {
  if (!NOWPAYMENTS_IPN_SECRET) {
    throw new Error("NOWPAYMENTS_IPN_SECRET is required for testing");
  }

  // Sort payload keys alphabetically
  const sortedKeys = Object.keys(payload).sort();
  const sortedPayload: Record<string, any> = {};
  for (const key of sortedKeys) {
    sortedPayload[key] = payload[key];
  }

  // Create string representation
  const payloadString = JSON.stringify(sortedPayload);

  // Generate HMAC-SHA512 signature
  const hmac = crypto.createHmac("sha512", NOWPAYMENTS_IPN_SECRET);
  hmac.update(payloadString);
  return hmac.digest("hex");
}

/**
 * Creates a test IPN payload simulating a completed payment
 */
export function createTestIPNPayload(options: {
  userId: string;
  paymentId?: number;
  amount?: number;
  orderId?: string;
}): {
  payload: Record<string, any>;
  signature: string;
} {
  const paymentId = options.paymentId ?? Math.floor(Math.random() * 1000000);
  const amount = options.amount ?? 10.5;
  const orderId = options.orderId ?? `deposit-${options.userId}-${Date.now()}`;

  const now = new Date().toISOString();

  const payload = {
    payment_id: paymentId,
    payment_status: "finished",
    pay_address: "0x1234567890123456789012345678901234567890",
    price_amount: amount,
    price_currency: "USD",
    pay_amount: amount,
    actually_paid: amount,
    pay_currency: "usdtbsc",
    order_id: orderId,
    order_description: `Deposit for user ${options.userId}`,
    invoice_id: `inv_${paymentId}`,
    purchase_id: `purchase_${paymentId}`,
    outcome_amount: amount,
    outcome_currency: "usdtbsc",
    payin_extra_id: `tx_${paymentId}_${Date.now()}`,
    network: "bsc",
    smart_contract: "0x55d398326f99059ff775485246999027b3197955",
    created_at: now,
    updated_at: now,
  };

  const signature = generateTestSignature(payload);

  return { payload, signature };
}

/**
 * Test the IPN endpoint locally
 * Usage: This function can be called from a test script or API route
 */
export async function testIPNEndpoint(
  baseUrl: string = "http://localhost:3000"
) {
  if (!NOWPAYMENTS_IPN_SECRET) {
    throw new Error("NOWPAYMENTS_IPN_SECRET is required for testing");
  }

  // You'll need to provide a real userId from your database
  const testUserId = "test-user-id"; // Replace with actual userId

  const { payload, signature } = createTestIPNPayload({
    userId: testUserId,
    amount: 50.0,
  });

  try {
    const response = await fetch(`${baseUrl}/api/nowpayments/ipn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-nowpayments-sig": signature,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    console.log("Test IPN Response:", {
      status: response.status,
      statusText: response.statusText,
      body: result,
    });

    return { success: response.ok, response, result };
  } catch (error: any) {
    console.error("Error testing IPN endpoint:", error);
    throw error;
  }
}

