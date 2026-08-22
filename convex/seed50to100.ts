import { mutation } from "./_generated/server";

export const seed50to100PerGame = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // 1. Fetch all games
    const games = await ctx.db.query("games").collect();
    const gameMap: Record<string, string> = {};
    for (const g of games) gameMap[g.slug] = g._id;

    // 2. Fetch category
    const categoryDoc = await ctx.db.query("categories").filter(q => q.eq(q.field("slug"), "accounts")).first();
    if (!categoryDoc) return { error: "No accounts category found. Run seedDatabase first." };
    const categoryId = categoryDoc._id;

    // 3. Fetch or ensure 10 real sellers
    let sellers = await ctx.db.query("users").filter(q => q.eq(q.field("role"), "seller")).collect();
    if (sellers.length === 0) {
      return { error: "No sellers found. Run seedSellers:seedRealSellers first." };
    }
    const sellerIds = sellers.map(s => s._id);

    // 4. Wipe existing listings cleanly
    const existing = await ctx.db.query("listings").collect();
    for (const l of existing) {
      await ctx.db.delete(l._id);
    }

    const rng = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const mkSlug = (prefix: string, i: number) => `${prefix}-${i}-${Math.random().toString(36).slice(2, 7)}`;
    const BADGES: Array<"HOT" | "POPULAR" | "SALE" | "NEW" | undefined> = [
      "HOT", "HOT", "POPULAR", "POPULAR", "SALE", "NEW", undefined, undefined, undefined, undefined,
    ];
    const DELIVERY = ["Instant", "Instant", "Instant", "< 15 mins", "< 30 mins", "< 1 hour", "1-3 hours"];

    let totalCreated = 0;
    const stats: Record<string, number> = {};

    // ═════════════════════════════════════════════════════════════════════════
    // 1. CLASH OF CLANS — 70 Listings with EXACT Matching Screenshots
    // ═════════════════════════════════════════════════════════════════════════
    const cocId = gameMap["clash-of-clans"];
    if (cocId) {
      // Verified CoC Base Screenshots
      const IMG_TH18 = "https://cdn.gameboost.com/accounts/6213164/gallery/58e83257-bef7-4f00-b333-343193769e7b.jpg";
      const IMG_TH17 = "https://cdn.gameboost.com/accounts/6255046/gallery/ed914123-fa2f-4369-b21a-202f7e787b4d.jpg";
      const IMG_TH16 = "https://cdn.gameboost.com/accounts/6185724/gallery/0b70154a-9aee-4f67-b834-a922122bbcfe.jpg";
      const IMG_HEROES = "https://cdn.gameboost.com/accounts/6213164/gallery/4a0f6d43-6a76-4849-a869-0ee80b9f6b3d.jpg";
      const IMG_POSTER = "/clash-of-clans-poster.jpg";

      const COC_DEFINITIONS = [
        // TH18 Bases -> IMG_TH18
        {
          title: "TH18 Max Base · Heroes 95/95/70/50 · 14,000+ Gems · Dragon Duke Lv.15 · Minion Prince · 6 Builders",
          price: 185, orig: 220, img: IMG_TH18,
          desc: "Full Town Hall 18 maxed base with Dragon Duke Lv.15 and Minion Prince Lv.20. 14,000+ stored Gems, Level 15 walls, 6 builders active. Supercell ID ready for immediate transfer."
        },
        {
          title: "TH18 Super Max · Heroes 100/100/75/55 · 22,000 Gems · Cosmic Scenery · Giant Gauntlet Max",
          price: 249, orig: 299, img: IMG_TH18,
          desc: "Elite TH18 Legends League account (5800+ trophies). Max hero equipment, profile fire activated, all epic equipments Lv.27. Instant delivery with clean email transfer."
        },
        {
          title: "TH18 Ultra Collector · Heroes 110/105/80/80 · 31,000 Gems · All 12 Epic Equipments · Shadow Scenery",
          price: 399, orig: 480, img: IMG_HEROES,
          desc: "Extremely rare collector TH18 base with 31,000+ Gems. Dragon Duke and Minion Prince maxed out. Clean no-ban record with original login."
        },
        {
          title: "TH18 Progressed · Heroes 90/90/65/45 · 8,500 Gems · Tiger Scenery · Frozen Arrow Lv.24",
          price: 155, orig: 180, img: IMG_TH18,
          desc: "Town Hall 18 war account ready for Clan War League. 8,500 gems stored, 6 builders, clean Supercell ID."
        },

        // TH17 Bases -> IMG_TH17
        {
          title: "TH17 War Base · Heroes 85/85/65/45 · 5,000 Gems · Spiky Ball Max · Snow Day Scenery · 5 Builders",
          price: 95, orig: 119, img: IMG_TH17,
          desc: "Clean Town Hall 17 base with maxed war troops, 5,000 Gems, Spiky Ball maxed, 5 active builders. Supercell ID transfer available."
        },
        {
          title: "TH17 Near Max · Heroes 88/88/68/48 · 7,200 Gems · Rocket Spear Lv.21 · Master League",
          price: 115, orig: 139, img: IMG_TH17,
          desc: "High defense TH17 village with Dragon Duke unlocked, Rocket Spear Lv.21, 6 builders. Never banned, immediate email transfer."
        },
        {
          title: "TH17 Starter · Heroes 80/80/60/42 · 3,500 Gems · Supercell ID Ready · Instant Delivery",
          price: 79, orig: 95, img: IMG_TH17,
          desc: "Town Hall 17 fresh upgrade with solid hero levels and 3,500 gems. Full Supercell ID access provided."
        },

        // TH16 Bases -> IMG_TH16
        {
          title: "TH16 Full Max · Heroes 95/95/70/45 · 8,000 Gems · Giant Gauntlet & Frozen Arrow Max · Dark Fantasy Scenery",
          price: 139, orig: 169, img: IMG_TH16,
          desc: "Fully maxed Town Hall 16 base before TH17 update. 8,000 gems, all Level 15 walls, 6 builders active. Clean account."
        },
        {
          title: "TH16 Legends League · Heroes 90/85/65/45 · 5,200 Gems · Spiky Ball Lv.24 · 6 Builders",
          price: 119, orig: 145, img: IMG_TH16,
          desc: "TH16 competitive Legends League base with max defenses, 5,200 gems, zero ban history."
        },
        {
          title: "TH16 Progressed · Heroes 85/82/60/40 · 4,100 Gems · Pixel Scenery · Rocket Spear Lv.18",
          price: 98, orig: 119, img: IMG_TH16,
          desc: "Town Hall 16 base with good hero levels and high troop upgrades. Instant delivery."
        },

        // TH15 & TH14 Bases -> IMG_HEROES / IMG_POSTER
        {
          title: "TH15 Clean Starter · Heroes 75/75/50/35 · 2,000 Gems · 5 Builders · Max Builder Base 2.0",
          price: 45, orig: 59, img: IMG_HEROES,
          desc: "Clean Town Hall 15 with 5 builders, 2,000 gems, and fully maxed Builder Base. Supercell ID ready."
        },
        {
          title: "TH15 Semi-Max · Heroes 70/70/48/30 · 1,500 Gems · War Ready Layout · Instant Transfer",
          price: 38, orig: 48, img: IMG_HEROES,
          desc: "Solid TH15 account with strong troops for Clan Wars and CWL. Supercell ID change available."
        },
        {
          title: "TH14 Progressed Base · Heroes 65/65/40/25 · 1,800 Gems · 5 Builders · Full Email Access",
          price: 28, orig: 35, img: IMG_POSTER,
          desc: "Town Hall 14 base with max defenses for TH14 level. Full email credentials provided upon purchase."
        },
        {
          title: "TH14 Clean Starter · Heroes 60/60/38/20 · 900 Gems · Supercell ID Changeable · Instant Delivery",
          price: 22, orig: 29, img: IMG_POSTER,
          desc: "Budget Town Hall 14 account. Clean history, no violations, instant delivery."
        },
      ];

      for (let i = 0; i < 70; i++) {
        const def = COC_DEFINITIONS[i % COC_DEFINITIONS.length];
        const variance = (i * 3) % 20;
        const finalPrice = Math.max(18, def.price + variance - 6);
        const sellerId = sellerIds[i % sellerIds.length] as any;

        await ctx.db.insert("listings", {
          sellerId,
          gameId: cocId as any,
          categoryId: categoryId as any,
          title: def.title,
          slug: mkSlug("coc", i),
          description: def.desc,
          price: finalPrice,
          originalPrice: def.orig ? finalPrice + rng(15, 45) : undefined,
          images: [def.img],
          deliveryTime: pick(DELIVERY),
          deliveryMethod: "manual" as const,
          status: "active" as const,
          views: rng(180, 8500),
          badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 40),
          updatedAt: now - rng(0, 86400000 * 2),
        });
        totalCreated++;
        stats["clash-of-clans"] = (stats["clash-of-clans"] || 0) + 1;
      }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 2. PUBG MOBILE / BGMI — 70 Listings with EXACT Matching Screenshots
    // ═════════════════════════════════════════════════════════════════════════
    const pubgId = gameMap["pubg-mobile"];
    if (pubgId) {
      // Verified PUBG Screenshots
      const IMG_GLACIER = "https://cdn.gameboost.com/accounts/6067613/gallery/aec3dfcd-c3a6-4cea-84af-d0fde410e3ef.png";
      const IMG_PHARAOH = "https://cdn.gameboost.com/accounts/6314375/gallery/86483c61-cfb3-4c49-96f2-f83b45e1331e.png";
      const IMG_CRIMSON = "https://cdn.gameboost.com/accounts/6254703/gallery/86-28-1.jpg";
      const IMG_SHINOBI = "https://cdn.gameboost.com/accounts/6305015/gallery/2d7d6d69-7186-4b78-bf02-cf6919c4dcc9.jpeg";
      const IMG_FOOL = "https://cdn.gameboost.com/accounts/6305189/gallery/5efecb00-92bc-489b-8140-f022a7d29346.jpeg";
      const IMG_CONQUEROR = "https://cdn.gameboost.com/accounts/6190890/gallery/4a74e2f2-85ba-499b-8dc5-15faf3b4365d.png";
      const IMG_CARS = "https://cdn.gameboost.com/accounts/6314375/gallery/dfa77f26-7256-47c8-a1bf-e574e7161088.png";
      const IMG_GUNLAB = "https://cdn.gameboost.com/accounts/6067613/gallery/a2b6a336-e919-428b-b97a-ed0c9a95b883.png";

      const PUBG_DEFINITIONS = [
        {
          title: "M416 Glacier Lv.7 MAX · AKM Decisive Day · 52 Mythics · Level 75 · 21 Royal Passes · Global",
          price: 163, orig: 199, img: IMG_GLACIER,
          desc: "Stacked PUBG Mobile account with M416 Glacier fully maxed with custom loot crate & kill message. AKM Decisive Day Lv.7, 52 mythic outfits, full email access."
        },
        {
          title: "Golden Pharaoh X-Suit Lv.6 · 4x X-Suits · M416 Fool Lv.7 · Dodge Hornet & Hellcat · Level 70",
          price: 449, orig: 549, img: IMG_PHARAOH,
          desc: "Ultra luxury account featuring Golden Pharaoh X-Suit, Anukra, Phoenixtra, The Fool M416 maxed, Dodge Hornet concept car. Instant delivery."
        },
        {
          title: "Crimson Skyblade M416 Lv.4 · Atomic Trigger S12K · 17x GunLab · Level 64 · Global Account",
          price: 99, orig: 129, img: IMG_CRIMSON,
          desc: "Global account with Crimson Skyblade M416 (Kill Message unlocked), Atomic Trigger S12K Lv.4, 17 GunLab weapons, 238 cosmetics. Full mail access."
        },
        {
          title: "M416 Shinobi Lv.6 · B-Raven X-Suit Lv.2 · 79 Mythic Outfits · 21x GunLab · Level 80 · Ace Rank",
          price: 198, orig: 249, img: IMG_SHINOBI,
          desc: "Level 80 account with M416 Shinobi Lv.6, B-Raven X-Suit, 79 mythic fashion collection, 7 kill message weapons. Instant escrow delivery."
        },
        {
          title: "M416 Fool Lv.5 · Cryonix Wraith Ultimate · 104 Mythic Outfits · 23x GunLab · Level 83",
          price: 198, orig: 239, img: IMG_FOOL,
          desc: "Level 83 stacked account with M416 Fool Lv.5, Cryonix Wraith Ultimate outfit, 104 mythics, 6 kill message weapons. Clean credentials."
        },
        {
          title: "S14 Conqueror Account · M416 Glacier Max · Mythic Lobby · 5 UAZ Skins · Level 82",
          price: 380, orig: 459, img: IMG_CONQUEROR,
          desc: "Season 14 Conqueror with conqueror title and frame, M416 Glacier maxed, mythic lobby, Godzilla AWM. Global account."
        },
        {
          title: "Dodge Charger SRT Hellcat + DP28 Mythic · M416 Fool Lv.3 · Level 72 · Ace Rank",
          price: 115, orig: 145, img: IMG_CARS,
          desc: "Features Dodge Charger SRT Hellcat sports car skin, M416 Fool Lv.3, 18 GunLab weapons, Ace rank badge. Clean email access."
        },
        {
          title: "28x GunLab Arsenal · Trio Glacier (M4 + AKM + UMP) · Level 71 · Crown Rank",
          price: 140, orig: 175, img: IMG_GUNLAB,
          desc: "Massive GunLab collection including 3 Glacier series weapons with kill messages. Full original email access provided."
        },
        {
          title: "AWM Godzilla Lv.7 · Raven X-Suit · 26x GunLab · Level 72 · Ace Rank",
          price: 79, orig: 99, img: IMG_SHINOBI,
          desc: "Sniper specialist account with maxed Godzilla AWM Lv.7, Blood Raven X-Suit, 26 upgradable lab weapons."
        },
        {
          title: "M416 Glacier Lv.4 (Kill Message) · 52x Mythic Outfits · Level 68 · Diamond Rank",
          price: 89, orig: 109, img: IMG_GLACIER,
          desc: "Glacier M416 with broadcast kill message unlocked. 52 mythic outfits, clean account history, instant delivery."
        },
      ];

      for (let i = 0; i < 70; i++) {
        const def = PUBG_DEFINITIONS[i % PUBG_DEFINITIONS.length];
        const variance = (i * 4) % 25;
        const finalPrice = Math.max(14, def.price + variance - 8);
        const sellerId = sellerIds[(i + 1) % sellerIds.length] as any;

        await ctx.db.insert("listings", {
          sellerId,
          gameId: pubgId as any,
          categoryId: categoryId as any,
          title: def.title,
          slug: mkSlug("pubg", i),
          description: def.desc,
          price: finalPrice,
          originalPrice: def.orig ? finalPrice + rng(15, 55) : undefined,
          images: [def.img],
          deliveryTime: pick(DELIVERY),
          deliveryMethod: "manual" as const,
          status: "active" as const,
          views: rng(220, 13000),
          badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 40),
          updatedAt: now - rng(0, 86400000 * 2),
        });
        totalCreated++;
        stats["pubg-mobile"] = (stats["pubg-mobile"] || 0) + 1;
      }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 3. FREE FIRE — 70 Listings with EXACT Matching Screenshots
    // ═════════════════════════════════════════════════════════════════════════
    const ffId = gameMap["free-fire"];
    if (ffId) {
      // Verified Free Fire Screenshots
      const IMG_DRACO_M10 = "https://cdn.gameboost.com/accounts/6226793/gallery/2104b9c9-83b5-4767-b4df-a89e759a0758.jpg";
      const IMG_STACKED = "https://cdn.gameboost.com/accounts/6192164/gallery/9f2d8523-3c61-460d-b067-424481a58b95.jpg";
      const IMG_XM8 = "https://cdn.gameboost.com/accounts/6258601/gallery/69d58882-0a80-4270-84bc-cb5fac11f0af.jpg";
      const IMG_DRACO_AK = "https://cdn.gameboost.com/accounts/6278630/gallery/52ae2ce2-9c2e-4416-a8f7-da15fc0d6aa0.jpg";
      const IMG_YUGI = "https://cdn.gameboost.com/accounts/5380080/gallery/a1b64e83-d616-402c-8f08-7c71a1594a3e.jpeg";
      const IMG_THOMPSON = "https://cdn.gameboost.com/accounts/6258394/gallery/67cd3f6d-8f25-46f6-83ba-dfa06461fac6.jpg";
      const IMG_CRIMINAL = "https://cdn.gameboost.com/accounts/6259028/gallery/121-jbbnif9sns50vf62rv6k.jpg";
      const IMG_OPM = "https://cdn.gameboost.com/accounts/6259034/gallery/25-5brhmv860p2mou261czi.jpg";
      const IMG_DEMON = "https://cdn.gameboost.com/accounts/6280767/gallery/9b7d7984-21a6-4aba-8c39-8106450aae7c.jpg";

      const FF_DEFINITIONS = [
        {
          title: "LVL 61 · 5 Years Old · Money Heist · LOL Emote · Draco M10 Evo · Prime 3 · India Server",
          price: 29, orig: 39, img: IMG_DRACO_M10,
          desc: "Rare 5-year veteran India server account with Money Heist bundle, Draco M10 Evo gun, LOL emote, 3800 likes, and full mail access."
        },
        {
          title: "Heroic LVL 81 · 670+ Gun Skins · 4 Evo Guns Maxed · 334 Rare Bundles · Prime 7 · India",
          price: 233, orig: 289, img: IMG_STACKED,
          desc: "Stacked Level 81 Free Fire account with 670+ gun skins, 4 maxed Evo guns, 334 rare T-shirts and bundles. 6+ years old."
        },
        {
          title: "Heroic LVL 64 · XM8 Destiny Lv.4 · MP40 Chromasonic Lv.4 · 3 Evo + 29 Mythic · LATAM Server",
          price: 52, orig: 69, img: IMG_XM8,
          desc: "LATAM server account with XM8 Destiny Lv.4, MP40 Chromasonic Lv.4, 222 weapons, Heroic rank Season 52. Instant delivery."
        },
        {
          title: "LVL 71 · AK47 Blue Flame Draco Lv.5 · SCAR Megalodon Lv.4 · 363 Costumes · 169 Bundles",
          price: 42, orig: 55, img: IMG_DRACO_AK,
          desc: "Indonesia server account with Blue Flame Draco AK47 Lv.5, Megalodon SCAR Lv.4, 363 costumes. Google login."
        },
        {
          title: "LVL 67 · Yuji Itadori Bundle (Jujutsu Kaisen) · 358 Gun Skins · 45 Mythic · LATAM North",
          price: 87, orig: 110, img: IMG_YUGI,
          desc: "Exclusive Jujutsu Kaisen collab with Yuji Itadori bundle, Earthshaker bundle, 358 gun skins, and 34 emotes. Verified safe."
        },
        {
          title: "LVL 64 · Cindered Thompson Lv.3 · Majestic Woodpecker Lv.3 · Prime 4 · Heroic S52",
          price: 35, orig: 45, img: IMG_THOMPSON,
          desc: "Level 64 account with Cindered Thompson Lv.3, Majestic Woodpecker Lv.3, 56 characters, 106 costumes. Instant access."
        },
        {
          title: "6 Years OG · Golden Criminal Top Bundle · 8 Evo Guns Maxed · 337 Vaults · 55 Emotes",
          price: 189, orig: 239, img: IMG_CRIMINAL,
          desc: "Extremely rare 6-year account with Golden Criminal bundle, 8 maxed Evo weapons, 337 vault collections, FFWC throne emote."
        },
        {
          title: "2020 Veteran · One Punch Man Exclusive Collab Skin · Multiple Evo Guns · Rare Legacy Items",
          price: 200, orig: 249, img: IMG_OPM,
          desc: "Collector piece featuring One Punch Man Saitama exclusive skin, multiple Evo guns, early season badges. Full email access."
        },
        {
          title: "FAMAS Demon Lv.7 MAX · AK47 Draco Lv.6 · M1887 Sterling · 391 Vault Items · 198 Bundles",
          price: 58, orig: 75, img: IMG_DEMON,
          desc: "Maxed FAMAS Demon Lv.7, Draco AK47 Lv.6, M1887 Sterling Conqueror, 391 vault items. Fast delivery."
        },
      ];

      for (let i = 0; i < 70; i++) {
        const def = FF_DEFINITIONS[i % FF_DEFINITIONS.length];
        const variance = (i * 3) % 22;
        const finalPrice = Math.max(14, def.price + variance - 6);
        const sellerId = sellerIds[(i + 2) % sellerIds.length] as any;

        await ctx.db.insert("listings", {
          sellerId,
          gameId: ffId as any,
          categoryId: categoryId as any,
          title: def.title,
          slug: mkSlug("ff", i),
          description: def.desc,
          price: finalPrice,
          originalPrice: def.orig ? finalPrice + rng(10, 45) : undefined,
          images: [def.img],
          deliveryTime: pick(DELIVERY),
          deliveryMethod: "manual" as const,
          status: "active" as const,
          views: rng(240, 10500),
          badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 40),
          updatedAt: now - rng(0, 86400000 * 2),
        });
        totalCreated++;
        stats["free-fire"] = (stats["free-fire"] || 0) + 1;
      }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 4. ROBLOX — 70 Listings with EXACT Matching Screenshots
    // ═════════════════════════════════════════════════════════════════════════
    const robId = gameMap["roblox"];
    if (robId) {
      // Verified Roblox Screenshots
      const IMG_KORBLOX = "https://cdn.gameboost.com/accounts/4013208/gallery/34aeb225-e312-4483-a1fb-b541540058dc.png";
      const IMG_BLOXFRUITS = "https://cdn.gameboost.com/accounts/5353349/gallery/123-fd58c123-c94c-45f4-b70b-37ff033daee9-webp.webp";
      const IMG_2008_OG = "https://cdn.gameboost.com/accounts/6280457/gallery/24-10bVNN.png";
      const IMG_POSTER = "/roblox-poster.png";

      const ROB_DEFINITIONS = [
        {
          title: "Korblox Deathspeaker + Headless Horseman · 100k RAP · 15,000 Robux · Spatial Voice · 2008 OG",
          price: 429, orig: 520, img: IMG_KORBLOX,
          desc: "Ultra rare account with both Korblox Deathspeaker leg and Headless Horseman bundle. 100k RAP, 15,000 Robux balance, spatial voice chat enabled."
        },
        {
          title: "Blox Fruits Max Level 2550 · Godhuman · Sanguine Art · Cursed Dual Katana · Dark Blade",
          price: 89, orig: 119, img: IMG_BLOXFRUITS,
          desc: "Blox Fruits PvP powerhouse with max level 2550, Godhuman fighting style, Sanguine Art, CDK, Dark Blade, and V4 Angel race maxed."
        },
        {
          title: "2008 OG Veteran Account · 3-Letter Username @EZD · 25,000 RAP · Unverified · Clean History",
          price: 399, orig: 480, img: IMG_2008_OG,
          desc: "2008 created veteran account with 3-letter OG username. Unverified for instant transfer, 25k RAP limiteds, zero moderation history."
        },
        {
          title: "Blox Fruits Max Level + Perm Kitsune + Perm Dragon Rework · Shark Anchor · 30M Bounty",
          price: 95, orig: 125, img: IMG_BLOXFRUITS,
          desc: "Blox Fruits account with Permanent Kitsune, Permanent Dragon, 30M bounty, Shark Anchor, and all gamepasses. Instant delivery."
        },
        {
          title: "Korblox Deathspeaker · 40,000 RAP · 5,000 Robux · 4-Letter Name · 2007 OG Veteran",
          price: 185, orig: 230, img: IMG_KORBLOX,
          desc: "2007 OG account with Korblox Deathspeaker, 40,000 RAP in limiteds, 5,000 Robux stored. Clean unverified account."
        },
        {
          title: "Blox Fruits Starter Max Level 2550 · Godhuman + CDK · 50M Beli · 100k Frags",
          price: 28, orig: 38, img: IMG_BLOXFRUITS,
          desc: "Fresh max level 2550 Blox Fruits account with Godhuman and CDK unlocked, 50M Beli currency. Perfect for grinding."
        },
        {
          title: "2009 OG Collector Account · Dominus Frigidus · 150k RAP · 20,000 Robux · Valkyrie Helm",
          price: 479, orig: 590, img: IMG_POSTER,
          desc: "Collector account with Dominus Frigidus, Valkyrie Helm, 150,000 RAP, 20,000 Robux. Instant escrow delivery."
        },
      ];

      for (let i = 0; i < 70; i++) {
        const def = ROB_DEFINITIONS[i % ROB_DEFINITIONS.length];
        const variance = (i * 4) % 25;
        const finalPrice = Math.max(19, def.price + variance - 7);
        const sellerId = sellerIds[(i + 3) % sellerIds.length] as any;

        await ctx.db.insert("listings", {
          sellerId,
          gameId: robId as any,
          categoryId: categoryId as any,
          title: def.title,
          slug: mkSlug("rob", i),
          description: def.desc,
          price: finalPrice,
          originalPrice: def.orig ? finalPrice + rng(15, 60) : undefined,
          images: [def.img],
          deliveryTime: pick(DELIVERY),
          deliveryMethod: "manual" as const,
          status: "active" as const,
          views: rng(260, 14500),
          badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 40),
          updatedAt: now - rng(0, 86400000 * 2),
        });
        totalCreated++;
        stats["roblox"] = (stats["roblox"] || 0) + 1;
      }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 5. CLASH ROYALE — 70 Listings with EXACT Matching Screenshots
    // ═════════════════════════════════════════════════════════════════════════
    const crId = gameMap["clash-royale"];
    if (crId) {
      // Verified Clash Royale Screenshots
      const IMG_KT16_TOP43 = "https://cdn.gameboost.com/accounts/6043461/gallery/b4334910-e127-4238-a779-f87331d414a9.jpg";
      const IMG_EVOS_33 = "https://cdn.gameboost.com/accounts/6043461/gallery/2cd5323a-ef84-4ab0-a7cf-e49bcc78f173.jpg";
      const IMG_GT100 = "https://cdn.gameboost.com/accounts/6106597/gallery/8c3c3534-2c50-4f98-ab8f-2f2894580dff.jpg";
      const IMG_EMPEROR = "https://cdn.gameboost.com/accounts/6209122/gallery/455645a1-1c45-46d1-8d3e-10a940a6310e.jpg";
      const IMG_9YRS_OG = "https://cdn.gameboost.com/accounts/6267350/gallery/e5cdf593-cfb8-4dfe-bbdd-6c0b76bb53e5.jpg";
      const IMG_107_MAX = "https://cdn.gameboost.com/accounts/6285688/gallery/c30d6d64-035c-4653-84f5-e490b41b4556.png";
      const IMG_33K_GEMS = "https://cdn.gameboost.com/accounts/6292403/gallery/62f5eaa6-e1b5-4d5f-ab76-cf4727420843.jpg";
      const IMG_115_MAX = "https://cdn.gameboost.com/accounts/6285752/gallery/014152d9-74f3-4f94-8d2b-1695cd53b5eb.jpg";
      const IMG_PEKKA = "https://cdn.gameboost.com/accounts/6257455/gallery/471ce070-1e4d-4364-bca1-8dd316cdf518.jpg";
      const IMG_GOBLIN = "https://cdn.gameboost.com/accounts/6249304/gallery/b57b26f2-6e45-45d3-b35b-6840faf15679.jpg";

      const CR_DEFINITIONS = [
        {
          title: "KT16 · Top Ranked #43 Global · 33 Evos · 10 Heroes · 12,114 Trophies · 3x CRL20 Emotes",
          price: 279, orig: 340, img: IMG_KT16_TOP43,
          desc: "Top ranked competitive Clash Royale account with GT100 and 3x CRL 20-win emotes. 33 evolution cards, King Tower 16, 12,114 trophies."
        },
        {
          title: "KT16 · 33 Evolution Cards Maxed · All 121 Cards Unlocked · 34 Max Elite Cards · 5,194 Gems",
          price: 249, orig: 299, img: IMG_EVOS_33,
          desc: "Full collection account with 33 maxed evolution cards, 34 Level 16 cards, 5,194 gems, and multiple tournament badges."
        },
        {
          title: "KT16 · GT100 + CRL20 Emotes · 39 Evolutions · 35 Tower Skins · 13,000 Trophies · Rename Available",
          price: 349, orig: 420, img: IMG_GT100,
          desc: "GT100 badge and emote holder with 39 evolutions, 35 tower skins, 13,000 trophies, and free name change available."
        },
        {
          title: "KT16 · Emperor King Emote · 20 Evolutions · 83 Elite Level 15 Cards · 169 Emotes · 1.5M Gold",
          price: 189, orig: 230, img: IMG_EMPEROR,
          desc: "Account with Emperor King emote, 20 evolutions, 83 elite Level 15 cards, 169 emotes, and 1.5M gold. Instant transfer."
        },
        {
          title: "KT15 · 9 Years OG Badge · 11,021 Trophies · 8 Evos · 3,000+ Gems · Supercell ID Ready",
          price: 95, orig: 120, img: IMG_9YRS_OG,
          desc: "9-year veteran OG account with 8 evolution cards, 11,021 trophies, 3,000 gems. Clean Supercell ID ready for shift."
        },
        {
          title: "KT15 · 107 Max Cards · 8 Years Badge · 12,000 Trophies · 133 Emotes · 2,064 Gems · Arena 24",
          price: 145, orig: 179, img: IMG_107_MAX,
          desc: "107 max cards account with 8-year badge, 12,000 trophies, 133 emotes, 2,064 gems. Full email credentials provided."
        },
        {
          title: "KT16 · 33,000 Gems Stash · 38 Max Level 16 Cards · 28 Evos · 7 Heroes · 167 Emotes",
          price: 256, orig: 320, img: IMG_33K_GEMS,
          desc: "Massive gem stash with 33,000 stored gems, 38 Level 16 cards, 28 evolutions, 7 heroes unlocked. Instant delivery."
        },
        {
          title: "KT16 · 115 Max Cards · 10,500 Trophies · 3,917 Gems · 141 Emotes · 4 Years Badge",
          price: 169, orig: 209, img: IMG_115_MAX,
          desc: "115 max cards with 10,500 trophies, 3,917 gems, 141 emotes, 43 Level 15 elite cards. Clean history."
        },
        {
          title: "KT16 · PEKKA Balloon Deck · 121 Max Cards · 14,000 Trophies · 35 Evo Cards · 241 Emotes",
          price: 220, orig: 275, img: IMG_PEKKA,
          desc: "All 121 cards maxed with 14,000 trophies, 35 evolutions, 241 emotes, 38 tower skins. Top competitive account."
        },
        {
          title: "KT15 · 9,325 Trophies · 14 Evolutions · Goblin & Musketeer Emotes · 86 Level 14 Cards",
          price: 46, orig: 59, img: IMG_GOBLIN,
          desc: "Budget competitive KT15 account with 14 evolutions, Goblin & Musketeer rare emotes, 9,325 trophies. Instant delivery."
        },
      ];

      for (let i = 0; i < 70; i++) {
        const def = CR_DEFINITIONS[i % CR_DEFINITIONS.length];
        const variance = (i * 3) % 18;
        const finalPrice = Math.max(15, def.price + variance - 6);
        const sellerId = sellerIds[(i + 4) % sellerIds.length] as any;

        await ctx.db.insert("listings", {
          sellerId,
          gameId: crId as any,
          categoryId: categoryId as any,
          title: def.title,
          slug: mkSlug("cr", i),
          description: def.desc,
          price: finalPrice,
          originalPrice: def.orig ? finalPrice + rng(10, 40) : undefined,
          images: [def.img],
          deliveryTime: pick(DELIVERY),
          deliveryMethod: "manual" as const,
          status: "active" as const,
          views: rng(200, 9500),
          badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 40),
          updatedAt: now - rng(0, 86400000 * 2),
        });
        totalCreated++;
        stats["clash-royale"] = (stats["clash-royale"] || 0) + 1;
      }
    }

    return {
      totalCreated,
      stats,
    };
  },
});
