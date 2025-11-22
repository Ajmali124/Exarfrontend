/**
 * Generate 10 Expo Promotion Vouchers
 * 
 * These vouchers are:
 * - Stakable (package type)
 * - $10 value (Trial Node)
 * - 30 days ROI validity
 * - Independent max cap included (affectsMaxCap = true)
 * - Unassigned (can be redeemed by expo attendees)
 * - 60 days expiry (2 months to redeem)
 */

import { createVouchersInBulk } from "../src/lib/voucher/generate";
import { STAKING_PACKAGES } from "../src/lib/staking-packages";

async function generateExpoVouchers() {
  console.log("🎫 Generating 10 Expo Promotion Vouchers...\n");

  try {
    // Find Trial Node package (packageId: 0, value: $10)
    const trialNodePackage = STAKING_PACKAGES.find(pkg => pkg.id === 0);
    
    if (!trialNodePackage) {
      throw new Error("Trial Node package not found");
    }

    console.log(`📦 Package: ${trialNodePackage.name}`);
    console.log(`💰 Value: $${trialNodePackage.amount} USDT`);
    console.log(`📈 Daily ROI: ${trialNodePackage.roi}%`);
    console.log(`🎯 Max Cap: ${trialNodePackage.cap}x (${trialNodePackage.amount * trialNodePackage.cap} USDT)\n`);

    // Calculate expiry date (60 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    // Generate vouchers
    const result = await createVouchersInBulk({
      value: trialNodePackage.amount, // $10
      currency: "USDT",
      type: "package",
      title: "Expo Promotion - Trial Node Voucher",
      badge: "Expo Voucher",
      badgeColor: "green",
      description: `Stakable voucher for ${trialNodePackage.name}. Earn daily ROI for 30 days with independent max cap.`,
      linkText: "Stake Now",
      linkHref: "/stake",
      packageId: trialNodePackage.id,
      packageName: trialNodePackage.name,
      expiresAt: expiresAt,
      quantity: 10,
      roiValidityDays: 30, // 30 days ROI
      affectsMaxCap: true, // Has independent max cap
      requiresRealPackage: false, // Can be used without real package
    });

    console.log("✅ Successfully generated vouchers!\n");
    console.log("📋 Voucher Details:");
    console.log("=" .repeat(60));
    console.log(`Total Created: ${result.count}`);
    console.log(`Type: Stakable Package Voucher`);
    console.log(`Value: $${trialNodePackage.amount} USDT`);
    console.log(`ROI Validity: 30 days`);
    console.log(`Max Cap: Independent (${trialNodePackage.amount * trialNodePackage.cap} USDT)`);
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
    console.log("- Each voucher provides 30 days of daily ROI");
    console.log("- Max cap is independent (affectsMaxCap = true)");
    console.log("- Vouchers expire in 60 days from today");
    console.log("- Voucher earnings do NOT generate team earnings for sponsors");

    console.log("\n✅ Generation complete!");

  } catch (error) {
    console.error("❌ Error generating vouchers:", error);
    throw error;
  }
}

// Run the script
generateExpoVouchers()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });

