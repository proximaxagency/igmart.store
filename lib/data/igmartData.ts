// IGMART.STORE — Complete Application Data
// All demo/seed data. Replace with real Convex queries when backend is connected.

export const GAMES = [
  { id: "clash-of-clans", name: "Clash of Clans", slug: "clash-of-clans", category: "Strategy", image: "/clash-of-clans-poster.jpg", sellers: 840, listings: 14500, rating: 4.9, popular: true },
  { id: "pubg-mobile", name: "PUBG Mobile / BGMI", slug: "pubg-mobile", category: "Battle Royale", image: "/pubg-poster.png", sellers: 1850, listings: 40300, rating: 4.9, popular: true },
  { id: "free-fire", name: "Free Fire", slug: "free-fire", category: "Battle Royale", image: "/free-fire-poster.png", sellers: 1150, listings: 24800, rating: 4.9, popular: true },
  { id: "roblox", name: "Roblox", slug: "roblox", category: "Sandbox", image: "/roblox-poster.png", sellers: 1420, listings: 34500, rating: 4.7, popular: true },
  { id: "clash-royale", name: "Clash Royale", slug: "clash-royale", category: "Card Battler", image: "/clash-royale-poster.png", sellers: 620, listings: 9800, rating: 4.8, popular: true },
];

export const CATEGORIES = [
  { id: "accounts", name: "Accounts", slug: "accounts", icon: "👤", description: "Buy and sell gaming accounts", count: 45231 },
];

export const LISTINGS = [
  {
    id: "lst_001", title: "Clash of Clans TH16 Max Base — 95/95/70/45 Heroes + Sceneries", game: "Clash of Clans", category: "accounts",
    price: 149.99, originalPrice: 199.99, seller: "ClashVault_Pro", sellerRating: 4.98, sellerOrders: 3421,
    rating: 4.9, reviews: 312, delivery: "Instant", image: "/clash-of-clans-poster.jpg",
    badge: "HOT", description: "Fully maxed Town Hall 16 base. All heroes maxed, epic equipments Lv 27, 8000+ gems, champion sceneries. Clean Supercell ID with full email access.",
    verified: true, slug: "coc-th16-max-account",
  },
  {
    id: "lst_002", title: "BGMI Conqueror S31 — Glacier M416 Lv 7 + Fool Set + Pharaoh X-Suit", game: "PUBG Mobile / BGMI", category: "accounts",
    price: 219.00, originalPrice: 280.00, seller: "ProTrader_IN", sellerRating: 4.96, sellerOrders: 2190,
    rating: 5.0, reviews: 245, delivery: "Instant", image: "/bgmi-poster.png",
    badge: "POPULAR", description: "Conqueror title unlocked, M416 Glacier Lv 7 with hit effect & loot crate, Pharaoh X-Suit 6-Star, Fool Set, 4500 UC balance. Clean login.",
    verified: true, slug: "bgmi-conqueror-glacier-m416",
  },
  {
    id: "lst_003", title: "Free Fire Sakura Season 1 VIP Account — Titan SCAR + Hip Hop Bundle", game: "Free Fire", category: "accounts",
    price: 129.99, originalPrice: 160.00, seller: "FF_LegendStore", sellerRating: 4.95, sellerOrders: 4120,
    rating: 4.9, reviews: 480, delivery: "Instant", image: "/free-fire-poster.png",
    badge: "SALE", description: "Ultra-rare OG Season 1 Sakura Bundle, Hip Hop Bundle, Maxed Titan SCAR, 12 Evo Guns maxed, Grandmaster badge. Instant transfer.",
    verified: true, slug: "free-fire-sakura-s1-og",
  },
  {
    id: "lst_004", title: "PUBG Mobile Global — Blood Raven X-Suit 7-Star + M416 Glacier Max", game: "PUBG Mobile / BGMI", category: "accounts",
    price: 260.00, originalPrice: 320.00, seller: "GlobalVault", sellerRating: 4.94, sellerOrders: 1840,
    rating: 4.8, reviews: 164, delivery: "Instant", image: "/pubg-poster.png",
    badge: "HOT", description: "Global version account. Maxed Blood Raven X-Suit, M416 Glacier Lv 7, AWM Godzilla Lv 7, Conqueror frames S14-S22. Full Twitter/FB unlink ready.",
    verified: true, slug: "pubg-global-blood-raven-glacier",
  },
  {
    id: "lst_005", title: "Roblox 2016 Veteran Account — Korblox Deathspeaker + Headless Horseman", game: "Roblox", category: "accounts",
    price: 189.99, originalPrice: null, seller: "BloxMarket", sellerRating: 4.92, sellerOrders: 5120,
    rating: 4.9, reviews: 520, delivery: "Instant", image: "/roblox-poster.png",
    badge: "POPULAR", description: "Created in 2016. Contains Korblox Deathspeaker, Headless Horseman, 150k+ RAP limiteds, Blox Fruits maxed with Kitsune & Leopard, 15,000 Robux.",
    verified: true, slug: "roblox-korblox-headless-2016",
  },
  {
    id: "lst_007", title: "Clash Royale Ultimate Champion 9000 Trophies — All Lv 15 Cards + Evos", game: "Clash Royale", category: "accounts",
    price: 85.00, originalPrice: 110.00, seller: "RoyaleDecks", sellerRating: 4.91, sellerOrders: 1450,
    rating: 4.8, reviews: 138, delivery: "Instant", image: "/clash-royale-poster.png",
    badge: null, description: "9000 Trophies, Top 1000 Global Finish Badge, 80+ Cards at Elite Level 15, all Evolutions unlocked with 2.5M Gold and 15,000 Gems.",
    verified: true, slug: "clash-royale-9000-trophies-max",
  },
];

