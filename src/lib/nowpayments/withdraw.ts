// Withdrawal-related functionality for NOWPayments

import {
  NOWPAYMENTS_BASE_URL,
  NOWPAYMENTS_API_KEY,
  NOWPAYMENTS_IPN_URL,
  NOWPAYMENTS_PAYOUT_EMAIL,
  NOWPAYMENTS_PAYOUT_PASSWORD,
  NOWPAYMENTS_PAYOUT_JWT_TTL_SECONDS,
  NOWPAYMENTS_PAYOUT_JWT_MARGIN_SECONDS,
  NowPaymentsError,
  NowPaymentsAuthResponse,
  NowPaymentsWithdrawalResponse,
  CreateWithdrawalParams,
  fetchUsdtBscMinimums,
} from "./shared";

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

