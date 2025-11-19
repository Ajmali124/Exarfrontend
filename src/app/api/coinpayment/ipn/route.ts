import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import prisma from "@/lib/prismadb";
import {
  COINPAYMENTS_IPN_SECRET,
  COINPAYMENTS_MERCHANT_ID,
  COINPAYMENTS_DEPOSIT_CURRENCY,
  ensureFiatPrecision,
} from "@/lib/coinpayment";

function buildJsonResponse(
  message: string,
  status: number = 200
): NextResponse {
  return NextResponse.json({ success: status < 400, message }, { status });
}

function isCompletedStatus(status?: number): boolean {
  if (typeof status !== "number" || Number.isNaN(status)) {
    return false;
  }

  return status >= 100 || status === 2;
}

export async function POST(request: Request) {
  if (!COINPAYMENTS_IPN_SECRET) {
    console.error("CoinPayments IPN secret is not configured.");
    return buildJsonResponse("CoinPayments IPN secret missing", 500);
  }

  const hmacHeader = request.headers.get("HMAC");
  if (!hmacHeader) {
    return buildJsonResponse("Missing CoinPayments HMAC header", 400);
  }

  const rawBody = await request.text();
  const params = new URLSearchParams(rawBody);

  if (params.get("ipn_mode") !== "hmac") {
    return buildJsonResponse("Invalid IPN mode", 400);
  }

  if (
    COINPAYMENTS_MERCHANT_ID &&
    params.get("merchant") !== COINPAYMENTS_MERCHANT_ID
  ) {
    return buildJsonResponse("Merchant mismatch", 400);
  }

  const expectedHmac = createHmac("sha512", COINPAYMENTS_IPN_SECRET)
    .update(rawBody)
    .digest("hex");

  const signatureValid =
    hmacHeader.length === expectedHmac.length &&
    timingSafeEqual(
      Buffer.from(hmacHeader, "hex"),
      Buffer.from(expectedHmac, "hex")
    );

  if (!signatureValid) {
    return buildJsonResponse("Invalid HMAC signature", 400);
  }

  const label = params.get("label");
  const txnId = params.get("txn_id") ?? params.get("id");
  const statusCode = Number(params.get("status"));
  const amountField =
    params.get("received_amount") ?? params.get("amount1") ?? params.get("amount");
  const currencyField =
    params.get("received_confirms") !== null
      ? params.get("currency1") ?? params.get("currency")
      : params.get("currency");
  const depositAddress = params.get("address");

  if (!label || !txnId) {
    return buildJsonResponse("Missing label or transaction id", 400);
  }

  if (!isCompletedStatus(statusCode)) {
    return buildJsonResponse("IPN received but payment not completed yet");
  }

  const amount = Number(amountField);
  if (!Number.isFinite(amount) || amount <= 0) {
    return buildJsonResponse("Invalid deposit amount", 400);
  }

  if (
    currencyField &&
    COINPAYMENTS_DEPOSIT_CURRENCY &&
    currencyField.toLowerCase() !== COINPAYMENTS_DEPOSIT_CURRENCY.toLowerCase()
  ) {
    console.warn(
      `CoinPayments IPN currency mismatch. Expected ${COINPAYMENTS_DEPOSIT_CURRENCY}, received ${currencyField}.`
    );
    return buildJsonResponse("Currency mismatch", 400);
  }

  try {
    const depositRecord = await prisma.coinpaymentsDepositAddress.findUnique({
      where: { label },
      select: {
        userId: true,
        address: true,
      },
    });

    if (!depositRecord) {
      console.error(
        `CoinPayments IPN received for unknown label ${label}. Payload:`,
        Object.fromEntries(params.entries())
      );
      return buildJsonResponse("Unknown deposit label", 200);
    }

    const amountToCredit = ensureFiatPrecision(amount);

    await prisma.$transaction(async (tx) => {
      const existingTransaction = await tx.transactionRecord.findFirst({
        where: {
          transactionHash: txnId,
          type: "deposit",
        },
      });

      if (existingTransaction) {
        return;
      }

      await tx.userBalance.upsert({
        where: { userId: depositRecord.userId },
        update: {
          balance: {
            increment: amountToCredit,
          },
        },
        create: {
          userId: depositRecord.userId,
          balance: amountToCredit,
        },
      });

      await tx.transactionRecord.create({
        data: {
          userId: depositRecord.userId,
          type: "deposit",
          amount: amountToCredit,
          currency: "USDT",
          status: "completed",
          description: `CoinPayments deposit`,
          transactionHash: txnId,
          fromAddress: params.get("send_txid") ?? null,
          toAddress: depositAddress ?? depositRecord.address,
        },
      });
    });

    return buildJsonResponse("Deposit processed");
  } catch (error) {
    console.error("Failed to process CoinPayments IPN:", error);
    return buildJsonResponse("Failed to process IPN", 500);
  }
}


