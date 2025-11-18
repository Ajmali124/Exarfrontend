// Main entry point for NOWPayments - re-exports all functionality for backward compatibility
// For new code, consider importing directly from:
// - ./shared (types, constants, shared utilities)
// - ./deposit (deposit functionality)
// - ./withdraw (withdrawal functionality)

export {
  NowPaymentsError,
  fetchUsdtBscMinimums,
  estimateConversion,
  ensureFiatPrecision,
  type NowPaymentsMinAmountResponse,
  type NowPaymentsPaymentResponse,
  type NowPaymentsEstimateResponse,
  type UpdateEstimateResponse,
  type NowPaymentsAuthResponse,
  type NowPaymentsWithdrawalResponse,
  type CreateDepositAddressParams,
  type CreateDepositAddressResult,
  type CreateWithdrawalParams,
} from "./shared";

export { createUsdtBscDepositAddress } from "./deposit";
export { createUsdtBscWithdrawal } from "./withdraw";

export { fetchUsdtBscMinimums as getUsdtBscMinimums } from "./shared";

