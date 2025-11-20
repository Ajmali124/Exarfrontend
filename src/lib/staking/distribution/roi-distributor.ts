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
  let voucherEarnings = 0; // Track earnings from vouchers separately
  let realPackageEarnings = 0; // Track earnings from real packages for team distribution
  const entryResults: EntryDistributionResult[] = [];

  // IMPORTANT: Check which entries came from vouchers
  // Voucher earnings should NOT generate team earnings for sponsors
  // Only real package earnings should be added to dailyEarning for team distribution
  const entryIds = entries.map(e => e.id);
  const vouchers = await tx.voucher.findMany({
    where: {
      appliedToStakeId: { in: entryIds },
      status: "used",
    },
    select: {
      appliedToStakeId: true,
    },
  });
  const voucherStakeIds = new Set(vouchers.map(v => v.appliedToStakeId).filter(Boolean) as string[]);

  for (const entry of entries) {
    const amount = entry.amount ?? 0;
    const roi = entry.dailyROI ?? 0;
    const maxEarning = entry.maxEarning ?? 0;
    const totalEarned = entry.totalEarned ?? 0;

    // Check if this entry came from a voucher
    const isFromVoucher = voucherStakeIds.has(entry.id);

    // Check if this is a flushed ROI entry (maxEarning = 0, typically from vouchers without max cap)
    const isFlushedROI = maxEarning === 0;

    // For flushed ROI, always provide payout without cap checking
    if (isFlushedROI) {
      const rawPayout = calculateDailyEarning(amount, roi);
      
      // Check if voucher ROI period has ended (if applicable)
      // Note: This check would require linking to voucher table, which we'll add later if needed
      
      if (rawPayout > 0) {
        // Flushed ROI - payout all, no cap tracking
        await tx.transactionRecord.create({
          data: {
            userId,
            type: "dailyReward",
            amount: rawPayout,
            currency: entry.currency ?? "USDT",
            status: "completed",
            description: `Daily ROI for ${entry.packageName ?? "staking package"} (Flushed - No Max Cap)`,
          },
        });

        totalRewarded += rawPayout;
        
        // Track voucher earnings separately (don't count for team distribution)
        if (isFromVoucher) {
          voucherEarnings += rawPayout;
        } else {
          realPackageEarnings += rawPayout;
        }
        
        entryResults.push({
          entryId: entry.id,
          packageName: entry.packageName ?? "Unknown package",
          payout: rawPayout,
          reachedCap: false, // Flushed ROI never reaches cap
        });
      }
      continue; // Continue to next entry for flushed ROI
    }

    // Normal ROI distribution with max cap checking
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
    
    // Track voucher earnings separately (don't count for team distribution)
    if (isFromVoucher) {
      voucherEarnings += payout;
    } else {
      realPackageEarnings += payout;
    }
    
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
      // Only add real package earnings to dailyEarning for team distribution
      // Voucher earnings should NOT generate team earnings
      if (realPackageEarnings > 0) {
        balanceUpdate.dailyEarning = { increment: realPackageEarnings };
      }
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

