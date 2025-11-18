// Deposit-related functionality for NOWPayments

import {
  NOWPAYMENTS_BASE_URL,
  NOWPAYMENTS_API_KEY,
  NOWPAYMENTS_IPN_URL,
  NOWPAYMENTS_MIN_PRICE_AMOUNT,
  NOWPAYMENTS_PRICE_BUFFER_MULTIPLIER,
  NowPaymentsError,
  NowPaymentsPaymentResponse,
  UpdateEstimateResponse,
  CreateDepositAddressParams,
  CreateDepositAddressResult,
  fetchUsdtBscMinimums,
  estimateConversion,
} from "./shared";

async function updateMerchantEstimate(
  paymentId: number
): Promise<UpdateEstimateResponse | undefined> {
  if (!NOWPAYMENTS_API_KEY || !paymentId) {
    return undefined;
  }

  try {
    const response = await fetch(
      `${NOWPAYMENTS_BASE_URL}/payment/${paymentId}/update-merchant-estimate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": NOWPAYMENTS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      return undefined;
    }

    const payload =
      (await response.json()) as UpdateEstimateResponse | undefined;

    if (!payload || typeof payload.pay_amount !== "number") {
      return undefined;
    }

    return payload;
  } catch (error) {
    console.error(
      `Failed to update NOWPayments merchant estimate for ${paymentId}:`,
      error
    );
    return undefined;
  }
}

export async function createUsdtBscDepositAddress(
  params: CreateDepositAddressParams
): Promise<CreateDepositAddressResult> {
  if (!NOWPAYMENTS_API_KEY) {
    throw new NowPaymentsError(
      "NOWPayments API key is not configured. Please add NOWPAYMENTS_API_KEY to your environment."
    );
  }

  const orderId = `deposit-${params.userId}-${Date.now()}`;
  const configuredPriceAmount =
    typeof params.amountUsd === "number"
      ? params.amountUsd
      : Number(NOWPAYMENTS_MIN_PRICE_AMOUNT);

  if (!Number.isFinite(configuredPriceAmount) || configuredPriceAmount <= 0) {
    throw new NowPaymentsError(
      "NOWPayments minimum price amount is invalid. Please configure NOWPAYMENTS_MIN_PRICE_AMOUNT as a positive number."
    );
  }

  const { fiatAmount: minFiatAmount, cryptoAmount: minCryptoAmount } =
    await fetchUsdtBscMinimums();

  const priceBufferMultiplier = Number(NOWPAYMENTS_PRICE_BUFFER_MULTIPLIER);
  const effectiveMultiplier =
    Number.isFinite(priceBufferMultiplier) && priceBufferMultiplier > 1
      ? priceBufferMultiplier
      : 1.02;

  const baselinePriceAmount = Math.max(
    configuredPriceAmount,
    minFiatAmount ?? configuredPriceAmount
  );

  let adjustedPriceAmount = Number(
    (baselinePriceAmount * effectiveMultiplier).toFixed(2)
  );

  if (minCryptoAmount && minCryptoAmount > 0) {
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const estimatedPayAmount = await estimateConversion({
        amount: adjustedPriceAmount,
        currencyFrom: "usd",
        currencyTo: "usdtbsc",
      });

      if (
        typeof estimatedPayAmount === "number" &&
        estimatedPayAmount >= minCryptoAmount
      ) {
        break;
      }

      const fiatForMinCrypto = await estimateConversion({
        amount: minCryptoAmount,
        currencyFrom: "usdtbsc",
        currencyTo: "usd",
      });

      if (fiatForMinCrypto && fiatForMinCrypto > 0) {
        adjustedPriceAmount = Number(
          (
            Math.max(fiatForMinCrypto, adjustedPriceAmount) *
            effectiveMultiplier
          ).toFixed(2)
        );
      } else if (
        typeof estimatedPayAmount === "number" &&
        estimatedPayAmount > 0
      ) {
        const ratio =
          (minCryptoAmount / estimatedPayAmount) * effectiveMultiplier;
        if (Number.isFinite(ratio) && ratio > 1) {
          adjustedPriceAmount = Number(
            (adjustedPriceAmount * ratio).toFixed(2)
          );
        } else {
          adjustedPriceAmount = Number(
            (adjustedPriceAmount * effectiveMultiplier * 1.1).toFixed(2)
          );
        }
      } else {
        adjustedPriceAmount = Number(
          (adjustedPriceAmount * effectiveMultiplier * 1.1).toFixed(2)
        );
      }

      attempts += 1;
    }
  }

  const response = await fetch(`${NOWPAYMENTS_BASE_URL}/payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": NOWPAYMENTS_API_KEY,
    },
    body: JSON.stringify({
      price_amount: adjustedPriceAmount,
      price_currency: "usd",
      pay_currency: "usdtbsc",
      order_id: orderId,
      order_description: `Deposit for user ${params.userId}`,
      ipn_callback_url: NOWPAYMENTS_IPN_URL,
    }),
  });

  const payload = (await response.json()) as
    | NowPaymentsPaymentResponse
    | { message?: string; error?: string };

  if (!response.ok) {
    const message =
      (payload as { message?: string; error?: string }).message ??
      (payload as { message?: string; error?: string }).error ??
      "Unknown error while creating NOWPayments payment";
    throw new NowPaymentsError(message);
  }

  const paymentPayload = payload as NowPaymentsPaymentResponse;

  if (!paymentPayload?.pay_address) {
    throw new NowPaymentsError(
      "NOWPayments did not return a deposit address. Please try again."
    );
  }

  const updatedEstimate = await updateMerchantEstimate(
    paymentPayload.payment_id
  );

  if (
    updatedEstimate?.pay_amount !== undefined &&
    minCryptoAmount !== undefined &&
    updatedEstimate.pay_amount < minCryptoAmount
  ) {
    throw new NowPaymentsError(
      "Unable to generate a compliant deposit amount from NOWPayments. Please try again in a moment."
    );
  }

  return {
    address: paymentPayload.pay_address,
    paymentId: paymentPayload.payment_id,
    orderId: paymentPayload.order_id,
    payCurrency: paymentPayload.pay_currency,
    payAmount: updatedEstimate?.pay_amount,
    minPayAmount: {
      crypto: minCryptoAmount,
      fiat: minFiatAmount,
    },
  };
}

