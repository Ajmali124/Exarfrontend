/**
 * Comprehensive Staking Report Generator
 * 
 * This script generates a detailed PDF report of:
 * - Total value on stake (separated by voucher positions vs regular positions)
 * - Total value given (earnings, rewards, withdrawals)
 * - Breakdown by user, package, status, and type
 * - Max cap remaining calculations from StakingEntry
 * - Historical data from the beginning
 */

import prisma from "../src/lib/prismadb";
import PDFDocument from "pdfkit";
import fs from "fs";

// Test users to exclude from the report
const TEST_USER_IDS = [
  "IzZ3SLa2aRTQKBnddT1zTHQn1JxuRzxZ", // Test user from scripts
  "YndMUgFOo2t7ymT5OoVMmw7SLBI5DLZP",
  "TEST_USER_1763676498331_0",
  "TEST_USER_1763676499838_1",
  "TEST_USER_1763676508165_1",
  "TEST_USER_1763676510846_3",
  "TEST_USER_1763676509505_2",
  "9sHQ9FaL2IYw2voxiGLjmPY2PbpJXhVn",
  "gDCoC8IrILOlv4A2EgkL2oFcYFdlaeRr",
  "YndMUgFOo2t7ymT5OoVMmw7SLBI5DLZP",
];

interface ReportData {
  totalOnStake: number;
  totalOnStakeRegular: number;
  totalOnStakeVoucher: number;
  totalGiven: number;
  totalEarnings: number;
  totalMaxEarning: number;
  totalRemainingCap: number;
  totalWithdrawals: number;
  totalTeamEarnings: number;
  totalDirectBonuses: number;
  activeStakes: number;
  completedStakes: number;
  unstakingStakes: number;
  activeVoucherPositions: number;
  activeRegularPositions: number;
  totalVoucherValue: number;
  totalVoucherValueActive: number;
  totalVoucherValueUsed: number;
  usersCount: number;
  usersWithStakes: number;
  stakesByPackage: Record<string, { count: number; totalAmount: number; totalEarned: number; totalMaxEarning: number; totalRemainingCap: number }>;
  stakesByStatus: Record<string, { count: number; totalAmount: number; totalEarned: number; totalMaxEarning: number; totalRemainingCap: number }>;
  dateRange: { firstStake: Date | null; lastStake: Date | null };
}

