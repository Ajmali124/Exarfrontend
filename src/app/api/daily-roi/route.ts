import { NextResponse } from "next/server";
import { triggerDailyRoiDistribution } from "@/action/userData/distribute-daily-roi";

export async function GET(request: Request) {
  // Verify cron secret for authorization
  const authHeader = request.headers.get("Authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedAuth) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const result = await triggerDailyRoiDistribution();
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to run daily ROI distribution",
      },
      { status: 500 }
    );
  }
}

