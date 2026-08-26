import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUser, requireAuthUser, isDbUser } from "./users";

// ── KYC VERIFICATION SUBMISSION ────────────────────────────────────────
export const submitKYCVerification = mutation({
  args: {
    fullName: v.string(),
    country: v.string(),
    idType: v.string(),
    idDocumentUrl: v.string(),
    addressProofUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("sellerVerifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        fullName: args.fullName,
        country: args.country,
        idType: args.idType,
        idDocumentUrl: args.idDocumentUrl,
        addressProofUrl: args.addressProofUrl,
        status: "pending",
        updatedAt: now,
      });
      return existing._id;
    }

    const verificationId = await ctx.db.insert("sellerVerifications", {
      userId: user._id,
      fullName: args.fullName,
      country: args.country,
      idType: args.idType,
      idDocumentUrl: args.idDocumentUrl,
      addressProofUrl: args.addressProofUrl,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return verificationId;
  },
});

// ── GET SELLER KYC STATUS ──────────────────────────────────────────────
export const getKYCStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!isDbUser(user)) return null;

    return await ctx.db
      .query("sellerVerifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
  },
});

// ── INVENTORY VAULT: ADD DIGITAL STOCK ITEM ─────────────────────────────
export const addInventoryItem = mutation({
  args: {
    listingId: v.id("listings"),
    secretData: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);

    const item = await ctx.db.insert("inventoryItems", {
      sellerId: user._id,
      listingId: args.listingId,
      secretData: args.secretData,
      status: "available",
      createdAt: Date.now(),
    });

    return item;
  },
});

// ── INVENTORY VAULT: GET SELLER STOCK ──────────────────────────────────
export const getInventory = query({
  args: {
    listingId: v.optional(v.id("listings")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!isDbUser(user)) return [];

    if (args.listingId) {
      return await ctx.db
        .query("inventoryItems")
        .withIndex("by_listing", (q) => q.eq("listingId", args.listingId!))
        .collect();
    }

    return await ctx.db
      .query("inventoryItems")
      .withIndex("by_seller", (q) => q.eq("sellerId", user._id))
      .order("desc")
      .take(100);
  },
});

// ── WITHDRAWAL REQUEST ────────────────────────────────────────────────
export const requestWithdrawal = mutation({
  args: {
    amount: v.number(),
    method: v.union(v.literal("bank"), v.literal("payoneer"), v.literal("skrill"), v.literal("crypto")),
    payoutDetails: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);

    const available = user.walletBalance ?? 0;
    if (args.amount <= 0 || args.amount > available) {
      throw new Error("Insufficient available balance for withdrawal");
    }

    const now = Date.now();

    // Deduct available balance and record pending withdrawal
    await ctx.db.patch(user._id, {
      walletBalance: available - args.amount,
      updatedAt: now,
    });

    const requestId = await ctx.db.insert("withdrawalRequests", {
      userId: user._id,
      amount: args.amount,
      method: args.method,
      payoutDetails: args.payoutDetails,
      status: "pending",
      createdAt: now,
    });

    // Record ledger transaction
    await ctx.db.insert("transactions", {
      userId: user._id,
      type: "withdrawal",
      amount: -args.amount,
      currency: "USD",
      status: "pending",
      description: `Withdrawal request via ${args.method.toUpperCase()}`,
      createdAt: now,
    });

    return requestId;
  },
});

// ── SELLER ANALYTICS & STATS ──────────────────────────────────────────
export const getSellerAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!isDbUser(user)) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        activeListingsCount: 0,
        totalViews: 0,
        rating: 5.0,
        sellerLevel: "Starter",
      };
    }

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_seller", (q) => q.eq("sellerId", user._id))
      .collect();

    const listings = await ctx.db
      .query("listings")
      .withIndex("by_seller", (q) => q.eq("sellerId", user._id))
      .collect();

    const totalRevenue = orders
      .filter((o) => o.status === "completed" || o.status === "delivered")
      .reduce((sum, o) => sum + o.price, 0);

    const activeListingsCount = listings.filter((l) => l.status === "active").length;
    const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);

    return {
      totalRevenue,
      totalOrders: orders.length,
      activeListingsCount,
      totalViews,
      rating: (user as any).rating ?? 5.0,
      sellerLevel: (user as any).isVerified ? "Pro" : "Starter",
    };
  },
});
