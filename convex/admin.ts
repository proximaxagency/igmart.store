import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUser, requireAuthUser, requireRole } from "./users";


// ── GET ADMIN DASHBOARD OVERVIEW METRICS ────────────────────────────────
export const getAdminMetrics = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return { totalUsers: 0, activeSellers: 0, totalOrders: 0, gmv: 0, activeListings: 0, openDisputes: 0, openTickets: 0 };
    }

    const users = await ctx.db.query("users").collect();
    const orders = await ctx.db.query("orders").collect();
    const activeListings = await ctx.db.query("listings").withIndex("by_status", (q) => q.eq("status", "active")).collect();
    const tickets = await ctx.db.query("supportTickets").collect();

    const gmv = orders.filter((o) => ["completed","delivered","paid"].includes(o.status)).reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalUsers: users.length,
      activeSellers: users.filter((u) => u.role === "seller" && u.status === "active").length,
      totalOrders: orders.length,
      gmv,
      activeListings: activeListings.length,
      openDisputes: orders.filter((o) => o.status === "disputed").length,
      openTickets: tickets.filter((t) => t.status === "open" || t.status === "assigned").length,
    };
  },
});

// ── LIST USERS (ADMIN) — SECURITY: requires staff role ──────────────────
export const listUsersAdmin = query({
  args: {
    roleFilter: v.optional(v.string()),
    statusFilter: v.optional(v.string()),
    searchTerm: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await getAuthUser(ctx);
    if (!actor || !["admin","super_admin","moderator","support_agent"].includes(actor.role)) return [];

    const pageSize = Math.min(args.limit ?? 100, 200);
    let users = await ctx.db.query("users").order("desc").take(pageSize);
    if (args.roleFilter) users = users.filter((u) => u.role === args.roleFilter);
    if (args.statusFilter) users = users.filter((u) => u.status === args.statusFilter);
    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      users = users.filter((u) =>
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.displayName?.toLowerCase().includes(term)
      );
    }
    return users;
  },
});

// ── BAN / SUSPEND / RESTORE USER ───────────────────────────────────────
export const setUserStatus = mutation({
  args: {
    targetUserId: v.id("users"),
    status: v.union(v.literal("active"), v.literal("suspended"), v.literal("banned")),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin", "super_admin", "moderator"]);
    const target = await ctx.db.get(args.targetUserId);
    if (!target) throw new Error("Target user not found");
    if (target.role === "super_admin") throw new Error("Cannot modify a super_admin account");

    const now = Date.now();
    await ctx.db.patch(args.targetUserId, { status: args.status, updatedAt: now });

    if (args.status === "suspended" || args.status === "banned") {
      await ctx.db.insert("notifications", {
        userId: args.targetUserId,
        type: "security_alert",
        title: args.status === "banned" ? "Your account has been banned" : "Your account has been suspended",
        body: `Reason: ${args.reason}. Contact support if you believe this is a mistake.`,
        link: "/support",
        isRead: false,
        createdAt: now,
      });
    }

    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      action: `user.status_${args.status}`,
      targetType: "user",
      targetId: args.targetUserId,
      metadata: { reason: args.reason, previousStatus: target.status },
      createdAt: now,
    });
    return true;
  },
});

// ── LIST IMMUTABLE AUDIT LOGS ──────────────────────────────────────────
export const listAuditLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) return [];
    const pageSize = Math.min(args.limit ?? 100, 200);
    const logs = await ctx.db.query("auditLogs").withIndex("by_createdAt").order("desc").take(pageSize);
    const hydrated = [];
    for (const log of logs) {
      const actor = await ctx.db.get(log.actorId);
      hydrated.push({ ...log, actorName: actor?.displayName || actor?.username || "System", actorRole: actor?.role });
    }
    return hydrated;
  },
});

// ── LIST SUPPORT CONVERSATIONS — SECURITY: staff only ──────────────────
export const listSupportConversations = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const actor = await getAuthUser(ctx);
    if (!actor || !["admin","super_admin","support_agent","moderator"].includes(actor.role)) return [];

    const pageSize = Math.min(args.limit ?? 100, 200);
    const conversations = await ctx.db.query("conversations").withIndex("by_updatedAt").order("desc").take(pageSize);

    const hydrated = [];
    for (const conv of conversations) {
      let customerUser = null;
      for (const pId of conv.participants) {
        const p = await ctx.db.get(pId);
        if (p && p.role !== "admin" && p.role !== "support_agent") { customerUser = p; break; }
      }
      hydrated.push({
        ...conv,
        customerName: customerUser?.displayName || customerUser?.username || "Gamer",
        customerAvatar: customerUser?.avatarUrl || null,
        customerRole: customerUser?.role || "buyer",
      });
    }
    return hydrated;
  },
});

// ── ADMIN MODERATE LISTING ─────────────────────────────────────────────
export const updateListingStatus = mutation({
  args: {
    listingId: v.id("listings"),
    status: v.union(v.literal("active"), v.literal("rejected"), v.literal("removed"), v.literal("paused")),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin", "super_admin", "moderator"]);
    const now = Date.now();
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");

    await ctx.db.patch(args.listingId, { status: args.status, updatedAt: now });

    if (args.status === "rejected") {
      await ctx.db.insert("notifications", {
        userId: listing.sellerId,
        type: "listing_rejected",
        title: "Your listing was rejected",
        body: args.reason || "Your listing was rejected by our moderation team. Please review our guidelines and resubmit.",
        link: "/seller/dashboard",
        isRead: false,
        createdAt: now,
      });
    } else if (args.status === "active") {
      await ctx.db.insert("notifications", {
        userId: listing.sellerId,
        type: "listing_approved",
        title: "Your listing is now live!",
        body: `"${listing.title}" has been approved and is now visible on the marketplace.`,
        link: `/listing/${listing._id}`,
        isRead: false,
        createdAt: now,
      });
    }

    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      action: `listing.${args.status}`,
      targetType: "listing",
      targetId: args.listingId,
      metadata: { reason: args.reason },
      createdAt: now,
    });
    return true;
  },
});

// ── ADMIN RESOLVE DISPUTE — proper wallet credits ──────────────────────
export const resolveDispute = mutation({
  args: {
    orderId: v.id("orders"),
    resolution: v.union(v.literal("refund_buyer"), v.literal("release_to_seller")),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin", "super_admin", "moderator"]);
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (order.status !== "disputed") throw new Error("Order is not in disputed status");

    const now = Date.now();
    const newStatus = args.resolution === "refund_buyer" ? "refunded" : "completed";
    await ctx.db.patch(args.orderId, { status: newStatus, completedAt: now });

    if (args.resolution === "refund_buyer") {
      const buyer = await ctx.db.get(order.buyerId);
      if (buyer) {
        await ctx.db.patch(buyer._id, { walletBalance: (buyer.walletBalance ?? 0) + order.totalAmount, updatedAt: now });
        await ctx.db.insert("transactions", {
          userId: buyer._id, orderId: order._id, type: "refund",
          amount: order.totalAmount, currency: "USD", status: "completed",
          description: `Dispute refund — Order #${order._id.slice(-6).toUpperCase()}`,
          createdAt: now,
        });
        await ctx.db.insert("notifications", {
          userId: buyer._id, type: "order_updated",
          title: "Dispute resolved — Refund issued",
          body: `$${order.totalAmount.toFixed(2)} refunded for order #${order._id.slice(-6).toUpperCase()}.`,
          link: "/account/wallet", isRead: false, createdAt: now,
        });
      }
    } else {
      const seller = await ctx.db.get(order.sellerId);
      if (seller) {
        const sellerEarnings = order.price - order.feeAmount;
        await ctx.db.patch(seller._id, { walletBalance: (seller.walletBalance ?? 0) + sellerEarnings, updatedAt: now });
        await ctx.db.insert("transactions", {
          userId: seller._id, orderId: order._id, type: "payment_released",
          amount: sellerEarnings, currency: "USD", status: "completed",
          description: `Dispute resolved — funds released for order #${order._id.slice(-6).toUpperCase()}`,
          createdAt: now,
        });
        await ctx.db.insert("notifications", {
          userId: seller._id, type: "payment_success",
          title: "Dispute resolved — Payment released",
          body: `$${sellerEarnings.toFixed(2)} released for order #${order._id.slice(-6).toUpperCase()}.`,
          link: "/seller/earnings", isRead: false, createdAt: now,
        });
      }
    }

    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      action: `dispute.${args.resolution}`,
      targetType: "order",
      targetId: args.orderId,
      metadata: { reason: args.reason, resolution: args.resolution, amount: order.totalAmount },
      createdAt: now,
    });
    return true;
  },
});

