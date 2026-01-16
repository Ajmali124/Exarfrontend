import { protectedProcedure } from "../../init";
import prisma from "@/lib/prismadb";
import { z } from "zod";

/**
 * Invite leaderboard:
 * Ranks sponsors by "activated invites" where activation = invitee has at least 1 stake.
 *
 * Data sources:
 * - `invited_member`: sponsorId -> userId (invitee)
 * - `staking_entry`: userId (invitee), createdAt, status, amount
 */

const leaderboardInputSchema = z
  .object({
    limit: z.number().int().min(5).max(100).default(50),
    // Activation threshold (Bronze Node minimum).
    // We count an invitee as "activated" if they have at least one stake with:
    // - packageId >= minPackageId AND amount >= minStake
    // Defaults match Bronze Node (packageId 1, amount 100).
    minStake: z.number().min(0).default(100),
    minPackageId: z.number().int().min(0).default(1),
  })
  .optional();

/**
 * Weekly reset:
 * - Starts every Sunday at 6:00 PM PKT (Asia/Karachi, UTC+5)
 * - Ends "now"
 *
 * We compute the window without external timezone libs by shifting to PKT, finding the
 * most recent Sunday 18:00 local, then shifting back to UTC.
 */
function resolveWeeklyWindowPkt(nowUtc: Date): { start: Date; end: Date } {
  const PKT_OFFSET_MINUTES = 5 * 60; // Pakistan time (UTC+5). No DST.
  const nowP = new Date(nowUtc.getTime() + PKT_OFFSET_MINUTES * 60 * 1000);

  // Treat shifted time as "local" by using UTC getters/setters on nowP.
  const day = nowP.getUTCDay(); // 0=Sun ... 6=Sat (in PKT-local)
  const candidate = new Date(nowP);
  candidate.setUTCHours(18, 0, 0, 0); // Sunday 18:00 PKT (as UTC on shifted clock)
  candidate.setUTCDate(candidate.getUTCDate() - ((day - 0 + 7) % 7));

  // If it's Sunday but before 18:00 PKT, we need the previous week's Sunday 18:00.
  if (nowP.getTime() < candidate.getTime()) {
    candidate.setUTCDate(candidate.getUTCDate() - 7);
  }

  const startUtc = new Date(candidate.getTime() - PKT_OFFSET_MINUTES * 60 * 1000);
  return { start: startUtc, end: nowUtc };
}

function resolvePeriodWindow(): {
  start: Date | null;
  end: Date;
} {
  const end = new Date();
  const { start } = resolveWeeklyWindowPkt(end);
  return { start, end };
}

