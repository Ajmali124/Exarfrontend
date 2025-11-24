# Backend API Inventory

This document lists every backend entry point exposed by the repo so a React Native client can reuse the same backend (mostly tRPC) without guessing. Grouped into tRPC procedures (primary data layer) and traditional REST routes (cron, uploads, CoinPayments, auth bridge).

---

## 1. tRPC Surface (`/api/trpc`)

All procedures live under `appRouter.user.*` (user procedures) or `appRouter.admin.*` (admin procedures) and require an authenticated Better Auth session (see `src/trpc/init.ts:protectedProcedure`). React Native should talk to `/api/trpc` with `@trpc/client` over HTTPS, forwarding the same session cookies the Next.js app receives from `better-auth`. Example RN setup:

```ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './src/trpc/routers/_app';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'https://<your-domain>/api/trpc',
      fetch(url, opts) {
        return fetch(url, {
          ...opts,
          credentials: 'include', // send session cookies from Better Auth
          headers: {
            ...opts?.headers,
            // attach Authorization if you later switch to bearer tokens
          },
        });
      },
    }),
  ],
});
```

### User Router Procedures

#### Profile Operations
| Procedure | Type | Input | Response / Side Effects | Notes & Dependencies |
| --- | --- | --- | --- | --- |
| `user.getProfile` | query | none | `{ id, name, username, email, emailVerified, image, createdAt, updatedAt }` | Prisma `user` table |
| `user.getBasicInfo` | query | none | minimal profile subset incl. nickname, gender, homepage, inviteCode | Used for navbar/dashboard cards |
| `user.updateProfile` | mutation | Partial `{ name?, image?, nickname?, gender?, homepage?, location?, linkEmail? }` (all optional but at least one required) | Updated profile fields, returns same shape as select | Validates URLs/emails w/ Zod |
| `user.getStats` | query | none | `{ accountAge, memberSince, totalTrades, totalVolume, profitLoss }` | Derived stats (trade data placeholders) |

#### Wallet Operations
| Procedure | Type | Input | Response / Side Effects | Notes & Dependencies |
| --- | --- | --- | --- | --- |
| `user.getWalletBalance` | query | none | `{ balance, dailyEarning, latestEarning }` defaults to zeros | Reads `userBalance` |
| `user.getTransactions` | query | none | Last 100 `transactionRecord`s for user | Sorted desc by `createdAt` |

#### Team Operations
| Procedure | Type | Input | Response / Side Effects | Notes & Dependencies |
| --- | --- | --- | --- | --- |
| `user.getTeamMembers` | query | `{ level?, page?, limit? }` level 1-10 | Paginated `{ members, total, page, limit, totalPages }` where each member has invitee info + balances | Recursively walks `invitedMember` tree |
| `user.getTeamStats` | query | none | Array of `{ level, count }` for levels 1-10 | Also recurses `invitedMember` |

#### Staking Operations
| Procedure | Type | Input | Response / Side Effects | Notes & Dependencies |
| --- | --- | --- | --- | --- |
| `user.getStakingPackages` | query | none | `STAKING_PACKAGES` constant | Client uses for package list |
| `user.getStakingEntries` | query | none | Array of active/unstaking stake entries with ROI metrics | Filters old rows missing new fields |
| `user.createStake` | mutation | `{ amount }` (number, must match package amounts) | Creates `stakingEntry`, deducts balance, pays direct 5% sponsor bonus, triggers promotion rewards, returns new entry | Checks balance, uses `$transaction`, uses `invitedMember` sponsor, calls `checkAndGrantPackageReward` & `checkAndGrantTeamRewards` |
| `user.requestUnstake` | mutation | `{ stakeId }` | Marks stake `unstaking`, sets `cooldownEndDate` + request timestamp | 3-day cooldown |
| `user.completeUnstake` | mutation | `{ stakeId }` | Completes unstake once cooldown passed, returns stake plus `{ principalReturn, totalWithdrawal }` | Moves funds from `onStaking` back to `balance` |

