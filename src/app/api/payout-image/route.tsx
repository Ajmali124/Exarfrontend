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

function getDataFromSearchParams(searchParams: URLSearchParams): Body {
  return {
    name: searchParams.get("name") || "",
    amount: Number(searchParams.get("amount") || "0"),
    currency: searchParams.get("currency") || "",
    withdrawalId: searchParams.get("withdrawalId") || "",
    profileImage: searchParams.get("profileImage") || "",
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { name, amount, currency, withdrawalId, profileImage } =
    getDataFromSearchParams(searchParams);
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