// ── LIST PENDING KYC VERIFICATIONS ─────────────────────────────────────
export const listPendingVerifications = query({
  args: { statusFilter: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const actor = await getAuthUser(ctx);
    if (!actor || !["admin","super_admin","moderator"].includes(actor.role)) return [];

    const status = (args.statusFilter as any) ?? "pending";
    const verifications = await ctx.db.query("sellerVerifications").withIndex("by_status", (q) => q.eq("status", status)).order("desc").take(50);

    const hydrated = [];
    for (const v of verifications) {
      const u = await ctx.db.get(v.userId);
      hydrated.push({ ...v, username: u?.username || "Seller", userEmail: u?.email || "" });
    }
    return hydrated;
  },
});

// ── REVIEW SELLER KYC VERIFICATION ─────────────────────────────────────
export const reviewVerification = mutation({
  args: {
    verificationId: v.id("sellerVerifications"),
    status: v.union(v.literal("approved"), v.literal("rejected"), v.literal("more_info_needed")),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin", "super_admin"]);
    const verification = await ctx.db.get(args.verificationId);
    if (!verification) throw new Error("Verification application not found");

    const now = Date.now();
    await ctx.db.patch(args.verificationId, { status: args.status, adminNotes: args.adminNotes, updatedAt: now });

    if (args.status === "approved") {
      await ctx.db.patch(verification.userId, { isVerified: true, sellerSince: now, role: "seller", updatedAt: now });
      await ctx.db.insert("notifications", {
        userId: verification.userId, type: "listing_approved",
        title: "Identity Verified — Seller Status Unlocked!",
        body: "Congratulations! Your identity has been verified. You now have full seller privileges.",
        link: "/seller/dashboard", isRead: false, createdAt: now,
      });
    } else if (args.status === "rejected") {
      await ctx.db.insert("notifications", {
        userId: verification.userId, type: "security_alert",
        title: "KYC Verification — Action Required",
        body: args.adminNotes || "Your verification was not approved. Please review and resubmit with valid documents.",
        link: "/seller/verification", isRead: false, createdAt: now,
      });
    }

    await ctx.db.insert("auditLogs", {
      actorId: admin._id, action: `seller.kyc_${args.status}`,
      targetType: "sellerVerification", targetId: args.verificationId,
      metadata: { notes: args.adminNotes }, createdAt: now,
    });
    return true;
  },
});

// ── LIST PENDING WITHDRAWALS ───────────────────────────────────────────
export const listWithdrawalRequests = query({
  args: { statusFilter: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const actor = await getAuthUser(ctx);
    if (!actor || !["admin","super_admin"].includes(actor.role)) return [];

    const status = (args.statusFilter as any) ?? "pending";
    const withdrawals = await ctx.db.query("withdrawalRequests").withIndex("by_status", (q) => q.eq("status", status)).order("desc").take(50);
    const hydrated = [];
    for (const w of withdrawals) {
      const u = await ctx.db.get(w.userId);
      hydrated.push({ ...w, username: u?.username || "Seller", userEmail: u?.email || "" });
    }
    return hydrated;
  },
});

