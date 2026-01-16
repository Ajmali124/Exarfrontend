import { protectedProcedure } from "../../init";
import prisma from "@/lib/prismadb";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

/**
 * Team-related tRPC procedures
 * Handles team members, referrals, and team statistics
 */
export const teamRouter = {
  // Get up to N unique team member avatar images (prefers profile image, falls back to KYC selfie)
  // Used for the 3D "team sphere" UI.
  getTeamSphereImages: protectedProcedure
    .input(
      z
        .object({
          max: z.number().min(1).max(120).default(60),
          maxLevels: z.number().min(1).max(10).default(10),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const max = input?.max ?? 60;
      const maxLevels = input?.maxLevels ?? 10;

      // Collect a reasonably-sized set of team userIds (BFS over invite tree) to
      // account for users missing avatars.
      const seenUserIds = new Set<string>();
      const orderedUserIds: string[] = [];
      const pushUnique = (id: string) => {
        if (seenUserIds.has(id)) return;
        seenUserIds.add(id);
        orderedUserIds.push(id);
      };

      // Include sponsor (current user) first
      pushUnique(ctx.auth.user.id);

      let frontier: string[] = [ctx.auth.user.id];
      for (let level = 1; level <= maxLevels; level++) {
        if (frontier.length === 0) break;

        const invitees = await prisma.invitedMember.findMany({
          where: { sponsorId: { in: frontier } },
          select: { userId: true },
        });

        const next = invitees.map((i) => i.userId);
        next.forEach(pushUnique);
        frontier = next;

        // Pull more than max because many users may not have images
        if (orderedUserIds.length >= max * 3) break;
      }

      const users = await prisma.user.findMany({
        where: { id: { in: orderedUserIds } },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          kycSubmission: { select: { selfieImageUrl: true } },
        },
      });

      const order = new Map(orderedUserIds.map((id, idx) => [id, idx]));
      users.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

      const images: { id: string; src: string; alt: string }[] = [];
      const seenSrc = new Set<string>();

      for (const u of users) {
        const src = u.image || u.kycSubmission?.selfieImageUrl;
        if (!src) continue;
        if (seenSrc.has(src)) continue;
        seenSrc.add(src);

        const label = u.name || u.username || "Team member";
        images.push({
          id: u.id,
          src,
          alt: `${label} avatar`,
        });

        if (images.length >= max) break;
      }

      // If no one has an avatar yet, return a single local placeholder
      if (images.length === 0) {
        return {
          images: [{ id: "placeholder", src: "/user.png", alt: "User avatar" }],
        };
      }

      return { images };
    }),

  // Get team members by level (10 levels deep)
  getTeamMembers: protectedProcedure
    .input(
      z.object({
        level: z.number().min(1).max(10).default(1),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { level, page, limit } = input;
        const skip = (page - 1) * limit;

        // Recursive function to get team members at a specific level
        async function getMembersAtLevel(
          sponsorIds: string[],
          currentLevel: number,
          targetLevel: number
        ): Promise<string[]> {
          if (currentLevel === targetLevel) {
            return sponsorIds;
          }

          if (sponsorIds.length === 0) {
            return [];
          }

          // Get all invitees of the current level sponsors
          const invitees = await prisma.invitedMember.findMany({
            where: {
              sponsorId: { in: sponsorIds },
            },
            select: {
              userId: true,
            },
          });

          const nextLevelIds = invitees.map((inv) => inv.userId);

          return getMembersAtLevel(nextLevelIds, currentLevel + 1, targetLevel);
        }

        // Start from level 1 (direct invitees)
        const level1Members = await prisma.invitedMember.findMany({
          where: {
            sponsorId: ctx.auth.user.id,
          },
          select: {
            userId: true,
          },
        });

        const level1Ids = level1Members.map((m) => m.userId);

        // Get target level member IDs
        const targetLevelIds =
          level === 1
            ? level1Ids
            : await getMembersAtLevel(level1Ids, 1, level);

        // Get paginated user data with balance information
        const [members, total] = await Promise.all([
          prisma.invitedMember.findMany({
            where: {
              userId: { in: targetLevelIds },
              ...(level === 1 && { sponsorId: ctx.auth.user.id }),
            },
            skip,
            take: limit,
            include: {
              invitee: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  username: true,
                  image: true,
                  createdAt: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          }),
          prisma.invitedMember.count({
            where: {
              userId: { in: targetLevelIds },
              ...(level === 1 && { sponsorId: ctx.auth.user.id }),
            },
          }),
        ]);

        // Get balance data for members
        const userIds = members.map((m) => m.userId);
        const balances = await prisma.userBalance.findMany({
          where: {
            userId: { in: userIds },
          },
          select: {
            userId: true,
            balance: true,
            dailyEarning: true,
            teamEarning: true,
          },
        });

        const balanceMap = new Map(
          balances.map((b) => [b.userId, b])
        );

        // Format response
        const formattedMembers = members.map((member) => ({
          id: member.id,
          userId: member.userId,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          joinDate: member.createdAt,
          user: {
            id: member.invitee.id,
            name: member.invitee.name,
            email: member.invitee.email,
            username: member.invitee.username,
            image: member.invitee.image,
            createdAt: member.invitee.createdAt,
          },
          balance: balanceMap.get(member.userId)?.balance || 0,
          dailyEarning: balanceMap.get(member.userId)?.dailyEarning || 0,
          teamEarning: balanceMap.get(member.userId)?.teamEarning || 0,
        }));

        return {
          members: formattedMembers,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch team members",
        });
      }
    }),

  // Get team statistics (total members per level)
  getTeamStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get counts for each level (1-10)
      const stats = await Promise.all(
        Array.from({ length: 10 }, async (_, index) => {
          const level = index + 1;

          // Recursive function to count members at level
          async function countMembersAtLevel(
            sponsorIds: string[],
            currentLevel: number,
            targetLevel: number
          ): Promise<number> {
            if (currentLevel === targetLevel) {
              return sponsorIds.length;
            }

            if (sponsorIds.length === 0) {
              return 0;
            }

            const invitees = await prisma.invitedMember.findMany({
              where: {
                sponsorId: { in: sponsorIds },
              },
              select: {
                userId: true,
              },
            });

            const nextLevelIds = invitees.map((inv) => inv.userId);

            return countMembersAtLevel(
              nextLevelIds,
              currentLevel + 1,
              targetLevel
            );
          }

          // Start from level 1
          const level1Members = await prisma.invitedMember.findMany({
            where: {
              sponsorId: ctx.auth.user.id,
            },
            select: {
              userId: true,
            },
          });

          const level1Ids = level1Members.map((m) => m.userId);

          const count =
            level === 1
              ? level1Ids.length
              : await countMembersAtLevel(level1Ids, 1, level);

          return {
            level,
            count,
          };
        })
      );

      return stats;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch team statistics",
      });
    }
  }),
};

