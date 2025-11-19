"use client";

import React, { useState, useMemo } from "react";
import { useCCXT } from "@/hooks/useCCXT";
import { motion } from "framer-motion";
import { useThemeClasses } from "@/lib/theme-utils";

interface OrderbookProps {
  selectedCrypto: string;
}

const Orderbook = ({ selectedCrypto }: OrderbookProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { card, text, border } = useThemeClasses();

  // Use WebSocket hook to get real-time data
  const { data: tickerData, status, exchanges } = useCCXT(selectedCrypto);

  // Determine decimal places based on cryptocurrency
  const getDecimals = (symbol: string): number => {
    if (symbol.includes("BTC")) return 0; // BTC: no decimals
    if (symbol.includes("ETH")) return 1; // ETH: 1 decimal
    if (symbol.includes("SOL") || symbol.includes("BNB") || symbol.includes("LINK") || symbol.includes("DOT")) return 2; // SOL, BNB, LINK, DOT: 2 decimals
    if (symbol.includes("XRP") || symbol.includes("ADA")) return 4; // XRP, ADA: 4 decimals
    if (symbol.includes("DOGE") || symbol.includes("TRX")) return 5; // DOGE, TRX: 5 decimals
    return 2; // default
  };

  // Format number based on cryptocurrency
  const formatNumber = (num: number | undefined): string => {
    if (!num || num === 0) return "--";
    
    const decimals = getDecimals(selectedCrypto);
    
    // For very small numbers (< 0.01), always use at least 6 decimals
    if (num < 0.01) {
      return num.toFixed(6);
    }
    
    return num.toFixed(decimals);
  };

  // Sort buy exchanges by lowest bid price (best for sellers looking to sell)
  const sortedBids = useMemo(() => {
    const data = exchanges
      .map((ex) => ({
        name: ex,
        bid: tickerData[ex]?.bid,
        bidSize: tickerData[ex]?.bidSize,
      }))
      .filter((ex) => ex.bid)
      .sort((a, b) => (a.bid || 0) - (b.bid || 0)) // Lowest first
      .slice(0, 5); // Top 5
    return data;
  }, [tickerData, exchanges]);

  // Sort sell exchanges by highest ask price (best for buyers looking to buy)
  const sortedAsks = useMemo(() => {
    const data = exchanges
      .map((ex) => ({
        name: ex,
        ask: tickerData[ex]?.ask,
        askSize: tickerData[ex]?.askSize,
      }))
      .filter((ex) => ex.ask)
      .sort((a, b) => (b.ask || 0) - (a.ask || 0)) // Highest first
      .slice(0, 5); // Top 5
    return data;
  }, [tickerData, exchanges]);

  // Calculate max sizes for bar normalization
  const maxBidSize = useMemo(() => {
    return Math.max(...sortedBids.map((ex) => ex.bidSize || 0));
  }, [sortedBids]);

  const maxAskSize = useMemo(() => {
    return Math.max(...sortedAsks.map((ex) => ex.askSize || 0));
  }, [sortedAsks]);

  const BuyOrderRow = ({
    exchange,
    bid,
    bidSize,
    index,
  }: {
    exchange: string;
    bid?: number;
    bidSize?: number;
    index?: number;
  }) => {
    // Progressive width: top row (index 0) gets highest width, bottom gets lowest
    // Use exchange name to create consistent pseudo-random value
    const randomWidth = React.useMemo(() => {
      // Create a hash from exchange name for consistent random value
      let hash = 0;
      for (let i = 0; i < exchange.length; i++) {
        hash = ((hash << 5) - hash) + exchange.charCodeAt(i);
        hash = hash & hash;
      }
      
      // Row 0: 70-80%, Row 1: 55-65%, Row 2: 40-50%, Row 3: 25-35%, Row 4: 20-25%
      const maxWidth = 80 - (index || 0) * 15;
      const minWidth = 70 - (index || 0) * 15;
      const base = Math.min(minWidth, maxWidth);
      const random = Math.abs(hash % 10);
      return Math.max(20, base - random); // Minimum 20%
    }, [exchange, index]);

    return (
      <div className="flex items-center py-2 px-3 text-sm transition-colors relative hover:bg-purple-50 dark:hover:bg-white/5">
        {/* Exchange Logo */}
        <div className="flex items-center gap-2 flex-1 min-w-[100px] relative">
          {/* Animated green bar - stable width */}
          {/* <motion.div
            className="absolute right-0 top-0 bottom-0 bg-green-500/20 z-0"
            initial={{ width: 0 }}
            animate={{ width: `${randomWidth}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          /> */}
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={`/exchange-logos/${exchange}.png`}
                alt={exchange}
                className="w-full h-full object-cover"
              />
            </div>
            <span className={`${text.primary} text-xs font-medium capitalize`}>
              {exchange}
            </span>
          </div>
        </div>

        {/* Size */}
        <div className={`${text.primary} text-xs min-w-[80px] text-center`}>
          {bidSize ? bidSize.toFixed(4) : "--"}
        </div>

        {/* Bid */}
        <div className="text-green-600 dark:text-green-300 text-xs font-medium min-w-[100px] text-right">
          {formatNumber(bid)}
        </div>
      </div>
    );
  };

  const SellOrderRow = ({
    exchange,
    ask,
    askSize,
    index,
  }: {
    exchange: string;
    ask?: number;
    askSize?: number;
    index?: number;
  }) => {
    // Progressive width: top row (index 0) gets highest width, bottom gets lowest
    // Use exchange name to create consistent pseudo-random value
    const randomWidth = React.useMemo(() => {
      // Create a hash from exchange name for consistent random value
      let hash = 0;
      for (let i = 0; i < exchange.length; i++) {
        hash = ((hash << 5) - hash) + exchange.charCodeAt(i);
        hash = hash & hash;
      }
      
      // Row 0: 70-80%, Row 1: 55-65%, Row 2: 40-50%, Row 3: 25-35%, Row 4: 20-25%
      const maxWidth = 80 - (index || 0) * 15;
      const minWidth = 70 - (index || 0) * 15;
      const base = Math.min(minWidth, maxWidth);
      const random = Math.abs(hash % 10);
      return Math.max(20, base - random); // Minimum 20%
    }, [exchange, index]);

    return (
      <div className="flex items-center py-2 px-3 text-sm transition-colors relative hover:bg-purple-50 dark:hover:bg-white/5">
        {/* Exchange Logo */}
        <div className="flex items-center gap-2 flex-1 min-w-[100px] relative">
          {/* Animated red bar - stable width */}
          {/* <motion.div
            className="absolute right-0 top-0 bottom-0 bg-red-500/20 z-0"
            initial={{ width: 0 }}
            animate={{ width: `${randomWidth}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          /> */}
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={`/exchange-logos/${exchange}.png`}
                alt={exchange}
                className="w-full h-full object-cover"
              />
            </div>
            <span className={`${text.primary} text-xs font-medium capitalize`}>
              {exchange}
            </span>
          </div>
        </div>

        {/* Size */}
        <div className={`${text.primary} text-xs min-w-[80px] text-center`}>
          {askSize ? askSize.toFixed(4) : "--"}
        </div>

        {/* Ask */}
        <div className="text-red-600 dark:text-red-300 text-xs font-medium min-w-[100px] text-right">
          {formatNumber(ask)}
        </div>
      </div>
    );
  };

  if (isCollapsed) {
    return (
      <div className={`rounded-lg border p-4 shadow-sm ${card}`}>
        <div className="flex items-center justify-between">
          <h3 className={`${text.primary} font-bold text-sm`}>Orderbook</h3>
          <button
            onClick={() => setIsCollapsed(false)}
            className={`${text.primary} hover:text-purple-600 dark:hover:text-purple-300 transition`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${card}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className={`${text.primary} font-bold text-base`}>Orderbook</h3>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className={`${text.primary} hover:text-purple-600 dark:hover:text-purple-300 transition`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Content - Responsive Layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Buy Exchange Section */}
        <div className="flex-1">
          <div className={`rounded-lg overflow-hidden border ${border.primary} bg-purple-50/30 dark:bg-white/5`}>
            {/* Header */}
            <div className="bg-purple-100/50 dark:bg-white/5 px-3 py-2 border-b border-purple-200 dark:border-white/10">
              <div className="flex items-center text-xs font-bold">
                <div className="flex-1 min-w-[100px]">
                  <span className={text.primary}>Buy Exchange</span>
                </div>
                <div className={`${text.primary} min-w-[80px] text-center`}>Size</div>
                <div className={`${text.primary} min-w-[100px] text-right`}>Bid</div>
              </div>
            </div>

            {/* Rows */}
            <div className="max-h-[400px] overflow-y-auto">
              {sortedBids.length > 0 ? (
                <>
                  {sortedBids.map((exchange, index) => (
                    <BuyOrderRow
                      key={`buy-${exchange.name}`}
                      exchange={exchange.name}
                      bid={exchange.bid}
                      bidSize={exchange.bidSize}
                      index={index}
                    />
                  ))}
                  {/* Fill remaining slots with placeholders */}
                  {Array.from({ length: Math.max(0, 5 - sortedBids.length) }).map(
                    (_, index) => (
                      <div
                        key={`buy-placeholder-${index}`}
                        className="flex items-center py-2 px-3 text-sm"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-[100px]">
                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700" />
                        <span className="text-gray-400 dark:text-gray-500 text-xs">--</span>
                        </div>
                      <div className="text-gray-400 dark:text-gray-500 text-xs min-w-[80px] text-center">
                          --
                        </div>
                      <div className="text-gray-400 dark:text-gray-500 text-xs font-medium min-w-[100px] text-right">
                          --
                        </div>
                      </div>
                    )
                  )}
                </>
              ) : (
                <>
                  {[1, 2, 3, 4, 5].map((index) => (
                    <div
                      key={`buy-skeleton-${index}`}
                      className="flex items-center py-2 px-3 text-sm"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-[100px]">
                        <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-500/30 animate-pulse" />
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto" />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sell Exchange Section */}
        <div className="flex-1">
          <div className={`rounded-lg overflow-hidden border ${border.primary} bg-purple-50/30 dark:bg-white/5`}>
            {/* Header */}
            <div className="bg-purple-100/50 dark:bg-white/5 px-3 py-2 border-b border-purple-200 dark:border-white/10">
              <div className="flex items-center text-xs font-bold">
                <div className="flex-1 min-w-[100px]">
                  <span className={text.primary}>Sell Exchange</span>
                </div>
                <div className={`${text.primary} min-w-[80px] text-center`}>Size</div>
                <div className={`${text.primary} min-w-[100px] text-right`}>Ask</div>
              </div>
            </div>

            {/* Rows */}
            <div className="max-h-[400px] overflow-y-auto">
              {sortedAsks.length > 0 ? (
                <>
                  {sortedAsks.map((exchange, index) => (
                    <SellOrderRow
                      key={`sell-${exchange.name}`}
                      exchange={exchange.name}
                      ask={exchange.ask}
                      askSize={exchange.askSize}
                      index={index}
                    />
                  ))}
                  {/* Fill remaining slots with placeholders */}
                  {Array.from({ length: Math.max(0, 5 - sortedAsks.length) }).map(
                    (_, index) => (
                      <div
                        key={`sell-placeholder-${index}`}
                        className="flex items-center py-2 px-3 text-sm"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-[100px]">
                          <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700" />
                          <span className="text-gray-400 dark:text-gray-500 text-xs">--</span>
                        </div>
                        <div className="text-gray-400 dark:text-gray-500 text-xs min-w-[80px] text-center">
                          --
                        </div>
                        <div className="text-gray-400 dark:text-gray-500 text-xs font-medium min-w-[100px] text-right">
                          --
                        </div>
                      </div>
                    )
                  )}
                </>
              ) : (
                <>
                  {[1, 2, 3, 4, 5].map((index) => (
                    <div
                      key={`sell-skeleton-${index}`}
                      className="flex items-center py-2 px-3 text-sm"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-[100px]">
                        <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-500/30 animate-pulse" />
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto" />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orderbook;

