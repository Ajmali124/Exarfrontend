import { useEffect, useState } from "react";

interface Binance24hStats {
  highPrice: number;
  lowPrice: number;
  volume: number;
  priceChangePercent: number;
  lastPrice: number;
}

export function useBinance24hStats(symbol: string) {
  const [stats, setStats] = useState<Binance24hStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;

    const fetchStats = async () => {
      try {
        const tradingPair = symbol.replace("/", "");
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${tradingPair}`
        );

        if (!response.ok) {
          console.error("Failed to fetch 24h stats");
          setLoading(false);
          return;
        }

        const data = await response.json();
        
        setStats({
          highPrice: parseFloat(data.highPrice),
          lowPrice: parseFloat(data.lowPrice),
          volume: parseFloat(data.volume),
          priceChangePercent: parseFloat(data.priceChangePercent),
          lastPrice: parseFloat(data.lastPrice),
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching 24h stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000);

    return () => clearInterval(interval);
  }, [symbol]);

  return { stats, loading };
}

