"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Clock,
  DollarSign,
  Globe2,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

const CryptocurrenciesSection = () => {
  const cryptocurrencies = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      price: "$43,250.00",
      change: "+2.45%",
      changeValue: "+$1,032.50",
      volume: "$28.5B",
      marketCap: "$845.2B",
      isPositive: true,
      color: "from-orange-500 to-yellow-500",
      icon: "₿",
      arbitrageOpportunities: 12,
      avgSpread: "0.8%",
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      price: "$2,680.50",
      change: "+1.82%",
      changeValue: "+$48.20",
      volume: "$15.2B",
      marketCap: "$322.1B",
      isPositive: true,
      color: "from-blue-500 to-purple-500",
      icon: "Ξ",
      arbitrageOpportunities: 8,
      avgSpread: "0.6%",
    },
    {
      name: "Binance Coin",
      symbol: "BNB",
      price: "$315.75",
      change: "-0.95%",
      changeValue: "-$3.02",
      volume: "$1.8B",
      marketCap: "$48.7B",
      isPositive: false,
      color: "from-yellow-500 to-orange-500",
      icon: "B",
      arbitrageOpportunities: 6,
      avgSpread: "1.2%",
    },
    {
      name: "Cardano",
      symbol: "ADA",
      price: "$0.485",
      change: "+3.21%",
      changeValue: "+$0.015",
      volume: "$892M",
      marketCap: "$17.2B",
      isPositive: true,
      color: "from-blue-600 to-cyan-500",
      icon: "₳",
      arbitrageOpportunities: 4,
      avgSpread: "1.5%",
    },
    {
      name: "Solana",
      symbol: "SOL",
      price: "$98.45",
      change: "+5.67%",
      changeValue: "+$5.28",
      volume: "$2.1B",
      marketCap: "$42.8B",
      isPositive: true,
      color: "from-purple-500 to-pink-500",
      icon: "◎",
      arbitrageOpportunities: 7,
      avgSpread: "0.9%",
    },
    {
      name: "Polygon",
      symbol: "MATIC",
      price: "$0.825",
      change: "-1.23%",
      changeValue: "-$0.010",
      volume: "$456M",
      marketCap: "$7.6B",
      isPositive: false,
      color: "from-purple-600 to-blue-600",
      icon: "⬟",
      arbitrageOpportunities: 3,
      avgSpread: "2.1%",
    },
  ];

  const arbitrageOpportunities = [
    {
      pair: "BTC/USDT",
      buyExchange: "Binance",
      sellExchange: "Kraken",
      buyPrice: "$43,250",
      sellPrice: "$44,635",
      profit: "+3.2%",
      profitUsd: "+$1,385",
      volume: "$2.5M",
      timeLeft: "4m 32s",
      confidence: "High",
      riskLevel: "Low",
    },
    {
      pair: "ETH/USDT",
      buyExchange: "Coinbase",
      sellExchange: "Bitfinex",
      buyPrice: "$2,680",
      sellPrice: "$2,725",
      profit: "+1.7%",
      profitUsd: "+$45",
      volume: "$1.8M",
      timeLeft: "2m 15s",
      confidence: "Medium",
      riskLevel: "Low",
    },
    {
      pair: "SOL/USDT",
      buyExchange: "KuCoin",
      sellExchange: "Huobi",
      buyPrice: "$98.45",
      sellPrice: "$100.20",
      profit: "+1.8%",
      profitUsd: "+$1.75",
      volume: "$890K",
      timeLeft: "6m 48s",
      confidence: "High",
      riskLevel: "Medium",
    },
  ];

  const marketStats = [
    {
      label: "Total Market Cap",
      value: "$1.7T",
      change: "+2.4%",
      icon: Globe2,
    },
    {
      label: "24h Volume",
      value: "$89.2B",
      change: "+12.8%",
      icon: Activity,
    },
    {
      label: "Active Arbitrage Pairs",
      value: "1,247",
      change: "+156",
      icon: Target,
    },
    {
      label: "Avg Execution Time",
      value: "47ms",
      change: "-12ms",
      icon: Zap,
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-slate-800 via-gray-900 to-slate-900 relative overflow-hidden">
      {/* Sophisticated Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#374151_1px,transparent_1px),linear-gradient(to_bottom,#374151_1px,transparent_1px)] bg-[size:6rem_6rem] opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#F0B90B0D] via-transparent to-[#00A3FF0D]"></div>
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
            className="inline-flex items-center gap-3 bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-full px-6 py-3 mb-8"
          >
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">
              Real-Time Market Intelligence
            </span>
          </motion.div>

          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            Advanced Market
            <br />
            <span className="bg-gradient-to-r from-[#F0B90B] via-[#00A3FF] to-[#00CED1] bg-clip-text text-transparent">
              Analytics & Arbitrage
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Harness institutional-grade market data and AI-powered arbitrage
            detection across 25+ global exchanges. Execute profitable trades
            with precision timing and risk management.
          </p>
        </motion.div>

        {/* Market Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-4 gap-6 mb-20"
        >
          {marketStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/30 rounded-xl p-6 group"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-emerald-400 text-sm font-medium">
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Cryptocurrencies Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-white mb-4 text-center">
            Top Performing Assets
          </h3>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Real-time price data with arbitrage opportunity analysis across
            major cryptocurrency pairs
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cryptocurrencies.map((crypto, index) => (
              <motion.div
                key={crypto.symbol}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/30 rounded-xl p-6 group hover:border-slate-600/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${crypto.color} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                    >
                      {crypto.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors duration-300">
                        {crypto.name}
                      </h4>
                      <p className="text-slate-400 text-sm">{crypto.symbol}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors duration-300" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">
                      {crypto.price}
                    </span>
                    <div
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                        crypto.isPositive
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {crypto.isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span className="text-sm font-semibold">
                        {crypto.change}
                      </span>
                    </div>
                  </div>

                  <div className="text-slate-400 text-sm">
                    {crypto.changeValue} (24h)
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/30">
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Volume</div>
                      <div className="text-white text-sm font-semibold">
                        {crypto.volume}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">
                        Market Cap
                      </div>
                      <div className="text-white text-sm font-semibold">
                        {crypto.marketCap}
                      </div>
                    </div>
                  </div>

                  {/* Arbitrage Info */}
                  <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-600/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-blue-400 text-sm font-medium">
                          {crypto.arbitrageOpportunities} Opportunities
                        </div>
                        <div className="text-slate-400 text-xs">
                          Avg Spread: {crypto.avgSpread}
                        </div>
                      </div>
                      <Target className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Live Arbitrage Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold text-white mb-4 text-center">
            High-Probability Arbitrage Opportunities
          </h3>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            AI-powered opportunity detection with real-time execution
            capabilities and risk assessment
          </p>
          <div className="space-y-6">
            {arbitrageOpportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity.pair}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.01, y: -2 }}
                className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/30 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="grid md:grid-cols-7 gap-6 items-center">
                  {/* Trading Pair */}
                  <div className="md:col-span-1">
                    <div className="text-white font-bold text-lg mb-1">
                      {opportunity.pair}
                    </div>
                    <div className="text-slate-400 text-sm">Trading Pair</div>
                  </div>

                  {/* Buy Exchange */}
                  <div className="md:col-span-1">
                    <div className="text-blue-400 font-semibold mb-1">
                      {opportunity.buyExchange}
                    </div>
                    <div className="text-white text-sm font-medium">
                      {opportunity.buyPrice}
                    </div>
                    <div className="text-slate-400 text-xs">Buy Price</div>
                  </div>

                  {/* Sell Exchange */}
                  <div className="md:col-span-1">
                    <div className="text-emerald-400 font-semibold mb-1">
                      {opportunity.sellExchange}
                    </div>
                    <div className="text-white text-sm font-medium">
                      {opportunity.sellPrice}
                    </div>
                    <div className="text-slate-400 text-xs">Sell Price</div>
                  </div>

                  {/* Profit */}
                  <div className="md:col-span-1">
                    <div className="text-emerald-400 font-bold text-lg mb-1">
                      {opportunity.profit}
                    </div>
                    <div className="text-emerald-400 text-sm font-medium">
                      {opportunity.profitUsd}
                    </div>
                    <div className="text-slate-400 text-xs">Profit</div>
                  </div>

                  {/* Risk & Confidence */}
                  <div className="md:col-span-1">
                    <div
                      className={`text-sm font-medium mb-1 ${
                        opportunity.confidence === "High"
                          ? "text-emerald-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {opportunity.confidence}
                    </div>
                    <div
                      className={`text-xs ${
                        opportunity.riskLevel === "Low"
                          ? "text-emerald-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {opportunity.riskLevel} Risk
                    </div>
                    <div className="text-slate-400 text-xs">Assessment</div>
                  </div>

                  {/* Volume & Time */}
                  <div className="md:col-span-1">
                    <div className="text-white text-sm font-medium mb-1">
                      {opportunity.volume}
                    </div>
                    <div className="flex items-center gap-1 text-orange-400 text-xs">
                      <Clock className="w-3 h-3" />
                      {opportunity.timeLeft}
                    </div>
                    <div className="text-slate-400 text-xs">Volume</div>
                  </div>

                  {/* Action */}
                  <div className="md:col-span-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-gradient-to-r from-[#F0B90B] to-[#D1A10A] hover:from-[#D1A10A] hover:to-[#B28908] text-black font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Execute
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-12">
            <h3 className="text-4xl font-bold text-white mb-6">
              Start Professional Trading Today
            </h3>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Join institutional traders using our advanced arbitrage platform.
              Access real-time market data, AI-powered opportunity detection,
              and automated execution.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#F0B90B] to-[#D1A10A] hover:from-[#D1A10A] hover:to-[#B28908] text-black font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <BarChart3 className="w-6 h-6" />
                Access Live Markets
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:bg-slate-700/60 flex items-center justify-center gap-3"
              >
                <TrendingUp className="w-6 h-6" />
                View Platform Demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CryptocurrenciesSection;
