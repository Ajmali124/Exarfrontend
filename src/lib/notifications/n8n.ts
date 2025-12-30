// Utility to send withdrawal completion notifications to n8n

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

export interface NotifyN8nWithdrawalData {
  withdrawalId: string;
  amount: number;
  currency: string;
  status: string;
  userId: string;
  toAddress?: string | null;
  description?: string | null;
  transactionId?: string;
}

/**
 * Sends a withdrawal completion notification to n8n webhook.
 * 
 * @param data - Withdrawal data to send to n8n
 */
export async function notifyN8nWithdrawal(
  data: NotifyN8nWithdrawalData
): Promise<void> {
  // Skip if webhook URL is not configured
  if (!N8N_WEBHOOK_URL) {
    return;
  }

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
    },
    timestamp: new Date().toISOString(),
  };

  await fetch(N8N_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  });
}
