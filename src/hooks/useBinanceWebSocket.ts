import { useEffect, useState, useRef } from "react";

interface BinanceTickerData {
  c: string; // Last price
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Volume
}

interface WebSocketStats {
  lastPrice: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
}

export function useBinanceWebSocket(symbol: string) {
  const [stats, setStats] = useState<WebSocketStats | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!symbol) return;

    // Close any existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear stats
    setStats(null);

    // Convert symbol to lowercase format (e.g., "BTC/USDT" -> "btcusdt")
    const streamName = symbol.replace("/", "").toLowerCase();
    // Using @miniTicker stream for faster updates (every 250ms)
    const wsUrl = `wss://stream.binance.com:9443/ws/${streamName}@miniTicker`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Binance WebSocket connected for", symbol);
    };

    ws.onmessage = (event) => {
      try {
        const data: BinanceTickerData = JSON.parse(event.data);
        
        const lastPrice = parseFloat(data.c);
        const openPrice = parseFloat(data.o);
        
        // Calculate percentage change: ((last - open) / open) * 100
        const priceChangePercent = openPrice > 0 
          ? ((lastPrice - openPrice) / openPrice) * 100 
          : 0;
        
        setStats({
          lastPrice: lastPrice,
          priceChangePercent: priceChangePercent,
          highPrice: parseFloat(data.h),
          lowPrice: parseFloat(data.l),
          volume: parseFloat(data.v),
        });
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("Binance WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("Binance WebSocket disconnected for", symbol);
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [symbol]);

  return { stats };
}
