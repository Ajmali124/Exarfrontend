import {
  coinpaymentsRequest,
  CoinpaymentsCallbackAddressResponse,
  CoinpaymentsError,
  createSyntheticPaymentId,
  CreateDepositAddressParams,
  CreateDepositAddressResult,
  COINPAYMENTS_DEPOSIT_CURRENCY,
  COINPAYMENTS_DEPOSIT_LABEL_PREFIX,
  COINPAYMENTS_IPN_URL,
  fetchUsdtBscMinimums,
} from "./shared";

const USDT_BEP20_INTERNAL_CODE = "usdtbep20";

export async function createUsdtBscDepositAddress(
  params: CreateDepositAddressParams
): Promise<CreateDepositAddressResult> {
  const label = `${COINPAYMENTS_DEPOSIT_LABEL_PREFIX}-${params.userId}`;

  const result = await coinpaymentsRequest<CoinpaymentsCallbackAddressResponse>(
    "get_callback_address",
    {
      currency: COINPAYMENTS_DEPOSIT_CURRENCY,
      ipn_url: COINPAYMENTS_IPN_URL,
      label,
    }
  );

  if (!result?.address) {
    throw new CoinpaymentsError(
      "CoinPayments did not return a deposit address. Please try again."
    );
  }

  const minimums = await fetchUsdtBscMinimums();

  return {
    address: result.address,
    orderId: label,
    paymentId: createSyntheticPaymentId(),
    payCurrency: USDT_BEP20_INTERNAL_CODE,
    payAmount: undefined,
    minPayAmount:
      minimums.cryptoAmount || minimums.fiatAmount
        ? {
            crypto: minimums.cryptoAmount,
            fiat: minimums.fiatAmount,
          }
        : undefined,
  };
}


