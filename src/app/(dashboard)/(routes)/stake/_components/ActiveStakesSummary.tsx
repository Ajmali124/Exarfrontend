"use client";

import { trpc } from "@/trpc/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SquareStack, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ActiveStakesSummary = () => {
  const {
    data: stakes,
    isLoading,
    error,
  } = trpc.user.getStakingEntries.useQuery(undefined, {
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-white via-white/70 to-emerald-100/40 p-6 shadow-[0_20px_90px_-60px_rgba(16,185,129,0.45)] backdrop-blur dark:border-purple-500/25 dark:from-neutral-950 dark:via-neutral-950/70 dark:to-purple-900/25">
        <Skeleton className="h-32 w-full" />
      </Card>
    );
  }

  if (error || !stakes || stakes.length === 0) {
    return (
      <Card className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-white via-white/70 to-emerald-100/40 p-6 shadow-[0_20px_90px_-60px_rgba(16,185,129,0.45)] backdrop-blur dark:border-purple-500/25 dark:from-neutral-950 dark:via-neutral-950/70 dark:to-purple-900/25">
        <div className="absolute -top-24 right-0 h-40 w-40 rounded-full bg-emerald-400/25 blur-3xl dark:bg-purple-500/35" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-emerald-500 shadow-sm dark:bg-white/10 dark:text-purple-200">
                <SquareStack className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600/80 dark:text-purple-100/70">
                  Active Subscriptions
                </p>
                <h2 className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  No active subscriptions
                </h2>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Subscribe to a package to earn daily rewards
          </p>
        </div>
      </Card>
    );
  }

  const activeStakes = stakes.filter((s) => s.status === "active");
  const totalStaked = activeStakes.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const totalEarned = activeStakes.reduce((sum, s) => sum + (s.totalEarned ?? 0), 0);
  const totalMaxEarning = activeStakes.reduce((sum, s) => sum + (s.maxEarning ?? 0), 0);
  const overallProgress = totalMaxEarning > 0 ? (totalEarned / totalMaxEarning) * 100 : 0;

  return (
    <Card className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-white via-white/70 to-emerald-100/40 p-6 shadow-[0_20px_90px_-60px_rgba(16,185,129,0.45)] backdrop-blur dark:border-purple-500/25 dark:from-neutral-950 dark:via-neutral-950/70 dark:to-purple-900/25">
      <div className="absolute -top-24 right-0 h-40 w-40 rounded-full bg-emerald-400/25 blur-3xl dark:bg-purple-500/35" />
      <div className="relative z-10 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-emerald-500 shadow-sm dark:bg-white/10 dark:text-purple-200">
              <SquareStack className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600/80 dark:text-purple-100/70">
                Active Subscriptions
              </p>
              <h2 className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {activeStakes.length} {activeStakes.length === 1 ? "Subscription" : "Subscriptions"}
              </h2>
            </div>
          </div>
          <Link href="/stake">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-purple-200 dark:hover:text-purple-100"
            >
              View All
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-400/20 bg-white/80 p-3 backdrop-blur dark:border-purple-500/20 dark:bg-neutral-900/70">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-600/80 dark:text-purple-200/70">
                Total Subscribed
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                {totalStaked.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">USDT</p>
            </div>
            <div className="rounded-xl border border-emerald-400/20 bg-white/80 p-3 backdrop-blur dark:border-purple-500/20 dark:bg-neutral-900/70">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-600/80 dark:text-purple-200/70">
                Total Yielded
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                {totalEarned.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                of {totalMaxEarning.toFixed(2)} USDT
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Overall Progress</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {overallProgress.toFixed(1)}%
              </span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-200/80 dark:bg-neutral-800">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all",
                  overallProgress >= 100
                    ? "from-emerald-500 via-emerald-400 to-emerald-300 dark:from-emerald-400 dark:via-emerald-300 dark:to-emerald-200"
                    : "from-emerald-400 via-teal-400 to-sky-400 dark:from-purple-500 dark:via-indigo-500 dark:to-cyan-500"
                )}
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              />
            </div>
          </div>

          {activeStakes.length > 0 && (
            <div className="space-y-2 border-t border-white/20 pt-4 dark:border-white/10">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-600/80 dark:text-purple-200/70">
                Recent Subscriptions
              </p>
              <div className="space-y-2">
                {activeStakes.slice(0, 3).map((stake) => {
                  const progress =
                    stake.maxEarning > 0
                      ? Math.min((stake.totalEarned / stake.maxEarning) * 100, 100)
                      : 0;
                  return (
                    <div
                      key={stake.id}
                      className="flex items-center justify-between rounded-lg border border-emerald-400/10 bg-white/60 p-3 backdrop-blur dark:border-purple-500/10 dark:bg-neutral-900/50"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {stake.packageName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {stake.amount.toFixed(2)} USDT • {progress.toFixed(1)}% complete
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(stake.startDate), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {activeStakes.length > 3 && (
                <Link href="/stake">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full text-xs text-emerald-600 hover:text-emerald-700 dark:text-purple-200 dark:hover:text-purple-100"
                  >
                    View {activeStakes.length - 3} more
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ActiveStakesSummary;

