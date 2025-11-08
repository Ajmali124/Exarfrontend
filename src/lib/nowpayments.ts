const NOWPAYMENTS_BASE_URL =
  process.env.NOWPAYMENTS_BASE_URL ?? "https://api.nowpayments.io/v1";

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_IPN_URL = process.env.NOWPAYMENTS_IPN_URL;
const NOWPAYMENTS_MIN_PRICE_AMOUNT =
  process.env.NOWPAYMENTS_MIN_PRICE_AMOUNT ?? "1";
const NOWPAYMENTS_PRICE_BUFFER_MULTIPLIER =
  process.env.NOWPAYMENTS_PRICE_BUFFER_MULTIPLIER ?? "1";
const NOWPAYMENTS_PAYOUT_EMAIL = process.env.NOWPAYMENTS_PAYOUT_EMAIL;
const NOWPAYMENTS_PAYOUT_PASSWORD = process.env.NOWPAYMENTS_PAYOUT_PASSWORD;
const NOWPAYMENTS_PAYOUT_JWT_TTL_SECONDS = Number(
  process.env.NOWPAYMENTS_PAYOUT_JWT_TTL_SECONDS ?? "240"
);
const NOWPAYMENTS_PAYOUT_JWT_MARGIN_SECONDS = Number(
  process.env.NOWPAYMENTS_PAYOUT_JWT_MARGIN_SECONDS ?? "30"
);

interface NowPaymentsMinAmountResponse {
  currency_from?: string;
  currency_to: string;
  min_amount: string | number;
  fiat_min_amount?:
    | number
    | string
    | {
        amount?: number | string;
        currency?: string;
      };
}

interface NowPaymentsPaymentResponse {
  payment_id: number;
  pay_address: string;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  order_id: string;
  payment_status: string;
}

interface NowPaymentsEstimateResponse {
  currency_from: string;
  amount_from: number;
  currency_to: string;
  estimated_amount: number;
}

interface UpdateEstimateResponse {
  id: string;
  pay_amount: number;
  expiration_estimate_date?: string;
}

interface NowPaymentsAuthResponse {
  token: string;
}

interface NowPaymentsWithdrawalResponse {
  id: string;
  status: string;
  amount: string;
  currency: string;
  address: string;
  created_at?: string;
}

export class NowPaymentsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NowPaymentsError";
  }
}

interface CreateDepositAddressParams {
  userId: string;
  amountUsd?: number;
}

interface CreateDepositAddressResult {
  paymentId: number;
  orderId: string;
  address: string;
  payCurrency: string;
  payAmount?: number;
  minPayAmount?: {
    crypto?: number;
    fiat?: number;
  };
}

interface CreateWithdrawalParams {
  userId: string;
  amount: number;
  address: string;
  requestId?: string;
}

async function fetchUsdtBscMinimums(): Promise<{
  fiatAmount?: number;
  cryptoAmount?: number;
}> {
  if (!NOWPAYMENTS_API_KEY) {
    return {};
  }

  const url = new URL(`${NOWPAYMENTS_BASE_URL}/min-amount`);
  url.searchParams.set("currency_to", "usdtbsc");
  url.searchParams.set("currency_from", "usd");
  url.searchParams.set("is_fixed_rate", "false");
  url.searchParams.set("fiat_equivalent", "usd");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": NOWPAYMENTS_API_KEY,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {};
    }

    const payload =
      (await response.json()) as NowPaymentsMinAmountResponse | undefined;

    if (!payload) {
      return {};
    }

    const cryptoAmount = Number(payload.min_amount);

    let fiatAmount: number | undefined;
    const fiatField = payload.fiat_min_amount;

    if (typeof fiatField === "number") {
      fiatAmount = fiatField;
    } else if (typeof fiatField === "string") {
      fiatAmount = Number(fiatField);
    } else if (
      typeof fiatField === "object" &&
      fiatField !== null &&
      "amount" in fiatField &&
      fiatField.amount !== undefined
    ) {
      fiatAmount =
        typeof fiatField.amount === "number"
          ? fiatField.amount
          : Number(fiatField.amount);
    }

    return {
      cryptoAmount: Number.isFinite(cryptoAmount) ? cryptoAmount : undefined,
      fiatAmount: fiatAmount && Number.isFinite(fiatAmount) ? fiatAmount : undefined,
    };
  } catch (error) {
    console.error("Failed to fetch NOWPayments minimum amount:", error);
    return {};
  }
}

async function estimateConversion(
  params: Readonly<{
    amount: number;
    currencyFrom: string;
    currencyTo: string;
  }>
): Promise<number | undefined> {
  if (!NOWPAYMENTS_API_KEY) {
    return undefined;
  }

  if (!Number.isFinite(params.amount) || params.amount <= 0) {
    return undefined;
  }

  const url = new URL(`${NOWPAYMENTS_BASE_URL}/estimate`);
  url.searchParams.set("amount", params.amount.toFixed(8));
  url.searchParams.set("currency_from", params.currencyFrom);
  url.searchParams.set("currency_to", params.currencyTo);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": NOWPAYMENTS_API_KEY,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return undefined;
    }

    const payload =
      (await response.json()) as NowPaymentsEstimateResponse | undefined;

    if (!payload) {
      return undefined;
    }

    const estimatedAmount = Number(payload.estimated_amount);
    return Number.isFinite(estimatedAmount) ? estimatedAmount : undefined;
  } catch (error) {
    console.error("Failed to fetch NOWPayments estimate:", error);
    return undefined;
  }
}

