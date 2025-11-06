"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import WalletCard from "./WalletCard";
import MainNav from "./mainnav";
import { trpc } from "@/trpc/client";
import { useThemeClasses } from "@/lib/theme-utils";
import { dashboardTheme } from "@/lib/theme-utils";

const poppins = Montserrat({ weight: "600", subsets: ["latin"] });

const MainCard = () => {
  // Use tRPC to fetch only basic user info (name, username) for fast loading
  const { data: userBasic, isLoading } = trpc.user.getBasicInfo.useQuery();
  const { text } = useThemeClasses();
  
  // Use username instead of name/email
  const displayName = userBasic?.username || userBasic?.name?.split(' ')[0] || "User";
  return (
    <div className={`relative w-full ${dashboardTheme.backgroundGradient.default} p-2`}>
      <div className="flex items-center justify-between p-2 space-x-3">
        {/* Left Section: User Profile and Welcome Message */}
        <div className="flex items-center space-x-2">
          {/* User Image with Framer Motion */}
          <motion.div
            className="relative w-10 h-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="w-full h-full rounded-full bg-gradient-to-r from-purple-400 dark:from-purple-500 to-purple-600 dark:to-purple-700 p-1"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img
                src={userBasic?.image || "/user.png"}
                alt="User Profile"
                className="w-full h-full object-cover rounded-full shadow-lg"
              />
            </motion.div>
            <motion.div
              className="absolute top-0 left-0 w-full h-full rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
              style={{
                boxShadow: "0 0 15px rgba(168, 85, 247, 0.8)", // Purple neon glow effect
              }}
            ></motion.div>
          </motion.div>

          {/* Welcome Text */}
          {/* <div className="flex flex-col">
            <p className={`text-xs ${text.secondary} font-semibold`}>
              Welcome Back!
            </p>
            <p
              className={cn(
                `text-sm font-bold leading-tight ${text.primary}`,
                poppins.className
              )}
            >
              {isLoading ? "Loading..." : `Hello ${displayName} 💫`}
            </p>
          </div> */}
        </div>

        {/* Right Section: Deposit Button */}
        <div>
          <Link href="/deposit" prefetch>
            <motion.button
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-gradient-to-r from-green-500 to-teal-500 dark:from-purple-500 dark:to-purple-600 text-white px-4 py-1 text-xs rounded-xl shadow-lg flex items-center hover:from-green-600 hover:to-teal-600 dark:hover:from-purple-600 dark:hover:to-purple-700"
            >
              Explorer
            </motion.button>
          </Link>
        </div>
      </div>
      <WalletCard />
      <MainNav />
    </div>
  );
};

export default MainCard;
