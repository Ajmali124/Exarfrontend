"use client";

import * as React from "react";
import { useState } from "react";
import { SquareStack, Wallet2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";

import PackageCard from "./PackageCard";
import ActiveStakesSummary from "./ActiveStakesSummary";

const StakePageContent = () => {
  const [carouselApi, setCarouselApi] = useState<any>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: packages, isLoading: packagesLoading } = trpc.user.getStakingPackages.useQuery();
  const { data: walletBalance } = trpc.user.getWalletBalance.useQuery();

  const maxRoi = React.useMemo(() => {
    if (!packages || packages.length === 0) return 1;
    return packages.reduce((max, pkg) => Math.max(max, pkg.roi), packages[0].roi);
  }, [packages]);

  const maxCap = React.useMemo(() => {
    if (!packages || packages.length === 0) return 1;
    return packages.reduce((max, pkg) => Math.max(max, pkg.cap), packages[0].cap);
  }, [packages]);

  React.useEffect(() => {
    if (!carouselApi) return;
    setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  return (
    <div className="relative w-full space-y-6 p-4 pb-14 md:p-6">
      <div className="absolute inset-x-0 top-0 -z-10 h-[320px] bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent dark:from-purple-600/10" />

      <section className="relative z-10">
        <Card className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-white via-white/70 to-emerald-100/40 p-6 shadow-[0_20px_90px_-60px_rgba(16,185,129,0.45)] backdrop-blur dark:border-purple-500/25 dark:from-neutral-950 dark:via-neutral-950/70 dark:to-purple-900/25">
          <div className="absolute -top-24 right-0 h-40 w-40 rounded-full bg-emerald-400/25 blur-3xl dark:bg-purple-500/35" />
          <div className="relative z-10 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600/80 dark:text-purple-100/70">
                  Wallet
                </p>
                <h2 className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  Available balance
                </h2>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-emerald-500 shadow-sm dark:bg-white/10 dark:text-purple-200">
                <Wallet2 className="h-5 w-5" />
              </span>
            </div>

            <div>
              <p className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {(walletBalance?.balance ?? 0).toFixed(2)}
                <span className="ml-2 text-base font-medium text-gray-500 dark:text-gray-400">USDT</span>
              </p>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                Instantly deployable across every staking node.
              </p>
            </div>
          </div>
        </Card>
      </section>
      <section className="relative z-10">
        <ActiveStakesSummary />
      </section>
      <section className="relative z-10 space-y-5">
        {packagesLoading ? (
          <>
            <div className="md:hidden">
              <Skeleton className="h-80 w-full rounded-3xl" />
            </div>
            <div className="hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-80 w-full rounded-3xl" />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4 md:hidden">
              <Carousel
                setApi={setCarouselApi}
                opts={{ align: "start", loop: false, dragFree: false, containScroll: "trimSnaps" }}
                className="w-full"
              >
                <CarouselContent className="-ml-3">
                  {packages?.map((pkg) => (
                    <CarouselItem key={pkg.id} className="pl-3">
                      <PackageCard
                        pkg={pkg}
                        walletBalance={walletBalance?.balance ?? 0}
                        maxRoi={maxRoi}
                        maxCap={maxCap}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {packages && packages.length > 0 && (
                <div className="flex items-center justify-center gap-2">
                  {packages.map((pkg, index) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => carouselApi?.scrollTo(index)}
                      className={
                        currentSlide === index
                          ? "h-2.5 w-8 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all dark:from-purple-500 dark:to-indigo-500"
                          : "h-2.5 w-2.5 rounded-full bg-emerald-200/70 transition-all dark:bg-purple-500/30"
                      }
                      aria-label={`Scroll to ${pkg.name}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="hidden gap-5 md:grid md:grid-cols-2 xl:grid-cols-3">
              {packages?.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  walletBalance={walletBalance?.balance ?? 0}
                  maxRoi={maxRoi}
                  maxCap={maxCap}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default StakePageContent;

