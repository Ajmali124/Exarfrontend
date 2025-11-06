"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import CryptoItem from "../cryptoitems";

// GameFi and gaming-related tokens
const gamefiMarketPairs = [
  'AXSUSDT', 'SANDUSDT', 'MANAUSDT', 'GALAUSDT', 'ENJUSDT', 'ILVUSDT', 'YGGUSDT', 'SLPUSDT',
  'CHZUSDT', 'FLOWUSDT', 'TLMUSDT', 'ALICEUSDT', 'HIGHUSDT', 'VRAUSDT', 'UFOUSDT', 'MBOXUSDT',
  'DARUSDT', 'GMTUSDT', 'APEUSDT', 'GSTUSDT', 'GMTUSDT', 'VRAUSDT', 'UFOUSDT', 'MBOXUSDT',
  'DARUSDT', 'TLMUSDT', 'ALICEUSDT', 'HIGHUSDT', 'FLOWUSDT', 'CHZUSDT', 'SLPUSDT', 'YGGUSDT',
  'ILVUSDT', 'ENJUSDT', 'GALAUSDT', 'MANAUSDT', 'SANDUSDT', 'AXSUSDT'
];

// WebSocket endpoint for Binance
const BINANCE_WS_URL = "wss://stream.binance.com:9443/stream";

interface MarketData {
  [symbol: string]: {
    price: number;
    percentChange: number;
  };
}

interface GameFiProps {
  searchQuery: string;
}

const GameFi: React.FC<GameFiProps> = ({ searchQuery }) => {
  const [marketData, setMarketData] = useState<MarketData>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Remove duplicates
    const uniqueGamefiPairs = [...new Set(gamefiMarketPairs)];
    
    // Connect to WebSocket for GameFi pairs
    const socket = new WebSocket(
      `${BINANCE_WS_URL}?streams=${uniqueGamefiPairs
        .map((pair) => `${pair.toLowerCase()}@ticker`)
        .join("/")}`
    );

    socket.onopen = () => {
      console.log("Connected to GameFi WebSocket");
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
      console.log("GameFi WebSocket connection closed");
      setIsConnected(false);
    };

    return () => socket.close();
  }, []);

  // Filter pairs based on search query
  const filteredPairs = [...new Set(gamefiMarketPairs)].filter(pair =>
    pair.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 px-2">
        <div className="text-sm text-gray-400 mb-2">
          🎮 Gaming and GameFi tokens
        </div>
      </div>
      
      {!isConnected && (
        <div className="text-center text-gray-400 py-4">
          Connecting to GameFi market data...
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

export default GameFi;
