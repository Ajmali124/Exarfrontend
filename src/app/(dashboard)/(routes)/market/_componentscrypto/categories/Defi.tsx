"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import CryptoItem from "../cryptoitems";

// DeFi tokens and protocols
const defiMarketPairs = [
  'UNIUSDT', 'AAVEUSDT', 'COMPUSDT', 'MKRUSDT', 'SNXUSDT', 'YFIUSDT', 'CRVUSDT', 'SUSHIUSDT',
  '1INCHUSDT', 'LDOUSDT', 'DYDXUSDT', 'GMXUSDT', 'PENDLEUSDT', 'RNDRUSDT', 'LQTYUSDT',
  'RPLUSDT', 'SSVUSDT', 'FARMUSDT', 'BIFIUSDT', 'ALCXUSDT', 'SPELLUSDT', 'CVXUSDT',
  'FXSUSDT', 'BALUSDT', 'LRCUSDT', 'REQUSDT', 'UMAUSDT', 'RLCUSDT', 'KNCUSDT', 'BANDUSDT',
  'RENUSDT', 'STORJUSDT', 'KAVAUSDT', 'ZRXUSDT', 'ENJUSDT', 'MANAUSDT', 'SANDUSDT',
  'GALAUSDT', 'AXSUSDT', 'ILVUSDT', 'YGGUSDT', 'SLPUSDT', 'CHZUSDT', 'FLOWUSDT'
];

// WebSocket endpoint for Binance
const BINANCE_WS_URL = "wss://stream.binance.com:9443/stream";

interface MarketData {
  [symbol: string]: {
    price: number;
    percentChange: number;
  };
}

interface DefiProps {
  searchQuery: string;
}

const Defi: React.FC<DefiProps> = ({ searchQuery }) => {
  const [marketData, setMarketData] = useState<MarketData>({});
  const [isConnected, setIsConnected] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    // Connect to WebSocket for DeFi pairs
    const socket = new WebSocket(
      `${BINANCE_WS_URL}?streams=${defiMarketPairs
        .map((pair) => `${pair.toLowerCase()}@ticker`)
        .join("/")}`
    );

    socket.onopen = () => {
      console.log("Connected to DeFi WebSocket");
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
      console.log("DeFi WebSocket connection closed");
      setIsConnected(false);
    };

    return () => socket.close();
  }, []);

  // Filter pairs based on search query
  const filteredPairs = defiMarketPairs.filter(pair =>
    pair.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 px-2">
        <div className="text-sm text-gray-400 mb-2">
          🏦 Decentralized Finance protocols and tokens
        </div>
      </div>
      
      {!isConnected && (
        <div className="text-center text-gray-400 py-4">
          Connecting to DeFi market data...
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

export default Defi;
