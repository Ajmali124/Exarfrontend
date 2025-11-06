"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Orderbook from "./_component/orderbook";
import TradingPairInfo from "./_component/trading-pair-info";
import PriceChart from "./_component/price-chart";

const ArbifyPage = () => {
  const searchParams = useSearchParams();
  const [selectedCrypto, setSelectedCrypto] = useState("BTC/USDT");

  useEffect(() => {
    const pair = searchParams.get("pair");
    if (pair) {
      setSelectedCrypto(pair);
    }
  }, [searchParams]);

  return (
    <div className="p-2 md:p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto mt-10 space-y-4">
        <TradingPairInfo
          selectedCrypto={selectedCrypto}
          onCryptoSelect={setSelectedCrypto}
        />
        <PriceChart symbol={selectedCrypto} />
        <Orderbook selectedCrypto={selectedCrypto} />
      </div>
    </div>
  );
};

export default ArbifyPage;