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

  console.log(`[n8n] Sending webhook for withdrawal ${data.withdrawalId} to ${N8N_WEBHOOK_URL}`);

  // Retry logic for network failures
  const maxRetries = 3;
  let attempt = 0;

  const attemptFetch = (): void => {
    attempt++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout per attempt

    fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "ExarPro-Webhook/1.0",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
      .then(async (response) => {
        clearTimeout(timeoutId);
        console.log(`[n8n] Webhook response for withdrawal ${data.withdrawalId}: status ${response.status} (attempt ${attempt})`);

        if (!response.ok) {
          let errorBody = "";
          try {
            errorBody = await response.text();
          } catch (e) {
            // Ignore if we can't read body
          }
          
          // Retry on 5xx errors
          if (response.status >= 500 && attempt < maxRetries) {
            console.warn(`[n8n] Server error ${response.status}, retrying... (attempt ${attempt}/${maxRetries})`);
            setTimeout(() => attemptFetch(), 1000 * attempt); // Exponential backoff
            return;
          }
          
          console.error(
            `[n8n] Webhook returned error status ${response.status} for withdrawal ${data.withdrawalId}`,
            errorBody ? `Response: ${errorBody.substring(0, 200)}` : ""
          );
        } else {
          console.log(`[n8n] Successfully notified n8n about withdrawal ${data.withdrawalId} (attempt ${attempt})`);
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        
        // Retry on network errors
        if (attempt < maxRetries && error instanceof Error && error.message.includes("fetch failed")) {
          console.warn(`[n8n] Network error, retrying... (attempt ${attempt}/${maxRetries}): ${error.message}`);
          setTimeout(() => attemptFetch(), 1000 * attempt); // Exponential backoff: 1s, 2s, 3s
          return;
        }
        
        // Log error but don't throw - this is fire-and-forget
        if (error instanceof Error && error.name === "AbortError") {
          console.warn(
            `[n8n] Webhook timeout for withdrawal ${data.withdrawalId} (attempt ${attempt})`
          );
        } else {
          const errorDetails = error instanceof Error 
            ? {
                name: error.name,
                message: error.message,
                cause: error.cause,
              }
            : String(error);
          
          console.error(
            `[n8n] Failed to notify n8n about withdrawal ${data.withdrawalId} after ${attempt} attempt(s):`,
            JSON.stringify(errorDetails, null, 2)
          );
        }
      });
  };

  // Start the first attempt
  attemptFetch();

  // Return immediately - don't wait for the webhook
  return Promise.resolve();
}
