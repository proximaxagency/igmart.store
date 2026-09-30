import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUser, requireAuthUser, isDbUser } from "./users";

// ── GET USER TRANSACTIONS ─────────────────────────────────────────────
export const getMyTransactions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!isDbUser(user)) return [];

    return await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

// ── GET USER BALANCES ──────────────────────────────────────────────────
export const getMyBalances = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return { walletBalance: 0, pendingBalance: 0 };

    return {
      walletBalance: user.walletBalance ?? 0,
      pendingBalance: user.pendingBalance ?? 0,
    };
  },
});
