"use client";
import React, { memo, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useArbitrage } from "@/hooks/useArbitrage";
import { useRouter } from "next/navigation";
import { useThemeClasses } from "@/lib/theme-utils";

// Types for arbitrage opportunities
interface ArbitrageOpportunity {
  id: string;
  pair: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  buySize?: number;
  sellSize?: number;
}

// Utility functions for formatting and exchange logos
const formatPrice = (price: number): string => {
  return price.toFixed(4);
};

const formatSpread = (spread: number): string => {
  return spread.toFixed(2);
};

const getExchangeLogo = (exchange: string) => {
  // Map exchange names for logo paths
  const exchangeMap: { [key: string]: string } = {
    'myokx': 'okx',
    'okxus': 'okx',
  };
  
  const logoName = exchangeMap[exchange.toLowerCase()] || exchange;
  return `/exchange-logos/${logoName}.png`;
};

// Optimized Exchange Icon Component with instant loading (pre-cached)
const ExchangeIcon = memo(
  ({ exchange }: { exchange: string }) => {
    const logoSource = getExchangeLogo(exchange);

    return (
      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
        <img
          src={logoSource}
          alt={`${exchange} logo`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initial letters if logo fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            if (target.nextElementSibling) {
              (target.nextElementSibling as HTMLElement).style.display = "flex";
            }
          }}
        />
        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center hidden">
          <span className="text-xs font-medium text-purple-600 uppercase">
            {exchange.substring(0, 2)}
          </span>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison - only re-render if exchange actually changes
    return prevProps.exchange === nextProps.exchange;
  }
);

ExchangeIcon.displayName = "ExchangeIcon";