export const rankRouter = {
  /**
   * Returns top ranked users + current user's rank.
   *
   * Ranking metric:
   * - activatedInvites: number of distinct invitees (per sponsor) who have >= 1 qualifying stake
   * Tie-breakers:
   * - earlier firstActivationAt wins
   * - then userId stable order
   */
  getInviteLeaderboard: protectedProcedure
    .input(leaderboardInputSchema)
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const minStake = input?.minStake ?? 100;
      const minPackageId = input?.minPackageId ?? 1;
      const { start, end } = resolvePeriodWindow();

      const startIso = start ? start.toISOString() : null;
      const endIso = end.toISOString();

      // 1) Fetch top sponsors by activated invites.
      // We compute activation per invitee (MIN stake.createdAt) and then count invitees per sponsor.
      const topRows = await prisma.$queryRaw<
        Array<{
          sponsorId: string;
          activatedInvites: bigint | number;
          firstActivationAt: Date | null;
          name: string | null;
          username: string | null;
          image: string | null;
          inviteCode: string | null;
        }>
      >`
        SELECT
          u.id AS sponsorId,
          COALESCE(scores.activatedInvites, 0) AS activatedInvites,
          scores.firstActivationAt AS firstActivationAt,
          u.name AS name,
          u.username AS username,
          u.image AS image,
          u.inviteCode AS inviteCode
        FROM user u
        INNER JOIN (
          SELECT
            ia.sponsorId AS sponsorId,
            COUNT(*) AS activatedInvites,
            MIN(ia.activatedAt) AS firstActivationAt
          FROM (
            SELECT
              im.sponsorId AS sponsorId,
              im.userId AS inviteeId,
              MIN(se.createdAt) AS activatedAt
            FROM invited_member im
            INNER JOIN staking_entry se
              ON se.userId = im.userId
            WHERE
              se.status <> 'cancelled'
              AND se.packageId >= ${minPackageId}
              AND se.amount >= ${minStake}
              AND (${startIso} IS NULL OR se.createdAt >= ${startIso})
              AND se.createdAt <= ${endIso}
            GROUP BY im.sponsorId, im.userId
          ) ia
          GROUP BY ia.sponsorId
        ) scores
          ON scores.sponsorId = u.id
        ORDER BY
          scores.activatedInvites DESC,
          scores.firstActivationAt ASC,
          u.id ASC
        LIMIT ${limit};
      `;

      const top = topRows.map((row, idx) => ({
        rank: idx + 1,
        userId: row.sponsorId,
        name: row.name,
        username: row.username,
        image: row.image,
        inviteCode: row.inviteCode,
        activatedInvites: Number(row.activatedInvites),
      }));

      // 2) Current user's rank (null if not ranked / 0 activations)
      const myId = ctx.auth.user.id;

      const myScoreRows = await prisma.$queryRaw<
        Array<{
          activatedInvites: bigint | number;
          firstActivationAt: Date | null;
        }>
      >`
        SELECT
          COUNT(*) AS activatedInvites,
          MIN(ia.activatedAt) AS firstActivationAt
        FROM (
          SELECT
            im.sponsorId AS sponsorId,
            im.userId AS inviteeId,
            MIN(se.createdAt) AS activatedAt
          FROM invited_member im
          INNER JOIN staking_entry se
            ON se.userId = im.userId
          WHERE
            im.sponsorId = ${myId}
            AND se.status <> 'cancelled'
            AND se.packageId >= ${minPackageId}
            AND se.amount >= ${minStake}
            AND (${startIso} IS NULL OR se.createdAt >= ${startIso})
            AND se.createdAt <= ${endIso}
          GROUP BY im.sponsorId, im.userId
        ) ia;
      `;

      const myActivated = Number(myScoreRows[0]?.activatedInvites ?? 0);
      const myFirstAt = myScoreRows[0]?.firstActivationAt ?? null;

      let myRank: number | null = null;
      if (myActivated > 0 && myFirstAt) {
        const aheadRows = await prisma.$queryRaw<Array<{ ahead: bigint | number }>>`
          SELECT
            COUNT(*) AS ahead
          FROM (
            SELECT
              ia.sponsorId AS sponsorId,
              COUNT(*) AS activatedInvites,
              MIN(ia.activatedAt) AS firstActivationAt
            FROM (
              SELECT
                im.sponsorId AS sponsorId,
                im.userId AS inviteeId,
                MIN(se.createdAt) AS activatedAt
              FROM invited_member im
              INNER JOIN staking_entry se
                ON se.userId = im.userId
              WHERE
                se.status <> 'cancelled'
                AND se.packageId >= ${minPackageId}
                AND se.amount >= ${minStake}
                AND (${startIso} IS NULL OR se.createdAt >= ${startIso})
                AND se.createdAt <= ${endIso}
              GROUP BY im.sponsorId, im.userId
            ) ia
            GROUP BY ia.sponsorId
          ) scores
          WHERE
            scores.activatedInvites > ${myActivated}
            OR (
              scores.activatedInvites = ${myActivated}
              AND scores.firstActivationAt < ${myFirstAt}
            );
        `;

        myRank = Number(aheadRows[0]?.ahead ?? 0) + 1;
      }

      return {
        period: "weekly",
        start: start,
        end,
        minStake,
        minPackageId,
        top,
        me: {
          userId: myId,
          activatedInvites: myActivated,
          rank: myRank,
        },
        resetRule: "Weekly resets every Sunday 6:00 PM PKT (Asia/Karachi)",
      };
    }),
};

