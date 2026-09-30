# IGMART.STORE — Production Debugging Log

## ROOT CAUSE: /support crashes after 2–3 seconds

### Problem
`/support` initially renders (static HTML), then after 2–3 seconds the React hydration kicks in.
The **Header** component is loaded globally (in `app/layout.tsx`) and runs **on every page**.

Inside `Header.tsx`, line 28:
```tsx
const notifications = useQuery(api.notifications.getMyNotifications, clerkUser ? {} : "skip");
```

When a **logged-out user** visits `/support`, `clerkUser` is initially `null` (correct), so the query is "skip".

BUT: The `ConvexClientProvider` calls:
```tsx
throw new Error("Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable");
```
**at module level** (line 24 in ConvexClientProvider.tsx).

This `throw` runs during module evaluation. In production on Vercel, if `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is not set as an env var in the Vercel dashboard, this crashes the **entire React tree** — wiping the page.

### Evidence
- `/support` is public — no auth required in middleware
- The page renders its static HTML initially (SSR works)
- 2-3 seconds later, React hydration begins loading client-side JavaScript
- The JS chunk containing `ConvexClientProvider` evaluates
- `throw new Error(...)` crashes the entire client-side React tree
- Chrome shows "This page couldn't load" because all JS has crashed

### Supporting Issues Found
1. **No global `error.tsx`** — no fallback for uncaught exceptions
2. **No `loading.tsx` files** — no loading states
3. **No `not-found.tsx`** — missing 404 page
4. **`/login` and `/register`** routes were missing (blank page shown)
5. **Middleware file convention deprecated** — `middleware.ts` should become `proxy.ts` in Next.js 16
6. **`/support` page** declared as `"use client"` but rendered in layout that is a server component — works fine
7. **Messages page** calls `useQuery(api.conversations.listMyConversations)` without auth guard — the Convex query throws `Unauthorized` but the error propagates to the UI without a proper catch

---

## Fixes Applied

### Phase 1 — ConvexClientProvider module-level throw removed
- Changed from `throw new Error(...)` to controlled warning + conditional render
- Provider now gracefully degrades if env vars are missing

### Phase 2 — Global Error Boundary
- Created `app/error.tsx` — catches runtime React errors
- Created `app/global-error.tsx` — catches root layout errors
- Created `app/not-found.tsx` — 404 page

### Phase 3 — Loading States
- Created `app/loading.tsx` — root loading skeleton

### Phase 4 — Missing Routes
- Created `app/login/page.tsx` — Clerk SignIn modal
- Created `app/register/page.tsx` — Clerk SignUp modal  
- Created `app/how-it-works/page.tsx`
- Created `app/account/wishlist/page.tsx`
- Created `app/support/ticket/page.tsx`

### Phase 5 — Messages page auth guard
- Added `isLoaded` and `user` checks before rendering Convex-dependent UI

### Phase 6 — Build verified
- `npm run build` passes with 31 routes
- TypeScript passes
- No errors

### Phase 7 — Deployment
- Deployed to Vercel via CLI
- readyState: READY
