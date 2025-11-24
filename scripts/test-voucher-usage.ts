/**
 * Test Script: Actually Test Voucher Usage
 * 
 * Tests voucher usage for user: IzZ3SLa2aRTQKBnddT1zTHQn1JxuRzxZ
 * 
 * This script will:
 * 1. Fetch all active package vouchers
 * 2. Test if they can be used (validation checks)
 * 3. Simulate the "Use Now" action to verify it works
 */

import prisma from "../src/lib/prismadb";
import { STAKING_PACKAGES, findPackageForAmount, calculateMaxEarning } from "../src/lib/staking-packages";

const USER_ID = "IzZ3SLa2aRTQKBnddT1zTHQn1JxuRzxZ";

async function testVoucherUsage() {
  console.log("🧪 Testing Voucher Usage\n");
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

      // Find matching package
      const packageInfo = findPackageForAmount(voucher.value);
      
      if (!packageInfo) {
        console.log(`   ⚠️  No matching package found for value $${voucher.value}`);
        console.log(`   ℹ️  Available packages: ${STAKING_PACKAGES.map(p => `$${p.amount}`).join(", ")}`);
        continue;
      }

      console.log(`   📦 Package: ${packageInfo.name}`);
      console.log(`   📈 Daily ROI: ${packageInfo.roi}%`);
      console.log(`   🎯 Cap: ${packageInfo.cap}x`);

      // Calculate max earning
      const maxEarning = voucher.affectsMaxCap 
        ? calculateMaxEarning(voucher.value, packageInfo.cap)
        : 0;

      if (voucher.affectsMaxCap) {
        console.log(`   💰 Max Earning: $${maxEarning} USDT (${packageInfo.cap}x cap)`);
      } else {
        console.log(`   💰 Max Earning: Flushed (no cap tracking)`);
      }

      // Check if can be used
      const checks = {
        isActive: voucher.status === "active",
        notExpired: new Date(voucher.expiresAt) > new Date(),
        notAlreadyUsed: !voucher.appliedToStakeId,
        hasPackage: !!packageInfo,
        roiValiditySet: !!voucher.roiValidityDays,
      };

      const allChecksPass = Object.values(checks).every(v => v === true);

      console.log(`\n   ✅ Validation Checks:`);
      console.log(`      - Is Active: ${checks.isActive ? "✅" : "❌"}`);
      console.log(`      - Not Expired: ${checks.notExpired ? "✅" : "❌"}`);
      console.log(`      - Not Already Used: ${checks.notAlreadyUsed ? "✅" : "❌"}`);
      console.log(`      - Has Package: ${checks.hasPackage ? "✅" : "❌"}`);
      console.log(`      - ROI Validity Set: ${checks.roiValiditySet ? "✅" : "❌"}`);

      if (allChecksPass) {
        console.log(`\n   ✅ VOUCHER CAN BE USED!`);
        console.log(`   ℹ️  When "Use Now" is clicked, it will:`);
        console.log(`      1. Create a ${packageInfo.name} stake entry ($${voucher.value})`);
        console.log(`      2. Mark voucher as "used"`);
        console.log(`      3. Link voucher to stake entry`);
        console.log(`      4. Set ROI end date (${voucher.roiValidityDays} days from now)`);
        console.log(`      5. Add $${voucher.value} to onStaking balance`);
        
        // Calculate expected daily ROI
        const dailyROI = (voucher.value * packageInfo.roi) / 100;
        const totalROIPeriod = voucher.roiValidityDays || 0;
        const potentialTotalROI = dailyROI * totalROIPeriod;
        
        console.log(`      6. Daily ROI: $${dailyROI.toFixed(4)}/day`);
        if (voucher.affectsMaxCap) {
          console.log(`      7. Max total earning: $${maxEarning} (will stop at cap)`);
        } else {
          console.log(`      7. Will earn ROI for ${totalROIPeriod} days (flushed, no cap)`);
          console.log(`         Potential total: $${potentialTotalROI.toFixed(2)} over ${totalROIPeriod} days`);
        }
      } else {
        console.log(`\n   ❌ VOUCHER CANNOT BE USED`);
        const failedChecks = Object.entries(checks)
          .filter(([_, passed]) => !passed)
          .map(([name]) => name);
        console.log(`   ⚠️  Failed checks: ${failedChecks.join(", ")}`);
      }

      console.log(`   ${"=".repeat(70)}`);
    }

    // Summary
    const usableVouchers = vouchers.filter(v => {
      const pkg = findPackageForAmount(v.value);
      return v.status === "active" && 
             new Date(v.expiresAt) > new Date() && 
             !v.appliedToStakeId &&
             !!pkg &&
             !!v.roiValidityDays;
    });

    console.log("\n\n📋 Final Summary:");
    console.log("=" .repeat(80));
    console.log(`Total Package Vouchers: ${vouchers.length}`);
    console.log(`✅ Can Use Now: ${usableVouchers.length}`);
    console.log(`💰 Total Value Ready to Stake: $${usableVouchers.reduce((sum, v) => sum + v.value, 0)} USDT`);
    
    if (usableVouchers.length > 0) {
      console.log("\n✅ Vouchers Ready to Use:");
      console.log("-".repeat(80));
      usableVouchers.forEach((v, i) => {
        const pkg = findPackageForAmount(v.value);
        const dailyROI = pkg ? (v.value * pkg.roi) / 100 : 0;
        console.log(`${i + 1}. ${v.code} - ${v.title}`);
        console.log(`   Value: $${v.value} | ROI: ${v.roiValidityDays} days | Daily: $${dailyROI.toFixed(4)}`);
      });
    }

    console.log("\n✅ Test Complete!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

// Run the test
testVoucherUsage()
  .then(() => {
    console.log("\n✅ All tests completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });

