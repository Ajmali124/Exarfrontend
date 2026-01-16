// Utility to send withdrawal completion notifications to Zapier

const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL;

export interface NotifyZapierWithdrawalData {
  withdrawalId: string;
  amount: number;
  currency: string;
  status: string;
  userId: string;
  userName?: string | null;
  country?: string | null;
  toAddress?: string | null;
  description?: string | null;
  transactionId?: string;
}

/**
 * Sends a withdrawal completion notification to Zapier webhook.
 */
export async function notifyZapierWithdrawal(
  data: NotifyZapierWithdrawalData
): Promise<void> {
  if (!ZAPIER_WEBHOOK_URL) return;

  const payload = {
    event: "withdrawal_completed",
    withdrawal: {
      id: data.transactionId || data.withdrawalId,
      withdrawalId: data.withdrawalId,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      toAddress: data.toAddress,
      description: data.description,
    },
    user: {
      id: data.userId,
      name: data.userName ?? null,
      country: data.country ?? null,
    },
    timestamp: new Date().toISOString(),
  };

  await fetch(ZAPIER_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  });
}
