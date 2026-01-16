"use client";

import { useMemo } from "react";
import { trpc } from "@/trpc/client";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Award, Medal, Trophy } from "lucide-react";

function initials(name?: string | null, username?: string | null): string {
  const base = (name ?? username ?? "User").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

function TopBadge({ rank }: { rank: 1 | 2 | 3 }) {
  if (rank === 1) {
    return (
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
        <Trophy className="h-5 w-5" />
        <span className="text-sm font-semibold">#1</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
        <Medal className="h-5 w-5" />
        <span className="text-sm font-semibold">#2</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
      <Award className="h-5 w-5" />
      <span className="text-sm font-semibold">#3</span>
    </div>
  );
}

const RankPageContent = () => {
  // Leaderboard: activation = Bronze Node or higher (packageId >= 1, amount >= $100).
  // Weekly resets every Sunday 6:00 PM PKT (Asia/Karachi).
  const { data, isLoading, error } = trpc.user.getInviteLeaderboard.useQuery({
    limit: 50,
    minStake: 100,
    minPackageId: 1,
  });

  const rows = useMemo(() => data?.top ?? [], [data?.top]);
  const top3 = rows.slice(0, 3);
  const next7 = rows.slice(3, 10); // ranks 4-10 (7 rows)

  return (
    <div className="space-y-6">
      <Card className="p-5 md:p-6">
        <div className="flex flex-col gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Rank Leaderboard
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Ranked by activated invites (invitees who created a Bronze Node stake or higher).
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Resets every Sunday 6:00 PM (PKT)
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your rank</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {data?.me.rank ? `#${data.me.rank}` : "—"}
              <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                ({data?.me.activatedInvites ?? 0} activated invites)
              </span>
            </p>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Weekly (PKT reset)
          </div>
        </div>
      </Card>

      {/* Top 3 - prominent (mobile-first cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[1, 2, 3].map((rank) => {
          const row = top3[rank - 1];
          return (
            <Card key={rank} className="p-4 md:p-5">
              <div className="flex items-center justify-between">
                <TopBadge rank={rank as 1 | 2 | 3} />
                <div className="text-right">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Activated invites
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {row?.activatedInvites ?? 0}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                {row?.image ? (
                  <Image
                    src={row.image}
                    alt={row.name ?? row.username ?? "User"}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-200">
                    {initials(row?.name, row?.username)}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {row?.name ?? row?.username ?? "Open slot"}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {row?.inviteCode ? `Invite code: ${row.inviteCode}` : "Invite & activate users to appear here"}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-sm text-gray-600 dark:text-gray-400">
            Loading leaderboard…
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600 dark:text-red-400">
            {error.message}
          </div>
        ) : (
          <>
            {/* Mobile: compact list of ranks 4-10 */}
            <div className="md:hidden">
              {next7.length ? (
                <div className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {next7.map((row) => (
                    <div key={row.userId} className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 w-10">
                          #{row.rank}
                        </div>
                        {row.image ? (
                          <Image
                            src={row.image}
                            alt={row.name ?? row.username ?? "User"}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-200">
                            {initials(row.name, row.username)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {row.name ?? row.username ?? "User"}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {row.inviteCode ? `Code: ${row.inviteCode}` : "—"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Invites</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {row.activatedInvites}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-gray-600 dark:text-gray-400">
                  Not enough users yet — invite and activate friends to reach Top 10.
                </div>
              )}
            </div>

            {/* Desktop: table for ranks 4-10 */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="w-[180px] text-right">
                      Activated invites
                    </TableHead>
                    <TableHead className="w-[180px] text-right">Invite code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {next7.length ? (
                    next7.map((row) => (
                      <TableRow key={row.userId}>
                        <TableCell className="font-semibold">#{row.rank}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {row.image ? (
                              <Image
                                src={row.image}
                                alt={row.name ?? row.username ?? "User"}
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-200">
                                {initials(row.name, row.username)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {row.name ?? row.username ?? "User"}
                              </div>
                              {row.username ? (
                                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  @{row.username}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {row.activatedInvites}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.inviteCode ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="p-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        Not enough users yet — invite and activate friends to reach Top 10.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default RankPageContent;

