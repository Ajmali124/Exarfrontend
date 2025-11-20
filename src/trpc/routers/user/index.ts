import { createTRPCRouter } from "../../init";
import { profileRouter } from "./profile";
import { walletRouter } from "./wallet";
import { teamRouter } from "./team";
import { stakingRouter } from "./staking";
import { depositRouter } from "./deposit";
import { withdrawRouter } from "./withdraw";
import { voucherRouter } from "./voucher";
import { promotionRouter } from "./promotion";

/**
 * Main user router
 * Combines all user-related sub-routers for better organization
 */
export const userRouter = createTRPCRouter({
  // Profile operations
  ...profileRouter,

  // Wallet operations
  ...walletRouter,

  // Team operations
  ...teamRouter,

  // Staking operations
  ...stakingRouter,

  // Deposit operations
  ...depositRouter,

  // Withdrawal operations
  ...withdrawRouter,

  // Voucher operations
  ...voucherRouter,

  // Promotion operations
  ...promotionRouter,
});

