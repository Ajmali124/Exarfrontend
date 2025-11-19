import { caller } from "@/trpc/server";
import { columns, UserTransactionss } from "./columns";
import { DataTable } from "./data-table";

const WalletData = async () => {
  const transactions = (await caller.user.getTransactions()) ?? [];

  const formattedData: UserTransactionss[] = transactions.map((tx) => ({
    id: tx.id,
    type: (tx.type || "TRANSACTION").toUpperCase(),
    status: (tx.status || "PENDING").toUpperCase(),
    amount: tx.amount ?? 0,
    currency: tx.currency || "USDT",
    description: tx.description,
    transactionHash: tx.transactionHash,
    fromAddress: tx.fromAddress,
    toAddress: tx.toAddress,
    createdAt: (tx.createdAt ?? new Date()).toISOString(),
  }));

  const hasTransactions = formattedData.length > 0;

  return (
    <div className="bg-gradient-to-b from-white/5 to-transparent shadow-lg rounded-2xl border border-white/10 mx-2 mt-4 w-full px-4 py-4">
      <div className="flex flex-row justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Transactions</h2>
          <p className="text-xs text-gray-400">Latest activity across your wallet</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        {hasTransactions ? (
          <DataTable columns={columns} data={formattedData} />
        ) : (
          <div className="py-12 text-center text-sm text-gray-400">
            No transactions yet. Your activity will appear here once you start trading.
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletData;
