import prisma from "@/lib/prismadb";
import { calculateDailyEarning } from "@/lib/staking-packages";
import { Prisma, StakingEntry } from "@prisma/client";

export interface DistributionOptions {
  userId?: string;
}

export interface EntryDistributionResult {
  entryId: string;
  packageName: string;
  payout: number;
  reachedCap: boolean;
}

export interface UserDistributionResult {
  userId: string;
  totalRewarded: number;
  entries: EntryDistributionResult[];
  onStakingReleased: number;
}

export interface DistributionSummary {
  totalUsers: number;
  totalEntries: number;
  totalRewarded: number;
  results: UserDistributionResult[];
}

type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function processUserEntries(
  tx: PrismaTransaction,
  userId: string,
  entries: StakingEntry[]
): Promise<UserDistributionResult> {
  const balance = await tx.userBalance.findUnique({
    where: { userId },
    select: { userId: true },
  });

  if (!balance) {
    throw new Error(`User balance not found for ${userId}`);
  }

  await tx.userBalance.update({
    where: { userId },
    data: {
      dailyEarning: 0,
      latestEarning: 0,
    },
  });

  let totalRewarded = 0;
  let onStakingReleased = 0;
  let overflowTotal = 0;
  const entryResults: EntryDistributionResult[] = [];

  for (const entry of entries) {
    const amount = entry.amount ?? 0;
    const roi = entry.dailyROI ?? 0;
    const maxEarning = entry.maxEarning ?? 0;
    const totalEarned = entry.totalEarned ?? 0;

    const remainingCap = Math.max(0, maxEarning - totalEarned);
    if (remainingCap <= 0) {
      if (entry.status !== "completed") {
        await tx.stakingEntry.update({
          where: { id: entry.id },
          data: {
            status: "completed",
            endDate: entry.endDate ?? new Date(),
          },
        });
      }
      onStakingReleased += amount;
      continue;
    }

    const rawPayout = calculateDailyEarning(amount, roi);
    const payout = Math.min(rawPayout, remainingCap);
    if (payout <= 0) {
      continue;
    }
    const overflowAmount = Math.max(0, rawPayout - payout);
    if (overflowAmount > 0) {
      overflowTotal += overflowAmount;
    }

    const newTotalEarned = totalEarned + payout;
    const reachedCap = newTotalEarned >= maxEarning;

    await tx.stakingEntry.update({
      where: { id: entry.id },
      data: {
        totalEarned: newTotalEarned,
        status: reachedCap ? "completed" : entry.status,
        endDate: reachedCap ? new Date() : entry.endDate,
      },
    });

    await tx.transactionRecord.create({
      data: {
        userId,
        type: "dailyReward",
        amount: payout,
        currency: entry.currency ?? "USDT",
        status: "completed",
        description: `Daily ROI for ${entry.packageName ?? "staking package"}`,
      },
    });

    totalRewarded += payout;
    if (reachedCap) {
      onStakingReleased += amount;
    }

    entryResults.push({
      entryId: entry.id,
      packageName: entry.packageName ?? "Unknown package",
      payout,
      reachedCap,
    });
  }

  if (totalRewarded > 0 || onStakingReleased > 0 || overflowTotal > 0) {
    const balanceUpdate: Prisma.UserBalanceUpdateInput = {};

    if (totalRewarded > 0) {
      balanceUpdate.balance = { increment: totalRewarded };
      balanceUpdate.dailyEarning = { increment: totalRewarded };
      balanceUpdate.latestEarning = totalRewarded;
    }

    if (onStakingReleased > 0) {
      balanceUpdate.onStaking = { decrement: onStakingReleased };
    }

    if (overflowTotal > 0) {
      balanceUpdate.missedEarnings = { increment: overflowTotal };
    }

    await tx.userBalance.update({
      where: { userId },
      data: balanceUpdate,
    });
  }

  return {
    userId,
    totalRewarded,
    entries: entryResults,
    onStakingReleased,
  };
}

export async function distributeDailyStakingRewards(
  options: DistributionOptions = {}
): Promise<DistributionSummary> {
  const { userId } = options;

  const entries = await prisma.stakingEntry.findMany({
    where: {
      status: "active",
      ...(userId ? { userId } : {}),
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (entries.length === 0) {
    return {
      totalUsers: 0,
      totalEntries: 0,
      totalRewarded: 0,
      results: [],
    };
  }

  const entriesByUser = entries.reduce<Map<string, StakingEntry[]>>((acc, entry) => {
    const userEntries = acc.get(entry.userId) ?? [];
    userEntries.push(entry);
    acc.set(entry.userId, userEntries);
    return acc;
  }, new Map());

  const summary: DistributionSummary = {
    totalUsers: 0,
    totalEntries: 0,
    totalRewarded: 0,
    results: [],
  };

  for (const [entryUserId, userEntries] of entriesByUser.entries()) {
    const result = await prisma.$transaction((tx) =>
      processUserEntries(tx, entryUserId, userEntries)
    );

    if (result.entries.length > 0 || result.onStakingReleased > 0) {
      summary.totalUsers += 1;
      summary.totalEntries += result.entries.length;
      summary.totalRewarded += result.totalRewarded;
      summary.results.push(result);
    }
  }

  return summary;
}

