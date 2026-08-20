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
      { name: "Clash of Clans", slug: "clash-of-clans", category: "Strategy", isActive: true, isPopular: true, imageUrl: "/clash-of-clans-poster.jpg", metrics: { activeListings: 14500, totalSellers: 840, rating: 4.9 } },
      { name: "PUBG Mobile / BGMI", slug: "pubg-mobile", category: "Battle Royale", isActive: true, isPopular: true, imageUrl: "/pubg-poster.png", metrics: { activeListings: 40300, totalSellers: 1850, rating: 4.9 } },
      { name: "Free Fire", slug: "free-fire", category: "Battle Royale", isActive: true, isPopular: true, imageUrl: "/free-fire-poster.png", metrics: { activeListings: 24800, totalSellers: 1150, rating: 4.9 } },
      { name: "Roblox", slug: "roblox", category: "Sandbox", isActive: true, isPopular: true, imageUrl: "/roblox-poster.png", metrics: { activeListings: 34500, totalSellers: 1420, rating: 4.7 } },
      { name: "Clash Royale", slug: "clash-royale", category: "Card Battler", isActive: true, isPopular: true, imageUrl: "/clash-royale-poster.png", metrics: { activeListings: 9800, totalSellers: 620, rating: 4.8 } },
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

export const reseedGames = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Delete all existing games
    const existingGames = await ctx.db.query("games").collect();
    for (const g of existingGames) {
      await ctx.db.delete(g._id);
    }

    // Delete all existing categories
    const existingCats = await ctx.db.query("categories").collect();
    for (const c of existingCats) {
      await ctx.db.delete(c._id);
    }

    // Re-insert Categories
    const categoriesData = [
      { name: "Accounts", slug: "accounts", description: "Verified game accounts with rare items, high ranks, and instant delivery.", icon: "🎮", order: 1 },
      { name: "Items & Skins", slug: "items", description: "In-game cosmetic items, skins, weapons, and equipment.", icon: "⚔️", order: 2 },
      { name: "Currency", slug: "currency", description: "Gold, Coins, Diamonds, Robux, and in-game currencies.", icon: "💰", order: 3 },
      { name: "Boosting & Services", slug: "boosting", description: "Rank boosting, coaching, dungeon carries, and level ups.", icon: "🚀", order: 4 },
      { name: "Game Keys", slug: "game-keys", description: "Digital game activation codes and CD keys.", icon: "🔑", order: 5 },
    ];

    for (const cat of categoriesData) {
      await ctx.db.insert("categories", { ...cat, isActive: true });
    }

    // Re-insert Games (correct list)
    const gamesData = [
      { name: "Clash of Clans", slug: "clash-of-clans", category: "Strategy", isActive: true, isPopular: true, imageUrl: "/clash-of-clans-poster.jpg", metrics: { activeListings: 14500, totalSellers: 840, rating: 4.9 } },
      { name: "PUBG Mobile / BGMI", slug: "pubg-mobile", category: "Battle Royale", isActive: true, isPopular: true, imageUrl: "/pubg-poster.png", metrics: { activeListings: 40300, totalSellers: 1850, rating: 4.9 } },
      { name: "Free Fire", slug: "free-fire", category: "Battle Royale", isActive: true, isPopular: true, imageUrl: "/free-fire-poster.png", metrics: { activeListings: 24800, totalSellers: 1150, rating: 4.9 } },
      { name: "Roblox", slug: "roblox", category: "Sandbox", isActive: true, isPopular: true, imageUrl: "/roblox-poster.png", metrics: { activeListings: 34500, totalSellers: 1420, rating: 4.7 } },
      { name: "Clash Royale", slug: "clash-royale", category: "Card Battler", isActive: true, isPopular: true, imageUrl: "/clash-royale-poster.png", metrics: { activeListings: 9800, totalSellers: 620, rating: 4.8 } },
    ];

    for (const g of gamesData) {
      await ctx.db.insert("games", g);
    }

    return { status: "reseeded", games: gamesData.length };
  },
});