#### Deposit Operations
| Procedure | Type | Input | Response / Side Effects | Notes & Dependencies |
| --- | --- | --- | --- | --- |
| `user.generateDepositAddress` | mutation | none | CoinPayments deposit instructions `{ address, paymentId, orderId, payCurrency, payAmount?, minPayAmount, network, contractAddress, currency }` | Calls CoinPayments API, caches address in `coinpaymentsDepositAddress` |

#### Withdrawal Operations
| Procedure | Type | Input | Response / Side Effects | Notes & Dependencies |
| --- | --- | --- | --- | --- |
| `user.getWithdrawalSettings` | query | none | `{ minAmount, minAmountFiat, currency:'USDT', network:'BNB Smart Chain (BEP20)', feeThreshold:30, feePercentage:6, minReceiveAmount }` | Uses `fetchUsdtBscMinimums`, includes fee info (6% fee for withdrawals <$30) |
| `user.requestWithdrawal` | mutation | `{ amount, address }` | `{ withdrawalId, status, amountSent, amountReceived, fee, totalDeduction }` and creates `transactionRecord`, decrements balance | Calls CoinPayments withdraw API, validates balance, calculates fees (6% for <$30, free for $30+) |

#### Voucher Operations
| Procedure | Type | Input | Response / Side Effects | Notes & Dependencies |
| --- | --- | --- | --- | --- |
| `user.getVouchers` | query | `{ status?, type? }` status: `"active" \| "used" \| "expired" \| "all"`, type: `"package" \| "withdraw" \| "futures" \| "bonus" \| "trading_fee"` | Array of vouchers with full details (code, value, type, status, expiresAt, etc.) | Auto-marks expired vouchers |
| `user.getVoucherById` | query | `{ voucherId }` | Single voucher details | Returns `NOT_FOUND` if not found or not owned by user |
| `user.redeemVoucher` | mutation | `{ voucherId, packageId? }` | Marks voucher as used, applies value based on type (withdraw adds to balance, package links to stake) | For package vouchers, `packageId` is required |
| `user.redeemVoucherByCode` | mutation | `{ code, packageId? }` | Assigns unassigned voucher to user, redeems withdraw vouchers immediately, assigns package vouchers for later use | Handles both assigned and unassigned vouchers |
| `user.useVoucherForStake` | mutation | `{ voucherId }` | Creates staking entry directly from package voucher, marks voucher as used, links to stake | Auto-detects package from voucher metadata, handles promotion vouchers with arbitrary values, checks `requiresRealPackage` flag |

#### Promotion Operations
| Procedure | Type | Input | Response / Side Effects | Notes & Dependencies |
| --- | --- | --- | --- | --- |
| `user.registerForPromotion` | mutation | `{ promotionType? }` defaults to `"prelaunch"` | `{ success, alreadyRegistered?, registration, message }` | Creates `promotionRegistration` entry |
| `user.checkPromotionStatus` | query | `{ promotionType? }` | `{ isRegistered, isActive, registration, promotionStart, promotionEnd }` | Checks if user is registered and if promotion is still active |
| `user.getPromotionRewards` | query | none | `{ isRegistered, packageRewards[], teamRewards[], totalRewards, teamStats: { totalInvites, activatedCount, trialNodeCount, silverPlusCount } }` | Returns all vouchers earned during promotion period and team statistics |

### Admin Router Procedures

#### Admin Voucher Operations
| Procedure | Type | Input | Response / Side Effects | Notes & Dependencies |
| --- | --- | --- | --- | --- |
| `admin.voucher.createVouchers` | mutation | `{ value, currency?, type, title, badge?, badgeColor?, description?, linkText?, linkHref?, packageId?, packageName?, expiresAt, quantity, userId?, roiValidityDays?, affectsMaxCap?, requiresRealPackage? }` | `{ vouchers[], count }` | Creates vouchers in bulk (max 100), can be assigned or unassigned. **Note: Currently no admin check - any authenticated user can call this** |
| `admin.voucher.getUnassignedVouchers` | query | `{ status? }` | Array of unassigned vouchers (where `userId` is null) | **Note: Currently no admin check** |

### How the web client calls these today

Representative usages (see files for patterns you can emulate in RN):

**Profile & Wallet:**
- `trpc.user.getBasicInfo.useQuery()` – `src/app/(dashboard)/_components/navbar.tsx`, `.../dashboard/_components/maincard.tsx`
- `trpc.user.getWalletBalance.useQuery()` – `.../dashboard/_components/TotalAssetsCard.tsx`, withdraw/stake flows
- `trpc.user.updateProfile.useMutation()` – `src/app/(dashboard)/(routes)/profile/profile-screen-client.tsx`
- `trpc.user.getTransactions.useQuery()` – Transaction history pages

**Staking:**
- `trpc.user.createStake.useMutation()` / `getStakingPackages` / `getStakingEntries` – `src/app/(dashboard)/(routes)/stake/_components/*`

**Team:**
- `trpc.user.getTeamMembers.useQuery()` / `getTeamStats` – `src/app/(dashboard)/(routes)/team/*`

**Deposits & Withdrawals:**
- `trpc.user.requestWithdrawal.useMutation()` – `.../withdraw/_components/withdrawform.tsx`
- `trpc.user.generateDepositAddress.useMutation()` – `.../deposit/_components/depositform.tsx`
- `trpc.user.getWithdrawalSettings.useQuery()` – Withdrawal form validation

**Vouchers:**
- `trpc.user.getVouchers.useQuery()` – `src/app/(dashboard)/(routes)/voucher/*`
- `trpc.user.redeemVoucherByCode.useMutation()` – Voucher code redemption
- `trpc.user.useVoucherForStake.useMutation()` – Direct stake creation from voucher

**Promotions:**
- `trpc.user.registerForPromotion.useMutation()` – `src/app/(dashboard)/(routes)/promotions/*`
- `trpc.user.checkPromotionStatus.useQuery()` – Promotion status checks
- `trpc.user.getPromotionRewards.useQuery()` – Promotion rewards dashboard

React Native should mirror this shape via `@trpc/client` + React Query (or TanStack Query) hooks if desired; the router/types can be shared by compiling the repo into a package or copying the generated `AppRouter` type.

---

## 2. REST / Next.js Route Handlers

| Route | Method(s) | Auth / Headers | Body & Purpose | Side Effects / Notes |
| --- | --- | --- | --- | --- |
| `/api/trpc` (`src/app/api/trpc/[trpc]/route.ts`) | GET, POST | tRPC handles auth via `protectedProcedure` | Standard tRPC RPC payloads | Entry point for all procedures above |
| `/api/profile/avatar` | POST | Requires Better Auth session cookie (`auth.api.getSession`) | `multipart/form-data` with `file` field (<5 MB). Uploads to Cloudinary `profile-avatars` folder, updates `user.image` | React Native must post FormData and forward cookies or token |
| `/api/coinpayment/ipn` | POST | CoinPayments IPN HMAC header + merchant id | CoinPayments forwarding of deposit notifications | Verifies HMAC, updates `userBalance` + `transactionRecord`; **external system calls this** |
| `/api/daily-roi` | GET | `Authorization: Bearer ${CRON_SECRET}` | No body; invoked by cron | Calls `distributeDailyStakingRewards()`; returns status JSON |
| `/api/team-roi` | GET | `Authorization: Bearer ${CRON_SECRET}` | No body; cron | Calls `distributeTeamEarnings()` |
| `/api/auth/[...all]` | GET, POST | Public (Better Auth handles) | Better Auth handler to issue sessions/tokens | RN can reuse these endpoints for login/signup |

### Env requirements

- `CRON_SECRET` – shared between cron jobs and `/api/daily-roi` & `/api/team-roi`.
- CoinPayments: `COINPAYMENTS_IPN_SECRET`, `COINPAYMENTS_MERCHANT_ID`, `COINPAYMENTS_DEPOSIT_CURRENCY`.
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Better Auth config (see `src/lib/auth.ts`) – defines session cookie name/domain for RN to respect.

---

## 3. React Native Integration Guidance

1. **Auth & Session**  
   - Today, `protectedProcedure` calls `auth.api.getSession({ headers })`, so auth is cookie-based Better Auth. For RN you can:
     - Reuse `/api/auth/[...all]` endpoints to log in/out, then persist the returned cookie(s) using `react-native-cookies` and send them with every `/api/trpc` or REST request (`credentials: 'include'`).
     - Or extend Better Auth to issue bearer tokens and forward them via `Authorization` header; update `protectedProcedure` accordingly if you go that route.

