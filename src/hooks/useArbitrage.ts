"use client";

import { useEffect, useState, useRef } from "react";
import { getWebSocketUrl, createWebSocket } from "@/lib/websocket-utils";

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

export function useArbitrage() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [status, setStatus] = useState<"disconnected" | "connected" | "error">(
    "disconnected"
  );
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    // Don't reconnect if already connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const url = getWebSocketUrl("/ccxt-socket");
    
    const ws = createWebSocket(
      url,
      // onOpen
      () => {
        setStatus("connected");
        reconnectAttempts.current = 0;
        
        // Subscribe to arbitrage data
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ action: "subscribe-arbitrage" }));
        }
      },
      // onMessage
      (event) => {
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
        
        // Auto-reconnect if not a clean close and under max attempts
        if (!event.wasClean && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connect();
          }, delay);
        }
      }
    );

    wsRef.current = ws;
  };

  useEffect(() => {
    setOpportunities([]);
    setStatus("disconnected");
    reconnectAttempts.current = 0;

    connect();

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
  }, []);

  return { opportunities, status };
}

