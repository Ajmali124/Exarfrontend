import { caller } from "@/trpc/server";
import BalanceCardClient from "./BalanceCardClient";

const BalanceCard = async () => {
  try {
    const data = await caller.user.getWalletBalance();
    return <BalanceCardClient initialData={data} />;
      } catch (error) {
  return (
    <div className="w-full px-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200">
          Failed to load wallet balance.
      </div>
    </div>
  );
  }
};

export default BalanceCard;
