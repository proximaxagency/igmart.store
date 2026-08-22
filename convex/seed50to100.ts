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
    // 1. CLASH OF CLANS — 70 Listings (TH14 - TH18, Dragon Duke, Minion Prince)
    // ═════════════════════════════════════════════════════════════════════════
    const cocId = gameMap["clash-of-clans"];
    if (cocId) {
      const COC_IMGS = [
        "https://cdn.gameboost.com/accounts/6213164/gallery/58e83257-bef7-4f00-b333-343193769e7b.jpg",
        "https://cdn.gameboost.com/accounts/6255046/gallery/ed914123-fa2f-4369-b21a-202f7e787b4d.jpg",
        "https://cdn.gameboost.com/accounts/6185724/gallery/0b70154a-9aee-4f67-b834-a922122bbcfe.jpg",
        "https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6213164/gallery/58e83257-bef7-4f00-b333-343193769e7b.jpg",
        "https://cdn.gameboost.com/cdn-cgi/image/fit=cover,format=auto,height=400,width=900/https://cdn.gameboost.com/accounts/6255046/gallery/ed914123-fa2f-4369-b21a-202f7e787b4d.jpg",
      ];

      const COC_TEMPLATES = [
        { th: 18, heroes: "95/95/70/50", duke: "Dragon Duke Lv.15", prince: "Minion Prince Lv.20", gems: 14000, price: 185, orig: 220, feat: "Max Walls · 6 Builders · Cosmic Scenery · Fireball Lv.27" },
        { th: 18, heroes: "100/100/75/55", duke: "Dragon Duke Lv.20", prince: "Minion Prince Lv.25", gems: 22000, price: 249, orig: 299, feat: "SUPER MAX · Legends League 5800+ · Giant Gauntlet Max · Profile Fire" },
        { th: 18, heroes: "110/105/80/80", duke: "Dragon Duke Lv.25 (MAX)", prince: "Minion Prince Lv.30 (MAX)", gems: 31000, price: 399, orig: 480, feat: "Ultra Collector · 31,000 Gems · All Epic Equipment Max · 6 Builders" },
        { th: 18, heroes: "90/90/65/45", duke: "Dragon Duke Unlocked", prince: "Minion Prince Lv.10", gems: 8500, price: 155, orig: 180, feat: "Semi-Max TH18 · Champion Scenery · Frozen Arrow Lv.24 · 6 Builders" },
        { th: 17, heroes: "85/85/65/45", duke: "Dragon Duke Unlocked", prince: "Minion Prince Lv.15", gems: 5000, price: 95, orig: 119, feat: "TH17 War Ready · Spiky Ball Max · 5 Builders · Free Name Change" },
        { th: 17, heroes: "88/88/68/48", duke: "Dragon Duke Lv.10", prince: "Minion Prince Lv.18", gems: 7200, price: 115, orig: 139, feat: "Near Max TH17 · Rocket Spear Lv.21 · Master I League · 6 Builders" },
        { th: 17, heroes: "80/80/60/42", duke: "Dragon Duke Unlocked", prince: "Minion Prince Lv.8", gems: 3500, price: 79, orig: 95, feat: "Clean TH17 · Supercell ID Ready · Tiger Scenery · Instant Delivery" },
        { th: 16, heroes: "95/95/70/45", duke: "Hero Hall Lv.3", prince: "Minion Prince Unlocked", gems: 8000, price: 140, orig: 170, feat: "TH16 Full Max · All Heroes 95 · Giant Gauntlet & Frozen Arrow Max" },
        { th: 16, heroes: "90/85/65/45", duke: "Hero Hall Lv.2", prince: "Minion Prince Unlocked", gems: 5200, price: 120, orig: 149, feat: "Legends League Base · 6 Builders · Clean History · No Bans" },
        { th: 16, heroes: "85/82/60/40", duke: "Hero Hall Lv.1", prince: "Minion Prince Unlocked", gems: 4100, price: 98, orig: 119, feat: "TH16 Progressed · Level 15 Walls · Super Troops Unlocked" },
        { th: 15, heroes: "75/75/50/35", duke: "Hero Hall Lv.1", prince: "Minion Prince Unlocked", gems: 2000, price: 45, orig: 59, feat: "Clean TH15 · 5 Builders · Max Builder Base · Supercell ID Transfer" },
        { th: 15, heroes: "70/70/48/30", duke: "Hero Hall Lv.1", prince: "Minion Prince Unlocked", gems: 1500, price: 38, orig: 48, feat: "TH15 Semi-Max · Good War Troops · Champion League" },
        { th: 14, heroes: "65/65/40/25", duke: "Hero Hall Available", prince: "Minion Prince Lv.5", gems: 1800, price: 28, orig: 35, feat: "Solid TH14 Starter · 5 Builders · Fast Transfer · Full Email Access" },
        { th: 14, heroes: "60/60/38/20", duke: "Hero Hall Available", prince: "Minion Prince Lv.3", gems: 900, price: 22, orig: 29, feat: "Cheap TH14 · Clean Account · Supercell ID Changeable" },
      ];

      for (let i = 0; i < 70; i++) {
        const t = COC_TEMPLATES[i % COC_TEMPLATES.length];
        const variance = (i * 3) % 25;
        const finalPrice = Math.max(18, t.price + variance - 10);
        const sellerId = sellerIds[i % sellerIds.length] as any;
        const gemsCount = (t.gems + (i * 370) % 5000).toLocaleString();

        const title = `TH${t.th} · Heroes ${t.heroes} · ${t.duke} · ${t.prince} · ${gemsCount} Gems · ${t.feat.split(" · ")[0]}`;
        const desc = `🔥 CLASH OF CLANS PREMIUM ACCOUNT — TH${t.th} 🔥\n\n` +
          `👑 HERO LEVELS:\n` +
          `• Barbarian King & Archer Queen: Top Tier\n` +
          `• Grand Warden & Royal Champion: High Level\n` +
          `• Flying Hero: ${t.duke}\n` +
          `• Dark Elixir Hero: ${t.prince}\n\n` +
          `💎 Gems: ${gemsCount}\n` +
          `🏗️ Highlights: ${t.feat}\n` +
          `🛡️ Security: Clean Supercell ID with full original email transfer\n\n` +
          `✅ 100% Verified Account\n` +
          `✅ Instant Delivery via automated / escrow transfer\n` +
          `✅ 24/7 After-Sale Support`;

        await ctx.db.insert("listings", {
          sellerId,
          gameId: cocId as any,
          categoryId: categoryId as any,
          title,
          slug: mkSlug("coc", i),
          description: desc,
          price: finalPrice,
          originalPrice: t.orig ? finalPrice + rng(15, 45) : undefined,
          images: [COC_IMGS[i % COC_IMGS.length], COC_IMGS[(i + 1) % COC_IMGS.length]],
          deliveryTime: pick(DELIVERY),
          deliveryMethod: "manual" as const,
          status: "active" as const,
          views: rng(150, 9500),
          badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 45),
          updatedAt: now - rng(0, 86400000 * 3),
        });
        totalCreated++;
        stats["clash-of-clans"] = (stats["clash-of-clans"] || 0) + 1;
      }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 2. PUBG MOBILE / BGMI — 70 Listings (Glacier M416, X-Suits, Conqueror)
    // ═════════════════════════════════════════════════════════════════════════
    const pubgId = gameMap["pubg-mobile"];
    if (pubgId) {
      const PUBG_IMGS = [
        "https://cdn.gameboost.com/accounts/6067613/gallery/aec3dfcd-c3a6-4cea-84af-d0fde410e3ef.png",
        "https://cdn.gameboost.com/accounts/6190890/gallery/4a74e2f2-85ba-499b-8dc5-15faf3b4365d.png",
        "https://cdn.gameboost.com/accounts/6314375/gallery/86483c61-cfb3-4c49-96f2-f83b45e1331e.png",
        "https://cdn.gameboost.com/accounts/6305015/gallery/2d7d6d69-7186-4b78-bf02-cf6919c4dcc9.jpeg",
        "https://cdn.gameboost.com/accounts/6305189/gallery/5efecb00-92bc-489b-8140-f022a7d29346.jpeg",
        "https://cdn.gameboost.com/accounts/6254703/gallery/86-28-1.jpg",
      ];

      const PUBG_TEMPLATES = [
        { gun: "M416 Glacier Lv.7 (MAX)", xsuit: "Golden Pharaoh X-Suit Lv.6", lvl: 82, gunlab: 48, rank: "Conqueror S14", price: 389, orig: 460 },
        { gun: "M416 Fool Lv.7 (MAX)", xsuit: "4x X-Suits (Pharaoh, Anukra, Phoenixtra)", lvl: 70, gunlab: 45, rank: "Ace Dominator", price: 449, orig: 549 },
        { gun: "M416 Glacier + AKM Decisive Day", xsuit: "Blood Raven X-Suit", lvl: 75, gunlab: 28, rank: "Ace Master", price: 163, orig: 199 },
        { gun: "M416 Shinobi Lv.6", xsuit: "B-Raven X-Suit Lv.2", lvl: 80, gunlab: 21, rank: "Ace Rank", price: 198, orig: 249 },
        { gun: "M416 Fool Lv.5", xsuit: "Cryonix Wraith Ultimate", lvl: 83, gunlab: 23, rank: "Crown Rank", price: 198, orig: 239 },
        { gun: "Crimson Skyblade M416 Lv.4", xsuit: "Atomic Trigger S12K", lvl: 64, gunlab: 17, rank: "Crown Rank", price: 99, orig: 129 },
        { gun: "AWM Godzilla Lv.7", xsuit: "Raven X-Suit", lvl: 72, gunlab: 26, rank: "Ace Rank", price: 79, orig: 99 },
        { gun: "M416 Glacier Lv.4", xsuit: "50+ Mythic Outfits", lvl: 68, gunlab: 14, rank: "Diamond Rank", price: 89, orig: 109 },
        { gun: "Trio Glacier Combo", xsuit: "3 Glacier Skins", lvl: 71, gunlab: 18, rank: "Crown Rank", price: 140, orig: 175 },
        { gun: "Codebreaker AKM Lv.4", xsuit: "35x Mythic Fashion", lvl: 65, gunlab: 12, rank: "Crown Rank", price: 45, orig: 59 },
        { gun: "DP28 Mythic + M416 Fool Lv.3", xsuit: "Dodge Charger SRT Hellcat", lvl: 72, gunlab: 18, rank: "Ace Rank", price: 115, orig: 145 },
        { gun: "Phoenixtra X-Suit Lv.4", xsuit: "25x GunLab Upgradables", lvl: 77, gunlab: 25, rank: "Ace Dominator", price: 220, orig: 275 },
        { gun: "AKM Golden Age + S12K Atomic", xsuit: "15 GunLab Upgradables", lvl: 60, gunlab: 15, rank: "Diamond Rank", price: 45, orig: 59 },
        { gun: "Gold Rank Starter Account", xsuit: "Clean Account · Full Email", lvl: 42, gunlab: 4, rank: "Gold Rank", price: 14, orig: 19 },
      ];

      for (let i = 0; i < 70; i++) {
        const t = PUBG_TEMPLATES[i % PUBG_TEMPLATES.length];
        const variance = (i * 5) % 30;
        const finalPrice = Math.max(12, t.price + variance - 12);
        const sellerId = sellerIds[(i + 2) % sellerIds.length] as any;
        const mythics = 35 + (i * 7) % 85;

        const title = `${t.gun} · ${t.xsuit} · ${mythics} Mythic Outfits · ${t.gunlab}x GunLab · Lv.${t.lvl} · ${t.rank}`;
        const desc = `🔥 PUBG MOBILE / BGMI GLOBAL ACCOUNT — LEVEL ${t.lvl} 🔥\n\n` +
          `👑 WEAPON LAB HIGHLIGHTS:\n` +
          `• Primary: ${t.gun}\n` +
          `• Total GunLab Upgradable Weapons: ${t.gunlab}\n` +
          `• Kill Message & Loot Crate animations active\n\n` +
          `🧬 SUITS & COSMETICS:\n` +
          `• Featured: ${t.xsuit}\n` +
          `• Total Mythic Items: ${mythics}+\n` +
          `• Vehicles: Rare Sports Cars & UAZ Skins included\n` +
          `• Rank: ${t.rank}\n\n` +
          `✅ Full Email Access & Changeable Password\n` +
          `✅ 100% Safe Account — Clean History\n` +
          `✅ Instant Automated Escrow Delivery`;

        await ctx.db.insert("listings", {
          sellerId,
          gameId: pubgId as any,
          categoryId: categoryId as any,
          title,
          slug: mkSlug("pubg", i),
          description: desc,
          price: finalPrice,
          originalPrice: t.orig ? finalPrice + rng(15, 60) : undefined,
          images: [PUBG_IMGS[i % PUBG_IMGS.length], PUBG_IMGS[(i + 2) % PUBG_IMGS.length]],
          deliveryTime: pick(DELIVERY),
          deliveryMethod: "manual" as const,
          status: "active" as const,
          views: rng(250, 14000),
          badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 45),
          updatedAt: now - rng(0, 86400000 * 3),
        });
        totalCreated++;
        stats["pubg-mobile"] = (stats["pubg-mobile"] || 0) + 1;
      }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 3. FREE FIRE — 70 Listings (Sakura S1, Draco AK47, Golden Criminal, Evos)
    // ═════════════════════════════════════════════════════════════════════════
    const ffId = gameMap["free-fire"];
    if (ffId) {
      const FF_IMGS = [
        "https://cdn.gameboost.com/accounts/6226793/gallery/2104b9c9-83b5-4767-b4df-a89e759a0758.jpg",
        "https://cdn.gameboost.com/accounts/6192164/gallery/9f2d8523-3c61-460d-b067-424481a58b95.jpg",
        "https://cdn.gameboost.com/accounts/6258601/gallery/69d58882-0a80-4270-84bc-cb5fac11f0af.jpg",
        "https://cdn.gameboost.com/accounts/6278630/gallery/52ae2ce2-9c2e-4416-a8f7-da15fc0d6aa0.jpg",
        "https://cdn.gameboost.com/accounts/5380080/gallery/a1b64e83-d616-402c-8f08-7c71a1594a3e.jpeg",
        "https://cdn.gameboost.com/accounts/6258394/gallery/67cd3f6d-8f25-46f6-83ba-dfa06461fac6.jpg",
        "https://cdn.gameboost.com/accounts/6259028/gallery/121-jbbnif9sns50vf62rv6k.jpg",
        "https://cdn.gameboost.com/accounts/6259034/gallery/25-5brhmv860p2mou261czi.jpg",
      ];

      const FF_TEMPLATES = [
        { bundle: "Sakura Season 1 VIP + Hip Hop", evos: "7 Evo Guns Maxed (Draco, Cobra, Megalodon)", lvl: 82, price: 289, orig: 350, server: "India Server" },
        { bundle: "Golden Criminal Top Bundle", evos: "8 Evo Guns Maxed · 337 Vaults", lvl: 78, price: 189, orig: 239, server: "Global / India" },
        { bundle: "Money Heist + LOL Emote", evos: "Draco M10 + 2 Evo + 15 Mythic", lvl: 61, price: 29, orig: 39, server: "India Server" },
        { bundle: "Heroic Stacked 670+ Gun Skins", evos: "4 Evo Guns Maxed · 334 Rare Bundles", lvl: 81, price: 233, orig: 289, server: "India Server" },
        { bundle: "One Punch Man Exclusive Skin", evos: "Multiple Evolutions · 2020 Veteran", lvl: 75, price: 200, orig: 249, server: "Global Server" },
        { bundle: "Yuji Itadori Bundle (Jujutsu Kaisen)", evos: "358 Gun Skins · 45 Mythic Guns", lvl: 67, price: 87, orig: 110, server: "LATAM / Global" },
        { bundle: "AK47 Blue Flame Draco Lv.5 + SCAR Megalodon", evos: "2 Evo · 363 Costumes · 169 Bundles", lvl: 71, price: 42, orig: 55, server: "Indonesia" },
        { bundle: "MP40 Cobra Lv.4 + 50 Mythic Weapons", evos: "2 Evo · 131 Bundles · 70 Vehicles", lvl: 67, price: 71, orig: 89, server: "North AMC" },
        { bundle: "FAMAS Demon Lv.7 + M1887 Sterling", evos: "4 Evo Maxed · 391 Vault Items", lvl: 74, price: 58, orig: 75, server: "Global Server" },
        { bundle: "XM8 Destiny Lv.4 + MP40 Chromasonic Lv.4", evos: "3 Evo + 29 Mythic · Heroic S52", lvl: 64, price: 52, orig: 69, server: "LATAM Server" },
        { bundle: "Green Criminal Bundle + Arctic Blue", evos: "MP5 Platinum + UMP Evo", lvl: 69, price: 119, orig: 149, server: "India Server" },
        { bundle: "Level 64 Starter · Cindered Thompson Lv.3", evos: "2 Evo + 30 Mythic · 56 Characters", lvl: 64, price: 35, orig: 45, server: "North AMC" },
      ];

      for (let i = 0; i < 70; i++) {
        const t = FF_TEMPLATES[i % FF_TEMPLATES.length];
        const variance = (i * 4) % 25;
        const finalPrice = Math.max(15, t.price + variance - 8);
        const sellerId = sellerIds[(i + 4) % sellerIds.length] as any;
        const vaults = 150 + (i * 9) % 250;

        const title = `LVL ${t.lvl} · ${t.bundle} · ${t.evos} · ${vaults}+ Vaults · ${t.server}`;
        const desc = `🔥 FREE FIRE HIGH-TIER ACCOUNT (${t.server}) 🔥\n\n` +
          `👗 EXCLUSIVE OUTFITS & BUNDLES:\n` +
          `• Featured: ${t.bundle}\n` +
          `• Total Vault Collection: ${vaults}+ Items\n\n` +
          `🔫 EVO GUNS & WEAPONS:\n` +
          `• ${t.evos}\n` +
          `• Emotes: Rare Old Seasons & LOL Emote included\n` +
          `• Level: ${t.lvl} (Multi-Year Veteran)\n\n` +
          `✅ Clean Login via Google / Dummy Email\n` +
          `✅ 100% Safe — Zero Hackback Guarantee\n` +
          `✅ Instant Delivery & 24/7 Live Support`;

        await ctx.db.insert("listings", {
          sellerId,
          gameId: ffId as any,
          categoryId: categoryId as any,
          title,
          slug: mkSlug("ff", i),
          description: desc,
          price: finalPrice,
          originalPrice: t.orig ? finalPrice + rng(10, 45) : undefined,
          images: [FF_IMGS[i % FF_IMGS.length], FF_IMGS[(i + 1) % FF_IMGS.length]],
          deliveryTime: pick(DELIVERY),
          deliveryMethod: "manual" as const,
          status: "active" as const,
          views: rng(200, 11000),
          badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 45),
          updatedAt: now - rng(0, 86400000 * 3),
        });
        totalCreated++;
        stats["free-fire"] = (stats["free-fire"] || 0) + 1;
      }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 4. ROBLOX — 70 Listings (Korblox, Headless, Blox Fruits Max, Dominus)
    // ═════════════════════════════════════════════════════════════════════════
    const robId = gameMap["roblox"];
    if (robId) {
      const ROB_IMGS = [
        "https://cdn.gameboost.com/accounts/4013208/gallery/34aeb225-e312-4483-a1fb-b541540058dc.png",
        "https://cdn.gameboost.com/accounts/5353349/gallery/123-fd58c123-c94c-45f4-b70b-37ff033daee9-webp.webp",
        "https://cdn.gameboost.com/accounts/6280457/gallery/24-10bVNN.png",
      ];

      const ROB_TEMPLATES = [
        { main: "Headless Horseman + Korblox Deathspeaker", extra: "100k RAP · 15,000 Robux · Voice Chat", year: 2008, price: 429, orig: 520 },
        { main: "Korblox Deathspeaker + 3-Letter Username", extra: "40k RAP · 5,000 Robux · Unverified", year: 2007, price: 185, orig: 230 },
        { main: "Dominus Frigidus + Valkyrie Helm", extra: "150k RAP · 20,000 Robux · 4-Letter OG", year: 2009, price: 479, orig: 590 },
        { main: "Blox Fruits Max Lv.2550 + Perm Kitsune + Perm Dragon", extra: "Godhuman · Sanguine Art · CDK · Dark Blade", year: 2019, price: 89, orig: 119 },
        { main: "Blox Fruits Max Level + Perm Dough + Perm Buddha", extra: "True Triple Katana · Soul Guitar · V4 Race Max", year: 2020, price: 65, orig: 85 },
        { main: "Blox Fruits Bounty 30M + Perm Portal + Perm Leopard", extra: "All Gamepasses · Shark Anchor · Max Stats", year: 2021, price: 95, orig: 125 },
        { main: "2008 OG Veteran Account · 4-Letter Name", extra: "25,000 RAP · OG Badges · Clean History", year: 2008, price: 79, orig: 99 },
        { main: "Headless Horseman Account · 2012 Created", extra: "50,000 RAP · 8,000 Robux · Voice Enabled", year: 2012, price: 349, orig: 420 },
        { main: "Super Happy Face + Korblox", extra: "80,000 RAP · Aesthetic Avatars · Premium", year: 2016, price: 299, orig: 360 },
        { main: "Blox Fruits Starter Max Level 2550", extra: "Godhuman + CDK + 50M Beli + 100k Frags", year: 2022, price: 28, orig: 38 },
        { main: "3-Letter OG Username @K7X", extra: "Unverified · 2008 Badge · Extremely Rare", year: 2008, price: 399, orig: 480 },
        { main: "Blox Fruits PvP Ready · Max Sanguine + Kitsune", extra: "Cursed Dual Katana · V4 Angel Maxed", year: 2021, price: 48, orig: 62 },
      ];

      for (let i = 0; i < 70; i++) {
        const t = ROB_TEMPLATES[i % ROB_TEMPLATES.length];
        const variance = (i * 6) % 30;
        const finalPrice = Math.max(19, t.price + variance - 10);
        const sellerId = sellerIds[(i + 6) % sellerIds.length] as any;

        const title = `${t.main} · ${t.extra} · Created ${t.year}`;
        const desc = `🌟 ROBLOX HIGH-TIER VETERAN / BLOX FRUITS ACCOUNT 🌟\n\n` +
          `🎭 ACCOUNT CORE:\n` +
          `• Featured Items: ${t.main}\n` +
          `• Features / Stats: ${t.extra}\n` +
          `• Account Creation Year: ${t.year} (OG Veteran Status)\n\n` +
          `🛡️ SECURITY & TRANSFER:\n` +
          `• 100% Clean Account — Zero moderation history\n` +
          `• Email unverified or full email transfer provided\n` +
          `• Compatible across PC, Mobile, and Console\n\n` +
          `✅ Instant Automatic Escrow Delivery\n` +
          `✅ Verified Safe by IGMART Admin Team`;

        await ctx.db.insert("listings", {
          sellerId,
          gameId: robId as any,
          categoryId: categoryId as any,
          title,
          slug: mkSlug("rob", i),
          description: desc,
          price: finalPrice,
          originalPrice: t.orig ? finalPrice + rng(15, 60) : undefined,
          images: [ROB_IMGS[i % ROB_IMGS.length]],
          deliveryTime: pick(DELIVERY),
          deliveryMethod: "manual" as const,
          status: "active" as const,
          views: rng(300, 15000),
          badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 45),
          updatedAt: now - rng(0, 86400000 * 3),
        });
        totalCreated++;
        stats["roblox"] = (stats["roblox"] || 0) + 1;
      }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 5. CLASH ROYALE — 70 Listings (King Level 70, 9000 Trophies, Evolutions)
    // ═════════════════════════════════════════════════════════════════════════
    const crId = gameMap["clash-royale"];
    if (crId) {
      const CR_IMGS = [
        "https://cdn.gameboost.com/accounts/6213164/gallery/58e83257-bef7-4f00-b333-343193769e7b.jpg",
        "https://cdn.gameboost.com/accounts/6255046/gallery/ed914123-fa2f-4369-b21a-202f7e787b4d.jpg",
      ];

      const CR_TEMPLATES = [
        { kl: 70, trophies: 9000, evos: "14x Evolutions Maxed (Knight, Zap, Pekka, Mega Knight)", cards: "110/110 Cards Level 15 (Elite)", price: 279, orig: 340, rank: "Ultimate Champion Top 500" },
        { kl: 65, trophies: 9000, evos: "10x Evolutions Maxed · Goblin Queen Max", cards: "95x Level 15 Elite Cards", price: 169, orig: 210, rank: "Ultimate Champion" },
        { kl: 58, trophies: 8500, evos: "8x Evolutions · Evo Firecracker & Bats", cards: "65x Level 15 Cards · 2M Gold", price: 95, orig: 120, rank: "Grand Champion" },
        { kl: 54, trophies: 8000, evos: "6x Evolutions · Evo Skeletons & Wizard", cards: "45x Level 15 Cards · 5000 Gems", price: 65, orig: 85, rank: "Royal Champion" },
        { kl: 50, trophies: 7500, evos: "4x Evolutions (Evo Knight, Evo Mortar)", cards: "30x Level 15 Cards · Clean SC ID", price: 42, orig: 55, rank: "Champion League" },
        { kl: 70, trophies: 9000, evos: "ALL 18 Evolutions Maxed · 10+ Tower Skins", cards: "ALL 110 Cards Level 15 MAX", price: 349, orig: 420, rank: "Top 200 Global Finish" },
        { kl: 60, trophies: 8700, evos: "9x Evolutions · Evo Valkyrie & Tesla", cards: "75x Level 15 Cards · 1.5M Gold", price: 125, orig: 155, rank: "Ultimate Champion" },
        { kl: 45, trophies: 7000, evos: "3x Evolutions · 15x Level 14/15 Cards", cards: "Good Starter · Supercell ID Ready", price: 28, orig: 38, rank: "Master III" },
        { kl: 55, trophies: 8200, evos: "7x Evolutions · Evo Drill & Bomber", cards: "50x Level 15 Cards · 8000 Gems", price: 82, orig: 105, rank: "Grand Champion" },
        { kl: 40, trophies: 6500, evos: "2x Evolutions · Clean Smurf Account", cards: "Classic 2.6 Hog / Logbait Maxed", price: 19, orig: 25, rank: "Master I" },
      ];

      for (let i = 0; i < 70; i++) {
        const t = CR_TEMPLATES[i % CR_TEMPLATES.length];
        const variance = (i * 3) % 20;
        const finalPrice = Math.max(15, t.price + variance - 7);
        const sellerId = sellerIds[(i + 8) % sellerIds.length] as any;
        const gold = (800000 + (i * 120000) % 2500000).toLocaleString();

        const title = `King Level ${t.kl} · ${t.trophies} 🏆 · ${t.evos} · ${t.cards} · ${t.rank}`;
        const desc = `👑 CLASH ROYALE ULTIMATE COMPETITIVE ACCOUNT 👑\n\n` +
          `🏆 PROGRESSION & RANKS:\n` +
          `• King Level: ${t.kl}\n` +
          `• Trophy Road: ${t.trophies} Max Trophies\n` +
          `• Ranked League: ${t.rank}\n\n` +
          `🃏 CARD COLLECTION & EVOLUTIONS:\n` +
          `• Evolutions: ${t.evos}\n` +
          `• Card Levels: ${t.cards}\n` +
          `• Stored Gold: ${gold} Gold\n` +
          `• Multiple Tower Skins and Rare Emotes unlocked\n\n` +
          `✅ Instant Supercell ID Transfer with full email access\n` +
          `✅ 100% Clean Account with zero ban history\n` +
          `✅ 24/7 Customer Support Guarantee`;

        await ctx.db.insert("listings", {
          sellerId,
          gameId: crId as any,
          categoryId: categoryId as any,
          title,
          slug: mkSlug("cr", i),
          description: desc,
          price: finalPrice,
          originalPrice: t.orig ? finalPrice + rng(10, 40) : undefined,
          images: [CR_IMGS[i % CR_IMGS.length]],
          deliveryTime: pick(DELIVERY),
          deliveryMethod: "manual" as const,
          status: "active" as const,
          views: rng(200, 8000),
          badge: pick(BADGES),
          createdAt: now - rng(0, 86400000 * 45),
          updatedAt: now - rng(0, 86400000 * 3),
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
