import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const PKR_RATE = 294;

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

function PayoutCard({
  name,
  amount,
  currency,
  withdrawalId,
  profileImage,
  logoUrl,
}: {
  name: string;
  amount: number;
  currency: string;
  withdrawalId: string;
  profileImage: string;
  logoUrl: string;
}) {
  const pkr = Math.round(amount * PKR_RATE);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#ffffff",
        padding: "40px 36px 48px",
        fontFamily: "system-ui, sans-serif",
        position: "relative",
      }}
    >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #00ff9d 0%, #00d4aa 100%)",
          }}
        />
        <div style={{ display: "flex", marginBottom: 28, marginTop: 24 }}>
          <img
            src={logoUrl}
            alt="Logo"
            width={150}
            height={40}
            style={{ objectFit: "contain" }}
          />
        </div>
        <div style={{ display: "flex", marginBottom: 24 }}>
          <img
            src={profileImage}
            alt="Avatar"
            width={100}
            height={100}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid #00ff9d",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "linear-gradient(135deg, #00ff9d 0%, #00d4aa 100%)",
            color: "#000000",
            padding: "12px 24px",
            borderRadius: 50,
            marginBottom: 24,
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          <span>PAYOUT CONFIRMED</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 32,
          }}
        >
          {name}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            width: "100%",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              background: "#f8fafc",
              borderRadius: 16,
              borderLeft: "3px solid #00ff9d",
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              Amount
            </span>
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#00ff9d",
              }}
            >
              {amount} {currency}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              background: "#f8fafc",
              borderRadius: 16,
              borderLeft: "3px solid #00ff9d",
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              PKR Equivalent
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              {pkr} PKR
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 12,
            color: "#64748b",
            background: "#f1f5f9",
            padding: "8px 12px",
            borderRadius: 8,
            marginBottom: 36,
            fontFamily: "monospace",
          }}
        >
          Txn: {withdrawalId}
        </div>
        <div
          style={{
            display: "flex",
            paddingTop: 24,
            borderTop: "1px solid #e2e8f0",
            fontSize: 12,
            color: "#94a3b8",
            fontWeight: 500,
          }}
        >
          EXAR TRADING
        </div>
    </div>
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { name, amount, currency, withdrawalId, profileImage } =
      getDataFromSearchParams(searchParams);
    const origin = new URL(request.url).origin;
    const logoUrl = `${origin}/logodark.svg`;

    return new ImageResponse(
      PayoutCard({
        name,
        amount,
        currency,
        withdrawalId,
        profileImage,
        logoUrl,
      }),
      { width: 600, height: 1067 }
    );
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
    const origin = new URL(request.url).origin;
    const logoUrl = `${origin}/logodark.svg`;

    return new ImageResponse(
      PayoutCard({
        name,
        amount,
        currency,
        withdrawalId,
        profileImage,
        logoUrl,
      }),
      { width: 600, height: 1067 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(`payout-image POST failed: ${message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
