import { getCloudinaryConfig } from "@/lib/cloudinary";
import fs from "fs";
import crypto from "crypto";
import path from "path";

/**
 * Uploads a payout image file to Cloudinary
 * @param filePath - Path to the local image file
 * @param userId - User ID for organizing files in Cloudinary
 * @returns The secure URL of the uploaded image
 */
export async function uploadPayoutImageToCloudinary(
  filePath: string,
  userId: string
): Promise<string> {
  const config = getCloudinaryConfig();
  if (!config) {
    throw new Error("Cloudinary configuration missing");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `payouts/${userId}`;
  const format = "png";
  const type = "upload";

  // Read the file
  const fileBuffer = fs.readFileSync(filePath);
  
  // Create signature - must include all parameters in alphabetical order
  // Parameters: folder, format, timestamp, type
  const stringToSign = `folder=${folder}&format=${format}&timestamp=${timestamp}&type=${type}${config.apiSecret}`;
  const signature = crypto.createHash("sha1").update(stringToSign).digest("hex");

  // Create form data
  const cloudinaryForm = new FormData();
  
  // Create a File object from the buffer
  const fileName = path.basename(filePath);
  const file = new File([fileBuffer], fileName, { type: "image/png" });
  
  cloudinaryForm.append("file", file);
  cloudinaryForm.append("folder", folder);
  cloudinaryForm.append("format", format);
  cloudinaryForm.append("type", type);
  cloudinaryForm.append("timestamp", String(timestamp));
  cloudinaryForm.append("api_key", config.apiKey);
  cloudinaryForm.append("signature", signature);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      method: "POST",
      body: cloudinaryForm,
    }
  );

  if (!uploadResponse.ok) {
    const errorPayload = await uploadResponse.json().catch(() => null);
    console.error("Cloudinary upload failed", errorPayload);
    throw new Error("Failed to upload image to Cloudinary");
  }

  const uploadJson = (await uploadResponse.json()) as {
    secure_url?: string;
    public_id?: string;
    version?: number;
    format?: string;
  };

  if (!uploadJson.secure_url) {
    throw new Error("Invalid Cloudinary response");
  }

  // Transform the URL to force PNG format and ensure it's served as an image
  // Add transformations: f_png (force PNG), q_auto (auto quality), fl_force_strip (strip metadata)
  // Original: https://res.cloudinary.com/CLOUD/image/upload/v123/folder/file.png
  // Transformed: https://res.cloudinary.com/CLOUD/image/upload/f_png,q_auto,fl_force_strip/v123/folder/file.png
  const url = new URL(uploadJson.secure_url);
  
  // Replace the pathname to insert transformations after /upload/
  // Use comma-separated format for transformations: f_png,q_auto,fl_force_strip
  url.pathname = url.pathname.replace(
    /\/image\/upload\//,
    "/image/upload/f_png,q_auto,fl_force_strip/"
  );

  return url.toString();
}
