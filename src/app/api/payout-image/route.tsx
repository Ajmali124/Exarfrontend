import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { PayoutCardOg } from "@/lib/notifications/payout-og";

export const runtime = "nodejs";

type Body = {
  name: string;
  amount: number;
  currency: string;
  withdrawalId: string;
  profileImage: string;
};

/**
 * Dedicated Route Handler for payout OG image.
 * ImageResponse must run here only — not inside other API routes — so the
 * compiled @vercel/og module is loaded in this function’s bundle on Vercel.
 * Other routes (e.g. IPN) should fetch this URL to get the image bytes.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as Body;
  const { name, amount, currency, withdrawalId, profileImage } = body;
  const origin =
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : new URL(request.url).origin;
  const logoUrl = `${origin}/logodark.svg`;

  return new ImageResponse(
    PayoutCardOg({
      name,
      amount,
      currency,
      withdrawalId,
      profileImage,
      logoUrl,
    }),
    { width: 600, height: 1067 }
  );
}