function ensureFiatPrecision(value: number): number {
  return Number(Number(value).toFixed(8));
}

const jwtCache: { token: string; expiresAt: number } = {
  token: "",
  expiresAt: 0,
};

function isNowPaymentsAuthResponse(
  payload: unknown
): payload is NowPaymentsAuthResponse {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as { token?: unknown }).token === "string"
  );
}

async function getNowPaymentsJwt(): Promise<string> {
  if (!NOWPAYMENTS_PAYOUT_EMAIL || !NOWPAYMENTS_PAYOUT_PASSWORD) {
    throw new NowPaymentsError(
      "NOWPayments payout credentials are not configured. Please set NOWPAYMENTS_PAYOUT_EMAIL and NOWPAYMENTS_PAYOUT_PASSWORD."
    );
  }

  if (
    jwtCache.token &&
    Date.now() <
      jwtCache.expiresAt - NOWPAYMENTS_PAYOUT_JWT_MARGIN_SECONDS * 1000
  ) {
    return jwtCache.token;
  }

  const response = await fetch(`${NOWPAYMENTS_BASE_URL}/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: NOWPAYMENTS_PAYOUT_EMAIL,
      password: NOWPAYMENTS_PAYOUT_PASSWORD,
    }),
  });

  const payload = (await response.json()) as
    | NowPaymentsAuthResponse
    | { message?: string; error?: string };

  if (!response.ok) {
    const message =
      (payload as { message?: string; error?: string }).message ??
      (payload as { message?: string; error?: string }).error ??
      "Failed to authenticate with NOWPayments.";
    throw new NowPaymentsError(message);
  }

  if (!isNowPaymentsAuthResponse(payload)) {
    throw new NowPaymentsError(
      "NOWPayments authentication did not return a token."
    );
  }

  const ttl =
    Number.isFinite(NOWPAYMENTS_PAYOUT_JWT_TTL_SECONDS) &&
    NOWPAYMENTS_PAYOUT_JWT_TTL_SECONDS > 0
      ? NOWPAYMENTS_PAYOUT_JWT_TTL_SECONDS
      : 240;

  jwtCache.token = payload.token;
  jwtCache.expiresAt = Date.now() + ttl * 1000;

  return payload.token;
}

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

export async function createUsdtBscWithdrawal(
  params: CreateWithdrawalParams
): Promise<{
  withdrawalId: string;
  status: string;
  amount: number;
  currency: string;
  address: string;
}> {
  if (!NOWPAYMENTS_API_KEY) {
    throw new NowPaymentsError(
      "NOWPayments API key is not configured. Please add NOWPAYMENTS_API_KEY to your environment."
    );
  }

  const amount = Number(params.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new NowPaymentsError("Withdrawal amount must be a positive number.");
  }

  const address = params.address?.trim();
  if (!address) {
    throw new NowPaymentsError("Withdrawal address is required.");
  }

  const { cryptoAmount: minCryptoAmount } = await fetchUsdtBscMinimums();

  if (
    typeof minCryptoAmount === "number" &&
    amount + Number.EPSILON < minCryptoAmount
  ) {
    throw new NowPaymentsError(
      `NOWPayments requires a minimum withdrawal of ${minCryptoAmount.toFixed(
        6
      )} USDT on BNB Smart Chain.`
    );
  }

  const jwt = await getNowPaymentsJwt();

  const response = await fetch(`${NOWPAYMENTS_BASE_URL}/withdrawal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": NOWPAYMENTS_API_KEY,
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      amount,
      currency: "usdtbsc",
      address,
      auto_confirm: true,
      ipn_callback_url: NOWPAYMENTS_IPN_URL,
      request_id: params.requestId ?? `withdraw-${params.userId}-${Date.now()}`,
    }),
  });

  const payload = (await response.json()) as
    | NowPaymentsWithdrawalResponse
    | { message?: string; error?: string };

  if (!response.ok) {
    const message =
      (payload as { message?: string; error?: string }).message ??
      (payload as { message?: string; error?: string }).error ??
      "Failed to create NOWPayments withdrawal.";
    throw new NowPaymentsError(message);
  }

  const withdrawalPayload = payload as NowPaymentsWithdrawalResponse;

  if (!withdrawalPayload?.id) {
    throw new NowPaymentsError(
      "NOWPayments did not return a withdrawal identifier."
    );
  }

  return {
    withdrawalId: withdrawalPayload.id,
    status: withdrawalPayload.status ?? "pending",
    amount,
    currency: withdrawalPayload.currency ?? "usdtbsc",
    address: withdrawalPayload.address,
  };
}

export async function getUsdtBscMinimums() {
  return fetchUsdtBscMinimums();
}