2. **tRPC Client**  
   - Use `@trpc/client` with `httpBatchLink` pointing at `/api/trpc`. Share `AppRouter` types via a common package or a generated `.d.ts`.
   - Wrap calls with TanStack Query if you want caching similar to the web app, or call the client directly.

3. **File Uploads (`/api/profile/avatar`)**  
   - RN must perform a `multipart/form-data` POST with the image file blob and include the Better Auth session cookies.

4. **Deposits / Withdrawals**  
   - Creating deposit addresses and withdrawals flows through tRPC (CoinPayments). Ensure RN UI surfaces the structured response from `generateDepositAddress` and handles validation errors from CoinPayments.
   - On successful deposits, CoinPayments IPN hits `/api/coinpayment/ipn`; RN does not need to call it but should listen for balance updates (e.g., refetch wallet query).

5. **Cron-Only Routes**  
   - `/api/daily-roi` and `/api/team-roi` are not for clients; they require `CRON_SECRET`. Documented here so you don’t accidentally try to call them from RN.

6. **Error Handling**  
   - All tRPC procedures throw `TRPCError` codes (`BAD_REQUEST`, `NOT_FOUND`, `INTERNAL_SERVER_ERROR`). RN client should inspect `.shape.message` (if using `@trpc/client`) for user-facing text.

7. **Endpoint Summary for RN**

| Use Case | Endpoint | Type |
| --- | --- | --- |
| Auth/session | `/api/auth/[...all]` | Better Auth REST handler |
| Main data | `/api/trpc` | tRPC (batched HTTP) |
| Avatar upload | `/api/profile/avatar` | REST POST (multipart) |
| CoinPayments callback | `/api/coinpayment/ipn` | Server-only webhook |
| Cron jobs | `/api/daily-roi`, `/api/team-roi` | Cron-only GET |

8. **Voucher System Notes**
   - Vouchers support multiple types: `package` (for staking), `withdraw` (adds to balance), `futures`, `bonus`, `trading_fee`
   - Package vouchers can be used directly via `useVoucherForStake` or applied during stake creation
   - Withdraw vouchers are automatically redeemed when code is entered (`redeemVoucherByCode`)
   - Vouchers can be assigned to users or left unassigned (for code-based redemption)
   - Promotion vouchers are automatically granted when conditions are met (package purchases, team milestones)

9. **Promotion System Notes**
   - Pre-launch promotion requires registration via `registerForPromotion`
   - Promotion rewards are automatically granted when:
     - User purchases a staking package (package-specific rewards)
     - User's team members activate packages (team milestone rewards: 3 members, 5 trial nodes, 10 members, etc.)
   - All promotion vouchers expire 14 days after creation
   - Team rewards check for unique activated members (not duplicate activations)

---

## 4. React Native Setup & Examples

### Installation

```bash
npm install @trpc/client @trpc/react-query @tanstack/react-query
# For cookie management (Better Auth sessions)
npm install @react-native-cookies/cookies
```

### Option 1: Using React Query Hooks (Recommended)

This approach mirrors the Next.js web app and provides automatic caching, refetching, and loading states.

#### Step 1: Create tRPC Client Setup

```typescript
// lib/trpc-client.ts
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../path/to/your/backend/src/trpc/routers/_app';
import CookieManager from '@react-native-cookies/cookies';

export const trpc = createTRPCReact<AppRouter>();

// Get session cookies from Better Auth
async function getCookies() {
  const cookies = await CookieManager.get('https://your-domain.com');
  // Better Auth typically uses a session cookie - adjust name as needed
  const sessionCookie = cookies['better-auth.session_token'] || cookies['session'];
  return sessionCookie ? `${sessionCookie.name}=${sessionCookie.value}` : '';
}

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'https://your-domain.com/api/trpc',
      async headers() {
        const cookieString = await getCookies();
        return {
          cookie: cookieString,
        };
      },
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include', // Important for cookies
        });
      },
    }),
  ],
});
```

#### Step 2: Setup Provider in App Root

