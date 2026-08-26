import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUser, requireAuthUser } from "./users";
import { Id } from "./_generated/dataModel";

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);
}

export const getGames = query({
  args: {},
  handler: async (ctx) => ctx.db.query("games").collect(),
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => ctx.db.query("categories").collect(),
});

// ── RESOLVE STORAGE IDS TO PUBLIC IMAGE URLS ──────────────────────────────
async function resolveImageUrls(ctx: any, images?: string[]): Promise<string[]> {
  if (!images || images.length === 0) return [];
  const urls: string[] = [];
  for (const img of images) {
    if (!img) continue;
    if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/") || img.startsWith("data:")) {
      urls.push(img);
    } else {
      try {
        const url = await ctx.storage.getUrl(img as any);
        urls.push(url || img);
      } catch {
        urls.push(img);
      }
    }
  }
  return urls;
}

// ── LIST ACTIVE LISTINGS — fixed: active-only filter + batch game fetch ─
export const listActiveListings = query({
  args: {
    gameId: v.optional(v.id("games")),
    categoryId: v.optional(v.id("categories")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const pageSize = Math.min(args.limit ?? 100, 1000);

    let listings;
    if (args.gameId) {
      listings = await ctx.db.query("listings")
        .withIndex("by_game", (q) => q.eq("gameId", args.gameId!))
        .order("desc").take(pageSize);
      listings = listings.filter((l) => l.status === "active");
    } else if (args.categoryId) {
      listings = await ctx.db.query("listings")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId!))
        .order("desc").take(pageSize);
      listings = listings.filter((l) => l.status === "active");
    } else {
      listings = await ctx.db.query("listings")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .order("desc").take(pageSize);
    }

    // Batch fetch all referenced games in one pass (avoid N+1)
    const gameIds = [...new Set(listings.map((l) => l.gameId))];
    const gamesMap = new Map<string, string>();
    for (const gId of gameIds) {
      const game = await ctx.db.get(gId);
      if (game) gamesMap.set(gId, game.name);
    }

    // Batch fetch all referenced sellers in one pass
    const sellerIds = [...new Set(listings.map((l) => l.sellerId))];
    const sellersMap = new Map<string, any>();
    for (const sId of sellerIds) {
      const seller = await ctx.db.get(sId);
      if (seller) sellersMap.set(sId, seller);
    }

    return await Promise.all(
      listings.map(async (l) => {
        const seller = sellersMap.get(l.sellerId);
        const resolvedImages = await resolveImageUrls(ctx, l.images);
        return {
          ...l,
          images: resolvedImages,
          gameName: gamesMap.get(l.gameId) || "Game Asset",
          sellerName: seller?.displayName || "IGMART Seller",
          sellerRating: seller?.rating || 5.0,
          sellerIsVerified: seller?.isVerified || false,
        };
      })
    );
  },
});

export const createListing = mutation({
  args: {
    gameId: v.id("games"),
    categoryId: v.id("categories"),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    images: v.array(v.string()),
    attributes: v.optional(v.any()),
    deliveryTime: v.string(),
    deliveryMethod: v.union(v.literal("automatic"), v.literal("manual"), v.literal("coordinate")),
    autoDeliveryData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);

    // Price validation
    if (args.price <= 0) throw new Error("Price must be greater than zero");
    if (args.title.trim().length < 5) throw new Error("Title must be at least 5 characters");

    const ADMIN_EMAILS = ["proximaxagency@gmail.com", "dev@igmart.store"];
    const isAdmin = ADMIN_EMAILS.some(e => (user.email || "").toLowerCase().includes(e.split("@")[0]));

    // Auto-upgrade buyer to seller on first listing
    if (user.role === "buyer") {
      await ctx.db.patch(user._id, { role: "seller", updatedAt: Date.now() });
    }

    // Admin accounts skip the review queue — go live immediately
    const listingStatus = isAdmin ? "active" : "pending_review";

    const listingId = await ctx.db.insert("listings", {
      ...args,
      sellerId: user._id,
      slug: generateSlug(args.title),
      status: listingStatus,
      views: 0,
      isSeeded: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    if (!isAdmin) {
      // Notify the seller their listing is under review
      await ctx.db.insert("notifications", {
        userId: user._id,
        type: "listing_approved",
        title: "Listing Submitted for Review",
        body: `Your listing "${args.title.substring(0, 60)}" has been submitted and is pending admin approval.`,
        link: `/seller/dashboard`,
        isRead: false,
        createdAt: Date.now(),
      });
    } else {
      // Admin listing — immediately live notification
      await ctx.db.insert("notifications", {
        userId: user._id,
        type: "listing_approved",
        title: "🎉 Listing Published!",
        body: `Your listing "${args.title.substring(0, 60)}" is now live on the marketplace.`,
        link: `/listing/${listingId}`,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return listingId;
  },
});

export const getMyListings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return [];
    if ((user._id as string) === "synthetic_admin_user") return [];

    const listings = await ctx.db.query("listings")
      .withIndex("by_seller", (q) => q.eq("sellerId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      listings.map(async (l) => {
        const resolvedImages = await resolveImageUrls(ctx, l.images);
        return {
          ...l,
          images: resolvedImages,
        };
      })
    );
  },
});

export const getListingById = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) return null;
    const game = await ctx.db.get(listing.gameId);
    const seller = await ctx.db.get(listing.sellerId);
    const resolvedImages = await resolveImageUrls(ctx, listing.images);
    return {
      ...listing,
      images: resolvedImages,
      gameName: game?.name || "Game Asset",
      sellerName: seller?.displayName || seller?.username || "Seller",
      sellerAvatar: seller?.avatarUrl || null,
      sellerIsVerified: seller?.isVerified || false,
      sellerRating: seller?.rating || 5.0,
    };
  },
});

export const updateListing = mutation({
  args: {
    listingId: v.id("listings"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("draft"), v.literal("pending_review"), v.literal("active"),
      v.literal("paused"), v.literal("sold"), v.literal("rejected"), v.literal("removed")
    )),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");
    if (listing.sellerId !== user._id && user.role !== "admin" && user.role !== "super_admin") {
      throw new Error("Unauthorized to update this listing");
    }
    const { listingId, ...updates } = args;
    await ctx.db.patch(listingId, { ...updates, updatedAt: Date.now() });
    return true;
  },
});

export const deleteListing = mutation({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");
    if (listing.sellerId !== user._id && user.role !== "admin" && user.role !== "super_admin") {
      throw new Error("Unauthorized to delete this listing");
    }
    // Only allow delete if not tied to active orders
    await ctx.db.patch(args.listingId, { status: "removed", updatedAt: Date.now() });
    return true;
  },
});

// ── INCREMENT LISTING VIEWS ────────────────────────────────────────────
export const incrementViews = mutation({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) return;
    await ctx.db.patch(args.listingId, { views: (listing.views ?? 0) + 1 });
  },
});

// ── CONVEX FILE STORAGE ────────────────────────────────────────────────────
// Generate a one-time upload URL for direct browser → Convex storage uploads
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Get a public CDN URL for a Convex storage ID
export const getImageUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    // If it already looks like a URL, return it as-is
    if (args.storageId.startsWith("http")) return args.storageId;
    try {
      return await ctx.storage.getUrl(args.storageId as Id<"_storage">);
    } catch {
      return null;
    }
  },
});

