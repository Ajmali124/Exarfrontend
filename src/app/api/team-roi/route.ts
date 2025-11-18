import { NextResponse } from "next/server";
import { triggerTeamEarningDistribution } from "@/action/userData/distribute-daily-roi";

export async function GET() {
  try {
    const result = await triggerTeamEarningDistribution();
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to run team earning distribution",
      },
      { status: 500 }
    );
  }
}

