import {
  coinpaymentsRequest,
  CoinpaymentsError,
  CoinpaymentsWithdrawalResponse,
  CreateWithdrawalParams,
  fetchUsdtBscMinimums,
  COINPAYMENTS_DEPOSIT_CURRENCY,
  COINPAYMENTS_IPN_URL,
} from "./shared";

const STATUS_MAP: Record<number, string> = {
  0: "pending",
  1: "pending",
  2: "completed",
  3: "failed",
  4: "cancelled",
};

function resolveStatus(statusCode?: number, statusText?: string): string {
  return STATUS_MAP[statusCode ?? -1] ?? statusText?.toLowerCase() ?? "pending";
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
  const amount = Number(params.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new CoinpaymentsError(
      "Withdrawal amount must be a positive number."
    );
  }

  const address = params.address?.trim();
  if (!address) {
    throw new CoinpaymentsError("Withdrawal address is required.");
  }

  const { cryptoAmount: minCryptoAmount } = await fetchUsdtBscMinimums();

  if (
    typeof minCryptoAmount === "number" &&
    minCryptoAmount > 0 &&
    amount + Number.EPSILON < minCryptoAmount
  ) {
    throw new CoinpaymentsError(
      `Minimum withdrawal is ${minCryptoAmount} USDT on BNB Smart Chain.`
    );
  }

  const response =
    await coinpaymentsRequest<CoinpaymentsWithdrawalResponse>(
      "create_withdrawal",
      {
        currency: COINPAYMENTS_DEPOSIT_CURRENCY,
        amount: amount.toFixed(8),
        address,
        auto_confirm: true,
        add_tx_fee: false,
        ipn_url: COINPAYMENTS_IPN_URL,
        note: params.requestId ?? `withdraw-${params.userId}`,
      }
    );

  if (!response?.id) {
    throw new CoinpaymentsError(
      "CoinPayments did not return a withdrawal identifier."
    );
  }

  return {
    withdrawalId: response.id,
    status: resolveStatus(response.status, response.status_text),
    amount,
    currency: response.coin?.toLowerCase() ?? COINPAYMENTS_DEPOSIT_CURRENCY,
    address: response.to_address ?? response.send_address ?? address,
  };
}


