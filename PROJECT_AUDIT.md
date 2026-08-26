# PROJECT_AUDIT.md — IGMart.store Full Repository Audit

**Date**: August 11, 2026  
**Auditor**: Lead Architect & Senior Engineer (IGMart.store)

---

## 1. Existing Architecture
- **Framework**: Next.js 16.3.0 (App Router, Turbopack enabled) + React 19.2.8.
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design System (`styles/tokens.css` & `app/globals.css`).
- **Identity & Auth**: `@clerk/nextjs` (v7.7.1) with server-side middleware protection (`middleware.ts`) and automatic user provisioning hook (`components/providers/UserSync.tsx`).
- **Backend & Database**: Convex (`convex` v1.43.0) with real-time reactive WebSocket subscriptions, `ConvexProviderWithClerk`, and automated JWT identity resolution (`getAuthUser`).
- **Hosting & Deployment**: Vercel production hosting (`igmartstore.vercel.app` & `igmart.store`).

---

## 2. Existing Routes
- **Public**: `/`, `/games`, `/games/[slug]`, `/marketplace`, `/marketplace/[category]`, `/listing/[id]`, `/seller/[username]`, `/guides`, `/guides/[slug]`, `/how-it-works`, `/faq`, `/legal` (cookies, privacy, terms), `/support`, `/support/ticket`, `/login`, `/register`, `/search`, `/sitemap`.
- **Buyer Account**: `/account/orders`, `/account/settings`, `/account/wallet`, `/account/wishlist`, `/checkout`, `/messages`.
- **Seller Center**: `/seller/dashboard`, `/seller/verification`, `/seller/inventory`, `/seller/earnings`, `/seller/analytics`, `/sell`, `/sell/create`.
- **Operations Admin Panel**: `/admin`, `/admin/support`, `/admin/verifications`, `/admin/finance`, `/admin/users`, `/admin/listings`, `/admin/disputes`, `/admin/risk`, `/admin/audit`.

---

## 3. Existing Components
- **Layout**: `Header.tsx`, `Footer.tsx`, `MobileNav.tsx`, `CookieBanner.tsx`, `BackToTop.tsx`.
- **Providers**: `ConvexClientProvider.tsx`, `UserSync.tsx`.
- **UI System**: `StatCard`, `Badge`, `Button`, `SectionHeading`, `ListingCard`, `GameCard`.
- **Home**: `HeroSection.tsx`, `FeaturedGames.tsx`, `TrendingListings.tsx`, `TrustSection.tsx`, `SellCTA.tsx`.

---

## 4. Existing Backend Functions (`convex/`)
- `users.ts`: `getAuthUser`, `requireAuthUser`, `requireRole`, `getCurrentUser`, `syncUser`, `grantAdminAccess`, `updateUserRole`.
- `admin.ts`: `getAdminMetrics`, `listUsersAdmin`, `setUserStatus`, `listAuditLogs`, `listSupportConversations`, `updateListingStatus`, `resolveDispute`, `listPendingVerifications`, `reviewVerification`, `listWithdrawalRequests`, `reviewWithdrawal`.
- `seller.ts`: `submitKYCVerification`, `getKYCStatus`, `addInventoryItem`, `getInventory`, `requestWithdrawal`, `getSellerAnalytics`.
- `orders.ts`: `getMyOrders`, `getOrderById`, `createOrder`.
- `transactions.ts`: `getMyTransactions`, `getMyBalances`.
- `listings.ts`: `getGames`, `getCategories`, `listActiveListings`, `createListing`, `getMyListings`, `updateListing`, `deleteListing`.
- `notifications.ts`: `getMyNotifications`, `markAsRead`, `markAllAsRead`.
- `conversations.ts`: `getOrCreateConversation`, `listMyConversations`, `sendMessage`, `listMessages`.
- `tickets.ts`: `createTicket`, `listMyTickets`, `getTicketDetails`.

---

## 5. Existing Database Tables (`convex/schema.ts`)
1. `users`
2. `games`
3. `categories`
4. `listings`
5. `orders`
6. `conversations`
7. `messages`
8. `supportTickets`
9. `notifications`
10. `reviews`
11. `reports`
12. `auditLogs`
13. `transactions`
14. `guides`
15. `wishlists`
16. `sellerVerifications`
17. `inventoryItems`
18. `withdrawalRequests`
19. `disputeEvidence`
20. `riskSignals`

---

## 6. Existing Authentication Flow
1. User logs in via Clerk (`/login` or `/register`).
2. `ClerkProvider` + `ConvexProviderWithClerk` pass JWT to Convex client.
3. `UserSync.tsx` fires `api.users.syncUser` on sign-in, provisioning/patching the Convex `users` record.
4. If email matches `proximaxagency@gmail.com` or `ADMIN_EMAILS`, role is assigned as `"admin"`.
5. `getAuthUser` derives server-side identity without trusting client inputs.

---

## 7. Audit Findings & Diagnostics

| Category | Finding / Status | Recommendation |
|----------|-----------------|----------------|
| **7. Broken Pages** | Resolved: Stale `throw` statements in `getMyNotifications` and missing `/support` route in `middleware.ts` were fixed. All 41 routes compile cleanly. | Maintain strict fallback error handling in all Convex queries. |
| **8. Console Errors** | Minor non-critical warning regarding `middleware` file naming convention in Next.js 16.3. | Migrate `middleware.ts` to `proxy` if requested in future refactors. |
| **9. TypeScript Errors** | 0 build/typecheck errors (`npm run build` passes 100%). | Keep `npx convex codegen` in sync whenever schema changes. |
| **10. Dependency Problems** | Dependencies are up to date (React 19, Next.js 16.3, Convex 1.43). | None. |
| **11. Missing Functionality** | Formal RBAC roles table (`roles`, `permissions`), dynamic `gameAttributeDefinitions` for listing form builder, webhook idempotency handler, offer scoring algorithm. | Implement according to Master Implementation Plan. |
| **12. Duplicate Functionality** | Minor duplicate email check helper in `users.ts` previously fixed. | Keep helper functions DRY in `convex/users.ts`. |
| **13. Security Risks** | Need to ensure financial transactions use strict server-calculated ledger entries rather than direct client balance updates. | Enforce immutable ledger entries in `transactions` table. |
| **14. Performance** | Page generation completes in 850ms across 41 routes. | Use indexed queries and pagination on high-volume lists. |
| **15. Migration Strategy** | Incremental enhancement: Maintain working routes while introducing dynamic game attributes, offer ranking engine, and ledger transaction tracking. | Proceed with multi-role RBAC, ledger security, and QA loops. |