// ── REVIEW WITHDRAWAL REQUEST ──────────────────────────────────────────
export const reviewWithdrawal = mutation({
  args: {
    withdrawalId: v.id("withdrawalRequests"),
    status: v.union(v.literal("completed"), v.literal("rejected")),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin", "super_admin"]);
    const withdrawal = await ctx.db.get(args.withdrawalId);
    if (!withdrawal) throw new Error("Withdrawal request not found");
    if (withdrawal.status !== "pending") throw new Error("Withdrawal already processed");

    const now = Date.now();
    await ctx.db.patch(args.withdrawalId, { status: args.status, processedAt: now });

    if (args.status === "rejected") {
      const seller = await ctx.db.get(withdrawal.userId);
      if (seller) {
        await ctx.db.patch(seller._id, { walletBalance: (seller.walletBalance ?? 0) + withdrawal.amount, updatedAt: now });
        await ctx.db.insert("transactions", {
          userId: seller._id, type: "deposit", amount: withdrawal.amount, currency: "USD", status: "completed",
          description: `Withdrawal rejected — $${withdrawal.amount.toFixed(2)} returned to wallet`,
          createdAt: now,
        });
      }
      await ctx.db.insert("notifications", {
        userId: withdrawal.userId, type: "payment_success",
        title: "Withdrawal Request Rejected",
        body: args.adminNote || `Your withdrawal of $${withdrawal.amount.toFixed(2)} was rejected and returned to your wallet.`,
        link: "/seller/earnings", isRead: false, createdAt: now,
      });
    } else {
      await ctx.db.insert("transactions", {
        userId: withdrawal.userId, type: "withdrawal", amount: -withdrawal.amount, currency: "USD", status: "completed",
        description: `Payout processed via ${withdrawal.method.toUpperCase()} — $${withdrawal.amount.toFixed(2)}`,
        createdAt: now,
      });
      await ctx.db.insert("notifications", {
        userId: withdrawal.userId, type: "payment_success",
        title: "Payout Sent!",
        body: `$${withdrawal.amount.toFixed(2)} has been sent via ${withdrawal.method.toUpperCase()}. Allow 1-3 business days.`,
        link: "/seller/earnings", isRead: false, createdAt: now,
      });
    }

    await ctx.db.insert("auditLogs", {
      actorId: admin._id, action: `withdrawal.${args.status}`,
      targetType: "withdrawalRequest", targetId: args.withdrawalId,
      metadata: { amount: withdrawal.amount, method: withdrawal.method, note: args.adminNote },
      createdAt: now,
    });
    return true;
  },
});

// ── LIST RISK SIGNALS ──────────────────────────────────────────────────
export const listRiskSignals = query({
  args: { unresolvedOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const actor = await getAuthUser(ctx);
    if (!actor || !["admin","super_admin","moderator"].includes(actor.role)) return [];
    const signals = await ctx.db.query("riskSignals").order("desc").take(100);
    const filtered = args.unresolvedOnly ? signals.filter((s) => !s.isResolved) : signals;
    const hydrated = [];
    for (const s of filtered) {
      const user = await ctx.db.get(s.targetUserId);
      hydrated.push({ ...s, username: user?.username || "Unknown", userEmail: user?.email || "" });
    }
    return hydrated;
  },
});

// ── RESOLVE RISK SIGNAL ────────────────────────────────────────────────
export const resolveRiskSignal = mutation({
  args: { signalId: v.id("riskSignals") },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin", "super_admin", "moderator"]);
    await ctx.db.patch(args.signalId, { isResolved: true });
    await ctx.db.insert("auditLogs", {
      actorId: admin._id, action: "risk.signal_resolved",
      targetType: "riskSignal", targetId: args.signalId, createdAt: Date.now(),
    });
    return true;
  },
});

// ── LIST DISPUTED ORDERS ───────────────────────────────────────────────
export const listDisputedOrders = query({
  args: {},
  handler: async (ctx) => {
    const actor = await getAuthUser(ctx);
    if (!actor || !["admin","super_admin","moderator"].includes(actor.role)) return [];
    const orders = await ctx.db.query("orders").withIndex("by_status", (q) => q.eq("status", "disputed")).order("desc").take(50);
    const hydrated = [];
    for (const order of orders) {
      const buyer = await ctx.db.get(order.buyerId);
      const seller = await ctx.db.get(order.sellerId);
      const listing = await ctx.db.get(order.listingId);
      hydrated.push({
        ...order,
        buyerName: buyer?.displayName || buyer?.username || "Buyer",
        sellerName: seller?.displayName || seller?.username || "Seller",
        listingTitle: listing?.title || "Gaming Item",
      });
    }
    return hydrated;
  },
});

// ── ADMIN LISTING REVIEW QUEUE ────────────────────────────────────────────

export const listPendingListings = query({
  args: {
    status: v.optional(v.union(
      v.literal("pending_review"),
      v.literal("active"),
      v.literal("rejected"),
      v.literal("removed"),
      v.literal("paused"),
    )),
    excludeSeeded: v.optional(v.boolean()), // default true — hides seed/dummy data
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user || (user.role !== "admin" && user.role !== "super_admin" && user.role !== "moderator")) {
      throw new Error("Forbidden");
    }

    const filterStatus = args.status ?? "pending_review";
    const shouldExcludeSeeded = args.excludeSeeded !== false; // true unless explicitly set false

    const listings = await ctx.db.query("listings")
      .withIndex("by_status", (q) => q.eq("status", filterStatus))
      .order("desc")
      .take(500); // take more so we can filter after

    // Filter out seed data unless admin opts in
    const filtered = shouldExcludeSeeded
      ? listings.filter((l) => !l.isSeeded)
      : listings;

    const hydrated = [];
    for (const listing of filtered.slice(0, 100)) {
      const seller = await ctx.db.get(listing.sellerId);
      const game = await ctx.db.get(listing.gameId);
      hydrated.push({
        ...listing,
        sellerName: seller?.displayName || seller?.username || "Unknown Seller",
        sellerEmail: seller?.email || "",
        sellerIsVerified: seller?.isVerified || false,
        sellerRating: seller?.rating || 0,
        gameName: game?.name || "Unknown Game",
      });
    }
    return hydrated;
  },
});

