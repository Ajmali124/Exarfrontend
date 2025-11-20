import { protectedProcedure } from "../../init";
import prisma from "@/lib/prismadb";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getPackageReward, isPromotionActive, getPromotionDates, PROMOTION_REWARDS } from "@/lib/promotion/rewards";
import { createVouchersInBulk } from "@/lib/voucher/generate";
import { STAKING_PACKAGES } from "@/lib/staking-packages";

/**
 * Promotion-related tRPC procedures
 * Handles pre-launch promotion registration and reward tracking
 */
export const promotionRouter = {
  // Register user for pre-launch promotion
  registerForPromotion: protectedProcedure
    .input(
      z
        .object({
          promotionType: z.string().default("prelaunch"),
        })
        .optional()
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if already registered
        const existing = await prisma.promotionRegistration.findUnique({
          where: { userId: ctx.auth.user.id },
        });

        if (existing) {
          return {
            success: true,
            alreadyRegistered: true,
            message: "You are already registered for this promotion",
          };
        }

        // Create registration
        const registration = await prisma.promotionRegistration.create({
          data: {
            userId: ctx.auth.user.id,
            promotionType: input?.promotionType || "prelaunch",
          },
        });

        return {
          success: true,
          registration,
          message: "Successfully registered for pre-launch promotion",
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to register for promotion",
        });
      }
    }),

  // Check if user is registered for promotion
  checkPromotionStatus: protectedProcedure
    .input(
      z
        .object({
          promotionType: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        const registration = await prisma.promotionRegistration.findUnique({
          where: { userId: ctx.auth.user.id },
        });

        const isRegistered = !!registration;
        const isActive = registration ? isPromotionActive(registration.registeredAt) : true;
        const { start, end } = getPromotionDates(registration?.registeredAt);

        return {
          isRegistered,
          isActive,
          registration,
          promotionStart: start,
          promotionEnd: end,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check promotion status",
        });
      }
    }),

  // Get user's promotion rewards summary
  getPromotionRewards: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Check if registered
      const registration = await prisma.promotionRegistration.findUnique({
        where: { userId: ctx.auth.user.id },
      });

      if (!registration) {
        return {
          isRegistered: false,
          packageRewards: [],
          teamRewards: [],
          totalRewards: 0,
        };
      }

      // Get all vouchers earned during promotion
      const promotionVouchers = await prisma.voucher.findMany({
        where: {
          userId: ctx.auth.user.id,
          createdAt: {
            gte: registration.registeredAt,
          },
          // Add description or title pattern to identify promotion vouchers
        },
        orderBy: { createdAt: "desc" },
      });

      // Get team statistics
      const invitedMembers = await prisma.invitedMember.findMany({
        where: { sponsorId: ctx.auth.user.id },
        include: {
          invitee: {
            include: {
              stakingEntries: {
                where: { status: "active" },
                select: { packageId: true, createdAt: true },
              },
            },
          },
        },
      });

      // Count activated members
      const activatedMembers = invitedMembers.filter((member) => {
        const hasStake = member.invitee.stakingEntries.some(
          (entry) => entry.createdAt >= registration.registeredAt
        );
        return hasStake;
      });

      const trialNodeActivations = activatedMembers.filter((member) => {
        return member.invitee.stakingEntries.some(
          (entry) => entry.packageId === 0 && entry.createdAt >= registration.registeredAt
        );
      });

      const silverPlusActivations = activatedMembers.filter((member) => {
        return member.invitee.stakingEntries.some(
          (entry) => entry.packageId >= 2 && entry.createdAt >= registration.registeredAt
        );
      });

      return {
        isRegistered: true,
        packageRewards: promotionVouchers.filter((v) => v.type === "package"),
        teamRewards: promotionVouchers.filter((v) => v.type === "withdraw"),
        totalRewards: promotionVouchers.reduce((sum, v) => sum + v.value, 0),
        teamStats: {
          totalInvites: invitedMembers.length,
          activatedCount: activatedMembers.length,
          trialNodeCount: trialNodeActivations.length,
          silverPlusCount: silverPlusActivations.length,
        },
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get promotion rewards",
      });
    }
  }),
};

/**
 * Helper function to grant promotion voucher
 * Called automatically when conditions are met
 */
