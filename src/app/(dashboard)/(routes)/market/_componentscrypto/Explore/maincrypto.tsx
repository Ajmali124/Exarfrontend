"use client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useCryptoPriceTracker from "@/CryptoThings/getbtcprice";
import useCryptoPriceTrackerETH from "@/CryptoThings/getethprice"; // ETH Price Hook
import { motion } from "framer-motion"; // Import Framer Motion
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";

const MainCrypto = () => {
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [solPercentChange, setSolPercentChange] = useState<number | null>(null);
  const { btcprice, percentChange: btcPercentChange } = useCryptoPriceTracker();
  const { ethPrice, percentChange: ethPercentChange } = useCryptoPriceTrackerETH();

  // Fetch SOL price using WebSocket
  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/stream?streams=solusdt@ticker');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.data) {
        setSolPrice(parseFloat(data.data.c));
        setSolPercentChange(parseFloat(data.data.P));
      }
    };

    ws.onerror = (error) => {
      console.error('SOL WebSocket error:', error);
    };

    return () => ws.close();
  }, []);

  return (
    <div className="w-full bg-transparent mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Market Trend</h2>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* BTC Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-full"
        >
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center">
                <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3">
                  <Image
                    src="https://s2.coinmarketcap.com/static/img/coins/32x32/1.png"
                    alt="Bitcoin"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                    width={40}
                    height={40}
                  />
                </div>
                <span className="text-gray-900 dark:text-white font-bold text-sm sm:text-lg">BTC</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-gray-900 dark:text-white text-sm sm:text-lg font-bold">
                {btcprice ? `$${btcprice.toLocaleString()}` : "--"}
              </div>
              <div className={`text-xs sm:text-sm font-medium ${btcPercentChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {btcPercentChange !== null ? `${btcPercentChange >= 0 ? "+" : ""}${btcPercentChange.toFixed(2)}%` : "--"}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ETH Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-full"
        >
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center">
                <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3">
                  <Image
                    src="https://s2.coinmarketcap.com/static/img/coins/32x32/1027.png"
                    alt="Ethereum"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                    width={40}
                    height={40}
                  />
                </div>
                <span className="text-gray-900 dark:text-white font-bold text-sm sm:text-lg">ETH</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-gray-900 dark:text-white text-sm sm:text-lg font-bold">
                {ethPrice ? `$${ethPrice.toLocaleString()}` : "--"}
              </div>
              <div className={`text-xs sm:text-sm font-medium ${ethPercentChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {ethPercentChange !== null ? `${ethPercentChange >= 0 ? "+" : ""}${ethPercentChange.toFixed(2)}%` : "--"}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* SOL Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-full"
        >
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center">
                <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3">
                  <Image
                    src="https://s2.coinmarketcap.com/static/img/coins/32x32/5426.png"
                    alt="Solana"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                    width={40}
                    height={40}
                  />
                </div>
                <span className="text-gray-900 dark:text-white font-bold text-sm sm:text-lg">SOL</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-gray-900 dark:text-white text-sm sm:text-lg font-bold">
                {solPrice ? `$${solPrice.toLocaleString()}` : "--"}
              </div>
              <div className={`text-xs sm:text-sm font-medium ${solPercentChange !== null && solPercentChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {solPercentChange !== null ? `${solPercentChange >= 0 ? "+" : ""}${solPercentChange.toFixed(2)}%` : "--"}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MainCrypto;
