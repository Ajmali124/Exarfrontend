import prisma from "../src/lib/prismadb";

/**
 * Withdrawal Daily Audit
 *
 * Computes withdrawal activity for a given day, using PKT by default (UTC+5).
 *
 * Metrics:
 * - withdrawals by status (count + sum)
 * - fees (completed)
 * - refunds (completed)
 * - net outflow = completed_withdrawals + completed_fees - completed_refunds
 * - top users by withdrawn amount
 *
 * Run:
 *   npx tsx scripts/withdrawal-daily-audit.ts
 *
 * Options:
 *   --date=YYYY-MM-DD      Day in PKT (default: today PKT)
 *   --tzOffsetMinutes=300  Timezone offset minutes from UTC (default: 300 for PKT)
 *   --top=20               Show top N users (default: 10)
 */

type Args = {
  date: string; // YYYY-MM-DD
  tzOffsetMinutes: number;
  top: number;
};

function parseArgs(argv: string[]): Args {
  const dateArg = argv.find((a) => a.startsWith("--date="))?.slice(7);
  const tzArg = argv
    .find((a) => a.startsWith("--tzOffsetMinutes="))
    ?.slice("--tzOffsetMinutes=".length);
  const topArg = argv.find((a) => a.startsWith("--top="))?.slice(6);

  const tzOffsetMinutes = tzArg ? Number(tzArg) : 300;
  const top = topArg ? Number(topArg) : 10;

  const now = new Date();
  // Default date = today in provided tz
  const shifted = new Date(now.getTime() + tzOffsetMinutes * 60_000);
  const yyyy = shifted.getUTCFullYear();
  const mm = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(shifted.getUTCDate()).padStart(2, "0");
  const date = dateArg ?? `${yyyy}-${mm}-${dd}`;

  return { date, tzOffsetMinutes, top: Number.isFinite(top) ? top : 10 };
}

function dateRangeUtcFromLocalDay(date: string, tzOffsetMinutes: number) {
  // date is YYYY-MM-DD in local tz (offset from UTC).
  const [y, m, d] = date.split("-").map((v) => Number(v));
  if (!y || !m || !d) throw new Error(`Invalid --date=${date}`);

  // Local midnight -> UTC = local - offset
  const startLocalAsUtc = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
  const startUtcMs = startLocalAsUtc - tzOffsetMinutes * 60_000;
  const endUtcMs = startUtcMs + 24 * 60 * 60_000;
  return { start: new Date(startUtcMs), end: new Date(endUtcMs) };
}

function sumAmount(rows: Array<{ amount: number }>) {
  return rows.reduce((sum, r) => sum + (Number.isFinite(r.amount) ? r.amount : 0), 0);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { start, end } = dateRangeUtcFromLocalDay(args.date, args.tzOffsetMinutes);

  // eslint-disable-next-line no-console
  console.log("📊 Withdrawal Daily Audit");
  // eslint-disable-next-line no-console
  console.log(`Day (local): ${args.date} (tzOffsetMinutes=${args.tzOffsetMinutes})`);
  // eslint-disable-next-line no-console
  console.log(`UTC range: ${start.toISOString()} → ${end.toISOString()}`);
  // eslint-disable-next-line no-console
  console.log("");

  const [withdrawals, fees, refunds] = await Promise.all([
    prisma.transactionRecord.findMany({
      where: {
        type: "withdrawal",
        createdAt: { gte: start, lt: end },
      },
      select: {
        id: true,
        userId: true,
        amount: true,
        status: true,
        transactionHash: true,
        toAddress: true,
        createdAt: true,
      },
    }),
    prisma.transactionRecord.findMany({
      where: {
        type: "withdrawal_fee",
        status: "completed",
        createdAt: { gte: start, lt: end },
      },
      select: { userId: true, amount: true },
    }),
    prisma.transactionRecord.findMany({
      where: {
        type: "refund",
        status: "completed",
        createdAt: { gte: start, lt: end },
      },
      select: { userId: true, amount: true, transactionHash: true },
    }),
  ]);

  const deposits = await prisma.transactionRecord.findMany({
    where: {
      type: "deposit",
      status: "completed",
      createdAt: { gte: start, lt: end },
    },
    select: { amount: true },
  });

  const byStatus = new Map<string, { count: number; sum: number }>();
  for (const w of withdrawals) {
    const key = w.status ?? "unknown";
    const cur = byStatus.get(key) ?? { count: 0, sum: 0 };
    cur.count += 1;
    cur.sum += Number.isFinite(w.amount) ? w.amount : 0;
    byStatus.set(key, cur);
  }

  const completedWithdrawals = withdrawals.filter((w) => w.status === "completed");
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending" || w.status === "initiated");
  const failedWithdrawals = withdrawals.filter((w) => w.status === "failed" || w.status === "cancelled");

  const totalCompleted = sumAmount(completedWithdrawals as any);
  const totalPending = sumAmount(pendingWithdrawals as any);
  const totalFailed = sumAmount(failedWithdrawals as any);

  const totalFees = sumAmount(fees);
  const totalRefunds = sumAmount(refunds);
  const netOutflow = totalCompleted + totalFees - totalRefunds;
  const totalDeposits = sumAmount(deposits);
  const netFlow = totalDeposits - netOutflow;

  // eslint-disable-next-line no-console
  console.log("Summary");
  for (const [status, v] of Array.from(byStatus.entries()).sort((a, b) => b[1].sum - a[1].sum)) {
    // eslint-disable-next-line no-console
    console.log(`- ${status}: ${v.count} tx, ${v.sum.toFixed(2)} USDT`);
  }
  // eslint-disable-next-line no-console
  console.log("");
  // eslint-disable-next-line no-console
  console.log(`Completed withdrawals: ${completedWithdrawals.length} tx, ${totalCompleted.toFixed(2)} USDT`);
  // eslint-disable-next-line no-console
  console.log(`Pending/initiated: ${pendingWithdrawals.length} tx, ${totalPending.toFixed(2)} USDT`);
  // eslint-disable-next-line no-console
  console.log(`Failed/cancelled: ${failedWithdrawals.length} tx, ${totalFailed.toFixed(2)} USDT`);
  // eslint-disable-next-line no-console
  console.log(`Fees (completed): ${totalFees.toFixed(2)} USDT`);
  // eslint-disable-next-line no-console
  console.log(`Refunds (completed): ${totalRefunds.toFixed(2)} USDT`);
  // eslint-disable-next-line no-console
  console.log(`NET outflow (completed+fees-refunds): ${netOutflow.toFixed(2)} USDT`);
  // eslint-disable-next-line no-console
  console.log(`Deposits (completed): ${totalDeposits.toFixed(2)} USDT`);
  // eslint-disable-next-line no-console
  console.log(`NET flow (deposits - netOutflow): ${netFlow.toFixed(2)} USDT`);
  // eslint-disable-next-line no-console
  console.log("");

  // Check if failed/cancelled withdrawals have matching refunds (any time, not just today).
  const failedHashes = Array.from(
    new Set(
      failedWithdrawals
        .map((w) => w.transactionHash)
        .filter((h): h is string => typeof h === "string" && h.length > 0)
    )
  );
  let missingRefunds = 0;
  if (failedHashes.length) {
    const refundMatches = await prisma.transactionRecord.findMany({
      where: {
        type: "refund",
        transactionHash: { in: failedHashes },
      },
      select: { transactionHash: true, status: true },
    });
    const refunded = new Set(
      refundMatches
        .filter((r) => r.status === "completed")
        .map((r) => r.transactionHash)
        .filter((h): h is string => typeof h === "string" && h.length > 0)
    );
    missingRefunds = failedHashes.filter((h) => !refunded.has(h)).length;
  }

  if (failedWithdrawals.length) {
    // eslint-disable-next-line no-console
    console.log(
      `Refund check: failed/cancelled withdrawals=${failedWithdrawals.length}, missingRefunds=${missingRefunds}`
    );
    // eslint-disable-next-line no-console
    console.log("");
  }

  // Top users by completed withdrawals
  const byUser = new Map<string, { withdrawn: number; count: number; fee: number; refund: number }>();
  for (const w of completedWithdrawals) {
    const cur = byUser.get(w.userId) ?? { withdrawn: 0, count: 0, fee: 0, refund: 0 };
    cur.withdrawn += Number.isFinite(w.amount) ? w.amount : 0;
    cur.count += 1;
    byUser.set(w.userId, cur);
  }
  for (const f of fees) {
    const cur = byUser.get(f.userId) ?? { withdrawn: 0, count: 0, fee: 0, refund: 0 };
    cur.fee += Number.isFinite(f.amount) ? f.amount : 0;
    byUser.set(f.userId, cur);
  }
  for (const r of refunds) {
    const cur = byUser.get(r.userId) ?? { withdrawn: 0, count: 0, fee: 0, refund: 0 };
    cur.refund += Number.isFinite(r.amount) ? r.amount : 0;
    byUser.set(r.userId, cur);
  }

  const topUsers = Array.from(byUser.entries())
    .map(([userId, v]) => ({ userId, ...v, net: v.withdrawn + v.fee - v.refund }))
    .sort((a, b) => b.net - a.net)
    .slice(0, args.top);

  const topUserIds = topUsers.map((t) => t.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: topUserIds } },
    select: { id: true, name: true, username: true, email: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  // eslint-disable-next-line no-console
  console.log(`Top ${topUsers.length} users by net outflow`);
  for (const t of topUsers) {
    const u = userMap.get(t.userId);
    const label = u?.name ?? u?.username ?? u?.email ?? t.userId;
    // eslint-disable-next-line no-console
    console.log(
      `- ${label}: net=${t.net.toFixed(2)} (withdrawn=${t.withdrawn.toFixed(2)}, fee=${t.fee.toFixed(2)}, refunds=${t.refund.toFixed(2)}) tx=${t.count}`
    );
  }

  // eslint-disable-next-line no-console
  console.log("\nDone.");
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("❌ Audit failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
