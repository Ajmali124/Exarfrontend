"use client";

import { motion } from "framer-motion";
import {
  ArrowUpDown,
  BarChart3,
  Bot,
  Clock,
  DollarSign,
  Globe,
  Lock,
  Smartphone,
  TrendingUp,
  Zap,
} from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: ArrowUpDown,
      title: "Arbitrage Trading",
      description:
        "Automatically identify and execute profitable arbitrage opportunities across multiple exchanges in real-time.",
      color: "bg-accent",
      features: ["Real-time scanning", "Auto execution", "Risk management"],
    },
    {
      icon: BarChart3,
      title: "Market Trading",
      description:
        "Advanced trading tools with professional charts, indicators, and order types for all skill levels.",
      color: "bg-success",
      features: [
        "Advanced charts",
        "Multiple order types",
        "Technical analysis",
      ],
    },
    {
      icon: Bot,
      title: "AI Trading Bots",
      description:
        "Deploy intelligent trading bots that learn from market patterns and execute trades 24/7.",
      color: "bg-warning",
      features: ["Machine learning", "24/7 trading", "Strategy optimization"],
    },
    {
      icon: Lock,
      title: "Secure Wallet",
      description:
        "Multi-signature cold storage with institutional-grade security for your digital assets.",
      color: "bg-primary",
      features: ["Multi-sig security", "Cold storage", "Insurance coverage"],
    },
    {
      icon: Globe,
      title: "Global Access",
      description:
        "Trade on 20+ major exchanges worldwide with unified liquidity and best execution.",
      color: "bg-indigo-600",
      features: ["20+ exchanges", "Global liquidity", "Best execution"],
    },
    {
      icon: Smartphone,
      title: "Mobile Trading",
      description:
        "Full-featured mobile app with all desktop capabilities for trading on the go.",
      color: "bg-emerald-600",
      features: ["Native mobile app", "Full features", "Push notifications"],
    },
  ];

  const tradingProcess = [
    {
      step: "01",
      title: "Connect Exchanges",
      description: "Link your exchange accounts securely with API keys",
      icon: Globe,
      color: "bg-accent",
    },
    {
      step: "02",
      title: "Set Parameters",
      description: "Configure your trading preferences and risk tolerance",
      icon: BarChart3,
      color: "bg-success",
    },
    {
      step: "03",
      title: "Monitor Opportunities",
      description: "Our AI scans markets 24/7 for profitable trades",
      icon: Bot,
      color: "bg-warning",
    },
    {
      step: "04",
      title: "Execute Trades",
      description: "Automatic execution of profitable arbitrage opportunities",
      icon: Zap,
      color: "bg-primary",
    },
  ];

  return (
    <section className="py-32 bg-gradient-secondary relative overflow-hidden">
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
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-3 glass-card px-6 py-3 mb-8"
          >
            <TrendingUp className="w-5 h-5 text-accent" />
            <span className="text-sm font-semibold text-accent">
              Advanced Trading Platform
            </span>
          </motion.div>
          <h2 className="text-5xl lg:text-6xl font-bold text-primary mb-8 leading-tight">
            Everything You Need to
            <br />
            <span className="gradient-text">Trade Like a Pro</span>
          </h2>
          <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
            From arbitrage opportunities to advanced market analysis, our
            comprehensive platform provides all the tools you need for
            successful cryptocurrency trading.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.1,
                duration: 0.8,
                ease: "easeOut",
              }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="service-card group"
            >
              <div className="relative">
                {/* Icon */}
                <div
                  className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300`}
                >
                  <service.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-primary mb-4 group-hover:text-accent transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-secondary mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: index * 0.1 + featureIndex * 0.1,
                        duration: 0.5,
                      }}
                      className="flex items-center gap-3 text-secondary group-hover:text-primary transition-colors duration-300"
                    >
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span className="text-sm">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trading Process */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h3 className="text-4xl lg:text-5xl font-bold text-primary mb-8">
            How <span className="gradient-text">Arbitrage Trading</span> Works
          </h3>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            Get started with automated arbitrage trading in just four simple
            steps. Our platform handles the complexity while you enjoy the
            profits.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {tradingProcess.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.2,
                duration: 0.8,
                ease: "easeOut",
              }}
              className="relative"
            >
              {/* Connection Line */}
              {index < tradingProcess.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-accent/50 to-transparent z-0"></div>
              )}

              <div className="relative z-10 text-center group">
                {/* Step Number */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="inline-flex items-center justify-center w-24 h-24 glass-card mb-6 group-hover:border-accent/50 transition-all duration-300"
                >
                  <span className="text-3xl font-bold gradient-text">
                    {step.step}
                  </span>
                </motion.div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300`}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h4 className="text-xl font-bold text-primary mb-4 group-hover:text-accent transition-colors duration-300">
                  {step.title}
                </h4>
                <p className="text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center glass-card p-12 pulse-glow"
        >
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <Clock className="w-6 h-6 text-accent" />
              <span className="text-accent font-semibold">
                Limited Time Offer
              </span>
            </motion.div>

            <h3 className="text-4xl font-bold text-primary mb-6">
              Start Trading with{" "}
              <span className="gradient-text">Zero Fees</span>
            </h3>
            <p className="text-xl text-secondary mb-8">
              Join thousands of traders who are already profiting from arbitrage
              opportunities. Get started today with our 30-day free trial.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="btn-accent flex items-center justify-center gap-3"
              >
                <DollarSign className="w-5 h-5" />
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary flex items-center justify-center gap-3"
              >
                <BarChart3 className="w-5 h-5" />
                View Live Demo
              </motion.button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-primary/10">
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text mb-2">
                  $50M+
                </div>
                <div className="text-secondary text-sm">Trading Volume</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text mb-2">
                  10,000+
                </div>
                <div className="text-secondary text-sm">Active Traders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text mb-2">
                  99.9%
                </div>
                <div className="text-secondary text-sm">Uptime</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