export const SELLERS = [
  {
    id: "sel_001", username: "ClashVault_Pro", displayName: "ClashVault Pro", avatar: "https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=800&auto=format&fit=crop",
    rating: 4.98, reviews: 3421, orders: 6820, memberSince: "Jan 2021", responseTime: "< 3 min",
    responseRate: "100%", verified: true, about: "Specialized in Supercell accounts (Clash of Clans, Clash Royale) with instant automated delivery.",
    topSeller: true,
  },
  {
    id: "sel_002", username: "ProTrader_IN", displayName: "ProTrader India", avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop",
    rating: 4.96, reviews: 2190, orders: 5310, memberSince: "Mar 2021", responseTime: "< 2 min",
    responseRate: "99%", verified: true, about: "#1 source for verified PUBG Mobile / BGMI and Free Fire accounts, UC and Diamond top-ups.",
    topSeller: true,
  },
  {
    id: "sel_003", username: "BloxMarket", displayName: "BloxMarket Official", avatar: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&auto=format&fit=crop",
    rating: 4.92, reviews: 5120, orders: 12400, memberSince: "Jun 2020", responseTime: "< 5 min",
    responseRate: "99%", verified: true, about: "Premier Roblox marketplace seller. Clean limited items, old veteran accounts, and fast Robux packages.",
    topSeller: true,
  },
];

export const REVIEWS = [
  { id: "rev_001", author: "Rohan K.", rating: 5, title: "Supercell ID changed in seconds!", body: "Bought a TH16 maxed base from ClashVault_Pro. Delivery was instantaneous and the seller guided me through email transfer seamlessly.", date: "Aug 12, 2026", game: "Clash of Clans", verified: true },
  { id: "rev_002", author: "Aman S.", rating: 5, title: "Glacier M416 Lv 7 is insane", body: "Got my BGMI Conqueror account within 5 minutes. Clean login, no restrictions, original mail linked. IGMART escrow kept everything 100% safe.", date: "Aug 9, 2026", game: "PUBG Mobile / BGMI", verified: true },
  { id: "rev_003", author: "Kartik P.", rating: 5, title: "Best Free Fire seller", body: "Sakura bundle account verified immediately. Customer support answered my query within 2 minutes.", date: "Aug 4, 2026", game: "Free Fire", verified: true },
  { id: "rev_004", author: "Dave M.", rating: 5, title: "Roblox Korblox account working great", body: "Account had all items described and 15k Robux intact. Smooth transaction with escrow protection.", date: "Jul 28, 2026", game: "Roblox", verified: true },
  { id: "rev_006", author: "Tariq H.", rating: 5, title: "PUBG Global X-Suit account verified", body: "Blood Raven 7-star account received and linked. Excellent trade protection.", date: "Jul 15, 2026", game: "PUBG Mobile / BGMI", verified: true },
];

export const GUIDES = [
  { id: "g_001", title: "Clash of Clans TH16 Attack Strategies & Meta Guide", slug: "coc-th16-guide", category: "Clash of Clans", date: "Aug 12, 2026", author: "IGMART Staff", image: "/clash-of-clans-poster.jpg", readTime: "6 min read", featured: true, excerpt: "Master Root Riders, Super Archers, and Hero Equipments for 3-star consistency in TH16 Legends League." },
  { id: "g_002", title: "BGMI Conqueror Rank Push Guide & Sensitivity Settings", slug: "bgmi-conqueror-guide", category: "PUBG Mobile / BGMI", date: "Aug 10, 2026", author: "IGMART Staff", image: "/bgmi-poster.png", readTime: "5 min read", featured: false, excerpt: "Top rotation strategies, best gyroscope sensitivity codes, and survival tactics to hit Conqueror fast." },
  { id: "g_003", title: "Free Fire Max Headshot & Sensitivity Pro Guide 2026", slug: "free-fire-headshot-guide", category: "Free Fire", date: "Aug 8, 2026", author: "IGMART Staff", image: "/free-fire-poster.png", readTime: "4 min read", featured: false, excerpt: "Perfect drag headshot sensitivity setups for 2GB to 8GB RAM devices and custom HUD layouts." },
  { id: "g_004", title: "PUBG Global Gyroscope & Weapon Recoil Control Guide", slug: "pubg-global-guide", category: "PUBG Mobile / BGMI", date: "Aug 5, 2026", author: "IGMART Staff", image: "/pubg-poster.png", readTime: "7 min read", featured: false, excerpt: "Zero recoil spray settings for M416 + 6x scope, DMR tapping rhythms, and hot drop positioning." },
  { id: "g_005", title: "Roblox Limiteds Trading Guide: How to Multiply RAP", slug: "roblox-trading-guide", category: "Roblox", date: "Aug 2, 2026", author: "IGMART Staff", image: "/roblox-poster.png", readTime: "8 min read", featured: false, excerpt: "The complete guide to trading limited items, spotting demand trends, and avoiding common trade scams." },
  { id: "g_007", title: "Clash Royale Meta Decks & Evolution Synergy Guide", slug: "clash-royale-meta", category: "Clash Royale", date: "Jul 26, 2026", author: "IGMART Staff", image: "/clash-royale-poster.png", readTime: "6 min read", featured: false, excerpt: "Top Path of Legends decks featuring the latest Card Evolutions and Tower Troops." },
];

export const FAQ_ITEMS = [
  { q: "How does IGMART protect my purchase?", a: "IGMART holds your payment in escrow until you confirm successful delivery. Our trade protection covers you for the full purchase amount in case of any issues." },
  { q: "Are the sellers verified?", a: "All sellers go through our verification process including identity checks, history review, and delivery monitoring. We display verification badges on qualified sellers." },
  { q: "How long does delivery take?", a: "Delivery time depends on the listing — most accounts and items are delivered instantly or within a few hours. Each listing clearly states its estimated delivery time." },
  { q: "What happens if I have a problem?", a: "Our 24/7 support team can help you open a dispute if there's an issue with your order. We review all disputes fairly and issue refunds when appropriate." },
  { q: "Can I sell on IGMART?", a: "Yes! Register an account, complete seller verification, and start listing. We charge a competitive seller fee on each successful sale." },
  { q: "What payment methods are accepted?", a: "We accept major credit/debit cards, UPI, PayPal, and various cryptocurrency options. Payment method availability may vary by region." },
  { q: "Is my personal information safe?", a: "We use industry-standard encryption and never share your personal information with third parties without consent. See our Privacy Policy for full details." },
  { q: "How do I leave a review?", a: "After your order is marked complete, you can leave a review from your order page. Reviews help the community identify trustworthy sellers." },
];

export const NAV_GAMES = [
  { name: "Clash of Clans", slug: "clash-of-clans", hot: true },
  { name: "PUBG Mobile / BGMI", slug: "pubg-mobile", hot: true },
  { name: "Free Fire", slug: "free-fire", hot: true },
  { name: "Roblox", slug: "roblox", hot: true },
  { name: "Clash Royale", slug: "clash-royale", hot: false },
];

export const NAV_MARKETPLACE = [
  { name: "Accounts", slug: "accounts", icon: "👤" },
];
