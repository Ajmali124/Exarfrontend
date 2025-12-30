import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import prisma from "@/lib/prismadb";
import {
  COINPAYMENTS_IPN_SECRET,
  COINPAYMENTS_MERCHANT_ID,
  COINPAYMENTS_DEPOSIT_CURRENCY,
  ensureFiatPrecision,
} from "@/lib/coinpayment";
import { notifyN8nWithdrawal } from "@/lib/notifications/n8n";

export const runtime = "nodejs";

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
  const ipnType = params.get("ipn_type"); // "deposit" or "withdrawal"
  const amountField =
    params.get("received_amount") ?? params.get("amount1") ?? params.get("amount");
  const currencyField =
    params.get("received_confirms") !== null
      ? params.get("currency1") ?? params.get("currency")
      : params.get("currency");
  const depositAddress = params.get("address");
  const withdrawalId = params.get("id"); // For withdrawals, this is the withdrawal ID

  if (!txnId && !withdrawalId) {
    return buildJsonResponse("Missing transaction id", 400);
  }

  // Determine transaction type
  const isWithdrawal = ipnType === "withdrawal" || withdrawalId || params.get("withdrawal_id");
  const isDeposit = !isWithdrawal && label;

  // Handle withdrawals
  if (isWithdrawal) {
    const withdrawalTxnId = withdrawalId ?? txnId;
    if (!withdrawalTxnId) {
      return buildJsonResponse("Missing withdrawal id", 400);
    }

    // Map CoinPayments status codes to our status
    let status: string;
    if (statusCode >= 100 || statusCode === 2) {
      status = "completed";
    } else if (statusCode === 3) {
      status = "failed";
    } else if (statusCode === 4) {
      status = "cancelled";
    } else {
      status = "pending";
    }

    try {
      // Find the withdrawal transaction by withdrawal ID
      const withdrawalTransaction = await prisma.transactionRecord.findFirst({
        where: {
          transactionHash: withdrawalTxnId,
          type: "withdrawal",
        },
        select: {
          id: true,
          userId: true,
          amount: true,
          status: true,
          currency: true,
          toAddress: true,
          description: true,
        },
      });

      if (!withdrawalTransaction) {
        // Withdrawal transaction not found - might be from another system or not yet created
        console.warn(
          `CoinPayments withdrawal IPN received for unknown transaction ${withdrawalTxnId}. Payload:`,
          Object.fromEntries(params.entries())
        );
        return buildJsonResponse("Withdrawal transaction not found", 200);
      }

      // Only update if status has changed
      if (withdrawalTransaction.status !== status) {
        await prisma.$transaction(async (tx) => {
          await tx.transactionRecord.update({
            where: { id: withdrawalTransaction.id },
            data: { status },
          });

          // If withdrawal failed or was cancelled, refund the full amount (including fee)
          if (status === "failed" || status === "cancelled") {
            // Find the fee transaction linked to this withdrawal
            const feeTransaction = await tx.transactionRecord.findFirst({
              where: {
                userId: withdrawalTransaction.userId,
                type: "withdrawal_fee",
                transactionHash: withdrawalTxnId, // Fee transaction has withdrawal ID in transactionHash
              },
            });

            // Calculate refund amount: amount sent + fee = total amount user originally had deducted
            // This ensures user gets back exactly what was deducted from their balance
            const refundAmount = feeTransaction
              ? withdrawalTransaction.amount + feeTransaction.amount
              : withdrawalTransaction.amount;

            await tx.userBalance.update({
              where: { userId: withdrawalTransaction.userId },
              data: {
                balance: {
                  increment: refundAmount,
                },
              },
            });

            // Mark fee transaction as refunded (if it exists)
            if (feeTransaction) {
              await tx.transactionRecord.update({
                where: { id: feeTransaction.id },
                data: {
                  status: "cancelled", // Mark fee as cancelled since withdrawal failed
                },
              });
            }

            // Create refund transaction record
            await tx.transactionRecord.create({
              data: {
                userId: withdrawalTransaction.userId,
                type: "refund",
                amount: refundAmount,
                currency: "USDT",
                status: "completed",
                description: `Refund for ${status} withdrawal (${withdrawalTransaction.amount.toFixed(2)} USDT + ${feeTransaction ? feeTransaction.amount.toFixed(2) : '0.00'} fee)`,
                transactionHash: withdrawalTxnId,
                fromAddress: null,
                toAddress: null,
              },
            });
          }
        });

        // Notify n8n if withdrawal is completed (fire-and-forget)
        if (status === "completed") {
          notifyN8nWithdrawal({
            withdrawalId: withdrawalTxnId,
            amount: withdrawalTransaction.amount,
            currency: withdrawalTransaction.currency || "USDT",
            status: status,
            userId: withdrawalTransaction.userId,
            toAddress: withdrawalTransaction.toAddress,
            description: withdrawalTransaction.description,
            transactionId: withdrawalTransaction.id,
          }).catch((err) => {
            console.error("Failed to notify n8n:", err);
          });
        }
      }

      return buildJsonResponse("Withdrawal status updated");
    } catch (error) {
      console.error("Failed to process CoinPayments withdrawal IPN:", error);
      return buildJsonResponse("Failed to process withdrawal IPN", 500);
    }
  }

  // Handle deposits (existing logic)
  if (isDeposit) {
    if (!label) {
      return buildJsonResponse("Missing label for deposit", 400);
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

  // Unknown IPN type
  return buildJsonResponse("Unknown IPN type", 200);
}


