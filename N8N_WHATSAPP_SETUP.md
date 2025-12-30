# n8n WhatsApp Setup Guide - Extract JSON & Send Messages

## Complete Workflow Structure

```
Webhook (POST) → Set/Code Node (Format Message) → WhatsApp Node → Done
```

## Step-by-Step Setup

### Step 1: Webhook Node (Already Configured)
- ✅ HTTP Method: **POST**
- ✅ Authentication: **None**
- ✅ Respond: **Immediately**

### Step 2: Extract & Format Data

You have two options:

#### Option A: Use "Set" Node (Recommended - Simple)

1. **Add "Set" Node** after Webhook
   - Search for "Set" or "Edit Fields (Set)" in node search
   - Click to add it

2. **Configure Set Node:**
   - Click on the Set node
   - Under "Keep Only Set Fields": Toggle **OFF** (to keep all original data)
   - Click "Add Value" → Select "String"

3. **Add Fields:**
   
   **Field 1: `message`**
   - Name: `message`
   - Value (click the expression icon `</>`):
   ```
   🚀 *Withdrawal Completed*

   💰 *Amount:* {{ $json.withdrawal.amount }} {{ $json.withdrawal.currency }}
   👤 *User ID:* {{ $json.user.id }}
   🔗 *Transaction:* {{ $json.withdrawal.withdrawalId }}
   📍 *Address:* {{ $json.withdrawal.toAddress }}
   ⏰ *Time:* {{ $json.timestamp }}

   Status: ✅ Completed
   ```

   **Field 2: `phoneNumber`** (if you need to extract it)
   - Name: `phoneNumber`
   - Value: Your WhatsApp group/contact number (e.g., `+1234567890` or group ID)

#### Option B: Use "Code" Node (More Flexible)

1. **Add "Code" Node** after Webhook
   - Search for "Code" in node search
   - Click to add it

2. **Configure Code Node:**
   - Language: **JavaScript**
   - Paste this code:

   ```javascript
   // Extract data from webhook
   const withdrawal = $input.item.json.withdrawal;
   const user = $input.item.json.user;
   const timestamp = $input.item.json.timestamp;

   // Format message
   const message = `🚀 *Withdrawal Completed*

💰 *Amount:* ${withdrawal.amount} ${withdrawal.currency}
👤 *User ID:* ${user.id}
🔗 *Transaction:* ${withdrawal.withdrawalId}
📍 *Address:* ${withdrawal.toAddress}
⏰ *Time:* ${new Date(timestamp).toLocaleString()}

Status: ✅ Completed`;

   // Return formatted data
   return {
     json: {
       message: message,
       phoneNumber: "+1234567890", // Replace with your WhatsApp number/group ID
       withdrawalId: withdrawal.withdrawalId,
       amount: withdrawal.amount,
       currency: withdrawal.currency
     }
   };
   ```

### Step 3: Send to WhatsApp

You have multiple options for WhatsApp integration:

---

## WhatsApp Integration Options

### Option 1: WhatsApp Business API (Official - Recommended)

**Requirements:**
- WhatsApp Business Account
- Meta Business Account
- Access to WhatsApp Business API

**Setup:**
1. **Add "WhatsApp" Node** after Set/Code node
   - Search for "WhatsApp" in n8n
   - Select "WhatsApp Business API" or "WhatsApp Cloud API"

2. **Configure WhatsApp Node:**
   - **Operation:** Send Message
   - **To:** `{{ $json.phoneNumber }}` or hardcode your group/contact number
   - **Message:** `{{ $json.message }}`
   - **Credentials:** Connect your WhatsApp Business API credentials

---

### Option 2: Twilio WhatsApp API

**Requirements:**
- Twilio account
- WhatsApp-enabled Twilio number

**Setup:**
1. **Add "Twilio" Node** after Set/Code node
   - Search for "Twilio" in n8n

2. **Configure Twilio Node:**
   - **Operation:** Send WhatsApp Message
   - **From:** Your Twilio WhatsApp number (e.g., `whatsapp:+14155238886`)
   - **To:** `{{ $json.phoneNumber }}` or your group/contact
   - **Message Body:** `{{ $json.message }}`
   - **Credentials:** Add your Twilio Account SID and Auth Token

---

### Option 3: HTTP Request to WhatsApp API Service

**For services like WasenderApi, ChatAPI, etc.**

1. **Add "HTTP Request" Node** after Set/Code node
   - Search for "HTTP Request" in n8n

