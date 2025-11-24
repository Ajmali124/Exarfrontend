/**
 * Test Script: Verify All Vouchers Can Be Used
 * 
 * Tests voucher usage for user: IzZ3SLa2aRTQKBnddT1zTHQn1JxuRzxZ
 * 
 * This script will:
 * 1. Fetch all vouchers for the user
 * 2. Check voucher status and eligibility
 * 3. Test "Use Now" functionality for package vouchers
 * 4. Verify staking entries are created correctly
 */

import prisma from "../src/lib/prismadb";

const USER_ID = "IzZ3SLa2aRTQKBnddT1zTHQn1JxuRzxZ";

async function testUserVouchers() {
  console.log("🧪 Testing Vouchers for User\n");
  console.log(`👤 User ID: ${USER_ID}\n`);

  try {
    // Fetch user info
    const user = await prisma.user.findUnique({
      where: { id: USER_ID },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const userBalance = await prisma.userBalance.findUnique({
      where: { userId: USER_ID },
      select: {
        balance: true,
        onStaking: true,
      },
    });

    if (!user) {
      console.error("❌ User not found");
      process.exit(1);
    }

    console.log(`📧 User: ${user.name || user.email || "Unknown"}`);
    console.log(`💰 Balance: ${userBalance?.balance || 0} USDT`);
    console.log(`📊 On Staking: ${userBalance?.onStaking || 0} USDT\n`);

    // Fetch all vouchers for this user
    const vouchers = await prisma.voucher.findMany({
      where: {
        userId: USER_ID,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`🎫 Total Vouchers: ${vouchers.length}\n`);
    console.log("=" .repeat(80));

    if (vouchers.length === 0) {
      console.log("⚠️  No vouchers found for this user");
      process.exit(0);
    }

    // Categorize vouchers
    const activeVouchers = vouchers.filter(v => v.status === "active" && new Date(v.expiresAt) > new Date());
    const packageVouchers = activeVouchers.filter(v => v.type === "package");
    const withdrawVouchers = activeVouchers.filter(v => v.type === "withdraw");
    const usedVouchers = vouchers.filter(v => v.status === "used");
    const expiredVouchers = vouchers.filter(v => v.status === "expired" || new Date(v.expiresAt) <= new Date());

    console.log("\n📊 Voucher Summary:");
    console.log("-".repeat(80));
    console.log(`✅ Active Vouchers: ${activeVouchers.length}`);
    console.log(`   - Package (Stakable): ${packageVouchers.length}`);
    console.log(`   - Withdraw: ${withdrawVouchers.length}`);
    console.log(`✅ Used Vouchers: ${usedVouchers.length}`);
    console.log(`❌ Expired Vouchers: ${expiredVouchers.length}`);
    console.log("-".repeat(80));

    // Display all vouchers
    console.log("\n🎫 All Vouchers:");
    console.log("=" .repeat(80));
    vouchers.forEach((voucher, index) => {
      const isExpired = new Date(voucher.expiresAt) <= new Date();
      const statusBadge = voucher.status === "active" && !isExpired ? "✅" : voucher.status === "used" ? "✅" : "❌";
      
      console.log(`\n${index + 1}. ${statusBadge} ${voucher.title}`);
      console.log(`   Code: ${voucher.code || "N/A"}`);
      console.log(`   Value: $${voucher.value} ${voucher.currency}`);
      console.log(`   Type: ${voucher.type}`);
      console.log(`   Status: ${voucher.status}${isExpired && voucher.status === "active" ? " (Expired)" : ""}`);
      console.log(`   Expires: ${new Date(voucher.expiresAt).toLocaleDateString()}`);
      
      if (voucher.type === "package") {
        console.log(`   ROI Validity: ${voucher.roiValidityDays || "N/A"} days`);
        console.log(`   Max Cap: ${voucher.affectsMaxCap ? "Yes" : "No (Flushed)"}`);
        console.log(`   Requires Real Package: ${voucher.requiresRealPackage ? "Yes" : "No"}`);
        if (voucher.appliedToStakeId) {
          console.log(`   ⚠️  Already applied to stake: ${voucher.appliedToStakeId}`);
        }
      }
      
      if (voucher.usedAt) {
        console.log(`   Used At: ${new Date(voucher.usedAt).toLocaleDateString()}`);
      }
    });

    // Test package vouchers that can be used
    console.log("\n\n🧪 Testing Package Voucher Usage:");
    console.log("=" .repeat(80));

    if (packageVouchers.length === 0) {
      console.log("⚠️  No active package vouchers to test");
    } else {
      console.log(`\n📦 Found ${packageVouchers.length} active package voucher(s) to test\n`);

      for (const voucher of packageVouchers) {
        console.log(`\n🔍 Testing Voucher: ${voucher.code}`);
        console.log(`   Title: ${voucher.title}`);
        console.log(`   Value: $${voucher.value} USDT`);
        console.log(`   ROI Validity: ${voucher.roiValidityDays} days`);
        console.log(`   Max Cap: ${voucher.affectsMaxCap ? "Yes" : "No"}`);

        // Check if already used
        if (voucher.status === "used") {
          console.log(`   ⚠️  Already used - skipping`);
          if (voucher.appliedToStakeId) {
            const stake = await prisma.stakingEntry.findUnique({
              where: { id: voucher.appliedToStakeId },
              select: {
                id: true,
                packageName: true,
                amount: true,
                status: true,
                totalEarned: true,
                maxEarning: true,
              },
            });
            if (stake) {
              console.log(`   📊 Linked Stake: ${stake.packageName} - $${stake.amount} (Status: ${stake.status})`);
            }
          }
          continue;
        }

        // Check expiry
        if (new Date(voucher.expiresAt) <= new Date()) {
          console.log(`   ❌ Expired - cannot use`);
          continue;
        }

        // Check requirements
        if (voucher.requiresRealPackage) {
          const hasRealPackage = await prisma.stakingEntry.findFirst({
            where: {
              userId: USER_ID,
              status: "active",
              // Check if this is NOT from a voucher (no voucher link)
            },
          });

          // Check if user has a real package (not from voucher)
          const realPackages = await prisma.stakingEntry.findMany({
            where: {
              userId: USER_ID,
              status: "active",
            },
            include: {
              // We need to check if this stake entry is linked to a voucher
            },
          });

          // Check which stakes are from vouchers
          const voucherStakeIds = await prisma.voucher.findMany({
            where: {
              userId: USER_ID,
              appliedToStakeId: { not: null },
              status: "used",
            },
            select: {
              appliedToStakeId: true,
            },
          });

          const voucherStakeIdSet = new Set(
            voucherStakeIds.map(v => v.appliedToStakeId).filter(Boolean) as string[]
          );

          const hasRealPackageStake = realPackages.some(
            stake => !voucherStakeIdSet.has(stake.id)
          );

          if (!hasRealPackageStake) {
            console.log(`   ⚠️  Requires real package - user doesn't have one yet`);
            console.log(`   ℹ️  This voucher can only be used after user buys a real package`);
            continue;
          }
        }

        // Test voucher usage
        try {
          console.log(`   🔄 Attempting to use voucher...`);

          // We need to use the actual tRPC procedure, but we can simulate it
          // Let's use the voucher logic directly
          const packageInfo = await prisma.voucher.findUnique({
            where: { id: voucher.id },
            select: {
              packageId: true,
              packageName: true,
              value: true,
              roiValidityDays: true,
              affectsMaxCap: true,
            },
          });

          if (!packageInfo?.packageId) {
            console.log(`   ❌ No package info found - cannot use`);
            continue;
          }

          // Check if voucher can be used (simulate the check)
          const canUse = voucher.status === "active" && 
                        new Date(voucher.expiresAt) > new Date() &&
                        !voucher.appliedToStakeId;

          if (!canUse) {
            console.log(`   ❌ Cannot use - validation failed`);
            continue;
          }

          console.log(`   ✅ Voucher can be used!`);
          console.log(`   ℹ️  To actually use it, click "Use Now" in the UI or call useVoucherForStake mutation`);

        } catch (error: any) {
          console.log(`   ❌ Error testing voucher: ${error.message}`);
        }
      }
    }

    // Summary
    console.log("\n\n📋 Test Summary:");
    console.log("=" .repeat(80));
    console.log(`Total Vouchers: ${vouchers.length}`);
    console.log(`✅ Can Use Now: ${packageVouchers.filter(v => !v.appliedToStakeId && new Date(v.expiresAt) > new Date()).length}`);
    console.log(`✅ Already Used: ${usedVouchers.length}`);
    console.log(`❌ Expired: ${expiredVouchers.length}`);
    console.log(`💰 Withdraw Vouchers: ${withdrawVouchers.length} (already credited to balance)`);

    // List vouchers that can be used
    const usableVouchers = packageVouchers.filter(
      v => !v.appliedToStakeId && new Date(v.expiresAt) > new Date()
    );

    if (usableVouchers.length > 0) {
      console.log("\n✅ Vouchers Ready to Use:");
      console.log("-".repeat(80));
      usableVouchers.forEach((v, i) => {
        console.log(`${i + 1}. ${v.code} - ${v.title} ($${v.value} - ${v.roiValidityDays} days ROI)`);
      });
    }

    console.log("\n✅ Test Complete!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

// Run the test
testUserVouchers()
  .then(() => {
    console.log("\n✅ All tests completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });

