import prisma from "@/lib/prismadb";
import { randomBytes } from "crypto";

/**
 * Generate a unique voucher code
 * Format: V-XXXX-XXXX (e.g., V-A3F2-9K7M)
 */
export function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excludes confusing chars like 0, O, I, 1
  const length = 4;
  
  let code = "V-";
  
  // Generate two segments of 4 characters each
  for (let segment = 0; segment < 2; segment++) {
    if (segment > 0) code += "-";
    
    for (let i = 0; i < length; i++) {
      const randomIndex = randomBytes(1)[0] % chars.length;
      code += chars[randomIndex];
    }
  }
  
  return code;
}

/**
 * Generate multiple unique voucher codes
 */
export async function generateUniqueVoucherCodes(count: number): Promise<string[]> {
  const codes: string[] = [];
  const maxAttempts = count * 10; // Allow 10 attempts per code
  let attempts = 0;

  while (codes.length < count && attempts < maxAttempts) {
    attempts++;
    const code = generateVoucherCode();

    // Check if code already exists in database
    const exists = await prisma.voucher.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!exists && !codes.includes(code)) {
      codes.push(code);
    }
  }

  if (codes.length < count) {
    throw new Error(
      `Failed to generate ${count} unique codes. Generated ${codes.length} codes after ${attempts} attempts.`
    );
  }

  return codes;
}

/**
 * Create multiple vouchers in bulk
 */
export interface CreateVoucherInput {
  value: number;
  currency?: string;
  type: "package" | "withdraw" | "futures" | "bonus" | "trading_fee";
  title: string;
  badge?: string;
  badgeColor?: "orange" | "blue" | "green" | "purple";
  description?: string;
  linkText?: string;
  linkHref?: string;
  packageId?: number;
  packageName?: string;
  expiresAt: Date;
  quantity: number;
  userId?: string; // Optional - if not provided, vouchers are unassigned
  roiValidityDays?: number; // For package vouchers: number of days ROI is provided (3, 7, 14, 30)
  affectsMaxCap?: boolean; // If true: voucher has its own independent max cap. If false: no max cap (ROI flushed)
  requiresRealPackage?: boolean; // If true: voucher only works if user has purchased a real package (ROI flushed without real package)
}

export async function createVouchersInBulk(input: CreateVoucherInput) {
  const {
    value,
    currency = "USDT",
    type,
    title,
    badge,
    badgeColor = "orange",
    description,
    linkText,
    linkHref,
    packageId,
    packageName,
    expiresAt,
    quantity,
    userId = null,
    roiValidityDays,
    affectsMaxCap = false,
    requiresRealPackage = false,
  } = input;

  // Generate unique codes
  const codes = await generateUniqueVoucherCodes(quantity);

  // Create vouchers in a transaction
  const vouchers = await prisma.$transaction(
    codes.map((code) =>
      prisma.voucher.create({
        data: {
          code,
          userId: userId || null,
          value,
          currency,
          type,
          title,
          badge,
          badgeColor,
          description,
          linkText,
          linkHref,
          packageId,
          packageName,
          expiresAt,
          roiValidityDays: roiValidityDays || null,
          affectsMaxCap,
          requiresRealPackage,
          status: "active",
        },
      })
    )
  );

  return {
    success: true,
    count: vouchers.length,
    vouchers: vouchers.map((v) => ({
      id: v.id,
      code: v.code,
      value: v.value,
      status: v.status,
      expiresAt: v.expiresAt,
      roiValidityDays: v.roiValidityDays,
      affectsMaxCap: v.affectsMaxCap,
    })),
  };
}

