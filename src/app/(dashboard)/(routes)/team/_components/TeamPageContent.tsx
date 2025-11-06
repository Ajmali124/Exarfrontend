"use client";

import { useThemeClasses } from "@/lib/theme-utils";
import { Users, Trophy, TrendingUp } from "lucide-react";
import { trpc } from "@/trpc/client";
import TeamLevelAccordion from "./TeamLevelAccordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const TeamPageContent = () => {
  const { text, bg, border } = useThemeClasses();

  const { data: stats, isLoading: statsLoading } =
    trpc.user.getTeamStats.useQuery();

  const totalMembers =
    stats?.reduce((acc, stat) => acc + stat.count, 0) || 0;

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
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${text.primary}`}>My Team</h1>
            <p className={`text-sm ${text.secondary}`}>
              Manage and view your team members across all levels
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Members */}
        <Card
          className={`
            ${bg.card} ${border.primary} border
            p-4
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${text.muted} mb-1`}>Total Members</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className={`text-2xl font-bold ${text.primary}`}>
                  {totalMembers.toLocaleString()}
                </p>
              )}
            </div>
            <div
              className={`
                p-3 rounded-lg
                bg-green-100 dark:bg-purple-500/20
                text-green-600 dark:text-purple-400
              `}
            >
              <Users className="h-6 w-6" />
            </div>
          </div>
        </Card>

        {/* Active Levels */}
        <Card
          className={`
            ${bg.card} ${border.primary} border
            p-4
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${text.muted} mb-1`}>Active Levels</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className={`text-2xl font-bold ${text.primary}`}>
                  {stats?.filter((s) => s.count > 0).length || 0}/10
                </p>
              )}
            </div>
            <div
              className={`
                p-3 rounded-lg
                bg-green-100 dark:bg-purple-500/20
                text-green-600 dark:text-purple-400
              `}
            >
              <Trophy className="h-6 w-6" />
            </div>
          </div>
        </Card>

        {/* Level 1 Members */}
        <Card
          className={`
            ${bg.card} ${border.primary} border
            p-4
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${text.muted} mb-1`}>Direct Referrals</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className={`text-2xl font-bold ${text.primary}`}>
                  {stats?.[0]?.count.toLocaleString() || 0}
                </p>
              )}
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
      </div>

      {/* Team Levels Accordions */}
      <div className="space-y-2">
        <h2 className={`text-lg font-semibold ${text.primary} mb-4`}>
          Team by Level
        </h2>
        <div className="space-y-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
            <TeamLevelAccordion key={level} level={level} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamPageContent;

