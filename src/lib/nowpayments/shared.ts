// Shared constants, types, and utilities for NOWPayments

export const NOWPAYMENTS_BASE_URL =
  process.env.NOWPAYMENTS_BASE_URL ?? "https://api.nowpayments.io/v1";

export const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
export const NOWPAYMENTS_IPN_URL = process.env.NOWPAYMENTS_IPN_URL;
export const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
export const NOWPAYMENTS_MIN_PRICE_AMOUNT =
  process.env.NOWPAYMENTS_MIN_PRICE_AMOUNT ?? "1";
export const NOWPAYMENTS_PRICE_BUFFER_MULTIPLIER =
  process.env.NOWPAYMENTS_PRICE_BUFFER_MULTIPLIER ?? "1";
export const NOWPAYMENTS_PAYOUT_EMAIL = process.env.NOWPAYMENTS_PAYOUT_EMAIL;
export const NOWPAYMENTS_PAYOUT_PASSWORD =
  process.env.NOWPAYMENTS_PAYOUT_PASSWORD;
export const NOWPAYMENTS_PAYOUT_JWT_TTL_SECONDS = Number(
  process.env.NOWPAYMENTS_PAYOUT_JWT_TTL_SECONDS ?? "240"
);
export const NOWPAYMENTS_PAYOUT_JWT_MARGIN_SECONDS = Number(
  process.env.NOWPAYMENTS_PAYOUT_JWT_MARGIN_SECONDS ?? "30"
);

export interface NowPaymentsMinAmountResponse {
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

export interface NowPaymentsPaymentResponse {
  payment_id: number;
  pay_address: string;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  order_id: string;
  payment_status: string;
}

export interface NowPaymentsEstimateResponse {
  currency_from: string;
  amount_from: number;
  currency_to: string;
  estimated_amount: number;
}

export interface UpdateEstimateResponse {
  id: string;
  pay_amount: number;
  expiration_estimate_date?: string;
}

export interface NowPaymentsAuthResponse {
  token: string;
}

export interface NowPaymentsWithdrawalResponse {
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

export interface CreateDepositAddressParams {
  userId: string;
  amountUsd?: number;
}

export interface CreateDepositAddressResult {
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

export interface CreateWithdrawalParams {
  userId: string;
  amount: number;
  address: string;
  requestId?: string;
}

export async function fetchUsdtBscMinimums(): Promise<{
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

export async function estimateConversion(
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

export function ensureFiatPrecision(value: number): number {
  return Number(Number(value).toFixed(8));
}

