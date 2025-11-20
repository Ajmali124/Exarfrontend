import { createTRPCRouter } from "../init";
import { userRouter } from "./user";
import { adminVoucherRouter } from "./admin/voucher";

export const appRouter = createTRPCRouter({
  user: userRouter,
  admin: {
    voucher: adminVoucherRouter,
  },
});
// export type definition of API
export type AppRouter = typeof appRouter;
