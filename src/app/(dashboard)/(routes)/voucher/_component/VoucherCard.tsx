"use client";

import { cn } from "@/lib/utils";
import { useThemeClasses } from "@/lib/theme-utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight } from "lucide-react";

interface VoucherCardProps {
  voucherId?: string;
  badge: string;
  badgeColor?: "orange" | "blue" | "green" | "purple";
  value: string;
  title: string;
  description: string;
  linkText?: string;
  linkHref?: string;
  roiValidityDays?: number;
  usedOn?: string;
  showUseButton?: boolean;
  isUsing?: boolean;
  onClick?: () => void;
  onUseNow?: () => void;
}

const VoucherCard = ({
  voucherId,
  badge,
  badgeColor = "orange",
  value,
  title,
  description,
  linkText,
  linkHref,
  roiValidityDays,
  usedOn,
  showUseButton = false,
  isUsing = false,
  onClick,
  onUseNow,
}: VoucherCardProps) => {
  const { text } = useThemeClasses();

  const badgeColors = {
    orange: "border-orange-400 text-orange-500 bg-orange-50 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-500",
    blue: "border-blue-400 text-blue-500 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-500",
    green: "border-green-400 text-green-500 bg-green-50 dark:bg-green-950/20 dark:text-green-400 dark:border-green-500",
    purple: "border-purple-400 text-purple-500 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-500",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer",
        "hover:border-emerald-400/30 dark:hover:border-purple-500/30"
      )}
      onClick={onClick}
    >
      <div className="p-5 space-y-4">
        {/* Top Section: Badge and Value */}
        <div className="flex items-start justify-between">
          {/* Badge */}
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
              badgeColors[badgeColor]
            )}
          >
            {badge}
          </span>

          {/* Value */}
          <div className={cn("text-3xl font-semibold", text.primary)}>
            {value}
          </div>
        </div>

        {/* Middle Section: Title and Description */}
        <div className="space-y-3">
          {/* Title */}
          <h3 className={cn("text-xl font-bold", text.primary)}>{title}</h3>

          {/* Description with Arrow */}
          {/* <div className="flex items-start gap-2">
            <p className={cn("text-sm flex-1", text.secondary)}>
              {description}
            </p>
            <ChevronRight
              className={cn(
                "h-4 w-4 mt-0.5 shrink-0",
                text.muted
              )}
            />
          </div> */}

          {/* Link */}
          {linkText && (
            <a
              href={linkHref}
              onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
              }}
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium text-green-400 dark:text-purple-400 hover:text-green-500 dark:hover:text-purple-400 transition-colors"
              )}
            >
              {linkText}
              <ArrowRight className="h-3 w-3" />
            </a>
          )}

          {/* ROI Validity Days */}
          {roiValidityDays && (
            <p className={cn("text-xs", text.muted)}>
              Provides ROI for {roiValidityDays} day{roiValidityDays > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Bottom Section: Use Now Button or Used On */}
        {showUseButton && !usedOn ? (
          <div className="pt-3 border-t border-gray-200 dark:border-neutral-800">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                if (onUseNow) onUseNow();
              }}
              disabled={isUsing}
              className={cn(
                "w-full bg-green-400 dark:bg-purple-500 hover:bg-green-500 dark:hover:bg-purple-600 text-white text-sm font-medium",
                isUsing && "opacity-50 cursor-not-allowed"
              )}
            >
              {isUsing ? "Creating Stake..." : "Use Now"}
            </Button>
          </div>
        ) : usedOn ? (
          <div className={cn("text-xs pt-2 border-t border-gray-200 dark:border-neutral-800", text.muted)}>
            Used on {usedOn}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default VoucherCard;

