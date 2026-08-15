import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Check if seeded
    const existingGames = await ctx.db.query("games").first();
    if (existingGames) return { status: "already_seeded" };

    // 1. Seed Categories
    const categoriesData = [
      { name: "Accounts", slug: "accounts", description: "Verified game accounts with rare items, high ranks, and instant delivery.", icon: "🎮", order: 1 },
      { name: "Items & Skins", slug: "items", description: "In-game cosmetic items, skins, weapons, and equipment.", icon: "⚔️", order: 2 },
      { name: "Currency", slug: "currency", description: "Gold, Coins, V-Bucks, Robux, and in-game currencies.", icon: "💰", order: 3 },
      { name: "Boosting & Services", slug: "boosting", description: "Rank boosting, coaching, dungeon carries, and level ups.", icon: "🚀", order: 4 },
      { name: "Game Keys", slug: "game-keys", description: "Digital game activation codes and CD keys.", icon: "🔑", order: 5 },
    ];

    const categoryIds: Record<string, any> = {};
    for (const cat of categoriesData) {
      const id = await ctx.db.insert("categories", { ...cat, isActive: true });
      categoryIds[cat.slug] = id;
    }

    // 2. Seed Games
    const gamesData = [
      { name: "Clash of Clans", slug: "clash-of-clans", category: "Strategy", isActive: true, isPopular: true, imageUrl: "https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=800", metrics: { activeListings: 14500, totalSellers: 840, rating: 4.9 } },
      { name: "BGMI", slug: "bgmi", category: "Battle Royale", isActive: true, isPopular: true, imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800", metrics: { activeListings: 21400, totalSellers: 980, rating: 4.9 } },
      { name: "Free Fire", slug: "free-fire", category: "Battle Royale", isActive: true, isPopular: true, imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800", metrics: { activeListings: 24800, totalSellers: 1150, rating: 4.9 } },
      { name: "PUBG Global", slug: "pubg-global", category: "Battle Royale", isActive: true, isPopular: true, imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800", metrics: { activeListings: 18900, totalSellers: 870, rating: 4.8 } },
      { name: "Roblox", slug: "roblox", category: "Sandbox", isActive: true, isPopular: true, imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800", metrics: { activeListings: 34500, totalSellers: 1420, rating: 4.7 } },
      { name: "Clash Royale", slug: "clash-royale", category: "Card Battler", isActive: true, isPopular: true, imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800", metrics: { activeListings: 9800, totalSellers: 620, rating: 4.8 } },
      { name: "Brawl Stars", slug: "brawl-stars", category: "Action MOBA", isActive: true, isPopular: true, imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800", metrics: { activeListings: 11200, totalSellers: 590, rating: 4.9 } },
      { name: "Squad Busters", slug: "squad-busters", category: "Action Party", isActive: true, isPopular: true, imageUrl: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800", metrics: { activeListings: 6500, totalSellers: 430, rating: 4.8 } },
      { name: "Hay Day", slug: "hay-day", category: "Farming Simulation", isActive: true, isPopular: false, imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800", metrics: { activeListings: 3400, totalSellers: 210, rating: 4.7 } },
      { name: "Boom Beach", slug: "boom-beach", category: "Combat Strategy", isActive: true, isPopular: false, imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800", metrics: { activeListings: 2800, totalSellers: 180, rating: 4.6 } },
    ];

    const gameIds: Record<string, any> = {};
    for (const g of gamesData) {
      const id = await ctx.db.insert("games", g);
      gameIds[g.slug] = id;
    }

    // 3. Seed Demo Users
    const sellerId = await ctx.db.insert("users", {
      clerkId: "demo_seller_pro_1",
      email: "proseller@igmart.store",
      username: "ProGamer99",
      displayName: "ProGamer99 Verified",
      role: "seller",
      status: "active",
      isVerified: true,
      sellerSince: now - 86400000 * 180,
      rating: 4.9,
      totalReviews: 240,
      totalOrders: 1120,
      responseRate: "99%",
      walletBalance: 4500,
      pendingBalance: 250,
      createdAt: now - 86400000 * 180,
      updatedAt: now,
    });

    const buyerId = await ctx.db.insert("users", {
      clerkId: "demo_buyer_1",
      email: "buyer@igmart.store",
      username: "AlexGamer",
      displayName: "Alex G.",
      role: "buyer",
      status: "active",
      walletBalance: 150,
      pendingBalance: 0,
      createdAt: now - 86400000 * 30,
      updatedAt: now,
    });

    const adminId = await ctx.db.insert("users", {
      clerkId: "demo_admin_1",
      email: "admin@igmart.store",
      username: "IGMART_Admin",
      displayName: "System Administrator",
      role: "admin",
      status: "active",
      createdAt: now - 86400000 * 365,
      updatedAt: now,
    });

    // 4. Seed Demo Listings
    const listingId = await ctx.db.insert("listings", {
      sellerId,
      gameId: gameIds["clash-of-clans"],
      categoryId: categoryIds["accounts"],
      title: "TH16 Maxed Base — 95/95/70/45 Heroes + All Equipments Lv 27",
      slug: "coc-th16-maxed-base-all-heroes",
      description: "Full access TH16 account with Supercell ID change ready. Max heroes, epic equipments maxed, 10k gems and champion sceneries.",
      price: 249.99,
      originalPrice: 299.99,
      images: ["https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=800"],
      deliveryTime: "< 15 mins",
      deliveryMethod: "manual",
      status: "active",
      views: 482,
      badge: "HOT",
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000 * 2,
    });

    // 5. Seed Order
    const orderId = await ctx.db.insert("orders", {
      buyerId,
      sellerId,
      listingId,
      price: 249.99,
      feeAmount: 7.50,
      totalAmount: 257.49,
      status: "completed",
      createdAt: now - 86400000 * 1,
      paidAt: now - 86400000 * 1,
      deliveredAt: now - 86400000 * 1 + 600000,
      completedAt: now - 86400000 * 1 + 3600000,
    });

    // 6. Seed Real-Time Conversation
    const conversationId = await ctx.db.insert("conversations", {
      type: "buyer_seller",
      participants: [buyerId, sellerId],
      relatedOrderId: orderId,
      relatedListingId: listingId,
      lastMessageText: "Credentials verified! Leaving a 5 star review now.",
      lastMessageAt: now - 3600000,
      status: "active",
      createdAt: now - 86400000 * 1,
      updatedAt: now - 3600000,
    });

    await ctx.db.insert("messages", {
      conversationId,
      senderId: buyerId,
      content: "Hi ProGamer99, just placed order #ORD-1001 for the TH16 Clash of Clans account. Is delivery instant?",
      type: "text",
      isRead: true,
      readBy: [buyerId, sellerId],
      createdAt: now - 86400000 * 1,
    });

    await ctx.db.insert("messages", {
      conversationId,
      senderId: sellerId,
      content: "Hello! Yes, checking order details now and preparing credentials.",
      type: "text",
      isRead: true,
      readBy: [buyerId, sellerId],
      createdAt: now - 86400000 * 1 + 120000,
    });

    await ctx.db.insert("messages", {
      conversationId,
      senderId: buyerId,
      content: "Credentials verified! Leaving a 5 star review now.",
      type: "text",
      isRead: true,
      readBy: [buyerId, sellerId],
      createdAt: now - 3600000,
    });

    // 7. Seed Audit Log
    await ctx.db.insert("auditLogs", {
      actorId: adminId,
      action: "system.seed_database",
      targetType: "system",
      targetId: "global",
      metadata: { status: "success" },
      createdAt: now,
    });

    return { status: "seeded_successfully" };
  },
});
