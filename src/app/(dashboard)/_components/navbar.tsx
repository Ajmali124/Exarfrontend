"use client";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useThemeClasses } from "@/lib/theme-utils";
import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import MobileProfileSheet from "./mobile-profile-sheet";

const poppins = Montserrat({ weight: "600", subsets: ["latin"] });

const ensureString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  return undefined;
};

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { text, bg, border } = useThemeClasses();
  const isDark = theme === "dark";
  const { data: userBasic } = trpc.user.getBasicInfo.useQuery();
  const { data: kyc } = trpc.user.getKycStatus.useQuery();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 md:hidden flex items-center justify-between px-3 py-2 h-12",
      bg.secondary,
      border.primary,
      "border-b"
    )}>
      <div className="flex items-center gap-3">
        {/* Profile Sheet Trigger */}
        <MobileProfileSheet>
          <button
            type="button"
            className="flex items-center"
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-green-500/20 dark:ring-purple-500/20">
              <img
                src={
                  ensureString(userBasic?.image) ??
                  ensureString(kyc?.selfieImageUrl) ??
                  "/user.png"
                }
                alt={`${ensureString(userBasic?.username ?? userBasic?.name) ?? "User"} profile`}
                className="h-full w-full object-cover"
              />
            </div>
          </button>
        </MobileProfileSheet>
        
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center">
          {mounted ? (
            <Image
              src={isDark ? "/logo.svg" : "/logodark.svg"}
              className="h-6 w-auto"
              alt="Logo"
              height={24}
              width={120}
            />
          ) : (
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          )}
        </Link>
      </div>
      
      {/* Theme Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={cn(
          "h-8 w-8",
          text.secondary,
          "hover:bg-gray-100 dark:hover:bg-white/5"
        )}
      >
        {mounted ? (
          theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )
        ) : (
          <div className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default Navbar;
