"use client";
import { useEffect, useState } from "react";

const useCryptoPriceTracker = () => {
  const [btcprice, setPrice] = useState<number>(0);
  const [percentChange, setPercentChange] = useState<number>(0);

  useEffect(() => {
    // WebSocket for the ticker stream, which includes price and 24h percent change
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@ticker");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newPrice = parseFloat(data.c).toFixed(2); // 'c' is the current price
      const changePercent = parseFloat(data.P).toFixed(2); // 'P' is the 24h percentage change

      setPrice(parseFloat(newPrice));
      setPercentChange(parseFloat(changePercent));
    };

    return () => {
      ws.close();
    };
  }, []);

  return { btcprice, percentChange }; // Return an object with price and percentChange
};

export default useCryptoPriceTracker;
