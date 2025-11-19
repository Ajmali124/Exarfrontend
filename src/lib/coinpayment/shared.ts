import { createHmac, randomUUID } from "node:crypto";

const DEFAULT_API_URL = "https://www.coinpayments.net/api.php";
const DEFAULT_DEPOSIT_LABEL_PREFIX = "cp-deposit";
const DEFAULT_DEPOSIT_CURRENCY = "USDT.BEP20";
const DEFAULT_FIAT_CURRENCY = "USD";

export const COINPAYMENTS_API_URL =
  process.env.COINPAYMENTS_API_URL ?? DEFAULT_API_URL;
export const COINPAYMENTS_API_KEY = process.env.COINPAYMENTS_API_KEY;
export const COINPAYMENTS_API_SECRET = process.env.COINPAYMENTS_API_SECRET;
export const COINPAYMENTS_MERCHANT_ID = process.env.COINPAYMENTS_MERCHANT_ID;
export const COINPAYMENTS_IPN_SECRET = process.env.COINPAYMENTS_IPN_SECRET;
export const COINPAYMENTS_IPN_URL = process.env.COINPAYMENTS_IPN_URL;
export const COINPAYMENTS_DEBUG_EMAIL = process.env.COINPAYMENTS_DEBUG_EMAIL;
export const COINPAYMENTS_DEPOSIT_LABEL_PREFIX =
  process.env.COINPAYMENTS_DEPOSIT_LABEL_PREFIX ??
  DEFAULT_DEPOSIT_LABEL_PREFIX;
export const COINPAYMENTS_DEPOSIT_CURRENCY =
  process.env.COINPAYMENTS_DEPOSIT_CURRENCY ?? DEFAULT_DEPOSIT_CURRENCY;
export const COINPAYMENTS_FIAT_CURRENCY =
  process.env.COINPAYMENTS_FIAT_CURRENCY ?? DEFAULT_FIAT_CURRENCY;

const MIN_CRYPTO = Number(
  process.env.COINPAYMENTS_MIN_CRYPTO_AMOUNT ?? "0.8"
);
const MIN_FIAT = Number(process.env.COINPAYMENTS_MIN_FIAT_AMOUNT ?? "1");

export interface CoinpaymentsResponse<T> {
  error?: string;
  result?: T;
}

export interface CoinpaymentsCallbackAddressResponse {
  address: string;
  dest_tag?: string | null;
  status?: number;
  label?: string;
}

export interface CoinpaymentsWithdrawalResponse {
  id: string;
  amount: string;
  status: number;
  status_text?: string;
  coin?: string;
  to_address?: string;
  send_address?: string;
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

export class CoinpaymentsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CoinpaymentsError";
  }
}

function ensureCredentials() {
  if (!COINPAYMENTS_API_KEY || !COINPAYMENTS_API_SECRET) {
    throw new CoinpaymentsError(
      "CoinPayments API credentials are not configured. Please set COINPAYMENTS_API_KEY and COINPAYMENTS_API_SECRET."
    );
  }
}

function toStringValue(value: string | number | boolean): string {
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  return String(value);
}

export async function coinpaymentsRequest<T>(
  cmd: string,
  params?: Record<string, string | number | boolean | undefined | null>
): Promise<T> {
  ensureCredentials();

  const bodyParams = new URLSearchParams();
  bodyParams.set("version", "1");
  bodyParams.set("cmd", cmd);
  bodyParams.set("key", COINPAYMENTS_API_KEY!);
  bodyParams.set("format", "json");

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        continue;
      }

      bodyParams.set(key, toStringValue(value));
    }
  }

  const bodyString = bodyParams.toString();
  const hmac = createHmac("sha512", COINPAYMENTS_API_SECRET!)
    .update(bodyString)
    .digest("hex");

  const response = await fetch(COINPAYMENTS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      HMAC: hmac,
    },
    body: bodyString,
    cache: "no-store",
  });

  let payload: CoinpaymentsResponse<T>;
  try {
    payload = (await response.json()) as CoinpaymentsResponse<T>;
  } catch (error) {
    throw new CoinpaymentsError(
      `CoinPayments responded with invalid JSON: ${(error as Error).message}`
    );
  }

  const errorMessage =
    payload?.error && payload.error.toLowerCase() !== "ok"
      ? payload.error
      : undefined;

  if (!response.ok || errorMessage) {
    throw new CoinpaymentsError(
      errorMessage ??
        `CoinPayments request failed with status ${response.status}.`
    );
  }

  if (!payload.result) {
    throw new CoinpaymentsError("CoinPayments did not return a result.");
  }

  return payload.result;
}

export async function fetchUsdtBscMinimums(): Promise<{
  cryptoAmount?: number;
  fiatAmount?: number;
}> {
  const cryptoAmount = Number.isFinite(MIN_CRYPTO) && MIN_CRYPTO > 0 ? MIN_CRYPTO : undefined;
  const fiatAmount = Number.isFinite(MIN_FIAT) && MIN_FIAT > 0 ? MIN_FIAT : undefined;

  return {
    cryptoAmount,
    fiatAmount,
  };
}

export function ensureFiatPrecision(value: number): number {
  return Number(Number(value).toFixed(8));
}

export function createSyntheticPaymentId(): number {
  const token = randomUUID().replace(/-/g, "").slice(0, 12);
  const parsed = Number.parseInt(token, 16);
  return Number.isFinite(parsed) ? parsed : Date.now();
}


