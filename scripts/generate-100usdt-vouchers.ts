/**
 * Generate 5 Stakable Vouchers - $100 USDT
 * 
 * These vouchers are:
 * - Stakable (package type)
 * - $100 value (Bronze Node)
 * - 14 days ROI validity
 * - Independent max cap included (affectsMaxCap = true)
 * - Unassigned (can be redeemed by code)
 * - 60 days expiry (2 months to redeem)
 */

import { createVouchersInBulk } from "../src/lib/voucher/generate";
import { STAKING_PACKAGES } from "../src/lib/staking-packages";

async function generate100UsdtVouchers() {
  console.log("🎫 Generating 5 Stakable Vouchers ($100 USDT)...\n");

  try {
    // Find Bronze Node package (packageId: 1, value: $100)
    const bronzeNodePackage = STAKING_PACKAGES.find(pkg => pkg.id === 1);
    
    if (!bronzeNodePackage) {
      throw new Error("Bronze Node package not found");
    }

    console.log(`📦 Package: ${bronzeNodePackage.name}`);
    console.log(`💰 Value: $${bronzeNodePackage.amount} USDT`);
    console.log(`📈 Daily ROI: ${bronzeNodePackage.roi}%`);
    console.log(`🎯 Max Cap: ${bronzeNodePackage.cap}x (${bronzeNodePackage.amount * bronzeNodePackage.cap} USDT)\n`);

    // Calculate expiry date (60 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    // Generate vouchers
    const result = await createVouchersInBulk({
      value: bronzeNodePackage.amount, // $100
      currency: "USDT",
      type: "package",
      title: "$100 Stakable Voucher - Bronze Node",
      badge: "Staking Voucher",
      badgeColor: "purple",
      description: `Stakable voucher for ${bronzeNodePackage.name}. Earn daily ROI for 14 days with independent max cap.`,
      linkText: "Stake Now",
      linkHref: "/stake",
      packageId: bronzeNodePackage.id,
      packageName: bronzeNodePackage.name,
      expiresAt: expiresAt,
      quantity: 5,
      roiValidityDays: 14, // 14 days ROI
      affectsMaxCap: true, // Has independent max cap
      requiresRealPackage: false, // Can be used without real package
      // userId is not provided, so vouchers will be unassigned (can be redeemed by code)
    });

    console.log("✅ Successfully generated vouchers!\n");
    console.log("📋 Voucher Details:");
    console.log("=".repeat(60));
    console.log(`Total Created: ${result.count}`);
    console.log(`Type: Stakable Package Voucher`);
    console.log(`Value: $${bronzeNodePackage.amount} USDT`);
    console.log(`ROI Validity: 14 days`);
    console.log(`Max Cap: Independent (${bronzeNodePackage.amount * bronzeNodePackage.cap} USDT)`);
    console.log(`Expiry Date: ${expiresAt.toLocaleDateString()}\n`);

    console.log("🎫 Voucher Codes:");
    console.log("-".repeat(60));
    result.vouchers.forEach((voucher, index) => {
      console.log(`${index + 1}. ${voucher.code}`);
    });
    console.log("-".repeat(60));

    console.log("\n📝 Notes:");
    console.log("- These vouchers are unassigned (userId = null)");
    console.log("- They can be redeemed by anyone at /voucher/add-code");
    console.log("- Each voucher provides 14 days of daily ROI");
    console.log("- Max cap is independent (affectsMaxCap = true)");
    console.log("- Max cap = $100 × 1.8 = $180 USDT");
    console.log("- Daily ROI = $100 × 1.0% = $1.00/day");
    console.log("- Vouchers expire in 60 days from today");
    console.log("- Voucher earnings do NOT generate team earnings for sponsors");

    console.log("\n✅ Generation complete!");

  } catch (error) {
    console.error("❌ Error generating vouchers:", error);
    throw error;
  }
}

// Run the script
generate100UsdtVouchers()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });

