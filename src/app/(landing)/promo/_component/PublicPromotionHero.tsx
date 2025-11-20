"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { LogIn } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const PublicPromotionHero = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Typewriter effect state
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const mainText = "PreLaunch Promo";

  // Calculate target date: 14 days from today
  const calculateTimeLeft = (): TimeLeft => {
    const now = new Date().getTime();
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 14); // 14 days for promotion
    targetDate.setHours(23, 59, 59, 999); // End of day, 14 days from now
    const difference = targetDate.getTime() - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  // Initialize with safe default to prevent hydration mismatch
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 14,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Set mounted state after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
    // Set initial time after mount
    setTimeLeft(calculateTimeLeft());
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!mounted) return;
    
    let timeout: NodeJS.Timeout;

    if (isTyping && displayedText.length < mainText.length) {
      timeout = setTimeout(() => {
        setDisplayedText(mainText.slice(0, displayedText.length + 1));
      }, 150);
    } else if (displayedText.length === mainText.length) {
      setIsTyping(false);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isTyping, mainText, mounted]);

  // Countdown timer logic
  useEffect(() => {
    if (!mounted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [mounted]);

  // Get promo image based on theme
  // Use default light image on server to prevent hydration mismatch
  // Then update after mount based on actual theme
  const promoImage = mounted && theme === "dark" ? "/24.png" : "/23.png";

  return (
    <div className="relative flex flex-col items-center px-2 py-4">
      {/* Title Section */}
      <div className="text-center space-y-3 w-full">
        {/* Main Title with Typewriter Effect */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight min-h-[3rem] md:min-h-[3.5rem]">
          <span className="bg-gradient-to-r from-green-500 via-emerald-400 to-teal-400 dark:from-green-400 dark:via-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
            {displayedText}
          </span>
          {isTyping && (
            <span className="inline-block w-0.5 h-8 md:h-10 bg-green-400 dark:bg-green-300 ml-1 animate-pulse align-middle" />
          )}
        </h1>
        
        {/* Subtitle */}
        <p className={cn(
          "text-base md:text-lg lg:text-xl font-medium",
          "text-gray-700 dark:text-gray-200",
          "drop-shadow-sm"
        )}>
          Claim Your $1000 Reward & New User
        </p>
        
        {/* Welcome Reward Badge */}
        <div className="inline-flex items-center justify-center">
          <p className={cn(
            "text-xl md:text-2xl lg:text-3xl font-bold px-4 py-2 rounded-xl",
            "bg-gradient-to-r from-green-500/20 to-emerald-500/20 dark:from-green-400/20 dark:to-emerald-400/20",
            "text-green-600 dark:text-green-300",
          )}>
            Welcome Reward
          </p>
        </div>
      </div>

      {/* Central Graphic Image */}
      <div className="relative w-full max-w-sm h-[320px] md:h-[320px] flex items-center justify-center">
        <Image
          src={promoImage}
          alt="PreLaunch Sale promotion"
          fill
          priority
        />
      </div>

      {/* Call to Action Section */}
      <div className="w-full space-y-4">
        {/* Login/Register Buttons */}
        <div className="flex flex-row gap-3 w-full max-w-md mx-auto">
          <Link href="/login" className="flex-1">
            <Button
              className={cn(
                "w-full h-10 text-sm font-semibold rounded-lg",
                "shadow-md hover:shadow-lg transition-all",
                "bg-gradient-to-r from-green-500 via-emerald-400 to-teal-400 hover:from-green-600 hover:via-emerald-500 hover:to-teal-500 text-white"
              )}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          </Link>
          <Link href="/register" className="flex-1">
            <Button
              className={cn(
                "w-full h-10 text-sm font-semibold rounded-lg",
                "shadow-md hover:shadow-lg transition-all",
                "bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-400 hover:from-blue-600 hover:via-indigo-500 hover:to-purple-500 text-white"
              )}
            >
              Register
            </Button>
          </Link>
        </div>

        {/* Ending in Text */}
        <p className="text-center text-sm text-gray-400 dark:text-gray-400">
          Ending in
        </p>

        {/* Countdown Timer */}
        <div className="flex items-center justify-center gap-2 text-white">
          {mounted ? (
            <>
              <span className="text-2xl md:text-3xl font-bold">
                {String(timeLeft.days).padStart(2, "0")}D
              </span>
              <span className="text-xl text-gray-400">|</span>
              <span className="text-2xl md:text-3xl font-bold">
                {String(timeLeft.hours).padStart(2, "0")}H
              </span>
              <span className="text-xl text-gray-400">|</span>
              <span className="text-2xl md:text-3xl font-bold">
                {String(timeLeft.minutes).padStart(2, "0")}M
              </span>
              <span className="text-xl text-gray-400">|</span>
              <span className="text-2xl md:text-3xl font-bold">
                {String(timeLeft.seconds).padStart(2, "0")}S
              </span>
            </>
          ) : (
            // Server-side render placeholder (matches initial state - 14 days)
            <>
              <span className="text-2xl md:text-3xl font-bold">
                14D
              </span>
              <span className="text-xl text-gray-400">|</span>
              <span className="text-2xl md:text-3xl font-bold">
                00H
              </span>
              <span className="text-xl text-gray-400">|</span>
              <span className="text-2xl md:text-3xl font-bold">
                00M
              </span>
              <span className="text-xl text-gray-400">|</span>
              <span className="text-2xl md:text-3xl font-bold">
                00S
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicPromotionHero;

