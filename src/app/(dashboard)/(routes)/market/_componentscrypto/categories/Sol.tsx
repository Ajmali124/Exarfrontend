"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import CryptoItem from "../cryptoitems";

// Solana ecosystem tokens
const solMarketPairs = [
  'SOLUSDT', 'RAYUSDT', 'JUPUSDT', 'JTOUSDT', 'WIFUSDT', 'BONKUSDT', 'ORCAUSDT',
   'FIDAUSDT', 'RAYUSDT', 'FTTUSDT', 
];

// WebSocket endpoint for Binance
const BINANCE_WS_URL = "wss://stream.binance.com:9443/stream";

interface MarketData {
  [symbol: string]: {
    price: number;
    percentChange: number;
  };
}

interface SolProps {
  searchQuery: string;
}

const Sol: React.FC<SolProps> = ({ searchQuery }) => {
  const [marketData, setMarketData] = useState<MarketData>({});
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("Connecting...");

  useEffect(() => {
    // Binance allows up to 200 streams per connection, but let's be conservative
    const MAX_STREAMS_PER_CONNECTION = 20;
    const pairs = [...new Set(solMarketPairs)]; // Remove duplicates
    
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
        console.log(`Solana batch ${batchIndex + 1}/${totalBatches} connected`);
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
        console.error(`Solana batch ${batchIndex + 1} WebSocket error:`, error);
        setConnectionStatus(`Error in batch ${batchIndex + 1}`);
      };

      socket.onclose = (event) => {
        console.log(`Solana batch ${batchIndex + 1} connection closed:`, event.code);
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
  const filteredPairs = solMarketPairs.filter(pair =>
    pair.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 px-2">
        <div className="text-sm text-gray-400 mb-2">
          ☀️ Solana ecosystem tokens and projects
        </div>
      </div>
      
      {filteredPairs.map((pair, index) => {
        const symbolData = marketData[pair];

        // Show placeholder data with "--" while loading
        const displayData = symbolData ? {
          price: symbolData.price,
          percentChange: symbolData.percentChange
        } : {
          price: 0, // Will show as "--"
          percentChange: 0 // Will show as "--"
        };

        return (
          <CryptoItem
            key={index}
            index={index}
            symbol={pair}
            finalPrice={displayData.price}
            percentChange={displayData.percentChange}
            isLoading={!symbolData}
          />
        );
      })}
    </div>
  );
};

export default Sol;