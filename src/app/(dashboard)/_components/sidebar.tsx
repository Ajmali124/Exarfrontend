"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Award,
  Group,
  LayoutDashboard,
  ShieldCheck,
  SquareStackIcon,
  StarIcon,
  Wallet,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useThemeClasses } from "@/lib/theme-utils";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-secondary",
  },
  {
    label: "Wallet",
    icon: Wallet,
    href: "/wallet",
    color: "text-secondary",
  },
  {
    label: "Staking",
    icon: SquareStackIcon,
    href: "/staking",
    color: "text-secondary",
  },
  {
    label: "Activation",
    icon: ShieldCheck,
    href: "/activation",
    color: "text-secondary",
  },
  {
    label: "Daily Earning",
    icon: StarIcon,
    href: "/dailyearning",
    color: "text-secondary",
  },
  {
    label: "Team Building",
    icon: Group,
    href: "/team",
    color: "text-secondary",
  },
  {
    label: "Rank",
    icon: Award,
    href: "/rank",
    color: "text-secondary",
  },
];

// Desktop Sidebar Component
export const Sidebar = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { text, bg, border } = useThemeClasses();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isDark = theme === "dark";
  
  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Show expanded state when hovered or clicked
  const showExpanded = isExpanded || isHovered;

  return (
    <div
      className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 z-80 transition-all duration-300 ease-in-out",
        showExpanded ? "w-72" : "w-[72px]",
        bg.secondary,
        border.primary,
        "border-r",
        "shadow-lg"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center justify-center md:justify-start px-4 py-4 border-b border-gray-200 dark:border-neutral-800">
          <Link href="/dashboard" className="flex items-center">
            {showExpanded ? (
              mounted ? (
                <Image
                  src={isDark ? "/logo.svg" : "/logodark.svg"}
                  className="h-8 w-auto transition-opacity duration-300"
                  alt="Logo"
                  height={32}
                  width={120}
                />
              ) : (
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              )
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 dark:from-purple-500 dark:to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">B</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {routes.map((route) => {
              const isActive = pathname === route.href;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "group flex items-center rounded-lg px-3 py-2.5 transition-all duration-200",
                    "hover:bg-gray-100 dark:hover:bg-white/5",
                    isActive
                      ? "bg-gradient-to-r from-green-500/10 to-teal-500/10 dark:from-purple-500/20 dark:to-purple-600/20 text-green-600 dark:text-purple-400 border-l-2 border-green-500 dark:border-purple-500"
                      : text.secondary,
                    !showExpanded && "justify-center"
                  )}
                >
                  <route.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive
                        ? "text-green-600 dark:text-purple-400"
                        : text.secondary,
                      showExpanded && "mr-3"
                    )}
                  />
                  {showExpanded && (
                    <span
                      className={cn(
                        "text-sm font-medium whitespace-nowrap transition-opacity duration-200",
                        isActive ? text.primary : text.secondary
                      )}
                    >
                      {route.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Theme Toggle */}
        <div className={cn("px-2 py-4 border-t", border.primary)}>
          <button
            onClick={toggleTheme}
            className={cn(
              "w-full flex items-center rounded-lg px-3 py-2.5 transition-all duration-200",
              "hover:bg-gray-100 dark:hover:bg-white/5",
              text.secondary,
              !showExpanded && "justify-center"
            )}
          >
            {mounted ? (
              <>
                {theme === "dark" ? (
                  <Sun className={cn("h-5 w-5 flex-shrink-0", showExpanded && "mr-3")} />
                ) : (
                  <Moon className={cn("h-5 w-5 flex-shrink-0", showExpanded && "mr-3")} />
                )}
                {showExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </span>
                )}
              </>
            ) : (
              // Placeholder during SSR to prevent hydration mismatch
              <div className={cn("h-5 w-5 flex-shrink-0", showExpanded && "mr-3")} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
