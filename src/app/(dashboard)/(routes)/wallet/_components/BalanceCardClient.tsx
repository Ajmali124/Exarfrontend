"use client";

import { useState } from "react";
import { Eye, EyeOff, TrendingUp, Clock } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

type WalletBalance =
  inferRouterOutputs<AppRouter>["user"]["getWalletBalance"];

interface BalanceCardClientProps {
  initialData: WalletBalance;
}

const BalanceCardClient = ({ initialData }: BalanceCardClientProps) => {
  const [balanceVisible, setBalanceVisible] = useState(true);

  const balance = initialData?.balance ?? 0;
  const dailyEarning = initialData?.dailyEarning ?? 0;
  const latestEarning = initialData?.latestEarning ?? 0;

  return (
    <div className="w-full px-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Assets
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Wallet balance sourced via tRPC
            </p>
          </div>
          <button
            type="button"
            onClick={() => setBalanceVisible((prev) => !prev)}
            className="rounded-md border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {balanceVisible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="mb-6">
          <div className="text-4xl font-semibold text-gray-900 dark:text-gray-100">
            {balanceVisible ? `${balance.toFixed(2)} USDT` : "••••••"}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-900/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Daily earnings
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {dailyEarning.toFixed(2)} USDT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-900/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Latest earning
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {latestEarning.toFixed(2)} USDT
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCardClient;

