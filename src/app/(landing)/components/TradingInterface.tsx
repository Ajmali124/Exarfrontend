"use client";

import { useEffect, useState } from "react";

interface TradingInterfaceProps {
  currentSection: number;
}

// Invest Section Component
const InvestSection = () => (
  <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-8">
    {/* Left Side - Opportunity Text */}
    <div className="flex-1 max-w-lg mr-8">
      <div className="space-y-6 slide-in-left">
        <h2 className="text-4xl font-bold text-white leading-tight">
          Opportunity for
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Financial Growth
          </span>
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed">
          Start your investment journey with our comprehensive trading platform.
          Access global markets and build a diversified portfolio with ease.
        </p>
      </div>
    </div>

    {/* Center - Trading Interface Card */}
    <div className="flex-1 max-w-md mx-8">
      <div className="trading-card bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-900/50 rounded-lg p-1">
          {["Convert", "Spot", "Margin", "Fiat"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                tab === "Spot"
                  ? "bg-slate-700 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stock List */}
        <div className="space-y-3">
          {[
            {
              symbol: "GOOGL",
              company: "Alphabet Co.",
              price: "$2,350",
              change: "+0.81%",
              changeColor: "text-green-400",
            },
            {
              symbol: "TSLA",
              company: "Tesla",
              price: "$1208",
              change: "-0.61%",
              changeColor: "text-red-400",
            },
            {
              symbol: "AAPL",
              company: "Apple Pvt. Ltd.",
              price: "$3,420",
              change: "+0.81%",
              changeColor: "text-green-400",
            },
          ].map((stock, index) => (
            <div
              key={stock.symbol}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30 hover:bg-slate-900/50 transition-all duration-200 border border-slate-700/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm">
                  {stock.symbol.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">
                    {stock.symbol}
                  </div>
                  <div className="text-slate-400 text-xs">{stock.company}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold text-sm">
                  {stock.price}
                </div>
                <div className={`text-xs font-medium ${stock.changeColor}`}>
                  {stock.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Right Side - Investment Benefits */}
    <div className="flex-1 max-w-lg ml-8">
      <div className="space-y-6 slide-in-right">
        <h2 className="text-4xl font-bold text-white leading-tight">
          Start Your
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Investment Journey
          </span>
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed">
          Begin building your portfolio with our intuitive trading platform.
          Access thousands of stocks, ETFs, and investment opportunities.
        </p>
      </div>
    </div>
  </div>
);

// Maximum Section Component
const MaximizeSection = () => (
  <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-8">
    {/* Left Side - Maximize Text */}
    <div className="flex-1 max-w-lg mr-8">
      <div className="space-y-6 slide-in-left">
        <h2 className="text-4xl font-bold text-white leading-tight">
          Maximize Your
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Portfolio Returns
          </span>
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed">
          Optimize your investment strategy with advanced analytics and
          real-time market insights to maximize your returns.
        </p>
      </div>
    </div>

    {/* Center - Equity Balance Card */}
    <div className="flex-1 max-w-md mx-8">
      <div className="trading-card bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-md rounded-2xl border border-purple-500/30 p-6 shadow-2xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent"></div>

        {/* Equity Balance */}
        <div className="relative z-10 text-center mb-6">
          <div className="text-slate-400 text-sm uppercase tracking-wider mb-2">
            Equity Balance
          </div>
          <div className="text-4xl font-bold text-white mb-2">$09,965.01</div>
          <div className="text-green-400 font-semibold">+5.09%</div>
        </div>

        {/* Circular Progress */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            <svg
              className="w-24 h-24 transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-slate-700"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * 0.3}`}
                className="text-purple-400"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Trading Pairs */}
        <div className="space-y-3">
          {[
            {
              pair: "BTC/BUSD",
              amount: "0.49975/0.49975",
              price: "2652.00",
              status: "Filled",
              statusColor: "text-green-400",
            },
            {
              pair: "ETH/USDT",
              amount: "0.49975/0.49975",
              price: "1852.00",
              status: "Cancelled",
              statusColor: "text-red-400",
            },
            {
              pair: "ADA/BUSD",
              amount: "0.49975/0.49975",
              price: "0.452.00",
              status: "Filled",
              statusColor: "text-green-400",
            },
          ].map((trade, index) => (
            <div
              key={index}
              className="flex justify-between items-center text-sm"
            >
              <div>
                <div className="text-white font-medium">{trade.pair}</div>
                <div className="text-slate-400 text-xs">
                  Amount: {trade.amount}
                </div>
                <div className="text-slate-400 text-xs">
                  Price: {trade.price}
                </div>
              </div>
              <div className={`font-medium ${trade.statusColor}`}>
                {trade.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Right Side - Investment Freedom */}
    <div className="flex-1 max-w-lg ml-8">
      <div className="space-y-6 slide-in-right">
        <h2 className="text-4xl font-bold text-white leading-tight">
          Investment Freedom
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            with No Limits
          </span>
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed">
          One key advantage of a GIA is that there's no limit on how much you
          can invest, offering greater investment potential for serious
          investors.
        </p>
      </div>
    </div>
  </div>
);

// Earn Section Component
const EarnSection = () => (
  <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-8">
    {/* Left Side - Earn Text */}
    <div className="flex-1 max-w-lg mr-8">
      <div className="space-y-6 slide-in-left">
        <h2 className="text-4xl font-bold text-white leading-tight">
          Earn Consistent
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
            Returns Daily
          </span>
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed">
          Generate steady income through our diversified investment strategies
          and automated portfolio management systems.
        </p>
      </div>
    </div>

    {/* Center - SBUX Chart */}
    <div className="flex-1 max-w-md mx-8">
      <div className="trading-card bg-gradient-to-br from-green-900/40 to-purple-900/40 backdrop-blur-md rounded-2xl border border-green-500/30 p-6 shadow-2xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>

        {/* SBUX Header */}
        <div className="relative z-10 flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <div className="text-white font-bold">SBUX</div>
            <div className="text-slate-400 text-sm">Starbucks</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-white font-bold text-lg">$170.11</div>
            <div className="text-green-400 text-sm">+2.25% in last 7 days</div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="relative h-32 mb-6 bg-slate-900/30 rounded-lg p-4">
          <svg className="w-full h-full" viewBox="0 0 300 100">
            <defs>
              <linearGradient
                id="chartGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 80 Q 50 60 100 50 T 200 40 T 300 30"
              stroke="#10b981"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M 0 80 Q 50 60 100 50 T 200 40 T 300 30 L 300 100 L 0 100 Z"
              fill="url(#chartGradient)"
            />
          </svg>

          {/* Time Labels */}
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Time Period Buttons */}
        <div className="flex gap-2 mb-4">
          {["24H", "3D", "1W", "1M", "6M", "1Y"].map((period) => (
            <button
              key={period}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                period === "1W"
                  ? "bg-green-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Statistics */}
        <div className="space-y-2">
          <div className="text-slate-400 text-sm">Statistics</div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm">Previous Close</span>
            <span className="text-white text-sm">$168.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm">Opening Price</span>
            <span className="text-white text-sm">$169.50</span>
          </div>
        </div>
      </div>
    </div>

    {/* Right Side - Broad Range */}
    <div className="flex-1 max-w-lg ml-8">
      <div className="space-y-6 slide-in-right">
        <h2 className="text-4xl font-bold text-white leading-tight">
          Broad Range
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-400">
            of Investment
          </span>
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed">
          With thousands of investment options available, a GIA provides
          flexibility, making it ideal for expanding your portfolio outside of
          ISA and SIPP accounts.
        </p>
      </div>
    </div>
  </div>
);

// Main TradingInterface Component with 3D Card Flip (Center Only)
const TradingInterface = ({ currentSection }: TradingInterfaceProps) => {
  const [prevSection, setPrevSection] = useState(currentSection);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (currentSection !== prevSection) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setPrevSection(currentSection);
        setIsFlipping(false);
      }, 300); // Half of the flip duration

      return () => clearTimeout(timer);
    }
  }, [currentSection, prevSection]);

  const renderContent = (section: number) => {
    switch (section) {
      case 0:
        return <InvestSection />;
      case 1:
        return <MaximizeSection />;
      case 2:
        return <EarnSection />;
      default:
        return <InvestSection />;
    }
  };

  return (
    <div className="w-full">
      <div className="w-full">{renderContent(currentSection)}</div>

      <style jsx>{`
        .trading-card {
          min-height: 420px;
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          transition: transform 0.6s ease-in-out;
          transform-style: preserve-3d;
        }

        .trading-card:hover {
          transform: rotateY(5deg) rotateX(5deg);
        }

        .slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }

        .slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Card flip animation for center cards only */
        .trading-card {
          animation: ${isFlipping ? "cardFlip 0.6s ease-in-out" : "none"};
        }

        @keyframes cardFlip {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(90deg);
          }
          100% {
            transform: rotateY(0deg);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .trading-card {
            min-height: 380px;
            max-width: 350px;
          }
        }

        @media (max-width: 768px) {
          .trading-card {
            min-height: 340px;
            max-width: 300px;
          }
        }

        @media (max-width: 640px) {
          .slide-in-left,
          .slide-in-right {
            animation: fadeInUp 0.8s ease-out forwards;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }
      `}</style>
    </div>
  );
};

export default TradingInterface;
