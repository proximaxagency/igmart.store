import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUser, requireAuthUser, requireRole } from "./users";


// ── GET ADMIN DASHBOARD OVERVIEW METRICS ────────────────────────────────
export const getAdminMetrics = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return {
        totalUsers: 0,
        activeSellers: 0,
        totalOrders: 0,
        gmv: 0,
        activeListings: 0,
        openDisputes: 0,
        openTickets: 0,
      };
    }

    const users = await ctx.db.query("users").collect();
    const orders = await ctx.db.query("orders").collect();
    const listings = await ctx.db.query("listings").collect();
    const tickets = await ctx.db.query("supportTickets").collect();

    const gmv = orders
      .filter((o) => o.status === "completed" || o.status === "delivered" || o.status === "paid")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const activeListings = listings.filter((l) => l.status === "active").length;
    const openDisputes = orders.filter((o) => o.status === "disputed").length;
    const openTickets = tickets.filter((t) => t.status === "open" || t.status === "assigned").length;

    return {
      totalUsers: users.length,
      activeSellers: users.filter((u) => u.role === "seller" && u.status === "active").length,
      totalOrders: orders.length,
      gmv,
      activeListings,
      openDisputes,
      openTickets,
    };
  },
});

export const listUsersAdmin = query({
  args: {
    roleFilter: v.optional(v.string()),
    statusFilter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let users = await ctx.db.query("users").order("desc").collect();

    if (args.roleFilter) {
      users = users.filter((u) => u.role === args.roleFilter);
    }
    if (args.statusFilter) {
      users = users.filter((u) => u.status === args.statusFilter);
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

    await ctx.db.patch(args.targetUserId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // Record Immutable Audit Log
    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      action: `user.status_${args.status}`,
      targetType: "user",
      targetId: args.targetUserId,
      metadata: { reason: args.reason, previousStatus: target.status },
      createdAt: Date.now(),
    });

    return true;
  },
});

// ── LIST IMMUTABLE AUDIT LOGS ──────────────────────────────────────────
export const listAuditLogs = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return [];
    }

    const logs = await ctx.db.query("auditLogs").withIndex("by_createdAt").order("desc").take(100);

    const hydrated = [];
    for (const log of logs) {
      const actor = await ctx.db.get(log.actorId);
      hydrated.push({
        ...log,
        actorName: actor?.displayName || actor?.username || "System",
        actorRole: actor?.role,
      });
    }

    return hydrated;
  },
});

// ── LIST ALL SUPPORT CONVERSATIONS (ADMIN SUPPORT DESK) ─────────────
export const listSupportConversations = query({
  args: {},
  handler: async (ctx) => {
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(100);

    const hydrated = [];
    for (const conv of conversations) {
      // Hydrate non-staff participant details
      let customerUser = null;
      for (const pId of conv.participants) {
        const p = await ctx.db.get(pId);
        if (p && p.role !== "admin" && p.role !== "support_agent") {
          customerUser = p;
          break;
        }
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
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin", "super_admin", "moderator"]);
    await ctx.db.patch(args.listingId, { status: args.status, updatedAt: Date.now() });

    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      action: `listing.${args.status}`,
      targetType: "listing",
      targetId: args.listingId,
      createdAt: Date.now(),
    });
    return true;
  },
});

// ── ADMIN RESOLVE DISPUTE ──────────────────────────────────────────────
export const resolveDispute = mutation({
  args: {
    orderId: v.id("orders"),
    resolution: v.union(v.literal("refund_buyer"), v.literal("release_to_seller")),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin", "super_admin", "moderator"]);
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const newStatus = args.resolution === "refund_buyer" ? "refunded" : "completed";
    await ctx.db.patch(args.orderId, { status: newStatus, completedAt: Date.now() });

    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      action: `dispute.${args.resolution}`,
      targetType: "order",
      targetId: args.orderId,
      createdAt: Date.now(),
    });
    return true;
  },
});

