import {
  getPriceGainer,
  getPriceLoser,
  getTopMarketData,
} from "@/CryptoThings/interface/get_Price";
import CryptoItem from "./cryptoitems";

export const Trending = async () => {
  const trendingdata = await getTopMarketData();
  return (
    <div className="space-y-2">
      {trendingdata.map((crypto: any, index: any) => (
        <CryptoItem
          key={index}
          index={index}
          tokenId={crypto.id}
          model={trendingdata}
          finalPrice={crypto.quotes[0].price}
          percentChange={crypto.quotes[0].percentChange24h}
        />
      ))}
    </div>
  );
};

export const Gainers = async () => {
  const gainerdata = await getPriceGainer();
  return (
    <div className="space-y-2">
      {gainerdata.map((crypto: any, index: any) => (
        <CryptoItem
          key={index}
          index={index}
          tokenId={crypto.id}
          model={gainerdata}
          finalPrice={crypto.quotes[0].price}
          percentChange={crypto.quotes[0].percentChange24h}
        />
      ))}
    </div>
  );
};

export const Losers = async () => {
  const loserdata = await getPriceLoser();
  return (
    <div className="space-y-2">
      {loserdata.map((crypto: any, index: any) => (
        <CryptoItem
          key={index}
          index={index}
          tokenId={crypto.id}
          model={loserdata}
          finalPrice={crypto.quotes[0].price}
          percentChange={crypto.quotes[0].percentChange24h}
        />
      ))}
    </div>
  );
};
