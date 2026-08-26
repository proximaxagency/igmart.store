import { mutation } from "./_generated/server";

// Run this once from the Convex dashboard to seed 10 realistic sellers
// and re-assign existing listings among them.
export const seedRealSellers = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const sellers = [
      {
        clerkId: "seed_seller_001",
        email: "rajveer.gaming@gmail.com",
        username: "RajveerVault",
        displayName: "Rajveer Gaming Vault",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=rajveer&backgroundColor=b6e3f4",
        role: "seller" as const,
        status: "active" as const,
        isVerified: true,
        rating: 4.97,
        totalReviews: 2841,
        totalOrders: 5290,
        responseRate: "99%",
        bio: "India's #1 Clash of Clans account seller. 5+ years of experience. Instant Supercell ID transfer guaranteed.",
        walletBalance: 1842.5,
        pendingBalance: 340.0,
        sellerSince: now - 1000 * 60 * 60 * 24 * 365 * 4,
      },
      {
        clerkId: "seed_seller_002",
        email: "nexusgames.store@outlook.com",
        username: "NexusGameStore",
        displayName: "Nexus Game Store",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=nexus&backgroundColor=c0aede",
        role: "seller" as const,
        status: "active" as const,
        isVerified: true,
        rating: 4.94,
        totalReviews: 1920,
        totalOrders: 3870,
        responseRate: "98%",
        bio: "Verified PUBG Mobile & BGMI account seller. All accounts are clean with full email access.",
        walletBalance: 920.0,
        pendingBalance: 180.0,
        sellerSince: now - 1000 * 60 * 60 * 24 * 365 * 3,
      },
      {
        clerkId: "seed_seller_003",
        email: "fflegends.official@gmail.com",
        username: "FF_LegendsStore",
        displayName: "FF Legends Store",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=fflegend&backgroundColor=ffd5dc",
        role: "seller" as const,
        status: "active" as const,
        isVerified: true,
        rating: 4.96,
        totalReviews: 4120,
        totalOrders: 7800,
        responseRate: "100%",
        bio: "Specializing in OG Free Fire accounts with Grand Master rank, rare bundles, and maxed Evo guns. 4+ years selling.",
        walletBalance: 2310.75,
        pendingBalance: 520.0,
        sellerSince: now - 1000 * 60 * 60 * 24 * 365 * 4,
      },
      {
        clerkId: "seed_seller_004",
        email: "bloxempire99@gmail.com",
        username: "BloxEmpire99",
        displayName: "BloxEmpire",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=bloxempire&backgroundColor=d1f4cc",
        role: "seller" as const,
        status: "active" as const,
        isVerified: true,
        rating: 4.91,
        totalReviews: 5320,
        totalOrders: 9100,
        responseRate: "99%",
        bio: "Premier Roblox marketplace. Veteran accounts (2015-2018), Korblox, Headless, Blox Fruits max builds. 15,000+ sales.",
        walletBalance: 3120.0,
        pendingBalance: 640.0,
        sellerSince: now - 1000 * 60 * 60 * 24 * 365 * 5,
      },
      {
        clerkId: "seed_seller_005",
        email: "clashroyal.pro@hotmail.com",
        username: "CR_ProDecks",
        displayName: "CR Pro Decks",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=crpro&backgroundColor=b6e3f4",
        role: "seller" as const,
        status: "active" as const,
        isVerified: true,
        rating: 4.89,
        totalReviews: 1450,
        totalOrders: 2800,
        responseRate: "97%",
        bio: "Top Clash Royale account dealer. All accounts above 9000 trophies with max evolutions. Supercell ID ready.",
        walletBalance: 760.5,
        pendingBalance: 90.0,
        sellerSince: now - 1000 * 60 * 60 * 24 * 365 * 2,
      },
      {
        clerkId: "seed_seller_006",
        email: "akash.trademax@gmail.com",
        username: "TradeMax_Akash",
        displayName: "TradeMax by Akash",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=trademax&backgroundColor=ffdfbf",
        role: "seller" as const,
        status: "active" as const,
        isVerified: true,
        rating: 4.93,
        totalReviews: 2200,
        totalOrders: 4100,
        responseRate: "98%",
        bio: "Multi-game seller: CoC, BGMI, Free Fire. Trusted since 2020. 4000+ happy buyers. Fast delivery, always clean accounts.",
        walletBalance: 1480.0,
        pendingBalance: 200.0,
        sellerSince: now - 1000 * 60 * 60 * 24 * 365 * 4,
      },
      {
        clerkId: "seed_seller_007",
        email: "eliteaccounthub@gmail.com",
        username: "EliteAccountHub",
        displayName: "Elite Account Hub",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=elitehub&backgroundColor=c0aede",
        role: "seller" as const,
        status: "active" as const,
        isVerified: false,
        rating: 4.78,
        totalReviews: 680,
        totalOrders: 1200,
        responseRate: "95%",
        bio: "Affordable verified gaming accounts. PUBG, Free Fire, Roblox. All with email access. New to IGMART but 3 years in the trade.",
        walletBalance: 320.0,
        pendingBalance: 60.0,
        sellerSince: now - 1000 * 60 * 60 * 24 * 365 * 1,
      },
      {
        clerkId: "seed_seller_008",
        email: "supercell.kings@gmail.com",
        username: "SupercellKings",
        displayName: "Supercell Kings",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=supercellkings&backgroundColor=ffd5dc",
        role: "seller" as const,
        status: "active" as const,
        isVerified: true,
        rating: 4.99,
        totalReviews: 3500,
        totalOrders: 6800,
        responseRate: "100%",
        bio: "Exclusive Clash of Clans & Clash Royale specialist. TH17/TH18 max accounts. Delivery in under 10 minutes. 6+ years.",
        walletBalance: 4200.0,
        pendingBalance: 780.0,
        sellerSince: now - 1000 * 60 * 60 * 24 * 365 * 6,
      },
      {
        clerkId: "seed_seller_009",
        email: "pubgvault.in@gmail.com",
        username: "PUBG_VaultIndia",
        displayName: "PUBG Vault India",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=pubgvault&backgroundColor=d1f4cc",
        role: "seller" as const,
        status: "active" as const,
        isVerified: true,
        rating: 4.92,
        totalReviews: 1820,
        totalOrders: 3400,
        responseRate: "99%",
        bio: "BGMI & PUBG Global conqueror-tier accounts. M416 Glacier Lv7, X-Suits, Blood Raven. Unlinked and ready to transfer.",
        walletBalance: 1100.0,
        pendingBalance: 250.0,
        sellerSince: now - 1000 * 60 * 60 * 24 * 365 * 3,
      },
      {
        clerkId: "seed_seller_010",
        email: "gamemarketpro@proton.me",
        username: "GameMarketPro",
        displayName: "GameMarket Pro",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=gamemarketpro&backgroundColor=b6e3f4",
        role: "seller" as const,
        status: "active" as const,
        isVerified: true,
        rating: 4.85,
        totalReviews: 940,
        totalOrders: 1750,
        responseRate: "96%",
        bio: "All games, all platforms. Specializing in rare and OG accounts. Secure escrow payments accepted. Worldwide delivery.",
        walletBalance: 540.0,
        pendingBalance: 80.0,
        sellerSince: now - 1000 * 60 * 60 * 24 * 365 * 2,
      },
    ];

    const sellerIds: string[] = [];

    for (const s of sellers) {
      // Check if already exists
      const existing = await ctx.db.query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", s.clerkId))
        .unique();

      if (existing) {
        // Update existing
        await ctx.db.patch(existing._id, {
          displayName: s.displayName,
          avatarUrl: s.avatarUrl,
          isVerified: s.isVerified,
          rating: s.rating,
          totalReviews: s.totalReviews,
          totalOrders: s.totalOrders,
          responseRate: s.responseRate,
          bio: s.bio,
          walletBalance: s.walletBalance,
          pendingBalance: s.pendingBalance,
          updatedAt: now,
        });
        sellerIds.push(existing._id);
      } else {
        const id = await ctx.db.insert("users", {
          ...s,
          createdAt: s.sellerSince,
          updatedAt: now,
          lastSeenAt: now - 1000 * 60 * Math.floor(Math.random() * 60 * 24 * 7), // last seen within a week
        });
        sellerIds.push(id);
      }
    }

    // Now fetch all active listings and reassign sellers
    const listings = await ctx.db.query("listings").collect();
    let assignCount = 0;
    for (let i = 0; i < listings.length; i++) {
      const sellerId = sellerIds[i % sellerIds.length] as any;
      await ctx.db.patch(listings[i]._id, { sellerId, updatedAt: now });
      assignCount++;
    }

    return {
      sellersCreated: sellerIds.length,
      listingsReassigned: assignCount,
    };
  },
});
