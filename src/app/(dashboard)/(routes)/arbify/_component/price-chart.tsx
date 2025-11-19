"use client";

import React, { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi } from "lightweight-charts";
import { CandlestickSeries } from "lightweight-charts";
import { useTheme } from "@/context/ThemeContext";
import { useThemeClasses } from "@/lib/theme-utils";

interface PriceChartProps {
  symbol: string;
}

interface CandleData {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ symbol }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("1h");
  const [showMoreTimeframes, setShowMoreTimeframes] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { card, text, border, bg } = useThemeClasses();

  // Binance API interval mapping
  const timeframeMap: { [key: string]: string } = {
    "1m": "1m",
    "3m": "3m",
    "5m": "5m",
    "15m": "15m",
    "30m": "30m",
    "1h": "1h",
    "2h": "2h",
    "4h": "4h",
    "6h": "6h",
    "8h": "8h",
    "12h": "12h",
    "1d": "1d",
    "3d": "3d",
    "1w": "1w",
    "1M": "1M",
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const chartTextColor = isDark ? "#F5F5F5" : "#111827";
    const chartBgColor = isDark ? "#05070F" : "#FFFFFF";
    const gridColor = isDark ? "#1F2937" : "#E5E7EB";
    const axisBorderColor = isDark ? "#1F2937" : "#E5E7EB";

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        textColor: chartTextColor,
        background: { type: ColorType.Solid, color: chartBgColor },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      timeScale: {
        borderColor: axisBorderColor,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: axisBorderColor,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
    });

    chartRef.current = chart;

    // Create candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10B981",
      downColor: "#EF4444",
      borderVisible: false,
      wickUpColor: "#10B981",
      wickDownColor: "#EF4444",
    });

    seriesRef.current = candlestickSeries;

    // Fetch historical data from Binance
    const fetchData = async () => {
      try {
        const tradingPair = symbol.replace("/", "");
        const binanceInterval = timeframeMap[timeframe] || "1h";
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${tradingPair}&interval=${binanceInterval}&limit=500`
        );

        if (!response.ok) {
          console.error("Failed to fetch chart data");
          setLoading(false);
          return;
        }

        const data = await response.json();

        const formattedData: CandleData[] = data.map((item: any) => ({
          time: item[0] / 1000,
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
        }));

        candlestickSeries.setData(formattedData as any);
        chart.timeScale().fitContent();
        
        // Add breathing room for price axis
        chart.applyOptions({
          layout: {
            textColor: chartTextColor,
            background: { type: ColorType.Solid, color: chartBgColor },
          },
          rightPriceScale: {
            borderColor: axisBorderColor,
            scaleMargins: {
              top: 0.1,
              bottom: 0.1,
            },
          },
          timeScale: {
            borderColor: axisBorderColor,
          },
          grid: {
            vertLines: { color: gridColor },
            horzLines: { color: gridColor },
          },
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setLoading(false);
      }
    };

    fetchData();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chart) {
        chart.remove();
      }
    };
  }, [symbol, timeframe, isDark]);

  const primaryTimeframes = ["1m", "15m", "1h", "1d"];
  const allTimeframes = ["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "1d", "1M"];

  return (
    <div className={`rounded-lg md:border md:p-3 md:shadow-sm border ${card}`}>
      {/* Header with timeframe selector */}
      <div className="flex flex-col gap-3 mb-2 md:mb-4 px-2 md:px-0">
        {/* Title and primary timeframes */}
        <div className="flex items-center justify-between gap-2">
          <h3 className={`${text.primary} font-bold text-sm md:text-base`}>{symbol} Chart</h3>
          {/* Mobile: Show first 4 timeframes, Desktop: Show all */}
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            {primaryTimeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 md:px-3 py-1 text-xs rounded border transition-colors ${
                  timeframe === tf
                    ? "bg-purple-100 border-purple-400 text-purple-600 dark:bg-purple-500/20 dark:border-purple-400/60 dark:text-purple-100 font-medium"
                    : `${bg.primary} ${border.primary} ${text.secondary} hover:bg-purple-50 dark:hover:bg-white/10`
                }`}
              >
                {tf}
              </button>
            ))}
            {/* More button for mobile */}
            <button
              onClick={() => setShowMoreTimeframes(!showMoreTimeframes)}
              className={`px-2 md:px-3 py-1 text-xs rounded border transition-colors md:hidden ${
                showMoreTimeframes
                  ? "bg-purple-100 border-purple-400 text-purple-600 dark:bg-purple-500/20 dark:border-purple-400/60 dark:text-purple-100 font-medium"
                  : `${bg.primary} ${border.primary} ${text.secondary} hover:bg-purple-50 dark:hover:bg-white/10`
              }`}
            >
              More
            </button>
          </div>
        </div>

        {/* Additional timeframes row - hidden on desktop, shown on mobile when "More" is clicked */}
        <div className={`flex items-center gap-2 flex-wrap md:hidden ${showMoreTimeframes ? "block" : "hidden"}`}>
          {allTimeframes.filter(tf => !primaryTimeframes.includes(tf)).map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf);
                setShowMoreTimeframes(false);
              }}
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                timeframe === tf
                  ? "bg-purple-100 border-purple-400 text-purple-600 dark:bg-purple-500/20 dark:border-purple-400/60 dark:text-purple-100 font-medium"
                  : `${bg.primary} ${border.primary} ${text.secondary} hover:bg-purple-50 dark:hover:bg-white/10`
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Desktop: Show all timeframes in one row */}
        <div className="hidden md:flex items-center gap-2 flex-wrap">
          {allTimeframes.filter(tf => !primaryTimeframes.includes(tf)).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                timeframe === tf
                  ? "bg-purple-100 border-purple-400 text-purple-600 dark:bg-purple-500/20 dark:border-purple-400/60 dark:text-purple-100 font-medium"
                  : `${bg.primary} ${border.primary} ${text.secondary} hover:bg-purple-50 dark:hover:bg-white/10`
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      {loading && (
        <div className="flex items-center justify-center h-[400px]">
          <div className={`${text.muted} text-sm`}>Loading chart data...</div>
        </div>
      )}
      <div ref={chartContainerRef} className="w-full px-0 md:px-0" style={{ height: "400px" }} />
    </div>
  );
};

export default PriceChart;

