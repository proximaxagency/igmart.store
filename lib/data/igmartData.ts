// IGMART.STORE — Complete Application Data
// All demo/seed data. Replace with real Convex queries when backend is connected.

export const GAMES = [
  { id: "valorant", name: "Valorant", slug: "valorant", category: "FPS", image: "/images/guide-valorant.png", sellers: 342, listings: 8621, rating: 4.9, popular: true },
  { id: "fortnite", name: "Fortnite", slug: "fortnite", category: "Battle Royale", image: "/images/guide-fortnite.png", sellers: 289, listings: 6840, rating: 4.8, popular: true },
  { id: "minecraft", name: "Minecraft", slug: "minecraft", category: "Sandbox", image: "/images/guide-minecraft.png", sellers: 415, listings: 12305, rating: 4.9, popular: true },
  { id: "lol", name: "League of Legends", slug: "league-of-legends", category: "MOBA", image: "/images/guide-lol.png", sellers: 521, listings: 9432, rating: 4.7, popular: true },
  { id: "gtav", name: "GTA V", slug: "gta-v", category: "Open World", image: "/images/guide-gta.png", sellers: 198, listings: 4217, rating: 4.8, popular: true },
  { id: "apex", name: "Apex Legends", slug: "apex-legends", category: "Battle Royale", image: "/images/guide-apex.png", sellers: 176, listings: 3891, rating: 4.7, popular: false },
  { id: "wow", name: "World of Warcraft", slug: "world-of-warcraft", category: "MMORPG", image: "/images/guide-safety.png", sellers: 634, listings: 15200, rating: 4.8, popular: false },
  { id: "cs2", name: "CS2", slug: "cs2", category: "FPS", image: "/images/guide-beginners.png", sellers: 892, listings: 22100, rating: 4.9, popular: true },
  { id: "roblox", name: "Roblox", slug: "roblox", category: "Sandbox", image: "/images/guide-valorant.png", sellers: 1203, listings: 31450, rating: 4.6, popular: false },
  { id: "fifa25", name: "FC 25", slug: "fc-25", category: "Sports", image: "/images/guide-fortnite.png", sellers: 445, listings: 8920, rating: 4.7, popular: true },
];

export const CATEGORIES = [
  { id: "accounts", name: "Accounts", slug: "accounts", icon: "👤", description: "Buy and sell gaming accounts", count: 45231 },
  { id: "items", name: "Items", slug: "items", icon: "📦", description: "In-game items and equipment", count: 32104 },
  { id: "currency", name: "Currency", slug: "currency", icon: "💰", description: "Game coins and credits", count: 28765 },
  { id: "boosting", name: "Boosting", slug: "boosting", icon: "⚡", description: "Rank boosting services", count: 15432 },
  { id: "services", name: "Services", slug: "services", icon: "🛠️", description: "Gaming services and coaching", count: 9876 },
  { id: "game-keys", name: "Game Keys", slug: "game-keys", icon: "🔑", description: "CD keys and activation codes", count: 7654 },
  { id: "top-ups", name: "Top-ups", slug: "top-ups", icon: "➕", description: "Credit top-ups and gift cards", count: 5432 },
];

