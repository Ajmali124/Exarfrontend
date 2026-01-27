import { NextRequest } from "next/server";
import { renderPayoutImage } from "@/lib/notifications/payout-image";

export const runtime = "nodejs";

type Body = {
  name: string;
  amount: number;
  currency: string;
  withdrawalId: string;
  profileImage: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Body;
  const { name, amount, currency, withdrawalId, profileImage } = body;
  const origin =
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : new URL(request.url).origin;
  const logoUrl = `${origin}/logodark.svg`;

  return renderPayoutImage({
    name,
    amount,
    currency,
    withdrawalId,
    profileImage,
    logoUrl,
  });
}
