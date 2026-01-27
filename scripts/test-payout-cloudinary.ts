import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env file
config({ path: resolve(process.cwd(), ".env") });

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
 * Test script to verify payout image generation and Cloudinary upload
 * 
 * Usage: npx tsx scripts/test-payout-cloudinary.ts
 */
async function testPayoutCloudinary() {
  console.log("🧪 Testing payout image generation and Cloudinary upload...\n");

  const userId = "YndMUgFOo2t7ymT5OoVMmw7SLBI5DLZP";
  const kycName = "Muhamamd Ajmal";
  const profileImage =
    "https://res.cloudinary.com/dbdskytz5/image/upload/v1768599134/kyc/YndMUgFOo2t7ymT5OoVMmw7SLBI5DLZP/nsrn6ckjzlc9vi4nlzrd.jpg";
  const withdrawalId = `test-${Date.now()}`;
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
    console.log("🖼️  Step 1: Generating payout image with Puppeteer...");
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
    
    // Generate curl command
    const zapierUrl = process.env.ZAPIER_WEBHOOK_URL || "https://hooks.zapier.com/hooks/catch/18864728/uwicgwq/";
    const curlCommand = `curl -X POST ${zapierUrl} \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "withdrawal_completed",
    "payoutImage": "${base64Image.substring(0, 100)}...",
    "withdrawal": {
      "id": "txn-test-123",
      "withdrawalId": "${withdrawalId}",
      "amount": ${amount},
      "currency": "${currency}",
      "status": "completed",
      "toAddress": "0x1234567890123456789012345678901234567890",
      "description": "Test withdrawal"
    },
    "user": {
      "id": "${userId}",
      "name": "Test User",
      "kycName": "${kycName}",
      "profileImage": "${profileImage}",
      "country": "Pakistan"
    },
    "timestamp": "${new Date().toISOString()}"
}'`;
    
    console.log(`\n💡 Curl command (with base64 image):`);
    console.log(`\n${curlCommand}`);
    
    // Also save base64 to a file for easier testing
    const base64FilePath = `/tmp/payout-base64-${withdrawalId}.txt`;
    fs.writeFileSync(base64FilePath, base64Image);
    console.log(`\n📄 Base64 saved to: ${base64FilePath}`);
    console.log(`   You can use this file to construct your curl command with the full base64 string.`);
  } catch (error) {
    console.error("\n❌ Test failed!");
    console.error("Error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    process.exit(1);
  }
}

testPayoutCloudinary();
