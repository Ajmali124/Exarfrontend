"use server";

import { caller } from "@/trpc/server";

interface DistributionTriggerOptions {
  userId?: string;
}

export async function triggerDailyRoiDistribution(
  options: DistributionTriggerOptions = {}
) {
  try {
    const result = await caller.user.distributeDailyEarnings(options);
    return result;
  } catch (error) {
    console.error("Failed to trigger daily ROI distribution", error);
    throw error;
  }
}

export async function triggerTeamEarningDistribution() {
  try {
    return await caller.user.distributeTeamEarnings();
  } catch (error) {
    console.error("Failed to trigger team earning distribution", error);
    throw error;
  }
}