async function generateReport(): Promise<void> {
  console.log("📊 Generating Comprehensive Staking Report...\n");
  console.log("⏳ This may take a few moments...\n");

  try {
    // Get all users excluding test users
    const allUsers = await prisma.user.findMany({
      where: {
        id: { notIn: TEST_USER_IDS },
      },
      select: { id: true },
    });
    const userIds = allUsers.map(u => u.id);

    console.log(`✅ Found ${userIds.length} users (excluding ${TEST_USER_IDS.length} test users)\n`);

    // Get all staking entries - calculate everything from StakingEntry
    const allStakes = await prisma.stakingEntry.findMany({
      where: {
        userId: { in: userIds },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log(`✅ Found ${allStakes.length} staking entries\n`);

    // Get all vouchers that were used (linked to stakes)
    const usedVouchers = await prisma.voucher.findMany({
      where: {
        userId: { in: userIds },
        status: "used",
        appliedToStakeId: { not: null },
      },
      select: {
        id: true,
        value: true,
        appliedToStakeId: true,
        createdAt: true,
      },
    });

    const voucherStakeIds = new Set(
      usedVouchers.map(v => v.appliedToStakeId).filter(Boolean) as string[]
    );

    // Get all active vouchers (not yet used)
    const activeVouchers = await prisma.voucher.findMany({
      where: {
        userId: { in: userIds },
        status: "active",
        expiresAt: { gt: new Date() },
      },
      select: {
        value: true,
        type: true,
      },
    });

    // Get all transactions (deposits, withdrawals, rewards)
    const allTransactions = await prisma.transactionRecord.findMany({
      where: {
        userId: { in: userIds },
      },
      select: {
        type: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    // Get all team earnings
    const teamEarnings = await prisma.teamEarningRecord.findMany({
      where: {
        userId: { in: userIds },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // NOTE: Do NOT use `userBalance.balance` as "pending withdrawals".
    // `balance` is the user's available balance, not a withdrawal queue.
    // Pending withdrawals are tracked via `transactionRecord` statuses.

    console.log("📈 Calculating statistics from StakingEntry...\n");

    // Calculate statistics - ALL from StakingEntry
    const reportData: ReportData = {
      totalOnStake: 0,
      totalOnStakeRegular: 0,
      totalOnStakeVoucher: 0,
      totalGiven: 0,
      totalEarnings: 0,
      totalMaxEarning: 0,
      totalRemainingCap: 0,
      totalWithdrawals: 0,
      totalTeamEarnings: 0,
      totalDirectBonuses: 0,
      activeStakes: 0,
      completedStakes: 0,
      unstakingStakes: 0,
      activeVoucherPositions: 0,
      activeRegularPositions: 0,
      totalVoucherValue: 0,
      totalVoucherValueActive: 0,
      totalVoucherValueUsed: 0,
      usersCount: userIds.length,
      usersWithStakes: 0,
      stakesByPackage: {},
      stakesByStatus: {},
      dateRange: { firstStake: null, lastStake: null },
    };

    // Process staking entries - calculate everything from StakingEntry
    const usersWithStakesSet = new Set<string>();
    const stakesByStatusMap: Record<string, { count: number; totalAmount: number; totalEarned: number; totalMaxEarning: number; totalRemainingCap: number }> = {};
    const stakesByPackageMap: Record<string, { count: number; totalAmount: number; totalEarned: number; totalMaxEarning: number; totalRemainingCap: number }> = {};

    for (const stake of allStakes) {
      usersWithStakesSet.add(stake.userId);

      const isVoucherPosition = voucherStakeIds.has(stake.id);
      const amount = stake.amount || 0;
      const totalEarned = stake.totalEarned || 0;
      const maxEarning = stake.maxEarning || 0;
      const remainingCap = Math.max(0, maxEarning - totalEarned);

      // Update date range
      if (!reportData.dateRange.firstStake || stake.createdAt < reportData.dateRange.firstStake) {
        reportData.dateRange.firstStake = stake.createdAt;
      }
      if (!reportData.dateRange.lastStake || stake.createdAt > reportData.dateRange.lastStake) {
        reportData.dateRange.lastStake = stake.createdAt;
      }

      // Count by status
      const status = stake.status || "active";
      if (!stakesByStatusMap[status]) {
        stakesByStatusMap[status] = { count: 0, totalAmount: 0, totalEarned: 0, totalMaxEarning: 0, totalRemainingCap: 0 };
      }
      stakesByStatusMap[status].count++;
      stakesByStatusMap[status].totalAmount += amount;
      stakesByStatusMap[status].totalEarned += totalEarned;
      stakesByStatusMap[status].totalMaxEarning += maxEarning;
      stakesByStatusMap[status].totalRemainingCap += remainingCap;

      // Count by package
      const packageName = stake.packageName || "Unknown";
      if (!stakesByPackageMap[packageName]) {
        stakesByPackageMap[packageName] = { count: 0, totalAmount: 0, totalEarned: 0, totalMaxEarning: 0, totalRemainingCap: 0 };
      }
      stakesByPackageMap[packageName].count++;
      stakesByPackageMap[packageName].totalAmount += amount;
      stakesByPackageMap[packageName].totalEarned += totalEarned;
      stakesByPackageMap[packageName].totalMaxEarning += maxEarning;
      stakesByPackageMap[packageName].totalRemainingCap += remainingCap;

      // Update totals (only count active/unstaking as "on stake")
      if (stake.status === "active") {
        reportData.activeStakes++;
        reportData.totalOnStake += amount;
        reportData.totalMaxEarning += maxEarning;
        reportData.totalRemainingCap += remainingCap;
        if (isVoucherPosition) {
          reportData.activeVoucherPositions++;
          reportData.totalOnStakeVoucher += amount;
        } else {
          reportData.activeRegularPositions++;
          reportData.totalOnStakeRegular += amount;
        }
      } else if (stake.status === "completed") {
        reportData.completedStakes++;
      } else if (stake.status === "unstaking") {
        reportData.unstakingStakes++;
        reportData.totalOnStake += amount;
        reportData.totalMaxEarning += maxEarning;
        reportData.totalRemainingCap += remainingCap;
        if (isVoucherPosition) {
          reportData.totalOnStakeVoucher += amount;
        } else {
          reportData.totalOnStakeRegular += amount;
        }
      }

      // Always accumulate earnings (historical - all stakes)
      reportData.totalEarnings += totalEarned;
    }

    reportData.usersWithStakes = usersWithStakesSet.size;
    reportData.stakesByStatus = stakesByStatusMap;
    reportData.stakesByPackage = stakesByPackageMap;

    // Process vouchers
    reportData.totalVoucherValueUsed = usedVouchers.reduce((sum, v) => sum + (v.value || 0), 0);
    reportData.totalVoucherValueActive = activeVouchers
      .filter(v => v.type === "package")
      .reduce((sum, v) => sum + (v.value || 0), 0);
    reportData.totalVoucherValue = reportData.totalVoucherValueUsed + reportData.totalVoucherValueActive;

    // Process transactions
    const deposits = allTransactions.filter(
      (t) => t.type === "deposit" && t.status === "completed"
    );

    const completedWithdrawals = allTransactions.filter(
      (t) => t.type === "withdrawal" && t.status === "completed"
    );

    const inFlightWithdrawals = allTransactions.filter(
      (t) =>
        t.type === "withdrawal" &&
        (t.status === "pending" || t.status === "initiated")
    );

    const withdrawalFees = allTransactions.filter(
      (t) => t.type === "withdrawal_fee" && t.status === "completed"
    );

    const refunds = allTransactions.filter(
      (t) => t.type === "refund" && t.status === "completed"
    );

    const rewards = allTransactions.filter(
      (t) => t.type === "reward" && t.status === "completed"
    );

    // IMPORTANT:
    // - `withdrawal.amount` is the amount sent to CoinPayments (after fee).
    // - Fee is a separate `withdrawal_fee` transaction.
    // - Refunds are `refund` transactions when a withdrawal fails/cancels.
    //
    // Net withdrawals (cash leaving the system) should include fees and subtract refunds.
    const totalWithdrawalSent = completedWithdrawals.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );
    const totalWithdrawalFees = withdrawalFees.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );
    const totalRefunds = refunds.reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalWithdrawalsNet = totalWithdrawalSent + totalWithdrawalFees - totalRefunds;
    reportData.totalWithdrawals = totalWithdrawalsNet;

    reportData.totalDirectBonuses = rewards.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );

    // Pending withdrawals should be derived from in-flight withdrawal records (initiated/pending).
    // This is a *lower-bound* estimate because initiated records may not yet include fee txns.
    const totalPendingWithdrawalTransactions = inFlightWithdrawals.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );
    const totalPendingWithdrawals = 0; // Deprecated (do not use wallet balances here)

    // Analyze withdrawal patterns for 30-day forecast
    // NOTE: This forecast uses only completed `withdrawal.amount` (amount sent), not fees/refunds.
    // We also compute a daily NET outflow series (withdrawals + fees - refunds) below for spike detection.
    const withdrawalForecast = analyzeWithdrawalPattern(completedWithdrawals, allStakes);

    // Daily net withdrawals series (PKT day boundaries)
    const dailyNet = buildDailyNetWithdrawalSeries({
      withdrawals: completedWithdrawals,
      fees: withdrawalFees,
      refunds,
    });
    const last90 = sliceLastNDays(dailyNet, 90);
    const last30 = sliceLastNDays(dailyNet, 30);
    const maxDailyLast90Days = last90.reduce((m, d) => Math.max(m, d.net), 0);
    const maxDailyLast30Days = last30.reduce((m, d) => Math.max(m, d.net), 0);
    const p90DailyLast30Days = percentile(last30.map((d) => d.net), 0.9);

    // Growth-based forward forecast for next 14 days (based on the existing withdrawalForecast growthRate)
    const baselineDaily = withdrawalForecast.dailyAverage;
    const robustDailyGrowthPercent = computeRobustDailyGrowthPercentFromDailyNet(last30);
    const next14Days = forecastNextDays({
      baselineDaily,
      growthRatePercent: robustDailyGrowthPercent,
      days: 14,
    });
    const next14Total = next14Days.reduce((sum, d) => sum + d.projected, 0);
    const stress14Total = (p90DailyLast30Days ?? 0) * 14;

    const next30Days = forecastNextDays({
      baselineDaily,
      growthRatePercent: robustDailyGrowthPercent,
      days: 30,
    });
    const next30Total = next30Days.reduce((sum, d) => sum + d.projected, 0);
    const stress30Total = (p90DailyLast30Days ?? 0) * 30;

    // Attach to forecast object for PDF/console rendering
    withdrawalForecast.maxDailyLast90Days = maxDailyLast90Days;
    withdrawalForecast.maxDailyLast30Days = maxDailyLast30Days;
    withdrawalForecast.p90DailyLast30Days = p90DailyLast30Days;
    withdrawalForecast.next14Days = next14Days;

    // Get all users for growth analysis
    const allUsersForGrowth = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Analyze growth patterns and predict future staking
    const growthAnalysis = analyzeGrowthPatterns(allUsersForGrowth, allStakes, deposits, reportData.totalOnStake);
    const futureProjections = projectFutureStaking(growthAnalysis, reportData.totalOnStake);
    
    // Debug output
    console.log(`\n📈 Growth Analysis:`);
    console.log(`   User Growth Rate: ${growthAnalysis.userGrowthRate.toFixed(4)}% per day`);
    console.log(`   Staking Growth Rate: ${growthAnalysis.stakingGrowthRate.toFixed(4)}% per day`);
    console.log(`   Deposit Growth Rate: ${growthAnalysis.depositGrowthRate.toFixed(4)}% per day`);
    console.log(`   Days Analyzed: ${growthAnalysis.daysAnalyzed}`);
    console.log(`   Avg Stake per User: ${growthAnalysis.avgStakePerUser.toFixed(2)} USDT`);
    console.log(`\n🔮 Future Projections:`);
    console.log(`   1 Month Staking: ${futureProjections.staking1Month.toFixed(2)} USDT`);
    console.log(`   3 Months Staking: ${futureProjections.staking3Months.toFixed(2)} USDT`);
    console.log(`   6 Months Staking: ${futureProjections.staking6Months.toFixed(2)} USDT\n`);
    const bankruptcyAnalysis = analyzeBankruptcyRisk(
      deposits,
      // Use net withdrawals (with fees, minus refunds) to avoid inflated/incorrect outflow.
      completedWithdrawals,
      reportData,
      withdrawalForecast,
      allStakes.filter(s => s.status === "active" || s.status === "unstaking"),
      growthAnalysis
    );

    // Process team earnings
    reportData.totalTeamEarnings = teamEarnings.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Calculate total given from transactions (not UserBalance)
    const totalEarningsWithdrawn = totalWithdrawalSent;
    
    reportData.totalGiven = reportData.totalDirectBonuses + reportData.totalTeamEarnings + reportData.totalEarnings;

    // Generate PDF report
    const reportPath = "STAKING_REPORT.pdf";
    generatePDFReport(reportData, {
      deposits: deposits.length,
      withdrawals: completedWithdrawals.length,
      rewards: rewards.length,
      activeVouchersCount: activeVouchers.length,
      usedVouchersCount: usedVouchers.length,
      dateRange: reportData.dateRange,
      totalPendingWithdrawals,
      totalPendingWithdrawalTransactions,
      withdrawalForecast,
      growthAnalysis,
      futureProjections,
      bankruptcyAnalysis,
    }, reportPath);

    console.log(`✅ Report generated successfully!\n`);
    console.log(`📄 Report saved to: ${reportPath}\n`);
    console.log("=" .repeat(80));
    console.log("\n📊 QUICK SUMMARY:");
    console.log(`   Total Value on Stake: ${reportData.totalOnStake.toFixed(2)} USDT`);
    console.log(`   - Regular Positions: ${reportData.totalOnStakeRegular.toFixed(2)} USDT`);
    console.log(`   - Voucher Positions: ${reportData.totalOnStakeVoucher.toFixed(2)} USDT`);
    console.log(`   Total Earnings: ${reportData.totalEarnings.toFixed(2)} USDT`);
    console.log(`   Total Max Earning Cap: ${reportData.totalMaxEarning.toFixed(2)} USDT`);
    console.log(`   Total Remaining Cap: ${reportData.totalRemainingCap.toFixed(2)} USDT`);
    console.log(`   Total Value Given: ${reportData.totalGiven.toFixed(2)} USDT`);
    console.log(`   Pending Withdrawals: ${totalPendingWithdrawals.toFixed(2)} USDT`);
    console.log(`   Projected 30-Day Withdrawals: ${withdrawalForecast.projected30DaysWithGrowth.toFixed(2)} USDT`);
    console.log(`   Max Daily Net Withdraw (last 30d): ${(withdrawalForecast.maxDailyLast30Days ?? 0).toFixed(2)} USDT`);
    console.log(`   Max Daily Net Withdraw (last 90d): ${(withdrawalForecast.maxDailyLast90Days ?? 0).toFixed(2)} USDT`);
    console.log(`   P90 Daily Net Withdraw (last 30d): ${(withdrawalForecast.p90DailyLast30Days ?? 0).toFixed(2)} USDT`);
    if (withdrawalForecast.next14Days?.length) {
      console.log(`\n📅 Next 14 days withdrawal forecast (baseline=${baselineDaily.toFixed(2)}/day, dailyGrowth≈${robustDailyGrowthPercent.toFixed(2)}%)`);
      withdrawalForecast.next14Days.forEach((d) => {
        console.log(`   ${d.day}: ${d.projected.toFixed(2)} USDT`);
      });
      console.log(`\n💰 Cash needed (next 14d, base forecast): ${next14Total.toFixed(2)} USDT`);
      console.log(`💰 Cash needed (next 14d, stress=P90/day): ${stress14Total.toFixed(2)} USDT`);
      console.log(`💰 Cash needed (next 30d, base forecast): ${next30Total.toFixed(2)} USDT`);
      console.log(`💰 Cash needed (next 30d, stress=P90/day): ${stress30Total.toFixed(2)} USDT`);
    }
    console.log(`   Active Stakes: ${reportData.activeStakes}`);
    console.log(`   Users with Stakes: ${reportData.usersWithStakes}`);
    console.log("=" .repeat(80));
  } catch (error: any) {
    console.error("❌ Error generating report:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

interface WithdrawalForecast {
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  projected30Days: number;
  projected30DaysWithGrowth: number;
  growthRate: number;
  analysisPeriod: string;
  maxDailyLast90Days?: number;
  maxDailyLast30Days?: number;
  p90DailyLast30Days?: number;
  next14Days?: Array<{ day: string; projected: number }>;
}

interface GrowthAnalysis {
  userGrowthRate: number; // Daily user growth rate (%)
  stakingGrowthRate: number; // Daily staking growth rate (%)
  depositGrowthRate: number; // Daily deposit growth rate (%)
  avgStakePerUser: number;
  daysAnalyzed: number;
}

interface FutureProjections {
  staking1Month: number;
  staking3Months: number;
  staking6Months: number;
  users1Month: number;
  users3Months: number;
  users6Months: number;
}

interface BankruptcyAnalysis {
  currentAssets: number; // Total deposits - total withdrawals
  currentLiabilities: number; // Total earnings owed + pending withdrawals
  dailyEarningRate: number; // Daily earnings from active stakes
  dailyOutflow: number; // Daily withdrawals
  dailyInflow: number; // Daily deposits (projected)
  daysToBankruptcy: number | null; // Days until bankruptcy (null if not projected)
  bankruptcyDate: string | null;
  netCashFlow: number; // Daily net cash flow (inflow - outflow)
}

function analyzeWithdrawalPattern(
  completedWithdrawals: Array<{ amount: number; createdAt: Date }>,
  allStakes: Array<{ createdAt: Date; amount: number; dailyROI: number; status: string }>
): WithdrawalForecast {
  if (completedWithdrawals.length === 0) {
    return {
      dailyAverage: 0,
      weeklyAverage: 0,
      monthlyAverage: 0,
      projected30Days: 0,
      projected30DaysWithGrowth: 0,
      growthRate: 0,
      analysisPeriod: "No withdrawal data available",
    };
  }

  // Sort withdrawals by date
  const sortedWithdrawals = [...completedWithdrawals].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  const firstWithdrawal = sortedWithdrawals[0].createdAt;
  const lastWithdrawal = sortedWithdrawals[sortedWithdrawals.length - 1].createdAt;
  const daysDiff = Math.max(1, Math.ceil((lastWithdrawal.getTime() - firstWithdrawal.getTime()) / (1000 * 60 * 60 * 24)));

  // Calculate daily average
  const totalWithdrawn = completedWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
  const dailyAverage = totalWithdrawn / daysDiff;
  const weeklyAverage = dailyAverage * 7;
  const monthlyAverage = dailyAverage * 30;

  // Project next 30 days (simple linear projection)
  const projected30Days = dailyAverage * 30;

  // Calculate growth rate (compare first half vs second half)
  const midpoint = Math.floor(sortedWithdrawals.length / 2);
  const firstHalf = sortedWithdrawals.slice(0, midpoint);
  const secondHalf = sortedWithdrawals.slice(midpoint);

  const firstHalfTotal = firstHalf.reduce((sum, w) => sum + (w.amount || 0), 0);
  const secondHalfTotal = secondHalf.reduce((sum, w) => sum + (w.amount || 0), 0);

  const firstHalfDays = Math.max(1, Math.ceil((firstHalf[firstHalf.length - 1]?.createdAt.getTime() - firstHalf[0]?.createdAt.getTime()) / (1000 * 60 * 60 * 24)) || 1);
  const secondHalfDays = Math.max(1, Math.ceil((secondHalf[secondHalf.length - 1]?.createdAt.getTime() - secondHalf[0]?.createdAt.getTime()) / (1000 * 60 * 60 * 24)) || 1);

  const firstHalfDaily = firstHalfTotal / firstHalfDays;
  const secondHalfDaily = secondHalfTotal / secondHalfDays;

  const growthRate = firstHalfDaily > 0 ? ((secondHalfDaily - firstHalfDaily) / firstHalfDaily) * 100 : 0;
  const projected30DaysWithGrowth = dailyAverage * 30 * (1 + growthRate / 100);

  return {
    dailyAverage,
    weeklyAverage,
    monthlyAverage,
    projected30Days,
    projected30DaysWithGrowth,
    growthRate,
    analysisPeriod: `${formatDate(firstWithdrawal)} to ${formatDate(lastWithdrawal)} (${daysDiff} days)`,
  };
}

// --- Helpers for daily withdrawal spike + forward forecast (PKT day boundaries) ---
const PKT_OFFSET_MINUTES = 5 * 60;
function toPktDayKey(d: Date): string {
  const shifted = new Date(d.getTime() + PKT_OFFSET_MINUTES * 60 * 1000);
  return shifted.toISOString().slice(0, 10); // YYYY-MM-DD
}

function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))));
  return sorted[idx] ?? 0;
}

function buildDailyNetWithdrawalSeries(params: {
  withdrawals: Array<{ amount: number; createdAt: Date }>;
  fees: Array<{ amount: number; createdAt: Date }>;
  refunds: Array<{ amount: number; createdAt: Date }>;
}): Array<{ day: string; net: number }> {
  const map = new Map<string, number>();

  for (const w of params.withdrawals) {
    const day = toPktDayKey(w.createdAt);
    map.set(day, (map.get(day) ?? 0) + (w.amount || 0));
  }
  for (const f of params.fees) {
    const day = toPktDayKey(f.createdAt);
    map.set(day, (map.get(day) ?? 0) + (f.amount || 0));
  }
  for (const r of params.refunds) {
    const day = toPktDayKey(r.createdAt);
    map.set(day, (map.get(day) ?? 0) - (r.amount || 0));
  }

  return Array.from(map.entries())
    .map(([day, net]) => ({ day, net }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

function sliceLastNDays(
  series: Array<{ day: string; net: number }>,
  n: number
): Array<{ day: string; net: number }> {
  if (!series.length) return [];
  return series.slice(Math.max(0, series.length - n));
}

function forecastNextDays(params: {
  baselineDaily: number;
  growthRatePercent: number;
  days: number;
}): Array<{ day: string; projected: number }> {
  const now = new Date();
  const start = new Date(now.getTime() + PKT_OFFSET_MINUTES * 60 * 1000); // PKT
  start.setUTCHours(0, 0, 0, 0);

  const g = params.growthRatePercent / 100;
  const out: Array<{ day: string; projected: number }> = [];
  for (let i = 1; i <= params.days; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    const projected = params.baselineDaily * Math.pow(1 + g, i);
    out.push({ day: key, projected: Number.isFinite(projected) ? projected : 0 });
  }
  return out;
}

function computeRobustDailyGrowthPercentFromDailyNet(last30: Array<{ day: string; net: number }>): number {
  // Compare last 7 days average to previous 7 days average (on daily net outflow).
  // Then convert weekly growth -> daily compounded growth. Cap to avoid exploding forecasts on small samples.
  const tail = last30.slice(Math.max(0, last30.length - 14));
  if (tail.length < 8) return 0;

  const first7 = tail.slice(0, 7).map((d) => d.net);
  const last7 = tail.slice(7).map((d) => d.net);
  const avg = (arr: number[]) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0);
  const a1 = avg(first7);
  const a2 = avg(last7);
  if (a1 <= 0) return 0;

  let weeklyGrowth = (a2 - a1) / a1; // e.g. 0.1 = +10% per week
  // Cap weekly growth to +/- 20% to keep forecast realistic
  weeklyGrowth = Math.max(-0.2, Math.min(0.2, weeklyGrowth));
  const dailyGrowth = Math.pow(1 + weeklyGrowth, 1 / 7) - 1;
  const dailyGrowthPercent = dailyGrowth * 100;
  return Number.isFinite(dailyGrowthPercent) ? dailyGrowthPercent : 0;
}

function formatDate(d: Date | null): string {
  return d ? d.toISOString().split("T")[0] : "N/A";
}

function analyzeGrowthPatterns(
  users: Array<{ id: string; createdAt: Date }>,
  stakes: Array<{ createdAt: Date; amount: number }>,
  deposits: Array<{ amount: number; createdAt: Date }>,
  currentStaking: number
): GrowthAnalysis {
  if (users.length === 0 || stakes.length === 0) {
    return {
      userGrowthRate: 0,
      stakingGrowthRate: 0,
      depositGrowthRate: 0,
      avgStakePerUser: 0,
      daysAnalyzed: 0,
    };
  }

  const firstUserDate = users[0].createdAt;
  const lastUserDate = users[users.length - 1].createdAt;
  const daysDiff = Math.max(1, Math.ceil((lastUserDate.getTime() - firstUserDate.getTime()) / (1000 * 60 * 60 * 24)));

  // Calculate overall growth rate from start (exponential growth model)
  // If we started with 1 user and now have N users over D days: daily rate = (N/1)^(1/D) - 1
  // Using compound growth: Future = Present * (1 + rate)^days
  // So: rate = (Future/Present)^(1/days) - 1
  const initialUsers = 1; // Start with 1 user
  const currentUsers = users.length;
  const userGrowthRate = daysDiff > 0 && currentUsers > 0 ? (Math.pow(currentUsers / initialUsers, 1 / daysDiff) - 1) * 100 : 0;

  // Staking growth (total staking amount from start to now)
  const firstStakeDate = stakes[0]?.createdAt || firstUserDate;
  const lastStakeDate = stakes[stakes.length - 1]?.createdAt || lastUserDate;
  const stakingDaysDiff = Math.max(1, Math.ceil((lastStakeDate.getTime() - firstStakeDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Calculate total staked amount from start to now (all historical stakes)
  const totalStaked = stakes.reduce((sum, s) => sum + (s.amount || 0), 0);
  const avgDailyStaking = stakingDaysDiff > 0 ? totalStaked / stakingDaysDiff : 0;
  
  // Calculate staking growth rate: daily addition as % of current staking
  // Growth rate % = (avg daily staking / current staking) * 100
  const stakingGrowthRate = currentStaking > 0 ? (avgDailyStaking / currentStaking) * 100 : 0;
  
  // Deposit growth
  let depositGrowthRate = 0;
  if (deposits.length > 0) {
    const sortedDeposits = [...deposits].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const firstDepositDate = sortedDeposits[0].createdAt;
    const lastDepositDate = sortedDeposits[sortedDeposits.length - 1].createdAt;
    const depositDaysDiff = Math.max(1, Math.ceil((lastDepositDate.getTime() - firstDepositDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    const totalDeposited = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    const avgDailyDeposits = totalDeposited / depositDaysDiff;
    // Current deposit balance would be total - withdrawals, but we'll use total for growth calculation
    depositGrowthRate = totalDeposited > 0 ? (avgDailyDeposits / totalDeposited) * 100 : 0;
  }

  const avgStakePerUser = users.length > 0 ? totalStaked / users.length : 0;

  return {
    userGrowthRate: userGrowthRate || 0,
    stakingGrowthRate: stakingGrowthRate || 0,
    depositGrowthRate: depositGrowthRate || 0,
    avgStakePerUser,
    daysAnalyzed: daysDiff,
  };
}

function projectFutureStaking(
  growth: GrowthAnalysis,
  currentStaking: number
): FutureProjections {
  // Use linear projection model: Future = Current + (Daily Addition * Days)
  const days30 = 30;
  const days90 = 90;
  const days180 = 180;

  // Calculate daily addition based on growth rate
  // Growth rate is: (avg daily staking / current staking) * 100
  // So daily addition = (growth rate / 100) * current staking
  const dailyStakingAddition = (growth.stakingGrowthRate / 100) * currentStaking;
  
  // Linear projection: current + (daily addition * days)
  const staking1Month = currentStaking + (dailyStakingAddition * days30);
  const staking3Months = currentStaking + (dailyStakingAddition * days90);
  const staking6Months = currentStaking + (dailyStakingAddition * days180);

  // Project user growth using linear model
  // Calculate current user count from avg stake per user
  const currentUsers = growth.avgStakePerUser > 0 ? currentStaking / growth.avgStakePerUser : 1;
  const dailyUserAddition = (growth.userGrowthRate / 100) * currentUsers;

  const users1Month = currentUsers + (dailyUserAddition * days30);
  const users3Months = currentUsers + (dailyUserAddition * days90);
  const users6Months = currentUsers + (dailyUserAddition * days180);

  return {
    staking1Month: Math.max(currentStaking, staking1Month), // Don't go below current
    staking3Months: Math.max(currentStaking, staking3Months),
    staking6Months: Math.max(currentStaking, staking6Months),
    users1Month: Math.max(currentUsers, users1Month),
    users3Months: Math.max(currentUsers, users3Months),
    users6Months: Math.max(currentUsers, users6Months),
  };
}

function analyzeBankruptcyRisk(
  deposits: Array<{ amount: number; createdAt: Date }>,
  withdrawals: Array<{ amount: number; createdAt: Date }>,
  reportData: ReportData,
  withdrawalForecast: WithdrawalForecast,
  activeStakes: Array<{ amount: number; dailyROI: number; totalEarned: number; maxEarning: number }>,
  growthAnalysis: GrowthAnalysis
): BankruptcyAnalysis {
  // Calculate current assets (deposits - withdrawals)
  const totalDeposits = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalWithdrawals = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
  const currentAssets = totalDeposits - totalWithdrawals;

  // Calculate current liabilities (pending withdrawals + remaining earnings)
  const currentLiabilities = reportData.totalRemainingCap; // Maximum earnings still owed

  // Calculate daily earning rate from active stakes
  const dailyEarningRate = activeStakes.reduce((sum, stake) => {
    const amount = stake.amount || 0;
    const roi = stake.dailyROI || 0;
    const totalEarned = stake.totalEarned || 0;
    const maxEarning = stake.maxEarning || 0;
    const remainingCap = Math.max(0, maxEarning - totalEarned);
    const dailyEarning = (amount * roi) / 100;
    return sum + Math.min(dailyEarning, remainingCap); // Can't exceed remaining cap
  }, 0);

  // Calculate daily deposit rate (inflow) from historical data
  let dailyInflow = 0;
  if (deposits.length > 0) {
    const sortedDeposits = [...deposits].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const firstDeposit = sortedDeposits[0].createdAt;
    const lastDeposit = sortedDeposits[sortedDeposits.length - 1].createdAt;
    const depositDays = Math.max(1, Math.ceil((lastDeposit.getTime() - firstDeposit.getTime()) / (1000 * 60 * 60 * 24)));
    const totalDepositAmount = totalDeposits;
    dailyInflow = totalDepositAmount / depositDays;
    
    // Apply growth rate to project future deposits
    // Growth rate is in percentage, so we adjust daily inflow based on growth
    if (growthAnalysis.depositGrowthRate > 0) {
      // Use average growth rate for projections
      dailyInflow = dailyInflow * (1 + (growthAnalysis.depositGrowthRate / 100));
    }
  }

  // Daily outflow (withdrawals)
  const dailyOutflow = withdrawalForecast.dailyAverage;

  // Net cash flow (inflow - outflow)
  const netCashFlow = dailyInflow - dailyOutflow;

  // Calculate days to bankruptcy
  // Bankruptcy occurs when: currentAssets + (dailyInflow - dailyOutflow) * days < 0
  // If netCashFlow is positive, we're gaining money daily (no bankruptcy)
  // If netCashFlow is negative: currentAssets + netCashFlow * days < 0
  // days = -currentAssets / netCashFlow (negative divided by negative = positive)
  let daysToBankruptcy: number | null = null;
  let bankruptcyDate: string | null = null;

  if (netCashFlow >= 0) {
    // Positive cash flow means we're gaining money daily - no bankruptcy projected
    daysToBankruptcy = null;
    bankruptcyDate = "Not projected (positive cash flow)";
  } else if (netCashFlow < 0 && currentAssets > 0) {
    // Negative cash flow - calculate when assets will be depleted
    daysToBankruptcy = Math.ceil(-currentAssets / netCashFlow);
    const bankruptcyDateObj = new Date();
    bankruptcyDateObj.setDate(bankruptcyDateObj.getDate() + daysToBankruptcy);
    bankruptcyDate = formatDate(bankruptcyDateObj);
  } else if (netCashFlow < 0 && currentAssets <= 0) {
    daysToBankruptcy = 0; // Already bankrupt
    bankruptcyDate = "Immediate";
  }

  return {
    currentAssets,
    currentLiabilities,
    dailyEarningRate,
    dailyOutflow,
    dailyInflow,
    daysToBankruptcy,
    bankruptcyDate,
    netCashFlow,
  };
}

function generatePDFReport(
  data: ReportData,
  additional: {
    deposits: number;
    withdrawals: number;
    rewards: number;
    activeVouchersCount: number;
    usedVouchersCount: number;
    dateRange: { firstStake: Date | null; lastStake: Date | null };
    totalPendingWithdrawals: number;
    totalPendingWithdrawalTransactions: number;
    withdrawalForecast: WithdrawalForecast;
    growthAnalysis: GrowthAnalysis;
    futureProjections: FutureProjections;
    bankruptcyAnalysis: BankruptcyAnalysis;
  },
  filePath: string
): void {
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const formatNumber = (n: number) => n.toFixed(2);
  const formatDate = (d: Date | null) => d ? d.toISOString().split("T")[0] : "N/A";

  // Header
  doc.fontSize(20).text("Comprehensive Staking Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(10).text(`Generated: ${new Date().toISOString()}`, { align: "center" });
  doc.text(`Note: This report excludes ${TEST_USER_IDS.length} test user(s)`, { align: "center" });
  doc.moveDown(2);

  // Executive Summary
  doc.fontSize(16).text("📊 Executive Summary", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  
  doc.text(`Total Value on Stake: ${formatNumber(data.totalOnStake)} USDT`, { continued: false });
  doc.text(`  - Regular Positions: ${formatNumber(data.totalOnStakeRegular)} USDT`, { indent: 20 });
  doc.text(`  - Voucher Positions: ${formatNumber(data.totalOnStakeVoucher)} USDT`, { indent: 20 });
  doc.moveDown(0.5);
  
  doc.text(`Total Value Given: ${formatNumber(data.totalGiven)} USDT`);
  doc.text(`Total Earnings: ${formatNumber(data.totalEarnings)} USDT`);
  doc.text(`Total Max Earning Cap: ${formatNumber(data.totalMaxEarning)} USDT`);
  doc.text(`Total Remaining Cap: ${formatNumber(data.totalRemainingCap)} USDT`);
  doc.text(`Total Withdrawals: ${formatNumber(data.totalWithdrawals)} USDT`);
  doc.text(`Total Team Earnings: ${formatNumber(data.totalTeamEarnings)} USDT`);
  doc.text(`Total Direct Bonuses: ${formatNumber(data.totalDirectBonuses)} USDT`);
  doc.moveDown(0.5);
  
  doc.text(`Users Count: ${data.usersCount}`);
  doc.text(`Users with Stakes: ${data.usersWithStakes}`);
  doc.text(`Date Range: ${formatDate(data.dateRange.firstStake)} to ${formatDate(data.dateRange.lastStake)}`);
  doc.moveDown(2);

  // Staking Positions Breakdown
  doc.fontSize(16).text("💰 Staking Positions Breakdown", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  
  doc.text("Regular Positions (Non-Voucher):", { underline: true });
  doc.text(`  Total Value: ${formatNumber(data.totalOnStakeRegular)} USDT`, { indent: 20 });
  doc.text(`  Active Positions: ${data.activeRegularPositions}`, { indent: 20 });
  doc.text(`  Percentage of Total: ${((data.totalOnStakeRegular / data.totalOnStake) * 100).toFixed(2)}%`, { indent: 20 });
  doc.moveDown(0.5);
  
  doc.text("Voucher Positions:", { underline: true });
  doc.text(`  Total Value (Used): ${formatNumber(data.totalVoucherValueUsed)} USDT`, { indent: 20 });
  doc.text(`  Total Value (Active/Unused): ${formatNumber(data.totalVoucherValueActive)} USDT`, { indent: 20 });
  doc.text(`  Total Voucher Value: ${formatNumber(data.totalVoucherValue)} USDT`, { indent: 20 });
  doc.text(`  Active Positions: ${data.activeVoucherPositions}`, { indent: 20 });
  doc.text(`  Used Vouchers: ${additional.usedVouchersCount}`, { indent: 20 });
  doc.text(`  Active Vouchers: ${additional.activeVouchersCount}`, { indent: 20 });
  doc.text(`  Percentage of Total Staked: ${((data.totalOnStakeVoucher / data.totalOnStake) * 100).toFixed(2)}%`, { indent: 20 });
  doc.moveDown(2);

  // Stakes by Status
  doc.fontSize(16).text("📈 Stakes by Status", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  
  for (const [status, stats] of Object.entries(data.stakesByStatus)) {
    doc.text(`${status}:`, { underline: true });
    doc.text(`  Count: ${stats.count}`, { indent: 20 });
    doc.text(`  Total Amount: ${formatNumber(stats.totalAmount)} USDT`, { indent: 20 });
    doc.text(`  Total Earned: ${formatNumber(stats.totalEarned)} USDT`, { indent: 20 });
    doc.text(`  Total Max Earning: ${formatNumber(stats.totalMaxEarning)} USDT`, { indent: 20 });
    doc.text(`  Total Remaining Cap: ${formatNumber(stats.totalRemainingCap)} USDT`, { indent: 20 });
    doc.moveDown(0.5);
  }
  doc.moveDown(1);

  // Stakes by Package
  doc.fontSize(16).text("📦 Stakes by Package", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  
  for (const [packageName, stats] of Object.entries(data.stakesByPackage)) {
    const avgAmount = stats.count > 0 ? stats.totalAmount / stats.count : 0;
    doc.text(`${packageName}:`, { underline: true });
    doc.text(`  Count: ${stats.count}`, { indent: 20 });
    doc.text(`  Total Amount: ${formatNumber(stats.totalAmount)} USDT`, { indent: 20 });
    doc.text(`  Total Earned: ${formatNumber(stats.totalEarned)} USDT`, { indent: 20 });
    doc.text(`  Total Max Earning: ${formatNumber(stats.totalMaxEarning)} USDT`, { indent: 20 });
    doc.text(`  Total Remaining Cap: ${formatNumber(stats.totalRemainingCap)} USDT`, { indent: 20 });
    doc.text(`  Average Amount: ${formatNumber(avgAmount)} USDT`, { indent: 20 });
    doc.moveDown(0.5);
  }
  doc.moveDown(1);

  // Value Given Breakdown
  doc.fontSize(16).text("💵 Value Given Breakdown", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  doc.text(`Direct Bonuses: ${formatNumber(data.totalDirectBonuses)} USDT`);
  doc.text(`Team Earnings: ${formatNumber(data.totalTeamEarnings)} USDT`);
  doc.text(`Total Earnings: ${formatNumber(data.totalEarnings)} USDT`);
  doc.text(`Total Withdrawals (Completed): ${formatNumber(data.totalWithdrawals)} USDT`);
  doc.text(`Total Given: ${formatNumber(data.totalGiven)} USDT`);
  doc.moveDown(2);

  // Pending Withdrawals
  doc.fontSize(16).text("⏳ Pending Withdrawals", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  doc.text(`Total Pending Balance (UserBalance): ${formatNumber(additional.totalPendingWithdrawals)} USDT`);
  doc.text(`Pending Withdrawal Transactions: ${formatNumber(additional.totalPendingWithdrawalTransactions)} USDT`);
  doc.text(`Total Potential Withdrawals: ${formatNumber(additional.totalPendingWithdrawals + additional.totalPendingWithdrawalTransactions)} USDT`);
  doc.moveDown(2);

  // Withdrawal Forecast
  doc.fontSize(16).text("📊 Withdrawal Forecast (Next 30 Days)", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  doc.text(`Analysis Period: ${additional.withdrawalForecast.analysisPeriod}`);
  doc.moveDown(0.5);
  doc.text(`Daily Average: ${formatNumber(additional.withdrawalForecast.dailyAverage)} USDT`);
  doc.text(`Weekly Average: ${formatNumber(additional.withdrawalForecast.weeklyAverage)} USDT`);
  doc.text(`Monthly Average: ${formatNumber(additional.withdrawalForecast.monthlyAverage)} USDT`);
  doc.moveDown(0.5);
  doc.text(`Projected 30 Days (Linear): ${formatNumber(additional.withdrawalForecast.projected30Days)} USDT`);
  doc.text(`Projected 30 Days (With Growth): ${formatNumber(additional.withdrawalForecast.projected30DaysWithGrowth)} USDT`);
  doc.text(`Growth Rate: ${additional.withdrawalForecast.growthRate.toFixed(2)}%`);
  doc.moveDown(0.5);
  doc.fontSize(9).fillColor("red");
  doc.text(`⚠️  If no new staking occurs, estimated withdrawals needed: ${formatNumber(additional.withdrawalForecast.projected30DaysWithGrowth)} USDT`, { continued: false });
  doc.fillColor("black");
  doc.moveDown(2);

  // Transaction Statistics
  doc.fontSize(16).text("📝 Transaction Statistics", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  doc.text(`Deposits: ${additional.deposits}`);
  doc.text(`Withdrawals: ${additional.withdrawals}`);
  doc.text(`Rewards: ${additional.rewards}`);
  doc.moveDown(2);

  // Current State
  doc.fontSize(16).text("🔄 Current State", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  doc.text(`Active Stakes: ${data.activeStakes}`);
  doc.text(`  - Regular Positions: ${data.activeRegularPositions}`);
  doc.text(`  - Voucher Positions: ${data.activeVoucherPositions}`);
  doc.text(`Completed Stakes: ${data.completedStakes}`);
  doc.text(`Unstaking Stakes: ${data.unstakingStakes}`);
  doc.moveDown(2);

  // Growth Analysis & Future Projections
  doc.fontSize(16).text("📈 Growth Analysis & Future Projections", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  doc.text(`User Growth Rate: ${additional.growthAnalysis.userGrowthRate.toFixed(2)}% per day`);
  doc.text(`Staking Growth Rate: ${additional.growthAnalysis.stakingGrowthRate.toFixed(2)}% per day`);
  doc.text(`Deposit Growth Rate: ${additional.growthAnalysis.depositGrowthRate.toFixed(2)}% per day`);
  doc.text(`Average Stake per User: ${formatNumber(additional.growthAnalysis.avgStakePerUser)} USDT`);
  doc.moveDown(1);
  
  doc.fontSize(14).text("Projected Staking Amounts:", { underline: true });
  doc.fontSize(10);
  doc.text(`1 Month: ${formatNumber(additional.futureProjections.staking1Month)} USDT`);
  doc.text(`3 Months: ${formatNumber(additional.futureProjections.staking3Months)} USDT`);
  doc.text(`6 Months: ${formatNumber(additional.futureProjections.staking6Months)} USDT`);
  doc.moveDown(1);
  
  doc.fontSize(14).text("Projected User Counts:", { underline: true });
  doc.fontSize(10);
  doc.text(`1 Month: ${Math.round(additional.futureProjections.users1Month)} users`);
  doc.text(`3 Months: ${Math.round(additional.futureProjections.users3Months)} users`);
  doc.text(`6 Months: ${Math.round(additional.futureProjections.users6Months)} users`);
  doc.moveDown(2);

  // Bankruptcy Analysis
  doc.fontSize(16).text("⚠️ Bankruptcy Risk Analysis", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  doc.text(`Current Assets (Deposits - Withdrawals): ${formatNumber(additional.bankruptcyAnalysis.currentAssets)} USDT`);
  doc.text(`Current Liabilities (Remaining Earnings Owed): ${formatNumber(additional.bankruptcyAnalysis.currentLiabilities)} USDT`);
  doc.text(`Daily Earning Rate (from active stakes): ${formatNumber(additional.bankruptcyAnalysis.dailyEarningRate)} USDT`);
  doc.text(`Daily Inflow (projected new deposits): ${formatNumber(additional.bankruptcyAnalysis.dailyInflow)} USDT`);
  doc.text(`Daily Outflow (withdrawals): ${formatNumber(additional.bankruptcyAnalysis.dailyOutflow)} USDT`);
  doc.text(`Net Cash Flow (daily): ${formatNumber(additional.bankruptcyAnalysis.netCashFlow)} USDT ${additional.bankruptcyAnalysis.netCashFlow >= 0 ? "(Positive)" : "(Negative)"}`);
  doc.moveDown(0.5);
  doc.fontSize(12);
  if (additional.bankruptcyAnalysis.daysToBankruptcy !== null && additional.bankruptcyAnalysis.daysToBankruptcy > 0) {
    doc.fillColor("red");
    doc.text(`Days to Bankruptcy: ${additional.bankruptcyAnalysis.daysToBankruptcy} days`);
    doc.text(`Projected Bankruptcy Date: ${additional.bankruptcyAnalysis.bankruptcyDate}`);
  } else if (additional.bankruptcyAnalysis.daysToBankruptcy === 0) {
    doc.fillColor("red");
    doc.text(`Bankruptcy Status: Immediate (negative assets)`);
  } else {
    doc.fillColor("green");
    doc.text(`Bankruptcy Risk: ${additional.bankruptcyAnalysis.bankruptcyDate}`);
    doc.text(`(Positive cash flow - gaining money daily from new deposits)`);
  }
  doc.fillColor("black");
  doc.moveDown(2);

  // Key Insights
  doc.fontSize(16).text("🔍 Key Insights", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  doc.text(`1. Staking Distribution: ${((data.totalOnStakeRegular / data.totalOnStake) * 100).toFixed(2)}% regular positions vs ${((data.totalOnStakeVoucher / data.totalOnStake) * 100).toFixed(2)}% voucher positions`);
  doc.text(`2. User Engagement: ${data.usersWithStakes} out of ${data.usersCount} users (${((data.usersWithStakes / data.usersCount) * 100).toFixed(2)}%) have staking positions`);
  doc.text(`3. Total Value on Stake: ${formatNumber(data.totalOnStake)} USDT`);
  doc.text(`4. Total Value Given: ${formatNumber(data.totalGiven)} USDT`);
  doc.text(`5. Earnings vs Staked: ${((data.totalEarnings / data.totalOnStake) * 100).toFixed(2)}% return on staked amount`);
  doc.text(`6. Remaining Cap: ${formatNumber(data.totalRemainingCap)} USDT (${((data.totalRemainingCap / data.totalMaxEarning) * 100).toFixed(2)}% of max cap remaining)`);
  doc.text(`7. Voucher Utilization: ${additional.usedVouchersCount} vouchers used out of ${additional.usedVouchersCount + additional.activeVouchersCount} total`);

  // Footer
  doc.moveDown(3);
  doc.fontSize(8).text(`Report generated at ${new Date().toISOString()}`, { align: "center" });

  doc.end();
}

// Run the script
generateReport()
  .then(() => {
    console.log("✅ Report generation complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });