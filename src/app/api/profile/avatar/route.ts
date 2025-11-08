import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import { getCloudinaryConfig } from "@/lib/cloudinary";
import crypto from "crypto";

export const runtime = "nodejs";

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

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 5MB" },
        { status: 400 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", file);
    cloudinaryForm.append("folder", "profile-avatars");
    cloudinaryForm.append("timestamp", String(timestamp));
    cloudinaryForm.append("api_key", config.apiKey);

    const signature = createCloudinarySignature({
      folder: "profile-avatars",
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
      const errorPayload = await uploadResponse.json();
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

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        image: uploadJson.secure_url,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ url: uploadJson.secure_url });
  } catch (error) {
    console.error("Avatar upload failed", error);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
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

  const params = new URLSearchParams();
  params.append("folder", folder);
  params.append("timestamp", String(timestamp));

  const stringToSign = params.toString() + config.apiSecret;

  return crypto.createHash("sha1").update(stringToSign).digest("hex");
}

