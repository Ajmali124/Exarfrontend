# Voucher Generation Guide

This guide explains how to generate vouchers in bulk for physical voucher printing.

## Database Schema Changes

The `Voucher` model has been updated to allow `userId` to be `null` for unassigned vouchers. This allows vouchers to be created without being assigned to a specific user, making them available for redemption via code.

**Important**: Run Prisma migration after schema changes:
```bash
npx prisma migrate dev --name make_voucher_userid_optional
npx prisma generate
```

## Generating Vouchers

### Method 1: Using the Script

Run the provided script to generate 10 vouchers with $10 value:

```bash
npx tsx scripts/generate-vouchers.ts
```

This will:
- Generate 10 vouchers with unique codes (format: `V-XXXX-XXXX`)
- Set value to $10 USDT
- Create them as unassigned (userId = null)
- Set expiry to 30 days from creation
- Make them instant withdrawable type

### Method 2: Using tRPC API

You can also create vouchers programmatically using the tRPC API:

```typescript
// Example: Create 10 vouchers via tRPC
const result = await trpc.admin.voucher.createVouchers.mutate({
  value: 10,
  currency: "USDT",
  type: "withdraw",
  title: "$10 Instant Withdrawal",
  badge: "Withdrawal Voucher",
  badgeColor: "green",
  description: "Instant withdrawable voucher worth $10 USDT",
  linkText: "Withdraw funds",
  linkHref: "/withdraw",
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  quantity: 10,
  // userId is optional - if not provided, vouchers are unassigned
});
```

### Method 3: Direct Function Call

```typescript
import { createVouchersInBulk } from "@/lib/voucher/generate";

const result = await createVouchersInBulk({
  value: 10,
  currency: "USDT",
  type: "withdraw",
  title: "$10 Instant Withdrawal",
  badge: "Withdrawal Voucher",
  badgeColor: "green",
  description: "Instant withdrawable voucher worth $10 USDT",
  linkText: "Withdraw funds",
  linkHref: "/withdraw",
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  quantity: 10,
});
```

## Voucher Code Format

Vouchers are generated with codes in the format: `V-XXXX-XXXX`

Example: `V-A3F2-9K7M`

- Uses alphanumeric characters (excluding confusing chars like 0, O, I, 1)
- Each code is unique and checked against the database before creation
- Codes are suitable for printing on physical vouchers

## Voucher Redemption

### How Redemption Works

1. User enters voucher code in the "Add Code" page
2. System checks if code exists and is valid
3. If unassigned (userId = null), voucher is assigned to the user
4. System verifies voucher status (must be "active" and not expired)
5. **Double-check prevents race conditions** - voucher is verified again inside transaction
6. Voucher status is updated to "used"
7. For "withdraw" type vouchers, value is added to user balance

### Preventing Double Redemption

The system prevents double redemption through:

1. **Unique code constraint**: Each code can only exist once in the database
2. **Status check**: Voucher must be "active" to be redeemed
3. **Transaction safety**: All updates happen in a database transaction
4. **Double-check inside transaction**: Status is verified again before updating to prevent race conditions
5. **Immediate status update**: Once redeemed, status changes to "used" immediately

### Redemption Flow

```
User enters code
    ↓
Check if code exists
    ↓
Check if voucher is active and not expired
    ↓
[Transaction starts]
    ↓
Double-check voucher is still active (prevents race conditions)
    ↓
Check if voucher belongs to another user
    ↓
Update voucher status to "used"
    ↓
If type is "withdraw": Add to user balance
    ↓
[Transaction commits]
    ↓
Success!
```

## Viewing Unassigned Vouchers

To view all unassigned vouchers (for admin/printing purposes):

```typescript
const unassignedVouchers = await trpc.admin.voucher.getUnassignedVouchers.query({
  status: "active", // or "all", "used", "expired"
});
```

## Physical Voucher Design

When designing physical vouchers, include:
- Voucher code (format: `V-XXXX-XXXX`)
- Value ($10)
- Expiry date
- Instructions to redeem at `/voucher/add-code`
- QR code (optional) that links to redemption page with pre-filled code

## Package Voucher ROI System

### ROI Validity Periods

