"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import CryptoItem from "../cryptoitems";

// Perpetual DEX and derivatives tokens
const perpdexMarketPairs = [
  'DYDXUSDT', 'GMXUSDT', 'PERPUSDT', 'GNSUSDT', 'PENDLEUSDT', 'SNXUSDT', 'YFIUSDT',
  'AAVEUSDT', 'COMPUSDT', 'CRVUSDT', 'UNIUSDT', 'SUSHIUSDT', '1INCHUSDT', 'LDOUSDT', 'RPLUSDT',
  'SSVUSDT', 'FARMUSDT', 'BIFIUSDT', 'ALCXUSDT', 'SPELLUSDT', 'CVXUSDT', 'FXSUSDT', 'BALUSDT',
  'LRCUSDT', 'REQUSDT', 'UMAUSDT', 'RLCUSDT', 'KNCUSDT', 'BANDUSDT', 'RENUSDT', 'STORJUSDT',
  'KAVAUSDT', 'ZRXUSDT', 'ENJUSDT', 'MANAUSDT', 'SANDUSDT', 'GALAUSDT', 'AXSUSDT', 'ILVUSDT'
];

// WebSocket endpoint for Binance
const BINANCE_WS_URL = "wss://stream.binance.com:9443/stream";

interface MarketData {
  [symbol: string]: {
    price: number;
    percentChange: number;
  };
}

interface PerpDexProps {
  searchQuery: string;
}

const PerpDex: React.FC<PerpDexProps> = ({ searchQuery }) => {
  const [marketData, setMarketData] = useState<MarketData>({});
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("Connecting...");

  useEffect(() => {
    // Binance allows up to 200 streams per connection, but let's be conservative
    const MAX_STREAMS_PER_CONNECTION = 20;
    const pairs = [...new Set(perpdexMarketPairs)]; // Remove duplicates
    
    // Split pairs into batches
    const batches = [];
    for (let i = 0; i < pairs.length; i += MAX_STREAMS_PER_CONNECTION) {
      batches.push(pairs.slice(i, i + MAX_STREAMS_PER_CONNECTION));
    }

    const sockets: WebSocket[] = [];
    let connectedBatches = 0;
    const totalBatches = batches.length;

    // Create connections for each batch
    batches.forEach((batch, batchIndex) => {
      const streams = batch.map(pair => `${pair.toLowerCase()}@ticker`).join("/");
      const socket = new WebSocket(`${BINANCE_WS_URL}?streams=${streams}`);

      socket.onopen = () => {
        console.log(`PerpDex batch ${batchIndex + 1}/${totalBatches} connected`);
        connectedBatches++;
        
        if (connectedBatches === totalBatches) {
          setIsConnected(true);
          setConnectionStatus("Connected");
        } else {
          setConnectionStatus(`Connecting... (${connectedBatches}/${totalBatches})`);
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const symbol = data.stream.split("@")[0].toUpperCase();
          
          setMarketData(prevData => ({
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
        console.error(`PerpDex batch ${batchIndex + 1} WebSocket error:`, error);
        setConnectionStatus(`Error in batch ${batchIndex + 1}`);
      };

      socket.onclose = (event) => {
        console.log(`PerpDex batch ${batchIndex + 1} connection closed:`, event.code);
        connectedBatches--;
        
        if (connectedBatches === 0) {
          setIsConnected(false);
          setConnectionStatus("Disconnected");
        } else {
          setConnectionStatus(`Partial connection (${connectedBatches}/${totalBatches})`);
        }
      };

      sockets.push(socket);
    });

    // Cleanup function
    return () => {
      sockets.forEach(socket => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      });
    };
  }, []);

  // Filter pairs based on search query
  const filteredPairs = perpdexMarketPairs.filter(pair =>
    pair.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 px-2">
        <div className="text-sm text-gray-400 mb-2">
          ⚡ Perpetual DEX and derivatives tokens
        </div>
        <div className="text-xs text-gray-500">
          Status: {connectionStatus}
        </div>
      </div>
      
      {!isConnected && (
        <div className="text-center text-gray-400 py-4">
          {connectionStatus}
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

export default PerpDex;