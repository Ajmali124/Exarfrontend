"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useThemeClasses } from "@/lib/theme-utils";
import {
  Users,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  Sparkles,
  Rocket,
  Crown,
  Gem,
  Shield,
  Target,
  Zap,
  Medal,
  Flame,
  Star,
} from "lucide-react";
import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface TeamLevelAccordionProps {
  level: number;
}

const LEVEL_ICONS: LucideIcon[] = [
  Sparkles,
  Rocket,
  Crown,
  Gem,
  Shield,
  Target,
  Zap,
  Medal,
  Flame,
  Star,
];

const TeamLevelAccordion = ({ level }: TeamLevelAccordionProps) => {
  const { text, bg, border } = useThemeClasses();
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data, isLoading, isFetching } = trpc.user.getTeamMembers.useQuery({
    level,
    page,
    limit,
  });

  const formatDate = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const LevelIcon: LucideIcon =
    LEVEL_ICONS[(level - 1) % LEVEL_ICONS.length] ?? Users;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value={`level-${level}`}
        className={`${border.primary} border rounded-lg mb-3 overflow-hidden`}
      >
        <AccordionTrigger
          className={cn(
            bg.card,
            text.primary,
            "px-4 py-3 hover:no-underline",
            "hover:bg-gray-50 dark:hover:bg-neutral-800"
          )}
        >
          <div className="flex items-center gap-3 w-full">
            <div
              className={cn(
                "p-2 rounded-lg",
                "bg-emerald-100 text-emerald-600 dark:bg-purple-500/20 dark:text-purple-300"
              )}
            >
              <LevelIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Level {level}</span>
                {isLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <span className={`text-xs ${text.muted}`}>
                    {data?.total || 0} members
                  </span>
                )}
              </div>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className={`${bg.card} p-0`}>
          {isLoading || isFetching ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !data || data.members.length === 0 ? (
            <div className="p-8 text-center">
              <User className={`h-12 w-12 mx-auto mb-3 ${text.muted}`} />
              <p className={text.muted}>No members at this level yet</p>
            </div>
          ) : (
            <>
              <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {data.members.map((member) => (
                  <Card
                    key={member.id}
                    className={cn(
                      bg.card,
                      border.primary,
                      "border p-3 transition-colors",
                      "hover:bg-gray-50 dark:hover:bg-neutral-800"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={member.user.image || undefined}
                          alt={member.user.name || "User"}
                        />
                        <AvatarFallback
                          className={`
                            bg-green-100 dark:bg-purple-500/20
                            text-green-600 dark:text-purple-400
                            font-semibold
                          `}
                        >
                          {getInitials(member.user.name || member.email)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Member Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold ${text.primary} truncate`}>
                            {member.user.username ||
                              member.user.name ||
                              `${member.firstName} ${member.lastName}`}
                          </h4>
                        </div>

                        <div className="space-y-1.5">
                          {/* Join Date */}
                          <div className="flex items-center gap-2 text-xs">
                            <Calendar className={`h-3 w-3 ${text.muted}`} />
                            <span className={text.muted}>
                              Joined {formatDate(member.joinDate)}
                            </span>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <DollarSign className={`h-3 w-3 ${text.muted}`} />
                              <span className={`text-xs ${text.secondary}`}>
                                ${member.balance.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <TrendingUp className={`h-3 w-3 ${text.muted}`} />
                              <span className={`text-xs ${text.secondary}`}>
                                Daily: ${member.dailyEarning.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div
                  className={`
                    ${border.primary} border-t
                    ${bg.secondary}
                    p-4 flex items-center justify-between
                  `}
                >
                  <p className={`text-sm ${text.secondary}`}>
                    Showing {((page - 1) * limit) + 1}-
                    {Math.min(page * limit, data.total)} of {data.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || isFetching}
                      className={cn(
                        border.primary,
                        text.secondary
                      )}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(data.totalPages, p + 1))
                      }
                      disabled={page === data.totalPages || isFetching}
                      className={cn(
                        border.primary,
                        text.secondary
                      )}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default TeamLevelAccordion;