2. **Configure HTTP Request Node:**
   - **Method:** POST
   - **URL:** Your WhatsApp API endpoint
     - Example: `https://api.wasenderapi.com/send`
     - Or: `https://api.chat-api.com/instance12345/sendMessage`
   
   - **Headers:**
     ```
     Content-Type: application/json
     Authorization: Bearer YOUR_API_KEY
     ```
   
   - **Body (JSON):**
     ```json
     {
       "phone": "{{ $json.phoneNumber }}",
       "body": "{{ $json.message }}"
     }
     ```

---

### Option 4: WhatsApp Web (via Automation - Less Reliable)

**Using services like Wati, 360dialog, etc.**

1. **Add "HTTP Request" Node**
2. **Configure:**
   - **Method:** POST
   - **URL:** Your service endpoint
   - **Body:** Format according to service documentation

---

## Recommended Setup (Simple & Reliable)

### Using Twilio WhatsApp (Easiest to Set Up)

```
Webhook → Set Node → Twilio WhatsApp → Done
```

**Set Node Configuration:**
- Add field `message` with formatted text
- Add field `to` with WhatsApp number (e.g., `whatsapp:+1234567890`)

**Twilio Node Configuration:**
- Operation: Send WhatsApp Message
- From: Your Twilio WhatsApp number
- To: `{{ $json.to }}`
- Message Body: `{{ $json.message }}`

---

## Complete Example Workflow

### Node 1: Webhook
- Receives POST request from your app
- Data available in `$json`

### Node 2: Set (Format Message)
**Fields:**
- `message`: 
  ```
  🚀 Withdrawal Completed
  
  Amount: {{ $json.withdrawal.amount }} {{ $json.withdrawal.currency }}
  User: {{ $json.user.id }}
  Transaction: {{ $json.withdrawal.withdrawalId }}
  Address: {{ $json.withdrawal.toAddress }}
  Time: {{ $json.timestamp }}
  ```
- `to`: `whatsapp:+1234567890` (your WhatsApp number/group)

### Node 3: Twilio WhatsApp
- From: `whatsapp:+14155238886` (your Twilio number)
- To: `{{ $json.to }}`
- Message: `{{ $json.message }}`

---

## Testing Your Workflow

1. **Activate Workflow** in n8n
2. **Test with Sample Data:**
   - Click "Execute Workflow" button
   - Or use "Listen for test event" in Webhook node
   - Manually trigger with test JSON

3. **Test JSON for Webhook:**
   ```json
   {
     "event": "withdrawal_completed",
     "withdrawal": {
       "id": "test123",
       "withdrawalId": "CP123456",
       "amount": 100.50,
       "currency": "USDT",
       "status": "completed",
       "toAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
       "description": "Test withdrawal"
     },
     "user": {
       "id": "user_test123"
     },
     "timestamp": "2024-01-15T10:30:45.123Z"
   }
   ```

4. **Check Execution:**
   - Go to "Executions" tab in n8n
   - View each node's output
   - Check if WhatsApp message was sent

---

## Troubleshooting

### Message Not Sending:
- ✅ Check WhatsApp node credentials
- ✅ Verify phone number format (include country code)
- ✅ Check n8n execution logs for errors
- ✅ Ensure workflow is **Active** (not just saved)

### Data Not Extracting:
- ✅ Use expression mode (`</>` icon) when entering `{{ }}` expressions
- ✅ Check webhook output in "Executions" tab
- ✅ Verify JSON structure matches expected format

### WhatsApp API Errors:
- ✅ Verify API credentials are correct
- ✅ Check if WhatsApp number is verified/approved
- ✅ Ensure you have sufficient credits/quota

---

## Quick Reference: Expression Examples

In n8n, use these expressions to extract data:

```javascript
// Event type
{{ $json.event }}

// Withdrawal amount
{{ $json.withdrawal.amount }}

// Currency
{{ $json.withdrawal.currency }}

// User ID
{{ $json.user.id }}

// Transaction ID
{{ $json.withdrawal.withdrawalId }}

// Address
{{ $json.withdrawal.toAddress }}

// Timestamp (formatted)
{{ $json.timestamp }}

// Full message (in Set node)
🚀 Withdrawal: {{ $json.withdrawal.amount }} {{ $json.withdrawal.currency }}
User: {{ $json.user.id }}
TX: {{ $json.withdrawal.withdrawalId }}
```

---

## Next Steps

1. Choose your WhatsApp integration method (Twilio recommended for beginners)
2. Set up credentials in n8n
3. Add Set/Code node to format message
4. Add WhatsApp node to send message
5. Test with sample data
6. Activate workflow
7. Test with real withdrawal

Your workflow is ready! 🎉