export async function grantPromotionVoucher(
  userId: string,
  rewardConfig: {
    value: number;
    roiDays?: number;
    affectsMaxCap?: boolean;
    type: "package" | "withdraw";
    title: string;
    description?: string;
    badge?: string;
    badgeColor?: "orange" | "blue" | "green" | "purple";
  }
) {
  try {
    // Check if user is registered for promotion
    const registration = await prisma.promotionRegistration.findUnique({
      where: { userId },
    });

    if (!registration) {
      return { granted: false, reason: "User not registered for promotion" };
    }

    // Check if promotion is still active
    if (!isPromotionActive(registration.registeredAt)) {
      return { granted: false, reason: "Promotion is no longer active" };
    }

    // Check if this exact reward has already been granted (prevent duplicates)
    const existingReward = await prisma.voucher.findFirst({
      where: {
        userId,
        type: rewardConfig.type,
        value: rewardConfig.value,
        description: { contains: rewardConfig.description || "" },
        createdAt: { gte: registration.registeredAt },
      },
    });

    if (existingReward) {
      return { granted: false, reason: "Reward already granted" };
    }

    // Calculate expiry (14 days after voucher creation - matches promotion duration)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    // Create voucher
    const result = await createVouchersInBulk({
      value: rewardConfig.value,
      currency: "USDT",
      type: rewardConfig.type,
      title: rewardConfig.title,
      badge: rewardConfig.badge || "Promotion Reward",
      badgeColor: rewardConfig.badgeColor || "purple",
      description: rewardConfig.description || "",
      expiresAt,
      quantity: 1,
      userId,
      roiValidityDays: rewardConfig.roiDays,
      affectsMaxCap: rewardConfig.affectsMaxCap || false,
    });

    return {
      granted: true,
      voucher: result.vouchers[0],
    };
  } catch (error: any) {
    console.error("Error granting promotion voucher:", error);
    return { granted: false, reason: error.message || "Failed to grant voucher" };
  }
}

/**
 * Check and grant team rewards when invited member activates a package
 * Called automatically from createStake mutation
 */
