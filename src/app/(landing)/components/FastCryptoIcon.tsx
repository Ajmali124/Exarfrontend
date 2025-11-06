import React from "react";

interface FastCryptoIconProps {
  symbol: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

// Pre-defined crypto colors for instant rendering
const CRYPTO_COLORS: Record<string, { primary: string; secondary: string }> = {
  BTC: { primary: "#f7931a", secondary: "#ff9500" },
  ETH: { primary: "#627eea", secondary: "#8a92b2" },
  BNB: { primary: "#f3ba2f", secondary: "#fcd535" },
  XRP: { primary: "#00aae4", secondary: "#00d4ff" },
  ADA: { primary: "#0033ad", secondary: "#3468dc" },
  SOL: { primary: "#9945ff", secondary: "#14f195" },
  DOGE: { primary: "#c2a633", secondary: "#f5d520" },
  DOT: { primary: "#e6007a", secondary: "#ff1a8c" },
  MATIC: { primary: "#8247e5", secondary: "#a855f7" },
  SHIB: { primary: "#ffa409", secondary: "#ffb84d" },
  LTC: { primary: "#bfbbbb", secondary: "#ffffff" },
  BCH: { primary: "#8dc351", secondary: "#a8d470" },
  AVAX: { primary: "#e84142", secondary: "#ff6b6c" },
  TRX: { primary: "#ff060a", secondary: "#ff4447" },
  LINK: { primary: "#2a5ada", secondary: "#375bd2" },
  UNI: { primary: "#ff007a", secondary: "#ff3d9d" },
  ATOM: { primary: "#2e3148", secondary: "#5064a0" },
  XLM: { primary: "#000000", secondary: "#4a4a4a" },
  FIL: { primary: "#0090ff", secondary: "#40a6ff" },
  ICP: { primary: "#29abe2", secondary: "#5bc3eb" },
  NEAR: { primary: "#00c08b", secondary: "#40d4a8" },
  VET: { primary: "#15bdff", secondary: "#52ccff" },
  ETC: { primary: "#3ab83a", secondary: "#5cc85c" },
  ALGO: { primary: "#000000", secondary: "#4a4a4a" },
  HBAR: { primary: "#000000", secondary: "#4a4a4a" },
  MANA: { primary: "#ff2d55", secondary: "#ff6384" },
  SAND: { primary: "#00d4ff", secondary: "#40ddff" },
  AXS: { primary: "#0052cc", secondary: "#3d7bde" },
  CHZ: { primary: "#cd212a", secondary: "#e74c3c" },
  THETA: { primary: "#2ab8e6", secondary: "#5cc9eb" },
  AAVE: { primary: "#b6509e", secondary: "#d87cc2" },
  MKR: { primary: "#1aab9b", secondary: "#4dc3b5" },
  SUSHI: { primary: "#fa52a0", secondary: "#fb7bb8" },
  COMP: { primary: "#00d395", secondary: "#40dda9" },
  YFI: { primary: "#006ae3", secondary: "#4094f7" },
  CAKE: { primary: "#633001", secondary: "#8b6914" },
  "1INCH": { primary: "#1f1f1f", secondary: "#525252" },
  ZEN: { primary: "#041742", secondary: "#2c5aa0" },
  BAT: { primary: "#ff5000", secondary: "#ff7333" },
  OMG: { primary: "#1a53f0", secondary: "#4d7af7" },
  SNX: { primary: "#00d4ff", secondary: "#40ddff" },
  CRV: { primary: "#ff0000", secondary: "#ff4d4d" },
  ENJ: { primary: "#624dbf", secondary: "#8a7dd8" },
  KAVA: { primary: "#ff564f", secondary: "#ff7a75" },
  RUNE: { primary: "#00cccc", secondary: "#40d9d9" },
  RVN: { primary: "#384182", secondary: "#5d68a3" },
  SRM: { primary: "#00ccff", secondary: "#40d6ff" },
  CTK: { primary: "#e6007a", secondary: "#ff3d9d" },
  STORJ: { primary: "#2683ff", secondary: "#5ba0ff" },
  SKL: { primary: "#00ca9d", secondary: "#40d4b8" },
  BONK: { primary: "#ff6b35", secondary: "#ff8c66" },
  HOOK: { primary: "#ff0080", secondary: "#ff40a0" },
  SUI: { primary: "#4da2ff", secondary: "#80beff" },
  WIF: { primary: "#ff9500", secondary: "#ffb340" },
};

export const FastCryptoIcon: React.FC<FastCryptoIconProps> = ({
  symbol,
  size = 32,
  className = "",
  style = {},
  onClick,
}) => {
  // Clean the symbol (remove USDT, USDC suffixes)
  const cleanSymbol = symbol.replace(/USDT|USDC|BUSD/g, "").toUpperCase();
  const letter = cleanSymbol.charAt(0) || "?";

  // Get colors for this crypto
  const colors =
    CRYPTO_COLORS[cleanSymbol] || generateColorsFromSymbol(cleanSymbol);

  // Create unique gradient ID
  const gradientId = `grad-${cleanSymbol}-${size}`;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
      onClick={onClick}
      title={`${cleanSymbol} Icon`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: colors.primary, stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: colors.secondary, stopOpacity: 1 }}
            />
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Outer circle with gradient */}
        <circle
          cx="32"
          cy="32"
          r="30"
          fill={`url(#${gradientId})`}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          filter="url(#shadow)"
        />

        {/* Inner highlight circle */}
        <circle
          cx="32"
          cy="24"
          r="12"
          fill="rgba(255,255,255,0.15)"
          opacity="0.6"
        />

        {/* Letter */}
        <text
          x="32"
          y="42"
          fontSize="22"
          fontWeight="600"
          textAnchor="middle"
          fill="white"
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{
            textShadow: "0 1px 3px rgba(0,0,0,0.5)",
            userSelect: "none",
          }}
        >
          {letter}
        </text>
      </svg>
    </div>
  );
};

// Generate colors based on symbol hash for consistency
function generateColorsFromSymbol(symbol: string): {
  primary: string;
  secondary: string;
} {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  const saturation = 70 + (Math.abs(hash) % 30); // 70-100%
  const lightness = 45 + (Math.abs(hash) % 20); // 45-65%

  return {
    primary: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    secondary: `hsl(${(hue + 30) % 360}, ${saturation}%, ${lightness + 10}%)`,
  };
}

export default FastCryptoIcon;
