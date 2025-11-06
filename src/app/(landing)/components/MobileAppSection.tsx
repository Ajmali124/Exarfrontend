"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Clock,
  Download,
  Play,
  Shield,
  Smartphone,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const MobileAppSection = () => {
  const [currentPairIndex, setCurrentPairIndex] = useState(0);

  const cryptoPairs = [
    {
      pair: "BTC/USDT",
      buyExchange: "Binance",
      sellExchange: "Kraken",
      buyPrice: "$43,250",
      sellPrice: "$44,290",
      profit: "+2.4%",
      profitUsd: "+$1,040",
      icon: "₿",
      color: "from-orange-500 to-yellow-500",
      bgColor: "bg-warning",
    },
    {
      pair: "ETH/USDT",
      buyExchange: "Coinbase",
      sellExchange: "Bitfinex",
      buyPrice: "$2,680",
      sellPrice: "$2,725",
      profit: "+1.7%",
      profitUsd: "+$45",
      icon: "Ξ",
      color: "from-blue-500 to-purple-500",
      bgColor: "bg-primary",
    },
    {
      pair: "SOL/USDT",
      buyExchange: "KuCoin",
      sellExchange: "Huobi",
      buyPrice: "$98.45",
      sellPrice: "$100.20",
      profit: "+1.8%",
      profitUsd: "+$1.75",
      icon: "◎",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-indigo-600",
    },
    {
      pair: "ADA/USDT",
      buyExchange: "Kraken",
      sellExchange: "Binance",
      buyPrice: "$0.485",
      sellPrice: "$0.494",
      profit: "+1.9%",
      profitUsd: "+$0.009",
      icon: "₳",
      color: "from-blue-600 to-cyan-500",
      bgColor: "bg-slate-600",
    },
    {
      pair: "MATIC/USDT",
      buyExchange: "Bitfinex",
      sellExchange: "KuCoin",
      buyPrice: "$0.825",
      sellPrice: "$0.841",
      profit: "+1.9%",
      profitUsd: "+$0.016",
      icon: "⬟",
      color: "from-purple-600 to-blue-600",
      bgColor: "bg-emerald-600",
    },
  ];

  const features = [
    {
      icon: TrendingUp,
      title: "Real-Time Arbitrage",
      description:
        "Monitor live arbitrage opportunities across 20+ exchanges with instant notifications",
      color: "bg-primary",
    },
    {
      icon: Zap,
      title: "Instant Execution",
      description:
        "Execute trades in milliseconds with our lightning-fast mobile trading engine",
      color: "bg-success",
    },
    {
      icon: BarChart3,
      title: "Profit Tracking",
      description:
        "Track your arbitrage profits with detailed analytics and performance insights",
      color: "bg-warning",
    },
    {
      icon: Shield,
      title: "Secure Trading",
      description:
        "Bank-level security with biometric authentication and encrypted transactions",
      color: "bg-slate-600",
    },
    {
      icon: Clock,
      title: "24/7 Monitoring",
      description:
        "Never miss an opportunity with round-the-clock market surveillance",
      color: "bg-indigo-600",
    },
    {
      icon: Smartphone,
      title: "Mobile First",
      description:
        "Designed for mobile with intuitive interface and seamless user experience",
      color: "bg-emerald-600",
    },
  ];

  const stats = [
    { value: "20+", label: "Integrated Exchanges", icon: "🏢" },
    { value: "1,000+", label: "Trading Pairs", icon: "💱" },
    { value: "99.9%", label: "Uptime", icon: "⚡" },
    { value: "<100ms", label: "Execution Speed", icon: "🚀" },
  ];

  // Rotate crypto pairs
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPairIndex((prev) => (prev + 1) % cryptoPairs.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [cryptoPairs.length]);

  const currentPair = cryptoPairs[currentPairIndex];

  return (
    <section className="py-24 bg-gradient-primary relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/2 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 glass-card px-6 py-3 mb-8"
          >
            <Smartphone className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">
              Mobile Trading App
            </span>
          </motion.div>

          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            Trade Arbitrage
            <br />
            <span className="gradient-text">On The Go</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience the power of arbitrage trading in your pocket. Our mobile
            app brings professional-grade trading tools to your smartphone with
            real-time opportunities and instant execution.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content - Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="glass-card p-6 group"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-primary transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="glass-card p-8"
            >
              <h3 className="text-2xl font-bold gradient-text mb-8 text-center">
                App Performance
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center group"
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold gradient-text mb-1">
                      {stat.value}
                    </div>
                    <div className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Phone Frame */}
            <div className="relative mx-auto w-80 h-[640px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-4 shadow-2xl">
              {/* Screen */}
              <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative">
                {/* Status Bar */}
                <div className="flex justify-between items-center px-6 py-3 bg-gray-900">
                  <span className="text-white text-sm font-semibold">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-2 bg-white rounded-sm"></div>
                    <div className="w-6 h-3 border border-white rounded-sm">
                      <div className="w-4 h-full bg-white rounded-sm"></div>
                    </div>
                  </div>
                </div>

                {/* App Content */}
                <div className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="w-20 h-8 relative">
                      <Image
                        src="/logo.svg"
                        alt="CBA Exchange Logo"
                        fill
                        className="object-contain"
                        sizes="80px"
                      />
                    </div>
                    <p className="text-gray-400 text-sm">Arbitrage Trading</p>
                  </div>

                  {/* Live Opportunity Card with Rotating Pairs */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPairIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white/5 rounded-2xl p-4 border border-primary/20"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 ${currentPair.bgColor} rounded-lg flex items-center justify-center`}
                          >
                            <span className="text-white text-xs font-bold">
                              {currentPair.icon}
                            </span>
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm">
                              {currentPair.pair}
                            </div>
                            <div className="text-gray-400 text-xs">
                              Live Opportunity
                            </div>
                          </div>
                        </div>
                        <div className="text-success font-bold text-sm flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {currentPair.profit}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-gray-400 text-xs">Buy</div>
                          <div className="text-white text-xs font-semibold">
                            {currentPair.buyExchange}
                          </div>
                          <div className="text-primary text-xs">
                            {currentPair.buyPrice}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-gray-400 text-xs">Sell</div>
                          <div className="text-white text-xs font-semibold">
                            {currentPair.sellExchange}
                          </div>
                          <div className="text-success text-xs">
                            {currentPair.sellPrice}
                          </div>
                        </div>
                      </div>
                      <button className="w-full bg-primary text-white py-2 rounded-lg text-sm font-semibold">
                        Execute Trade
                      </button>
                    </motion.div>
                  </AnimatePresence>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <div className="text-success font-bold text-lg">
                        +$1,240
                      </div>
                      <div className="text-gray-400 text-xs">
                        Today's Profit
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <div className="text-primary font-bold text-lg">
                        14.3s
                      </div>
                      <div className="text-gray-400 text-xs">Avg Execution</div>
                    </div>
                  </div>

                  {/* Bottom Navigation */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/10 rounded-2xl p-3">
                    <div className="flex justify-around">
                      <div className="text-primary text-xs font-semibold">
                        Trade
                      </div>
                      <div className="text-gray-400 text-xs">Portfolio</div>
                      <div className="text-gray-400 text-xs">Markets</div>
                      <div className="text-gray-400 text-xs">Profile</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 glass-card p-4"
            >
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-warning fill-warning" />
                <div>
                  <div className="text-white font-bold text-sm">4.9</div>
                  <div className="text-gray-400 text-xs">App Rating</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -right-6 glass-card p-4"
            >
              <div className="text-center">
                <div className="gradient-text font-bold text-lg">50K+</div>
                <div className="text-gray-400 text-xs">Downloads</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Download Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="glass-card p-12 border border-primary/20">
            <h3 className="text-4xl font-bold gradient-text mb-6">
              Download CBA Exchange Mobile App
            </h3>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Start your arbitrage trading journey today. Available on iOS and
              Android with all the features you need to maximize your profits.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="btn-accent flex items-center justify-center gap-3"
              >
                <Download className="w-6 h-6" />
                Download for iOS
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary flex items-center justify-center gap-3"
              >
                <Download className="w-6 h-6" />
                Download for Android
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6" />
                Watch Demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MobileAppSection;