export const LISTINGS = [
  {
    id: "lst_001", title: "Valorant Immortal 1 Account — NA Server", game: "Valorant", category: "accounts",
    price: 89.99, originalPrice: 120, seller: "ProSeller_V", sellerRating: 4.97, sellerOrders: 2341,
    rating: 4.9, reviews: 187, delivery: "Instant", image: "/images/guide-valorant.png",
    badge: "HOT", description: "Fully hand-leveled Immortal 1 account. All agents unlocked. 200+ skins. No bans.",
    verified: true, slug: "valorant-immortal-1-na",
  },
  {
    id: "lst_002", title: "Fortnite OG Account — Chapter 1 Skins", game: "Fortnite", category: "accounts",
    price: 145.00, originalPrice: null, seller: "FortKing", sellerRating: 4.95, sellerOrders: 891,
    rating: 4.8, reviews: 74, delivery: "Instant", image: "/images/guide-fortnite.png",
    badge: "POPULAR", description: "Rare Chapter 1 skins including Black Knight, Renegade Raider, and more.",
    verified: true, slug: "fortnite-og-chapter1",
  },
  {
    id: "lst_003", title: "Minecraft Java Edition Account", game: "Minecraft", category: "accounts",
    price: 18.99, originalPrice: 26.99, seller: "MCVault", sellerRating: 4.99, sellerOrders: 5621,
    rating: 5.0, reviews: 341, delivery: "Instant", image: "/images/guide-minecraft.png",
    badge: "SALE", description: "Full Java Edition account. Migration-ready. Verified email included.",
    verified: true, slug: "minecraft-java-account",
  },
  {
    id: "lst_004", title: "League of Legends Diamond Account — EUW", game: "League of Legends", category: "accounts",
    price: 67.00, originalPrice: null, seller: "LolBooster99", sellerRating: 4.89, sellerOrders: 1203,
    rating: 4.7, reviews: 98, delivery: "1-3 hours", image: "/images/guide-lol.png",
    badge: null, description: "Diamond 4 account EUW. 100+ champions. All ranked modes available.",
    verified: false, slug: "lol-diamond-euw",
  },
  {
    id: "lst_005", title: "GTA V Modded Money — $500M PS5", game: "GTA V", category: "currency",
    price: 24.99, originalPrice: null, seller: "GTAGold", sellerRating: 4.92, sellerOrders: 3401,
    rating: 4.8, reviews: 229, delivery: "Instant", image: "/images/guide-gta.png",
    badge: "HOT", description: "$500 million modded cash drop. Safe and undetectable. PS5 only.",
    verified: true, slug: "gta-money-500m-ps5",
  },
  {
    id: "lst_006", title: "Apex Legends Diamond Rank Boost", game: "Apex Legends", category: "boosting",
    price: 55.00, originalPrice: 75, seller: "ApexPro", sellerRating: 4.94, sellerOrders: 782,
    rating: 4.9, reviews: 63, delivery: "2-5 days", image: "/images/guide-apex.png",
    badge: "SALE", description: "Professional Diamond rank boost. VPN protected. No login required option.",
    verified: true, slug: "apex-diamond-boost",
  },
  {
    id: "lst_007", title: "WoW Classic Gold — 500G Alliance", game: "World of Warcraft", category: "currency",
    price: 12.50, originalPrice: null, seller: "WoWGoldVault", sellerRating: 4.98, sellerOrders: 8921,
    rating: 4.9, reviews: 512, delivery: "Instant", image: "/images/guide-safety.png",
    badge: "POPULAR", description: "500 Gold for Alliance WoW Classic. Fast delivery, face-to-face trade.",
    verified: true, slug: "wow-classic-500g-alliance",
  },
  {
    id: "lst_008", title: "CS2 Prime Account — Gold Nova Master", game: "CS2", category: "accounts",
    price: 32.00, originalPrice: null, seller: "CSMarket", sellerRating: 4.91, sellerOrders: 4102,
    rating: 4.8, reviews: 198, delivery: "Instant", image: "/images/guide-beginners.png",
    badge: null, description: "Prime CS2 account at GN Master. Clean history, VAC free. Full access.",
    verified: true, slug: "cs2-prime-gnmaster",
  },
];

export const SELLERS = [
  {
    id: "sel_001", username: "ProSeller_V", displayName: "ProSeller V", avatar: "/images/guide-valorant.png",
    rating: 4.97, reviews: 2341, orders: 4821, memberSince: "Jan 2022", responseTime: "< 5 min",
    responseRate: "99%", verified: true, about: "Professional gaming marketplace seller. Specialized in Valorant and CS2 accounts.",
    topSeller: true,
  },
  {
    id: "sel_002", username: "MCVault", displayName: "MCVault", avatar: "/images/guide-minecraft.png",
    rating: 4.99, reviews: 5621, orders: 9103, memberSince: "Mar 2021", responseTime: "< 2 min",
    responseRate: "100%", verified: true, about: "Your #1 source for Minecraft accounts and items.",
    topSeller: true,
  },
  {
    id: "sel_003", username: "WoWGoldVault", displayName: "WoW Gold Vault", avatar: "/images/guide-safety.png",
    rating: 4.98, reviews: 8921, orders: 15240, memberSince: "Jun 2020", responseTime: "< 3 min",
    responseRate: "99%", verified: true, about: "Premium WoW gold seller since 2020. Serving EU and US servers.",
    topSeller: true,
  },
];

export const REVIEWS = [
  { id: "rev_001", author: "Alex M.", rating: 5, title: "Fast and reliable", body: "Transaction was smooth and the seller delivered within minutes. IGMART made the whole process super easy.", date: "Aug 3, 2026", game: "Valorant", verified: true },
  { id: "rev_002", author: "Sarah K.", rating: 5, title: "Best marketplace around", body: "I've tried other platforms but IGMART has the best selection and the most trustworthy sellers.", date: "Jul 28, 2026", game: "Fortnite", verified: true },
  { id: "rev_003", author: "J***n", rating: 5, title: "Great experience", body: "Purchased an account and it was exactly as described. The verification gave me confidence.", date: "Jul 22, 2026", game: "Minecraft", verified: true },
  { id: "rev_004", author: "Mike R.", rating: 5, title: "Super smooth", body: "Support was outstanding when I had a question. Resolved in under 5 minutes.", date: "Jul 15, 2026", game: "GTA V", verified: true },
  { id: "rev_005", author: "G***r", rating: 5, title: "10/10 would buy again", body: "Everything went perfectly. Quick delivery, great seller, exactly what I expected.", date: "Aug 5, 2026", game: "League of Legends", verified: true },
  { id: "rev_006", author: "T***e", rating: 4, title: "Exceeded expectations", body: "The seller was professional and the account was in perfect condition.", date: "Jul 30, 2026", game: "CS2", verified: true },
];

export const GUIDES = [
  { id: "g_001", title: "Valorant Tier List — Current Season", slug: "valorant-tier-list", category: "Valorant", date: "Aug 8, 2026", author: "IGMART Staff", image: "/images/guide-valorant.png", readTime: "5 min read", featured: true, excerpt: "The definitive tier list for every agent in the current Valorant competitive season." },
  { id: "g_002", title: "Fortnite Guide — Latest Season Updates", slug: "fortnite-updates", category: "Fortnite", date: "Aug 6, 2026", author: "IGMART Staff", image: "/images/guide-fortnite.png", readTime: "4 min read", featured: false, excerpt: "Everything you need to know about the new season including map changes and new weapons." },
  { id: "g_003", title: "Minecraft Item Guide — Rarest Drops", slug: "minecraft-items", category: "Minecraft", date: "Aug 4, 2026", author: "IGMART Staff", image: "/images/guide-minecraft.png", readTime: "7 min read", featured: false, excerpt: "Find out which Minecraft items are the rarest and most valuable on the marketplace." },
  { id: "g_004", title: "GTA Online Economy Guide 2026", slug: "gta-economy", category: "GTA V", date: "Aug 2, 2026", author: "IGMART Staff", image: "/images/guide-gta.png", readTime: "6 min read", featured: false, excerpt: "Master the GTA Online economy and learn the fastest ways to earn in-game money." },
  { id: "g_005", title: "League of Legends Champion Tier List", slug: "lol-tier-list", category: "LoL", date: "Jul 31, 2026", author: "IGMART Staff", image: "/images/guide-lol.png", readTime: "8 min read", featured: false, excerpt: "Every champion ranked for the current patch. Updated weekly by our analysts." },
  { id: "g_006", title: "Apex Legends — Season Tier List", slug: "apex-tier-list", category: "Apex Legends", date: "Jul 28, 2026", author: "IGMART Staff", image: "/images/guide-apex.png", readTime: "5 min read", featured: false, excerpt: "Which legends dominate in the current Apex season? Find out here." },
  { id: "g_007", title: "Gaming Marketplace Safety Guide", slug: "marketplace-safety", category: "Safety", date: "Jul 25, 2026", author: "IGMART Staff", image: "/images/guide-safety.png", readTime: "10 min read", featured: false, excerpt: "How to buy and sell safely on gaming marketplaces. Everything you need to know." },
  { id: "g_008", title: "Beginner's Marketplace Guide", slug: "beginners", category: "Guide", date: "Jul 22, 2026", author: "IGMART Staff", image: "/images/guide-beginners.png", readTime: "6 min read", featured: false, excerpt: "New to buying and selling on gaming marketplaces? Start here." },
  { id: "g_009", title: "New Season Update — What's Changed", slug: "season-update", category: "News", date: "Jul 20, 2026", author: "IGMART Staff", image: "/images/guide-valorant.png", readTime: "3 min read", featured: false, excerpt: "A complete breakdown of all the changes in the latest gaming season updates." },
  { id: "g_010", title: "Weekly Gaming Market News", slug: "weekly-news", category: "News", date: "Jul 18, 2026", author: "IGMART Staff", image: "/images/guide-fortnite.png", readTime: "4 min read", featured: false, excerpt: "This week's biggest stories from the gaming marketplace world." },
];

