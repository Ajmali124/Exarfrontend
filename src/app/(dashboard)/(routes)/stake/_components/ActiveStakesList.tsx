"use client";

import { useThemeClasses } from "@/lib/theme-utils";
import { trpc } from "@/trpc/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Zap, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const ActiveStakesList = () => {
  const { text } = useThemeClasses();

  const utils = trpc.useUtils();
  const {
    data: subscriptions,
    isLoading,
    error,
  } = trpc.user.getStakingEntries.useQuery(undefined, {
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const requestUnstakeMutation = trpc.user.requestUnstake.useMutation({
    onSuccess: () => {
      toast.success("Unsubscribe requested. 3-day cooldown started.");
      utils.user.getStakingEntries.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to request unsubscribe");
    },
  });

  const completeUnstakeMutation = trpc.user.completeUnstake.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Unsubscribe completed! ${data.principalReturn.toFixed(2)} USDT returned to balance.`
      );
      utils.user.getStakingEntries.invalidate();
      utils.user.getWalletBalance.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to complete unsubscribe");
    },
  });

  const handleRequestUnstake = (subscriptionId: string) => {
    if (
      confirm(
        "Are you sure you want to unsubscribe? This will start a 3-day cooldown period with no ROI distribution."
      )
    ) {
      requestUnstakeMutation.mutate({ stakeId: subscriptionId });
    }
  };

  const handleCompleteUnstake = (subscriptionId: string) => {
    completeUnstakeMutation.mutate({ stakeId: subscriptionId });
  };

  const getRemainingCooldown = (cooldownEndDate: Date | string | null) => {
    if (!cooldownEndDate) return null;
    const now = new Date();
    const end = new Date(cooldownEndDate);
    if (now >= end) return "Ready";
    return formatDistanceToNow(end, { addSuffix: true });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-48 w-full rounded-3xl border border-emerald-500/10 bg-white/60 dark:border-purple-500/10 dark:bg-neutral-900/60"
          />
        ))}
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card
        className={cn(
          "relative overflow-hidden rounded-3xl border border-red-500/25 bg-white/70 p-8 text-center backdrop-blur dark:border-red-500/25 dark:bg-neutral-950/60"
        )}
      >
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/10 via-transparent to-transparent" />
        <div className="relative z-10">
        <div className="text-red-500 dark:text-red-400 mb-2">
          <Zap className="h-12 w-12 mx-auto mb-3" />
        </div>
        <p className={text.primary}>Error loading subscriptions</p>
        <p className={`text-sm ${text.muted} mt-1`}>
          {error.message || "Please try again later"}
        </p>
        </div>
      </Card>
    );
  }

  // Handle empty state - no subscriptions
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <Card
        className={cn(
          "relative overflow-hidden rounded-3xl border border-emerald-400/25 bg-white/70 p-8 text-center backdrop-blur dark:border-purple-500/25 dark:bg-neutral-950/60"
        )}
      >
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-400/15 via-transparent to-transparent dark:from-purple-500/15" />
        <div className="relative z-10">
        <Zap className={`h-12 w-12 mx-auto mb-3 ${text.muted}`} />
        <p className={`${text.primary} font-medium mb-1`}>
          No active subscriptions yet
        </p>
        <p className={`text-sm ${text.muted} mt-1`}>
          Create your first subscription from the Packages tab
        </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => {
        // Safety checks for edge cases
        const totalEarned = subscription.totalEarned ?? 0;
        const maxEarning = subscription.maxEarning ?? 0;
        const dailyROI = subscription.dailyROI ?? 0;
        const amount = subscription.amount ?? 0;

        // Calculate progress safely (handle division by zero)
        const progress =
          maxEarning > 0
            ? Math.min((totalEarned / maxEarning) * 100, 100)
            : 0;

        const isCapReached = totalEarned >= maxEarning;
        const dailyEarning = (amount * dailyROI) / 100;
        const remainingCooldown = getRemainingCooldown(subscription.cooldownEndDate);
        const canCompleteUnstake =
          subscription.status === "unstaking" &&
          subscription.cooldownEndDate &&
          new Date() >= new Date(subscription.cooldownEndDate);

        return (
          <Card
            key={subscription.id}
            className={cn(
              "relative overflow-hidden rounded-3xl border border-transparent bg-white/75 p-6 backdrop-blur transition-all duration-300 dark:bg-neutral-950/70",
              subscription.status === "active"
                ? "hover:border-emerald-400/40 shadow-[0_18px_70px_-50px_rgba(16,185,129,0.45)]"
                : "hover:border-orange-400/40 shadow-[0_18px_70px_-60px_rgba(249,115,22,0.35)]",
              isCapReached && "ring-1 ring-emerald-400/60 dark:ring-emerald-400/50"
            )}
          >
            <div
              className={cn(
                "pointer-events-none absolute -right-24 top-0 h-60 w-60 rounded-full blur-3xl",
                subscription.status === "active"
                  ? "bg-emerald-400/20 dark:bg-purple-500/25"
                  : "bg-orange-400/20 dark:bg-amber-500/25"
              )}
            />
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/25 opacity-40 dark:border-white/10" />

            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                  <div className="flex items-center gap-3">
                    <h3 className={`text-lg font-semibold ${text.primary}`}>
                    {subscription.packageName}
                  </h3>
                  <span
                    className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em]",
                      subscription.status === "active"
                          ? "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200"
                          : "bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-200"
                    )}
                  >
                    {subscription.status === "active" ? "Active" : "Unsubscribing"}
                  </span>
                </div>
                  <p className={`mt-2 text-sm ${text.muted}`}>
                  Subscribed {amount.toFixed(2)} USDT
                </p>
              </div>
              <div className="text-right">
                  <p className={`text-xs uppercase tracking-[0.28em] ${text.muted}`}>
                    Started
                  </p>
                  <p className={`mt-1 text-sm font-medium ${text.primary}`}>
                  {formatDistanceToNow(new Date(subscription.startDate), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Progress</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {progress.toFixed(1)}% ({totalEarned.toFixed(2)} / {maxEarning.toFixed(2)} USDT)
                </span>
              </div>
                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-200/80 dark:bg-neutral-800">
                <div
                  className={cn(
                      "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all",
                    isCapReached
                        ? "from-emerald-500 via-emerald-400 to-emerald-300 dark:from-emerald-400 dark:via-emerald-300 dark:to-emerald-200"
                        : "from-emerald-400 via-teal-400 to-sky-400 dark:from-purple-500 dark:via-indigo-500 dark:to-cyan-500"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

              <div className="grid gap-4 border-t border-white/20 pt-4 dark:border-white/10 sm:grid-cols-3">
                <div className="rounded-xl border border-emerald-400/20 bg-white/80 p-3 backdrop-blur dark:border-purple-500/20 dark:bg-neutral-900/70">
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-600/80 dark:text-purple-200/70">
                    Daily ROI
                  </p>
                  <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{dailyROI}%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">≈ {dailyEarning.toFixed(2)} USDT / day</p>
                </div>
                <div className="rounded-xl border border-emerald-400/20 bg-white/80 p-3 backdrop-blur dark:border-purple-500/20 dark:bg-neutral-900/70">
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-600/80 dark:text-purple-200/70">
                    Earned
                  </p>
                  <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{totalEarned.toFixed(2)}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">of {maxEarning.toFixed(2)} USDT cap</p>
              </div>
                <div className="rounded-xl border border-emerald-400/20 bg-white/80 p-3 backdrop-blur dark:border-purple-500/20 dark:bg-neutral-900/70">
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-600/80 dark:text-purple-200/70">
                    Status
                  </p>
                  <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                    {isCapReached ? "Complete" : subscription.status === "active" ? "Running" : "Cooling"}
                </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {remainingCooldown ? `Cooldown ${remainingCooldown}` : "Rewards streaming"}
                  </p>
              </div>
            </div>

              <div className="space-y-3 border-t border-white/20 pt-4 dark:border-white/10">
              {subscription.status === "active" && !isCapReached && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRequestUnstake(subscription.id)}
                  disabled={requestUnstakeMutation.isPending}
                    className="w-full rounded-full border border-emerald-400/60 bg-white/70 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-white dark:border-purple-500/40 dark:bg-neutral-900/70 dark:text-purple-100"
                >
                    Request unsubscribe
                </Button>
              )}

              {subscription.status === "unstaking" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-2xl border border-orange-400/30 bg-orange-500/10 p-3 text-sm text-orange-700 backdrop-blur dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-200">
                      <Clock className="h-4 w-4" />
                      <div>
                        <p className={`text-xs ${text.muted}`}>Cooldown period</p>
                        <p className={`text-sm font-medium ${text.primary}`}>{remainingCooldown}</p>
                    </div>
                  </div>
                  {canCompleteUnstake && (
                    <Button
                      onClick={() => handleCompleteUnstake(subscription.id)}
                      disabled={completeUnstakeMutation.isPending}
                        className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold text-white shadow-lg hover:scale-[1.01] dark:from-purple-500 dark:to-indigo-500"
                    >
                        {completeUnstakeMutation.isPending ? "Processing…" : "Complete unsubscribe"}
                    </Button>
                  )}
                </div>
              )}

              {isCapReached && (
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm text-emerald-700 backdrop-blur dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-100">
                    <CheckCircle2 className="h-4 w-4" />
                    <p>Cap reached — subscription completed.</p>
                </div>
              )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ActiveStakesList;

