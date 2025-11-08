
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import { TRPCProvider } from "@/trpc/client";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "EXAR AI - Crypto Arbitrage Platform",
  description:
    "Deploy arbitrage bots across top exchanges with zero fees, pro-grade analytics, and institutional precision. Execute profitable trades with real-time market data.",
  keywords:
    "crypto arbitrage, trading bots, cryptocurrency, algorithmic trading, DeFi, institutional trading",
  authors: [{ name: "CBA Exchange" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Arbify AI - Institutional-Grade Crypto Arbitrage Platform",
    description:
      "Deploy arbitrage bots across top exchanges with zero fees and institutional precision.",
    type: "website",
    url: "https://arbify.ai",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Arbify AI Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arbify AI - Institutional-Grade Crypto Arbitrage Platform",
    description:
      "Deploy arbitrage bots across top exchanges with zero fees and institutional precision.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>       
        <Toaster/>

        <TRPCProvider>{children}</TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
