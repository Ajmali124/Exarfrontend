import prisma from "@/lib/prismadb";
import { Prisma, StakingEntry } from "@prisma/client";

const TEAM_LEVEL_PERCENTS = [0.1, 0.05, 0.03, 0.02, 0.01, 0.01];

interface ContributionBreakdown {
  sourceUserId: string;
  level: number;
  amount: number;
}

interface SponsorReward {
  totalAmount: number;
  contributions: ContributionBreakdown[];
}

export interface TeamDistributionSummary {
  rewardedUsers: number;
  totalRewarded: number;
  totalMissed: number;
  totalEntriesUpdated: number;
  recordsLogged: number;
}

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function applyRewardToUser(
  tx: Tx,
  userId: string,
  reward: SponsorReward
) {
  const amount = reward.totalAmount;
  let remaining = amount;
  let credited = 0;
  let missed = 0;
  let onStakingReleased = 0;
  let entriesUpdated = 0;
  const creditedBreakdown: ContributionBreakdown[] = [];

  const balance = await tx.userBalance.findUnique({
    where: { userId },
  });

  if (!balance || amount <= 0) {
    missed = amount;
    return { credited, missed, released: onStakingReleased, entriesUpdated, recordsLogged: 0 };
  }

  const entries = await tx.stakingEntry.findMany({
    where: {
      userId,
      status: "active",
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  for (const entry of entries) {
    if (remaining <= 0) {
      break;
    }

    const maxEarning = entry.maxEarning ?? 0;
    const totalEarned = entry.totalEarned ?? 0;
    const remainingCap = Math.max(0, maxEarning - totalEarned);

    if (remainingCap <= 0) {
      continue;
    }

    const applied = Math.min(remaining, remainingCap);
    const newTotal = totalEarned + applied;
    const reachedCap = newTotal >= maxEarning;

    await tx.stakingEntry.update({
      where: { id: entry.id },
      data: {
        totalEarned: newTotal,
        status: reachedCap ? "completed" : entry.status,
        endDate: reachedCap ? new Date() : entry.endDate,
      },
    });

    entriesUpdated += 1;
    credited += applied;
    remaining -= applied;

    if (reachedCap) {
      onStakingReleased += entry.amount ?? 0;
    }
  }

  missed = remaining;

  const balanceUpdate: Prisma.UserBalanceUpdateInput = {};
  if (credited > 0) {
    balanceUpdate.balance = { increment: credited };
    balanceUpdate.teamEarning = { increment: credited };
  }
  if (onStakingReleased > 0) {
    balanceUpdate.onStaking = { decrement: onStakingReleased };
  }
  if (missed > 0) {
    balanceUpdate.missedEarnings = { increment: missed };
  }

  if (Object.keys(balanceUpdate).length > 0) {
    await tx.userBalance.update({
      where: { userId },
      data: balanceUpdate,
    });
  }

  if (credited > 0 && reward.contributions.length > 0) {
    let creditRemaining = credited;
    for (const contribution of reward.contributions) {
      if (creditRemaining <= 0) break;
      const applied = Math.min(contribution.amount, creditRemaining);
      if (applied <= 0) continue;
      creditedBreakdown.push({
        sourceUserId: contribution.sourceUserId,
        level: contribution.level,
        amount: applied,
      });
      creditRemaining -= applied;
    }

    if (creditedBreakdown.length > 0) {
      await tx.teamEarningRecord.createMany({
        data: creditedBreakdown.map((record) => ({
          userId,
          sourceUserId: record.sourceUserId,
          level: record.level,
          amount: record.amount,
        })),
      });
    }
  }

  return {
    credited,
    missed,
    released: onStakingReleased,
    entriesUpdated,
    recordsLogged: creditedBreakdown.length,
  };
}

export async function distributeTeamEarnings(): Promise<TeamDistributionSummary> {
  const earners = await prisma.userBalance.findMany({
    where: {
      dailyEarning: {
        gt: 0,
      },
    },
    select: {
      userId: true,
      dailyEarning: true,
    },
  });

  if (earners.length === 0) {
    return {
      rewardedUsers: 0,
      totalRewarded: 0,
      totalMissed: 0,
      totalEntriesUpdated: 0,
      recordsLogged: 0,
    };
  }

  const invitedMembers = await prisma.invitedMember.findMany({
    select: {
      userId: true,
      sponsorId: true,
    },
  });

  const sponsorMap = new Map(invitedMembers.map((item) => [item.userId, item.sponsorId]));

  const rewardAccumulator = new Map<string, SponsorReward>();

  for (const earner of earners) {
    let currentSponsor = sponsorMap.get(earner.userId);
    for (let level = 0; level < TEAM_LEVEL_PERCENTS.length; level++) {
      if (!currentSponsor) {
        break;
      }

      const percent = TEAM_LEVEL_PERCENTS[level];
      const reward = earner.dailyEarning * percent;
      if (reward > 0) {
        const entry = rewardAccumulator.get(currentSponsor) ?? {
          totalAmount: 0,
          contributions: [],
        };
        entry.totalAmount += reward;
        entry.contributions.push({
          sourceUserId: earner.userId,
          level: level + 1,
          amount: reward,
        });
        rewardAccumulator.set(currentSponsor, entry);
      }

      currentSponsor = sponsorMap.get(currentSponsor);
    }
  }

  let rewardedUsers = 0;
  let totalRewarded = 0;
  let totalMissed = 0;
  let totalEntriesUpdated = 0;
  let recordsLogged = 0;

  for (const [userId, reward] of rewardAccumulator.entries()) {
    if (reward.totalAmount <= 0) continue;

    const result = await prisma.$transaction((tx) =>
      applyRewardToUser(tx, userId, reward)
    );

    if (result.credited > 0 || result.missed > 0) {
      rewardedUsers += 1;
      totalRewarded += result.credited;
      totalMissed += result.missed;
      totalEntriesUpdated += result.entriesUpdated;
      recordsLogged += result.recordsLogged;
    }
  }

  return {
    rewardedUsers,
    totalRewarded,
    totalMissed,
    totalEntriesUpdated,
    recordsLogged,
  };
}

