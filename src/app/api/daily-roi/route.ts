import { NextResponse } from "next/server";
import { triggerDailyRoiDistribution } from "@/action/userData/distribute-daily-roi";

export async function GET() {
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

