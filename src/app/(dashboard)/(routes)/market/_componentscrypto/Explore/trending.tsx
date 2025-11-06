"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TrendingCrypto {
  symbol: string;
  price: string;
  percentChange: number;
  volume: string;
  iconUrl: string;
}

const Trending = () => {
  const [trendingCryptos, setTrendingCryptos] = useState<TrendingCrypto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get crypto icons from CoinMarketCap - Dynamic approach
  const getCryptoIcon = async (symbol: string) => {
    console.log(`Fetching icon for: ${symbol}`);
    
    // First try CoinGecko API with different symbol variations
    const coinGeckoVariations = [
      symbol.toLowerCase(),
      symbol.toLowerCase().replace(/USDT$/, ''),
      symbol.toLowerCase().replace(/USD$/, '')
    ];

    for (const variation of coinGeckoVariations) {
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${variation}`);
        if (response.ok) {
          const data = await response.json();
          if (data.image?.small) {
            console.log(`Found icon for ${symbol} via CoinGecko: ${data.image.small}`);
            return data.image.small;
          }
        }
      } catch (error) {
        console.log(`CoinGecko failed for ${variation}`);
      }
    }

    // Fallback to CoinMarketCap with expanded symbol mapping
    const symbolToId: { [key: string]: string } = {
      'BTC': '1', 'ETH': '1027', 'BNB': '1839', 'SOL': '5426', 'XRP': '52', 'ADA': '2010',
      'DOGE': '74', 'AVAX': '5805', 'DOT': '6636', 'MATIC': '3890', 'LINK': '1975',
      'UNI': '7083', 'ATOM': '3794', 'NEAR': '6535', 'APT': '21794', 'ARB': '19585',
      'OP': '11840', 'SUI': '20947', 'SEI': '23149', 'INJ': '7226', 'TIA': '22861',
      'WLD': '21351', 'JUP': '23095', 'PYTH': '22691', 'WIF': '23095', 'BONK': '22591',
      'PEPE': '24478', 'SHIB': '5994', 'FLOKI': '16746', 'BOME': '23285', 'TRX': '1958',
      'LTC': '2', 'BCH': '1831', 'FIL': '12817', 'ICP': '8916', 'VET': '3077',
      'ETC': '1321', 'MANA': '1966', 'SAND': '6210', 'GALA': '7080', 'FLOW': '4558',
      'THETA': '2416', 'ALGO': '4030', 'XTZ': '2010', 'EGLD': '6892', 'AAVE': '7278',
      'CRV': '6538', 'SUSHI': '6758', 'COMP': '5692', 'SNX': '3406', 'YFI': '5864',
      '1INCH': '8104', 'BAT': '1697', 'ZEC': '1437', 'DASH': '131', 'XLM': '512',
      'NEO': '1376', 'IOTA': '1720', 'USDT': '825', 'USDC': '3408', 'BUSD': '4687',
      'TUSD': '2563', 'DAI': '4943', 'FRAX': '6952', 'LUSD': '9566', 'SUSD': '2927',
      'GUSD': '3306', 'PAX': '3330', 'HUSD': '4784', 'USDN': '5068', 'RSV': '3964',
      'MIM': '162', 'UST': '7129', 'FEI': '8642', 'RAI': '14031', 'LQTY': '14718',
      'CVX': '15552', 'FXS': '13446', 'BAL': '5728', 'LIDO': '13573',
      'RPL': '2943', 'SSV': '15557', 'FARM': '6857', 'BIFI': '7311', 'ALCX': '8613',
      'SPELL': '14861', 'LRC': '1934',
      'REQ': '2071', 'UMA': '1094', 'RLC': '1636', 'KNC': '1982', 'BAND': '3416',
      'REN': '2539', 'STORJ': '1772', 'KAVA': '4846', 'ZRX': '1896', 'ENJ': '1102',
       'AXS': '13029', 'ILV': '14806'
    };
    
    const id = symbolToId[symbol];
    if (id) {
      const url = `https://s2.coinmarketcap.com/static/img/coins/32x32/${id}.png`;
      console.log(`Using CoinMarketCap for ${symbol}: ${url}`);
      return url;
    }

    // If no mapping found, try a generic approach
    console.log(`No icon mapping found for ${symbol}, using generic icon`);
    return `https://s2.coinmarketcap.com/static/img/coins/32x32/1.png`;
  };

  useEffect(() => {
    const fetchTrendingCryptos = async () => {
      try {
        setIsLoading(true);
        
        // Fetch 24hr ticker statistics from Binance
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await response.json();
        
        // Filter USDT pairs and sort by volume (highest first)
        const usdtPairs = data
          .filter((ticker: any) => ticker.symbol.endsWith('USDT'))
          .map((ticker: any) => ({
            symbol: ticker.symbol.replace('USDT', ''),
            price: parseFloat(ticker.lastPrice).toFixed(4),
            percentChange: parseFloat(ticker.priceChangePercent),
            volume: ticker.volume,
            volumeFloat: parseFloat(ticker.volume)
          }))
          .sort((a: any, b: any) => b.volumeFloat - a.volumeFloat) // Sort by volume
          .slice(0, 9); // Get top 9 by volume

        // Add icon URLs dynamically
        const cryptosWithIcons = await Promise.all(
          usdtPairs.map(async (crypto: any) => ({
            ...crypto,
            iconUrl: await getCryptoIcon(crypto.symbol)
          }))
        );

        setTrendingCryptos(cryptosWithIcons);
      } catch (error) {
        console.error('Error fetching trending cryptos:', error);
        
        // Fallback data if API fails
        const fallbackData = [
          { symbol: 'BTC', price: '108358.49', percentChange: -2.29, volume: '45234567890', iconUrl: await getCryptoIcon('BTC') },
          { symbol: 'ETH', price: '3878.53', percentChange: -1.92, volume: '23456789012', iconUrl: await getCryptoIcon('ETH') },
          { symbol: 'SOL', price: '2195.10', percentChange: 7.54, volume: '12345678901', iconUrl: await getCryptoIcon('SOL') },
          { symbol: 'BNB', price: '645.32', percentChange: 2.15, volume: '9876543210', iconUrl: await getCryptoIcon('BNB') },
          { symbol: 'XRP', price: '0.5607', percentChange: -18.85, volume: '8765432109', iconUrl: await getCryptoIcon('XRP') },
          { symbol: 'ADA', price: '0.4295', percentChange: -5.95, volume: '7654321098', iconUrl: await getCryptoIcon('ADA') },
          { symbol: 'DOGE', price: '0.00413', percentChange: 8.97, volume: '6543210987', iconUrl: await getCryptoIcon('DOGE') },
          { symbol: 'AVAX', price: '34.56', percentChange: 3.21, volume: '5432109876', iconUrl: await getCryptoIcon('AVAX') },
          { symbol: 'DOT', price: '6.78', percentChange: -1.45, volume: '4321098765', iconUrl: await getCryptoIcon('DOT') }
        ];
        
        setTrendingCryptos(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchTrendingCryptos();

    // Auto-refresh every 30 seconds to keep data current
    const interval = setInterval(fetchTrendingCryptos, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full bg-transparent mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Trending</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-transparent mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Trending</h2>
      
      {/* Desktop Grid - 3x3 */}
      <div className="hidden lg:grid grid-cols-3 gap-3">
        {trendingCryptos.map((crypto, index) => (
          <motion.div
            key={crypto.symbol}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative flex items-center justify-center w-10 h-10 mr-3">
                    <img
                      src={crypto.iconUrl}
                      alt={crypto.symbol}
                      className="w-10 h-10 rounded-full"
                      width={40}
                      height={40}
                      onError={(e) => {
                        console.log(`Image failed to load for ${crypto.symbol}: ${crypto.iconUrl}`);
                        e.currentTarget.src = 'https://s2.coinmarketcap.com/static/img/coins/32x32/1.png';
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-gray-900 dark:text-white font-bold text-sm">
                      {crypto.symbol}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Top interest
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-gray-900 dark:text-white font-bold text-sm">
                    {crypto.price}
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      crypto.percentChange >= 0
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {crypto.percentChange >= 0 ? "+" : ""}{crypto.percentChange.toFixed(2)}%
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Mobile Layout - 3x3 Grid */}
      <div className="lg:hidden grid grid-cols-3 gap-2">
        {trendingCryptos.map((crypto, index) => (
          <motion.div
            key={crypto.symbol}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-full"
          >
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="relative flex items-center justify-center w-8 h-8 mb-2">
                  <img
                    src={crypto.iconUrl}
                    alt={crypto.symbol}
                    className="w-8 h-8 rounded-full"
                    width={32}
                    height={32}
                    onError={(e) => {
                      console.log(`Image failed to load for ${crypto.symbol}: ${crypto.iconUrl}`);
                      e.currentTarget.src = 'https://s2.coinmarketcap.com/static/img/coins/32x32/1.png';
                    }}
                  />
                </div>
                <div className="mb-1">
                  <div className="text-gray-900 dark:text-white font-bold text-xs">
                    {crypto.symbol}
                  </div>
                </div>
                <div className="text-gray-900 dark:text-white font-semibold text-xs mb-1">
                  ${crypto.price}
                </div>
                <div
                  className={`px-1 py-0.5 rounded-full text-xs font-medium ${
                    crypto.percentChange >= 0
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {crypto.percentChange >= 0 ? "+" : ""}
                  {crypto.percentChange.toFixed(2)}%
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Trending;
