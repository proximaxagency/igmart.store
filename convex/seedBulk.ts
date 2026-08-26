import { v } from "convex/values";
import { mutation } from "./_generated/server";

// ──────────────────────────────────────────────────────────────────────────────
// BULK RANDOM LISTINGS — 50-100 per game (250-500 total)
// Clears existing listings then generates fresh randomized entries.
// ──────────────────────────────────────────────────────────────────────────────
export const seedBulkListings = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const seller = await ctx.db.query("users").filter(q => q.eq(q.field("username"), "ProGamer99")).first();
    if (!seller) return { error: "Run seedDatabase first." };

    const categoryDoc = await ctx.db.query("categories").filter(q => q.eq(q.field("slug"), "accounts")).first();
    if (!categoryDoc) return { error: "No accounts category. Run seedDatabase first." };

    const games = await ctx.db.query("games").collect();
    const gameMap: Record<string, string> = {};
    for (const g of games) gameMap[g.slug] = g._id;

    // Wipe existing listings
    const existing = await ctx.db.query("listings").collect();
    for (const l of existing) await ctx.db.delete(l._id);

    const sellerId = seller._id;
    const categoryId = categoryDoc._id;

    // ── Utility helpers ──────────────────────────────────────────────────────
    const rng = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const pickN = <T>(arr: T[], n: number): T[] => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
    const chance = (pct: number) => Math.random() * 100 < pct;
    const mkSlug = (prefix: string, i: number) => `${prefix}-${i}-${Math.random().toString(36).slice(2, 7)}`;

    const BADGES: Array<"HOT" | "POPULAR" | "SALE" | "NEW" | undefined> = [
      "HOT", "HOT", "POPULAR", "POPULAR", "SALE", "NEW",
      undefined, undefined, undefined, undefined,
    ];
    const DELIVERY = ["Instant", "Instant", "Instant", "< 15 mins", "< 1 hour", "1-3 hours", "24 hours"];

    // ── CLASH OF CLANS ───────────────────────────────────────────────────────
    const COC_IMGS = [
      "https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6213164/gallery/58e83257-bef7-4f00-b333-343193769e7b.jpg",
      "https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6255046/gallery/ed914123-fa2f-4369-b21a-202f7e787b4d.jpg",
      "https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6185724/gallery/0b70154a-9aee-4f67-b834-a922122bbcfe.jpg",
    ];
    const COC_TH = [14, 15, 15, 16, 16, 16, 17, 17, 18, 18, 18];
    const COC_HEROES = [
      "65/65/40/25","70/65/45/30","75/70/50/35","80/75/55/40","85/80/60/42",
      "90/85/65/45","95/90/70/50","100/95/75/55","104/100/78/77","110/105/80/80",
    ];
    const COC_FEATS = [
      "Supercell ID ready","max walls","5 builders active","max builder base",
      "Profile Fire activated","Champion Scenery","Cosmic Scenery","Supercharger maxed",
      "all epic equipment maxed","3x Guardian pets","2000+ gems","5000+ gems",
      "10k+ gems","20k+ gems","max troops","Legends League account","Master League base",
      "free name change","zero bans","fresh Supercell ID",
    ];
    const COC_DESCS = [
      (th: number, heroes: string, feats: string[]) =>
        `Town Hall ${th} account with heroes at ${heroes}. Includes ${feats.slice(0,3).join(", ")}. Full Supercell ID transfer included. Instant delivery guaranteed.`,
      (th: number, heroes: string, feats: string[]) =>
        `Clean TH${th} base featuring ${feats.slice(0,2).join(" and ")}. Hero levels ${heroes}, ready for competitive Legends League. Supercell ID change available immediately.`,
      (th: number, heroes: string, feats: string[]) =>
        `Premium TH${th} — ${feats[0]} with hero levels ${heroes}. ${feats.slice(1,3).join(", ")} included. Excellent war base layout. Instant Supercell ID transfer.`,
      (th: number, heroes: string, feats: string[]) =>
        `Selling my TH${th} account. Heroes: ${heroes}. Notable features: ${feats.join(", ")}. Never banned, clean history. Instant delivery with full email.`,
    ];

    // ── PUBG MOBILE / BGMI ───────────────────────────────────────────────────
    const PUBG_IMGS = [
      "https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6067613/gallery/aec3dfcd-c3a6-4cea-84af-d0fde410e3ef.png",
      "https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6190890/gallery/4a74e2f2-85ba-499b-8dc5-15faf3b4365d.png",
    ];
    const PUBG_RANKS = ["Gold","Platinum","Diamond","Crown","Ace","Ace Master","Ace Dominator","Conqueror"];
    const PUBG_SKINS = [
      "M416 Glacier","AKM Glacier","M416 Fool","AWM Godzilla Lv7",
      "Codebreaker AKM Lv4","Mini14 Glacier","Vector Glacier",
      "M416 Mythic","DP28 Mythic","Kar98 Legendary","M762 Legendary","SKS Legendary",
    ];
    const PUBG_XSUITS = [
      "Raven X-Suit","PhoenixTra X-Suit 4★","Blood Raven X-Suit 7★",
      "Pharaoh X-Suit 6★","Iridescent X-Suit","Sandstorm X-Suit",
    ];
    const PUBG_EXTRAS = [
      "Conqueror frame","mythic lobby","rare OG emotes","Mythic fashion set",
      "seasonal achievement frames","premium car skin","mythic parachute",
      "multiple Conqueror seasons","full UC balance","Glacier set combo",
    ];
    const PUBG_DESCS = [
      (rank: string, skin: string, extras: string[]) =>
        `${rank} PUBG Mobile / BGMI account featuring the ${skin}. Includes ${extras.slice(0,2).join(" and ")}. Secure full email access, clean login, instant delivery.`,
      (rank: string, skin: string, extras: string[]) =>
        `Stacked ${rank} account with ${skin} and ${extras[0]}. ${extras.slice(1,3).join(", ")} also included. Phone/email unlinked and ready for transfer.`,
      (rank: string, skin: string, extras: string[]) =>
        `Collector-grade ${rank} PUBG/BGMI account. ${skin} equipped with ${extras.slice(0,3).join(", ")}. Rare combination — secure account with instant delivery.`,
      (rank: string, skin: string, extras: string[]) =>
        `${rank} ranked account packed with ${skin}. ${extras.join(", ")}. No bans, no restrictions. Full email access. Immediate transfer guaranteed.`,
    ];

    // ── FREE FIRE ────────────────────────────────────────────────────────────
    const FF_IMGS = [
      "https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6226793/gallery/2104b9c9-83b5-4767-b4df-a89e759a0758.jpg",
      "https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6258601/gallery/69d58882-0a80-4270-84bc-cb5fac11f0af.jpg",
      "https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6192164/gallery/9f2d8523-3c61-460d-b067-424481a58b95.jpg",
    ];
    const FF_LVLS = [55,60,61,62,64,65,67,70,72,75,78,80,81,85];
    const FF_RANKS = ["Gold","Platinum","Diamond","Heroic","Grandmaster"];
    const FF_EVOS = ["Draco M10","Titan SCAR","XM8 Destiny Lv4","MP40 Chromasonic Lv4","M1887 Maxed","AK Maxed","AWM Golden Eagle","Groza Evo Max"];
    const FF_BUNDLES = [12,20,30,40,52,65,80,100,120,150,200,250,334];
    const FF_EXTRAS = [
      "Prime level 3-4","Prime level 5","Prime level 6","Prime level 7",
      "all 65 characters unlocked","rare LOL emote","Angelic Wings",
      "OG Season 1 Sakura Bundle","Hip Hop Bundle","Grandmaster badge",
      "legacy T-shirts collection","rare LOL bundle",
    ];
    const FF_DESCS = [
      (lvl: number, rank: string, evo: string, bundles: number, extras: string[]) =>
        `${rank} Level ${lvl} Free Fire account with ${evo} (Evo gun maxed). ${bundles} bundles, ${extras.slice(0,2).join(", ")}. Instant delivery with full login credentials.`,
      (lvl: number, rank: string, evo: string, bundles: number, extras: string[]) =>
        `Level ${lvl} stacked Free Fire ${rank} account. ${evo}, ${bundles} outfit bundles, and ${extras.slice(0,3).join(", ")}. No restrictions — instant transfer.`,
      (lvl: number, rank: string, evo: string, bundles: number, extras: string[]) =>
        `${rank} Free Fire at level ${lvl}. ${evo} equipped, ${bundles}+ bundles, ${extras[0]} and ${extras[1]}. Full access provided instantly.`,
      (lvl: number, rank: string, evo: string, bundles: number, extras: string[]) =>
        `Selling my Level ${lvl} Free Fire ${rank} account. ${evo}, ${bundles} bundles, ${extras.join(", ")}. Clean no-ban account. Instant delivery.`,
    ];

    // ── ROBLOX ───────────────────────────────────────────────────────────────
    const ROB_IMGS = [
      "https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/4013208/gallery/34aeb225-e312-4483-a1fb-b541540058dc.png",
      "https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/5353349/gallery/123-fd58c123-c94c-45f4-b70b-37ff033daee9-webp.webp",
      "https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6280457/gallery/24-10bVNN.png",
    ];
    const ROB_YEARS = [2007,2008,2009,2010,2011,2012,2013,2015,2016,2018,2020,2021,2022,2023,2024];
    const ROB_LIMITEDS = [
      "Korblox Deathspeaker","Headless Horseman","Dominus Infernus",
      "Valkyrie Helm","Clockwork's Headphones","Red Valk",
      "Mr. Bling Bling","Sparkle Time Fedora","Dominus Frigidus",
    ];
    const ROB_RAP = [500,1000,2000,5000,10000,20000,50000,100000,150000,200000];
    const ROB_ROBUX = [0,100,500,1000,2500,5000,10000,15000];
    const ROB_EXTRAS = [
      "Veteran badge","unverified (easy transfer)","voice chat enabled",
      "ID verified","no ban history","3-letter username","4-letter username",
      "OG join date badge","premium membership active","Blox Fruits max level 2800","Godhuman unlocked",
    ];
    const ROB_DESCS = [
      (year: number, limited: string, rap: number, robux: number, extras: string[]) =>
        `Roblox account created in ${year} with ${limited} limited item. ${rap.toLocaleString()} RAP in inventory, ${robux.toLocaleString()} Robux balance. ${extras.slice(0,2).join(", ")}. Instant delivery.`,
      (year: number, limited: string, rap: number, robux: number, extras: string[]) =>
        `${year}-created Roblox account featuring ${limited}. Total RAP: ${rap.toLocaleString()}. Robux: ${robux.toLocaleString()}. ${extras.slice(0,3).join(", ")}. Clean profile, no bans.`,
      (year: number, limited: string, rap: number, robux: number, extras: string[]) =>
        `Collector Roblox account from ${year}. ${limited} + ${rap.toLocaleString()} RAP worth of limiteds. ${robux.toLocaleString()} Robux. ${extras[0]} and ${extras[1]}. Immediate transfer.`,
      (year: number, limited: string, rap: number, robux: number, extras: string[]) =>
        `Selling my ${year} Roblox account. Has ${limited}, ${rap.toLocaleString()} RAP, ${robux.toLocaleString()} Robux, ${extras.join(", ")}. No restrictions. Instant delivery.`,
    ];

    // ── CLASH ROYALE ─────────────────────────────────────────────────────────
    const CR_IMGS = [
      "https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6251638/gallery/4d5d35d1-6e7c-444f-a5f3-f8f3b235086e.jpeg",
      "https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6249301/gallery/49baeb3e-5d6b-4986-868f-961c06e2859f.jpg",
      "https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6267350/gallery/e5cdf593-cfb8-4dfe-bbdd-6c0b76bb53e5.jpg",
    ];
    const CR_KT = [13,14,14,15,15,15,16,16];
    const CR_TROPHIES = [6000,7000,7500,8000,8306,8500,9000,9282,9780,10000,10600,11021,12000];
    const CR_EVOS = [5,8,10,13,14,15,17,20,24,28];
    const CR_MAX_CARDS = [10,20,30,40,50,60,70,80,82,90];
    const CR_GEMS = [500,1000,2000,3000,5000,10000,15000,24000];
    const CR_EMOTES = [
      "Emperor King Emote","Goblin Kiss Trophy Emote","Bomberloon Emote",
      "Laughing Hog Emote","Classic King Emote","rare OG emote",
    ];
    const CR_EXTRAS = [
      "Path of Legends ranking","all tower skins","name change available",
      "Arena 24+","Arena 26","Master League","Champion tier",
      "multiple banner sets","Season Pass active","100% max deck",
    ];
    const CR_DESCS = [
      (kt: number, trophies: number, evos: number, maxCards: number, gems: number, extras: string[]) =>
        `King Tower ${kt} Clash Royale account with ${trophies.toLocaleString()} trophies. ${evos} Evolution cards unlocked, ${maxCards} max cards, ${gems.toLocaleString()} gems. ${extras.slice(0,2).join(", ")}. Instant delivery.`,
      (kt: number, trophies: number, evos: number, maxCards: number, gems: number, extras: string[]) =>
        `KT${kt} account featuring ${evos} Evo cards and ${maxCards}+ maxed cards. ${trophies.toLocaleString()} trophies, ${gems.toLocaleString()} gems. ${extras.slice(0,3).join(", ")}. Full access, instant transfer.`,
      (kt: number, trophies: number, evos: number, maxCards: number, gems: number, extras: string[]) =>
        `Competitive KT${kt} account. ${trophies.toLocaleString()} Path of Legends trophies, ${evos} Evolutions, ${maxCards} max cards, ${gems.toLocaleString()} gems. ${extras[0]} and ${extras[1]}.`,
      (kt: number, trophies: number, evos: number, maxCards: number, gems: number, extras: string[]) =>
        `Selling my KT${kt} Clash Royale account. ${trophies.toLocaleString()} trophies, ${evos} evo cards, ${maxCards} max cards, ${gems.toLocaleString()} gems stored. ${extras.join(", ")}. Instant delivery.`,
    ];

    // ── Generator ─────────────────────────────────────────────────────────────
    let totalInserted = 0;
    const results: Record<string, number> = {};

    // ─── COC ─────────────────────────────────────────────────────────────────
    const cocId = gameMap["clash-of-clans"];
    if (cocId) {
      const count = rng(50, 100);
      for (let i = 0; i < count; i++) {
        const th = pick(COC_TH);
        const heroes = pick(COC_HEROES);
        const feats = pickN(COC_FEATS, rng(3, 5));
        const price = parseFloat((rng(1299, 27500) / 100).toFixed(2));
        const orig = chance(60) ? parseFloat((price * (1 + rng(15, 35) / 100)).toFixed(2)) : undefined;
        const desc = (pick(COC_DESCS))(th, heroes, feats);
        const qual = pick(["Max","Semi-Max","Near-Max","Progressed","Clean"]);
        await ctx.db.insert("listings", {
          sellerId, gameId: cocId as any, categoryId: categoryId as any,
          title: `TH${th} ${qual} — Heroes ${heroes} · ${pick(feats)}`,
          slug: mkSlug("coc-th" + th, i),
          description: desc,
          price, originalPrice: orig,
          images: [pick(COC_IMGS)],
          deliveryTime: pick(DELIVERY),
          deliveryMethod: "manual" as const,
          status: "active" as const,
          views: rng(50, 5000),
          badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 30),
          updatedAt: now - rng(0, 86400000 * 5),
        });
        totalInserted++;
        results["clash-of-clans"] = (results["clash-of-clans"] || 0) + 1;
      }
    }

    // ─── PUBG ─────────────────────────────────────────────────────────────────
    const pubgId = gameMap["pubg-mobile"];
    if (pubgId) {
      const count = rng(50, 100);
      for (let i = 0; i < count; i++) {
        const rank = pick(PUBG_RANKS);
        const skin = pick(PUBG_SKINS);
        const xsuit = chance(40) ? pick(PUBG_XSUITS) : null;
        const extras = pickN(PUBG_EXTRAS, rng(2, 4));
        const price = parseFloat((rng(399, 120000) / 100).toFixed(2));
        const orig = chance(55) ? parseFloat((price * (1 + rng(15, 40) / 100)).toFixed(2)) : undefined;
        const desc = (pick(PUBG_DESCS))(rank, skin, extras);
        const title = xsuit
          ? `${rank} — ${skin} · ${xsuit} · ${pick(extras)}`
          : `${rank} — ${skin} · ${pick(extras)}`;
        await ctx.db.insert("listings", {
          sellerId, gameId: pubgId as any, categoryId: categoryId as any,
          title, slug: mkSlug("pubg-" + rank.toLowerCase().replace(/ /g, "-"), i),
          description: desc,
          price, originalPrice: orig,
          images: [pick(PUBG_IMGS)],
          deliveryTime: pick(DELIVERY),
          deliveryMethod: "manual" as const,
          status: "active" as const,
          views: rng(50, 6000),
          badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 30),
          updatedAt: now - rng(0, 86400000 * 5),
        });
        totalInserted++;
        results["pubg-mobile"] = (results["pubg-mobile"] || 0) + 1;
      }
    }

    // ─── FREE FIRE ────────────────────────────────────────────────────────────
    const ffId = gameMap["free-fire"];
    if (ffId) {
      const count = rng(50, 100);
      for (let i = 0; i < count; i++) {
        const lvl = pick(FF_LVLS);
        const rank = pick(FF_RANKS);
        const evo = pick(FF_EVOS);
        const numEvos = rng(1, 8);
        const bundles = pick(FF_BUNDLES);
        const extras = pickN(FF_EXTRAS, rng(2, 4));
        const price = parseFloat((rng(299, 35000) / 100).toFixed(2));
        const orig = chance(60) ? parseFloat((price * (1 + rng(15, 35) / 100)).toFixed(2)) : undefined;
        const desc = (pick(FF_DESCS))(lvl, rank, evo, bundles, extras);
        await ctx.db.insert("listings", {
          sellerId, gameId: ffId as any, categoryId: categoryId as any,
          title: `${rank} Level ${lvl} · ${numEvos}x Evo Guns · ${bundles} Bundles · ${pick(extras)}`,
          slug: mkSlug("ff-lv" + lvl, i),
          description: desc,
          price, originalPrice: orig,
          images: [pick(FF_IMGS)],
          deliveryTime: pick(DELIVERY),
          deliveryMethod: "manual" as const,
          status: "active" as const,
          views: rng(50, 5000),
          badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 30),
          updatedAt: now - rng(0, 86400000 * 5),
        });
        totalInserted++;
        results["free-fire"] = (results["free-fire"] || 0) + 1;
      }
    }

    // ─── ROBLOX ───────────────────────────────────────────────────────────────
    const robId = gameMap["roblox"];
    if (robId) {
      const count = rng(50, 100);
      for (let i = 0; i < count; i++) {
        const year = pick(ROB_YEARS);
        const limited = pick(ROB_LIMITEDS);
        const rap = pick(ROB_RAP);
        const robux = pick(ROB_ROBUX);
        const extras = pickN(ROB_EXTRAS, rng(2, 3));
        const price = parseFloat((rng(199, 75000) / 100).toFixed(2));
        const orig = chance(50) ? parseFloat((price * (1 + rng(15, 40) / 100)).toFixed(2)) : undefined;
        const desc = (pick(ROB_DESCS))(year, limited, rap, robux, extras);
        await ctx.db.insert("listings", {
          sellerId, gameId: robId as any, categoryId: categoryId as any,
          title: `${year} Account · ${limited} · ${rap.toLocaleString()} RAP · ${robux.toLocaleString()} Robux`,
          slug: mkSlug("rob-" + year, i),
          description: desc,
          price, originalPrice: orig,
          images: [pick(ROB_IMGS)],
          deliveryTime: pick(DELIVERY),
          deliveryMethod: "manual" as const,
          status: "active" as const,
          views: rng(50, 5000),
          badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 30),
          updatedAt: now - rng(0, 86400000 * 5),
        });
        totalInserted++;
        results["roblox"] = (results["roblox"] || 0) + 1;
      }
    }

    // ─── CLASH ROYALE ─────────────────────────────────────────────────────────
    const crId = gameMap["clash-royale"];
    if (crId) {
      const count = rng(50, 100);
      for (let i = 0; i < count; i++) {
        const kt = pick(CR_KT);
        const trophies = pick(CR_TROPHIES);
        const evos = pick(CR_EVOS);
        const maxCards = pick(CR_MAX_CARDS);
        const gems = pick(CR_GEMS);
        const emote = chance(40) ? pick(CR_EMOTES) : null;
        const extras = pickN(CR_EXTRAS, rng(2, 3));
        const price = parseFloat((rng(899, 80000) / 100).toFixed(2));
        const orig = chance(55) ? parseFloat((price * (1 + rng(15, 35) / 100)).toFixed(2)) : undefined;
        const desc = (pick(CR_DESCS))(kt, trophies, evos, maxCards, gems, extras);
        const title = emote
          ? `KT${kt} · ${trophies.toLocaleString()} Trophies · ${evos} Evos · ${emote}`
          : `KT${kt} · ${trophies.toLocaleString()} Trophies · ${evos} Evos · ${maxCards} Max Cards`;
        await ctx.db.insert("listings", {
          sellerId, gameId: crId as any, categoryId: categoryId as any,
          title, slug: mkSlug("cr-kt" + kt, i),
          description: desc,
          price, originalPrice: orig,
          images: [pick(CR_IMGS)],
          deliveryTime: pick(DELIVERY),
          deliveryMethod: "manual" as const,
          status: "active" as const,
          views: rng(50, 4000),
          badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 30),
          updatedAt: now - rng(0, 86400000 * 5),
        });
        totalInserted++;
        results["clash-royale"] = (results["clash-royale"] || 0) + 1;
      }
    }

    return { status: "bulk_seeded", total: totalInserted, perGame: results };
  },
});
