import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users (Synced with Clerk)
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    role: v.union(v.literal("buyer"), v.literal("seller"), v.literal("admin")),
    createdAt: v.number(),
    
    // Seller specific
    isVerified: v.optional(v.boolean()),
    sellerSince: v.optional(v.number()),
    bio: v.optional(v.string()),
    rating: v.optional(v.number()),
    totalReviews: v.optional(v.number()),
    totalOrders: v.optional(v.number()),
    
    // Wallet
    walletBalance: v.optional(v.number()),
    pendingBalance: v.optional(v.number()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_username", ["username"])
    .index("by_role", ["role"]),

  // Games
  games: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    category: v.string(), // FPS, MMO, etc.
    isActive: v.boolean(),
    isPopular: v.boolean(),
    metrics: v.object({
      activeListings: v.number(),
      totalSellers: v.number(),
      rating: v.number(),
    }),
  })
    .index("by_slug", ["slug"])
    .index("by_popular", ["isPopular"]),

  // Marketplace Categories (Accounts, Items, Currency, Boosting, etc.)
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.string(),
    isActive: v.boolean(),
    order: v.number(),
  }).index("by_slug", ["slug"]),

  // Listings
  listings: defineTable({
    sellerId: v.id("users"),
    gameId: v.id("games"),
    categoryId: v.id("categories"),
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    images: v.array(v.string()),
    
    // Specific attributes (JSON string or generic fields)
    attributes: v.optional(v.any()), // e.g., rank, server, level
    
    deliveryTime: v.string(), // e.g., "Instant", "1-3 hours"
    deliveryMethod: v.union(v.literal("automatic"), v.literal("manual"), v.literal("coordinate")),
    autoDeliveryData: v.optional(v.string()), // Encrypted credentials if automatic
    
    status: v.union(v.literal("active"), v.literal("sold"), v.literal("paused"), v.literal("draft")),
    views: v.number(),
    badge: v.optional(v.union(v.literal("HOT"), v.literal("SALE"), v.literal("POPULAR"), v.literal("NEW"))),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_game", ["gameId"])
    .index("by_category", ["categoryId"])
    .index("by_status", ["status"])
    .index("by_slug", ["slug"]),

  // Orders
  orders: defineTable({
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    listingId: v.id("listings"),
    
    price: v.number(),
    feeAmount: v.number(), // Platform fee
    totalAmount: v.number(),
    
    status: v.union(
      v.literal("pending_payment"),
      v.literal("paid"), // Escrowed
      v.literal("delivering"),
      v.literal("delivered"), // Waiting for buyer to confirm
      v.literal("completed"), // Funds released to seller
      v.literal("disputed"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    
    paymentIntentId: v.optional(v.string()),
    deliveryData: v.optional(v.string()), // E.g., credentials passed from seller
    
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_buyer", ["buyerId"])
    .index("by_seller", ["sellerId"])
    .index("by_listing", ["listingId"])
    .index("by_status", ["status"]),

  // Messages (Chat between buyer & seller)
  messages: defineTable({
    orderId: v.optional(v.id("orders")), // Nullable if general inquiry
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
    attachments: v.optional(v.array(v.string())),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_participants", ["senderId", "receiverId"]),

  // Reviews
  reviews: defineTable({
    orderId: v.id("orders"),
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    listingId: v.id("listings"),
    gameId: v.id("games"),
    
    rating: v.number(),
    title: v.string(),
    body: v.string(),
    isVerified: v.boolean(), // Always true if linked to order, but explicit
    
    createdAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_listing", ["listingId"])
    .index("by_game", ["gameId"]),

  // Disputes
  disputes: defineTable({
    orderId: v.id("orders"),
    openerId: v.id("users"), // Usually buyer
    reason: v.string(),
    description: v.string(),
    evidence: v.optional(v.array(v.string())),
    
    status: v.union(v.literal("open"), v.literal("investigating"), v.literal("resolved_buyer"), v.literal("resolved_seller")),
    adminNotes: v.optional(v.string()),
    
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  }).index("by_order", ["orderId"]),

  // Wallet Transactions (Ledger)
  transactions: defineTable({
    userId: v.id("users"),
    orderId: v.optional(v.id("orders")),
    type: v.union(
      v.literal("deposit"), 
      v.literal("withdrawal"), 
      v.literal("payment_held"), 
      v.literal("payment_released"), 
      v.literal("refund"),
      v.literal("fee")
    ),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    description: v.string(),
    
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  
  // Guides / Blog
  guides: defineTable({
    title: v.string(),
    slug: v.string(),
    gameId: v.optional(v.id("games")),
    category: v.string(), // "Guide", "News", "Safety"
    authorId: v.id("users"), // Admin user
    imageUrl: v.string(),
    content: v.string(),
    excerpt: v.string(),
    readTime: v.string(),
    isFeatured: v.boolean(),
    
    publishedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_game", ["gameId"]),
    
  // User Wishlist (Saved listings)
  wishlists: defineTable({
    userId: v.id("users"),
    listingId: v.id("listings"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_listing", ["listingId"])
    .index("by_user_listing", ["userId", "listingId"]),
});
