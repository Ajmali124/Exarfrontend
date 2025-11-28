"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, DollarSign } from "lucide-react";
import { trpc } from "@/trpc/client";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useThemeClasses } from "@/lib/theme-utils";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface TeamEarningsContentProps {
  date: string; // YYYY-MM-DD format
}

// Helper function to truncate email for mobile display (e.g., "aj***@gmail.com")
const truncateEmail = (email: string): string => {
  if (!email || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  if (local.length <= 2) return email;
  return `${local.slice(0, 2)}***@${domain}`;
};

// Helper function to format amount with up to 5 decimal places, removing trailing zeros
const formatEarnings = (amount: number): string => {
  // Format to 5 decimal places and remove trailing zeros
  const formatted = amount.toFixed(5);
  return formatted.replace(/\.?0+$/, "") || "0";
};

const TeamEarningsContent = ({ date }: TeamEarningsContentProps) => {
  const router = useRouter();
  const { text } = useThemeClasses();

  const { data, isLoading, error } = trpc.user.getTeamEarningsByDate.useQuery(
    { date },
    {
      retry: 1,
    }
  );

  const formattedDate = format(new Date(date), "EEEE, MMMM d, yyyy");

  // Sort earnings by level (1, 2, 3, ...) in ascending order
  const sortedEarnings = useMemo(() => {
    if (!data?.earnings) return [];
    return [...data.earnings].sort((a, b) => a.level - b.level);
  }, [data?.earnings]);

  if (isLoading) {
    return (
      <div className="space-y-4 px-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4">
        <Card className="p-4 md:p-6 text-center">
          <p className={`text-sm md:text-base ${text.primary}`}>Error loading team earnings</p>
          <p className={`text-xs md:text-sm ${text.muted} mt-2`}>
            {error.message || "Please try again later"}
          </p>
          <Button
            onClick={() => router.back()}
            className="mt-4"
            variant="outline"
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  if (!data || data.earnings.length === 0) {
    return (
      <div className="space-y-4 px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className={`text-xl md:text-2xl font-bold ${text.primary}`}>Team Earnings</h1>
            <p className={`text-xs md:text-sm ${text.muted}`}>{formattedDate}</p>
          </div>
        </div>

        <Card className="p-6 md:p-8 text-center">
          <Users className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 text-gray-400" />
          <p className={`text-sm md:text-base ${text.primary}`}>No team earnings for this date</p>
          <p className={`text-xs md:text-sm ${text.muted} mt-2`}>
            There were no team earnings recorded on {formattedDate}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full h-9 w-9 md:h-10 md:w-10"
        >
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
        <div>
          <h1 className={`text-xl md:text-2xl font-bold ${text.primary}`}>Team Earnings</h1>
          <p className={`text-xs md:text-sm ${text.muted}`}>{formattedDate}</p>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="p-4 md:p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-[10px] md:text-sm ${text.muted} uppercase tracking-wide`}>Total Earnings</p>
              <p className={`text-lg md:text-2xl font-bold ${text.primary} break-all`}>
                {formatEarnings(data.total)} USDT
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className={`text-[10px] md:text-sm ${text.muted} uppercase tracking-wide`}>Contributions</p>
            <p className={`text-lg md:text-xl font-semibold ${text.primary}`}>
              {data.earnings.length}
            </p>
          </div>
        </div>
      </Card>

      {/* Earnings List */}
      <Card className="p-4 md:p-6">
        <h2 className={`text-base md:text-lg font-semibold mb-3 md:mb-4 ${text.primary}`}>
          Earnings Breakdown
        </h2>
        <div className="space-y-2 md:space-y-3">
          {sortedEarnings.map((earning, index) => {
            const userEmail = earning.sourceUser?.email || "";
            const userName = earning.sourceUser?.name || "Unknown User";
            
            return (
              <div
                key={earning.id}
                className={cn(
                  "flex items-center justify-between p-3 md:p-4 rounded-lg border",
                  "bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
                )}
              >
                <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] md:text-sm font-semibold text-purple-400">
                      L{earning.level}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm md:text-base font-semibold ${text.primary} truncate`}>
                      {userName}
                    </p>
                    <p className={`text-[10px] md:text-xs ${text.muted} truncate`}>
                      Level {earning.level} • <span className="hidden md:inline">{userEmail || "N/A"}</span>
                      <span className="md:hidden">{userEmail ? truncateEmail(userEmail) : "N/A"}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className={`text-sm md:text-lg font-bold text-emerald-400 whitespace-nowrap`}>
                    +{formatEarnings(earning.amount)} USDT
                  </p>
                  <p className={`text-[10px] md:text-xs ${text.muted}`}>
                    {format(new Date(earning.createdAt), "HH:mm")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default TeamEarningsContent;

