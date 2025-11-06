"use client";

import { useEffect, useState } from "react";
import { useCryptoIcons } from "../contexts/CryptoDataContext";
import { CryptoIconOptions } from "../services/crypto-icons/crypto-icons.service";

interface CryptoIconProps {
  symbol: string;
  size?: number;
  format?: "webp" | "png" | "svg";
  className?: string;
  alt?: string;
  fallbackText?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function CryptoIcon({
  symbol,
  size = 64,
  format = "webp",
  className = "",
  alt,
  fallbackText,
  onClick,
  style,
}: CryptoIconProps) {
  const { getIcon, isLoadingIcons, iconErrors } = useCryptoIcons();
  const [iconUrl, setIconUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const symbolUpper = symbol.toUpperCase();
  const iconOptions: CryptoIconOptions = {
    size: size as 32 | 64 | 128,
    format,
  };

  useEffect(() => {
    let isMounted = true;

    const loadIcon = async () => {
      if (!symbol) return;

      setIsLoading(true);
      setError("");

      try {
        const url = await getIcon(symbol, iconOptions);
        if (isMounted) {
          setIconUrl(url);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to load icon";
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    };

    loadIcon();

    return () => {
      isMounted = false;
    };
  }, [symbol, size, format, getIcon]);

  // Handle image load errors with fallback
  const handleImageError = () => {
    setError("Image failed to load");
  };

  // Render loading state
  if (isLoading || isLoadingIcons) {
    return (
      <div
        className={`crypto-icon-loading ${className}`}
        style={{ width: size, height: size, ...style }}
        onClick={onClick}
      >
        <div className="animate-pulse bg-gray-300 rounded-full w-full h-full flex items-center justify-center">
          <span className="text-gray-500 text-xs font-medium">
            {symbolUpper.slice(0, 3)}
          </span>
        </div>
      </div>
    );
  }

  // Render error state with fallback
  if (error || iconErrors[symbolUpper]) {
    return (
      <div
        className={`crypto-icon-fallback ${className}`}
        style={{ width: size, height: size, ...style }}
        onClick={onClick}
        title={`${symbolUpper} (fallback)`}
      >
        <div
          className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg"
          style={{ fontSize: Math.floor(size / 4) }}
        >
          {fallbackText || symbolUpper.slice(0, 3)}
        </div>
      </div>
    );
  }

  // Render actual icon (only if iconUrl is not empty)
  if (!iconUrl || iconUrl.trim() === "") {
    return renderFallback();
  }

  return (
    <img
      src={iconUrl}
      alt={alt || `${symbolUpper} icon`}
      className={`crypto-icon ${className}`}
      style={{ width: size, height: size, ...style }}
      onClick={onClick}
      onError={handleImageError}
      loading="lazy"
      title={`${symbolUpper} icon`}
    />
  );
}

// Batch loading component for multiple icons
interface CryptoBatchIconsProps {
  symbols: string[];
  size?: number;
  format?: "webp" | "png" | "svg";
  className?: string;
  onIconClick?: (symbol: string) => void;
  maxVisible?: number;
}

export function CryptoBatchIcons({
  symbols,
  size = 48,
  format = "webp",
  className = "",
  onIconClick,
  maxVisible,
}: CryptoBatchIconsProps) {
  const { getBatchIcons, isLoadingIcons } = useCryptoIcons();
  const [isLoading, setIsLoading] = useState(false);

  const visibleSymbols = maxVisible ? symbols.slice(0, maxVisible) : symbols;
  const hiddenCount = maxVisible ? Math.max(0, symbols.length - maxVisible) : 0;

  useEffect(() => {
    if (symbols.length > 0) {
      setIsLoading(true);
      getBatchIcons(symbols, { size: size as 32 | 64 | 128, format }).finally(
        () => setIsLoading(false)
      );
    }
  }, [symbols, size, format, getBatchIcons]);

  if (isLoading || isLoadingIcons) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {visibleSymbols.map((symbol, index) => (
          <div
            key={symbol}
            className="animate-pulse bg-gray-300 rounded-full flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            <span className="text-gray-500 text-xs font-medium">
              {symbol.toUpperCase().slice(0, 2)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {visibleSymbols.map((symbol) => (
        <CryptoIcon
          key={symbol}
          symbol={symbol}
          size={size}
          format={format}
          className="cursor-pointer hover:scale-110 transition-transform duration-200"
          onClick={() => onIconClick?.(symbol)}
        />
      ))}
      {hiddenCount > 0 && (
        <div
          className="flex items-center justify-center bg-gray-100 rounded-full text-gray-600 font-medium"
          style={{ width: size, height: size, fontSize: Math.floor(size / 4) }}
        >
          +{hiddenCount}
        </div>
      )}
    </div>
  );
}

// Icon with live price data
interface CryptoIconWithPriceProps extends CryptoIconProps {
  showPrice?: boolean;
  showChange?: boolean;
  priceClassName?: string;
}

export function CryptoIconWithPrice({
  symbol,
  showPrice = true,
  showChange = true,
  priceClassName = "",
  ...iconProps
}: CryptoIconWithPriceProps) {
  const { marketData } = useCryptoIcons() as any; // Access market data from context

  const symbolUpper = symbol.toUpperCase();
  const data = marketData[symbolUpper];

  return (
    <div className="flex items-center space-x-3">
      <CryptoIcon symbol={symbol} {...iconProps} />

      {(showPrice || showChange) && (
        <div className="flex flex-col">
          {showPrice && data?.price && (
            <span className={`font-semibold ${priceClassName}`}>
              ${parseFloat(data.price).toLocaleString()}
            </span>
          )}
          {showChange && data?.priceChangePercent && (
            <span
              className={`text-sm font-medium ${
                parseFloat(data.priceChangePercent) >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {parseFloat(data.priceChangePercent) >= 0 ? "+" : ""}
              {parseFloat(data.priceChangePercent).toFixed(2)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
