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
      orders = await ctx.db
        .query("orders")
        .withIndex("by_seller", (q) => q.eq("sellerId", user._id))
        .order("desc")
        .take(50);
    } else {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_buyer", (q) => q.eq("buyerId", user._id))
        .order("desc")
        .take(50);
    }

    // Hydrate listing & counterpart user details
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

    // Security check: must be buyer, seller, or admin/support
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

// ── CREATE ORDER ───────────────────────────────────────────────────────
export const createOrder = mutation({
  args: {
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const buyer = await requireAuthUser(ctx);

    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");
    if (listing.status !== "active") throw new Error("Listing is no longer active");
    if (listing.sellerId === buyer._id) throw new Error("Cannot purchase your own listing");

    const feeAmount = Math.round(listing.price * 0.03 * 100) / 100;
    const totalAmount = listing.price + feeAmount;
    const now = Date.now();

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

    // Notify seller
    await ctx.db.insert("notifications", {
      userId: listing.sellerId,
      type: "order_created",
      title: "New Order Received!",
      body: `Someone purchased your listing "${listing.title}". Please deliver the item.`,
      link: `/account/orders`,
      isRead: false,
      createdAt: now,
    });

    // Create chat conversation for this order
    await ctx.db.insert("conversations", {
      type: "order",
      participants: [buyer._id, listing.sellerId],
      relatedOrderId: orderId,
      relatedListingId: listing._id,
      lastMessageText: `Order #${orderId.slice(-6)} initiated`,
      lastMessageAt: now,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return orderId;
  },
});