```typescript
// App.tsx or _layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from './lib/trpc-client';
import { useState } from 'react';

export default function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000, // 5 seconds
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {/* Your app components */}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

#### Step 3: Use in Components - Fetching Balance Example

```typescript
// components/WalletBalance.tsx
import { View, Text, ActivityIndicator } from 'react-native';
import { trpc } from '../lib/trpc-client';

export function WalletBalance() {
  // Fetch wallet balance - automatically handles loading, error, and data states
  const { data, isLoading, error, refetch } = trpc.user.getWalletBalance.useQuery();

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator />
        <Text>Loading balance...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>Error: {error.message}</Text>
        <Button onPress={() => refetch()} title="Retry" />
      </View>
    );
  }

  return (
    <View>
      <Text>Balance: ${data?.balance.toFixed(2) || '0.00'} USDT</Text>
      <Text>Daily Earning: ${data?.dailyEarning.toFixed(2) || '0.00'} USDT</Text>
      <Text>Latest Earning: ${data?.latestEarning.toFixed(2) || '0.00'} USDT</Text>
    </View>
  );
}
```

#### More Examples

**Fetching Transactions:**
```typescript
const { data: transactions } = trpc.user.getTransactions.useQuery();
// Returns last 100 transactions
```

**Creating a Stake (Mutation):**
```typescript
const createStake = trpc.user.createStake.useMutation({
  onSuccess: (data) => {
    console.log('Stake created:', data);
    // Refetch balance after successful stake
    utils.user.getWalletBalance.invalidate();
  },
  onError: (error) => {
    console.error('Failed to create stake:', error.message);
  },
});

// Use it:
const handleCreateStake = () => {
  createStake.mutate({ amount: 100 });
};
```

**Fetching Vouchers with Filters:**
```typescript
const { data: vouchers } = trpc.user.getVouchers.useQuery({
  status: 'active',
  type: 'package',
});
```

**Using Utils for Manual Refetch:**
```typescript
const utils = trpc.useUtils();

// Manually refetch balance
const refreshBalance = () => {
  utils.user.getWalletBalance.invalidate();
};
```

### Option 2: Direct Client Usage (Without React Query)

If you prefer not to use React Query hooks, you can call the client directly:

```typescript
// lib/trpc-direct-client.ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../path/to/your/backend/src/trpc/routers/_app';
import CookieManager from '@react-native-cookies/cookies';

async function getCookies() {
  const cookies = await CookieManager.get('https://your-domain.com');
  const sessionCookie = cookies['better-auth.session_token'] || cookies['session'];
  return sessionCookie ? `${sessionCookie.name}=${sessionCookie.value}` : '';
}

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'https://your-domain.com/api/trpc',
      async headers() {
        const cookieString = await getCookies();
        return { cookie: cookieString };
      },
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
});
```

**Usage in Component:**
```typescript
// components/WalletBalance.tsx
import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { trpc } from '../lib/trpc-direct-client';

export function WalletBalance() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBalance() {
      try {
        setLoading(true);
        const data = await trpc.user.getWalletBalance.query();
        setBalance(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBalance();
  }, []);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View>
      <Text>Balance: ${balance?.balance.toFixed(2)} USDT</Text>
    </View>
  );
}
```

### Authentication Flow

After login via Better Auth (`/api/auth/[...all]`), save the session cookie:

```typescript
// After successful login
import CookieManager from '@react-native-cookies/cookies';

async function handleLogin(email: string, password: string) {
  const response = await fetch('https://your-domain.com/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  // Extract cookies from response
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    // Parse and save cookies
    await CookieManager.set('https://your-domain.com', {
      name: 'better-auth.session_token',
      value: extractCookieValue(setCookieHeader),
      domain: 'your-domain.com',
      path: '/',
    });
  }
}
```

### TypeScript Types

To share types between backend and React Native:

1. **Option A:** Export types from backend and import in RN:
```typescript
// In your backend repo
export type { AppRouter } from './src/trpc/routers/_app';

// In React Native
import type { AppRouter } from '@your-org/backend-types';
```

2. **Option B:** Generate types file and copy to RN project:
```bash
# In backend
npx tsc --declaration --emitDeclarationOnly --outDir ./types
# Copy types to RN project
```

Keep this doc synced when adding new procedures or REST routes so mobile/web teams stay aligned.


