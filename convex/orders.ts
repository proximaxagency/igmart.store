import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUser, requireAuthUser, isDbUser } from "./users";

// ── GET USER ORDERS ────────────────────────────────────────────────────
export const getMyOrders = query({
  args: {
    role: v.optional(v.union(v.literal("buyer"), v.literal("seller"))),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!isDbUser(user)) return [];

    let orders;
    if (args.role === "seller") {
      orders = await ctx.db.query("orders").withIndex("by_seller", (q) => q.eq("sellerId", user._id)).order("desc").take(50);
    } else {
      orders = await ctx.db.query("orders").withIndex("by_buyer", (q) => q.eq("buyerId", user._id)).order("desc").take(50);
    }

    const hydrated = [];
    for (const order of orders) {
      const listing = await ctx.db.get(order.listingId);
      const counterpartId = args.role === "seller" ? order.buyerId : order.sellerId;
      const counterpart = await ctx.db.get(counterpartId);
      hydrated.push({
        ...order,
        listingTitle: listing?.title || "Gaming Product",
        listingImage: listing?.images?.[0] || null,
        counterpartName: counterpart?.displayName || counterpart?.username || "Verified Gamer",
        counterpartAvatar: counterpart?.avatarUrl || null,
      });
    }
    return hydrated;
  },
});

// ── GET SINGLE ORDER ───────────────────────────────────────────────────
export const getOrderById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) return null;

    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    const isParty = order.buyerId === user._id || order.sellerId === user._id;
    const isStaff = ["admin", "super_admin", "support_agent", "moderator"].includes(user.role);
    if (!isParty && !isStaff) return null;

    const listing = await ctx.db.get(order.listingId);
    const buyer = await ctx.db.get(order.buyerId);
    const seller = await ctx.db.get(order.sellerId);

    return {
      ...order,
      listing,
      buyer: buyer ? { displayName: buyer.displayName || buyer.username, avatarUrl: buyer.avatarUrl } : null,
      seller: seller ? { displayName: seller.displayName || seller.username, avatarUrl: seller.avatarUrl } : null,
    };
  },
});

