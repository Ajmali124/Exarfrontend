import prisma from "../src/lib/prismadb";

/**
 * Fix expired voucher positions by marking them as completed
 * This script will mark all active staking entries that are linked to vouchers
 * with expired roiEndDate as "completed"
 */
async function fixExpiredVoucherPositions() {
  console.log("🔧 Fixing expired voucher positions...\n");

  try {
    // Get all active staking entries
    const activeEntries = await prisma.stakingEntry.findMany({
      where: {
        status: "active",
      },
      select: {
        id: true,
        userId: true,
        packageName: true,
        amount: true,
        status: true,
        startDate: true,
      },
    });

    console.log(`📊 Found ${activeEntries.length} active staking entries\n`);

    // Get all vouchers that are linked to stakes
    const vouchers = await prisma.voucher.findMany({
      where: {
        appliedToStakeId: { not: null },
        status: "used",
      },
      select: {
        id: true,
        code: true,
        appliedToStakeId: true,
        roiEndDate: true,
        roiValidityDays: true,
        usedAt: true,
        type: true,
        value: true,
        title: true,
      },
    });

    console.log(`🎫 Found ${vouchers.length} vouchers linked to stakes\n`);

    // Create a map of stake ID to voucher info
    const voucherMap = new Map(
      vouchers
        .filter((v) => v.appliedToStakeId && v.roiEndDate)
        .map((v) => [v.appliedToStakeId!, v])
    );

    const now = new Date();
    const expiredPositions: Array<{
      stakeId: string;
      userId: string;
      packageName: string | null;
      amount: number;
      voucherCode: string | null;
      voucherId: string;
      roiEndDate: Date;
      daysPastExpiry: number;
    }> = [];

    // Find expired positions
    for (const entry of activeEntries) {
      const voucher = voucherMap.get(entry.id);
      
      if (voucher && voucher.roiEndDate) {
        const roiEndDate = new Date(voucher.roiEndDate);
        
        // Check if ROI period has ended
        if (now > roiEndDate) {
          const daysPastExpiry = Math.floor(
            (now.getTime() - roiEndDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          expiredPositions.push({
            stakeId: entry.id,
            userId: entry.userId,
            packageName: entry.packageName,
            amount: entry.amount,
            voucherCode: voucher.code,
            voucherId: voucher.id,
            roiEndDate: roiEndDate,
            daysPastExpiry: daysPastExpiry,
          });
        }
      }
    }

    if (expiredPositions.length === 0) {
      console.log("✅ No expired voucher positions found. Nothing to fix.\n");
      return;
    }

    console.log(`⚠️  Found ${expiredPositions.length} expired voucher positions to fix:\n`);
    
    // Display what will be fixed
    expiredPositions.forEach((pos, index) => {
      console.log(`${index + 1}. Stake ID: ${pos.stakeId} - ${pos.daysPastExpiry} days past expiry`);
    });

    // Fix them in a transaction
    console.log("\n🔄 Marking positions as completed...\n");

    const results = await prisma.$transaction(
      expiredPositions.map((pos) =>
        prisma.stakingEntry.update({
          where: { id: pos.stakeId },
          data: {
            status: "completed",
            endDate: pos.roiEndDate,
          },
        })
      )
    );

    console.log(`✅ Successfully marked ${results.length} positions as completed!\n`);

    // Verify the fix
    const updatedEntries = await prisma.stakingEntry.findMany({
      where: {
        id: { in: expiredPositions.map(p => p.stakeId) },
      },
      select: {
        id: true,
        status: true,
        endDate: true,
      },
    });

    console.log("📋 Verification:");
    console.log("=".repeat(80));
    updatedEntries.forEach((entry) => {
      const pos = expiredPositions.find(p => p.stakeId === entry.id);
      console.log(`Stake ${entry.id.substring(0, 8)}...`);
      console.log(`   Status: ${entry.status}`);
      console.log(`   End Date: ${entry.endDate?.toISOString() || "N/A"}`);
      console.log(`   Days Past Expiry: ${pos?.daysPastExpiry || "N/A"}`);
      console.log("");
    });

    console.log("=".repeat(80));
    console.log(`\n✅ Fix completed successfully! ${results.length} positions marked as completed.`);

  } catch (error) {
    console.error("❌ Error fixing expired voucher positions:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixExpiredVoucherPositions()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
