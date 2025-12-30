// Utility to send withdrawal completion notifications to n8n
// Fire-and-forget pattern - errors are logged but don't affect caller

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
 * This function uses a fire-and-forget pattern and will not throw errors.
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

  try {
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

    // Create abort controller for timeout (compatible with older Node.js versions)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout (increased from 5s)

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(
        `n8n webhook returned error status ${response.status} for withdrawal ${data.withdrawalId}`
      );
    }
  } catch (error) {
    // Log error but don't throw - this is fire-and-forget
    // Handle abort errors specifically (timeout)
    if (error instanceof Error && error.name === "AbortError") {
      console.warn(
        `n8n webhook timeout for withdrawal ${data.withdrawalId} (request took longer than 15s)`
      );
    } else {
      console.error(
        `Failed to notify n8n about withdrawal ${data.withdrawalId}:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}
