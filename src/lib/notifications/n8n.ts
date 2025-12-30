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

    console.log(`[n8n] Sending webhook for withdrawal ${data.withdrawalId} to ${N8N_WEBHOOK_URL}`);

    // Create abort controller for timeout (compatible with older Node.js versions)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

    const startTime = Date.now();
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    console.log(`[n8n] Webhook response for withdrawal ${data.withdrawalId}: status ${response.status}, took ${duration}ms`);

    if (!response.ok) {
      // Try to get error details from response
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch (e) {
        // Ignore if we can't read body
      }
      
      console.error(
        `[n8n] Webhook returned error status ${response.status} for withdrawal ${data.withdrawalId}`,
        errorBody ? `Response: ${errorBody.substring(0, 200)}` : ""
      );
    } else {
      console.log(`[n8n] Successfully notified n8n about withdrawal ${data.withdrawalId}`);
    }
  } catch (error) {
    // Log error but don't throw - this is fire-and-forget
    // Handle abort errors specifically (timeout)
    if (error instanceof Error && error.name === "AbortError") {
      console.warn(
        `[n8n] Webhook timeout for withdrawal ${data.withdrawalId} (request took longer than 2 minutes)`
      );
    } else {
      // Log full error details for debugging
      const errorDetails = error instanceof Error 
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack?.substring(0, 500),
          }
        : String(error);
      
      console.error(
        `[n8n] Failed to notify n8n about withdrawal ${data.withdrawalId}:`,
        JSON.stringify(errorDetails, null, 2)
      );
    }
  }
}
