/**
 * Test Script: Verify Voucher Earnings Don't Generate Team Earnings
 * 
 * This script tests that:
 * 1. ROI from vouchers is distributed to users
 * 2. Voucher earnings are NOT included in team earnings distribution
 * 3. Only real package earnings generate team earnings
 */

import prisma from "../src/lib/prismadb";
import { distributeDailyStakingRewards } from "../src/lib/staking/distribution/roi-distributor";
import { distributeTeamEarnings } from "../src/lib/staking/distribution/team-earnings-distributor";

async function testVoucherTeamEarnings() {
  console.log("🧪 Testing Voucher Earnings vs Team Earnings Distribution\n");

  try {
    // Find a user with active staking entries
    const userWithStakes = await prisma.stakingEntry.findFirst({
      where: { status: "active" },
      include: {
        user: {
          include: {
            balance: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!userWithStakes) {
      console.log("❌ No active staking entries found. Please create some stakes first.");
      return;
    }

    const userId = userWithStakes.userId;
    const userName = userWithStakes.user.name || userWithStakes.user.email || "Unknown";

    console.log(`👤 Testing with user: ${userName} (${userId})\n`);

    // Get all active entries for this user
    const entries = await prisma.stakingEntry.findMany({
      where: {
        userId,
        status: "active",
      },
      include: {
        user: {
          include: {
            balance: true,
          },
        },
      },
    });

    // Check which entries came from vouchers
    const entryIds = entries.map(e => e.id);
    const vouchers = await prisma.voucher.findMany({
      where: {
        appliedToStakeId: { in: entryIds },
        status: "used",
      },
      select: {
        id: true,
        appliedToStakeId: true,
        value: true,
      },
    });

    const voucherStakeIds = new Set(vouchers.map(v => v.appliedToStakeId).filter(Boolean) as string[]);

    console.log(`📊 Active Staking Entries: ${entries.length}`);
    console.log(`🎫 Entries from Vouchers: ${voucherStakeIds.size}`);
    console.log(`💼 Real Package Entries: ${entries.length - voucherStakeIds.size}\n`);

    // Get initial balance and dailyEarning
    const initialBalance = await prisma.userBalance.findUnique({
      where: { userId },
    });

    const initialDailyEarning = initialBalance?.dailyEarning || 0;
    const initialBalanceAmount = initialBalance?.balance || 0;

    console.log(`💰 Initial Balance: ${initialBalanceAmount} USDT`);
    console.log(`📈 Initial Daily Earning: ${initialDailyEarning} USDT\n`);

    // Step 1: Distribute ROI
    console.log("🔄 Step 1: Distributing Daily ROI...\n");
    const roiResult = await distributeDailyStakingRewards({ userId });

    console.log(`✅ ROI Distribution Complete:`);
    console.log(`   - Total Rewarded: ${roiResult.totalRewarded} USDT`);
    console.log(`   - Entries Processed: ${roiResult.totalEntries}\n`);

    // Get balance after ROI distribution
    const afterRoiBalance = await prisma.userBalance.findUnique({
      where: { userId },
    });

    const afterRoiDailyEarning = afterRoiBalance?.dailyEarning || 0;
    const afterRoiBalanceAmount = afterRoiBalance?.balance || 0;

    console.log(`💰 Balance after ROI: ${afterRoiBalanceAmount} USDT (+${afterRoiBalanceAmount - initialBalanceAmount})`);
    console.log(`📈 Daily Earning after ROI: ${afterRoiDailyEarning} USDT (+${afterRoiDailyEarning - initialDailyEarning})\n`);

    // Verify: If user has voucher entries, dailyEarning should be less than total rewarded
    if (voucherStakeIds.size > 0 && afterRoiDailyEarning < roiResult.totalRewarded) {
      const voucherEarningsEstimate = roiResult.totalRewarded - afterRoiDailyEarning;
      console.log(`✅ VERIFICATION PASSED:`);
      console.log(`   - Voucher earnings (${voucherEarningsEstimate.toFixed(2)} USDT) excluded from dailyEarning`);
      console.log(`   - Only real package earnings (${afterRoiDailyEarning.toFixed(2)} USDT) in dailyEarning\n`);
    } else if (voucherStakeIds.size === 0) {
      console.log(`ℹ️  No voucher entries found - all earnings are from real packages\n`);
    }

    // Step 2: Distribute Team Earnings
    console.log("🔄 Step 2: Distributing Team Earnings...\n");

    // Check if user has a sponsor (for team earnings)
    const invitedMember = await prisma.invitedMember.findFirst({
      where: { userId },
      include: {
        sponsor: {
          include: {
            balance: true,
          },
        },
      },
    });

    if (!invitedMember) {
      console.log("ℹ️  User has no sponsor - skipping team earnings test\n");
      return;
    }

    const sponsorId = invitedMember.sponsorId;
    const sponsorName = invitedMember.sponsor.name || invitedMember.sponsor.email || "Unknown";

    const sponsorInitialBalance = invitedMember.sponsor.balance?.balance || 0;
    const sponsorInitialTeamEarning = invitedMember.sponsor.balance?.teamEarning || 0;

    console.log(`👥 Sponsor: ${sponsorName} (${sponsorId})`);
    console.log(`💰 Sponsor Initial Balance: ${sponsorInitialBalance} USDT`);
    console.log(`📈 Sponsor Initial Team Earning: ${sponsorInitialTeamEarning} USDT\n`);

    const teamResult = await distributeTeamEarnings();

    console.log(`✅ Team Earnings Distribution Complete:`);
    console.log(`   - Users Rewarded: ${teamResult.rewardedUsers}`);
    console.log(`   - Total Rewarded: ${teamResult.totalRewarded} USDT`);
    console.log(`   - Total Missed: ${teamResult.totalMissed} USDT\n`);

    // Get sponsor balance after team distribution
    const sponsorAfterBalance = await prisma.userBalance.findUnique({
      where: { userId: sponsorId },
    });

    const sponsorAfterBalanceAmount = sponsorAfterBalance?.balance || 0;
    const sponsorAfterTeamEarning = sponsorAfterBalance?.teamEarning || 0;
    const sponsorEarned = sponsorAfterBalanceAmount - sponsorInitialBalance;
    const sponsorTeamEarningAdded = sponsorAfterTeamEarning - sponsorInitialTeamEarning;

    console.log(`💰 Sponsor Balance after Team Distribution: ${sponsorAfterBalanceAmount} USDT (+${sponsorEarned.toFixed(2)})`);
    console.log(`📈 Sponsor Team Earning: ${sponsorAfterTeamEarning} USDT (+${sponsorTeamEarningAdded.toFixed(2)})\n`);

    // Final Verification
    console.log("🔍 Final Verification:\n");

    if (voucherStakeIds.size > 0) {
      const expectedTeamEarning = afterRoiDailyEarning * 0.1; // First level is 10%
      const actualTeamEarning = sponsorTeamEarningAdded;

      console.log(`Expected team earning (10% of dailyEarning): ${expectedTeamEarning.toFixed(2)} USDT`);
      console.log(`Actual team earning: ${actualTeamEarning.toFixed(2)} USDT`);

      // Allow small rounding differences
      if (Math.abs(actualTeamEarning - expectedTeamEarning) < 0.01) {
        console.log(`\n✅ SUCCESS: Team earnings match expected value`);
        console.log(`   - Voucher earnings correctly excluded from team distribution`);
        console.log(`   - Only real package earnings generated team earnings`);
      } else {
        console.log(`\n⚠️  WARNING: Team earnings don't match expected value`);
        console.log(`   - Difference: ${Math.abs(actualTeamEarning - expectedTeamEarning).toFixed(2)} USDT`);
      }
    } else {
      console.log(`ℹ️  No voucher entries to verify exclusion`);
    }

    console.log("\n✅ Test Complete!");

  } catch (error) {
    console.error("❌ Test failed with error:", error);
    throw error;
  }
}

// Run the test
testVoucherTeamEarnings()
  .then(() => {
    console.log("\n✅ All tests completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });

