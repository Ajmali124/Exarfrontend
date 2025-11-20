# Pre-Launch Promotion System Documentation

## Overview

The Pre-Launch Promotion is a 14-day promotional campaign that automatically rewards users with vouchers when they meet specific conditions. The system focuses on incentivizing package purchases (especially Silver Node) and team building through referrals.

## Key Features

- **14-Day Promotion Window**: Promotion runs for exactly 14 days from registration
- **Automatic Voucher Granting**: Rewards are automatically granted (no manual claiming)
- **No Sponsor Benefits from Vouchers**: Using vouchers does NOT generate sponsor bonuses or team earnings
- **Package Purchase Rewards**: Buy packages to earn vouchers
- **Team Building Rewards**: Invite members who activate packages to earn rewards
- **Voucher Expiry**: All promotional vouchers expire 14 days after creation

---

## Step-by-Step System Flow

### 1. User Registration for Promotion

**What Happens:**
- User visits the promotion page (`/promotions/promo`)
- Clicks "Register Now" button
- System creates a `PromotionRegistration` record with:
  - `userId`: User's ID
  - `promotionType`: "prelaunch" (default)
  - `registeredAt`: Current timestamp
  - `status`: Active

**Technical Flow:**
```
User clicks "Register Now" 
  → tRPC: user.registerForPromotion 
  → Creates PromotionRegistration record
  → Returns success message
  → Button changes to "Registered" state
```

**Database Record:**
- Table: `promotion_registration`
- One registration per user (enforced by unique constraint on `userId`)

---

### 2. Package Purchase Rewards

**When User Buys a Package:**

#### Step 2.1: User Purchases Package
- User goes to stake page
- Selects a package (Trial Node, Silver Node, Gold Node, etc.)
- Clicks "Subscribe"
- System creates `StakingEntry` via `user.createStake` mutation

#### Step 2.2: Automatic Reward Check
After stake entry is created successfully, the system automatically:
1. Checks if user is registered for promotion
2. Checks if promotion is still active (within 14 days of registration)
3. Checks if reward has already been granted (prevents duplicates)
4. Creates voucher if eligible

#### Step 2.3: Voucher Creation
- **Voucher Type**: "package" (stakable)
- **Expiry**: 14 days from creation
- **ROI Validity**: Based on package (Trial = 14 days, others = 30 days)
- **Max Cap**: Based on package type (see reward table below)
- **Status**: "active"
- **User**: Assigned to the purchaser

**Reward Table:**

| Package | Value | ROI Days | Max Cap | Reward Type |
|---------|-------|----------|---------|-------------|
| Trial Node ($10) | $10 | 14 days | No (flushed) | Stakable |
| Bronze Node ($100) | $15 | 30 days | Yes (independent) | Stakable |
| **Silver Node ($250)** | **$30** | **30 days** | **Yes (independent)** | **Stakable** ⭐ |
| Gold Node ($500) | $50 | 30 days | Yes (independent) | Stakable |
| Platinum Node ($1000) | $100 | 30 days | Yes (independent) | Stakable |
| Diamond Node ($2500) | $150 | 30 days | Yes (independent) | Stakable |
| Titan Node ($5000) | $200 | 30 days | Yes (independent) | Stakable |
| Crown Node ($10000) | $250 | 30 days | Yes (independent) | Stakable |
| Elysium Vault ($25000) | $300 | 30 days | Yes (independent) | Stakable |

**Example Flow:**
```
User buys Silver Node ($250)
  → Stake entry created
  → System checks: Is user registered? ✓
  → System checks: Is promotion active? ✓
  → System checks: Reward already granted? ✗
  → System creates $30 voucher (30-day ROI, independent max cap)
  → Voucher expires in 14 days
  → User can use voucher later via "Use Now" button
```

---

### 3. Team Building Rewards

**When Invited Member Activates a Package:**

#### Step 3.1: Invited Member Buys Package
- User invites friends (creates `InvitedMember` records)
- Friend signs up using invite code
- Friend purchases a package
- System creates stake entry for friend

#### Step 3.2: Automatic Team Reward Check
After invited member's stake is created, system automatically:
1. Finds the sponsor (person who invited them)
2. Checks if sponsor is registered for promotion
3. Counts how many of sponsor's invites have activated packages
4. Checks if rewards have already been granted
5. Grants appropriate milestone rewards

#### Step 3.3: Team Milestone Rewards

**Important Rule**: Rewards are ONLY granted when invited members ACTIVATE packages. Just inviting members does NOT grant rewards.

**Milestone 1: 3 Members Activated (Any Package)**
- **Reward**: $15 voucher
- **Type**: "package" (stakable)
- **ROI Days**: 30 days
- **Max Cap**: No (flushed ROI)
- **Requirement**: At least 3 unique invited members must have activated ANY package

**Milestone 2: 5 Members Activated (Trial Node)**
- **Reward**: $5 voucher
- **Type**: "withdraw" (instant withdrawal)
- **Requirement**: At least 5 unique invited members must have activated Trial Node specifically

**Milestone 3: 10 Members Activated (Any Package)**
- **Rewards**: 
  - $25 withdrawable voucher
  - $20 stakable voucher (30-day ROI, independent max cap)
- **Requirement**: At least 10 unique invited members must have activated ANY package

**Milestone 4: 10 Members + 5 Silver Node Focus**
- **Rewards**:
  - $50 withdrawable voucher
  - $30 stakable voucher (30-day ROI, independent max cap)
- **Requirement**: 
  - At least 10 unique invited members activated
  - At least 5 of them activated Silver Node or higher (packageId >= 2)

**Example Flow:**
```
User invites Friend A, Friend B, Friend C
  → All 3 friends activate Trial Node
  → System checks sponsor's invites: 3 activated ✓
  → System grants $15 stakable voucher to sponsor
  → Voucher expires in 14 days

Later, Friend D and Friend E also activate Trial Node
  → System checks: 5 Trial Node activations ✓
  → System grants $5 withdrawable voucher to sponsor
  → Voucher expires in 14 days

More friends activate packages (total 10+)
  → System checks: 10 members activated ✓
  → System grants $25 withdraw + $20 stakable vouchers
  → If 5+ activated Silver Node: Also grants $50 withdraw + $30 stakable
```

---

### 4. Voucher Usage

**When User Uses a Voucher:**

#### Step 4.1: User Clicks "Use Now"
- User goes to voucher page
- Sees promotional vouchers
- Clicks "Use Now" on a voucher

#### Step 4.2: Voucher Validation
System checks:
- Voucher is active
- Voucher is not expired
- Voucher type is "package" (for staking)
- User owns the voucher

#### Step 4.3: Stake Creation from Voucher
- System creates `StakingEntry` using voucher value
- Sets appropriate ROI validity days
- Sets max cap based on voucher type
- Marks voucher as "used"
- Links voucher to stake entry via `appliedToStakeId`

#### Step 4.4: NO Sponsor Benefits
**Important**: When a voucher is used to create a stake:
- ❌ NO direct bonus (5%) to sponsor
- ❌ NO team earning recorded
- ❌ NO transaction record for sponsor
- ✅ Only the user benefits from voucher usage

**Example Flow:**
```
User has $30 Silver Node reward voucher
  → Clicks "Use Now"
  → System validates voucher ✓
  → System creates Trial Node stake entry ($10 value)
  → Stake provides ROI for 30 days with independent max cap
  → Voucher marked as "used"
  → Sponsor gets NO benefit from this voucher usage
```

---

### 5. Promotion Status Checking

**Promotion Active Status:**
- Promotion is active if current date is within 14 days of registration date
- Formula: `currentDate - registrationDate < 14 days`
- After 14 days, promotion ends for that user
- New rewards are NOT granted after promotion ends
- Existing vouchers remain valid until their expiry date

**Promotion End:**
- User can still use previously granted vouchers
- New package purchases after promotion end do NOT grant rewards
- Team rewards stop being granted after promotion ends for sponsor

---

## Database Schema

### PromotionRegistration
```prisma
model PromotionRegistration {
  id            String   @id @default(uuid())
  userId        String   @unique
  promotionType String   @default("prelaunch")
  registeredAt  DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([userId])
  @@index([promotionType])
  @@index([registeredAt])
}
```

### Voucher (relevant fields)
```prisma
model Voucher {
  id              String   @id @default(uuid())
  userId          String?
  code            String?  @unique
  value           Float
  type            String   // "package" | "withdraw"
  title           String
  description     String?
  
  // Promotion-specific
  roiValidityDays Int?
  affectsMaxCap   Boolean  @default(false)
  requiresRealPackage Boolean @default(false)
  
  status          String   @default("active")
  expiresAt       DateTime // 14 days after creation
  usedAt          DateTime?
  appliedToStakeId String?
  
  createdAt       DateTime @default(now())
}
```

---

## API Endpoints

### Registration
- **`user.registerForPromotion`**: Register user for promotion
- **`user.checkPromotionStatus`**: Check if user is registered and promotion status
- **`user.getPromotionRewards`**: Get user's earned rewards summary

### Automatic (Internal)
- **`checkAndGrantPackageReward(userId, packageId)`**: Grants voucher when package purchased
- **`checkAndGrantTeamRewards(sponsorId, activatedUserId)`**: Grants team rewards when member activates
- **`grantPromotionVoucher(userId, rewardConfig)`**: Helper to create promotional vouchers

---

## Important Rules & Constraints

### 1. Duplicate Prevention
- System checks if reward was already granted using:
  - Voucher type
  - Voucher value
  - Description containing reward identifier
  - Created after registration date
- Prevents duplicate rewards for same milestone

### 2. Promotion Window
- Each user has their own 14-day window starting from registration
- Promotions are NOT synchronized globally
- User A registers Day 1 → Promotion ends Day 15
- User B registers Day 5 → Promotion ends Day 19

### 3. Team Rewards Tracking
- Counts UNIQUE users who activated packages
- Multiple packages from same user = still counts as 1 user
- Only counts activations AFTER sponsor's registration date
- Only counts "active" stake entries

### 4. Voucher Expiry
- All promotional vouchers expire 14 days after creation
- Expiry is independent of promotion end date
- Expired vouchers cannot be used

### 5. No Sponsor Benefits from Vouchers
- Voucher usage creates stake entries
- These stake entries do NOT trigger:
  - Direct bonus (5%) to sponsor
  - Team earning records
  - Transaction records for sponsor
- Only real package purchases (from balance) generate sponsor benefits

---

## Example User Journey

### Day 1: Registration
1. User visits promotion page
2. Clicks "Register Now"
3. System registers user (PromotionRegistration created)
4. Countdown timer shows 14 days remaining

### Day 2: First Package Purchase
1. User buys Trial Node ($10)
2. Stake entry created
3. System automatically grants $10 voucher (14-day ROI, flushed)
4. Voucher expires on Day 16
5. User sees voucher in voucher page

### Day 3: Invites Friends
1. User invites 3 friends using invite code
2. Friends sign up (InvitedMember records created)
3. No rewards yet (friends haven't activated packages)

### Day 4-6: Friends Activate Packages
1. Friend A activates Trial Node
2. System checks sponsor's invites: 1 activated (not enough)
3. Friend B activates Trial Node
4. System checks sponsor's invites: 2 activated (not enough)
5. Friend C activates Trial Node
6. System checks sponsor's invites: 3 activated ✓
7. System automatically grants $15 voucher to sponsor
8. Voucher expires on Day 18

### Day 7: Silver Node Purchase
1. User buys Silver Node ($250)
2. Stake entry created
3. System automatically grants $30 voucher (30-day ROI, independent max cap)
4. Voucher expires on Day 21

### Day 8-10: More Friends Activate
1. Friend D activates Trial Node
2. Friend E activates Trial Node
3. System checks: 5 Trial Node activations ✓
4. System automatically grants $5 withdrawable voucher
5. More friends activate (total reaches 10)
6. System grants $25 withdraw + $20 stakable vouchers
7. If 5+ activated Silver Node: Also grants $50 + $30 vouchers

### Day 11: Using Vouchers
1. User goes to voucher page
2. Sees multiple vouchers (package rewards + team rewards)
3. Clicks "Use Now" on $30 Silver Node reward
4. System creates Trial Node stake entry using voucher
5. Sponsor gets NO bonus from this voucher usage
6. User now has active ROI from voucher stake

### Day 15: Promotion Ends
1. User's 14-day promotion window ends
2. New package purchases no longer grant rewards
3. Existing vouchers still valid until their expiry dates
4. Can still use previously granted vouchers

---

## Technical Implementation Details

### File Structure
```
src/
├── lib/
│   ├── promotion/
│   │   └── rewards.ts          # Reward configuration
│   └── voucher/
│       └── generate.ts          # Voucher generation utilities
├── trpc/
│   └── routers/
│       └── user/
│           ├── promotion.ts     # Promotion endpoints & auto-granting
│           ├── staking.ts       # Package purchase (triggers rewards)
│           └── voucher.ts       # Voucher usage (no sponsor benefits)
└── app/
    └── (dashboard)/
        └── (routes)/
            └── promotions/
                └── promo/
                    └── _component/
                        └── HeroSection.tsx  # Registration UI
```

### Key Functions

**`grantPromotionVoucher(userId, rewardConfig)`**
- Checks user registration
- Checks promotion active status
- Prevents duplicate rewards
- Creates voucher with 14-day expiry

**`checkAndGrantPackageReward(userId, packageId)`**
- Called after package purchase
- Gets reward config for package
- Grants voucher if eligible

**`checkAndGrantTeamRewards(sponsorId, activatedUserId)`**
- Called when invited member activates package
- Counts activated members
- Checks milestones (3, 5, 10 members)
- Grants appropriate rewards

---

## Summary

The Pre-Launch Promotion System is an automated reward system that:
1. ✅ Registers users for a 14-day promotion window
2. ✅ Automatically grants vouchers when packages are purchased
3. ✅ Automatically grants team rewards when invites activate packages
4. ✅ Creates vouchers (not stakes) - users choose when to use them
5. ✅ No sponsor benefits from voucher usage
6. ✅ 14-day expiry on all promotional vouchers
7. ✅ Prevents duplicate rewards
8. ✅ Focuses on incentivizing Silver Node purchases

All rewards are automatic, no manual claiming required. Users simply need to register and meet the conditions to receive vouchers.

