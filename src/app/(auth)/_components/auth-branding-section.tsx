"use client";

import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import Image from "next/image";

export function AuthBrandingSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // All 24 exchange logos
  const exchanges = [
    { name: "Binance", logo: "/exchange-logos/binance.png" },
    { name: "Bybit", logo: "/exchange-logos/bybit.png" },
    { name: "OKX", logo: "/exchange-logos/okx.png" },
    { name: "Coinbase", logo: "/exchange-logos/coinbase.png" },
    { name: "KuCoin", logo: "/exchange-logos/kucoin.png" },
    { name: "Gate.io", logo: "/exchange-logos/gate.png" },
    { name: "Bitget", logo: "/exchange-logos/bitget.png" },
    { name: "BingX", logo: "/exchange-logos/bingx.png" },
    { name: "Bitmart", logo: "/exchange-logos/bitmart.png" },
    { name: "HTX", logo: "/exchange-logos/htx.png" },
    { name: "LBank", logo: "/exchange-logos/lbank.png" },
    { name: "XT", logo: "/exchange-logos/xt.png" },
    { name: "Upbit", logo: "/exchange-logos/upbit.png" },
    { name: "Bequant", logo: "/exchange-logos/bequant.png" },
    { name: "BitoPro", logo: "/exchange-logos/bitopro.png" },
    { name: "Blockchain.com", logo: "/exchange-logos/blockchaincom.png" },
    { name: "Deribit", logo: "/exchange-logos/deribit.png" },
    { name: "HashKey", logo: "/exchange-logos/hashkey.png" },
    { name: "P2B", logo: "/exchange-logos/p2b.png" },
    { name: "Phemex", logo: "/exchange-logos/phemex.png" },
    { name: "Poloniex", logo: "/exchange-logos/poloniex.png" },
    { name: "Probit", logo: "/exchange-logos/probit.png" },
    { name: "WhiteBIT", logo: "/exchange-logos/whitebit.png" },
    { name: "WOO", logo: "/exchange-logos/woo.png" },
  ];

  // Duplicate for seamless scroll
  const duplicatedExchanges = [...exchanges, ...exchanges];

  return (
    <div className="hidden lg:flex flex-col justify-center space-y-8 px-4">
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className={`text-4xl lg:text-5xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Crypto Arbitrage
            <br />
            <span className={`${
              isDark 
                ? "bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent"
            }`}>
              Exchange Platform
            </span>
          </h1>
          <p className={`text-lg ${
            isDark ? "text-white/70" : "text-gray-600"
          }`}>
            Discover price differences across exchanges and maximize your profits with automated arbitrage trading.
          </p>
        </div>

        {/* Features List */}
        <div className="space-y-4 pt-4">
          <div className="flex items-start gap-3">
            <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center ${
              isDark 
                ? "bg-purple-500/20 border border-purple-500/30"
                : "bg-green-500/20 border border-green-500/30"
            }`}>
              <svg className={`w-4 h-4 ${
                isDark ? "text-purple-400" : "text-green-600"
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className={`font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                Multi-Exchange Trading
              </h3>
              <p className={`text-sm ${
                isDark ? "text-white/60" : "text-gray-600"
              }`}>
                Trade across 30+ exchanges simultaneously
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center ${
              isDark 
                ? "bg-purple-500/20 border border-purple-500/30"
                : "bg-green-500/20 border border-green-500/30"
            }`}>
              <svg className={`w-4 h-4 ${
                isDark ? "text-purple-400" : "text-green-600"
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className={`font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                Real-Time Price Monitoring
              </h3>
              <p className={`text-sm ${
                isDark ? "text-white/60" : "text-gray-600"
              }`}>
                Instant alerts for arbitrage opportunities
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center ${
              isDark 
                ? "bg-purple-500/20 border border-purple-500/30"
                : "bg-green-500/20 border border-green-500/30"
            }`}>
              <svg className={`w-4 h-4 ${
                isDark ? "text-purple-400" : "text-green-600"
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className={`font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                Automated Execution
              </h3>
              <p className={`text-sm ${
                isDark ? "text-white/60" : "text-gray-600"
              }`}>
                Smart bots execute trades at optimal prices
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center ${
              isDark 
                ? "bg-purple-500/20 border border-purple-500/30"
                : "bg-green-500/20 border border-green-500/30"
            }`}>
              <svg className={`w-4 h-4 ${
                isDark ? "text-purple-400" : "text-green-600"
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className={`font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                Secure & Fast
              </h3>
              <p className={`text-sm ${
                isDark ? "text-white/60" : "text-gray-600"
              }`}>
                Enterprise-grade security with lightning-fast execution
              </p>
            </div>
          </div>
        </div>

        {/* Exchange Logos Scrolling */}
        <div className="pt-6">
          <p className={`text-sm mb-4 ${
            isDark ? "text-white/50" : "text-gray-500"
          }`}>
            Supported Exchanges
          </p>
          
          {/* Scrolling Container */}
          <div className="relative overflow-hidden">
            {/* Gradient Fade - Left */}
            <div className={`absolute left-0 top-0 bottom-0 w-12 z-10 ${
              isDark 
                ? "bg-gradient-to-r from-black to-transparent" 
                : "bg-gradient-to-r from-white to-transparent"
            }`} />
            
            {/* Gradient Fade - Right */}
            <div className={`absolute right-0 top-0 bottom-0 w-12 z-10 ${
              isDark 
                ? "bg-gradient-to-l from-black to-transparent" 
                : "bg-gradient-to-l from-white to-transparent"
            }`} />

            {/* Scrolling Track */}
            <div className="overflow-hidden">
              <motion.div
                className="flex items-center gap-6"
                animate={{
                  x: [0, -(48 + 24) * exchanges.length], // width + gap * number of exchanges
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 30,
                    ease: "linear",
                  },
                }}
              >
                {duplicatedExchanges.map((exchange, index) => (
                  <motion.div
                    key={`${exchange.name}-${index}`}
                    className="flex-shrink-0 w-12 h-12 relative group"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`w-full h-full rounded-lg p-2 flex items-center justify-center ${
                      isDark
                        ? "bg-white/5 border border-white/10"
                        : "bg-gray-100 border border-gray-200"
                    } group-hover:border-opacity-40 transition-all duration-300`}>
                      <Image
                        src={exchange.logo}
                        alt={`${exchange.name} logo`}
                        width={40}
                        height={40}
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

