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

import { getWebSocketUrl, createWebSocket } from "@/lib/websocket-utils";

export function useCCXT(symbol: string) {
  const [data, setData] = useState<ExchangeData>({});
  const [status, setStatus] = useState<"disconnected" | "connected" | "error">(
    "disconnected"
  );
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    const url = getWebSocketUrl("/ccxt-socket");
    
    // Connect to WebSocket
    const ws = createWebSocket(
      url,
      // onOpen
      () => {
        setStatus("connected");

        // Mapping for exchanges that use different names in WebSocket
        const exchangeMap: { [key: string]: string } = {
          'okx': 'myokx', // Frontend uses 'okx' but backend uses 'myokx'
        };
        
        // Subscribe to multiple backend exchanges for the same frontend exchange
        const okxBackendExchanges = ['myokx', 'okxus'];

        // Subscribe to all exchanges for the selected symbol
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          exchanges.forEach((exchange) => {
            if (exchange === 'okx') {
              // Subscribe to both myokx and okxus under 'okx'
              okxBackendExchanges.forEach((backendExchange) => {
                wsRef.current?.send(
                  JSON.stringify({
                    action: "subscribe",
                    exchange: backendExchange,
                    symbol,
                  })
                );
              });
            } else {
              const backendExchange = exchangeMap[exchange] || exchange;
              wsRef.current?.send(
                JSON.stringify({
                  action: "subscribe",
                  exchange: backendExchange,
                  symbol,
                })
              );
            }
          });
        }
      },
      // onMessage
      (event) => {
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
          // Silently handle parsing errors
        }
      },
      // onError
      () => {
        setStatus("error");
      },
      // onClose
      (event) => {
        setStatus("disconnected");
        
        // Auto-reconnect if not a clean close
        if (!event.wasClean && !reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            // Reconnect logic handled by useEffect dependency on symbol
          }, 3000);
        }
      }
    );

    wsRef.current = ws;

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [symbol]);

  return { data, status, exchanges: exchangesList };
}

