/**
 * Pre-Launch Promotion Reward Configuration
 * Defines all rewards for package purchases and team building milestones
 */

export interface PackageReward {
  value: number;
  roiDays: number;
  affectsMaxCap: boolean;
  type: "package";
}

export interface TeamRewardConfig {
  value?: number;
  withdraw?: { value: number; type: "withdraw" };
  stakable?: { value: number; roiDays: number; affectsMaxCap: boolean; type: "package" };
  type?: "withdraw" | "package";
  roiDays?: number;
  affectsMaxCap?: boolean;
  requiresPackage?: number; // Package ID if specific package required
  requiresAll?: boolean; // All members must activate (true) or minimum count
  minSilverCount?: number; // Minimum count of Silver Node or higher activations
}

export const PROMOTION_REWARDS = {
  // Package purchase rewards
  packages: {
    0: { value: 10, roiDays: 14, affectsMaxCap: false, type: "package" as const }, // Trial Node
    1: { value: 15, roiDays: 30, affectsMaxCap: true, type: "package" as const }, // Bronze Node
    2: { value: 30, roiDays: 30, affectsMaxCap: true, type: "package" as const }, // Silver Node (FOCUS)
    3: { value: 50, roiDays: 30, affectsMaxCap: true, type: "package" as const }, // Gold Node
    4: { value: 100, roiDays: 30, affectsMaxCap: true, type: "package" as const }, // Platinum Node
    5: { value: 150, roiDays: 30, affectsMaxCap: true, type: "package" as const }, // Diamond Node
    6: { value: 200, roiDays: 30, affectsMaxCap: true, type: "package" as const }, // Titan Node
    7: { value: 250, roiDays: 30, affectsMaxCap: true, type: "package" as const }, // Crown Node
    8: { value: 300, roiDays: 30, affectsMaxCap: true, type: "package" as const }, // Elysium Vault
  },

  // Team building rewards (only granted when invited members activate packages)
  team: {
    // 3 members with ANY package activation
    invite3AllActivated: {
      value: 15,
      roiDays: 30,
      affectsMaxCap: false,
      type: "package" as const,
      requiresAll: true,
    },
    // 5 members with Trial Node activation
    invite5AllTrial: {
      value: 5,
      type: "withdraw" as const,
      requiresPackage: 0, // Trial Node
      requiresAll: true,
    },
    // 10 members with ANY package activation
    invite10AllActivated: {
      withdraw: { value: 25, type: "withdraw" as const },
      stakable: { value: 20, roiDays: 30, affectsMaxCap: true, type: "package" as const },
    },
    // 10 members with at least 5 activating Silver Node or higher
    invite10SilverFocus: {
      withdraw: { value: 50, type: "withdraw" as const },
      stakable: { value: 30, roiDays: 30, affectsMaxCap: true, type: "package" as const },
      minSilverCount: 5, // At least 5 must have Silver Node (packageId >= 2) or higher
    },
  },
} as const;

/**
 * Get package reward configuration
 */
export function getPackageReward(packageId: number): PackageReward | null {
  return PROMOTION_REWARDS.packages[packageId as keyof typeof PROMOTION_REWARDS.packages] || null;
}

/**
 * Get promotion start date (today for pre-launch promotion)
 * In production, this might be stored in database or config
 */
export function getPromotionStartDate(): Date {
  // For now, promotion starts when first user registers
  // In production, you might want to set a fixed start date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Check if promotion is currently active
 * Promotion runs for 14 days from start date
 */
export function isPromotionActive(registrationDate?: Date): boolean {
  // If we have a registration date, use it as reference
  // Otherwise check if we're within 14 days of today
  const now = new Date();
  
  if (registrationDate) {
    const daysSinceStart = Math.floor(
      (now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceStart >= 0 && daysSinceStart < 14;
  }
  
  // Default: promotion is always active for new registrations
  // You can set a hard end date here if needed
  return true;
}

/**
 * Get promotion start and end dates
 */
export function getPromotionDates(registrationDate?: Date) {
  const start = registrationDate || getPromotionStartDate();
  const end = new Date(start);
  end.setDate(end.getDate() + 14);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

