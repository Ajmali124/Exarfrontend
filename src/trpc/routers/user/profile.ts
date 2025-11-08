import { protectedProcedure } from "../../init";
import prisma from "@/lib/prismadb";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

/**
 * Profile-related tRPC procedures
 * Handles user profile data, basic info, and statistics
 */
export const profileRouter = {
  // Get current user's profile data
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: ctx.auth.user.id,
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user profile",
      });
    }
  }),

  // Get user's basic info (minimal data for components)
  getBasicInfo: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: ctx.auth.user.id,
        },
        // Cast to any until Prisma client is regenerated with new fields
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          image: true,
          nickname: true,
          gender: true,
          homepage: true,
          location: true,
          linkEmail: true,
          inviteCode: true,
        } as any,
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user basic info",
      });
    }
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z
        .object({
          name: z.string().trim().min(1).max(100).optional(),
        image: z.string().url().optional(),
          nickname: z.string().trim().min(1).max(50).optional().or(z.literal("")),
          gender: z
            .enum(["male", "female", "non_binary", "prefer_not_to_say", "unknown"])
            .optional(),
          homepage: z.string().url().optional().or(z.literal("")),
          location: z.string().trim().max(120).optional().or(z.literal("")),
          linkEmail: z.string().email().optional().or(z.literal("")),
        })
        .refine(
          (data) =>
            Object.values(data).some((value) => value !== undefined),
          {
            message: "No fields provided",
          }
        )
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updateData: Record<string, string | null | undefined> = {};

        if (input.name !== undefined) {
          updateData.name = input.name;
        }

        if (input.image !== undefined) {
          updateData.image = input.image;
        }

        if (input.nickname !== undefined) {
          updateData.nickname = input.nickname === "" ? null : input.nickname;
        }

        if (input.gender !== undefined) {
          updateData.gender = input.gender;
        }

        if (input.homepage !== undefined) {
          updateData.homepage =
            input.homepage === "" ? null : input.homepage;
        }

        if (input.location !== undefined) {
          updateData.location =
            input.location === "" ? null : input.location;
        }

        if (input.linkEmail !== undefined) {
          updateData.linkEmail =
            input.linkEmail === "" ? null : input.linkEmail;
        }

        const updatedUser = await prisma.user.update({
          where: {
            id: ctx.auth.user.id,
          },
          data: {
            ...updateData,
            updatedAt: new Date(),
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            nickname: true,
            gender: true,
            homepage: true,
            location: true,
            linkEmail: true,
            updatedAt: true,
          } as any,
        });

        return updatedUser;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user profile",
        });
      }
    }),

  // Get user statistics (for dashboard)
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: ctx.auth.user.id,
        },
        select: {
          id: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Calculate account age
      const accountAge = Math.floor(
        (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        accountAge,
        memberSince: user.createdAt,
        // Add more stats as needed for your crypto broker
        totalTrades: 0, // Placeholder
        totalVolume: 0, // Placeholder
        profitLoss: 0, // Placeholder
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user statistics",
      });
    }
  }),
};

