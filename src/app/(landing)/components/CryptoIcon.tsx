"use client";

import { useState } from "react";

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

// Simple fallback implementation - uses CoinGecko CDN as fallback
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
  const [error, setError] = useState(false);
  const symbolLower = symbol.toLowerCase();
  const symbolUpper = symbol.toUpperCase();

  // CoinGecko CDN URL
  const iconUrl = `https://assets.coingecko.com/coins/images/${symbolLower}/large/${symbolLower}.png`;

  const renderFallback = () => (
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

  if (error) {
    return renderFallback();
  }

  return (
    <img
      src={iconUrl}
      alt={alt || `${symbolUpper} icon`}
      className={`crypto-icon ${className}`}
      style={{ width: size, height: size, ...style }}
      onClick={onClick}
      onError={() => setError(true)}
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
  const visibleSymbols = maxVisible ? symbols.slice(0, maxVisible) : symbols;
  const hiddenCount = maxVisible ? Math.max(0, symbols.length - maxVisible) : 0;

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
  // Simplified version without market data context
  return (
    <div className="flex items-center space-x-3">
      <CryptoIcon symbol={symbol} {...iconProps} />
    </div>
  );
}
