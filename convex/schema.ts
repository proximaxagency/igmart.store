import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. USERS (Synced with Clerk)
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    
    // Role-based Security Matrix
    role: v.union(
      v.literal("buyer"),
      v.literal("seller"),
      v.literal("support_agent"),
      v.literal("moderator"),
      v.literal("admin"),
      v.literal("super_admin")
    ),
    
    status: v.union(
      v.literal("active"),
      v.literal("suspended"),
      v.literal("banned"),
      v.literal("pending")
    ),
    
    createdAt: v.number(),
    updatedAt: v.number(),
    lastSeenAt: v.optional(v.number()),
    
    // Seller Attributes
    isVerified: v.optional(v.boolean()),
    sellerSince: v.optional(v.number()),
    bio: v.optional(v.string()),
    rating: v.optional(v.number()),
    totalReviews: v.optional(v.number()),
    totalOrders: v.optional(v.number()),
    responseRate: v.optional(v.string()),
    
    // Financial Ledger Balances
    walletBalance: v.optional(v.number()),
    pendingBalance: v.optional(v.number()),

    // Data source tracking
    isSeeded: v.optional(v.boolean()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_username", ["username"])
    .index("by_role", ["role"])
    .index("by_status", ["status"]),

  // 2. GAMES CATALOG
  games: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    category: v.string(),
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

  // 3. CATEGORIES
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.string(),
    isActive: v.boolean(),
    order: v.number(),
  }).index("by_slug", ["slug"]),

  // 4. LISTINGS
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
    attributes: v.optional(v.any()),
    
    deliveryTime: v.string(),
    deliveryMethod: v.union(v.literal("automatic"), v.literal("manual"), v.literal("coordinate")),
    autoDeliveryData: v.optional(v.string()),
    
    status: v.union(
      v.literal("draft"),
      v.literal("pending_review"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("sold"),
      v.literal("rejected"),
      v.literal("removed")
    ),
    views: v.number(),
    badge: v.optional(v.union(v.literal("HOT"), v.literal("SALE"), v.literal("POPULAR"), v.literal("NEW"))),

    // Data source tracking
    isSeeded: v.optional(v.boolean()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_game", ["gameId"])
    .index("by_category", ["categoryId"])
    .index("by_status", ["status"])
    .index("by_slug", ["slug"]),

  // 5. ORDERS & ESCROW
  orders: defineTable({
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    listingId: v.id("listings"),
    
    price: v.number(),
    feeAmount: v.number(),
    totalAmount: v.number(),
    
    status: v.union(
      v.literal("pending_payment"),
      v.literal("paid"),
      v.literal("delivering"),
      v.literal("delivered"),
      v.literal("completed"),
      v.literal("disputed"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    
    paymentIntentId: v.optional(v.string()),
    deliveryData: v.optional(v.string()),
    
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_buyer", ["buyerId"])
    .index("by_seller", ["sellerId"])
    .index("by_listing", ["listingId"])
    .index("by_status", ["status"]),

  // 6. CONVERSATIONS (Multi-Channel Real-Time Chat System)
  conversations: defineTable({
    type: v.union(
      v.literal("buyer_seller"),
      v.literal("buyer_support"),
      v.literal("seller_support"),
      v.literal("order"),
      v.literal("internal_staff"),
      v.literal("dispute_arbitration")
    ),
    participants: v.array(v.id("users")),
    supportAgentId: v.optional(v.id("users")),
    isEscalated: v.optional(v.boolean()),
    escalationReason: v.optional(v.string()),
    relatedOrderId: v.optional(v.id("orders")),
    relatedListingId: v.optional(v.id("listings")),
    relatedTicketId: v.optional(v.id("supportTickets")),
    
    lastMessageText: v.optional(v.string()),
    lastMessageAt: v.number(),
    unreadCount: v.optional(v.any()), // Map of userId -> count
    
    status: v.union(v.literal("active"), v.literal("archived"), v.literal("closed"), v.literal("blocked")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_order", ["relatedOrderId"])
    .index("by_updatedAt", ["updatedAt"]),

  // 7. MESSAGES (Real-Time Subscriptions)
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("file"),
      v.literal("system"),
      v.literal("order_update"),
      v.literal("support_note"), // Internal notes visible to staff only
      v.literal("credential_vault") // Masked credentials
    ),
    metadata: v.optional(v.any()),
    attachments: v.optional(v.array(v.string())),
    replyToMessageId: v.optional(v.id("messages")),
    
    isRead: v.boolean(),
    readBy: v.optional(v.array(v.id("users"))),
    editedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId", "createdAt"])
    .index("by_sender", ["senderId"]),

  // 8. SUPPORT TICKETS
  supportTickets: defineTable({
    ticketNumber: v.string(),
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    category: v.union(
      v.literal("order_issue"),
      v.literal("payment_issue"),
      v.literal("seller_dispute"),
      v.literal("account_issue"),
      v.literal("technical_issue"),
      v.literal("other")
    ),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent")),
    status: v.union(
      v.literal("open"),
      v.literal("assigned"),
      v.literal("waiting_for_customer"),
      v.literal("waiting_for_seller"),
      v.literal("resolved"),
      v.literal("closed")
    ),
    assignedAgentId: v.optional(v.id("users")),
    subject: v.string(),
    
    createdAt: v.number(),
    updatedAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_assigned", ["assignedAgentId"])
    .index("by_priority", ["priority"]),

  // 9. NOTIFICATIONS
  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("new_message"),
      v.literal("order_created"),
      v.literal("order_updated"),
      v.literal("payment_success"),
      v.literal("support_reply"),
      v.literal("listing_approved"),
      v.literal("listing_rejected"),
      v.literal("review_received"),
      v.literal("security_alert")
    ),
    title: v.string(),
    body: v.string(),
    link: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId", "isRead"])
    .index("by_createdAt", ["createdAt"]),

  // 10. REVIEWS
  reviews: defineTable({
    orderId: v.id("orders"),
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    listingId: v.id("listings"),
    gameId: v.id("games"),
    
    rating: v.number(),
    title: v.string(),
    body: v.string(),
    isVerified: v.boolean(),
    
    createdAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_listing", ["listingId"])
    .index("by_game", ["gameId"]),

  // 11. REPORTS & MODERATION
  reports: defineTable({
    reporterId: v.id("users"),
    targetType: v.union(v.literal("user"), v.literal("listing"), v.literal("message"), v.literal("conversation")),
    targetId: v.string(),
    reason: v.string(),
    description: v.string(),
    status: v.union(v.literal("pending"), v.literal("under_review"), v.literal("resolved"), v.literal("dismissed")),
    assignedTo: v.optional(v.id("users")),
    actionTaken: v.optional(v.string()),
    
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_reporter", ["reporterId"]),

  // 12. IMMUTABLE AUDIT LOGS
  auditLogs: defineTable({
    actorId: v.id("users"),
    action: v.string(),
    targetType: v.string(),
    targetId: v.string(),
    metadata: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_actor", ["actorId"])
    .index("by_action", ["action"])
    .index("by_createdAt", ["createdAt"]),

  // 13. WALLET TRANSACTIONS
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

  // 14. GUIDES
  guides: defineTable({
    title: v.string(),
    slug: v.string(),
    gameId: v.optional(v.id("games")),
    category: v.string(),
    authorId: v.id("users"),
    imageUrl: v.string(),
    content: v.string(),
    excerpt: v.string(),
    readTime: v.string(),
    isFeatured: v.boolean(),
    publishedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_game", ["gameId"]),

  // 15. WISHLISTS
  wishlists: defineTable({
    userId: v.id("users"),
    listingId: v.id("listings"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_listing", ["listingId"])
    .index("by_user_listing", ["userId", "listingId"]),

  // 16. SELLER VERIFICATIONS (KYC & Identity Onboarding)
  sellerVerifications: defineTable({
    userId: v.id("users"),
    fullName: v.string(),
    country: v.string(),
    idType: v.string(),
    idDocumentUrl: v.string(),
    addressProofUrl: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("more_info_needed")),
    adminNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // 17. INVENTORY VAULT (Automated Stock Delivery)
  inventoryItems: defineTable({
    sellerId: v.id("users"),
    listingId: v.id("listings"),
    secretData: v.string(), // Account credentials or digital key
    status: v.union(v.literal("available"), v.literal("reserved"), v.literal("sold")),
    orderId: v.optional(v.id("orders")),
    createdAt: v.number(),
    soldAt: v.optional(v.number()),
  })
    .index("by_listing", ["listingId", "status"])
    .index("by_seller", ["sellerId"]),

  // 18. WITHDRAWAL REQUESTS (Payout System)
  withdrawalRequests: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    method: v.union(v.literal("bank"), v.literal("payoneer"), v.literal("skrill"), v.literal("crypto")),
    payoutDetails: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("completed")),
    processedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // 19. DISPUTE EVIDENCE
  disputeEvidence: defineTable({
    orderId: v.id("orders"),
    uploaderId: v.id("users"),
    role: v.union(v.literal("buyer"), v.literal("seller"), v.literal("staff")),
    fileUrl: v.string(),
    description: v.string(),
    createdAt: v.number(),
  }).index("by_order", ["orderId"]),

  // 20. RISK SIGNALS
  riskSignals: defineTable({
    targetUserId: v.id("users"),
    signalType: v.string(), // e.g., "high_velocity", "suspicious_ip", "chargeback_risk"
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    description: v.string(),
    isResolved: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["targetUserId"]),
});

