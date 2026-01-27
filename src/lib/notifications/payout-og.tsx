import { ImageResponse } from "@vercel/og";
import React from "react";

const PKR_RATE = 294;

export type PayoutOgData = {
  name: string;
  amount: number;
  currency: string;
  withdrawalId: string;
  profileImage: string;
  logoUrl: string;
};

/**
 * Generates payout card image using @vercel/og (no browser).
 * Use this on Vercel where Chromium/system libs are unavailable.
 */
export async function generatePayoutImageBuffer(
  data: PayoutOgData
): Promise<Buffer> {
  const pkr = Math.round(data.amount * PKR_RATE);

  const response = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          padding: 40,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 560,
            background: "#ffffff",
            borderRadius: 32,
            padding: "40px 36px 48px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
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
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
            }}
          />
          <div style={{ display: "flex", marginBottom: 28, marginTop: 8 }}>
            <img
              src={data.logoUrl}
              alt="Logo"
              width={150}
              height={40}
              style={{ objectFit: "contain" }}
            />
          </div>
          <div style={{ display: "flex", marginBottom: 24 }}>
            <img
              src={data.profileImage}
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
            <span>✅</span>
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
            {data.name}
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
                {data.amount} {data.currency}
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
            Txn: {data.withdrawalId}
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
      </div>
    ),
    {
      width: 600,
      height: 1067,
    }
  );

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