// ──────────────────────────────────────────────────────────────────────────────
// SEED LISTINGS  — 50 real accounts (10 per game) sourced from gameboost.com
// Run via Convex dashboard: Functions → seedListings
// ──────────────────────────────────────────────────────────────────────────────
export const seedListings = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Fetch the one seller we need
    const seller = await ctx.db.query("users").filter(q => q.eq(q.field("username"), "ProGamer99")).first();
    if (!seller) return { error: "Run seedDatabase first to create the seller user." };

    const categoryDoc = await ctx.db.query("categories").filter(q => q.eq(q.field("slug"), "accounts")).first();
    if (!categoryDoc) return { error: "No 'accounts' category found. Run seedDatabase first." };

    const games = await ctx.db.query("games").collect();
    const gameMap: Record<string, any> = {};
    for (const g of games) gameMap[g.slug] = g._id;

    // Guard: don't double-seed
    const existing = await ctx.db.query("listings").first();
    if (existing) return { status: "listings_already_seeded" };

    const sellerId = seller._id;
    const categoryId = categoryDoc._id;

    type ListingInput = {
      slug: string;
      gameSlug: string;
      gameName: string;
      title: string;
      description: string;
      price: number;
      originalPrice?: number;
      images: string[];
      deliveryTime: string;
      badge?: "HOT" | "POPULAR" | "SALE" | "NEW";
      views: number;
      daysAgo: number;
    };

    const listings: ListingInput[] = [
      // ── CLASH OF CLANS (10) ─────────────────────────────────────────────────
      {
        slug: "coc-th18-semi-max-heroes-104",
        gameSlug: "clash-of-clans", gameName: "Clash of Clans",
        title: "TH18 Semi-Max — Heroes 104/100/78/77 · 5 Max Epic Equipment",
        description: "Town Hall 18 semi-maxed account. Heroes at 104/100/78/77/55/6, 5 max epic equipments, max walls, max builder base, helper opened, clan name on, 20 skins. Full Supercell ID transfer ready. Instant delivery.",
        price: 88.85, originalPrice: 120.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6213164/gallery/58e83257-bef7-4f00-b333-343193769e7b.jpg"],
        deliveryTime: "Instant", badge: "HOT", views: 1240, daysAgo: 1,
      },
      {
        slug: "coc-th18-100pct-maxed-profile-fire",
        gameSlug: "clash-of-clans", gameName: "Clash of Clans",
        title: "TH18 100% Maxed — Profile Fire · 11x Max Gear Epics · Cosmic Scenery",
        description: "Top maxed TH18 account. Profile Fire activated, 11x max gear epics, Cosmic Scenery equipped, max Builder Base, Supercharger max. Full access with email.",
        price: 245.53, originalPrice: 320.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6255046/gallery/ed914123-fa2f-4369-b21a-202f7e787b4d.jpg"],
        deliveryTime: "Instant", badge: "POPULAR", views: 876, daysAgo: 2,
      },
      {
        slug: "coc-th18-3x-guardians-max-43-epic",
        gameSlug: "clash-of-clans", gameName: "Clash of Clans",
        title: "TH18 — 3x Guardians Max · 43/43 Epic Equipment Max · 6 Heroes Max",
        description: "Top-tier TH18 with 3 max Guardian pets, 43/43 epic equipment maxed, Supercharger max, all 6 heroes max, 100% max walls. Best deal for a max account.",
        price: 128.62, originalPrice: 180.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6185724/gallery/0b70154a-9aee-4f67-b834-a922122bbcfe.jpg"],
        deliveryTime: "Instant", badge: "HOT", views: 2180, daysAgo: 1,
      },
      {
        slug: "coc-th17-max-heroes-scenery-gems",
        gameSlug: "clash-of-clans", gameName: "Clash of Clans",
        title: "TH17 Max — High Level Heroes · Champion Scenery · 5000 Gems",
        description: "Town Hall 17 maxed account with very high heroes, Champion Scenery unlocked, 5000+ gems stored, max troops ready. Supercell ID transfer ready instantly.",
        price: 55.00, originalPrice: 75.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6185724/gallery/0b70154a-9aee-4f67-b834-a922122bbcfe.jpg"],
        deliveryTime: "Instant", badge: undefined, views: 610, daysAgo: 3,
      },
      {
        slug: "coc-th18-31k-gems-max-resources",
        gameSlug: "clash-of-clans", gameName: "Clash of Clans",
        title: "TH18 · 31,000+ Gems · Max Resources · Instant Transfer",
        description: "Gem-heavy TH18 account. 31,000+ gems, max gold/elixir storages, all builders active. Perfect for fast progression. Supercell ID change included.",
        price: 123.99, originalPrice: 160.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6213164/gallery/58e83257-bef7-4f00-b333-343193769e7b.jpg"],
        deliveryTime: "Instant", badge: "POPULAR", views: 945, daysAgo: 2,
      },
      {
        slug: "coc-th16-5-builders-champion-ready",
        gameSlug: "clash-of-clans", gameName: "Clash of Clans",
        title: "TH16 · 5 Builders · Champion Rank Ready · Good Defense",
        description: "Clean TH16 with 5 builders, strong defense, Legends League ready troops, and Champion Scenery eligible. Instant Supercell ID transfer.",
        price: 34.99, originalPrice: 49.99,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6255046/gallery/ed914123-fa2f-4369-b21a-202f7e787b4d.jpg"],
        deliveryTime: "Instant", badge: undefined, views: 432, daysAgo: 4,
      },
      {
        slug: "coc-th18-level-255-best-deal",
        gameSlug: "clash-of-clans", gameName: "Clash of Clans",
        title: "TH18 Level 255 — Best Deal · All Epics Max · Full Builder Base",
        description: "Level 255 player account TH18 with all epic equipment maxed, full builder base maxed, Supercharger activated. Ready for Legends League immediately.",
        price: 199.00, originalPrice: 280.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6185724/gallery/0b70154a-9aee-4f67-b834-a922122bbcfe.jpg"],
        deliveryTime: "Instant", badge: "HOT", views: 1780, daysAgo: 1,
      },
      {
        slug: "coc-th15-5-workers-name-change",
        gameSlug: "clash-of-clans", gameName: "Clash of Clans",
        title: "TH15 · 5 Workers · Free Name Change · Starter Account",
        description: "Town Hall 15 with all 5 builders/workers active. Name change available. Great progression-ready account. Instant Supercell ID transfer with full access.",
        price: 12.99, originalPrice: 19.99,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6213164/gallery/58e83257-bef7-4f00-b333-343193769e7b.jpg"],
        deliveryTime: "Instant", badge: undefined, views: 289, daysAgo: 5,
      },
      {
        slug: "coc-th18-level-248-supercharger-max",
        gameSlug: "clash-of-clans", gameName: "Clash of Clans",
        title: "TH18 Level 248 — Supercharger Max · 6 Hero Max · 2000+ Gems",
        description: "High-level TH18 at player level 248. Supercharger fully maxed, all 6 heroes at maximum, 2000+ gems. Instant delivery with full email access.",
        price: 175.00, originalPrice: 220.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6255046/gallery/ed914123-fa2f-4369-b21a-202f7e787b4d.jpg"],
        deliveryTime: "Instant", badge: "POPULAR", views: 1340, daysAgo: 2,
      },
      {
        slug: "coc-th16-2000-gems-strong-defense",
        gameSlug: "clash-of-clans", gameName: "Clash of Clans",
        title: "TH16 · 2000+ Gems · 5 Builders · Strong Defense Layout",
        description: "Town Hall 16 with 2000+ gems stored, 5 active builders, strong anti-3-star base layout. Perfect mid-game account with room to grow. Clean Supercell ID.",
        price: 24.99, originalPrice: 39.99,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6185724/gallery/0b70154a-9aee-4f67-b834-a922122bbcfe.jpg"],
        deliveryTime: "Instant", badge: undefined, views: 198, daysAgo: 6,
      },

      // ── PUBG MOBILE / BGMI (10) ─────────────────────────────────────────────
      {
        slug: "pubg-m416-glacier-akm-glacier-duo-combo",
        gameSlug: "pubg-mobile", gameName: "PUBG Mobile / BGMI",
        title: "Glacier Duo Combo — M416 + AKM Glacier · Rare Sets · Season Conqueror",
        description: "Platinum ranked Level 75 account with dual Glacier loot crate combo — M416 Glacier and Red Day AKM. Rare fashion sets, 5 material slots, amazing car collection, OP emotes. Loaded secure account with full email access.",
        price: 163.69, originalPrice: 220.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6067613/gallery/aec3dfcd-c3a6-4cea-84af-d0fde410e3ef.png"],
        deliveryTime: "Instant", badge: "HOT", views: 2340, daysAgo: 1,
      },
      {
        slug: "pubg-conqueror-s16-s17-s19-phoenixtra-xsuit",
        gameSlug: "pubg-mobile", gameName: "PUBG Mobile / BGMI",
        title: "Conqueror S16/17/19 — PhoenixTra X-Suit 4★ · M416 Glacier + Fool Max",
        description: "Platinum Level 85 account with Conqueror titles and frames from Seasons 16, 17, and 19. PhoenixTra X-Suit (4-Star), M416 Glacier + Fool combo fully maxed, S4 RE2 frame, old rare emotes. Highly collectible secure account.",
        price: 291.15, originalPrice: 380.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6190890/gallery/4a74e2f2-85ba-499b-8dc5-15faf3b4365d.png"],
        deliveryTime: "Instant", badge: "POPULAR", views: 1876, daysAgo: 2,
      },
      {
        slug: "pubg-3x-xsuits-ultra-premium",
        gameSlug: "pubg-mobile", gameName: "PUBG Mobile / BGMI",
        title: "3x X-Suits Ultra Premium — Multiple Gun Labs · Conqueror Frames",
        description: "Ultra-premium account with 3 distinct X-Suits and multiple gunlab-upgradeable weapon skins. Conqueror frames from multiple seasons, rare emotes, and mythic lobby. Extremely rare collector-level account.",
        price: 489.99, originalPrice: 650.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6067613/gallery/aec3dfcd-c3a6-4cea-84af-d0fde410e3ef.png"],
        deliveryTime: "Instant", badge: "HOT", views: 3210, daysAgo: 1,
      },
      {
        slug: "pubg-m416-glacier-level-4-hit-effect",
        gameSlug: "pubg-mobile", gameName: "PUBG Mobile / BGMI",
        title: "M416 Glacier Level 4 — On-Hit Effect Unlocked · Good Rank",
        description: "Account featuring M416 Glacier upgraded to Level 4 with exclusive on-hit effect and loot crate animation unlocked. Good seasonal rank with clean login credentials.",
        price: 89.99, originalPrice: 120.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6190890/gallery/4a74e2f2-85ba-499b-8dc5-15faf3b4365d.png"],
        deliveryTime: "Instant", badge: undefined, views: 987, daysAgo: 3,
      },
      {
        slug: "pubg-trio-glacier-combo-stacked",
        gameSlug: "pubg-mobile", gameName: "PUBG Mobile / BGMI",
        title: "Trio Glacier Combo — M416 + Mini14 + Vector Glacier Skins",
        description: "Rare triple Glacier package — M416 Glacier, Mini14 Glacier, and Vector Glacier all in one account. Plus Conqueror frame and mythic fashion items. Stacked collection account.",
        price: 140.00, originalPrice: 190.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6067613/gallery/aec3dfcd-c3a6-4cea-84af-d0fde410e3ef.png"],
        deliveryTime: "Instant", badge: "POPULAR", views: 1450, daysAgo: 2,
      },
      {
        slug: "pubg-raven-xsuit-26x-gunlab",
        gameSlug: "pubg-mobile", gameName: "PUBG Mobile / BGMI",
        title: "Raven X-Suit · 26x Gunlab Weapon Skins · Ace Rank",
        description: "Account featuring the Raven X-Suit and 26 Gunlab-upgradeable weapon skins. Ace rank with seasonal frames. Great value for a collector account. Full secure login.",
        price: 59.99, originalPrice: 89.99,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6190890/gallery/4a74e2f2-85ba-499b-8dc5-15faf3b4365d.png"],
        deliveryTime: "Instant", badge: undefined, views: 760, daysAgo: 3,
      },
      {
        slug: "pubg-codebreaker-akm-lv4-35x-mythic",
        gameSlug: "pubg-mobile", gameName: "PUBG Mobile / BGMI",
        title: "Codebreaker AKM Lv.4 · 35x Mythic Fashion · Good Season Rank",
        description: "Level 4 Codebreaker AKM (upgraded gunlab) with 35 mythic fashion items. Decent season rank and multiple emote collection. Clean transferable account.",
        price: 34.00, originalPrice: 50.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6067613/gallery/aec3dfcd-c3a6-4cea-84af-d0fde410e3ef.png"],
        deliveryTime: "Instant", badge: undefined, views: 543, daysAgo: 4,
      },
      {
        slug: "pubg-rare-collector-account-999",
        gameSlug: "pubg-mobile", gameName: "PUBG Mobile / BGMI",
        title: "Collector's Edition — Extremely Rare Titles · Max Gun Skins · Mythic Lobby",
        description: "Collector's level PUBG Mobile account with extremely rare legacy titles, outfits, and maximum gun skins. Mythic Lobby frame, Season 1 exclusive items, multiple Conqueror frames. Once-in-a-lifetime find.",
        price: 999.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6190890/gallery/4a74e2f2-85ba-499b-8dc5-15faf3b4365d.png"],
        deliveryTime: "Instant", badge: "HOT", views: 4200, daysAgo: 1,
      },
      {
        slug: "pubg-xsuit-m416-glacier-max-combo",
        gameSlug: "pubg-mobile", gameName: "PUBG Mobile / BGMI",
        title: "X-Suit + M416 Glacier Max Combo · Season Conqueror Title",
        description: "Stacked account containing a premium X-Suit and fully maxed M416 Glacier skin. Season Conqueror title + frame. Multiple fashion outfits and a secure clean login.",
        price: 110.00, originalPrice: 150.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6067613/gallery/aec3dfcd-c3a6-4cea-84af-d0fde410e3ef.png"],
        deliveryTime: "Instant", badge: "POPULAR", views: 1120, daysAgo: 2,
      },
      {
        slug: "pubg-bgmi-crown-rank-starter",
        gameSlug: "pubg-mobile", gameName: "PUBG Mobile / BGMI",
        title: "Crown Rank Starter Account — Clean Login · Ready to Play",
        description: "BGMI Crown Rank account, clean social links, no restrictions, email and phone unlinked and ready for transfer. Perfect smurfing or fresh start account.",
        price: 6.15, originalPrice: 12.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6190890/gallery/4a74e2f2-85ba-499b-8dc5-15faf3b4365d.png"],
        deliveryTime: "Instant", badge: undefined, views: 321, daysAgo: 5,
      },

      // ── FREE FIRE (10) ──────────────────────────────────────────────────────
      {
        slug: "ff-level-61-5yr-draco-m10-lol-emote",
        gameSlug: "free-fire", gameName: "Free Fire",
        title: "Level 61 · 5-Year-Old Account · Draco M10 · LOL Emote",
        description: "5-year veteran Free Fire account at level 61. Contains the Draco M10 rare weapon skin and the exclusive LOL emote. Instant delivery with full game login credentials.",
        price: 25.27, originalPrice: 40.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6226793/gallery/2104b9c9-83b5-4767-b4df-a89e759a0758.jpg"],
        deliveryTime: "Instant", badge: undefined, views: 456, daysAgo: 3,
      },
      {
        slug: "ff-heroic-level-64-prime4-52bundles-evo",
        gameSlug: "free-fire", gameName: "Free Fire",
        title: "Heroic S52 · Level 64 · Prime 4 · 52 Bundles · 3 Evo + 29 Mythic Weapons",
        description: "LATAM server Heroic rank Level 64 account. Prime season 4, 65 characters unlocked, 52 bundles, 147 costumes, 222 weapon skins (3 Evo + 29 Mythic). XM8 Destiny Lv4, MP40 Chromasonic Lv4. Absolute powerhouse account.",
        price: 52.61, originalPrice: 80.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6258601/gallery/69d58882-0a80-4270-84bc-cb5fac11f0af.jpg"],
        deliveryTime: "Instant", badge: "HOT", views: 1560, daysAgo: 1,
      },
      {
        slug: "ff-heroic-level-81-670-gun-skins-prime7",
        gameSlug: "free-fire", gameName: "Free Fire",
        title: "Heroic Level 81 · 670+ Gun Skins · 630+ Fashion · Prime 7 · 4 Evo Max",
        description: "India region Heroic Level 81 mega-stacked account. 670+ gun skins, 630+ fashion items, 4 Evo guns fully maxed, 334 rare bundles, 119 mythic items, Prime level 7, 631 rare T-shirts. Ultimate collection.",
        price: 233.84, originalPrice: 320.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6192164/gallery/9f2d8523-3c61-460d-b067-424481a58b95.jpg"],
        deliveryTime: "Instant", badge: "POPULAR", views: 2890, daysAgo: 1,
      },
      {
        slug: "ff-4x-evo-prime5-stacked-na",
        gameSlug: "free-fire", gameName: "Free Fire",
        title: "4x Evo Guns · Prime Level 5 · Stacked NA Server Account",
        description: "North American server account with 4 Evolution gun skins, Prime level 5 nearly achieved, stacked with elite items and rare bundles. Great value collection account.",
        price: 49.90, originalPrice: 70.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6226793/gallery/2104b9c9-83b5-4767-b4df-a89e759a0758.jpg"],
        deliveryTime: "Instant", badge: "HOT", views: 980, daysAgo: 2,
      },
      {
        slug: "ff-5yr-singapore-legacy-skins",
        gameSlug: "free-fire", gameName: "Free Fire",
        title: "5-Year Singapore Server · Legacy Badges · Classic OG Skins",
        description: "Old collector's account from Singapore server, 5 years active with legacy achievement badges and classic OG skins unavailable on new accounts. Great starter value.",
        price: 15.50, originalPrice: 25.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6258601/gallery/69d58882-0a80-4270-84bc-cb5fac11f0af.jpg"],
        deliveryTime: "Instant", badge: undefined, views: 378, daysAgo: 4,
      },
      {
        slug: "ff-level-67-6-major-evo-m1887-top",
        gameSlug: "free-fire", gameName: "Free Fire",
        title: "Level 67 · 6 Major Evo Guns · Top M1887 · Full Access",
        description: "Level 67 high-tier account with 6 major Evolution gun skins, top-tier M1887 maxed, full email access included. Competitive account ready for ranked matches.",
        price: 24.90, originalPrice: 40.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6192164/gallery/9f2d8523-3c61-460d-b067-424481a58b95.jpg"],
        deliveryTime: "Instant", badge: undefined, views: 567, daysAgo: 3,
      },
      {
        slug: "ff-level-60-top-dress-gun-collection",
        gameSlug: "free-fire", gameName: "Free Fire",
        title: "Level 60 · Top Dress Collection · Outstanding Gun Skins · Full Access",
        description: "Level 60 Free Fire account containing exclusive elite dresses, outstanding gun collections across all weapon types, full email access. Entry-ready competitive account.",
        price: 24.90, originalPrice: 38.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6226793/gallery/2104b9c9-83b5-4767-b4df-a89e759a0758.jpg"],
        deliveryTime: "Instant", badge: undefined, views: 443, daysAgo: 4,
      },
      {
        slug: "ff-2x-evo-angelic-prime3-indo",
        gameSlug: "free-fire", gameName: "Free Fire",
        title: "2x Evo (1 Max) · Angelic Wings · Prime Level 3-4 · Indonesia Server",
        description: "Indonesia server account with 2 Evolution skins (one fully maxed), rare Angelic pants and wings combo, Prime level 3-4, great overall collection of bundles.",
        price: 49.55, originalPrice: 70.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6258601/gallery/69d58882-0a80-4270-84bc-cb5fac11f0af.jpg"],
        deliveryTime: "Instant", badge: "POPULAR", views: 720, daysAgo: 3,
      },
      {
        slug: "ff-grandmaster-sakura-s1-og-titan-scar",
        gameSlug: "free-fire", gameName: "Free Fire",
        title: "Grandmaster · OG Sakura S1 Bundle · Maxed Titan SCAR · 12 Evo Guns",
        description: "Ultra-rare OG Season 1 Sakura Bundle, Hip Hop Bundle, Maxed Titan SCAR, 12 Evolution Guns maxed, Grandmaster badge. One of the rarest Free Fire accounts available.",
        price: 129.99, originalPrice: 180.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6192164/gallery/9f2d8523-3c61-460d-b067-424481a58b95.jpg"],
        deliveryTime: "Instant", badge: "HOT", views: 3100, daysAgo: 1,
      },
      {
        slug: "ff-fresh-starter-account-full-access",
        gameSlug: "free-fire", gameName: "Free Fire",
        title: "Fresh Starter Account · No Ban History · Full Game Access",
        description: "Clean fresh Free Fire account with zero ban history. Perfect for players wanting a fresh start or backup account. Full credentials provided, instant delivery.",
        price: 4.99, originalPrice: 9.99,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6226793/gallery/2104b9c9-83b5-4767-b4df-a89e759a0758.jpg"],
        deliveryTime: "Instant", badge: undefined, views: 210, daysAgo: 6,
      },

      // ── ROBLOX (10) ─────────────────────────────────────────────────────────
      {
        slug: "roblox-2007-og-rare-account-20k-rap",
        gameSlug: "roblox", gameName: "Roblox",
        title: "2007 OG Account · 20K RAP Limiteds · Veteran Badge · Unverified",
        description: "Retro 2007 Roblox account with 20k RAP (Recent Average Price) in limited items. Veteran badge, unverified and transferable. Rare collector-grade account.",
        price: 75.00, originalPrice: 110.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/4013208/gallery/34aeb225-e312-4483-a1fb-b541540058dc.png"],
        deliveryTime: "Instant", badge: "HOT", views: 1870, daysAgo: 1,
      },
      {
        slug: "roblox-3-letter-username-ezd-2008",
        gameSlug: "roblox", gameName: "Roblox",
        title: "3-Letter Username @EZD · Created 2008 · Unverified · Collector",
        description: "Extremely rare 3-letter username Roblox account created in 2008. Unverified and pristine. High collector demand. Veteran badge, original 2008 join date visible.",
        price: 550.00, originalPrice: 700.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/4013208/gallery/34aeb225-e312-4483-a1fb-b541540058dc.png"],
        deliveryTime: "Instant", badge: "POPULAR", views: 4200, daysAgo: 1,
      },
      {
        slug: "roblox-blox-fruits-level-2800-godhuman",
        gameSlug: "roblox", gameName: "Roblox",
        title: "Blox Fruits Level 2800 · Godhuman Unlocked · Gravity Fruit",
        description: "Specialized Blox Fruits Roblox account at max level 2800, Godhuman fighting style unlocked, Gravity fruit in inventory. Race V4 completed. Ready for endgame content.",
        price: 18.99, originalPrice: 29.99,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/5353349/gallery/123-fd58c123-c94c-45f4-b70b-37ff033daee9-webp.webp"],
        deliveryTime: "Instant", badge: undefined, views: 890, daysAgo: 2,
      },
      {
        slug: "roblox-4-letter-username-oxqr-unverified",
        gameSlug: "roblox", gameName: "Roblox",
        title: "4-Letter Username @oxqr · Unverified · High Collector Value",
        description: "Premium unverified 4-letter username Roblox account. High collector value due to short username scarcity. Clean profile with no bans.",
        price: 109.99, originalPrice: 150.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/4013208/gallery/34aeb225-e312-4483-a1fb-b541540058dc.png"],
        deliveryTime: "Instant", badge: "POPULAR", views: 1230, daysAgo: 2,
      },
      {
        slug: "roblox-adopt-me-1125-pots-660k-bucks",
        gameSlug: "roblox", gameName: "Roblox",
        title: "Adopt Me Specialist · 1125+ Potions · 660K+ Bucks",
        description: "Roblox account optimized for Adopt Me with 1125+ potions and 660,000+ game bucks. Perfect for pet hatching and trading. Instant delivery with full login.",
        price: 14.29, originalPrice: 22.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/5353349/gallery/123-fd58c123-c94c-45f4-b70b-37ff033daee9-webp.webp"],
        deliveryTime: "Instant", badge: undefined, views: 543, daysAgo: 3,
      },
      {
        slug: "roblox-2016-korblox-headless-150k-rap",
        gameSlug: "roblox", gameName: "Roblox",
        title: "2016 Veteran · Korblox Deathspeaker + Headless Horseman · 150K+ RAP",
        description: "Created in 2016 with Korblox Deathspeaker, Headless Horseman, 150k+ RAP limiteds, Blox Fruits maxed with Kitsune & Leopard fruits, 15,000 Robux balance. Top-tier rare account.",
        price: 189.99,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/4013208/gallery/34aeb225-e312-4483-a1fb-b541540058dc.png"],
        deliveryTime: "Instant", badge: "HOT", views: 3600, daysAgo: 1,
      },
      {
        slug: "roblox-jailbreak-4m-cash-instant",
        gameSlug: "roblox", gameName: "Roblox",
        title: "Jailbreak Account · $4,000,000 Cash · Top-Tier Vehicles · Instant",
        description: "Jailbreak-focused Roblox account featuring $4,000,000 cash balance, top-tier vehicle collection, and all Criminal/Cop gear. Jump straight into endgame content.",
        price: 8.99, originalPrice: 14.99,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/5353349/gallery/123-fd58c123-c94c-45f4-b70b-37ff033daee9-webp.webp"],
        deliveryTime: "Instant", badge: undefined, views: 412, daysAgo: 4,
      },
      {
        slug: "roblox-passport-verified-voice-chat-18plus",
        gameSlug: "roblox", gameName: "Roblox",
        title: "Passport ID Verified · Voice Chat Enabled · 20+ Age Group",
        description: "Roblox account with Passport ID verification completed, voice chat enabled, and 20+ age group access unlocked. Ideal for users wanting verified voice-enabled communities.",
        price: 14.99, originalPrice: 24.99,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/5353349/gallery/123-fd58c123-c94c-45f4-b70b-37ff033daee9-webp.webp"],
        deliveryTime: "Instant", badge: undefined, views: 567, daysAgo: 3,
      },
      {
        slug: "roblox-2024-account-34-offsale-voice-verified",
        gameSlug: "roblox", gameName: "Roblox",
        title: "2024 Account · 34 Offsale Items · Voice Verified · 3 RAP Inventory",
        description: "2024-created Roblox account with 34 offsale limited items in inventory, voice verification completed, and 3 RAP value. Great starter collector account.",
        price: 9.99, originalPrice: 15.99,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6280457/gallery/24-10bVNN.png"],
        deliveryTime: "Instant", badge: undefined, views: 298, daysAgo: 5,
      },
      {
        slug: "roblox-100-robux-fresh-account",
        gameSlug: "roblox", gameName: "Roblox",
        title: "Fresh Account · 100 Robux Balance · Clean Profile",
        description: "Clean fresh Roblox account with 100 Robux balance loaded. Perfect for players wanting a new account with starting currency. Instant delivery.",
        price: 3.99, originalPrice: 6.99,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6280457/gallery/24-10bVNN.png"],
        deliveryTime: "Instant", badge: undefined, views: 187, daysAgo: 7,
      },

      // ── CLASH ROYALE (10) ───────────────────────────────────────────────────
      {
        slug: "cr-kt15-arena24-evo13-9780-trophies",
        gameSlug: "clash-royale", gameName: "Clash Royale",
        title: "King Tower 15 · Arena 24 · 13 Evos · 9780 Trophies",
        description: "Clash Royale King Tower 15 account in Arena 24. Level 56 player, 13 Evolution cards unlocked, 9780 trophies. Full access account with instant delivery.",
        price: 16.36, originalPrice: 25.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6251638/gallery/4d5d35d1-6e7c-444f-a5f3-f8f3b235086e.jpeg"],
        deliveryTime: "Instant", badge: undefined, views: 432, daysAgo: 3,
      },
      {
        slug: "cr-kt15-emperor-emote-9282-trophies-evo24",
        gameSlug: "clash-royale", gameName: "Clash Royale",
        title: "KT15 · Emperor King Emote · 9282 Trophies · 17+ Evos · 83 Lv14 Cards",
        description: "King Tower 15 featuring the rare Emperor King Emote, Collection Level 1680, 83 cards at Level 14, Bomberloon and Laughing Hog emotes, 9282 trophies. Cheapest on the market.",
        price: 46.76, originalPrice: 65.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6249301/gallery/49baeb3e-5d6b-4986-868f-961c06e2859f.jpg"],
        deliveryTime: "Instant", badge: "POPULAR", views: 1120, daysAgo: 2,
      },
      {
        slug: "cr-kt14-9yr-og-11021-trophies-th11-bonus",
        gameSlug: "clash-royale", gameName: "Clash Royale",
        title: "9-Year OG Account · 11,021 Trophies · 8 Evos · 3K+ Gems · +TH11 CoC Bonus",
        description: "Rare 9-year-old Clash Royale OG account. 11,021 trophies, Level 16 cards, 8 Evolution cards, 3000+ gems, plus a bonus near-maxed TH11 Clash of Clans account included.",
        price: 198.77, originalPrice: 280.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6267350/gallery/e5cdf593-cfb8-4dfe-bbdd-6c0b76bb53e5.jpg"],
        deliveryTime: "Instant", badge: "HOT", views: 2340, daysAgo: 1,
      },
      {
        slug: "cr-kt16-24k-gems",
        gameSlug: "clash-royale", gameName: "Clash Royale",
        title: "King Tower 16 · 24,000 Gems · Competitive Deck Ready",
        description: "King Tower 16 account preloaded with 24,000+ Gems. Competitive deck ready for high ladder. Multiple tower skins and banner customizations included.",
        price: 79.00, originalPrice: 110.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6251638/gallery/4d5d35d1-6e7c-444f-a5f3-f8f3b235086e.jpeg"],
        deliveryTime: "Instant", badge: "POPULAR", views: 980, daysAgo: 2,
      },
      {
        slug: "cr-8306-trophies-14-evos",
        gameSlug: "clash-royale", gameName: "Clash Royale",
        title: "8306 Trophies · 14 Evolution Cards · High Level Account",
        description: "Clash Royale account with 8306 Path of Legends trophies and 14 fully unlocked Evolution cards. Competitive account ready for Challenger and Master tiers.",
        price: 17.00, originalPrice: 28.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6249301/gallery/49baeb3e-5d6b-4986-868f-961c06e2859f.jpg"],
        deliveryTime: "Instant", badge: undefined, views: 567, daysAgo: 3,
      },
      {
        slug: "cr-kt15-17-evo-2-cards-lv16-64-emojis",
        gameSlug: "clash-royale", gameName: "Clash Royale",
        title: "KT15 · 17+ Evos · 2 Cards Lv16 · 10600 Trophies · Arena 26 · 64 Emojis",
        description: "Top-tier KT15 account reaching Arena 26 and 10600 trophies. 17+ Evolution cards, 2 cards upgraded to Level 16, 64 custom emojis unlocked.",
        price: 49.99, originalPrice: 75.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6267350/gallery/e5cdf593-cfb8-4dfe-bbdd-6c0b76bb53e5.jpg"],
        deliveryTime: "Instant", badge: "HOT", views: 1430, daysAgo: 2,
      },
      {
        slug: "cr-lv65-24-evo-7-max-cards",
        gameSlug: "clash-royale", gameName: "Clash Royale",
        title: "Level 65 · 24+ Evolution Cards · 7+ Max Cards · Path of Legends",
        description: "Level 65 Clash Royale account with 24+ Evolution cards and 7+ max level cards. Strong Path of Legends ranking. All tower skins and banner options available.",
        price: 95.00, originalPrice: 130.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6251638/gallery/4d5d35d1-6e7c-444f-a5f3-f8f3b235086e.jpeg"],
        deliveryTime: "Instant", badge: "POPULAR", views: 1100, daysAgo: 2,
      },
      {
        slug: "cr-goblin-kiss-trophy-emote-82-max-cards",
        gameSlug: "clash-royale", gameName: "Clash Royale",
        title: "Goblin Kiss Trophy Emote · 82 Max Cards · Ultimate Collector",
        description: "Features the incredibly rare Goblin Kiss Trophy Emote alongside 82 fully maxed Level 15 cards. One of the most complete accounts available on the market.",
        price: 100.00, originalPrice: 140.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6249301/gallery/49baeb3e-5d6b-4986-868f-961c06e2859f.jpg"],
        deliveryTime: "Instant", badge: "HOT", views: 1780, daysAgo: 1,
      },
      {
        slug: "cr-fully-max-acc-selling",
        gameSlug: "clash-royale", gameName: "Clash Royale",
        title: "Fully Maxed Account — All Cards Max · All Tower Skins · Gems Included",
        description: "Ultimate Clash Royale account, fully maxed cards and tower skins. Every card at maximum level, all Evolutions unlocked, gems included, ready for immediate competitive play.",
        price: 700.00,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6267350/gallery/e5cdf593-cfb8-4dfe-bbdd-6c0b76bb53e5.jpg"],
        deliveryTime: "Instant", badge: "HOT", views: 5100, daysAgo: 1,
      },
      {
        slug: "cr-kt16-28-evo-free-nc",
        gameSlug: "clash-royale", gameName: "Clash Royale",
        title: "KT16 · 28 Evolution Cards · Free Name Change · Competitive Ready",
        description: "King Tower 16 account with 28 Evolution cards unlocked — one of the highest Evo counts available. Free name change included. Competitive deck optimized for current meta.",
        price: 59.99, originalPrice: 89.99,
        images: ["https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6251638/gallery/4d5d35d1-6e7c-444f-a5f3-f8f3b235086e.jpeg"],
        deliveryTime: "Instant", badge: "POPULAR", views: 1560, daysAgo: 2,
      },
    ];

    let count = 0;
    for (const l of listings) {
      const gameId = gameMap[l.gameSlug];
      if (!gameId) continue;

      await ctx.db.insert("listings", {
        sellerId,
        gameId,
        categoryId,
        title: l.title,
        slug: l.slug,
        description: l.description,
        price: l.price,
        originalPrice: l.originalPrice,
        images: l.images,
        deliveryTime: l.deliveryTime,
        deliveryMethod: "manual" as const,
        status: "active" as const,
        views: l.views,
        badge: l.badge,
        createdAt: now - 86400000 * l.daysAgo,
        updatedAt: now - 86400000 * l.daysAgo,
      });
      count++;
    }

    return { status: "listings_seeded", count };
  },
});

// Helper: wipe all listings so you can re-seed cleanly
export const clearListings = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("listings").collect();
    for (const l of all) await ctx.db.delete(l._id);
    return { cleared: all.length };
  },
});
