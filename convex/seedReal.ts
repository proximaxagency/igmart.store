import { v } from "convex/values";
import { mutation } from "./_generated/server";

// ─────────────────────────────────────────────────────────────────────────────
// REAL LISTINGS FROM GAMEBOOST — With full descriptions, multiple gallery images
// ─────────────────────────────────────────────────────────────────────────────
export const seedRealListings = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const seller = await ctx.db.query("users").filter(q => q.eq(q.field("username"), "ProGamer99")).first();
    if (!seller) return { error: "Run seedDatabase first to create the seller account." };

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

    const rng = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const mkSlug = (prefix: string, i: number) => `${prefix}-${i}-${Math.random().toString(36).slice(2, 7)}`;
    const BADGES: Array<"HOT" | "POPULAR" | "SALE" | "NEW" | undefined> = [
      "HOT", "HOT", "POPULAR", "POPULAR", "SALE", "NEW", undefined, undefined, undefined, undefined,
    ];
    const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    let total = 0;
    const results: Record<string, number> = {};

    // ──────────────────────────────────────────────────────────────────────────
    // CLASH OF CLANS — Real data from GameBoost
    // ──────────────────────────────────────────────────────────────────────────
    const cocId = gameMap["clash-of-clans"];
    if (cocId) {
      const COC_LISTINGS = [
        {
          title: "TH18 Max Heroes 95/95/70/50 · 14000+ Gems · Max Walls · 6 Builders · Supercell ID Ready",
          price: 185.00, orig: 220.00,
          description: `Premium Town Hall 18 account with maxed heroes:\n• Barbarian King: Level 95\n• Archer Queen: Level 95\n• Grand Warden: Level 70\n• Royal Champion: Level 50\n• Minion Prince: Unlocked\n\n💎 14,000+ Gems stored\n🏗️ 6 Builders active\n🧱 Max Level 15 Walls\n⚔️ All Super Troops available\n🌟 Legends League base\n\n✅ Supercell ID transfer ready — you can claim immediately\n✅ No ban history, fresh account\n✅ Instant delivery after purchase\n✅ Full email access provided\n\n📞 24/7 support after sale`,
          images: [
            "https://cdn.gameboost.com/accounts/6213164/gallery/58e83257-bef7-4f00-b333-343193769e7b.jpg",
            "https://cdn.gameboost.com/accounts/6213164/gallery/4a0f6d43-6a76-4849-a869-0ee80b9f6b3d.jpg",
            "https://cdn.gameboost.com/accounts/6255046/gallery/ed914123-fa2f-4369-b21a-202f7e787b4d.jpg",
          ],
          delivery: "Instant",
        },
        {
          title: "TH17 Semi-Max · Heroes 85/85/65/45 · 5000 Gems · 5 Builders · Free Scenery",
          price: 95.00, orig: 119.00,
          description: `Town Hall 17 account ready for competitive play:\n• Barbarian King: Level 85\n• Archer Queen: Level 85\n• Grand Warden: Level 65\n• Royal Champion: Level 45\n\n💎 5,000+ Gems\n🏗️ 5 Builders\n🎨 Champion Scenery active\n⚡ Supercharger maxed\n🛡️ Max Clan Castle capacity\n\n✅ Supercell ID change available\n✅ Zero bans\n✅ Instant delivery\n✅ Full login credentials`,
          images: [
            "https://cdn.gameboost.com/accounts/6255046/gallery/ed914123-fa2f-4369-b21a-202f7e787b4d.jpg",
            "https://cdn.gameboost.com/accounts/6185724/gallery/0b70154a-9aee-4f67-b834-a922122bbcfe.jpg",
          ],
          delivery: "Instant",
        },
        {
          title: "TH16 Max Base · Heroes 100/100/75/55 · 20,000+ Gems · Legends League · Profile Fire",
          price: 240.00, orig: 299.00,
          description: `Elite TH16 Legends League account:\n• Barbarian King: Level 100 (MAX)\n• Archer Queen: Level 100 (MAX)\n• Grand Warden: Level 75 (MAX)\n• Royal Champion: Level 55 (MAX)\n\n💎 20,000+ Gems stored\n🏗️ 6 Builders (all active)\n🔥 Profile Fire activated\n🌟 Legends League — consistently 5000+ trophies\n🧱 All walls Level 15\n⚔️ All troops, spells, and heroes maxed\n🎪 All epic equipment maxed\n\n✅ Supercell ID ready — transfer within minutes\n✅ Never banned\n✅ Instant delivery\n✅ Complete account access`,
          images: [
            "https://cdn.gameboost.com/accounts/6185724/gallery/0b70154a-9aee-4f67-b834-a922122bbcfe.jpg",
            "https://cdn.gameboost.com/accounts/6213164/gallery/58e83257-bef7-4f00-b333-343193769e7b.jpg",
            "https://cdn.gameboost.com/accounts/6255046/gallery/ed914123-fa2f-4369-b21a-202f7e787b4d.jpg",
          ],
          delivery: "Instant",
        },
        {
          title: "TH15 Clean Starter · Heroes 75/75/50/35 · 2000 Gems · 5 Builders",
          price: 45.00, orig: undefined,
          description: `Clean Town Hall 15 perfect for casual or competitive players:\n• Barbarian King: Level 75\n• Archer Queen: Level 75\n• Grand Warden: Level 50\n• Royal Champion: Level 35\n\n💎 2,000 Gems\n🏗️ 5 Builders\n⚔️ Good troops for war\n🎯 Great base layout included\n\n✅ Supercell ID available\n✅ Clean account, no violations\n✅ Instant delivery`,
          images: [
            "https://cdn.gameboost.com/accounts/6213164/gallery/58e83257-bef7-4f00-b333-343193769e7b.jpg",
          ],
          delivery: "< 15 mins",
        },
        {
          title: "TH18 · 31,000+ Gems · Max Heroes 110/105/80/80 · All Epic Equipment · Cosmic Scenery",
          price: 399.00, orig: 480.00,
          description: `Ultra-premium TH18 collector's account:\n• Barbarian King: Level 110 (SUPER MAX)\n• Archer Queen: Level 105\n• Grand Warden: Level 80\n• Royal Champion: Level 80\n• ALL epic equipment maxed\n\n💎 31,000+ Gems (extremely rare)\n🌌 Cosmic Scenery equipped\n🔥 Profile Fire + Champion Scenery\n🏗️ 6 Builders\n🌟 Multi-season Legends League\n🎖️ 3000+ war stars\n\n✅ Supercell ID transfer included\n✅ Full email access\n✅ Instant delivery\n✅ Never banned`,
          images: [
            "https://cdn.gameboost.com/accounts/6255046/gallery/ed914123-fa2f-4369-b21a-202f7e787b4d.jpg",
            "https://cdn.gameboost.com/accounts/6185724/gallery/0b70154a-9aee-4f67-b834-a922122bbcfe.jpg",
            "https://cdn.gameboost.com/accounts/6213164/gallery/58e83257-bef7-4f00-b333-343193769e7b.jpg",
          ],
          delivery: "Instant",
        },
        {
          title: "TH14 Progressed · Heroes 65/65/40/25 · Builder Base Maxed · 1500 Gems",
          price: 28.00, orig: 35.00,
          description: `Solid TH14 account with good progress:\n• Barbarian King: Level 65\n• Archer Queen: Level 65\n• Grand Warden: Level 40\n• Royal Champion: Level 25\n\n💎 1,500 Gems\n🏗️ 5 Builders\n🏠 Builder Base fully maxed\n⚔️ Most troops maxed\n\n✅ Supercell ID changeable\n✅ No bans\n✅ Instant delivery`,
          images: [
            "https://cdn.gameboost.com/accounts/6185724/gallery/0b70154a-9aee-4f67-b834-a922122bbcfe.jpg",
          ],
          delivery: "< 1 hour",
        },
      ];

      // Seed real listings
      for (let i = 0; i < COC_LISTINGS.length; i++) {
        const l = COC_LISTINGS[i];
        await ctx.db.insert("listings", {
          sellerId, gameId: cocId as any, categoryId: categoryId as any,
          title: l.title, slug: mkSlug("coc", i),
          description: l.description,
          price: l.price, originalPrice: l.orig,
          images: l.images,
          deliveryTime: l.delivery, deliveryMethod: "manual" as const,
          status: "active" as const, views: rng(200, 8000),
          badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 30), updatedAt: now - rng(0, 86400000 * 3),
        });
        total++;
        results["clash-of-clans"] = (results["clash-of-clans"] || 0) + 1;
      }

      // Additional generated CoC listings using real image pool
      const COC_IMG_POOL = [
        "https://cdn.gameboost.com/accounts/6213164/gallery/58e83257-bef7-4f00-b333-343193769e7b.jpg",
        "https://cdn.gameboost.com/accounts/6255046/gallery/ed914123-fa2f-4369-b21a-202f7e787b4d.jpg",
        "https://cdn.gameboost.com/accounts/6185724/gallery/0b70154a-9aee-4f67-b834-a922122bbcfe.jpg",
      ];
      const COC_CONFIGS = [
        { th: 18, heroes: "95/95/70/50", gems: "8,000", price: 165, orig: 195 },
        { th: 17, heroes: "80/80/60/42", gems: "3,500", price: 79, orig: 95 },
        { th: 16, heroes: "90/85/65/45", gems: "5,200", price: 120, orig: 149 },
        { th: 15, heroes: "70/70/48/30", gems: "1,200", price: 38, orig: undefined },
        { th: 18, heroes: "100/100/75/55", gems: "12,000", price: 210, orig: 259 },
        { th: 17, heroes: "82/78/58/38", gems: "2,800", price: 69, orig: 89 },
        { th: 16, heroes: "85/82/60/40", gems: "4,100", price: 98, orig: 119 },
        { th: 14, heroes: "60/60/38/20", gems: "900", price: 22, orig: undefined },
        { th: 18, heroes: "104/100/78/77", gems: "15,000", price: 275, orig: 329 },
        { th: 15, heroes: "72/68/45/28", gems: "1,800", price: 42, orig: 52 },
        { th: 17, heroes: "88/85/62/40", gems: "4,500", price: 88, orig: 108 },
        { th: 16, heroes: "92/90/68/48", gems: "6,000", price: 135, orig: 165 },
      ];
      for (let i = 0; i < COC_CONFIGS.length; i++) {
        const c = COC_CONFIGS[i];
        await ctx.db.insert("listings", {
          sellerId, gameId: cocId as any, categoryId: categoryId as any,
          title: `TH${c.th} · Heroes ${c.heroes} · ${c.gems} Gems · Supercell ID Ready · Instant Delivery`,
          slug: mkSlug("coc-gen", i),
          description: `Town Hall ${c.th} account with heroes at ${c.heroes}.\n\n💎 ${c.gems} Gems stored\n🏗️ Builders active\n🧱 Max level walls\n⚔️ Max troops for TH${c.th}\n\n✅ Supercell ID transfer ready\n✅ Zero bans\n✅ Instant delivery after purchase\n✅ Full email access provided`,
          price: c.price, originalPrice: c.orig,
          images: [pick(COC_IMG_POOL)],
          deliveryTime: "Instant", deliveryMethod: "manual" as const,
          status: "active" as const, views: rng(100, 5000),
          badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 30), updatedAt: now - rng(0, 86400000 * 3),
        });
        total++;
        results["clash-of-clans"] = (results["clash-of-clans"] || 0) + 1;
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POKÉMON GO — Top Tier Accounts
    // ──────────────────────────────────────────────────────────────────────────
    const pokemonId = gameMap["pokemon-go"];
    if (pokemonId) {
      const POKEMON_REAL = [
        {
          title: "Level 50 Mystic — Armored Mewtwo + Shundo Rayquaza · 450+ Shinies · 12M Stardust · 42 Hundos",
          price: 219.00, orig: 280.00,
          description: `✨ POKÉMON GO ELITE LEVEL 50 ACCOUNT ✨\n📧 FULL ACCESS | CLEAN PTC LOGIN | INSTANT EMAIL CHANGE\n\n🎮 Trainer Level: 50 (MAX)\n🛡️ Team: Mystic (Changeable)\n✨ Stardust: 12,500,000+\n🪙 PokéCoins: 3,500\n\n✨ EXCLUSIVE SHINIES & GRAILS ✨\n👑 Armored Mewtwo (Legacy)\n👑 Shundo Rayquaza (Dragon Ascent / Lv.50 CP)\n👑 Shundo Primal Groudon & Kyogre\n👑 Shiny Libre Pikachu & Fragment Hat Pikachu\n👑 Shiny Mew & Shiny Jirachi\n\n✨ STORAGE & MEDALS ✨\n🎒 Bag Space: 3,500\n📦 Pokémon Storage: 4,000\n🏅 Platinum Medals: 45+\n\n✅ 100% clean account with no strikes or warnings\n✅ Full email access included\n✅ Instant delivery`,
          images: ["/pokemon-go-poster.png"],
          delivery: "Instant",
        },
        {
          title: "Level 48 Valor Beast — Apex Shadow Ho-Oh & Lugia · 280+ Legendaries · 38 Hundos · Master League Ready",
          price: 260.00, orig: 320.00,
          description: `🎮 ACCOUNT OVERVIEW\n\n🆙 Trainer Level: 48\n🛡️ Team: Valor (Red)\n✨ Stardust: 6,800,000\n💯 Total 100% IV (Hundos): 38\n👑 Shundos (Shiny 100% IV): 6\n🐉 Legendaries & Mythicals: 280+\n\n🧬 APEX SHADOW & LEGACIES\n🔥 Apex Shadow Ho-Oh (Sacred Fire+)\n🌊 Apex Shadow Lugia (Aeroblast+)\n⚔️ Dialga Origin (Roar of Time Adventure Effect)\n🌌 Palkia Origin (Spacial Rend Adventure Effect)\n\n🥊 GO BATTLE LEAGUE READY\n🏆 Rank 24 Legend teams built for Great, Ultra, and Master League\n\n✅ Instant Delivery\n✅ Full Email Access Included`,
          images: ["/pokemon-go-poster.png"],
          delivery: "Instant",
        },
        {
          title: "Level 50 Instinct — Shiny Mythical Master (Mew, Jirachi, Shaymin) · 500+ Shinies · 60 Hundos",
          price: 489.99, orig: 650.00,
          description: `🌟 POKÉMON GO ULTRA COLLECTOR ACCOUNT\n\n📊 ACCOUNT SNAPSHOT\n🎖️ Trainer Level: 50\n🛡️ Team: Instinct (Yellow)\n🌟 Total Shinies: 500+\n💯 100% IV Hundos: 60\n✨ Stardust: 15,000,000+\n\n⭐ HIGHLIGHTS\n💎 Shiny Mew (Masterwork Research completed)\n💎 Shiny Jirachi (Masterwork Research completed)\n💎 Shiny Shaymin & Shiny Celebi\n👑 Complete Unown shiny alphabet\n\n✅ Clean PTC login\n✅ 30-day warranty\n✅ Instant delivery`,
          images: ["/pokemon-go-poster.png"],
          delivery: "Instant",
        },
        {
          title: "Level 45 Mystic — Primal Groudon & Kyogre Shundos · 180+ Shinies · 25 Hundos",
          price: 89.99, orig: 120.00,
          description: `📌 ACCOUNT DETAILS\n\n🎮 Game: Pokémon GO\n🎖️ Trainer Level: 45\n🛡️ Team: Mystic\n✨ Stardust: 4,200,000\n🌟 180+ Shinies\n\n< SHUNDO HIGHLIGHTS >\n👑 Shundo Primal Groudon\n👑 Shundo Primal Kyogre\n👑 Shundo Tyranitar\n\n✅ Instant Automatic Delivery\n✅ Full Account Access\n✅ Original Email Included`,
          images: ["/pokemon-go-poster.png"],
          delivery: "Instant",
        },
        {
          title: "Level 47 PvP Legend Account — Dialga Origin, Giratina, Zacian 100% IV · Pikachu Libre Unlocked",
          price: 140.00, orig: 190.00,
          description: `📌 ACCOUNT DETAILS\n\n🎮 Game: Pokémon GO\n🎖️ Trainer Level: 47\n🏆 GBL Rank 24 Legend Pose & Outfit\n⚡ Pikachu Libre unlocked\n🥊 Level 50 Master League top IV meta team\n\n✅ Instant Automatic Delivery\n✅ Full Account Access Included\n✅ Changeable Login Credentials`,
          images: ["/pokemon-go-poster.png"],
          delivery: "Instant",
        },
        {
          title: "2016 OG Veteran Account — Witch Hat, Santa, Fragment Pikachu · 2016 Guaranteed Luckies",
          price: 59.99, orig: 89.99,
          description: `🏆 ULTRA RARE 2016 POKÉMON GO ACCOUNT\n\n🎮 Account Creation Date: July 2016\n🎖️ Trainer Level: 42\n🎪 Guaranteed Lucky Trades available\n⚡ 2016/2017 exclusive costume Pikachus\n🐉 Legacy Dragonite & Shadow Claw Gengar\n\n✅ Full email access\n✅ Instant delivery`,
          images: ["/pokemon-go-poster.png"],
          delivery: "Instant",
        },
      ];

      const POKEMON_IMG_POOL = [
        "/pokemon-go-poster.png",
      ];

      for (let i = 0; i < POKEMON_REAL.length; i++) {
        const l = POKEMON_REAL[i];
        await ctx.db.insert("listings", {
          sellerId, gameId: pokemonId as any, categoryId: categoryId as any,
          title: l.title, slug: mkSlug("pokemon", i),
          description: l.description, price: l.price, originalPrice: l.orig,
          images: l.images, deliveryTime: l.delivery, deliveryMethod: "manual" as const,
          status: "active" as const, views: rng(500, 12000), badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 30), updatedAt: now - rng(0, 86400000 * 3),
        });
        total++;
        results["pokemon-go"] = (results["pokemon-go"] || 0) + 1;
      }

      // Additional Pokémon GO listings
      const POKEMON_EXTRAS = [
        { title: "Level 50 Grail · Shiny Armored Mewtwo + Shiny Libre · 700+ Shinies", price: 999.00, orig: 1200.00 },
        { title: "Level 46 Valor · Shundo Origin Dialga & Palkia Signature Moves", price: 110.00, orig: 150.00 },
        { title: "Level 40 Fresh Starter · Shundo Charizard + Rayquaza · Clean PTC", price: 34.00, orig: undefined },
        { title: "Level 35 Starter · 25+ Legendaries · 1M Stardust · Clean PTC", price: 9.99, orig: 15.00 },
        { title: "Level 44 Mystic · 300+ Shinies · Shundo Metagross & Garchomp", price: 79.99, orig: 99.00 },
        { title: "Level 49 Instinct · 50+ Hundos · 10M Stardust · Master League Built", price: 299.00, orig: 350.00 },
        { title: "Level 38 Starter · Shiny Necrozma (Dusk Mane & Dawn Wings)", price: 49.00, orig: 65.00 },
        { title: "Level 43 Valor · Complete Regional Dex · Shiny Lake Trio", price: 85.00, orig: 110.00 },
        { title: "Level 41 PTC · Shundo Mega Rayquaza · 3.5M Stardust", price: 65.00, orig: 85.00 },
        { title: "Level 33 Budget Account · Mewtwo + Rayquaza + Dialga · Name Change ON", price: 4.99, orig: undefined },
      ];
      for (let i = 0; i < POKEMON_EXTRAS.length; i++) {
        const e = POKEMON_EXTRAS[i];
        await ctx.db.insert("listings", {
          sellerId, gameId: pokemonId as any, categoryId: categoryId as any,
          title: e.title, slug: mkSlug("pokemon-x", i),
          description: `Premium Pokémon GO account featuring ${e.title}.\n\n✅ Full email access included\n✅ Instant delivery\n✅ Clean login with no warnings\n✅ 24/7 support after purchase`,
          price: e.price, originalPrice: e.orig,
          images: [pick(POKEMON_IMG_POOL)],
          deliveryTime: "Instant", deliveryMethod: "manual" as const,
          status: "active" as const, views: rng(200, 7000), badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 30), updatedAt: now - rng(0, 86400000 * 3),
        });
        total++;
        results["pokemon-go"] = (results["pokemon-go"] || 0) + 1;
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // FREE FIRE — Real data scraped from GameBoost
    // ──────────────────────────────────────────────────────────────────────────
    const ffId = gameMap["free-fire"];
    if (ffId) {
      const FF_REAL = [
        {
          title: "LVL 61 · 5 Years Old · LOL Emote · Draco M10 · 2 Evo + 15 Mythic Guns · Prime 3 · India Server",
          price: 21.99, orig: 29.99,
          description: `❄️READ ALL INFORMATION CAREFULLY❄️\n\n♦️ RAREST FREE FIRE ACCOUNT ♦️\n\n🔥 LVL 61 India Server — 5 YEARS OLD ACCOUNT\n🔥 MONEY HEIST BUNDLE\n🔥 DRACO M10 (Evo Gun)\n🔥 2 EVO & 15 MYTHIC GUNS\n🔥 PRIME 3 Active\n🔥 3800 Likes\n🔥 130 Vault Collections\n🔥 OLD RARE EMOTES\n\n❇️ Full Mail ID Access\n❇️ Secure Transfer Guarantee\n❇️ Instant Delivery\n❇️ Step-by-Step Login Guide\n❇️ 100% Safe & Verified Account\n❇️ 24/7 Live Support After Delivery`,
          images: [
            "https://cdn.gameboost.com/accounts/6226793/gallery/2104b9c9-83b5-4767-b4df-a89e759a0758.jpg",
            "https://cdn.gameboost.com/accounts/6226793/gallery/8e5872b2-440b-4356-88c5-10f824a46456.jpg",
            "https://cdn.gameboost.com/accounts/6226793/gallery/72958cb9-7e12-4219-aff7-a37f96846026.jpg",
            "https://cdn.gameboost.com/accounts/6226793/gallery/0d08959e-cbd4-4d12-89bb-2b264cb62cef.jpg",
          ],
          delivery: "Instant",
        },
        {
          title: "Heroic Level 81 · 670+ Gun Skins · 630+ Fashion · 4 Evo Max · 334 Rare Bundles · Prime 7 · India",
          price: 233.56, orig: 289.00,
          description: `👀 MOST STACKED FREE FIRE ACCOUNT\n\n🌍 Region: India\n📊 Level: 81\n⚡ Prime Level 7\n\n🔫 670+ GUN SKINS TOTAL\n👗 630+ FASHION ITEMS\n🔥 4 EVO GUNS — ALL MAXED\n💀 334 RARE T-SHIRTS/BUNDLES\n🐰 BUNNY BUNDLES Collection\n👕 631 OP T-Shirts\n🌟 119 MYTHIC Gun Skins\n\n🎮 HIGHLIGHTS:\n• 6+ Years old account\n• Globally playable\n• Old & New bundles mixed\n• High Level 81 — very rare\n\n✅ Instant Delivery\n✅ Full Email Access\n✅ 100% Safe Account`,
          images: [
            "https://cdn.gameboost.com/accounts/6192164/gallery/9f2d8523-3c61-460d-b067-424481a58b95.jpg",
            "https://cdn.gameboost.com/accounts/6192164/gallery/1a1b2c3d-4e5f-6789-abcd-ef0123456789.jpg",
          ],
          delivery: "Instant",
        },
        {
          title: "Heroic Level 64 · XM8 Destiny Lv.4 · MP40 Chromasonic Lv.4 · 3 Evo + 29 Mythic · LATAM Server",
          price: 52.54, orig: 69.00,
          description: `X486 | Level 64 | LATAM SERVER\n\n📊 ACCOUNT DETAILS:\n🎮 Level: 64\n🌎 Server: LATAM\n⚡ Prime Level 4\n👥 65 Characters\n👗 52 Bundles\n👔 147 Costumes\n🔫 222 Weapons (3 Evo + 29 Mythic)\n\n🔫 EVO GUNS:\n⚡ XM8 Destiny — Level 4\n🎵 MP40 Chromasonic — Level 4\n+ 1 more Evo gun\n\n🏆 HEROIC RANK — Season 52\n\n✅ Full Google Account Access\n✅ Instant Delivery\n✅ 100% Verified & Safe`,
          images: [
            "https://cdn.gameboost.com/accounts/6258601/gallery/69d58882-0a80-4270-84bc-cb5fac11f0af.jpg",
          ],
          delivery: "< 15 mins",
        },
        {
          title: "LVL 71 · AK47 Blue Flame Draco Lv.5 · SCAR Megalodon Lv.4 · 2 Evo · 363 Costume · Indonesia",
          price: 35.04, orig: 45.00,
          description: `✨ FREE FIRE PREMIUM ACCOUNT ✨\n\n🎮 Level: 71\n🌏 Server: Indonesia\n🔫 2x Evo Gun Skins\n\n🔥 EVO GUNS:\n⚡ AK47 Blue Flame Draco — Level 5\n🦈 SCAR Megalodon — Level 4\n🎵 MP5 Crowned Glory\n\n👗 363 COSTUMES\n📦 169 BUNDLES\n🔫 380 WEAPONS\n\n✅ Login: Google Account\n✅ Android & iOS compatible\n✅ 100% Safe — No Hack Back\n✅ Instant Delivery\n✅ Good Service 100% Guaranteed`,
          images: [
            "https://cdn.gameboost.com/accounts/6278630/gallery/52ae2ce2-9c2e-4416-a8f7-da15fc0d6aa0.jpg",
            "https://cdn.gameboost.com/accounts/6278630/gallery/2e29e2fb-3625-4516-8d42-76b5b2a77bcf.jpg",
            "https://cdn.gameboost.com/accounts/6278630/gallery/9194d7eb-039e-4e75-89cb-f6364faf660e.jpg",
          ],
          delivery: "Instant",
        },
        {
          title: "Level 67 · LATAM North · 358 Gun Skins · 45 Mythic · 88 Bundles · Yuji Itadori · Prime 2",
          price: 87.37, orig: 110.00,
          description: `👑 LATAM NORTH SERVER ACCOUNT\n\n📊 STATS:\n🎮 Level: 67\n⚡ Prime 2 Active\n🔫 358 Total Gun Skins\n⭐ 45 Mythic Gun Skins\n🎭 34 Emotes\n👕 88 Bundles\n\n🌟 EXCLUSIVE ITEMS:\n🥷 Yuji Itadori Bundle (rare Jujutsu Kaisen)\n🔥 Earthshaker Bundle\n🪂 Paradox Throne Skydive Trail\n\n✅ Full Account Access\n✅ Instant Delivery\n✅ 100% Safe`,
          images: [
            "https://cdn.gameboost.com/accounts/5380080/gallery/a1b64e83-d616-402c-8f08-7c71a1594a3e.jpeg",
          ],
          delivery: "Instant",
        },
        {
          title: "Level 64 · LATAM North · Cindered Thompson Lv.3 · 2 Evo + 30 Mythic · Prime 4 · Heroic S52",
          price: 43.20, orig: 55.00,
          description: `X485 | Level 64 | NORTH AMC SERVER\n\n📊 ACCOUNT DETAILS:\n🎮 Level: 64\n🌎 Server: North AMC\n⚡ Prime Level 4\n👥 56 Characters\n👗 50 Bundles\n👔 106 Costumes\n🔫 185 Weapons (2 Evo + 30 Mythic)\n\n🔫 EVO GUNS:\n🔥 Cindered Thompson — Level 3\n🪵 Majestic Woodpecker — Level 3\n\n🏆 HEROIC RANK — Season 52\n\n✅ Full Account Access\n✅ Instant Delivery\n✅ Verified Safe`,
          images: [
            "https://cdn.gameboost.com/accounts/6258394/gallery/67cd3f6d-8f25-46f6-83ba-dfa06461fac6.jpg",
          ],
          delivery: "Instant",
        },
        {
          title: "6 Years Old Account · 8 Evo Guns · 337 Vaults · 55 Emotes · Golden Criminal Top Bundle",
          price: 118.20, orig: 149.00,
          description: `⭕️ EXTREMELY RARE FREE FIRE ACCOUNT ⭕️\n\n🔑 KEY HIGHLIGHTS:\n📅 6 YEARS OLD Account\n🏆 Golden Criminal Top Bundle (exclusive)\n🔫 8 EVO GUN SKINS (maxed)\n📦 337 VAULTS/COLLECTIONS\n🎭 55 EMOTES\n\n✅ Old rare legacy items included\n✅ Full access with email\n✅ Instant delivery\n✅ 100% Safe & Verified`,
          images: [
            "https://cdn.gameboost.com/accounts/6259028/gallery/121-jbbnif9sns50vf62rv6k.jpg",
          ],
          delivery: "< 15 mins",
        },
        {
          title: "2020 Account · One Punch Man Exclusive Skin · Multiple Evolutions · Rare Legacy Items",
          price: 200.06, orig: 249.00,
          description: `🏆 COLLECTOR'S EDITION — FREE FIRE 2020\n\n📅 Account from 2020\n🦸 ONE PUNCH MAN EXCLUSIVE SKIN (very rare)\n🔫 Multiple Evo Guns\n🌟 Legacy rare items from early seasons\n\n✅ Complete email access\n✅ Instant delivery\n✅ Unique collector piece`,
          images: [
            "https://cdn.gameboost.com/accounts/6259034/gallery/25-5brhmv860p2mou261czi.jpg",
          ],
          delivery: "Instant",
        },
        {
          title: "Indonesia · FAMAS Demon Lv.7 · AK47 Draco Lv.6 · M1887 Sterling · 391 Vault · 198 Bundles",
          price: 47.82, orig: 59.00,
          description: `🔥 STACKED INDONESIA FREE FIRE ACCOUNT\n\nBinding Status: Bind by Dummy Email (Email included)\n\n🔫 EVO GUNS (MAXED):\n⚡ FAMAS Demon — Level 7\n🐉 AK47 Draco — Level 6\n🥈 M1887 Sterling Conqueror\n🌀 Parafal Cyclone\n\n👗 Collections:\n📦 391 Vault Items\n👕 198 Bundles\n\nWHY CHOOSE US?\n1. Full Access — complete account details\n2. Transparent Guarantee\n3. 100% Safe — No bots, No ExC\n4. Fast Delivery + 24/7 Support\n5. 10+ Years of Experience\n6. 1 Million+ Orders Completed\n7. Trusted in 50+ Countries`,
          images: [
            "https://cdn.gameboost.com/accounts/6280767/gallery/9b7d7984-21a6-4aba-8c39-8106450aae7c.jpg",
            "https://cdn.gameboost.com/accounts/6280767/gallery/cb02f427-0edc-4ac2-bf7e-7c8caab323fc.jpg",
            "https://cdn.gameboost.com/accounts/6280767/gallery/5597a608-7e2e-45c8-b1fc-91993f58138e.jpg",
            "https://cdn.gameboost.com/accounts/6280767/gallery/f5e95392-9beb-4d01-9e33-3380f8653b38.jpg",
          ],
          delivery: "Instant",
        },
        {
          title: "Diamond Level 67 · MP40 Cobra Lv.4 · 2 Evo + 50 Mythic · 131 Bundles · 70 Vehicles · North AMC",
          price: 71.23, orig: 89.00,
          description: `X483 | Level 67 | NORTH AMC SERVER\n\n📊 ACCOUNT:\n🎮 Level: 67\n🌎 Server: North AMC\n👥 66 Characters\n👗 131 Bundles (NAVY Legendary Bundle included)\n👔 348 Costumes\n🔫 369 Weapons (2 Evo + 50 Mythic)\n🚗 70 Vehicles\n\n🔫 EVO GUNS:\n🐍 MP40 Cobra — Level 4\n\n💎 DIAMOND RANK — Season 52\n\n✅ Full Account Access\n✅ Instant Delivery`,
          images: [
            "https://cdn.gameboost.com/accounts/6258601/gallery/69d58882-0a80-4270-84bc-cb5fac11f0af.jpg",
          ],
          delivery: "Instant",
        },
      ];

      for (let i = 0; i < FF_REAL.length; i++) {
        const l = FF_REAL[i];
        await ctx.db.insert("listings", {
          sellerId, gameId: ffId as any, categoryId: categoryId as any,
          title: l.title, slug: mkSlug("ff", i),
          description: l.description, price: l.price, originalPrice: l.orig,
          images: l.images, deliveryTime: l.delivery, deliveryMethod: "manual" as const,
          status: "active" as const, views: rng(300, 9000), badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 30), updatedAt: now - rng(0, 86400000 * 3),
        });
        total++;
        results["free-fire"] = (results["free-fire"] || 0) + 1;
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ROBLOX — Real listings
    // ──────────────────────────────────────────────────────────────────────────
    const robId = gameMap["roblox"];
    if (robId) {
      const ROB_IMG_POOL = [
        "https://cdn.gameboost.com/accounts/4013208/gallery/34aeb225-e312-4483-a1fb-b541540058dc.png",
        "https://cdn.gameboost.com/accounts/5353349/gallery/123-fd58c123-c94c-45f4-b70b-37ff033daee9-webp.webp",
        "https://cdn.gameboost.com/accounts/6280457/gallery/24-10bVNN.png",
      ];
      const ROB_LISTINGS = [
        {
          title: "2007 OG Account · 20,000 RAP · Korblox Deathspeaker · 3-Letter Username · Unverified",
          price: 75.00, orig: 95.00,
          description: `🏆 RARE 2007 ROBLOX ACCOUNT\n\n📅 Created: 2007 (OG Veteran Badge)\n💎 RAP: 20,000\n🎭 LIMITED: Korblox Deathspeaker\n🔤 Username: 3-Letter (OG)\n✅ Unverified — easy transfer\n🚫 No ban history\n\n✅ Instant delivery\n✅ Full account access`,
          images: [pick(ROB_IMG_POOL)],
        },
        {
          title: "2008 OG · Headless Horseman · 100,000 RAP · 10,000 Robux · Premium Active · Voice Chat Enabled",
          price: 417.11, orig: 499.00,
          description: `💎 ULTRA PREMIUM 2008 ROBLOX ACCOUNT\n\n📅 Created: 2008 (Veteran Badge)\n🎭 LIMITED: Headless Horseman (most sought-after)\n💰 RAP: 100,000\n💎 Robux: 10,000\n🎤 Voice Chat Enabled\n⭐ Premium Membership Active\n✅ ID Verified\n\n✅ Instant delivery\n✅ Full account access provided`,
          images: [pick(ROB_IMG_POOL)],
        },
        {
          title: "2009 Account · Dominus Frigidus · 50,000 RAP · 5,000 Robux · 4-Letter Username",
          price: 285.00, orig: 349.00,
          description: `🌟 PREMIUM 2009 ROBLOX COLLECTOR ACCOUNT\n\n📅 Created: 2009\n🎭 LIMITEDS:\n• Dominus Frigidus\n💰 RAP: 50,000\n💎 Robux: 5,000\n🔤 Username: 4-Letter\n\n✅ Unverified — easy transfer\n✅ No ban history\n✅ Instant delivery`,
          images: [pick(ROB_IMG_POOL)],
        },
        {
          title: "3-Letter OG Username · @EZD · 2008 Created · Unverified · Extremely Rare",
          price: 550.00, orig: undefined,
          description: `🔤 ULTRA RARE 3-LETTER USERNAME\n\n📛 Username: 3 characters (OG)\n📅 Created: 2008\n✅ Unverified — instant transfer\n🏆 OG Veteran Badge\n🚫 Zero violations\n\n3-letter usernames are some of the most sought-after accounts in Roblox. Extremely limited availability.\n\n✅ Instant delivery\n✅ Full account credentials`,
          images: [pick(ROB_IMG_POOL)],
        },
        {
          title: "Blox Fruits Max Level 2800 · Godhuman Unlocked · Gravity Fruit · Premium Active",
          price: 12.99, orig: 18.00,
          description: `⚔️ BLOX FRUITS MAXED ROBLOX ACCOUNT\n\n🎮 Blox Fruits Level: 2800 (MAX)\n🥊 Fighting Style: Godhuman (rarest)\n🌌 Fruit: Gravity\n⭐ Premium Membership Active\n\n✅ Full email access\n✅ Instant delivery\n✅ Ready to grind`,
          images: [pick(ROB_IMG_POOL)],
        },
        {
          title: "2010 Account · Valkyrie Helm + Clockwork Headphones · 15,000 RAP · 2,500 Robux",
          price: 180.00, orig: 220.00,
          description: `🎭 2010 ROBLOX COLLECTOR ACCOUNT\n\n📅 Created: 2010\n🎭 LIMITEDS:\n• Valkyrie Helm\n• Clockwork's Headphones\n💰 RAP: 15,000\n💎 Robux: 2,500\n\n✅ Unverified for easy transfer\n✅ No ban history\n✅ Instant delivery`,
          images: [pick(ROB_IMG_POOL)],
        },
        {
          title: "2007 OG · Dominus Infernus · 200,000 RAP · 15,000 Robux · Premium · Voice Enabled",
          price: 750.00, orig: 899.00,
          description: `👑 RAREST 2007 ROBLOX ACCOUNT — COLLECTOR PIECE\n\n📅 Created: 2007 (OG)\n🎭 LIMITEDS:\n• Dominus Infernus (ultra rare)\n💰 RAP: 200,000+\n💎 Robux: 15,000\n⭐ Premium Active\n🎤 Voice Chat Enabled\n✅ ID Verified\n\nOne of the rarest accounts available. Dominus Infernus has extremely limited supply.\n\n✅ Full access\n✅ Instant delivery`,
          images: [pick(ROB_IMG_POOL)],
        },
        {
          title: "4-Letter Username · @oxqr · OG Account · Unverified · High Collector Value",
          price: 109.99, orig: 139.00,
          description: `🔤 PREMIUM 4-LETTER OG USERNAME\n\n📛 Username: @oxqr (4 chars)\n✅ Unverified — easy and instant transfer\n🏆 OG badge\n🚫 Clean no-ban history\n\n4-letter usernames are highly collectible in Roblox. Very limited availability.\n\n✅ Instant delivery\n✅ Full account access`,
          images: [pick(ROB_IMG_POOL)],
        },
        {
          title: "Adopt Me Account · 1125+ Potions · 660K+ Bucks · Rare Pets · Instant Delivery",
          price: 4.29, orig: undefined,
          description: `🐾 ADOPT ME STACKED ACCOUNT\n\n🎮 Game: Adopt Me (Roblox)\n💊 1,125+ Potions\n💰 660,000+ Game Bucks\n🐕 Rare pets collection\n\n✅ Instant delivery\n✅ Full account access\n✅ Ready to play`,
          images: [pick(ROB_IMG_POOL)],
        },
        {
          title: "2020 Account · Red Valk + Sparkle Time Fedora · 10,000 RAP · 1,000 Robux",
          price: 65.00, orig: 80.00,
          description: `🎭 ROBLOX ACCOUNT WITH POPULAR LIMITEDS\n\n📅 Created: 2020\n🎭 LIMITEDS:\n• Red Valk\n• Sparkle Time Fedora\n💰 RAP: 10,000\n💎 Robux: 1,000\n\n✅ Unverified for easy transfer\n✅ No bans\n✅ Instant delivery`,
          images: [pick(ROB_IMG_POOL)],
        },
      ];

      for (let i = 0; i < ROB_LISTINGS.length; i++) {
        const l = ROB_LISTINGS[i];
        await ctx.db.insert("listings", {
          sellerId, gameId: robId as any, categoryId: categoryId as any,
          title: l.title, slug: mkSlug("rob", i),
          description: l.description, price: l.price, originalPrice: l.orig,
          images: l.images, deliveryTime: "Instant", deliveryMethod: "manual" as const,
          status: "active" as const, views: rng(200, 8000), badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 30), updatedAt: now - rng(0, 86400000 * 3),
        });
        total++;
        results["roblox"] = (results["roblox"] || 0) + 1;
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // CLASH ROYALE — Real data from GameBoost
    // ──────────────────────────────────────────────────────────────────────────
    const crId = gameMap["clash-royale"];
    if (crId) {
      const CR_REAL = [
        {
          title: "KT16 · 3x CRL20 Emotes · GT100 Emote · Top Ranked #43 · 33 Evos · 10 Heroes · 12,114 Trophies · OG 10 Years",
          price: 1518.33, orig: undefined,
          description: `🌟 THE RAREST CLASH ROYALE ACCOUNT ON MARKET 🌟\n\n👑 ONE IN MARKET — TOP STATS ACCOUNT\n\n✨ ALL 3x RAREST CRL 20 WIN EMOTES 💎\n✨ THE GT 100 EMOTE 🏆\n🏅 RANKED 43, 76, 126, 182 IN GLOBAL TOURNAMENT\n✨ ANNIVERSARY HEALER 🌈\n✨ LNY HOG 💰\n✨ EMPEROR KING 👑\n✨ SPECIAL EVENT EMOTES (OK, HI, NOPE)\n✨ 2018, 2019, 2021, 2024, 2025 CRL20 WIN BADGES\n\n🐉 KING TOWER LEVEL 16\n🔥 ALL 121 CARDS UNLOCKED\n😈 33 EVOLUTION CARDS\n🌟 MAXED OUT 80 XP\n🏆 12,114 TROPHIES\n🔥 10x HEROES UNLOCKED\n💎 5,194 GEMS\n🌸 34 MAX CARDS (LEVEL 16)\n\n🏅 GLOBAL TOURNAMENT RANKS: 43, 76, 126, 182\n🏅 5x CRL BADGE\n\n✅ SAFE TO BUY\n✅ INSTANT DELIVERY\n✅ FULL MAIL ACCESS\n✅ iOS & Android`,
          images: [
            "https://cdn.gameboost.com/accounts/6043461/gallery/b4334910-e127-4238-a779-f87331d414a9.jpg",
            "https://cdn.gameboost.com/accounts/6043461/gallery/2cd5323a-ef84-4ab0-a7cf-e49bcc78f173.jpg",
            "https://cdn.gameboost.com/accounts/6043461/gallery/a5f3575d-ca30-4c55-bd2b-854054e4aad1.jpg",
            "https://cdn.gameboost.com/accounts/6043461/gallery/6857d901-c145-4128-ab22-187b4af802d1.jpg",
          ],
          delivery: "Instant",
        },
        {
          title: "KT16 · GT100 + CRL20 Emotes · Champion King · 39 Evolutions · 35 Tower Skins · 13,000 Trophies · Rename Available",
          price: 934.35, orig: undefined,
          description: `👑 LEGACY CLASH ROYALE ACCOUNT 👑\n\n✨ THE GT 100 EMOTE 🏆\n✨ CRL 20 WIN EMOTE ❄️\n🌸 RANKED 58 IN GLOBAL TOURNAMENT\n✨ CHAMPION KING EMOTE 👑\n\n🌟 27 MAX CARDS (LEVEL 16)\n🔥 115 CARDS ELITE\n😈 ALL 39 EVOLUTIONS\n🌟 MAXED OUT 77 XP — KING TOWER LEVEL 16\n💪 4x HEROES UNLOCKED\n\n🏅 TOP ULTIMATE CHAMPION RANKS: 323, 427 & 630\n🏅 GLOBAL TOURNAMENT RANKS: 38, 207, 231 & 537\n🏅 2x CRL BADGES\n\n🔥 35 TOWER SKINS\n✨ EXCLUSIVE BANNERS & DECORATIONS\n✅ NAME CHANGE AVAILABLE\n🏆 13,000 TROPHIES\n\n✅ INSTANT DELIVERY\n✅ FULL MAIL ACCESS\n✅ iOS & Android`,
          images: [
            "https://cdn.gameboost.com/accounts/6106597/gallery/8c3c3534-2c50-4f98-ab8f-2f2894580dff.jpg",
            "https://cdn.gameboost.com/accounts/6106597/gallery/b843a118-9f63-430b-9ad4-b4634b2e71b8.jpg",
            "https://cdn.gameboost.com/accounts/6106597/gallery/2c663c63-40f8-446d-86b5-e05a81d6763d.jpg",
            "https://cdn.gameboost.com/accounts/6106597/gallery/9ea12812-23e0-4d75-9c0e-cab1ab3f27c4.jpg",
          ],
          delivery: "Instant",
        },
        {
          title: "KT16 · CRL20 Watch Party Badge · 83 Elite · 169 Emotes · 20 Evolutions · Emperor King · 11,570 Trophies",
          price: 350.37, orig: 420.00,
          description: `💥 121 CARDS UNLOCKED — RAREST CLASH ROYALE ACCOUNT\n\n🌟 RAREST EMOTES:\n👑 EMPEROR KING Emote\n😂 LAUGHING HOG Emote\n👻 ROYAL GHOST GEM Emote\n🤹 BARBARIAN PUPPET Emote\n🎫 CRL 20 WATCH PARTY BADGE\n\n📊 ACCOUNT STATS:\n🐉 King Tower Level 15 → 16\n🏆 11,570 TROPHIES\n📋 ALL 121/121 CARDS\n⚡ 20 EVOLUTION CARDS\n🌟 75 XP\n🎭 169 EMOTES\n🎩 12x TOWER SKINS\n🦸 10x HEROES\n💎 5,035 GEMS\n💰 1,527,658 GOLD\n\n✅ All accounts Legit and safe\n✅ Instant delivery after purchase`,
          images: [
            "https://cdn.gameboost.com/accounts/6209122/gallery/455645a1-1c45-46d1-8d3e-10a940a6310e.jpg",
            "https://cdn.gameboost.com/accounts/6209122/gallery/61716fcd-3c1b-42fb-9d0c-90d1473ab2ee.jpg",
            "https://cdn.gameboost.com/accounts/6209122/gallery/72f2e1b1-e2dc-4c8e-8878-986acca6b40c.jpg",
            "https://cdn.gameboost.com/accounts/6209122/gallery/97dc6385-c025-46a8-a10a-86549a10551a.jpg",
          ],
          delivery: "Instant",
        },
        {
          title: "KT15 · 9 Years OG · 11,021 Trophies · 8 Evos · 3K+ Gems · Near Max TH11 CoC Bonus",
          price: 198.55, orig: 249.00,
          description: `👑 9 YEARS OG CLASH ROYALE\n\n🎮 King Tower: 14 → 15\n🏆 11,021 TROPHIES\n⚡ 8 EVOLUTION CARDS\n💎 3,000+ GEMS\n🃏 LVL 16 Cards included\n\n🎁 BONUS: Near Max TH11 Clash of Clans account included!\n\n📅 9 Years Old Account\n🌐 iOS & Android compatible\n\n✅ Full email access\n✅ Instant delivery\n✅ Complete account history`,
          images: [
            "https://cdn.gameboost.com/accounts/6267350/gallery/e5cdf593-cfb8-4dfe-bbdd-6c0b76bb53e5.jpg",
          ],
          delivery: "Instant",
        },
        {
          title: "KT15 · 107 Max Cards · 8 Years Badge · 12,000 Trophies · 133 Emotes · 2,064 Gems · Arena 24",
          price: 145.99, orig: 179.00,
          description: `🔥 107 MAX CARDS — OG 8 YEARS BADGE\n\n📊 FULL ACCOUNT DETAILS:\n🐉 King Tower Level: 15\n👑 Level: 63\n🏆 12,000 TROPHIES\n🎯 Arena 24\n🃏 121 Cards Total\n💎 2,064 Gems\n💰 1.5M Gold\n🎭 133 Emotes\n\n⚡ MAX CARDS BREAKDOWN:\n• 15x Level 15 Cards\n• 88x Level 14 Cards\n• 107 Total Maxed\n\n✅ Instant Delivery\n✅ Full Email Access\n✅ iOS & Android`,
          images: [
            "https://cdn.gameboost.com/accounts/6285688/gallery/c30d6d64-035c-4653-84f5-e490b41b4556.png",
          ],
          delivery: "Instant",
        },
        {
          title: "KT15 · 9 Years Badge · 16 Evolution Cards · 9,800 Trophies · 67 Max Cards · Arena 24 · Season 9",
          price: 162.35, orig: 199.00,
          description: `⭕️ 9 YEARS PLAYED BADGE\n\n📊 ACCOUNT DETAILS:\n⭕️ 16 EVOLUTION CARDS\n⭕️ Level 58\n⭕️ 9,800 TROPHIES\n⭕️ Arena 24\n⭕️ King Tower Level 15\n⭕️ 16 ELITE CARDS\n⭕️ 67 MAX CARDS\n⭕️ NC 1000 (name change coins)\n⭕️ iOS & Android\n⭕️ Season 09 badge\n\n✅ Instant Access\n✅ Full email provided`,
          images: [
            "https://cdn.gameboost.com/accounts/2506940/gallery/ff542a82-c4c6-4b83-92d8-90b2cfc481f1.jpeg",
          ],
          delivery: "Instant",
        },
        {
          title: "KT16 · 38 Max Cards · 33,000 Gems · 167 Emote Collection · 28 Evos · 7 Heroes",
          price: 256.95, orig: 320.00,
          description: `💎 PREMIUM KT16 WITH MASSIVE GEM STASH\n\n📊 STATS:\n🐉 King Tower: 16\n💎 33,000 GEMS (!)\n🃏 38 Level 16 Cards\n📋 80 Level 15 Cards\n🎭 167 Emote Collection\n😈 28 Evolution Cards\n🦸 7 Heroes Unlocked\n🌟 Collection Level 2055\n\n✅ Full mail access — shift to buyer email\n✅ iOS & Android\n✅ Instant delivery`,
          images: [
            "https://cdn.gameboost.com/accounts/6292403/gallery/62f5eaa6-e1b5-4d5f-ab76-cf4727420843.jpg",
          ],
          delivery: "Instant",
        },
        {
          title: "KT16 · 115 Max Cards · 4 Years Badge · 10,500 Trophies · 3,917 Gems · 141 Emotes · Arena 24",
          price: 169.35, orig: 209.00,
          description: `🔥 115 MAX CARDS — OG 4 YEARS BADGE\n\n📊 FULL DETAILS:\n🐉 King Tower: 15 → 16\n👑 Level: 67\n🏆 10,500 Trophies\n🎯 Arena 24\n🃏 121 Cards Total\n💎 3,917 Gems\n💰 1.4M Gold\n🎭 141 Emotes\n\n⚡ MAX CARDS:\n• 43x Level 15\n• 72x Level 14\n• 115 Total\n\n✅ Instant Delivery\n✅ Full Email Access`,
          images: [
            "https://cdn.gameboost.com/accounts/6285752/gallery/014152d9-74f3-4f94-8d2b-1695cd53b5eb.jpg",
          ],
          delivery: "Instant",
        },
        {
          title: "KT16 · PEKKA Balloon · 121 Max Cards · 14,000 Trophies · 35 Evo Cards · 10 Heroes · 241 Emotes",
          price: 496.37, orig: 599.00,
          description: `✨ CR Level 86 — FULLY STACKED ACCOUNT ✨\n\n📊 TOP STATS:\n🐉 King Tower: 16\n✨ 121 MAX CARDS (ALL MAXED)\n🌟 Collection Level: 2,232\n🏆 14,000 TROPHIES\n😈 35 Evolution Cards\n🦸 10 Heroes Unlocked\n🎭 241 Emotes\n🏰 38 Tower Skins\n🎯 PEKKA Balloon exclusive deck\n\n✅ Instant delivery\n✅ Full account access\n✅ iOS & Android`,
          images: [
            "https://cdn.gameboost.com/accounts/6257455/gallery/471ce070-1e4d-4364-bca1-8dd316cdf518.jpg",
          ],
          delivery: "Instant",
        },
        {
          title: "KT15 · 8,306 Trophies · 14 Evolutions · Goblin Emote · Musketeer Emote · 9,325 Trophies",
          price: 46.71, orig: 59.00,
          description: `👑 CHEAPEST COMPETITIVE KT15 ACCOUNT\n\n📊 DETAILS:\n❄️ GOBLIN EMOTE ❄️\n🍓 Collection Level: 1,660\n⭐ 86 Level 14 Cards\n🫟 BOWLER EMOTE\n🎄 MUSKETEER EMOTE\n🥶 King Tower: 15 → 16\n🏆 9,325 TROPHIES\n\n✅ Instant Delivery\n✅ Full Email Access\n✅ iOS & Android`,
          images: [
            "https://cdn.gameboost.com/accounts/6249304/gallery/b57b26f2-6e45-45d3-b35b-6840faf15679.jpg",
          ],
          delivery: "Instant",
        },
      ];

      for (let i = 0; i < CR_REAL.length; i++) {
        const l = CR_REAL[i];
        await ctx.db.insert("listings", {
          sellerId, gameId: crId as any, categoryId: categoryId as any,
          title: l.title, slug: mkSlug("cr", i),
          description: l.description, price: l.price, originalPrice: l.orig,
          images: l.images, deliveryTime: l.delivery, deliveryMethod: "manual" as const,
          status: "active" as const, views: rng(300, 10000), badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 30), updatedAt: now - rng(0, 86400000 * 3),
        });
        total++;
        results["clash-royale"] = (results["clash-royale"] || 0) + 1;
      }
    }

    return { status: "real_listings_seeded", total, perGame: results };
  },
});
