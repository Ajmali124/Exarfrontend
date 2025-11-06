"use client";

import { useState } from "react";
import { Eye, EyeOff, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useThemeClasses } from "@/lib/theme-utils";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import TotalAssetsCardSkeleton from "./TotalAssetsCardSkeleton";

const TotalAssetsCard = () => {
  const [showBalance, setShowBalance] = useState(true);
  const { text, bg, border } = useThemeClasses();

  // Fetch wallet balance and daily earnings from tRPC (server-side, fast)
  const { data: walletData, isLoading } = trpc.user.getWalletBalance.useQuery();

  // Calculate values from fetched data
  const totalAssets = walletData?.balance || 0; // USDT balance
  const fiatEquivalent = totalAssets; // 1 USDT ≈ 1 USD (can be updated with real conversion rate)
  const todayPnL = walletData?.dailyEarning || 0; // Today's PnL = dailyEarning
  
  // Calculate percentage based on daily earning vs balance
  // If we have balance and daily earning, calculate percentage
  const todayPnLPercent = totalAssets > 0 && todayPnL !== 0
    ? (todayPnL / totalAssets) * 100
    : todayPnL > 0 ? 1.99 : 0; // Fallback percentage if we have earnings but no base balance

  const toggleBalance = () => {
    setShowBalance((prev) => !prev);
  };

  const formatBalance = (value: number) => {
    return value.toFixed(2);
  };

  const formatFiat = (value: number) => {
    if (value < 1) {
      return `< $1.00`;
    }
    return `$${value.toFixed(2)}`;
  };

  // Show skeleton while loading
  if (isLoading) {
    return <TotalAssetsCardSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full p-4 md:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left Section: Assets Info */}
        <div className="flex-1 space-y-1 md:space-y-1.5">
          {/* Total Assets Header */}
          <div className="flex items-center gap-2">
            <span className={`text-sm md:text-sm font-medium ${text.secondary}`}>
              Total Assets
            </span>
            <button
              onClick={toggleBalance}
              className={`${text.secondary} hover:${text.primary} transition-colors focus:outline-none`}
              aria-label="Toggle balance visibility"
            >
              {showBalance ? (
                <Eye className="h-4 w-4 md:h-4 md:w-4" />
              ) : (
                <EyeOff className="h-4 w-4 md:h-4 md:w-4" />
              )}
            </button>
          </div>

          {/* Main Balance */}
          <div className="space-y-0">
            <div className="flex items-baseline gap-1.5 md:gap-2">
              <span className={`text-2xl md:text-3xl lg:text-4xl font-bold ${text.primary}`}>
                {showBalance ? formatBalance(totalAssets) : "****"}
              </span>
              <span className={`text-base md:text-base lg:text-lg font-medium ${text.secondary}`}>
                USDT
              </span>
            </div>
            <p className={`text-sm md:text-sm ${text.muted}`}>
              {showBalance ? formatFiat(fiatEquivalent) : "****"}
            </p>
          </div>

          {/* Today's PnL */}
          <Link href="/wallet" className="inline-flex items-center gap-1 group">
            <span className={`text-sm md:text-sm ${text.secondary} border-b border-dotted ${border.primary}`}>
              Today's PnL
            </span>
            <span
              className={`text-sm md:text-sm font-medium ${
                todayPnL >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {showBalance ? `$${formatBalance(Math.abs(todayPnL))}` : "****"}
              {showBalance && `(${todayPnL >= 0 ? "+" : ""}${formatBalance(todayPnLPercent)}%)`}
            </span>
            <ChevronRight className="h-4 w-4 md:h-4 md:w-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
          </Link>
        </div>

        {/* Right Section: Deposit Button */}
        <div className="ml-2 flex-shrink-0">
          <Link href="/deposit">
            <Button
              className="bg-gradient-to-r from-green-500 to-teal-500 dark:from-purple-500 dark:to-purple-600 hover:from-green-600 hover:to-teal-600 dark:hover:from-purple-600 dark:hover:to-purple-700 text-white px-4 md:px-6 py-3 md:py-4 rounded-xl font-medium text-sm md:text-sm shadow-lg hover:shadow-xl transition-all"
            >
              Deposit
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default TotalAssetsCard;

