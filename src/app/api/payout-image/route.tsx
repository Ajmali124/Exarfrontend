import { NextRequest } from "next/server";

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
  try {
    const { searchParams } = new URL(request.url);
    const { name, amount, currency, withdrawalId, profileImage } =
      getDataFromSearchParams(searchParams);
    const origin =
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : new URL(request.url).origin;
    const logoUrl = `${origin}/logodark.svg`;
    const { renderPayoutImage } = await import("@/lib/notifications/payout-image");

    return renderPayoutImage({
      name,
      amount,
      currency,
      withdrawalId,
      profileImage,
      logoUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(`payout-image GET failed: ${message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body;
    const { name, amount, currency, withdrawalId, profileImage } = body;
    const origin =
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : new URL(request.url).origin;
    const logoUrl = `${origin}/logodark.svg`;
    const { renderPayoutImage } = await import("@/lib/notifications/payout-image");

    return renderPayoutImage({
      name,
      amount,
      currency,
      withdrawalId,
      profileImage,
      logoUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(`payout-image POST failed: ${message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
