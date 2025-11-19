"use client";
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  PaperAirplaneIcon,
  WalletIcon,
} from "@heroicons/react/24/solid"; // Import heroicons
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerOverlay } from "@/components/ui/drawer";
import { useState } from "react";

const WalletNav = () => {
  const [isDepositDrawerOpen, setIsDepositDrawerOpen] = useState(false);

  return (
    <div className="flex flex-row items-center justify-between bg-transparent w-full px-6">
      {[
        {
          label: "Deposit",
          icon: <ArrowUpCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />, // Deposit icon
          href: "/deposit",
        },
        {
          label: "Withdraw",
          icon: <ArrowDownCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />, // Withdraw icon
          href: "/withdraw",
        },
        {
          label: "Send",
          icon: <PaperAirplaneIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />, // Send icon
          href: "/send",
        },
        {
          label: "Receive",
          icon: <WalletIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />, // Receive icon
          href: "/receive",
        },
      ].map((item) => {
        const isComingSoon = item.label === "Send" || item.label === "Receive";
        
        if (isComingSoon) {
          return (
            <Tooltip key={item.label} delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="cursor-not-allowed">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center justify-center transition-transform opacity-60"
                  >
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700 p-2 md:p-4">
                      {item.icon}
                    </div>
                    <motion.p className="text-gray-500 dark:text-gray-500 mt-2 text-xs md:text-sm font-medium">
                      {item.label}
                    </motion.p>
                  </motion.div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900">
                <p>Coming Soon</p>
              </TooltipContent>
            </Tooltip>
          );
        }

        const buttonContent = (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center transition-transform"
          >
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700 p-2 md:p-4">
              {item.icon}
            </div>
            <motion.p
              className="text-gray-700 dark:text-gray-300 mt-2 text-xs md:text-sm font-medium"
              whileHover={{
                color: "#8b5cf6", // Purple hover color
              }}
            >
              {item.label}
            </motion.p>
          </motion.div>
        );

        if (item.label === "Deposit") {
          return (
            <Link href="/deposit" prefetch key={item.label}>
                  {buttonContent}
            </Link>
        );
        }

        return (
          <Link href={item.href} prefetch key={item.label}>
            {buttonContent}
          </Link>
        );
      })}
    </div>
  );
};

export default WalletNav;