// Animated Arbitrage Row Component (memoized to prevent unnecessary re-renders)
const ArbitrageRow = memo(
  ({
    opportunity,
    isNew,
    onRowClick,
    themeClasses,
  }: {
    opportunity: ArbitrageOpportunity;
    isNew: boolean;
    onRowClick: (pair: string) => void;
    themeClasses: { bg: any; text: any; border: any };
  }) => {
    const { bg, text, border } = themeClasses;
    const spreadColor =
      opportunity.spread > 0.40
        ? "text-purple-600 dark:text-purple-400"
        : "text-gray-500 dark:text-gray-400";

    return (
      <motion.div
        initial={isNew ? { opacity: 0, x: 300, scale: 0.95 } : false}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ 
          type: "spring", 
          damping: 25, 
          stiffness: 400,
          duration: 0.2 
        }}
        className="px-3"
      >
        <div 
          onClick={() => onRowClick(opportunity.pair)}
          className={`py-2 relative overflow-hidden ${border.primary} border-b cursor-pointer ${bg.secondary} hover:opacity-80 transition-colors`}
        >
          {/* Main Trading Row */}
          <div className="flex items-center justify-between">
            {/* Buy Exchange (Left) */}
            <div className="flex-1 flex items-center space-x-2">
              <ExchangeIcon exchange={opportunity.buyExchange} />
              <div>
                <div className={`font-medium ${text.secondary} capitalize text-xs ml-1 tracking-wide`}>
                  {opportunity.buyExchange.toUpperCase()}
                </div>
                <div className="text-green-600 dark:text-green-400 text-xs font-bold ml-1 font-mono">
                  ${formatPrice(opportunity.buyPrice)}
                </div>
              </div>
            </div>

            {/* Currency Pair & Spread (Center) */}
            <div className="flex-1 flex flex-col items-center">
              <div className={`font-bold ${text.primary} text-sm mb-1 tracking-wide`}>
                {opportunity.pair}
              </div>
              <div
                className={`px-2 py-0.5 rounded ${
                  opportunity.spread > 0.40
                    ? "bg-purple-100 dark:bg-purple-900/30"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <div className={`text-xs font-bold ${spreadColor}`}>
                  +{formatSpread(opportunity.spread)}%
                </div>
              </div>
            </div>

            {/* Sell Exchange (Right) */}
            <div className="flex-1 flex items-center justify-end space-x-2">
              <div className="flex flex-col items-end">
                <div className={`font-medium ${text.secondary} capitalize text-xs mr-1 tracking-wide`}>
                  {opportunity.sellExchange.toUpperCase()}
                </div>
                <div className="text-red-500 dark:text-red-400 text-xs font-bold mr-1 font-mono">
                  ${formatPrice(opportunity.sellPrice)}
                </div>
              </div>
              <ExchangeIcon exchange={opportunity.sellExchange} />
            </div>
          </div>
        </div>
      </motion.div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison - only re-render if opportunity or isNew actually changes
    return (
      prevProps.opportunity.id === nextProps.opportunity.id &&
      prevProps.opportunity.buyExchange === nextProps.opportunity.buyExchange &&
      prevProps.opportunity.sellExchange ===
        nextProps.opportunity.sellExchange &&
      prevProps.opportunity.buyPrice === nextProps.opportunity.buyPrice &&
      prevProps.opportunity.sellPrice === nextProps.opportunity.sellPrice &&
      prevProps.opportunity.spread ===
        nextProps.opportunity.spread &&
      prevProps.isNew === nextProps.isNew
    );
  }
);

ArbitrageRow.displayName = "ArbitrageRow";

// Main Arbitrage Component
const ArbitrageList = () => {
  const router = useRouter();
  const { bg, text, border } = useThemeClasses();
  
  // Get real arbitrage data from WebSocket
  const { opportunities, status } = useArbitrage();

  const isConnected = status === "connected";
  const isConnecting = status === "disconnected";
  const error: Error | null = status === "error" ? new Error("Connection error") : null;

  // Handle row click - navigate to arbify page with selected pair
  const handleRowClick = (pair: string) => {
    router.push(`/arbify?pair=${pair}`);
  };

  // Use the opportunities from WebSocket, limit to 10
  const validOpportunities = opportunities.slice(0, 10);

  // Track new opportunities with stable refs to avoid infinite loops
  const previousOpportunityIdsRef = useRef<string[]>([]);
  const [newOpportunityIds, setNewOpportunityIds] = useState<Set<string>>(
    new Set()
  );

  // Optimized opportunity tracking - less frequent updates
  const firstOpportunityId = validOpportunities[0]?.id;
  const opportunityCount = validOpportunities.length;

  useEffect(() => {
    // Only process if we have opportunities
    if (opportunityCount === 0) return;

    const currentIds = validOpportunities.map((op) => op.id);
    const previousIds = previousOpportunityIdsRef.current;

    // Find truly new opportunities (not in previous list)
    const newIds = currentIds.filter((id) => !previousIds.includes(id));

    if (newIds.length > 0) {
      setNewOpportunityIds(new Set(newIds));

      // Clear the "new" status after animation duration
      const timer = setTimeout(() => {
        setNewOpportunityIds(new Set());
      }, 200); // Lightning-fast animation for real-time ticker feel

      // Update previous IDs for next comparison
      previousOpportunityIdsRef.current = currentIds;

      return () => clearTimeout(timer);
    } else if (currentIds.length !== previousIds.length) {
      // Update ref if list size changed but no new items (items removed)
      previousOpportunityIdsRef.current = currentIds;
    }
  }, [firstOpportunityId, opportunityCount, validOpportunities]); // Include all dependencies

  // Loading state - show skeleton only when absolutely no data is available
  if (isConnecting && opportunities.length === 0 && !error) {
    return (
      <div className="flex-1 mb-20">
        {/* Header Row */}
        <div className={`flex justify-between items-center px-4 py-3 ${bg.secondary} ${border.primary} border-b`}>
          <div className={`text-xs font-bold ${text.secondary} flex-1 text-left tracking-widest uppercase ml-2`}>
            BUY
          </div>
          <div className={`text-xs font-bold ${text.secondary} flex-1 text-center tracking-widest uppercase`}>
            PAIR / SPREAD
          </div>
          <div className={`text-xs font-bold ${text.secondary} flex-1 text-right tracking-widest uppercase mr-2`}>
            SELL
          </div>
        </div>

        <div className={`flex-1 ${bg.card} overflow-y-auto`} style={{ paddingBottom: 10 }}>
          {/* Show skeleton loading items */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="px-3">
              <div className="py-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  {/* Buy Exchange (Left) */}
                  <div className="flex-1 flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    <div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1 animate-pulse" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                    </div>
                  </div>

                  {/* Currency Pair & Spread (Center) */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1 animate-pulse" />
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
                  </div>

                  {/* Sell Exchange (Right) */}
                  <div className="flex-1 flex items-center justify-end space-x-2">
                    <div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1 animate-pulse" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 mb-20">
        {/* Header Row */}
        <div className={`flex justify-between items-center px-4 py-3 ${bg.secondary} ${border.primary} border-b`}>
          <div className={`text-xs font-bold ${text.secondary} flex-1 text-left tracking-widest uppercase ml-2`}>
            BUY
          </div>
          <div className={`text-xs font-bold ${text.secondary} flex-1 text-center tracking-widest uppercase`}>
            PAIR / SPREAD
          </div>
          <div className={`text-xs font-bold ${text.secondary} flex-1 text-right tracking-widest uppercase mr-2`}>
            SELL
          </div>
        </div>

        <div className={`flex-1 ${bg.card} flex items-center justify-center p-8`}>
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <div className="text-red-500 dark:text-red-400 text-2xl">⚠️</div>
          </div>
          <div className="text-red-600 dark:text-red-400 font-semibold mb-2 text-center">
            Connection Error
          </div>
          <div className={text.muted + " text-sm text-center"}>
            Failed to load arbitrage data. Retrying...
          </div>
          <div className={text.disabled + " text-xs text-center mt-2"}>
            Unknown error occurred
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 mb-20">
      {/* Header Row */}
      <div className={`flex justify-between items-center px-4 py-3 ${bg.secondary} ${border.primary} border-b`}>
        <div className={`text-xs font-bold ${text.secondary} flex-1 text-left tracking-widest uppercase ml-2`}>
          BUY
        </div>
        <div className={`text-xs font-bold ${text.secondary} flex-1 text-center tracking-widest uppercase`}>
          PAIR / SPREAD
        </div>
        <div className={`text-xs font-bold ${text.secondary} flex-1 text-right tracking-widest uppercase mr-2`}>
          SELL
        </div>
      </div>

      {/* Connection status indicator - Only show if not connected AND no data available */}
      {!isConnected && opportunities.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-3 mx-4 mt-2">
          <div className="text-yellow-800 dark:text-yellow-200 text-xs font-medium">
            🔄 Connecting to live arbitrage data...
          </div>
        </div>
      )}

      {/* Arbitrage Opportunities */}
      <div className={`flex-1 ${bg.card} overflow-y-auto`} style={{ paddingBottom: 10 }}>
        {validOpportunities.length > 0 ? (
          validOpportunities.map((opportunity) => {
            const isNew = newOpportunityIds.has(opportunity.id);
            return (
              <ArbitrageRow
                key={opportunity.id}
                opportunity={opportunity}
                isNew={isNew}
                onRowClick={handleRowClick}
                themeClasses={{ bg, text, border }}
              />
            );
          })
        ) : (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className={`w-12 h-12 ${bg.secondary} rounded-full flex items-center justify-center mb-3`}>
              <div className={text.muted + " text-xl"}>⚡</div>
            </div>
            <div className={`${text.secondary} font-semibold mb-1 text-sm tracking-wide`}>
              {isConnected ? "NO OPPORTUNITIES" : "CONNECTING..."}
            </div>
            <div className={text.muted + " text-xs text-center"}>
              {isConnected
                ? "No arbitrage opportunities available at the moment."
                : "Scanning exchanges for arbitrage opportunities..."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArbitrageList;
