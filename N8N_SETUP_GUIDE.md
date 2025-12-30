# n8n Webhook Setup Guide for Withdrawal Notifications

## n8n Webhook Node Configuration

### Step 1: Change HTTP Method
1. Open your n8n webhook node
2. Find "HTTP Method" dropdown
3. Change from **GET** to **POST**
4. This is required because the app sends POST requests with JSON body

### Step 2: Remove Authentication
1. Find "Authentication" dropdown
2. Change from "Header Auth" to **"None"**
3. The app doesn't send authentication headers - it's a simple POST request

### Step 3: Keep Response Setting
- Keep "Respond" set to **"Immediately"**
- This ensures n8n responds quickly to the app

### Step 4: Test the Webhook
1. Click "Listen for test event" button
2. The webhook URL should be: `https://ajmalaa.app.n8n.cloud/webhook/2e68c518-f7a2-4456-b59a-40fdc2d32f41`
3. Make sure it's set to **POST** method

## What Data You'll Receive

When a withdrawal is completed, n8n will receive a JSON payload like this:

```json
{
  "event": "withdrawal_completed",
  "withdrawal": {
    "id": "clx1234567890abcdef",
    "withdrawalId": "CP1234567890",
    "amount": 100.50,
    "currency": "USDT",
    "status": "completed",
    "toAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "description": "CoinPayments USDT-BSC withdrawal: 100.50 USDT sent (100.50 USDT total deducted)"
  },
  "user": {
    "id": "user_abc123xyz"
  },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

## n8n Workflow Example

After receiving the webhook, you can:

1. **Filter for completed withdrawals** (optional - already filtered by app)
   - Use IF node: `{{ $json.event }} === "withdrawal_completed"`

2. **Extract data** using expressions:
   - Amount: `{{ $json.withdrawal.amount }}`
   - Currency: `{{ $json.withdrawal.currency }}`
   - User ID: `{{ $json.user.id }}`
   - Withdrawal ID: `{{ $json.withdrawal.withdrawalId }}`
   - Address: `{{ $json.withdrawal.toAddress }}`
   - Timestamp: `{{ $json.timestamp }}`

3. **Send notification** to your group (Telegram, Discord, etc.)
   - Example message:
   ```
   🚀 Withdrawal Completed
   
   Amount: {{ $json.withdrawal.amount }} {{ $json.withdrawal.currency }}
   User ID: {{ $json.user.id }}
   Transaction: {{ $json.withdrawal.withdrawalId }}
   Address: {{ $json.withdrawal.toAddress }}
   Time: {{ $json.timestamp }}
   ```

## Complete Flow

```
1. User requests withdrawal in app
   ↓
2. App creates withdrawal with CoinPayments
   ↓
3. CoinPayments processes withdrawal
   ↓
4. CoinPayments sends IPN to: https://exarpro.com/api/coinpayment/ipn
   ↓
5. App validates HMAC and updates database
   ↓
6. If withdrawal status = "completed":
   → App sends POST request to n8n webhook
   → Payload includes withdrawal details
   ↓
7. n8n receives webhook
   ↓
8. n8n workflow processes and sends notification to group
```

## Testing

1. **Test in n8n:**
   - Use "Listen for test event" to capture a test payload
   - Manually send a test POST request with the JSON structure above

2. **Test in production:**
   - Make a real withdrawal (or use CoinPayments test mode)
   - Check n8n execution logs to see if webhook was received
   - Check Vercel logs for any errors

## Troubleshooting

- **Webhook not receiving data:**
  - Verify HTTP Method is POST (not GET)
  - Check n8n workflow is active
  - Verify webhook URL is correct in Vercel env variable

- **Authentication errors:**
  - Make sure Authentication is set to "None" in n8n

- **No notifications:**
  - Check n8n execution logs
  - Verify workflow is active
  - Check Vercel function logs for errors
