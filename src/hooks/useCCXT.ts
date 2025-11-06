"use client";

import { useEffect, useState, useRef } from "react";

interface TickerData {
  bid: number;
  ask: number;
  last: number;
  bidSize: number;
  askSize: number;
  timestamp: number;
  spread?: number;
}

interface ExchangeData {
  [exchange: string]: TickerData;
}

const exchanges = [
  "bequant",
  "binance",
  "bybit",
  "bingx",
  "bitget",
  "bitmart",
  "bitopro",
  "blockchaincom",
  "coinbase",
  "deribit",
  "gate",
  "hashkey",
  "htx",
  "kucoin",
  "lbank",
  "p2b",
  "phemex",
  "poloniex",
  "probit",
  "upbit",
  "whitebit",
  "woo",
  "xt",
  "okx", // Combines myokx and okxus
];

const getWebSocketUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || "ws://localhost:3001";
  return `${baseUrl}/ccxt-socket`;
};

export function useCCXT(symbol: string) {
  const [data, setData] = useState<ExchangeData>({});
  const [status, setStatus] = useState<"disconnected" | "connected" | "error">(
    "disconnected"
  );
  const wsRef = useRef<WebSocket | null>(null);

  // Export exchanges list
  const exchangesList = exchanges;

  useEffect(() => {
    // Clear old data and reset status when symbol changes
    setData({});
    setStatus("disconnected");
    
    // Clean up previous connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Connect to WebSocket
    const ws = new WebSocket(getWebSocketUrl());

    ws.onopen = () => {
      setStatus("connected");
      console.log("WebSocket connected");

      // Mapping for exchanges that use different names in WebSocket
      const exchangeMap: { [key: string]: string } = {
        'okx': 'myokx', // Frontend uses 'okx' but backend uses 'myokx'
      };
      
      // Subscribe to multiple backend exchanges for the same frontend exchange
      const okxBackendExchanges = ['myokx', 'okxus'];

      // Subscribe to all exchanges for the selected symbol
      exchanges.forEach((exchange) => {
        if (exchange === 'okx') {
          // Subscribe to both myokx and okxus under 'okx'
          okxBackendExchanges.forEach((backendExchange) => {
            ws.send(
              JSON.stringify({
                action: "subscribe",
                exchange: backendExchange,
                symbol,
              })
            );
          });
        } else {
          const backendExchange = exchangeMap[exchange] || exchange;
          ws.send(
            JSON.stringify({
              action: "subscribe",
              exchange: backendExchange,
              symbol,
            })
          );
        }
      });
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        // Only update data if it matches the current symbol
        if (msg.type === "ticker") {
          // Map backend exchange names to frontend names
          const backendToFrontendMap: { [key: string]: string } = {
            'myokx': 'okx', // Backend uses 'myokx' but frontend uses 'okx'
            'okxus': 'okx', // Backend uses 'okxus' but frontend uses 'okx'
          };
          
          const frontendExchange = backendToFrontendMap[msg.exchange] || msg.exchange;
          
          setData((prev) => ({
            ...prev,
            [frontendExchange]: {
              bid: msg.bid,
              ask: msg.ask,
              last: msg.last,
              bidSize: msg.bidSize,
              askSize: msg.askSize,
              timestamp: msg.timestamp,
              spread: msg.ask - msg.bid,
            },
          }));
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = () => {
      setStatus("error");
      console.error("WebSocket error");
    };

    ws.onclose = () => {
      setStatus("disconnected");
      console.log("WebSocket disconnected");
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [symbol]);

  return { data, status, exchanges: exchangesList };
}

