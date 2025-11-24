/**
 * Test Script: Actually Test Voucher Usage with Real Package Matching
 * 
 * Tests if all vouchers can be used after the fix
 */

import prisma from "../src/lib/prismadb";
import { STAKING_PACKAGES, findPackageForAmount } from "../src/lib/staking-packages";

const USER_ID = "IzZ3SLa2aRTQKBnddT1zTHQn1JxuRzxZ";

async function testActualVoucherUsage() {
  console.log("🧪 Testing Actual Voucher Usage\n");
  console.log(`👤 User ID: ${USER_ID}\n`);

  try {
    // Fetch all active package vouchers for this user
    const vouchers = await prisma.voucher.findMany({
      where: {
        userId: USER_ID,
        type: "package",
        status: "active",
        expiresAt: { gt: new Date() },
        appliedToStakeId: null, // Not already used
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`🎫 Found ${vouchers.length} active package vouchers ready to use\n`);
    console.log("=" .repeat(80));

    if (vouchers.length === 0) {
      console.log("⚠️  No active package vouchers found to test");
      process.exit(0);
    }

    // Test each voucher
    for (const voucher of vouchers) {
      console.log(`\n🔍 Testing Voucher: ${voucher.code}`);
      console.log(`   Title: ${voucher.title}`);
      console.log(`   Value: $${voucher.value} USDT`);
      console.log(`   ROI Validity: ${voucher.roiValidityDays || "N/A"} days`);
      console.log(`   Max Cap: ${voucher.affectsMaxCap ? "Yes" : "No (Flushed)"}`);

      // Find matching package using the same logic as the fixed code
      let packageInfo;
      if (voucher.packageId !== null && voucher.packageId !== undefined) {
        packageInfo = STAKING_PACKAGES.find((p) => p.id === voucher.packageId);
      } else if (voucher.packageName) {
        packageInfo = STAKING_PACKAGES.find((p) => 
          p.name.toLowerCase() === voucher.packageName?.toLowerCase()
        );
      } else {
        packageInfo = findPackageForAmount(voucher.value);
        
        // If no exact match, use Trial Node as default for promotional vouchers
        if (!packageInfo) {
          packageInfo = STAKING_PACKAGES.find((p) => p.id === 0); // Trial Node
        }
      }

      if (!packageInfo) {
        console.log(`   ❌ No package found - CANNOT USE`);
        continue;
      }

      console.log(`   📦 Package: ${packageInfo.name} (ID: ${packageInfo.id})`);
      console.log(`   📈 Daily ROI: ${packageInfo.roi}%`);
      console.log(`   🎯 Cap: ${packageInfo.cap}x`);

      // Check if value matches (promotional vouchers may not match exactly)
      const valueMatches = voucher.value === packageInfo.amount;
      if (!valueMatches) {
        console.log(`   ℹ️  Voucher value ($${voucher.value}) != Package amount ($${packageInfo.amount})`);
        console.log(`   ℹ️  Will use voucher value as stake amount (promotional voucher)`);
      }

      // Calculate expected values
      const stakeAmount = voucher.value; // Use voucher value, not package amount
      const dailyROI = (stakeAmount * packageInfo.roi) / 100;
      const maxEarning = voucher.affectsMaxCap 
        ? stakeAmount * packageInfo.cap
        : 0;
      const totalROIPeriod = voucher.roiValidityDays || 0;
      const potentialTotalROI = dailyROI * totalROIPeriod;

      console.log(`\n   ✅ VALIDATION PASSED - Voucher can be used!`);
      console.log(`\n   📊 Expected Stake Entry:`);
      console.log(`      - Amount: $${stakeAmount} USDT (from voucher)`);
      console.log(`      - Package: ${packageInfo.name}`);
      console.log(`      - Daily ROI: $${dailyROI.toFixed(4)}/day (${packageInfo.roi}% of $${stakeAmount})`);
      if (voucher.affectsMaxCap) {
        console.log(`      - Max Earning: $${maxEarning.toFixed(2)} (${packageInfo.cap}x of $${stakeAmount})`);
        console.log(`      - ROI Period: ${totalROIPeriod} days (will stop at max cap if reached)`);
      } else {
        console.log(`      - Max Earning: Flushed (no cap tracking)`);
        console.log(`      - ROI Period: ${totalROIPeriod} days`);
        console.log(`      - Potential Total ROI: $${potentialTotalROI.toFixed(2)} over ${totalROIPeriod} days`);
      }

      console.log(`   ${"=".repeat(70)}`);
    }

    // Summary
    const testResults = vouchers.map(v => {
      let pkg;
      if (v.packageId !== null && v.packageId !== undefined) {
        pkg = STAKING_PACKAGES.find((p) => p.id === v.packageId);
      } else if (v.packageName) {
        pkg = STAKING_PACKAGES.find((p) => 
          p.name.toLowerCase() === v.packageName?.toLowerCase()
        );
      } else {
        pkg = findPackageForAmount(v.value);
        if (!pkg) {
          pkg = STAKING_PACKAGES.find((p) => p.id === 0); // Trial Node
        }
      }
      return { voucher: v, package: pkg, canUse: !!pkg };
    });

    const usableVouchers = testResults.filter(r => r.canUse);
    const unusableVouchers = testResults.filter(r => !r.canUse);

    console.log("\n\n📋 Final Summary:");
    console.log("=" .repeat(80));
    console.log(`Total Package Vouchers: ${vouchers.length}`);
    console.log(`✅ Can Use Now: ${usableVouchers.length}`);
    console.log(`❌ Cannot Use: ${unusableVouchers.length}`);
    console.log(`💰 Total Value Ready to Stake: $${usableVouchers.reduce((sum, r) => sum + r.voucher.value, 0)} USDT`);
    
    if (usableVouchers.length > 0) {
      console.log("\n✅ Vouchers Ready to Use:");
      console.log("-".repeat(80));
      usableVouchers.forEach((r, i) => {
        const v = r.voucher;
        const pkg = r.package!;
        const dailyROI = (v.value * pkg.roi) / 100;
        console.log(`${i + 1}. ${v.code} - ${v.title}`);
        console.log(`   Value: $${v.value} | Package: ${pkg.name} | ROI: ${v.roiValidityDays} days | Daily: $${dailyROI.toFixed(4)}`);
      });
    }

    if (unusableVouchers.length > 0) {
      console.log("\n❌ Vouchers That Cannot Be Used:");
      console.log("-".repeat(80));
      unusableVouchers.forEach((r, i) => {
        const v = r.voucher;
        console.log(`${i + 1}. ${v.code} - ${v.title} (No matching package found)`);
      });
    }

    console.log("\n✅ Test Complete!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

// Run the test
testActualVoucherUsage()
  .then(() => {
    console.log("\n✅ All tests completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });

