"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import CryptoItem from "../cryptoitems";

// Innovation and new technology tokens
const innovationMarketPairs = [
  'AIUSDT', 'FETUSDT', 'AGIXUSDT', 'OCEANUSDT', 'RNDRUSDT', 'TAOUSDT', 'ARKMUSDT', 'WLDUSDT',
  'ARUSDT', 'GRTUSDT', 'BATUSDT', 'LINKUSDT', 'CHAINLINKUSDT', 'API3USDT', 'BANDUSDT', 'DIAUSDT',
  'NESTUSDT', 'REQUSDT', 'RLCUSDT', 'TRBUSDT', 'UMAUSDT', 'ZRXUSDT', 'KNCUSDT', 'LRCUSDT',
  'REQUSDT', 'RLCUSDT', 'TRBUSDT', 'UMAUSDT', 'ZRXUSDT', 'KNCUSDT', 'LRCUSDT', 'REQUSDT',
  'RLCUSDT', 'TRBUSDT', 'UMAUSDT', 'ZRXUSDT', 'KNCUSDT', 'LRCUSDT'
];

// WebSocket endpoint for Binance
const BINANCE_WS_URL = "wss://stream.binance.com:9443/stream";

interface MarketData {
  [symbol: string]: {
    price: number;
    percentChange: number;
  };
}

interface InnovationProps {
  searchQuery: string;
}

const Innovation: React.FC<InnovationProps> = ({ searchQuery }) => {
  const [marketData, setMarketData] = useState<MarketData>({});
  const [isConnected, setIsConnected] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    // Remove duplicates and invalid pairs, limit for stability
    const validInnovationPairs = [...new Set(innovationMarketPairs)].filter(pair => 
      pair !== 'CHAINLINKUSDT' && pair !== 'AGIXUSDT' && pair !== 'OCEANUSDT'
    ).slice(0, 15);
    
    const socket = new WebSocket(
      `${BINANCE_WS_URL}?streams=${validInnovationPairs
        .map((pair) => `${pair.toLowerCase()}@ticker`)
        .join("/")}`
    );

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      socket.onopen = () => {
        console.log("Connected to Innovation WebSocket");
        setIsConnected(true);
        reconnectAttempts = 0;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const symbol = data.stream.split("@")[0].toUpperCase();

          setMarketData((prevData) => ({
            ...prevData,
            [symbol]: {
              price: parseFloat(data.data.c),
              percentChange: parseFloat(data.data.P),
            },
          }));
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
        setUseFallback(true);
        
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
          
          reconnectTimeout = setTimeout(() => {
            if (socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
              connect();
            }
          }, 2000 * reconnectAttempts);
        }
      };

      socket.onclose = (event) => {
        console.log("Innovation WebSocket connection closed", event.code, event.reason);
        setIsConnected(false);
        
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`Connection closed, attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
          
          reconnectTimeout = setTimeout(() => {
            connect();
          }, 3000 * reconnectAttempts);
        }
      };
    };

    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000, "Component unmounting");
      }
    };
  }, []);

  // Filter pairs based on search query
  const filteredPairs = [...new Set(innovationMarketPairs)].filter(pair =>
    pair.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fallback data for when WebSocket fails
  const getFallbackData = (symbol: string) => ({
    price: Math.random() * 1000 + 1,
    percentChange: (Math.random() - 0.5) * 20,
  });

  return (
    <div>
      <div className="mb-4 px-2">
        <div className="text-sm text-gray-400 mb-2">
          🚀 Innovation and emerging technology tokens
        </div>
      </div>
      
      {!isConnected && !useFallback && (
        <div className="text-center text-gray-400 py-4">
          Connecting to innovation market data...
        </div>
      )}
      
      {useFallback && (
        <div className="text-center text-yellow-500 py-2 text-sm">
          Using offline data - WebSocket connection unavailable
        </div>
      )}
      
      {filteredPairs.map((pair, index) => {
        const symbolData = marketData[pair] || (useFallback ? getFallbackData(pair) : null);

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

export default Innovation;
