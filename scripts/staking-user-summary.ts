import prisma from "../src/lib/prismadb";
import fs from "fs";

/**
 * Staking User Summary Report
 *
 * Outputs per-user totals from `stakingEntry`:
 * - user display (name if available, otherwise userId)
 * - totalOnStake (active + unstaking)
 * - totalEarned (sum of totalEarned across all stakes)
 * - totalRemainingCap (sum of maxEarning - totalEarned across all stakes, clamped at 0)
 *
 * Also prints a per-stake breakdown (status/package/amount/earned/remaining).
 *
 * Run:
 *   npx tsx scripts/staking-user-summary.ts
 *
 * Options:
 *   --active-only          Only include active/unstaking stakes in totals and listing
 *   --out=FILE_PREFIX      Write FILE_PREFIX.json and FILE_PREFIX.csv (default: STAKING_USER_SUMMARY)
 */

type Args = {
  activeOnly: boolean;
  outPrefix: string;
};

function parseArgs(argv: string[]): Args {
  const activeOnly = argv.includes("--active-only");
  const outArg = argv.find((a) => a.startsWith("--out="));
  const outPrefix = outArg ? outArg.replace("--out=", "").trim() : "STAKING_USER_SUMMARY";
  return { activeOnly, outPrefix: outPrefix || "STAKING_USER_SUMMARY" };
}

function safeNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function userLabel(user: { id: string; name: string | null; username: string | null }): string {
  const name = (user.name ?? "").trim();
  if (name) return name;
  const username = (user.username ?? "").trim();
  if (username) return `@${username}`;
  return user.id;
}

function toCsvValue(value: unknown): string {
  const s = String(value ?? "");
  // Escape quotes/newlines/commas
  if (/[\",\n]/.test(s)) return `"${s.replace(/\"/g, "\"\"")}"`;
  return s;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const stakeWhere = args.activeOnly
    ? { status: { in: ["active", "unstaking"] } }
    : {};

  const stakes = await prisma.stakingEntry.findMany({
    where: stakeWhere as any,
    select: {
      id: true,
      userId: true,
      packageName: true,
      packageId: true,
      amount: true,
      status: true,
      totalEarned: true,
      maxEarning: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
    orderBy: [{ userId: "asc" }, { createdAt: "asc" }],
  });

  const userIds = Array.from(new Set(stakes.map((s) => s.userId)));
  const balances = await prisma.userBalance.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, balance: true },
  });
  const balanceByUserId = new Map(
    balances.map((b) => [b.userId, safeNumber(b.balance)])
  );

  const byUser = new Map<
    string,
    {
      userId: string;
      name: string | null;
      username: string | null;
      display: string;
      balance: number;
      totalOnStake: number;
      totalEarned: number;
      totalRemainingCap: number;
      stakes: Array<{
        id: string;
        packageName: string | null;
        packageId: number;
        amount: number;
        status: string;
        totalEarned: number;
        maxEarning: number;
        remainingCap: number;
        createdAt: string;
      }>;
    }
  >();

  for (const s of stakes) {
    const amount = safeNumber(s.amount);
    const earned = safeNumber(s.totalEarned);
    const maxEarning = safeNumber(s.maxEarning);
    const remainingCap = Math.max(0, maxEarning - earned);

    const user = s.user ?? { id: s.userId, name: null, username: null };
    const existing =
      byUser.get(s.userId) ??
      ({
        userId: s.userId,
        name: user.name ?? null,
        username: user.username ?? null,
        display: userLabel(user),
        balance: balanceByUserId.get(s.userId) ?? 0,
        totalOnStake: 0,
        totalEarned: 0,
        totalRemainingCap: 0,
        stakes: [],
      } as const);

    // On-stake definition: active/unstaking only (even when listing all)
    const onStake =
      s.status === "active" || s.status === "unstaking" ? amount : 0;

    const updated = {
      ...existing,
      totalOnStake: existing.totalOnStake + onStake,
      totalEarned: existing.totalEarned + earned,
      totalRemainingCap: existing.totalRemainingCap + remainingCap,
      stakes: [
        ...existing.stakes,
        {
          id: s.id,
          packageName: s.packageName ?? null,
          packageId: s.packageId,
          amount,
          status: s.status,
          totalEarned: earned,
          maxEarning,
          remainingCap,
          createdAt: s.createdAt.toISOString(),
        },
      ],
    };

    byUser.set(s.userId, updated);
  }

  const users = Array.from(byUser.values()).sort(
    (a, b) => b.totalOnStake - a.totalOnStake
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    filters: {
      activeOnly: args.activeOnly,
      onStakeDefinition: "active + unstaking stakes",
    },
    totals: {
      users: users.length,
      stakes: stakes.length,
      totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
      totalOnStake: users.reduce((sum, u) => sum + u.totalOnStake, 0),
      totalEarned: users.reduce((sum, u) => sum + u.totalEarned, 0),
      totalRemainingCap: users.reduce((sum, u) => sum + u.totalRemainingCap, 0),
    },
    users,
  };

  // Console summary (high signal)
  // eslint-disable-next-line no-console
  console.log("📊 Staking User Summary");
  // eslint-disable-next-line no-console
  console.log(`Users: ${summary.totals.users}`);
  // eslint-disable-next-line no-console
  console.log(`Stakes: ${summary.totals.stakes}`);
  // eslint-disable-next-line no-console
  console.log(`Total wallet balance: ${summary.totals.totalBalance.toFixed(2)} USDT`);
  // eslint-disable-next-line no-console
  console.log(`Total on stake: ${summary.totals.totalOnStake.toFixed(2)} USDT`);
  // eslint-disable-next-line no-console
  console.log(`Total earned: ${summary.totals.totalEarned.toFixed(2)} USDT`);
  // eslint-disable-next-line no-console
  console.log(
    `Total remaining cap: ${summary.totals.totalRemainingCap.toFixed(2)} USDT`
  );
  // eslint-disable-next-line no-console
  console.log("");

  // Write JSON
  const jsonPath = `${args.outPrefix}.json`;
  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2), "utf8");

  // Write CSV (per-user totals)
  const csvPath = `${args.outPrefix}.csv`;
  const csvHeader = [
    "userId",
    "display",
    "name",
    "username",
    "balance",
    "totalOnStake",
    "totalEarned",
    "totalRemainingCap",
    "stakesCount",
  ];
  const csvLines = [
    csvHeader.join(","),
    ...users.map((u) =>
      [
        u.userId,
        u.display,
        u.name ?? "",
        u.username ?? "",
        u.balance.toFixed(8),
        u.totalOnStake.toFixed(8),
        u.totalEarned.toFixed(8),
        u.totalRemainingCap.toFixed(8),
        u.stakes.length,
      ]
        .map(toCsvValue)
        .join(",")
    ),
  ];
  fs.writeFileSync(csvPath, csvLines.join("\n"), "utf8");

  // eslint-disable-next-line no-console
  console.log(`✅ Wrote ${jsonPath} and ${csvPath}`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("❌ Script failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

