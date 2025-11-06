"use client";

import { useState } from "react";
import * as React from "react";
import { useThemeClasses } from "@/lib/theme-utils";
import { SquareStack, TrendingUp } from "lucide-react";
import { trpc } from "@/trpc/client";
import PackageCard from "./PackageCard";
import ActiveStakesList from "./ActiveStakesList";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const StakePageContent = () => {
  const { text, bg, border } = useThemeClasses();
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    null
  );
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);

  const { data: packages, isLoading: packagesLoading } =
    trpc.user.getStakingPackages.useQuery();
  const { data: walletBalance } = trpc.user.getWalletBalance.useQuery();

  // Track carousel position
  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="w-full p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div
            className={`
              p-3 rounded-xl
              bg-green-100 dark:bg-purple-500/20
              text-green-600 dark:text-purple-400
            `}
          >
            <SquareStack className="h-6 w-6" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${text.primary}`}>Subscriptions</h1>
            <p className={`text-sm ${text.secondary}`}>
              Subscribe to packages and earn daily ROI
            </p>
          </div>
        </div>
      </div>

      {/* Available Balance Card */}
      <Card
        className={cn(
          bg.card,
          border.primary,
          "border p-4"
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${text.muted} mb-1`}>Available Balance</p>
            <p className={`text-2xl font-bold ${text.primary}`}>
              {(walletBalance?.balance ?? 0).toFixed(2)} USDT
            </p>
          </div>
          <div
            className={`
              p-3 rounded-lg
              bg-green-100 dark:bg-purple-500/20
              text-green-600 dark:text-purple-400
            `}
          >
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </Card>

      {/* Tabs: Packages and Active Stakes */}
      <Tabs defaultValue="packages" className="w-full">
        <TabsList
          className={cn(
            bg.secondary,
            "w-full grid grid-cols-2"
          )}
        >
          <TabsTrigger value="packages" className={text.primary}>
            Packages
          </TabsTrigger>
          <TabsTrigger value="stakes" className={text.primary}>
            Active Subscriptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-4 mt-4">
          {/* Packages - Mobile Carousel / Desktop Grid */}
          <div>
            <h2 className={`text-lg font-semibold ${text.primary} mb-4`}>
              Select a Package to Subscribe
            </h2>
            {packagesLoading ? (
              <>
                {/* Mobile Skeleton */}
                <div className="md:hidden">
                  <Skeleton className="h-80 w-full" />
                </div>
                {/* Desktop Skeleton */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 w-full" />
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Mobile: Horizontal Carousel */}
                <div className="md:hidden space-y-4">
                  <Carousel
                    setApi={setApi}
                    opts={{
                      align: "start",
                      loop: false,
                      dragFree: false,
                      containScroll: "trimSnaps",
                    }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-2">
                      {packages?.map((pkg, index) => (
                        <CarouselItem
                          key={pkg.id}
                          className="pl-2 basis-[92%] sm:basis-[85%]"
                        >
                          <PackageCard
                            pkg={pkg}
                            isSelected={selectedPackageId === pkg.id}
                            onSelect={() => setSelectedPackageId(pkg.id)}
                            walletBalance={walletBalance?.balance ?? 0}
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>

                  {/* Package Indicators */}
                  <div className="flex items-center justify-center gap-2">
                    {packages?.map((pkg, index) => (
                      <button
                        key={pkg.id}
                        onClick={() => api?.scrollTo(index)}
                        className={cn(
                          "h-2 rounded-full transition-all",
                          current === index
                            ? "w-8 bg-green-500 dark:bg-purple-500"
                            : "w-2 bg-gray-300 dark:bg-neutral-600"
                        )}
                        aria-label={`Go to ${pkg.name}`}
                      />
                    ))}
                  </div>

                  {/* Package Quick Info */}
                  <div className="text-center">
                    <p className={`text-sm ${text.muted}`}>
                      {current + 1} of {packages?.length} packages
                    </p>
                    {packages && packages[current] && (
                      <p className={`text-xs ${text.secondary} mt-1`}>
                        {packages[current].name} •{" "}
                        {packages[current].amount.toLocaleString()} USDT
                      </p>
                    )}
                  </div>
                </div>

                {/* Desktop: Grid Layout */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packages?.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      isSelected={selectedPackageId === pkg.id}
                      onSelect={() => setSelectedPackageId(pkg.id)}
                      walletBalance={walletBalance?.balance ?? 0}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="stakes" className="mt-4">
          <ActiveStakesList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StakePageContent;