// ── CREATE ORDER — wallet deduction + escrow + ledger ─────────────────
export const createOrder = mutation({
  args: {
    listingId: v.id("listings"),
    deliveryNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const buyer = await requireAuthUser(ctx);

    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");
    if (listing.status !== "active") throw new Error("Listing is no longer available");
    if (listing.sellerId === buyer._id) throw new Error("Cannot purchase your own listing");

    const feeAmount = Math.round(listing.price * 0.03 * 100) / 100;
    const totalAmount = Math.round((listing.price + feeAmount) * 100) / 100;

    // Verify buyer has sufficient wallet balance
    const currentBalance = buyer.walletBalance ?? 0;
    if (currentBalance < totalAmount) {
      throw new Error(`Insufficient wallet balance. Need $${totalAmount.toFixed(2)}, available $${currentBalance.toFixed(2)}`);
    }

    const now = Date.now();

    // Deduct from buyer wallet (move to escrow)
    await ctx.db.patch(buyer._id, {
      walletBalance: currentBalance - totalAmount,
      pendingBalance: (buyer.pendingBalance ?? 0) + totalAmount,
      updatedAt: now,
    });

    // Create the order
    const orderId = await ctx.db.insert("orders", {
      buyerId: buyer._id,
      sellerId: listing.sellerId,
      listingId: listing._id,
      price: listing.price,
      feeAmount,
      totalAmount,
      status: "paid",
      paidAt: now,
      createdAt: now,
    });

    // Ledger: buyer payment held
    await ctx.db.insert("transactions", {
      userId: buyer._id,
      orderId,
      type: "payment_held",
      amount: -totalAmount,
      currency: "USD",
      status: "completed",
      description: `Payment held in escrow for "${listing.title}"`,
      createdAt: now,
    });

    // Notify seller
    await ctx.db.insert("notifications", {
      userId: listing.sellerId,
      type: "order_created",
      title: "New Order Received!",
      body: `Someone purchased "${listing.title}" for $${listing.price.toFixed(2)}. Please deliver promptly.`,
      link: `/seller/dashboard/orders`,
      isRead: false,
      createdAt: now,
    });

    // Create order conversation
    await ctx.db.insert("conversations", {
      type: "order",
      participants: [buyer._id, listing.sellerId],
      relatedOrderId: orderId,
      relatedListingId: listing._id,
      lastMessageText: `Order #${orderId.slice(-6).toUpperCase()} placed`,
      lastMessageAt: now,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return orderId;
  },
});

// ── CONFIRM ORDER DELIVERY (buyer confirms receipt) ────────────────────
export const confirmDelivery = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const buyer = await requireAuthUser(ctx);
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (order.buyerId !== buyer._id) throw new Error("Forbidden: Not your order");
    if (!["paid", "delivering", "delivered"].includes(order.status)) {
      throw new Error("Order cannot be confirmed in its current status");
    }

    const now = Date.now();

    // Complete the order
    await ctx.db.patch(args.orderId, { status: "completed", completedAt: now });

    // Release buyer's pending balance
    await ctx.db.patch(buyer._id, {
      pendingBalance: Math.max(0, (buyer.pendingBalance ?? 0) - order.totalAmount),
      updatedAt: now,
    });

    // Credit seller earnings (price minus fee)
    const seller = await ctx.db.get(order.sellerId);
    if (seller) {
      const sellerEarnings = order.price - order.feeAmount;
      await ctx.db.patch(seller._id, {
        walletBalance: (seller.walletBalance ?? 0) + sellerEarnings,
        updatedAt: now,
      });
      await ctx.db.insert("transactions", {
        userId: seller._id,
        orderId: order._id,
        type: "payment_released",
        amount: sellerEarnings,
        currency: "USD",
        status: "completed",
        description: `Payment released for order #${order._id.slice(-6).toUpperCase()}`,
        createdAt: now,
      });
      await ctx.db.insert("notifications", {
        userId: seller._id,
        type: "payment_success",
        title: "Payment Released!",
        body: `$${sellerEarnings.toFixed(2)} has been credited to your wallet. Order #${order._id.slice(-6).toUpperCase()} complete.`,
        link: "/seller/earnings",
        isRead: false,
        createdAt: now,
      });
    }

    return true;
  },
});

// ── DISPUTE ORDER ──────────────────────────────────────────────────────
export const disputeOrder = mutation({
  args: {
    orderId: v.id("orders"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const isParty = order.buyerId === user._id || order.sellerId === user._id;
    if (!isParty) throw new Error("Forbidden: Not a party to this order");
    if (!["paid", "delivering", "delivered"].includes(order.status)) {
      throw new Error("Order cannot be disputed in its current status");
    }

    const now = Date.now();
    await ctx.db.patch(args.orderId, { status: "disputed" });

    // Create support ticket for dispute
    const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;
    const convId = await ctx.db.insert("conversations", {
      type: "dispute_arbitration",
      participants: [user._id],
      relatedOrderId: order._id,
      isEscalated: true,
      escalationReason: args.reason,
      lastMessageText: `Dispute opened: ${args.reason}`,
      lastMessageAt: now,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("supportTickets", {
      ticketNumber,
      conversationId: convId,
      userId: user._id,
      category: "seller_dispute",
      priority: "high",
      status: "open",
      subject: `Dispute: Order #${order._id.slice(-6).toUpperCase()}`,
      createdAt: now,
      updatedAt: now,
    });

    // Notify admin team
    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      action: "order.dispute_opened",
      targetType: "order",
      targetId: args.orderId,
      metadata: { reason: args.reason, ticketNumber },
      createdAt: now,
    });

    return { ticketNumber, conversationId: convId };
  },
});
