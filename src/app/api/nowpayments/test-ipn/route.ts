import { NextRequest, NextResponse } from "next/server";
import { createTestIPNPayload } from "@/lib/nowpayments/test-ipn";
import prisma from "@/lib/prismadb";

/**
 * Test endpoint to simulate IPN webhook without real payment
 * 
 * Usage:
 * POST /api/nowpayments/test-ipn
 * Body: { userId: "user-id-here", amount?: 50.0 }
 * 
 * This creates a test webhook payload and sends it to the IPN endpoint
 */
export async function POST(request: NextRequest) {
  // Only allow in development or with authentication
  if (process.env.NODE_ENV === "production") {
    const authHeader = request.headers.get("Authorization");
    const testSecret = process.env.TEST_IPN_SECRET || "test-secret-change-in-production";

    if (authHeader !== `Bearer ${testSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  try {
    const body = await request.json();
    const { userId, amount } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create test payload
    const { payload, signature } = createTestIPNPayload({
      userId,
      amount: amount ?? 50.0,
    });

    // Forward to actual IPN endpoint
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const ipnResponse = await fetch(`${baseUrl}/api/nowpayments/ipn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-nowpayments-sig": signature,
      },
      body: JSON.stringify(payload),
    });

    const ipnResult = await ipnResponse.json();

    return NextResponse.json({
      success: ipnResponse.ok,
      testPayload: payload,
      ipnResponse: {
        status: ipnResponse.status,
        statusText: ipnResponse.statusText,
        body: ipnResult,
      },
      message: ipnResponse.ok
        ? "Test IPN processed successfully"
        : "Test IPN failed",
    });
  } catch (error: any) {
    console.error("Error in test IPN endpoint:", error);
    return NextResponse.json(
      {
        error: error?.message || "Failed to process test IPN",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to show usage
export async function GET() {
  return NextResponse.json({
    message: "Test IPN Endpoint",
    usage: {
      method: "POST",
      url: "/api/nowpayments/test-ipn",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.NODE_ENV === "production" && {
          Authorization: "Bearer <TEST_IPN_SECRET>",
        }),
      },
      body: {
        userId: "your-user-id",
        amount: 50.0, // optional, defaults to 50.0
      },
    },
    note: "This endpoint simulates a webhook from NOWPayments for testing purposes",
  });
}

