import { Skeleton } from "@/components/ui/skeleton";
import {
  removePercentDecimals,
  removePriceDecimals,
} from "@/CryptoThings/formater";
import { CryptoData } from "@/CryptoThings/interface/CryptoData";
import React from "react";
import { Card } from "./card";
import CustomImage from "./customImage";

const setPercentChangesColor = (percentage: number): string => {
  return percentage < 0
    ? "text-red-500"
    : percentage > 0
    ? "text-green-500"
    : "text-gray-500";
};

interface CryptoItemProps {
  index: number;
  tokenId: number | undefined;
  model: CryptoData[] | undefined;
  finalPrice: number;
  percentChange: number;
}

const CryptoItem: React.FC<CryptoItemProps> = ({
  index,
  tokenId,
  model,
  finalPrice,
  percentChange,
}) => {
  const textPercentColor = setPercentChangesColor(percentChange);
  const svgColor = setPercentChangesColor(percentChange);

  return (
    <Card className="flex flex-row p-2 bg-gray-900 border-none">
      {model ? (
        <div className="flex flex-row items-center justify-between w-full">
          <div className=" flex flex-row items-center">
            <div className="ml-2 mr-3 text-dimWhite">{index + 1}</div>
            <div className="mr-1">
              {/* Use CustomImage component here */}
              <CustomImage
                imageUrl={`https://s2.coinmarketcap.com/static/img/coins/32x32/${tokenId}.png`}
                size={32} // Adjust the size as needed
              />
            </div>
            <div className="flex flex-col after:items-center  mr-2 ml-1">
              <div className="font-bold text-sm text-dimWhite">
                {model[index]?.name.split(" ")[0]}
              </div>
              <div className="-mt-1 text-sm font-semibold text-slate-400">
                {model[index]?.symbol}
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-col items-end justify-end ml-2">
              <div className="text-dimWhite font-semibold text-md">
                {removePriceDecimals(finalPrice)}
              </div>
              <div className="text-slate-400 font-normal text-xs">
                ${removePriceDecimals(finalPrice)}
              </div>
            </div>
            <div
              className={`rounded-lg p-2 w-20 ${
                setPercentChangesColor(
                  Number(removePercentDecimals(percentChange))
                ) === "text-red-500"
                  ? "bg-[#f6465d]"
                  : setPercentChangesColor(
                      Number(removePercentDecimals(percentChange))
                    ) === "text-green-500"
                  ? "bg-green-500 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  : "bg-gray-500"
              }`}
            >
              <div className="font-semibold text-sm text-white flex items-center justify-center">
                <p>
                  <span>{removePercentDecimals(percentChange)}%</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Skeleton className="h-5 w-full" />
      )}
    </Card>
  );
};

export default CryptoItem;
