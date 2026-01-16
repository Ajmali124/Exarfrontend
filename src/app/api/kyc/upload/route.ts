import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCloudinaryConfig } from "@/lib/cloudinary";
import crypto from "crypto";

export const runtime = "nodejs";

const ALLOWED_KINDS = new Set(["selfie", "document_front", "document_back"]);

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = getCloudinaryConfig();
  if (!config) {
    return NextResponse.json(
      { error: "Cloudinary is not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind") ?? "selfie";
  if (!ALLOWED_KINDS.has(kind)) {
    return NextResponse.json(
      { error: "Invalid upload kind" },
      { status: 400 }
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // KYC docs can be slightly larger than avatars.
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `kyc/${session.user.id}`;

    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", file);
    cloudinaryForm.append("folder", folder);
    cloudinaryForm.append("timestamp", String(timestamp));
    cloudinaryForm.append("api_key", config.apiKey);

    const signature = createCloudinarySignature({
      folder,
      timestamp,
    });
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
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 502 }
      );
    }

    const uploadJson = (await uploadResponse.json()) as {
      secure_url?: string;
    };

    if (!uploadJson.secure_url) {
      return NextResponse.json(
        { error: "Invalid Cloudinary response" },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: uploadJson.secure_url, kind });
  } catch (error) {
    console.error("KYC upload failed", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

function createCloudinarySignature({
  folder,
  timestamp,
}: {
  folder: string;
  timestamp: number;
}) {
  const config = getCloudinaryConfig();
  if (!config) {
    throw new Error("Cloudinary configuration missing");
  }

  // IMPORTANT: Cloudinary signs the raw parameter string (do NOT URL-encode `/`).
  // Docs: signature = sha1("param1=value1&param2=value2" + api_secret)
  const stringToSign = `folder=${folder}&timestamp=${timestamp}${config.apiSecret}`;
  return crypto.createHash("sha1").update(stringToSign).digest("hex");
}

