"use client";

import { trpc } from "@/trpc/client";
import { useThemeClasses } from "@/lib/theme-utils";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Users } from "lucide-react";

const PromotionRewards = () => {
  const { text, bg } = useThemeClasses();
  const { data: rewards, isLoading } = trpc.user.getPromotionRewards.useQuery();

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </Card>
    );
  }

  if (!rewards?.isRegistered) {
    return null;
  }

  // Type guard to check if teamStats exists
  const hasTeamStats = rewards && "teamStats" in rewards && rewards.teamStats !== undefined;
  const teamStats = hasTeamStats ? rewards.teamStats : null;

  const stats = [
    {
      label: "Package Rewards",
      value: rewards.packageRewards.length,
      icon: Gift,
      color: "text-green-500 dark:text-purple-400",
      bgColor: "bg-green-500/10 dark:bg-purple-500/10",
    },
    {
      label: "Team Rewards",
      value: rewards.teamRewards.length,
      icon: Users,
      color: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/10",
    },
  ];

  return (
    <Card className={cn("p-4 md:p-6 space-y-4 md:space-y-6", bg.card)}>
      <div>
        <h2 className={cn("text-xl md:text-2xl font-bold", text.primary)}>Your Rewards</h2>
        <p className={cn("text-xs md:text-sm mt-1", text.secondary)}>
          Track your earned promotion rewards
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={cn(
                "p-3 md:p-4 rounded-xl border",
                "bg-white dark:bg-neutral-900/50",
                "border-gray-200 dark:border-neutral-800"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className={cn("text-xs md:text-sm font-medium", text.secondary)}>
                    {stat.label}
                  </p>
                  <p className={cn("text-xl md:text-2xl font-bold", text.primary)}>
                    {stat.value}
                  </p>
                </div>
                <div className={cn("p-2 md:p-3 rounded-lg", stat.bgColor)}>
                  <Icon className={cn("h-5 w-5 md:h-6 md:w-6", stat.color)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reward Breakdown */}
      <div className="space-y-4">
        <h3 className={cn("text-base md:text-lg font-semibold", text.primary)}>Your Rewards</h3>

        {/* Package Purchase Rewards */}
        {rewards.packageRewards.length > 0 && (
          <div className="space-y-3">
            <h4 className={cn("text-xs md:text-sm font-medium uppercase tracking-wide", text.muted)}>
              Package Purchase Rewards
            </h4>
            <div className="space-y-2">
              {rewards.packageRewards.slice(0, 5).map((voucher: any) => (
                <div
                  key={voucher.id}
                  className={cn(
                    "p-3 md:p-4 rounded-lg border",
                    "bg-white dark:bg-neutral-900/50",
                    "border-gray-200 dark:border-neutral-800",
                    "flex items-center gap-3"
                  )}
                >
                  <div className={cn("p-2 rounded-lg flex-shrink-0", "bg-green-500/10 dark:bg-purple-500/10")}>
                    <Gift className={cn("h-4 w-4 md:h-5 md:w-5", "text-green-500 dark:text-purple-400")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm md:text-base font-semibold truncate", text.primary)}>
                      {voucher.title.replace(/\\$\d+/g, "").trim()}
                    </p>
                    <p className={cn("text-xs md:text-sm", text.secondary)}>
                      {voucher.roiValidityDays || "N/A"} days ROI
                    </p>
                  </div>
                  <div className={cn("flex-shrink-0")}>
                    <p className={cn("text-xs md:text-sm px-2 py-1 rounded-full", 
                      voucher.status === "used" 
                        ? "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400"
                        : "bg-green-100 dark:bg-purple-900/30 text-green-600 dark:text-purple-400"
                    )}>
                      {voucher.status === "used" ? "Used" : "Active"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Building Rewards */}
        {rewards.teamRewards.length > 0 && (
          <div className="space-y-3">
            <h4 className={cn("text-xs md:text-sm font-medium uppercase tracking-wide", text.muted)}>
              Team Building Rewards
            </h4>
            <div className="space-y-2">
              {rewards.teamRewards.slice(0, 5).map((voucher: any) => (
                <div
                  key={voucher.id}
                  className={cn(
                    "p-3 md:p-4 rounded-lg border",
                    "bg-white dark:bg-neutral-900/50",
                    "border-gray-200 dark:border-neutral-800",
                    "flex items-center gap-3"
                  )}
                >
                  <div className={cn("p-2 rounded-lg flex-shrink-0", "bg-blue-500/10 dark:bg-blue-500/10")}>
                    <Users className={cn("h-4 w-4 md:h-5 md:w-5", "text-blue-500 dark:text-blue-400")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm md:text-base font-semibold truncate", text.primary)}>
                      {voucher.title.replace(/\\$\d+/g, "").trim()}
                    </p>
                    <p className={cn("text-xs md:text-sm truncate", text.secondary)}>
                      {voucher.description?.replace(/\\$\d+/g, "").trim() || "Team building reward"}
                    </p>
                  </div>
                  <div className={cn("flex-shrink-0")}>
                    <p className={cn("text-xs md:text-sm px-2 py-1 rounded-full",
                      voucher.status === "used" 
                        ? "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    )}>
                      {voucher.status === "used" ? "Used" : "Active"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Stats */}
        {teamStats && (
          <>
            <div className={cn("p-3 md:p-4 rounded-lg border", "bg-white dark:bg-neutral-900/50", "border-gray-200 dark:border-neutral-800")}>
              <h4 className={cn("text-xs md:text-sm font-medium mb-3", text.primary)}>Team Progress</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div>
                  <p className={cn("text-xs", text.muted)}>Total Invites</p>
                  <p className={cn("text-lg md:text-xl font-bold mt-1", text.primary)}>
                    {teamStats.totalInvites}
                  </p>
                </div>
                <div>
                  <p className={cn("text-xs", text.muted)}>Activated</p>
                  <p className={cn("text-lg md:text-xl font-bold mt-1", "text-green-500 dark:text-purple-400")}>
                    {teamStats.activatedCount}
                  </p>
                </div>
                <div>
                  <p className={cn("text-xs", text.muted)}>Trial Node</p>
                  <p className={cn("text-lg md:text-xl font-bold mt-1", text.primary)}>
                    {teamStats.trialNodeCount}
                  </p>
                </div>
                <div>
                  <p className={cn("text-xs", text.muted)}>Silver+</p>
                  <p className={cn("text-lg md:text-xl font-bold mt-1", "text-purple-500 dark:text-purple-400")}>
                    {teamStats.silverPlusCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Indicators */}
            <div className="space-y-3">
              <h4 className={cn("text-xs md:text-sm font-medium uppercase tracking-wide", text.muted)}>
                Milestone Progress
              </h4>
              <div className="space-y-3">
                {/* 3 Members Milestone */}
                <div className="space-y-1.5 md:space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs md:text-sm font-medium", text.primary)}>3 Members Activated</span>
                    <span className={cn("text-xs md:text-sm font-bold", "text-green-500 dark:text-purple-400")}>
                      {Math.min(teamStats.activatedCount, 3)}/3
                    </span>
                  </div>
                  <div className="h-1.5 md:h-2 bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full transition-all", "bg-green-500 dark:bg-purple-500")}
                      style={{
                        width: `${Math.min((teamStats.activatedCount / 3) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 5 Trial Nodes Milestone */}
                <div className="space-y-1.5 md:space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs md:text-sm font-medium", text.primary)}>5 Trial Node Activations</span>
                    <span className={cn("text-xs md:text-sm font-bold", "text-green-500 dark:text-purple-400")}>
                      {Math.min(teamStats.trialNodeCount, 5)}/5
                    </span>
                  </div>
                  <div className="h-1.5 md:h-2 bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full transition-all", "bg-green-500 dark:bg-purple-500")}
                      style={{
                        width: `${Math.min((teamStats.trialNodeCount / 5) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 10 Members Milestone */}
                <div className="space-y-1.5 md:space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs md:text-sm font-medium", text.primary)}>10 Members Activated</span>
                    <span className={cn("text-xs md:text-sm font-bold", "text-green-500 dark:text-purple-400")}>
                      {Math.min(teamStats.activatedCount, 10)}/10
                    </span>
                  </div>
                  <div className="h-1.5 md:h-2 bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full transition-all", "bg-green-500 dark:bg-purple-500")}
                      style={{
                        width: `${Math.min((teamStats.activatedCount / 10) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 10 Members + 5 Silver Milestone */}
                <div className="space-y-1.5 md:space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs md:text-sm font-medium", text.primary)}>10 Members + 5 Silver Node</span>
                    <span className={cn("text-xs md:text-sm font-bold", "text-purple-500 dark:text-purple-400")}>
                      {Math.min(teamStats.silverPlusCount, 5)}/5 Silver
                    </span>
                  </div>
                  <div className="h-1.5 md:h-2 bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full transition-all", "bg-purple-500")}
                      style={{
                        width: `${Math.min((teamStats.silverPlusCount / 5) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default PromotionRewards;

