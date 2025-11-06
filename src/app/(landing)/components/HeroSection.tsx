"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Globe,
  Play,
  Shield,
  TrendingUp,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import FastCryptoIcon from "./FastCryptoIcon";

const HeroSection = () => {
  const [email, setEmail] = useState("");
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Simplified - no context dependencies needed

  const mainText = "Arbify AI";

  // Updated crypto pairs with real symbols for API integration
  const cryptoPairs = [
    {
      pair: "BTC/USDT",
      symbol: "BTC",
      buyExchange: "Binance",
      sellExchange: "Kraken",
      buyPrice: "$43,250",
      sellPrice: "$44,635",
      profit: "+3.2%",
      profitUsd: "+$1,385",
      color: "from-orange-500 to-yellow-500",
      bgColor: "bg-primary-gold",
    },
    {
      pair: "ETH/USDT",
      symbol: "ETH",
      buyExchange: "Coinbase",
      sellExchange: "Bitfinex",
      buyPrice: "$2,680",
      sellPrice: "$2,725",
      profit: "+1.7%",
      profitUsd: "+$45",
      color: "from-blue-500 to-purple-500",
      bgColor: "bg-accent-teal",
    },
    {
      pair: "SOL/USDT",
      symbol: "SOL",
      buyExchange: "KuCoin",
      sellExchange: "Huobi",
      buyPrice: "$98.45",
      sellPrice: "$100.20",
      profit: "+1.8%",
      profitUsd: "+$1.75",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-accent-orange",
    },
    {
      pair: "ADA/USDT",
      symbol: "ADA",
      buyExchange: "Kraken",
      sellExchange: "Binance",
      buyPrice: "$0.485",
      sellPrice: "$0.494",
      profit: "+1.9%",
      profitUsd: "+$0.009",
      color: "from-blue-600 to-cyan-500",
      bgColor: "bg-accent-teal",
    },
    {
      pair: "MATIC/USDT",
      symbol: "MATIC",
      buyExchange: "Bitfinex",
      sellExchange: "KuCoin",
      buyPrice: "$0.825",
      sellPrice: "$0.841",
      profit: "+1.9%",
      profitUsd: "+$0.016",
      color: "from-purple-600 to-blue-600",
      bgColor: "bg-primary-gold",
    },
  ];

  const stats = [
    {
      value: "$2.4B+",
      label: "Trading Volume",
      icon: BarChart3,
      color: "text-primary-gold",
    },
    {
      value: "150K+",
      label: "Active Traders",
      icon: Globe,
      color: "text-accent-teal",
    },
    {
      value: "25+",
      label: "Global Exchanges",
      icon: Building2,
      color: "text-accent-orange",
    },
    {
      value: "99.98%",
      label: "System Uptime",
      icon: Shield,
      color: "text-success",
    },
  ];

  const tradingMetrics = [
    { label: "Average Profit Margin", value: "2.8%", trend: "+0.3%" },
    { label: "Execution Speed", value: "47ms", trend: "-12ms" },
    { label: "Success Rate", value: "94.7%", trend: "+1.2%" },
  ];

  // Typewriter effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isTyping && displayedText.length < mainText.length) {
      timeout = setTimeout(() => {
        setDisplayedText(mainText.slice(0, displayedText.length + 1));
      }, 100);
    } else if (displayedText.length === mainText.length) {
      setIsTyping(false);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isTyping, mainText]);

  // Rotate crypto pairs
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPairIndex((prev) => (prev + 1) % cryptoPairs.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [cryptoPairs.length]);

  const currentPair = cryptoPairs[currentPairIndex];

  // Real-time status indicator
  const renderConnectionStatus = () => {
    const statusConfig = {
      connected: {
        icon: Wifi,
        text: "Real-time Data",
        color: "text-success",
        bgColor: "bg-success/10",
      },
      connecting: {
        icon: Wifi,
        text: "Connecting...",
        color: "text-yellow-400",
        bgColor: "bg-yellow-400/10",
      },
      disconnected: {
        icon: WifiOff,
        text: "Offline Mode",
        color: "text-gray-400",
        bgColor: "bg-gray-400/10",
      },
    };

    const config = statusConfig["connected"]; // Always show as connected for fast component
    const Icon = config.icon;

    return (
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor}`}
      >
        <Icon className={`w-3 h-3 ${config.color}`} />
        <span className={`text-xs font-medium ${config.color}`}>
          {config.text}
        </span>
      </div>
    );
  };

  return (
    <section className="relative min-h-screen bg-dark overflow-hidden flex flex-col">
      {/* Professional Background Grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#374151_1px,transparent_1px),linear-gradient(to_bottom,#374151_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-gold/5 via-transparent to-accent-teal/5"></div>
      </div>

      {/* Floating Geometric Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute top-20 right-20 w-32 h-32 border border-primary-gold/20 rounded-full"
        />
        <motion.div
          animate={{
            rotate: -360,
            y: [0, -20, 0],
          }}
          transition={{
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute bottom-32 left-16 w-24 h-24 border border-accent-teal/20 rotate-45"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/4 w-2 h-2 bg-accent-teal rounded-full"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center pt-20 pb-16">
        <div className="container mx-auto px-6 w-full">
          {/* Mobile Layout */}
          <div className="lg:hidden text-center space-y-8">
            {/* Professional Badge with Real-time Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center gap-3"
            >
              <div className="inline-flex items-center gap-3 card-dark rounded-full px-6 py-3">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-light">
                  Institutional-Grade Trading Platform
                </span>
              </div>
              {renderConnectionStatus()}
            </motion.div>

            {/* Main Headline with Typewriter Effect */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="space-y-6"
            >
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {displayedText}
                </motion.span>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="inline-block w-1 h-12 bg-primary-gold ml-1"
                />
                <br />
                <motion.span
                  className="gradient-text"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.5 }}
                >
                  FROM CBA™
                </motion.span>
              </h1>
              <motion.p
                className="text-lg text-gray-light max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 2 }}
              >
                Deploy arbitrage bots across top exchanges, zero fees, pro-grade
                analytics. Execute profitable arbitrage trades with
                institutional precision.
              </motion.p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.2, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center justify-center gap-3"
              >
                Start Trading
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.4, ease: "easeOut" }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.5 + index * 0.1, duration: 0.6 }}
                  className="card-dark p-4 text-center"
                >
                  <stat.icon className={`w-6 h-6 ${stat.color} mb-2 mx-auto`} />
                  <div className="text-xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-dark text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="space-y-8"
              >
                {/* Professional Badge with Real-time Status */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                  className="flex flex-col gap-4"
                >
                  <div className="inline-flex items-center gap-3 card-dark rounded-full px-6 py-3 w-fit">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-light">
                      Institutional-Grade Trading Platform
                    </span>
                  </div>
                  {renderConnectionStatus()}
                </motion.div>

                {/* Main Headline with Typewriter Effect */}
                <div className="space-y-6">
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                    className="text-6xl xl:text-7xl font-bold text-white leading-[0.9] tracking-tight"
                  >
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    >
                      {displayedText}
                    </motion.span>
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="inline-block w-2 h-16 bg-primary-gold ml-2"
                    />
                    <br />
                    <motion.span
                      className="gradient-text"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 1.8 }}
                    >
                      FROM CBA™
                    </motion.span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.2, duration: 0.8, ease: "easeOut" }}
                    className="text-xl text-gray-light max-w-2xl leading-relaxed"
                  >
                    Deploy arbitrage bots across top exchanges, zero fees,
                    pro-grade analytics. Execute profitable arbitrage trades
                    with institutional precision and risk management.
                  </motion.p>
                </div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.4, duration: 0.8, ease: "easeOut" }}
                  className="flex items-center gap-6"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary flex items-center gap-3"
                  >
                    Start Trading
                    <ArrowRight className="w-6 h-6" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary flex items-center gap-3"
                  >
                    <Play className="w-6 h-6" />
                    Watch Demo
                  </motion.button>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.6, duration: 0.8, ease: "easeOut" }}
                  className="grid grid-cols-4 gap-6"
                >
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.8 + index * 0.1, duration: 0.6 }}
                      className="text-center group"
                    >
                      <stat.icon
                        className={`w-8 h-8 ${stat.color} mb-3 mx-auto group-hover:scale-110 transition-transform duration-300`}
                      />
                      <div className="text-2xl font-bold text-white mb-1">
                        {stat.value}
                      </div>
                      <div className="text-gray-dark text-sm group-hover:text-gray-light transition-colors duration-300">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right Content - Advanced Trading Dashboard with Rotating Pairs */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
                className="relative"
              >
                {/* Main Dashboard Card */}
                <div className="card-dark p-8 shadow-2xl">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-white">
                        Live Trading Dashboard
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                        <span className="text-success font-semibold text-sm">
                          Real-time Data
                        </span>
                      </div>
                    </div>

                    {/* Trading Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                      {tradingMetrics.map((metric, index) => (
                        <motion.div
                          key={metric.label}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                          className="bg-dark rounded-xl p-4 border border-gray-dark/30"
                        >
                          <div className="text-gray-dark text-xs mb-1">
                            {metric.label}
                          </div>
                          <div className="text-white font-bold text-lg">
                            {metric.value}
                          </div>
                          <div className="text-success text-xs font-medium">
                            {metric.trend}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Active Arbitrage Opportunity with Rotating Pairs and Real Icons */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentPairIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="bg-gradient-to-r from-dark-alt to-dark rounded-xl p-6 border border-primary-gold/20"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            {/* Real Crypto Icon */}
                            <motion.div
                              className="relative"
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <FastCryptoIcon
                                symbol={currentPair.symbol}
                                size={48}
                                className="rounded-xl shadow-lg"
                              />
                              {false && (
                                <div className="absolute inset-0 bg-black/20 rounded-xl animate-pulse" />
                              )}
                            </motion.div>
                            <div>
                              <div className="text-white font-bold text-lg">
                                {currentPair.pair}
                              </div>
                              <div className="text-gray-dark text-sm">
                                High-Probability Opportunity
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-success font-bold text-lg flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              {currentPair.profit}
                            </div>
                            <div className="text-gray-dark text-sm">
                              Profit Potential
                            </div>
                          </div>
                        </div>

                        {/* Exchange Comparison */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-dark-alt rounded-lg p-4 border border-gray-dark/30">
                            <div className="text-gray-dark text-xs mb-1">
                              Buy from
                            </div>
                            <div className="text-white font-bold text-sm">
                              {currentPair.buyExchange}
                            </div>
                            <div className="text-accent-teal font-semibold">
                              {currentPair.buyPrice}
                            </div>
                          </div>
                          <div className="bg-dark-alt rounded-lg p-4 border border-gray-dark/30">
                            <div className="text-gray-dark text-xs mb-1">
                              Sell to
                            </div>
                            <div className="text-white font-bold text-sm">
                              {currentPair.sellExchange}
                            </div>
                            <div className="text-success font-semibold">
                              {currentPair.sellPrice}
                            </div>
                          </div>
                        </div>

                        {/* Execute Button */}
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full btn-accent py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <Zap className="w-5 h-5" />
                          Execute Arbitrage Trade
                        </motion.button>
                      </motion.div>
                    </AnimatePresence>

                    {/* Performance Indicators */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-white font-bold text-lg">
                          12.7s
                        </div>
                        <div className="text-gray-dark text-sm">
                          Avg Execution Time
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold text-lg">
                          $0.32
                        </div>
                        <div className="text-gray-dark text-sm">
                          Network Fee
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Performance Cards */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-4 -right-4 card-dark p-4 shadow-lg"
                >
                  <div className="text-center">
                    <div className="text-success font-bold text-lg">
                      +$2,847
                    </div>
                    <div className="text-gray-dark text-xs">24h Profit</div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [5, -5, 5] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -bottom-4 -left-4 card-dark p-4 shadow-lg"
                >
                  <div className="text-center">
                    <div className="text-accent-teal font-bold text-lg">
                      25+
                    </div>
                    <div className="text-gray-dark text-xs">
                      Connected Exchanges
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Explore Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3, duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center pb-8"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 cursor-pointer group"
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight,
              behavior: "smooth",
            });
          }}
        >
          <span className="text-gray-dark text-sm font-medium group-hover:text-primary-gold transition-colors duration-300">
            Explore Platform Features
          </span>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-8 h-8 rounded-full border-2 border-gray-dark/50 flex items-center justify-center group-hover:border-primary-gold/60 transition-colors duration-300"
          >
            <ArrowRight className="w-4 h-4 text-primary-gold rotate-90" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
