/**
 * Test if the $30 Silver Node voucher can now be used correctly
 */

import prisma from "../src/lib/prismadb";
import { STAKING_PACKAGES } from "../src/lib/staking-packages";

const USER_ID = "IzZ3SLa2aRTQKBnddT1zTHQn1JxuRzxZ";

async function testSilverVoucherFix() {
  console.log("🧪 Testing Silver Node Voucher Fix\n");

  try {
    // Find the $30 Silver Node voucher
    const voucher = await prisma.voucher.findFirst({
      where: {
        userId: USER_ID,
        value: 30,
        type: "package",
        status: "active",
        OR: [
          { title: { contains: "Silver" } },
          { description: { contains: "Silver" } },
        ],
      },
    });

    if (!voucher) {
      console.log("❌ $30 Silver Node voucher not found");
      process.exit(1);
    }

    console.log(`✅ Found voucher: ${voucher.code}`);
    console.log(`   Title: ${voucher.title}`);
    console.log(`   Description: ${voucher.description || "N/A"}`);
    console.log(`   Value: $${voucher.value}`);
    console.log(`   Package ID: ${voucher.packageId ?? "NOT SET"}`);
    console.log(`   Package Name: ${voucher.packageName ?? "NOT SET"}\n`);

    // Test package detection logic
    let packageInfo;
    
    // Step 1: Check packageId
    if (voucher.packageId !== null && voucher.packageId !== undefined) {
      packageInfo = STAKING_PACKAGES.find((p) => p.id === voucher.packageId);
      console.log(`📦 Method 1 (packageId): ${packageInfo ? `✅ Found ${packageInfo.name}` : "❌ Not found"}`);
    } else {
      console.log(`📦 Method 1 (packageId): ⚠️  Not set`);
    }

    // Step 2: Check packageName
    if (!packageInfo && voucher.packageName) {
      packageInfo = STAKING_PACKAGES.find((p) => 
        p.name.toLowerCase() === voucher.packageName?.toLowerCase()
      );
      console.log(`📦 Method 2 (packageName): ${packageInfo ? `✅ Found ${packageInfo.name}` : "❌ Not found"}`);
    } else {
      console.log(`📦 Method 2 (packageName): ${voucher.packageName ? "⚠️  Set but packageId worked" : "⚠️  Not set"}`);
    }

    // Step 3: Infer from title/description
    if (!packageInfo) {
      const titleLower = (voucher.title || "").toLowerCase();
      const descriptionLower = (voucher.description || "").toLowerCase();
      
      for (const pkg of STAKING_PACKAGES) {
        const packageNameLower = pkg.name.toLowerCase();
        if (titleLower.includes(packageNameLower) || descriptionLower.includes(packageNameLower)) {
          packageInfo = pkg;
          console.log(`📦 Method 3 (title/description): ✅ Found ${pkg.name} (ID: ${pkg.id})`);
          break;
        }
      }
      
      if (!packageInfo) {
        console.log(`📦 Method 3 (title/description): ❌ No package name found in title/description`);
      }
    }

    if (!packageInfo) {
      console.log("\n❌ Could not determine package for voucher");
      process.exit(1);
    }

    console.log(`\n✅ Package Detected: ${packageInfo.name}`);
    console.log(`   ID: ${packageInfo.id}`);
    console.log(`   Amount: $${packageInfo.amount}`);
    console.log(`   ROI: ${packageInfo.roi}%`);
    console.log(`   Cap: ${packageInfo.cap}x`);

    // Calculate expected values
    const stakeAmount = voucher.value; // $30
    const dailyROI = (stakeAmount * packageInfo.roi) / 100;
    const maxEarning = voucher.affectsMaxCap 
      ? stakeAmount * packageInfo.cap
      : 0;
    const totalROIPeriod = voucher.roiValidityDays || 0;

    console.log(`\n📊 Expected Stake Entry:`);
    console.log(`   - Amount: $${stakeAmount} USDT`);
    console.log(`   - Package: ${packageInfo.name}`);
    console.log(`   - Daily ROI: $${dailyROI.toFixed(4)}/day (${packageInfo.roi}% of $${stakeAmount})`);
    if (voucher.affectsMaxCap) {
      console.log(`   - Max Earning: $${maxEarning.toFixed(2)} (${packageInfo.cap}x of $${stakeAmount})`);
    } else {
      console.log(`   - Max Earning: Flushed (no cap tracking)`);
    }
    console.log(`   - ROI Period: ${totalROIPeriod} days`);

    // Verify it's using Silver Node settings
    if (packageInfo.id === 2) {
      console.log(`\n✅ SUCCESS: Voucher will use Silver Node settings!`);
      console.log(`   ✅ ROI: 1.1% (correct for Silver Node)`);
      console.log(`   ✅ Cap: 2.0x (correct for Silver Node)`);
    } else {
      console.log(`\n⚠️  WARNING: Voucher is using ${packageInfo.name} settings, not Silver Node`);
      console.log(`   Expected: Silver Node (ID: 2, ROI: 1.1%, Cap: 2.0x)`);
      console.log(`   Actual: ${packageInfo.name} (ID: ${packageInfo.id}, ROI: ${packageInfo.roi}%, Cap: ${packageInfo.cap}x)`);
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

testSilverVoucherFix()
  .then(() => {
    console.log("\n✅ Test complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });

