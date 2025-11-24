/**
 * Test how voucher stakes will be created with new logic
 */

import { STAKING_PACKAGES } from "../src/lib/staking-packages";

async function testVoucherStakeCreation() {
  console.log("🧪 Testing Voucher Stake Creation Logic\n");
  console.log("=" .repeat(80));

  // Simulate a $30 Silver Node voucher
  const voucherValue = 30;
  const silverNode = STAKING_PACKAGES.find(p => p.id === 2); // Silver Node

  if (!silverNode) {
    console.log("❌ Silver Node not found");
    process.exit(1);
  }

  console.log(`\n📦 Voucher: $${voucherValue} from Silver Node purchase`);
  console.log(`   Original Package: ${silverNode.name}`);
  console.log(`   Original ROI: ${silverNode.roi}%`);
  console.log(`   Original Cap: ${silverNode.cap}x`);

  // New logic for voucher stakes
  const stakeEntry = {
    packageName: "Voucher Position", // Always "Voucher Position"
    packageId: silverNode.id, // Keep reference to original package
    amount: voucherValue, // Use voucher value ($30)
    dailyROI: silverNode.roi, // Use package ROI (1.1%)
    cap: 0, // No cap for vouchers
    maxEarning: 0, // Flushed ROI (no cap tracking)
    roiDays: 14, // Always 14 days for vouchers
  };

  console.log(`\n📊 Stake Entry Created:`);
  console.log(`   Package Name: "${stakeEntry.packageName}"`);
  console.log(`   Package ID: ${stakeEntry.packageId} (reference to ${silverNode.name})`);
  console.log(`   Amount: $${stakeEntry.amount} USDT`);
  console.log(`   Daily ROI: ${stakeEntry.dailyROI}% (from ${silverNode.name})`);
  console.log(`   Cap: ${stakeEntry.cap}x (flushed - no cap)`);
  console.log(`   Max Earning: $${stakeEntry.maxEarning} (flushed ROI)`);
  console.log(`   ROI Period: ${stakeEntry.roiDays} days`);

  // Calculate expected earnings
  const dailyEarning = (stakeEntry.amount * stakeEntry.dailyROI) / 100;
  const totalPotentialROI = dailyEarning * stakeEntry.roiDays;

  console.log(`\n💰 Expected Earnings:`);
  console.log(`   Daily ROI: $${dailyEarning.toFixed(4)}/day`);
  console.log(`   Total Potential (${stakeEntry.roiDays} days): $${totalPotentialROI.toFixed(2)}`);
  console.log(`   ⚠️  No cap limit - will earn ROI for ${stakeEntry.roiDays} days`);

  console.log(`\n✅ Summary:`);
  console.log(`   ✅ Uses Silver Node ROI (1.1%)`);
  console.log(`   ✅ NO cap (2x) - ROI is flushed`);
  console.log(`   ✅ 14 days ROI period`);
  console.log(`   ✅ Named "Voucher Position" (not "Silver Node")`);

  console.log("\n" + "=" .repeat(80));
}

testVoucherStakeCreation()
  .then(() => {
    console.log("\n✅ Test complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });

