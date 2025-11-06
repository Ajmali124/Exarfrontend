"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import CryptoItemWithIcon from "../cryptoitemsWithIcon";
import MainCrypto from "../Explore/maincrypto";
import Trending from "../Explore/trending";

// Top 50 most popular trading pairs for Explore tab
const exploreMarketPairs = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'XRPUSDT', 'DOTUSDT', 'DOGEUSDT',
  'AVAXUSDT', 'SHIBUSDT', 'LTCUSDT', 'UNIUSDT', 'ATOMUSDT', 'LINKUSDT', 'BCHUSDT',
  'NEARUSDT', 'APTUSDT', 'OPUSDT', 'ARBUSDT', 'FILUSDT', 'INJUSDT', 'LDOUSDT', 'ICPUSDT',
  'VETUSDT', 'ETCUSDT', 'MANAUSDT', 'SANDUSDT', 'GALAUSDT', 'FLOWUSDT', 'THETAUSDT', 'ALGOUSDT',
  'XTZUSDT', 'EGLDUSDT', 'AAVEUSDT', 'CRVUSDT', 'SUSHIUSDT', 'COMPUSDT', 'SNXUSDT',
  'YFIUSDT', '1INCHUSDT', 'BATUSDT', 'ZECUSDT', 'DASHUSDT', 'XLMUSDT', 'NEOUSDT', 'TRXUSDT',
   'IOTAUSDT'
];

// WebSocket endpoint for Binance
const BINANCE_WS_URL = "wss://stream.binance.com:9443/stream";

interface MarketData {
  [symbol: string]: {
    price: number;
    percentChange: number;
    volume24h?: number;
  };
}

interface ExploreProps {
  searchQuery: string;
}

const Explore: React.FC<ExploreProps> = ({ searchQuery }) => {
  const [marketData, setMarketData] = useState<MarketData>({});
  const [isConnected, setIsConnected] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    // Use a smaller subset for Explore to avoid WebSocket limits
    const limitedPairs = exploreMarketPairs.slice(0, 20); // Limit to 20 pairs for stability
    
    const socket = new WebSocket(
      `${BINANCE_WS_URL}?streams=${limitedPairs
        .map((pair) => `${pair.toLowerCase()}@ticker`)
        .join("/")}`
    );

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      socket.onopen = () => {
        console.log("Connected to Explore WebSocket");
        setIsConnected(true);
        reconnectAttempts = 0; // Reset on successful connection
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
              volume24h: parseFloat(data.data.v),
            },
          }));
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
        
        // Enable fallback mode after first error
        setUseFallback(true);
        
        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
          
          reconnectTimeout = setTimeout(() => {
            if (socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
              connect(); // Reconnect
            }
          }, 2000 * reconnectAttempts); // Exponential backoff
        }
      };

      socket.onclose = (event) => {
        console.log("Explore WebSocket connection closed", event.code, event.reason);
        setIsConnected(false);
        
        // Only attempt to reconnect if it wasn't a manual close
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`Connection closed, attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
          
          reconnectTimeout = setTimeout(() => {
            connect(); // Reconnect
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
  const filteredPairs = exploreMarketPairs.filter(pair =>
    pair.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fallback data for when WebSocket fails
  const getFallbackData = (symbol: string) => ({
    price: Math.random() * 1000 + 1, // Random price between 1-1000
    percentChange: (Math.random() - 0.5) * 20, // Random change between -10% to +10%
    volume24h: Math.random() * 1000000, // Random volume
  });

  return (
    <div>
      {/* Market Trend Component */}
      <MainCrypto />
      
      {/* Trending Component */}
      <Trending />
      
      <div className="mb-4 px-2">
        <div className="text-sm text-gray-400 mb-2">
          🔍 Explore top cryptocurrencies by market cap and trading volume
        </div>
      </div>
      
      {!isConnected && !useFallback && (
        <div className="text-center text-gray-400 py-4">
          Connecting to market data...
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
          <CryptoItemWithIcon
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

export default Explore;
