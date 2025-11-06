"use client";

import React, { useState } from "react";
import { useBinanceWebSocket } from "@/hooks/useBinanceWebSocket";

interface TradingPairInfoProps {
  selectedCrypto: string;
  onCryptoSelect: (crypto: string) => void;
}

const TradingPairInfo: React.FC<TradingPairInfoProps> = ({
  selectedCrypto,
  onCryptoSelect,
}) => {
  const [isCryptoDrawerOpen, setIsCryptoDrawerOpen] = useState(false);
  
  // Get real-time data from Binance WebSocket
  const { stats } = useBinanceWebSocket(selectedCrypto);

  const cryptos = [
    "BTC/USDT",
    "ETH/USDT",
    "SOL/USDT",
    "XRP/USDT",
    "DOGE/USDT",
    "ADA/USDT",
    "BNB/USDT",
    "TRX/USDT",
    "LINK/USDT",
    "DOT/USDT",
  ];

  return (
    <>
      <div className="bg-white rounded-lg border border-purple-200 p-4 shadow-sm">
        {/* Top Section */}
        <div className="flex items-center mb-4">
          {/* Left: Crypto name and change */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCryptoDrawerOpen(true)}
              className="flex items-center gap-1 text-gray-900 hover:text-purple-600 transition"
            >
              <span className="text-xl font-bold">{selectedCrypto}</span>
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
            {stats ? (
              <div className={`border rounded-full px-2 py-0.5 ${
                stats.priceChangePercent < 0 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <span className={`text-xs font-medium ${
                  stats.priceChangePercent < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {stats.priceChangePercent > 0 ? '+' : ''}{stats.priceChangePercent.toFixed(2)}%
                </span>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5">
                <span className="text-gray-600 text-xs font-medium">--</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - Always 2 columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left: Index Price */}
          <div>
            <p className="text-gray-600 text-xs mb-1">Index Price</p>
            {stats ? (
              <>
                <p className={`text-green-600 text-2xl font-bold mb-1 transition-all duration-300`}>
                  {selectedCrypto.includes("BTC") 
                    ? Math.floor(stats.lastPrice).toLocaleString()
                    : selectedCrypto.includes("ETH")
                    ? stats.lastPrice.toFixed(1)
                    : selectedCrypto.includes("SOL") || selectedCrypto.includes("BNB") || selectedCrypto.includes("LINK") || selectedCrypto.includes("DOT")
                    ? stats.lastPrice.toFixed(2)
                    : selectedCrypto.includes("XRP") || selectedCrypto.includes("ADA")
                    ? stats.lastPrice.toFixed(4)
                    : selectedCrypto.includes("DOGE") || selectedCrypto.includes("TRX")
                    ? stats.lastPrice.toFixed(5)
                    : stats.lastPrice.toFixed(2)}
                </p>
                <p className="text-gray-500 text-sm">
                  ${selectedCrypto.includes("BTC") 
                    ? Math.floor(stats.lastPrice).toLocaleString()
                    : selectedCrypto.includes("ETH")
                    ? stats.lastPrice.toFixed(1)
                    : selectedCrypto.includes("SOL") || selectedCrypto.includes("BNB") || selectedCrypto.includes("LINK") || selectedCrypto.includes("DOT")
                    ? stats.lastPrice.toFixed(2)
                    : selectedCrypto.includes("XRP") || selectedCrypto.includes("ADA")
                    ? stats.lastPrice.toFixed(4)
                    : selectedCrypto.includes("DOGE") || selectedCrypto.includes("TRX")
                    ? stats.lastPrice.toFixed(5)
                    : stats.lastPrice.toFixed(2)}
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-400 text-2xl font-bold mb-1">--</p>
                <p className="text-gray-400 text-sm">$--</p>
              </>
            )}
          </div>

          {/* Right: 24h Stats */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs">24h High</span>
              <span className="text-gray-900 text-xs font-medium">
                {stats ? stats.highPrice.toFixed(2) : "--"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs">24h Low</span>
              <span className="text-gray-900 text-xs font-medium">
                {stats ? stats.lowPrice.toFixed(2) : "--"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs">24h Vol. (USDT)</span>
              <span className="text-gray-900 text-xs font-medium">
                {stats ? (stats.volume / 1000000).toFixed(2) + "M" : "--"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs border-b border-dotted border-gray-400">
                Funding
              </span>
              <span className="text-gray-900 text-xs font-medium">--</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sheet Drawer for Crypto Selection */}
      {isCryptoDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setIsCryptoDrawerOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Drawer */}
          <div
            className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl h-[80vh] max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 border-b border-purple-200">
              <h3 className="text-lg font-bold text-gray-900">Select Trading Pair</h3>
            </div>

            {/* Crypto List */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {cryptos.map((crypto) => (
                <button
                  key={crypto}
                  onClick={() => {
                    onCryptoSelect(crypto);
                    setIsCryptoDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    selectedCrypto === crypto
                      ? "bg-purple-50 text-purple-600"
                      : "text-gray-900 hover:bg-purple-50"
                  }`}
                >
                  <span className="font-medium">{crypto}</span>
                  {selectedCrypto === crypto && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TradingPairInfo;

