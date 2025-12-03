/**
 * Subscription Packages Configuration
 * Defines the 9 subscription tiers with fixed deposit amounts, ROI, and cap multipliers
 */

export interface StakingPackage {
  id: number;
  name: string;
  amount: number; // Fixed deposit amount in USDT
  roi: number; // Daily ROI percentage (e.g., 0.8 = 0.8%)
  cap: number; // Maximum earning multiplier (e.g., 1.5 = 150% of principal)
  visible?: boolean; // Whether to show in UI (defaults to true). Set to false to hide while keeping for backward compatibility
}

export const STAKING_PACKAGES: StakingPackage[] = [
  { id: 0, name: "Trial Node", amount: 10, roi: 0.8, cap: 1.5 },
  { id: 1, name: "Bronze Node", amount: 100, roi: 1.0, cap: 1.8 },
  { id: 2, name: "Silver Node", amount: 250, roi: 1.1, cap: 2.0, visible: false }, // Hidden from UI, kept for backward compatibility
  { id: 3, name: "Gold Node", amount: 250, roi: 1.1, cap: 2.0 },
  { id: 4, name: "Platinum Node", amount: 500, roi: 1.2, cap: 2.3 },
  { id: 5, name: "Diamond Node", amount: 2000, roi: 1.4, cap: 3.0 },
  { id: 6, name: "Titan Node", amount: 5000, roi: 1.5, cap: 3.5 },
  { id: 7, name: "Crown Node", amount: 10000, roi: 1.6, cap: 4.0 },
  { id: 8, name: "Elysium Vault", amount: 25000, roi: 1.7, cap: 5.0 },
];

/**
 * Find the package that matches a given amount
 * @param amount - The subscription amount
 * @returns The matching package or null if no exact match found
 */
export function findPackageForAmount(amount: number): StakingPackage | null {
  return (
    STAKING_PACKAGES.find((pkg) => pkg.amount === amount) || null
  );
}

/**
 * Calculate daily earnings for a stake
 * @param amount - Staking amount
 * @param roi - Daily ROI percentage
 * @returns Daily earning amount
 */
export function calculateDailyEarning(amount: number, roi: number): number {
  return (amount * roi) / 100;
}

/**
 * Calculate maximum earning for a stake
 * @param amount - Staking amount
 * @param cap - Cap multiplier
 * @returns Maximum earning amount
 */
export function calculateMaxEarning(amount: number, cap: number): number {
  return amount * cap;
}

/**
 * Check if a stake has reached its cap
 * @param totalEarned - Total earned so far
 * @param maxEarning - Maximum earning limit
 * @returns True if cap is reached
 */
export function isCapReached(totalEarned: number, maxEarning: number): boolean {
  return totalEarned >= maxEarning;
}

