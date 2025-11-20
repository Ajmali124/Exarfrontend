# Backend API Inventory

This document lists every backend entry point exposed by the repo so a React Native client can reuse the same backend (mostly tRPC) without guessing. Grouped into tRPC procedures (primary data layer) and traditional REST routes (cron, uploads, CoinPayments, auth bridge).

---

## 1. tRPC Surface (`/api/trpc`)

All procedures live under `appRouter.user.*` and require an authenticated Better Auth session (see `src/trpc/init.ts:protectedProcedure`). React Native should talk to `/api/trpc` with `@trpc/client` over HTTPS, forwarding the same session cookies the Next.js app receives from `better-auth`. Example RN setup:

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

| Procedure | Type | Input | Response / Side Effects | Notes & Dependencies |
| --- | --- | --- | --- | --- |
| `user.getProfile` | query | none | `{ id, name, username, email, emailVerified, image, createdAt, updatedAt }` | Prisma `user` table |
| `user.getBasicInfo` | query | none | minimal profile subset incl. nickname, gender, homepage, inviteCode | Used for navbar/dashboard cards |
| `user.updateProfile` | mutation | Partial `{ name?, image?, nickname?, gender?, homepage?, location?, linkEmail? }` (all optional but at least one required) | Updated profile fields, returns same shape as select | Validates URLs/emails w/ Zod |
| `user.getStats` | query | none | `{ accountAge, memberSince, totalTrades, totalVolume, profitLoss }` | Derived stats (trade data placeholders) |
| `user.getWalletBalance` | query | none | `{ balance, dailyEarning, latestEarning }` defaults to zeros | Reads `userBalance` |
| `user.getTransactions` | query | none | Last 100 `transactionRecord`s for user | Sorted desc by `createdAt` |
| `user.getTeamMembers` | query | `{ level?, page?, limit? }` level 1-10 | Paginated `{ members, total, page, limit, totalPages }` where each member has invitee info + balances | Recursively walks `invitedMember` tree |
| `user.getTeamStats` | query | none | Array of `{ level, count }` for levels 1-10 | Also recurses `invitedMember` |
| `user.getStakingPackages` | query | none | `STAKING_PACKAGES` constant | Client uses for package list |
| `user.getStakingEntries` | query | none | Array of active/unstaking stake entries with ROI metrics | Filters old rows missing new fields |
| `user.createStake` | mutation | `{ amount }` (number, must match package amounts) | Creates `stakingEntry`, deducts balance, pays direct 5% sponsor bonus, returns new entry | Checks balance, uses `$transaction`, uses `invitedMember` sponsor |
| `user.requestUnstake` | mutation | `{ stakeId }` | Marks stake `unstaking`, sets `cooldownEndDate` + request timestamp | 3-day cooldown |
| `user.completeUnstake` | mutation | `{ stakeId }` | Completes unstake once cooldown passed, returns stake plus `{ principalReturn, totalWithdrawal }` | Moves funds from `onStaking` back to `balance` |
| `user.generateDepositAddress` | mutation | none | CoinPayments deposit instructions `{ address, paymentId, orderId, payCurrency, payAmount?, minPayAmount, network, contractAddress, currency }` | Calls CoinPayments API, caches address in `coinpaymentsDepositAddress` |
| `user.getWithdrawalSettings` | query | none | `{ minAmount, minAmountFiat, currency:'USDT', network:'BNB Smart Chain (BEP20)' }` | Uses `fetchUsdtBscMinimums` |
| `user.requestWithdrawal` | mutation | `{ amount, address }` | `{ withdrawalId, status }` and creates `transactionRecord`, decrements balance | Calls CoinPayments withdraw API, validates balance |

### How the web client calls these today

Representative usages (see files for patterns you can emulate in RN):

- `trpc.user.getBasicInfo.useQuery()` – `src/app/(dashboard)/_components/navbar.tsx`, `.../dashboard/_components/maincard.tsx`
- `trpc.user.getWalletBalance.useQuery()` – `.../dashboard/_components/TotalAssetsCard.tsx`, withdraw/stake flows
- `trpc.user.updateProfile.useMutation()` – `src/app/(dashboard)/(routes)/profile/profile-screen-client.tsx`
- `trpc.user.createStake.useMutation()` / `getStakingPackages` / `getStakingEntries` – `src/app/(dashboard)/(routes)/stake/_components/*`
- `trpc.user.getTeamMembers.useQuery()` / `getTeamStats` – `src/app/(dashboard)/(routes)/team/*`
- `trpc.user.requestWithdrawal.useMutation()` – `.../withdraw/_components/withdrawform.tsx`
- `trpc.user.generateDepositAddress.useMutation()` – `.../deposit/_components/depositform.tsx`

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

Keep this doc synced when adding new procedures or REST routes so mobile/web teams stay aligned.