Package vouchers support different ROI validity periods:
- **3 days**: Short-term vouchers (3x daily ROI payouts)
- **7 days**: Weekly vouchers (7x daily ROI payouts)
- **14 days**: Bi-weekly vouchers (14x daily ROI payouts)
- **30 days**: Monthly vouchers (30x daily ROI payouts)

### Voucher Types

There are **two types** of package vouchers you can generate:

#### Type 1: Independent Max Cap Vouchers (`affectsMaxCap = true`)
- **Has its own independent max cap**
- Can be used **without purchasing a real package**
- Max cap = voucher value × package cap multiplier
- Example: $10 voucher → Max cap = $10 × 1.5 = $15
- ROI is tracked against this independent max cap
- Once max cap is reached, ROI stops

#### Type 2: Flushed ROI Vouchers (`affectsMaxCap = false`)
- **No max cap tracking (ROI is flushed)**
- Two sub-types:
  - **A)** Can be used independently (`requiresRealPackage = false`)
    - ROI is provided daily without max cap
    - ROI continues until `roiEndDate` (validity period ends)
  - **B)** Requires real package (`requiresRealPackage = true`)
    - **Only works if user has purchased a real package** (not from voucher)
    - If user hasn't bought a real package, voucher cannot be used
    - ROI is flushed (no max cap) but requires real package to activate

### How ROI Works

1. **Voucher Redemption**: When a user clicks "Use Now" on a voucher
2. **ROI Period Calculation**: `roiEndDate = usedAt + roiValidityDays`
3. **Daily ROI Distribution**: 
   - Voucher provides daily ROI based on the package's ROI percentage
   - ROI is calculated on the voucher value ($10) at the package's daily ROI rate
   - ROI is provided ONLY during the validity period (3/7/14/30 days)
   - After `roiEndDate`, voucher stops providing ROI
4. **Max Cap Behavior**:
   - **Type 1** (`affectsMaxCap = true`): ROI tracked against independent max cap
   - **Type 2** (`affectsMaxCap = false`): ROI is flushed (no max cap tracking)

### Example Calculations

#### Example 1: Independent Max Cap Voucher (`affectsMaxCap = true`)
- **Package**: Trial Node ($10, 0.8% daily ROI, 1.5x cap)
- **Voucher Used**: $10 voucher (7-day ROI validity, `affectsMaxCap = true`)
- **Max Cap**: $10 × 1.5 = $15 (independent max cap)
- **Daily ROI**: $10 × 0.8% = $0.08/day
- **Behavior**: ROI tracked against $15 max cap. Once reached, ROI stops even if validity period continues
- **Can use without real package**: ✅ Yes

#### Example 2: Flushed ROI Voucher (`affectsMaxCap = false`, `requiresRealPackage = false`)
- **Package**: Trial Node ($10, 0.8% daily ROI, 1.5x cap)
- **Voucher Used**: $10 voucher (7-day ROI validity, `affectsMaxCap = false`)
- **Max Cap**: None (ROI flushed)
- **Daily ROI**: $10 × 0.8% = $0.08/day
- **Behavior**: ROI provided for full 7 days, no cap tracking. ROI continues until validity period ends
- **Can use without real package**: ✅ Yes

#### Example 3: Flushed ROI Voucher Requiring Real Package (`affectsMaxCap = false`, `requiresRealPackage = true`)
- **Package**: Trial Node ($10, 0.8% daily ROI, 1.5x cap)
- **Voucher Used**: $10 voucher (7-day ROI validity, `requiresRealPackage = true`)
- **User must have**: Purchased a real package (not from voucher)
- **Max Cap**: None (ROI flushed)
- **Daily ROI**: $10 × 0.8% = $0.08/day
- **Behavior**: ROI provided for full 7 days, no cap tracking. Voucher only works if user has real package
- **Can use without real package**: ❌ No

## Notes

- Vouchers are stored with `userId = null` until redeemed
- Once redeemed, they are assigned to the user who redeemed them
- Each voucher can only be redeemed once
- Expired vouchers are automatically marked as "expired" on redemption attempt
- Voucher codes are case-sensitive (stored in uppercase)
- **Voucher ROI does NOT affect max cap** - max cap is based on actual paid amount only
- **ROI validity period** determines how long the voucher provides daily returns
- Vouchers must be applied during stake creation to get ROI benefits