export const approveListing = mutation({
  args: {
    listingId: v.id("listings"),
    badge: v.optional(v.union(v.literal("HOT"), v.literal("SALE"), v.literal("POPULAR"), v.literal("NEW"))),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin", "super_admin", "moderator"]);

    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");
    if (listing.status !== "pending_review") throw new Error("Listing is not pending review");

    await ctx.db.patch(args.listingId, {
      status: "active",
      badge: args.badge ?? listing.badge,
      updatedAt: Date.now(),
    });

    // Notify the seller
    await ctx.db.insert("notifications", {
      userId: listing.sellerId,
      type: "listing_approved",
      title: "🎉 Listing Approved!",
      body: `Your listing "${listing.title.substring(0, 60)}" has been approved and is now live on the marketplace.`,
      link: `/listing/${listing._id}`,
      isRead: false,
      createdAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      action: "listing.approve",
      targetType: "listing",
      targetId: args.listingId,
      metadata: { title: listing.title },
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const rejectListing = mutation({
  args: {
    listingId: v.id("listings"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin", "super_admin", "moderator"]);

    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");

    await ctx.db.patch(args.listingId, {
      status: "rejected",
      updatedAt: Date.now(),
    });

    // Notify the seller with the reason
    await ctx.db.insert("notifications", {
      userId: listing.sellerId,
      type: "listing_rejected",
      title: "Listing Rejected",
      body: `Your listing "${listing.title.substring(0, 60)}" was not approved. Reason: ${args.reason}`,
      link: `/seller/dashboard`,
      isRead: false,
      createdAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      action: "listing.reject",
      targetType: "listing",
      targetId: args.listingId,
      metadata: { title: listing.title, reason: args.reason },
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const bulkApproveListings = mutation({
  args: { listingIds: v.array(v.id("listings")) },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin", "super_admin"]);
    let count = 0;
    for (const id of args.listingIds) {
      const listing = await ctx.db.get(id);
      if (!listing || listing.status !== "pending_review") continue;
      await ctx.db.patch(id, { status: "active", updatedAt: Date.now() });
      await ctx.db.insert("notifications", {
        userId: listing.sellerId,
        type: "listing_approved",
        title: "🎉 Listing Approved!",
        body: `Your listing "${listing.title.substring(0, 60)}" is now live.`,
        link: `/listing/${id}`,
        isRead: false,
        createdAt: Date.now(),
      });
      count++;
    }
    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      action: "listing.bulk_approve",
      targetType: "listing",
      targetId: "bulk",
      metadata: { count, ids: args.listingIds },
      createdAt: Date.now(),
    });
    return { success: true, count };
  },
});

export const bulkCreateListings = mutation({
  args: {
    listings: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        price: v.number(),
        gameId: v.id("games"),
        categoryId: v.id("categories"),
        deliveryMethod: v.union(v.literal("automatic"), v.literal("manual"), v.literal("coordinate")),
        deliveryTime: v.string(),
        autoDeliveryData: v.optional(v.string()),
        images: v.array(v.string()),
        attributes: v.optional(v.any()), // Game-specific attributes
        isSeeded: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user || (user.role !== "admin" && user.role !== "super_admin" && user.role !== "moderator")) {
      throw new Error("Forbidden");
    }

    const insertedIds = [];
    for (const listing of args.listings) {
      // @ts-ignore
      const listingId = await ctx.db.insert("listings", {
        ...listing,
        sellerId: user._id,
        slug: listing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + "-" + Math.random().toString(36).slice(2, 6),
        status: "active", // Admins go straight to active
        views: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      insertedIds.push(listingId);
    }
    return insertedIds;
  },
});
