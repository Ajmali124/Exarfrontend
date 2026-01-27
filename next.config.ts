import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
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
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Cloudinary hosted images (avatars/KYC)
        pathname: "/**",
      },
    ],
  },
  // You can add other Next.js configurations here
};

export default nextConfig;
