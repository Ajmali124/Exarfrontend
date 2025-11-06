"use client";

import { useThemeClasses } from "@/lib/theme-utils";
import { trpc } from "@/trpc/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, TrendingUp, Zap, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const ActiveStakesList = () => {
  const { text, bg, border } = useThemeClasses();

  const utils = trpc.useUtils();
  const {
    data: stakes,
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

  const handleRequestUnstake = (stakeId: string) => {
    if (
      confirm(
        "Are you sure you want to unsubscribe? This will start a 3-day cooldown period with no ROI distribution."
      )
    ) {
      requestUnstakeMutation.mutate({ stakeId });
    }
  };

  const handleCompleteUnstake = (stakeId: string) => {
    completeUnstakeMutation.mutate({ stakeId });
  };

  const getRemainingCooldown = (cooldownEndDate: Date | null) => {
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
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card
        className={cn(
          bg.card,
          border.primary,
          "border p-8 text-center"
        )}
      >
        <div className="text-red-500 dark:text-red-400 mb-2">
          <Zap className="h-12 w-12 mx-auto mb-3" />
        </div>
        <p className={text.primary}>Error loading subscriptions</p>
        <p className={`text-sm ${text.muted} mt-1`}>
          {error.message || "Please try again later"}
        </p>
      </Card>
    );
  }

  // Handle empty state - no stakes
  if (!stakes || stakes.length === 0) {
    return (
      <Card
        className={cn(
          bg.card,
          border.primary,
          "border p-8 text-center"
        )}
      >
        <Zap className={`h-12 w-12 mx-auto mb-3 ${text.muted}`} />
        <p className={`${text.primary} font-medium mb-1`}>
          No active subscriptions yet
        </p>
        <p className={`text-sm ${text.muted} mt-1`}>
          Create your first subscription from the Packages tab
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {stakes.map((stake) => {
        // Safety checks for edge cases
        const totalEarned = stake.totalEarned ?? 0;
        const maxEarning = stake.maxEarning ?? 0;
        const dailyROI = stake.dailyROI ?? 0;
        const amount = stake.amount ?? 0;

        // Calculate progress safely (handle division by zero)
        const progress =
          maxEarning > 0
            ? Math.min((totalEarned / maxEarning) * 100, 100)
            : 0;

        const isCapReached = totalEarned >= maxEarning;
        const dailyEarning = (amount * dailyROI) / 100;
        const remainingCooldown = getRemainingCooldown(stake.cooldownEndDate);
        const canCompleteUnstake =
          stake.status === "unstaking" &&
          stake.cooldownEndDate &&
          new Date() >= new Date(stake.cooldownEndDate);

        return (
          <Card
            key={stake.id}
            className={cn(
              bg.card,
              border.primary,
              "border p-4 space-y-4"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-semibold ${text.primary}`}>
                    {stake.packageName}
                  </h3>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      stake.status === "active"
                        ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                        : "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400"
                    )}
                  >
                    {stake.status === "active" ? "Active" : "Unsubscribing"}
                  </span>
                </div>
                <p className={`text-sm ${text.muted}`}>
                  Subscribed {amount.toFixed(2)} USDT
                </p>
              </div>
              <div className="text-right">
                <p className={`text-xs ${text.muted}`}>Started</p>
                <p className={`text-sm ${text.secondary}`}>
                  {formatDistanceToNow(new Date(stake.startDate), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className={text.muted}>Progress</span>
                <span className={text.secondary}>
                  {progress.toFixed(1)}% ({totalEarned.toFixed(2)} /{" "}
                  {maxEarning.toFixed(2)} USDT)
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-700">
                <div
                  className={cn(
                    "h-full transition-all",
                    isCapReached
                      ? "bg-green-500 dark:bg-green-400"
                      : "bg-green-500 dark:bg-green-400"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-200 dark:border-neutral-700">
              <div>
                <p className={`text-xs ${text.muted} mb-1`}>Daily ROI</p>
                <p className={`text-sm font-semibold ${text.primary}`}>
                  {dailyROI}%
                </p>
                <p className={`text-xs ${text.secondary}`}>
                  ≈ {dailyEarning.toFixed(2)}/day
                </p>
              </div>
              <div>
                <p className={`text-xs ${text.muted} mb-1`}>Earned</p>
                <p className={`text-sm font-semibold ${text.primary}`}>
                  {totalEarned.toFixed(2)}
                </p>
                <p className={`text-xs ${text.secondary}`}>USDT</p>
              </div>
              <div>
                <p className={`text-xs ${text.muted} mb-1`}>Max Cap</p>
                <p className={`text-sm font-semibold ${text.primary}`}>
                  {maxEarning.toFixed(2)}
                </p>
                <p className={`text-xs ${text.secondary}`}>USDT</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-gray-200 dark:border-neutral-700">
              {stake.status === "active" && !isCapReached && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRequestUnstake(stake.id)}
                  disabled={requestUnstakeMutation.isPending}
                  className={cn(
                    "w-full",
                    border.primary,
                    text.secondary
                  )}
                >
                  Request Unsubscribe
                </Button>
              )}
              {stake.status === "unstaking" && (
                <div className="space-y-2">
                  <div
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg",
                      "bg-orange-50 dark:bg-orange-500/10"
                    )}
                  >
                    <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <div className="flex-1">
                      <p className={`text-xs ${text.muted}`}>
                        Cooldown Period
                      </p>
                      <p className={`text-sm font-medium ${text.primary}`}>
                        {remainingCooldown}
                      </p>
                    </div>
                  </div>
                  {canCompleteUnstake && (
                    <Button
                      onClick={() => handleCompleteUnstake(stake.id)}
                      disabled={completeUnstakeMutation.isPending}
                      className={cn(
                        "w-full",
                        "bg-gradient-to-r from-green-500 to-teal-500",
                        "dark:from-purple-500 dark:to-purple-600",
                        "text-white"
                      )}
                    >
                      {completeUnstakeMutation.isPending
                        ? "Processing..."
                        : "Complete Unsubscribe"}
                    </Button>
                  )}
                </div>
              )}
              {isCapReached && (
                <div
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg",
                    "bg-green-50 dark:bg-green-500/10"
                  )}
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <p className={`text-sm ${text.primary}`}>
                    Cap reached - Subscription completed
                  </p>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ActiveStakesList;

