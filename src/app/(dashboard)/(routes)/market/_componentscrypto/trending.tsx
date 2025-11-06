"use client";

import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a Skeleton component for loading states
import { useEffect, useState } from "react";
import CryptoItem from "./cryptoitems";

// WebSocket endpoint for Binance
const BINANCE_WS_URL = "wss://stream.binance.com:9443/stream";

// Updated market pairs array to include SOL, TON, DOGE, PEPE, and NOT
const marketPairs = [
  "btcusdt", // Bitcoin
  "ethusdt", // Ethereum
  "solusdt", // Solana
  "bnbusdt", // Binance Coin
  "xrpusdt", // XRP
  "adausdt", // Cardano
  "tonusdt", // Toncoin
  "dogeusdt", // Dogecoin
  "avaxusdt", //avax
  "pepeusdt", // Pepe
];

// Define the market data type
interface MarketData {
  [symbol: string]: {
    price: number;
    percentChange: number;
  };
}

const Trending = () => {
  const [marketData, setMarketData] = useState<MarketData>({});

  useEffect(() => {
    // Construct WebSocket connection URL
    const socket = new WebSocket(
      `${BINANCE_WS_URL}?streams=${marketPairs
        .map((pair) => `${pair}@ticker`)
        .join("/")}`
    );

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const symbol = data.stream.split("@")[0];

      // Update state with the latest price and percentage change
      setMarketData((prevData) => ({
        ...prevData,
        [symbol]: {
          price: parseFloat(data.data.c), // 'c' is the current price
          percentChange: parseFloat(data.data.P), // 'P' is the percentage change in 24h
        },
      }));
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Close the socket when the component unmounts
    return () => socket.close();
  }, []);

  return (
    <div className="space-y-2">
      {marketPairs.map((pair, index) => {
        const symbolData = marketData[pair];

        if (!symbolData) {
          // Display loading skeleton while data is being fetched
          return <Skeleton key={index} className="h-10 w-full" />;
        }

        return (
          <CryptoItem
            key={index}
            index={index}
            symbol={pair} // Pass the symbol to the CryptoItem
            finalPrice={symbolData.price} // Price from WebSocket
            percentChange={symbolData.percentChange} // 24h % change
          />
        );
      })}
    </div>
  );
};

export default Trending;
