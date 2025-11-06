"use client";

import { useEffect, useState, useRef } from "react";

interface ArbitrageOpportunity {
  id: string;
  pair: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  buySize?: number;
  sellSize?: number;
}

const getWebSocketUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || "ws://localhost:3001";
  return `${baseUrl}/ccxt-socket`;
};

export function useArbitrage() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [status, setStatus] = useState<"disconnected" | "connected" | "error">(
    "disconnected"
  );
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setOpportunities([]);
    setStatus("disconnected");

    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(getWebSocketUrl());

    ws.onopen = () => {
      setStatus("connected");
      ws.send(JSON.stringify({ action: "subscribe-arbitrage" }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "arbitrage") {
          const items = msg.items || [];
          
          // Generate unique IDs if not present
          const itemsWithIds = items.map((item: any, index: number) => ({
            ...item,
            id: item.id || `arb-${index}-${Date.now()}`,
          }));
          
          setOpportunities(itemsWithIds);
        }
      } catch (error) {
        console.error("Error parsing arbitrage WebSocket message:", error);
      }
    };

    ws.onerror = () => {
      setStatus("error");
    };

    ws.onclose = () => {
      setStatus("disconnected");
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  return { opportunities, status };
}

