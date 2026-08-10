import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthUser } from "./users";
import { Doc, Id } from "./_generated/dataModel";

// Generate a simple URL-friendly slug
function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);
}

export const getGames = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("games").collect();
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
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
    if (user.role !== "seller" && user.role !== "admin" && user.role !== "super_admin") {
      throw new Error("Only sellers can create listings.");
    }

    const listingId = await ctx.db.insert("listings", {
      ...args,
      sellerId: user._id,
      slug: generateSlug(args.title),
      status: "active", // Go live instantly based on our plan decisions
      views: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return listingId;
  },
});

export const getMyListings = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuthUser(ctx);
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_seller", (q) => q.eq("sellerId", user._id))
      .order("desc")
      .collect();
    
    return listings;
  },
});

export const updateListing = mutation({
  args: {
    listingId: v.id("listings"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("pending_review"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("sold"),
      v.literal("rejected"),
      v.literal("removed")
    )),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const listing = await ctx.db.get(args.listingId);
    
    if (!listing) throw new Error("Listing not found");
    if (listing.sellerId !== user._id && user.role !== "admin" && user.role !== "super_admin") {
      throw new Error("Unauthorized to update this listing.");
    }

    await ctx.db.patch(args.listingId, {
      ...args,
      updatedAt: Date.now(),
    });

    return true;
  },
});

export const deleteListing = mutation({
  args: {
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const listing = await ctx.db.get(args.listingId);
    
    if (!listing) throw new Error("Listing not found");
    if (listing.sellerId !== user._id && user.role !== "admin" && user.role !== "super_admin") {
      throw new Error("Unauthorized to delete this listing.");
    }

    await ctx.db.delete(args.listingId);
    return true;
  },
});
