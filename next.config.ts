import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
        pathname: "/coins/images/**", // For CoinGecko images
      },
      {
        protocol: "https",
        hostname: "s2.coinmarketcap.com", // For CoinMarketCap images
        pathname: "/static/img/coins/**",
      },
    ],
  },
  // You can add other Next.js configurations here
};

export default nextConfig;