export const FAQ_ITEMS = [
  { q: "How does IGMART protect my purchase?", a: "IGMART holds your payment in escrow until you confirm successful delivery. Our trade protection covers you for the full purchase amount in case of any issues." },
  { q: "Are the sellers verified?", a: "All sellers go through our verification process including identity checks, history review, and delivery monitoring. We display verification badges on qualified sellers." },
  { q: "How long does delivery take?", a: "Delivery time depends on the listing — most accounts and items are delivered instantly or within a few hours. Each listing clearly states its estimated delivery time." },
  { q: "What happens if I have a problem?", a: "Our 24/7 support team can help you open a dispute if there's an issue with your order. We review all disputes fairly and issue refunds when appropriate." },
  { q: "Can I sell on IGMART?", a: "Yes! Register an account, complete seller verification, and start listing. We charge a competitive seller fee on each successful sale." },
  { q: "What payment methods are accepted?", a: "We accept major credit/debit cards, PayPal, and various cryptocurrency options. Payment method availability may vary by region." },
  { q: "Is my personal information safe?", a: "We use industry-standard encryption and never share your personal information with third parties without consent. See our Privacy Policy for full details." },
  { q: "How do I leave a review?", a: "After your order is marked complete, you can leave a review from your order page. Reviews help the community identify trustworthy sellers." },
];

export const NAV_GAMES = [
  { name: "Valorant", slug: "valorant", hot: true },
  { name: "Fortnite", slug: "fortnite", hot: false },
  { name: "CS2", slug: "cs2", hot: true },
  { name: "League of Legends", slug: "league-of-legends", hot: false },
  { name: "GTA V", slug: "gta-v", hot: false },
  { name: "Minecraft", slug: "minecraft", hot: false },
  { name: "Apex Legends", slug: "apex-legends", hot: false },
  { name: "World of Warcraft", slug: "world-of-warcraft", hot: false },
  { name: "Roblox", slug: "roblox", hot: false },
  { name: "FC 25", slug: "fc-25", hot: false },
];

export const NAV_MARKETPLACE = [
  { name: "Accounts", slug: "accounts", icon: "👤" },
  { name: "Items", slug: "items", icon: "📦" },
  { name: "Currency", slug: "currency", icon: "💰" },
  { name: "Boosting", slug: "boosting", icon: "⚡" },
  { name: "Services", slug: "services", icon: "🛠️" },
  { name: "Game Keys", slug: "game-keys", icon: "🔑" },
  { name: "Top-ups", slug: "top-ups", icon: "➕" },
];
