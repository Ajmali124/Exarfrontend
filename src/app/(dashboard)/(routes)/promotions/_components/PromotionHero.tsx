"use client";

import { useThemeClasses } from "@/lib/theme-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const PromotionHero = () => {
  const { text } = useThemeClasses();

  return (
    <section className="relative w-full overflow-hidden rounded-3xl">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent dark:from-purple-600/10" />
      
      {/* Illustration Container */}
      <div className="relative h-[320px] w-full overflow-hidden rounded-t-3xl">
        {/* Illustration Image */}
        <div className="relative h-full w-full">
          <Image
            src="/promtion.jpg"
            alt="Earn every day illustration"
            fill
            className="object-cover w-full h-full"
            priority
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="relative bg-white/80 dark:bg-neutral-950/70 backdrop-blur p-6 rounded-b-3xl border-t border-emerald-400/20 dark:border-purple-500/25">
        <div className="space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className={cn("text-3xl md:text-4xl font-bold tracking-tight", text.primary)}>
              Earn every day
            </h1>
            <p className={cn("text-base md:text-lg", text.secondary)}>
              Small tasks, big rewards
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className={cn(
                "flex-1 h-12 text-base font-medium rounded-xl",
                "bg-green-400 dark:bg-purple-500 hover:bg-green-500 dark:hover:bg-purple-600 text-white",
                "shadow-sm hover:shadow-md transition-all"
              )}
            >
              Checked In
            </Button>
            <Button
              variant="outline"
              className={cn(
                "flex-1 h-12 text-base font-medium rounded-xl",
                "border-gray-300 dark:border-neutral-700",
                "bg-gray-100 dark:bg-neutral-800/50 hover:bg-gray-200 dark:hover:bg-neutral-700/50",
                "text-gray-900 dark:text-white",
                "shadow-sm hover:shadow-md transition-all"
              )}
            >
              View Rewards
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromotionHero;

