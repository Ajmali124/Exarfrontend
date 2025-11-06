"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import CryptoItem from "../cryptoitems";

// Oracle and data provider tokens
const oracleMarketPairs = [
  'LINKUSDT', 'BANDUSDT', 'DIAUSDT', 'TRBUSDT', 'API3USDT', 'GRTUSDT', 'RLCUSDT', 'REQUSDT',
  'UMAUSDT', 'ZRXUSDT', 'KNCUSDT', 'LRCUSDT', 'REQUSDT', 'RLCUSDT', 'TRBUSDT', 'UMAUSDT',
  'ZRXUSDT', 'KNCUSDT', 'LRCUSDT', 'REQUSDT', 'RLCUSDT', 'TRBUSDT', 'UMAUSDT', 'ZRXUSDT',
  'KNCUSDT', 'LRCUSDT', 'REQUSDT', 'RLCUSDT', 'TRBUSDT', 'UMAUSDT', 'ZRXUSDT', 'KNCUSDT',
  'LRCUSDT', 'REQUSDT', 'RLCUSDT', 'TRBUSDT', 'UMAUSDT', 'ZRXUSDT', 'KNCUSDT', 'LRCUSDT'
];

// WebSocket endpoint for Binance
const BINANCE_WS_URL = "wss://stream.binance.com:9443/stream";

interface MarketData {
  [symbol: string]: {
    price: number;
    percentChange: number;
  };
}

interface OracleProps {
  searchQuery: string;
}

const Oracle: React.FC<OracleProps> = ({ searchQuery }) => {
  const [marketData, setMarketData] = useState<MarketData>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Remove duplicates
    const uniqueOraclePairs = [...new Set(oracleMarketPairs)];
    
    // Connect to WebSocket for Oracle pairs
    const socket = new WebSocket(
      `${BINANCE_WS_URL}?streams=${uniqueOraclePairs
        .map((pair) => `${pair.toLowerCase()}@ticker`)
        .join("/")}`
    );

    socket.onopen = () => {
      console.log("Connected to Oracle WebSocket");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const symbol = data.stream.split("@")[0].toUpperCase();

      setMarketData((prevData) => ({
        ...prevData,
        [symbol]: {
          price: parseFloat(data.data.c),
          percentChange: parseFloat(data.data.P),
        },
      }));
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    socket.onclose = () => {
      console.log("Oracle WebSocket connection closed");
      setIsConnected(false);
    };

    return () => socket.close();
  }, []);

  // Filter pairs based on search query
  const filteredPairs = [...new Set(oracleMarketPairs)].filter(pair =>
    pair.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 px-2">
        <div className="text-sm text-gray-400 mb-2">
          🔮 Oracle and data provider tokens
        </div>
      </div>
      
      {!isConnected && (
        <div className="text-center text-gray-400 py-4">
          Connecting to oracle market data...
        </div>
      )}
      
      {filteredPairs.map((pair, index) => {
        const symbolData = marketData[pair];

        if (!symbolData) {
          return <Skeleton key={index} className="h-16 w-full" />;
        }

        return (
          <CryptoItem
            key={index}
            index={index}
            symbol={pair}
            finalPrice={symbolData.price}
            percentChange={symbolData.percentChange}
          />
        );
      })}
    </div>
  );
};

export default Oracle;
