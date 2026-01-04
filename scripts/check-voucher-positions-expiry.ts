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
    type VoucherPosition = {
      stakeId: string;
      userId: string;
      packageName: string | null;
      amount: number;
      voucherCode: string | null;
      voucherId: string;
      roiEndDate: Date | null;
      roiValidityDays: number | null;
      daysActive: number;
      daysPastExpiry: number | null;
      daysUntilExpiry: number | null;
      startDate: Date;
      isExpired: boolean;
    };

    const allPositions: VoucherPosition[] = [];

    // Find all voucher positions (both active and expired)
    for (const entry of activeEntries) {
      const voucher = voucherMap.get(entry.id);
      
      if (voucher && voucher.roiEndDate) {
        const roiEndDate = new Date(voucher.roiEndDate);
        
        // Calculate days active - use voucher usedAt or staking entry startDate
        const startDate = voucher.usedAt ? new Date(voucher.usedAt) : (entry.startDate ? new Date(entry.startDate) : now);
        const daysActive = Math.floor(
          (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Check if ROI period has ended
        const isExpired = now > roiEndDate;
        const daysPastExpiry = isExpired 
          ? Math.floor((now.getTime() - roiEndDate.getTime()) / (1000 * 60 * 60 * 24))
          : null;
        const daysUntilExpiry = !isExpired
          ? Math.floor((roiEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        allPositions.push({
          stakeId: entry.id,
          userId: entry.userId,
          packageName: entry.packageName,
          amount: entry.amount,
          voucherCode: voucher.code,
          voucherId: voucher.id,
          roiEndDate: roiEndDate,
          roiValidityDays: voucher.roiValidityDays,
          daysActive: daysActive,
          daysPastExpiry: daysPastExpiry,
          daysUntilExpiry: daysUntilExpiry,
          startDate: startDate,
          isExpired: isExpired,
        });
      }
    }

    // Separate expired and active positions
    const expiredPositions = allPositions.filter(p => p.isExpired);
    const activePositions = allPositions.filter(p => !p.isExpired);

    // Display all positions
    console.log("=".repeat(80));
    console.log("📊 ALL VOUCHER POSITIONS SUMMARY");
    console.log("=".repeat(80));
    console.log(`Total Voucher Positions: ${allPositions.length}`);
    console.log(`✅ Active Positions: ${activePositions.length}`);
    console.log(`⚠️  Expired Positions: ${expiredPositions.length}`);
    console.log("");

    // Display active positions
    if (activePositions.length > 0) {
      console.log("✅ ACTIVE VOUCHER POSITIONS:");
      console.log("-".repeat(80));
      activePositions.forEach((pos, index) => {
        console.log(`${index + 1}. Stake ID: ${pos.stakeId.substring(0, 8)}...`);
        console.log(`   Voucher Code: ${pos.voucherCode || "N/A"}`);
        console.log(`   Package: ${pos.packageName || "N/A"} - $${pos.amount}`);
        console.log(`   Days Active: ${pos.daysActive} days`);
        console.log(`   Days Until Expiry: ${pos.daysUntilExpiry} days`);
        console.log(`   ROI Validity: ${pos.roiValidityDays || "N/A"} days`);
        console.log(`   Expiry Date: ${pos.roiEndDate?.toISOString().split('T')[0] || "N/A"}`);
        console.log("");
      });
    }

    // Display expired positions
    if (expiredPositions.length > 0) {
      console.log("⚠️  EXPIRED VOUCHER POSITIONS:");
      console.log("-".repeat(80));
      expiredPositions.forEach((pos, index) => {
        console.log(`${index + 1}. Stake ID: ${pos.stakeId.substring(0, 8)}...`);
        console.log(`   Voucher Code: ${pos.voucherCode || "N/A"}`);
        console.log(`   Package: ${pos.packageName || "N/A"} - $${pos.amount}`);
        console.log(`   Days Active: ${pos.daysActive} days`);
        console.log(`   Days Past Expiry: ${pos.daysPastExpiry} days`);
        console.log(`   ROI Validity: ${pos.roiValidityDays || "N/A"} days`);
        console.log(`   Expiry Date: ${pos.roiEndDate?.toISOString().split('T')[0] || "N/A"}`);
        console.log("");
      });
    }

    if (expiredPositions.length === 0) {
      console.log("✅ No expired voucher positions found. Nothing to fix.\n");
      return;
    }

    // Fix expired positions in a transaction
    console.log("=".repeat(80));
    console.log("🔄 FIXING EXPIRED POSITIONS");
    console.log("=".repeat(80));
    console.log(`Marking ${expiredPositions.length} expired positions as completed...\n`);

    const results = await prisma.$transaction(
      expiredPositions.map((pos) =>
        prisma.stakingEntry.update({
          where: { id: pos.stakeId },
          data: {
            status: "completed",
            endDate: pos.roiEndDate || now,
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

    console.log("📋 VERIFICATION:");
    console.log("=".repeat(80));
    updatedEntries.forEach((entry) => {
      const pos = expiredPositions.find(p => p.stakeId === entry.id);
      console.log(`Stake ${entry.id.substring(0, 8)}...`);
      console.log(`   Status: ${entry.status} (was active, now completed)`);
      console.log(`   Start Date: ${pos?.startDate.toISOString().split('T')[0] || "N/A"}`);
      console.log(`   End Date: ${entry.endDate?.toISOString().split('T')[0] || "N/A"}`);
      console.log(`   Days Active: ${pos?.daysActive || "N/A"} days`);
      console.log(`   Days Past Expiry: ${pos?.daysPastExpiry || "N/A"} days`);
      console.log(`   Voucher Code: ${pos?.voucherCode || "N/A"}`);
      console.log("");
    });

    console.log("=".repeat(80));
    console.log(`\n✅ Fix completed successfully! ${results.length} expired positions marked as completed.`);
    console.log(`📊 Summary: ${activePositions.length} active positions remaining, ${results.length} expired positions fixed.`);

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
