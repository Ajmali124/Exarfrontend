import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env file
config({ path: resolve(process.cwd(), ".env") });

// VERCEL=1 makes the same code path run as on Vercel: @vercel/og (no browser).
process.env.VERCEL = "1";

import { generatePayoutImage } from "../src/lib/notifications/puppeteer";
import { uploadPayoutImageToCloudinary } from "../src/lib/notifications/cloudinary";
import fs from "fs";
import axios from "axios";

/**
 * Converts an image URL to base64 string
 */
async function imageUrlToBase64(url: string): Promise<string> {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data, "binary").toString("base64");
}

/**
 * Test script that simulates Vercel environment locally
 * This helps ensure the code will work on Vercel before deploying
 * 
 * Usage: npx tsx scripts/test-payout-vercel-local.ts
 */
async function testPayoutVercelLocal() {
  console.log("🧪 Testing payout image generation in Vercel-simulated environment...\n");
  console.log("📌 Environment: VERCEL=1 (simulated)\n");

  const userId = "YndMUgFOo2t7ymT5OoVMmw7SLBI5DLZP";
  const kycName = "Muhamamd Ajmal";
  const profileImage =
    "https://res.cloudinary.com/dbdskytz5/image/upload/v1768599134/kyc/YndMUgFOo2t7ymT5OoVMmw7SLBI5DLZP/nsrn6ckjzlc9vi4nlzrd.jpg";
  const withdrawalId = `test-vercel-${Date.now()}`;
  const amount = 120;
  const currency = "USDT";

  try {
    console.log("📋 Test Parameters:");
    console.log(`  User ID: ${userId}`);
    console.log(`  KYC Name: ${kycName}`);
    console.log(`  Profile Image: ${profileImage}`);
    console.log(`  Withdrawal ID: ${withdrawalId}`);
    console.log(`  Amount: ${amount} ${currency}\n`);

    // Step 1: Generate payout image
    console.log("🖼️  Step 1: Generating payout image with Playwright (Vercel mode)...");
    const imagePath = await generatePayoutImage({
      name: kycName,
      amount: amount,
      currency: currency,
      withdrawalId: withdrawalId,
      profileImage: profileImage,
    });
    console.log(`✅ Image generated at: ${imagePath}\n`);

    // Step 2: Upload to Cloudinary
    console.log("☁️  Step 2: Uploading to Cloudinary...");
    const cloudinaryUrl = await uploadPayoutImageToCloudinary(imagePath, userId);
    console.log(`✅ Image uploaded successfully!\n`);

    // Step 3: Convert to base64
    console.log("🔄 Step 3: Converting image to base64...");
    const base64Image = await imageUrlToBase64(cloudinaryUrl);
    console.log(`✅ Image converted to base64 (length: ${base64Image.length})\n`);

    // Step 4: Display results
    console.log("📊 Results:");
    console.log(`  Local file: ${imagePath}`);
    console.log(`  Cloudinary URL: ${cloudinaryUrl}`);
    console.log(`  Base64 length: ${base64Image.length} characters\n`);

    // Step 5: Clean up
    console.log("🧹 Cleaning up local file...");
    try {
      fs.unlinkSync(imagePath);
      console.log(`✅ Local file deleted\n`);
    } catch (err) {
      console.warn(`⚠️  Failed to delete local file: ${err}\n`);
    }

    console.log("🎉 Test completed successfully!");
    console.log(`\n📎 Cloudinary URL: ${cloudinaryUrl}`);
    console.log(`\n✅ With VERCEL=1 we used @vercel/og (same as production). Deploy to Vercel to confirm.`);
  } catch (error) {
    console.error("\n❌ Test failed!");
    console.error("Error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    console.error("\n💡 Install Playwright's Chromium for local runs: npx playwright install chromium");
    process.exit(1);
  }
}

testPayoutVercelLocal();
