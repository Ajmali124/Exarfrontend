"use client";

import { Skeleton } from "@/components/ui/skeleton";

const TotalAssetsCardSkeleton = () => {
  return (
    <div className="w-full p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        {/* Left Section: Assets Info */}
        <div className="flex-1 space-y-1 md:space-y-1.5">
          {/* Total Assets Header */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>

          {/* Main Balance */}
          <div className="space-y-0">
            <div className="flex items-baseline gap-1.5 md:gap-2">
              <Skeleton className="h-8 md:h-10 w-20" />
              <Skeleton className="h-4 md:h-5 w-12" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Today's PnL */}
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </div>

        {/* Right Section: Deposit Button */}
        <div className="ml-2 flex-shrink-0">
          <Skeleton className="h-10 md:h-12 w-20 md:w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default TotalAssetsCardSkeleton;

