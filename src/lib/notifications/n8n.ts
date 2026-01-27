// Utility to send withdrawal completion notifications to Zapier

import { generatePayoutImage } from "./puppeteer";
import { uploadPayoutImageToCloudinary } from "./cloudinary";
import fs from "fs";
import axios from "axios";

const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL;

/**
 * Converts an image URL to base64 string
 */
async function imageUrlToBase64(url: string): Promise<string> {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data, "binary").toString("base64");
}

export interface NotifyZapierWithdrawalData {
  withdrawalId: string;
  amount: number;
  currency: string;
  status: string;
  userId: string;
  userName?: string | null;
  kycName?: string | null;
  profileImage?: string | null;
  country?: string | null;
  toAddress?: string | null;
  description?: string | null;
  transactionId?: string;
}

/**
 * Sends a withdrawal completion notification to Zapier webhook.
 * Generates a payout image, uploads it to Cloudinary, and includes the URL in the payload.
 */
export async function notifyZapierWithdrawal(
  data: NotifyZapierWithdrawalData
): Promise<void> {
  if (!ZAPIER_WEBHOOK_URL) return;

  let payoutImageBase64: string | null = null;

  try {
    // Generate payout image if we have the required data
    const displayName = data.kycName || data.userName || "User";
    const profileImage = data.profileImage || "";

    if (profileImage) {
      console.log(`[notifyZapierWithdrawal] Generating payout image for withdrawal ${data.withdrawalId}...`);
      const imagePath = await generatePayoutImage({
        name: displayName,
        amount: data.amount,
        currency: data.currency,
        withdrawalId: data.withdrawalId,
        profileImage: profileImage,
      });

      console.log(`[notifyZapierWithdrawal] Uploading payout image to Cloudinary...`);
      // Upload to Cloudinary
      const payoutImageUrl = await uploadPayoutImageToCloudinary(
        imagePath,
        data.userId
      );
      console.log(`[notifyZapierWithdrawal] Payout image uploaded: ${payoutImageUrl}`);

      // Convert to base64
      console.log(`[notifyZapierWithdrawal] Converting image to base64...`);
      payoutImageBase64 = await imageUrlToBase64(payoutImageUrl);
      console.log(`[notifyZapierWithdrawal] Image converted to base64 (length: ${payoutImageBase64.length})`);

      // Clean up local file
      try {
        fs.unlinkSync(imagePath);
      } catch (err) {
        console.warn("Failed to delete temporary payout image:", err);
      }
    } else {
      console.log(`[notifyZapierWithdrawal] No profile image provided, skipping payout image generation`);
    }
  } catch (error) {
    console.error("Failed to generate/upload payout image:", error);
    // Continue without payout image if generation/upload fails
  }

  const payload = {
    event: "withdrawal_completed",
    payoutImage: payoutImageBase64,
    withdrawal: {
      id: data.transactionId || data.withdrawalId,
      withdrawalId: data.withdrawalId,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      toAddress: data.toAddress,
      description: data.description,
    },
    user: {
      id: data.userId,
      name: data.userName ?? null,
      kycName: data.kycName ?? null,
      profileImage: data.profileImage ?? null,
      country: data.country ?? null,
    },
    timestamp: new Date().toISOString(),
  };

  await fetch(ZAPIER_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  });
}
