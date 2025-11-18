import { NextRequest, NextResponse } from "next/server";
import {
  validateIPNSignature,
  processDepositPayment,
  type NowPaymentsIPNPayload,
} from "@/lib/nowpayments/ipn";

/**
 * NOWPayments IPN Webhook Handler
 * 
 * This endpoint receives Instant Payment Notifications from NOWPayments
 * when payment status changes.
 * 
 * Webhook payload includes:
 * - payment_id: Unique payment identifier
 * - payment_status: Current status (waiting, confirming, finished, failed, refunded)
 * - order_id: Our order identifier (format: deposit-{userId}-{timestamp})
 * - actually_paid: Amount actually received in crypto
 * - pay_currency: Cryptocurrency received
 * 
 * Security:
 * - Validates HMAC-SHA512 signature using NOWPAYMENTS_IPN_SECRET
 * - Only processes "finished" status payments
 * - Prevents duplicate processing
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const payload = (await request.json()) as NowPaymentsIPNPayload;

    // Validate required fields
    if (!payload.payment_id || !payload.payment_status || !payload.order_id) {
      console.error("Invalid IPN payload: missing required fields", payload);
      return NextResponse.json(
        { error: "Invalid payload: missing required fields" },
        { status: 400 }
      );
    }

    // Get signature from header
    const signature = request.headers.get("x-nowpayments-sig");

    // Validate signature
    if (!validateIPNSignature(payload, signature)) {
      console.error(
        `Invalid IPN signature for payment_id: ${payload.payment_id}`
      );
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    console.log(
      `Received IPN for payment_id: ${payload.payment_id}, status: ${payload.payment_status}`
    );

    // Only process "finished" payments (completed deposits)
    if (payload.payment_status === "finished") {
      const result = await processDepositPayment(payload);

      if (result.success) {
        console.log(
          `Successfully processed deposit: ${result.message} (payment_id: ${payload.payment_id})`
        );
        return NextResponse.json({
          status: "ok",
          message: result.message,
        });
      } else {
        console.error(
          `Failed to process deposit: ${result.message} (payment_id: ${payload.payment_id})`
        );
        return NextResponse.json(
          {
            status: "error",
            error: result.message,
          },
          { status: 500 }
        );
      }
    } else {
      // Log other statuses but don't process them
      console.log(
        `IPN received with status "${payload.payment_status}" for payment_id: ${payload.payment_id}. No action taken.`
      );
      return NextResponse.json({
        status: "ok",
        message: `Payment status "${payload.payment_status}" received, no action required`,
      });
    }
  } catch (error: any) {
    console.error("Error processing IPN webhook:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing/health checks)
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "NOWPayments IPN endpoint is active",
  });
}

