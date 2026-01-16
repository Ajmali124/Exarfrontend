import prisma from "../src/lib/prismadb";
import { randomUUID } from "node:crypto";

/**
 * Seed Rank/Leaderboard test data (DEV ONLY).
 *
 * Creates:
 * - 1 sponsor user
 * - N invitee users
 * - invited_member links sponsor -> invitees
 * - Bronze stakes (packageId=1, amount=100) for a subset of invitees so they show in leaderboard
 *
 * Run:
 *   npm run seed:rank-test
 *
 * Safety:
 * - Refuses to run if NODE_ENV=production
 */

function assertNotProduction() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed test users in production.");
  }
}

function makeEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

function makeInviteCode() {
  return `RANK${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function ensureUserBalance(userId: string) {
  await prisma.userBalance.upsert({
    where: { userId },
    update: {},
    create: { userId, balance: 0 },
  });
}

async function main() {
  assertNotProduction();

  const sponsorEmail = makeEmail("rank-sponsor");
  const sponsor = await prisma.user.create({
    data: {
      id: `rank_sponsor_${randomUUID()}`,
      name: "Rank Sponsor (Test)",
      email: sponsorEmail,
      inviteCode: makeInviteCode(),
      emailVerified: true,
    },
  });
  await ensureUserBalance(sponsor.id);

  // Create 12 invitees; first 9 will "activate" with a Bronze stake.
  const inviteeCount = 12;
  const activatedCount = 9;

  for (let i = 1; i <= inviteeCount; i++) {
    const invitee = await prisma.user.create({
      data: {
        id: `rank_invitee_${randomUUID()}`,
        name: `Invitee Test ${i}`,
        email: makeEmail(`rank-invitee${i}`),
        emailVerified: true,
      },
    });
    await ensureUserBalance(invitee.id);

    await prisma.invitedMember.create({
      data: {
        sponsorId: sponsor.id,
        userId: invitee.id,
        firstName: "Test",
        lastName: `Invitee${i}`,
        email: invitee.email,
      },
    });

    if (i <= activatedCount) {
      await prisma.stakingEntry.create({
        data: {
          userId: invitee.id,
          packageName: "Bronze Node",
          packageId: 1,
          amount: 100,
          currency: "USDT",
          dailyROI: 1.0,
          cap: 1.8,
          maxEarning: 180,
          totalEarned: 0,
          status: "active",
          startDate: new Date(),
        },
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log("Seeded leaderboard test data:");
  // eslint-disable-next-line no-console
  console.log({
    sponsorId: sponsor.id,
    sponsorEmail: sponsor.email,
    sponsorInviteCode: sponsor.inviteCode,
    invitees: inviteeCount,
    activatedInvitees: activatedCount,
  });
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

