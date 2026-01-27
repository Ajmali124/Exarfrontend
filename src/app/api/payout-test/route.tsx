import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#00ff9d",
          fontSize: 48,
          fontWeight: 700,
        }}
      >
        PAYOUT TEST OK
      </div>
    ),
    { width: 600, height: 400 }
  );
}
