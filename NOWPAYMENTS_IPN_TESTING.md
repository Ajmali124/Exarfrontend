# NOWPayments IPN Webhook Testing Guide

## 📋 Webhook URL Configuration

### ✅ Correct Format
**Use the COMPLETE API path:**
```
https://yourdomain.com/api/nowpayments/ipn
```

### ❌ Incorrect Format
```
https://yourdomain.com/
```

**Important:** The webhook URL in NOWPayments dashboard must point to the exact endpoint path `/api/nowpayments/ipn`

---

## 🧪 Testing Methods

### Method 1: Test Endpoint (Recommended for Development)

We've created a test endpoint that simulates webhooks without real payments:

#### **Local Testing:**

```bash
# Test endpoint (replace with your actual userId)
curl -X POST http://localhost:3000/api/nowpayments/test-ipn \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id-here",
    "amount": 50.0
  }'
```

#### **Production Testing (requires secret):**

```bash
curl -X POST https://yourdomain.com/api/nowpayments/test-ipn \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-test-secret" \
  -d '{
    "userId": "your-user-id-here",
    "amount": 50.0
  }'
```

**Response:**
```json
{
  "success": true,
  "testPayload": { ... },
  "ipnResponse": {
    "status": 200,
    "body": {
      "status": "ok",
      "message": "Successfully processed deposit..."
    }
  }
}
```

---

### Method 2: Manual Webhook Simulation with ngrok (Local Testing)

1. **Install ngrok:**
```bash
# macOS
brew install ngrok

# or download from https://ngrok.com/download
```

2. **Start your Next.js app:**
```bash
npm run dev
# Server runs on http://localhost:3000
```

3. **Start ngrok tunnel:**
```bash
ngrok http 3000
```

4. **Copy the HTTPS URL:**
```
Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

5. **Set webhook URL in NOWPayments:**
```
https://abc123.ngrok.io/api/nowpayments/ipn
```

6. **Use NOWPayments test mode:**
- NOWPayments has a sandbox/test mode
- Create a small test payment (minimum amount)
- The webhook will be sent to your ngrok URL

---

### Method 3: Postman/Insomnia Manual Testing

1. **Get a test signature:**
   - Create a test payload using the test endpoint
   - Copy the `signature` from the response

2. **Make POST request:**
   ```
   URL: https://yourdomain.com/api/nowpayments/ipn
   Method: POST
   Headers:
     Content-Type: application/json
     x-nowpayments-sig: <signature-from-step-1>
   
   Body (raw JSON):
   {
     "payment_id": 123456,
     "payment_status": "finished",
     "order_id": "deposit-your-user-id-1234567890",
     "price_amount": 50,
     "price_currency": "USD",
     "pay_amount": 50,
     "actually_paid": 50,
     "pay_currency": "usdtbsc",
     "pay_address": "0x1234567890123456789012345678901234567890",
     "payin_extra_id": "test_tx_123"
   }
   ```

---

### Method 4: Using NOWPayments Test Mode

1. **Enable test mode in NOWPayments dashboard:**
   - Go to Settings → API keys
   - Use test/sandbox API key

2. **Set webhook URL:**
   - Settings → Instant payment notifications
   - Webhook URL: `https://yourdomain.com/api/nowpayments/ipn`

3. **Create a test payment:**
   - Use minimum amount (usually $1)
   - Complete the payment
   - NOWPayments will send webhook to your endpoint

4. **Monitor logs:**
   - Check your server logs for webhook receipt
   - Check database for updated balance

---

## 🔍 Verification Steps

### 1. Check Webhook Endpoint is Active

```bash
curl https://yourdomain.com/api/nowpayments/ipn
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "NOWPayments IPN endpoint is active"
}
```

### 2. Check Environment Variables

Ensure these are set:
```env
NOWPAYMENTS_IPN_SECRET=your_ipn_secret_from_dashboard
NOWPAYMENTS_IPN_URL=https://yourdomain.com/api/nowpayments/ipn
```

### 3. Check Database After Webhook

```sql
-- Check transaction record
SELECT * FROM transaction_record 
WHERE type = 'deposit' 
ORDER BY created_at DESC 
LIMIT 5;

-- Check user balance updated
SELECT userId, balance FROM user_balance 
WHERE userId = 'your-user-id';
```

### 4. Monitor Server Logs

Watch for these log messages:
```
✅ "Received IPN for payment_id: 123456, status: finished"
✅ "Successfully processed deposit: ... (payment_id: 123456)"
```

If errors:
```
❌ "Invalid IPN signature for payment_id: 123456"
❌ "Invalid order_id format: ..."
```

---

## 🛠️ Troubleshooting

### Problem: "Invalid signature" error

**Solution:**
1. Verify `NOWPAYMENTS_IPN_SECRET` matches your dashboard
2. Regenerate IPN secret in NOWPayments dashboard
3. Update environment variable and redeploy

### Problem: Webhook not received

**Solution:**
1. Check webhook URL format: Must be `https://domain.com/api/nowpayments/ipn`
2. Verify HTTPS is enabled (NOWPayments requires HTTPS)
3. Check firewall/security groups allow NOWPayments IPs:
   - `51.89.194.21`
   - `51.75.77.69`
   - `138.201.172.58`
   - `65.21.158.36`

### Problem: "Invalid order_id format"

**Solution:**
- Order ID must match format: `deposit-{userId}-{timestamp}`
- Verify userId exists in database
- Check webhook payload contains correct `order_id`

### Problem: Duplicate processing

**Solution:**
- Our system prevents duplicates automatically
- Checks existing transactions before processing
- If duplicate detected, returns success without processing

---

## 📝 Testing Checklist

- [ ] Webhook URL set correctly: `https://domain.com/api/nowpayments/ipn`
- [ ] `NOWPAYMENTS_IPN_SECRET` environment variable configured
- [ ] Test endpoint returns 200 OK
- [ ] Test webhook simulation works (Method 1)
- [ ] Database connection working
- [ ] User balance updates correctly
- [ ] Transaction records created
- [ ] No duplicate processing
- [ ] Logs show successful processing

---

## 🚀 Production Deployment

1. **Deploy to production:**
```bash
git push origin main
# Vercel will auto-deploy
```

2. **Set environment variables in Vercel:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add `NOWPAYMENTS_IPN_SECRET`
   - Redeploy if needed

3. **Update NOWPayments webhook URL:**
   - Settings → Instant payment notifications
   - Webhook URL: `https://your-production-domain.com/api/nowpayments/ipn`
   - Click "Save"

4. **Test with small real payment:**
   - Create a minimum deposit ($1-5)
   - Verify webhook received
   - Check balance updated

---

## 🔐 Security Notes

- ✅ Webhook signature validation prevents unauthorized requests
- ✅ Only "finished" status payments are processed
- ✅ Idempotency prevents duplicate processing
- ✅ Database transactions ensure data consistency
- ⚠️ Never share your `NOWPAYMENTS_IPN_SECRET`
- ⚠️ Use HTTPS only (NOWPayments requires it)

