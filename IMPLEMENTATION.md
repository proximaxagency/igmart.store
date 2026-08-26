# IMPLEMENTATION.md — IGMart.store System Implementation Reference

## Architecture Stack
- **Frontend**: Next.js 16.3 (App Router, Turbopack) + React 19.2 + Tailwind CSS v4.
- **Authentication**: Clerk (`@clerk/nextjs` v7.7.1) + Convex JWT Integration (`ConvexProviderWithClerk`).
- **Database & Server Logic**: Convex reactive subscriptions (`convex` v1.43.0).
- **Deployment**: Vercel (`igmartstore.vercel.app` & `igmart.store`).

## Key Subsystems
1. **User Identity & Provisioning**:
   - `components/providers/UserSync.tsx` executes `api.users.syncUser` upon Clerk login.
   - Admin email matcher automatically assigns `role: "admin"` to `proximaxagency@gmail.com`.

2. **Order & Escrow System**:
   - `convex/orders.ts` handles order creation, status transitions, and seller notifications.
   - Financial balances use immutable ledger transactions in `transactions` table.

3. **Seller Inventory Vault**:
   - `convex/seller.ts` manages credentials and key stock. Items marked `available` are reserved and delivered automatically upon order payment.

4. **Live Chat Support System**:
   - `app/admin/support/page.tsx` & `app/messages/page.tsx` subscribe to Convex `conversations` and `messages` for instant real-time messaging.

5. **Security & Permission Guards**:
   - `app/admin/layout.tsx` enforces strict 403 RBAC permission barrier for non-admin visitors.