export async function checkAndGrantTeamRewards(sponsorId: string, activatedUserId: string) {
  try {
    // Check if sponsor is registered for promotion
    const registration = await prisma.promotionRegistration.findUnique({
      where: { userId: sponsorId },
    });

    if (!registration) {
      return { granted: false, reason: "Sponsor not registered for promotion" };
    }

    // Get all invited members
    const invitedMembers = await prisma.invitedMember.findMany({
      where: { sponsorId },
      select: {
        userId: true,
        createdAt: true,
      },
    });

    // For each invited member, check if they have activated any package after sponsor's registration
    const invitedUserIds = invitedMembers.map((m) => m.userId);
    
    // Get all stakes created by invited members after sponsor's registration
    const activatedStakes = await prisma.stakingEntry.findMany({
      where: {
        userId: { in: invitedUserIds },
        status: "active",
        createdAt: { gte: registration.registeredAt },
      },
      select: {
        userId: true,
        packageId: true,
        createdAt: true,
      },
    });

    // Count unique activated members (users who have activated at least one package)
    const uniqueActivatedUserIds = new Set(activatedStakes.map((stake) => stake.userId));
    const activatedCount = uniqueActivatedUserIds.size;

    // Count Trial Node activations (unique users)
    const trialNodeUserIds = new Set(
      activatedStakes.filter((stake) => stake.packageId === 0).map((stake) => stake.userId)
    );
    const trialCount = trialNodeUserIds.size;

    // Count Silver Node or higher activations (unique users)
    const silverPlusUserIds = new Set(
      activatedStakes.filter((stake) => stake.packageId >= 2).map((stake) => stake.userId)
    );
    const silverPlusCount = silverPlusUserIds.size;

    // Check if sponsor has already received rewards for each milestone
    const existingVouchers = await prisma.voucher.findMany({
      where: {
        userId: sponsorId,
        createdAt: { gte: registration.registeredAt },
        description: { contains: "Pre-Launch Promotion" },
      },
      select: { description: true },
    });

    const grantedRewards: string[] = [];

    // Check 3 members milestone
    if (activatedCount >= 3 && !existingVouchers.some((v) => v.description?.includes("3 Members"))) {
      const reward = PROMOTION_REWARDS.team.invite3AllActivated;
      const result = await grantPromotionVoucher(sponsorId, {
        value: reward.value,
        roiDays: reward.roiDays,
        affectsMaxCap: reward.affectsMaxCap,
        type: reward.type,
        title: "$15 Team Building Reward",
        description: "Pre-Launch Promotion: 3 Members Activated",
        badge: "Team Reward",
        badgeColor: "blue",
      });

      if (result.granted) {
        grantedRewards.push("3-members");
      }
    }

    // Check 5 members with Trial Node milestone
    if (
      trialCount >= 5 &&
      !existingVouchers.some((v) => v.description?.includes("5 Trial Nodes"))
    ) {
      const reward = PROMOTION_REWARDS.team.invite5AllTrial;
      const result = await grantPromotionVoucher(sponsorId, {
        value: reward.value!,
        type: reward.type!,
        title: "$5 Withdrawal Reward",
        description: "Pre-Launch Promotion: 5 Members Activated Trial Node",
        badge: "Withdrawal Reward",
        badgeColor: "green",
      });

      if (result.granted) {
        grantedRewards.push("5-trial-nodes");
      }
    }

    // Check 10 members milestone
    if (activatedCount >= 10 && !existingVouchers.some((v) => v.description?.includes("10 Members"))) {
      const reward = PROMOTION_REWARDS.team.invite10AllActivated;
      
      // Grant withdraw voucher
      if (reward.withdraw) {
        await grantPromotionVoucher(sponsorId, {
          value: reward.withdraw.value,
          type: reward.withdraw.type,
          title: "$25 Withdrawal Reward",
          description: "Pre-Launch Promotion: 10 Members Activated",
          badge: "Withdrawal Reward",
          badgeColor: "green",
        });
      }

      // Grant stakable voucher
      if (reward.stakable) {
        await grantPromotionVoucher(sponsorId, {
          value: reward.stakable.value,
          roiDays: reward.stakable.roiDays,
          affectsMaxCap: reward.stakable.affectsMaxCap,
          type: reward.stakable.type,
          title: "$20 Staking Reward",
          description: "Pre-Launch Promotion: 10 Members Activated (Stakable)",
          badge: "Staking Reward",
          badgeColor: "purple",
        });
      }

      grantedRewards.push("10-members");
    }

    // Check 10 members with Silver Node focus
    if (
      activatedCount >= 10 &&
      silverPlusCount >= 5 &&
      !existingVouchers.some((v) => v.description?.includes("10 Members Silver"))
    ) {
      const reward = PROMOTION_REWARDS.team.invite10SilverFocus;

      // Grant withdraw voucher
      if (reward.withdraw) {
        await grantPromotionVoucher(sponsorId, {
          value: reward.withdraw.value,
          type: reward.withdraw.type,
          title: "$50 Withdrawal Reward",
          description: "Pre-Launch Promotion: 10 Members Activated (5+ Silver Node)",
          badge: "Premium Reward",
          badgeColor: "green",
        });
      }

      // Grant stakable voucher
      if (reward.stakable) {
        await grantPromotionVoucher(sponsorId, {
          value: reward.stakable.value,
          roiDays: reward.stakable.roiDays,
          affectsMaxCap: reward.stakable.affectsMaxCap,
          type: reward.stakable.type,
          title: "$30 Staking Reward",
          description: "Pre-Launch Promotion: 10 Members Activated (5+ Silver Node - Stakable)",
          badge: "Premium Staking",
          badgeColor: "purple",
        });
      }

      grantedRewards.push("10-members-silver");
    }

    return {
      granted: grantedRewards.length > 0,
      rewards: grantedRewards,
    };
  } catch (error: any) {
    console.error("Error checking team rewards:", error);
    return { granted: false, reason: error.message || "Failed to check team rewards" };
  }
}

/**
 * Check and grant package purchase reward
 * Called automatically from createStake mutation
 */
export async function checkAndGrantPackageReward(userId: string, packageId: number) {
  try {
    const reward = getPackageReward(packageId);

    if (!reward) {
      return { granted: false, reason: "No reward for this package" };
    }

    const packageInfo = STAKING_PACKAGES.find((p) => p.id === packageId);
    if (!packageInfo) {
      return { granted: false, reason: "Package not found" };
    }

    const result = await grantPromotionVoucher(userId, {
      value: reward.value,
      roiDays: reward.roiDays,
      affectsMaxCap: reward.affectsMaxCap,
      type: reward.type,
      title: `$${reward.value} ${packageInfo.name} Purchase Reward`,
      description: `Pre-Launch Promotion: ${packageInfo.name} Package Purchase`,
      badge: "Package Reward",
      badgeColor: packageId === 2 ? "purple" : "blue", // Silver Node gets purple badge
    });

    return result;
  } catch (error: any) {
    console.error("Error checking package reward:", error);
    return { granted: false, reason: error.message || "Failed to check package reward" };
  }
}

