import { config } from "dotenv";
import { resolve } from "path";
import fs from "fs";

// Load environment variables from .env file
config({ path: resolve(process.cwd(), ".env") });

import { generatePayoutImage } from "../src/lib/notifications/puppeteer";
import { uploadPayoutImageToCloudinary } from "../src/lib/notifications/cloudinary";
import axios from "axios";

/**
 * Converts an image URL to base64 string
 */
async function imageUrlToBase64(url: string): Promise<string> {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data, "binary").toString("base64");
}

/**
 * Generates a curl command with base64 image for testing Zapier webhook
 */
async function generateCurlCommand() {
  const userId = "YndMUgFOo2t7ymT5OoVMmw7SLBI5DLZP";
  const kycName = "Muhamamd Ajmal";
  const profileImage =
    "https://res.cloudinary.com/dbdskytz5/image/upload/v1768599134/kyc/YndMUgFOo2t7ymT5OoVMmw7SLBI5DLZP/nsrn6ckjzlc9vi4nlzrd.jpg";
  const withdrawalId = `test-${Date.now()}`;
  const amount = 120;
  const currency = "USDT";
  const zapierUrl = process.env.ZAPIER_WEBHOOK_URL || "https://hooks.zapier.com/hooks/catch/18864728/uwicgwq/";

  console.log("🔄 Generating payout image and base64...\n");

  try {
    // Generate payout image
    const imagePath = await generatePayoutImage({
      name: kycName,
      amount: amount,
      currency: currency,
      withdrawalId: withdrawalId,
      profileImage: profileImage,
    });

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadPayoutImageToCloudinary(imagePath, userId);

    // Convert to base64
    const base64Image = await imageUrlToBase64(cloudinaryUrl);

    // Clean up local file
    try {
      fs.unlinkSync(imagePath);
    } catch (err) {
      // Ignore cleanup errors
    }

    // Create payload JSON
    const payload = {
      event: "withdrawal_completed",
      payoutImage: base64Image,
      withdrawal: {
        id: `txn-${withdrawalId}`,
        withdrawalId: withdrawalId,
        amount: amount,
        currency: currency,
        status: "completed",
        toAddress: "0x1234567890123456789012345678901234567890",
        description: "Test withdrawal",
      },
      user: {
        id: userId,
        name: "Test User",
        kycName: kycName,
        profileImage: profileImage,
        country: "Pakistan",
      },
      timestamp: new Date().toISOString(),
    };

    // Save payload to file for curl
    const payloadFile = `/tmp/zapier-payload-${withdrawalId}.json`;
    fs.writeFileSync(payloadFile, JSON.stringify(payload, null, 2));

    // Generate curl command
    const curlCommand = `curl -X POST ${zapierUrl} \\
  -H "Content-Type: application/json" \\
  -d @${payloadFile}`;

    console.log("✅ Generated curl command!\n");
    console.log("📋 Curl command:");
    console.log(curlCommand);
    console.log(`\n📄 Payload file: ${payloadFile}`);
    console.log(`\n💡 Run the curl command above to test your Zapier webhook!`);
    console.log(`   The payload includes the full base64 image (${base64Image.length} characters).`);

  } catch (error) {
    console.error("❌ Error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    process.exit(1);
  }
}

generateCurlCommand();
