"use client";

import { motion } from "framer-motion";
import { Building2, TrendingUp } from "lucide-react";
import Image from "next/image";

const ExchangesSection = () => {
  const exchanges = [
    { name: "Binance", logo: "/exchangelogo/binance.png" },
    { name: "Bybit", logo: "/exchangelogo/Bybit.png" },
    { name: "OKX", logo: "/exchangelogo/OKX.png" },
    { name: "Coinbase", logo: "/exchangelogo/coinbase.png" },
    { name: "Kraken", logo: "/exchangelogo/kraken.png" },
    { name: "HTX", logo: "/exchangelogo/HTX.png" },
    { name: "KuCoin", logo: "/exchangelogo/KuKoin.png" },
    { name: "Gate.io", logo: "/exchangelogo/GateIO.png" },
    { name: "Bitget", logo: "/exchangelogo/bitget.png" },
    { name: "MEXC", logo: "/exchangelogo/mexc.png" },
    { name: "Bitfinex", logo: "/exchangelogo/Bitfinex.png" },
    { name: "Crypto.com", logo: "/exchangelogo/crypto.png" },
    { name: "BingX", logo: "/exchangelogo/BINGX.png" },
    { name: "Bitmart", logo: "/exchangelogo/bitmart.png" },
    { name: "LBank", logo: "/exchangelogo/lbank.png" },
    { name: "XT", logo: "/exchangelogo/xt.png" },
    { name: "Upbit", logo: "/exchangelogo/upbit.png" },
    { name: "Gemini", logo: "/exchangelogo/Gemini.png" },
    { name: "Azbit", logo: "/exchangelogo/azbit.png" },
    { name: "Orange", logo: "/exchangelogo/orange.png" },
  ];

  // Duplicate exchanges for seamless loop
  const duplicatedExchanges = [...exchanges, ...exchanges];

  const stats = [
    { value: "1000+", label: "Market Pairs", icon: "💱" },
    { value: "2000+", label: "Cryptocurrencies", icon: "₿" },
    { value: "20+", label: "Exchanges", icon: "🏢" },
  ];

  return (
    <section className="py-24 bg-gradient-secondary relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/3 rounded-full blur-3xl"></div>
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
            <Building2 className="w-5 h-5 text-accent" />
            <span className="text-sm font-semibold text-accent">
              Integrated Exchanges
            </span>
          </motion.div>

          <h2 className="text-5xl lg:text-6xl font-bold text-primary mb-8 leading-tight">
            Connected to
            <br />
            <span className="gradient-text">Top Exchanges</span>
          </h2>
          <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
            Access liquidity from the world's leading cryptocurrency exchanges.
            Our platform seamlessly integrates with 20+ major exchanges for
            optimal arbitrage opportunities.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative mb-20"
        >
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg-secondary to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg-secondary to-transparent z-10"></div>

          {/* Carousel Track */}
          <div className="overflow-hidden">
            <motion.div
              className="flex items-center gap-8 md:gap-12"
              animate={{
                x: [0, -50 * exchanges.length],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 40,
                  ease: "linear",
                },
              }}
              style={{ width: `${100 * exchanges.length}px` }}
            >
              {duplicatedExchanges.map((exchange, index) => (
                <motion.div
                  key={`${exchange.name}-${index}`}
                  className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 relative group"
                  whileHover={{ scale: 1.1, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-full h-full glass-card p-3 md:p-4 flex items-center justify-center group-hover:border-accent transition-all duration-300">
                    <Image
                      src={exchange.logo}
                      alt={`${exchange.name} logo`}
                      fill
                      className="object-contain p-1"
                      sizes="80px"
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="stats-card group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="text-4xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-secondary group-hover:text-accent transition-colors duration-300">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="glass-card p-12 border border-accent/20">
            <h3 className="text-4xl font-bold gradient-text mb-6">
              Start Trading Across All Exchanges
            </h3>
            <p className="text-xl text-secondary mb-10 max-w-2xl mx-auto">
              Access the deepest liquidity pools and discover profitable
              arbitrage opportunities across our integrated exchange network.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center justify-center gap-3"
              >
                <TrendingUp className="w-6 h-6" />
                Explore Opportunities
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary flex items-center justify-center gap-3"
              >
                <Building2 className="w-6 h-6" />
                View All Exchanges
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExchangesSection;
