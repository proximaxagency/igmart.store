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
    // 1. CLASH OF CLANS — 70 Unique Real Listings & Screenshots
    // ═════════════════════════════════════════════════════════════════════════
    const cocId = gameMap["clash-of-clans"];
    if (cocId) {
      const COC_REAL_PICS = [
        "https://cdn.gameboost.com/accounts/6213164/gallery/58e83257-bef7-4f00-b333-343193769e7b.jpg",
        "https://cdn.gameboost.com/accounts/6213164/gallery/4a0f6d43-6a76-4849-a869-0ee80b9f6b3d.jpg",
        "https://cdn.gameboost.com/accounts/6255046/gallery/ed914123-fa2f-4369-b21a-202f7e787b4d.jpg",
        "https://cdn.gameboost.com/accounts/6185724/gallery/0b70154a-9aee-4f67-b834-a922122bbcfe.jpg",
        "https://cdn.gameboost.com/accounts/6267350/gallery/e5cdf593-cfb8-4dfe-bbdd-6c0b76bb53e5.jpg",
        "https://cdn.gameboost.com/accounts/6285688/gallery/c30d6d64-035c-4653-84f5-e490b41b4556.png",
        "https://cdn.gameboost.com/accounts/6292403/gallery/62f5eaa6-e1b5-4d5f-ab76-cf4727420843.jpg",
        "https://cdn.gameboost.com/accounts/6285752/gallery/014152d9-74f3-4f94-8d2b-1695cd53b5eb.jpg",
        "https://cdn.gameboost.com/accounts/6257455/gallery/471ce070-1e4d-4364-bca1-8dd316cdf518.jpg",
        "https://cdn.gameboost.com/accounts/6249304/gallery/b57b26f2-6e45-45d3-b35b-6840faf15679.jpg",
        "https://cdn.gameboost.com/accounts/6043461/gallery/b4334910-e127-4238-a779-f87331d414a9.jpg",
        "https://cdn.gameboost.com/accounts/6106597/gallery/8c3c3534-2c50-4f98-ab8f-2f2894580dff.jpg",
        "https://cdn.gameboost.com/accounts/6209122/gallery/455645a1-1c45-46d1-8d3e-10a940a6310e.jpg",
      ];

      const COC_LISTINGS_DATA = [
        { th: 18, heroes: "95/95/70/50", duke: "Dragon Duke Lv.15", prince: "Minion Prince Lv.20", gems: 14200, price: 185, orig: 220, scenery: "Cosmic Scenery", equip: "Fireball Lv.27 Max", builders: 6 },
        { th: 18, heroes: "100/100/75/55", duke: "Dragon Duke Lv.20", prince: "Minion Prince Lv.25", gems: 22500, price: 249, orig: 299, scenery: "Champion Scenery", equip: "Giant Gauntlet & Frozen Arrow Max", builders: 6 },
        { th: 18, heroes: "110/105/80/80", duke: "Dragon Duke Lv.25 (MAX)", prince: "Minion Prince Lv.30 (MAX)", gems: 31800, price: 399, orig: 480, scenery: "Shadow Scenery", equip: "All 12 Epic Equipments Lv.27", builders: 6 },
        { th: 18, heroes: "90/90/65/45", duke: "Dragon Duke Unlocked", prince: "Minion Prince Lv.10", gems: 8600, price: 155, orig: 180, scenery: "Tiger Scenery", equip: "Frozen Arrow Lv.24 + Spiky Ball", builders: 6 },
        { th: 17, heroes: "85/85/65/45", duke: "Dragon Duke Unlocked", prince: "Minion Prince Lv.15", gems: 5200, price: 95, orig: 119, scenery: "Snow Day Scenery", equip: "Spiky Ball Max + Rocket Spear", builders: 5 },
        { th: 17, heroes: "88/88/68/48", duke: "Dragon Duke Lv.10", prince: "Minion Prince Lv.18", gems: 7400, price: 115, orig: 139, scenery: "Clash Fest Scenery", equip: "Giant Gauntlet Lv.24", builders: 6 },
        { th: 17, heroes: "80/80/60/42", duke: "Dragon Duke Unlocked", prince: "Minion Prince Lv.8", gems: 3700, price: 79, orig: 95, scenery: "Default Scenery", equip: "Fireball Lv.21", builders: 5 },
        { th: 16, heroes: "95/95/70/45", duke: "Hero Hall Lv.3", prince: "Minion Prince Unlocked", gems: 8100, price: 139, orig: 169, scenery: "Dark Fantasy Scenery", equip: "Giant Gauntlet Max + Frozen Arrow Max", builders: 6 },
        { th: 16, heroes: "90/85/65/45", duke: "Hero Hall Lv.2", prince: "Minion Prince Unlocked", gems: 5300, price: 119, orig: 145, scenery: "Epic Jungle Scenery", equip: "Spiky Ball Lv.24", builders: 6 },
        { th: 16, heroes: "85/82/60/40", duke: "Hero Hall Lv.1", prince: "Minion Prince Unlocked", gems: 4200, price: 98, orig: 119, scenery: "Pixel Scenery", equip: "Rocket Spear Lv.18", builders: 5 },
        { th: 15, heroes: "75/75/50/35", duke: "Hero Hall Lv.1", prince: "Minion Prince Unlocked", gems: 2100, price: 45, orig: 59, scenery: "Default Scenery", equip: "Standard Max Troops", builders: 5 },
        { th: 15, heroes: "70/70/48/30", duke: "Hero Hall Lv.1", prince: "Minion Prince Unlocked", gems: 1600, price: 38, orig: 48, scenery: "Default Scenery", equip: "War Layout 2026", builders: 5 },
        { th: 14, heroes: "65/65/40/25", duke: "Hero Hall Available", prince: "Minion Prince Lv.5", gems: 1900, price: 28, orig: 35, scenery: "Default Scenery", equip: "Max Builder Base 2.0", builders: 5 },
        { th: 14, heroes: "60/60/38/20", duke: "Hero Hall Available", prince: "Minion Prince Lv.3", gems: 950, price: 22, orig: 29, scenery: "Default Scenery", equip: "Fresh Supercell ID", builders: 5 },
      ];

      for (let i = 0; i < 70; i++) {
        const d = COC_LISTINGS_DATA[i % COC_LISTINGS_DATA.length];
        const variance = (i * 3) % 22;
        const finalPrice = Math.max(18, d.price + variance - 8);
        const sellerId = sellerIds[i % sellerIds.length] as any;
        const gemsStr = (d.gems + (i * 310) % 4000).toLocaleString();
        const primaryImg = COC_REAL_PICS[i % COC_REAL_PICS.length];
        const secondaryImg = COC_REAL_PICS[(i + 3) % COC_REAL_PICS.length];

        const title = `TH${d.th} Max · Heroes ${d.heroes} · ${d.duke} · ${d.prince} · ${gemsStr} Gems · ${d.scenery} · ${d.equip}`;
        const desc = `⚔️ CLASH OF CLANS TOWN HALL ${d.th} VERIFIED BASE ⚔️\n\n` +
          `👑 HERO & ABILITY STATS:\n` +
          `• Barbarian King & Queen: ${d.heroes.split("/")[0]}/${d.heroes.split("/")[1]}\n` +
          `• Grand Warden & RC: ${d.heroes.split("/")[2]}/${d.heroes.split("/")[3]}\n` +
          `• Flying Hero: ${d.duke}\n` +
          `• Dark Elixir Hero: ${d.prince}\n` +
          `• Epic Equipment: ${d.equip}\n\n` +
          `🏰 VILLAGE ASSETS:\n` +
          `• Stored Gems: ${gemsStr}\n` +
          `• Scenery: ${d.scenery}\n` +
          `• Active Builders: ${d.builders}\n` +
          `• Supercell ID: Clean, verified, ready for instant mail transfer\n\n` +
          `✅ 100% Anti-Ban Guarantee\n` +
          `✅ Automated Escrow Transfer\n` +
          `✅ 24/7 Support`;

        await ctx.db.insert("listings", {
          sellerId,
          gameId: cocId as any,
          categoryId: categoryId as any,
          title,
          slug: mkSlug("coc", i),
          description: desc,
          price: finalPrice,
          originalPrice: d.orig ? finalPrice + rng(15, 45) : undefined,
          images: [primaryImg, secondaryImg],
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
    // 2. PUBG MOBILE / BGMI — 70 Unique Real Listings & Screenshots
    // ═════════════════════════════════════════════════════════════════════════
    const pubgId = gameMap["pubg-mobile"];
    if (pubgId) {
      const PUBG_REAL_PICS = [
        "https://cdn.gameboost.com/accounts/6067613/gallery/aec3dfcd-c3a6-4cea-84af-d0fde410e3ef.png",
        "https://cdn.gameboost.com/accounts/6067613/gallery/c73b35b6-5704-4207-9440-cc4c1a604db0.png",
        "https://cdn.gameboost.com/accounts/6067613/gallery/a2b6a336-e919-428b-b97a-ed0c9a95b883.png",
        "https://cdn.gameboost.com/accounts/6067613/gallery/6eb40eb0-01f1-4f54-8d6d-7c78ca6dd1b3.png",
        "https://cdn.gameboost.com/accounts/6314375/gallery/86483c61-cfb3-4c49-96f2-f83b45e1331e.png",
        "https://cdn.gameboost.com/accounts/6314375/gallery/674b25d1-b2bc-4912-a9ba-f80eca6aa0e0.png",
        "https://cdn.gameboost.com/accounts/6314375/gallery/dfa77f26-7256-47c8-a1bf-e574e7161088.png",
        "https://cdn.gameboost.com/accounts/6314375/gallery/6b771655-91e4-4551-9cd8-ac3ae8557fcc.png",
        "https://cdn.gameboost.com/accounts/6254703/gallery/86-28-1.jpg",
        "https://cdn.gameboost.com/accounts/6254703/gallery/120-28-2.jpg",
        "https://cdn.gameboost.com/accounts/6254703/gallery/197-28-3.jpg",
        "https://cdn.gameboost.com/accounts/6254703/gallery/269-28-4.jpg",
        "https://cdn.gameboost.com/accounts/6305015/gallery/2d7d6d69-7186-4b78-bf02-cf6919c4dcc9.jpeg",
        "https://cdn.gameboost.com/accounts/6305015/gallery/f8786e6f-0aa4-4d4a-80ea-20a686e7126c.jpeg",
        "https://cdn.gameboost.com/accounts/6305015/gallery/a6738219-2b82-490d-8532-82b8105d7191.jpeg",
        "https://cdn.gameboost.com/accounts/6305189/gallery/5efecb00-92bc-489b-8140-f022a7d29346.jpeg",
        "https://cdn.gameboost.com/accounts/6305189/gallery/577b00aa-7992-4119-b65c-04db5551d35a.jpeg",
        "https://cdn.gameboost.com/accounts/6305189/gallery/c1b506d7-6d66-4242-a1eb-774e9384545c.jpeg",
        "https://cdn.gameboost.com/accounts/6190890/gallery/4a74e2f2-85ba-499b-8dc5-15faf3b4365d.png",
      ];

      const PUBG_DATA = [
        { gun: "M416 Glacier Lv.7 MAX", xsuit: "Golden Pharaoh X-Suit Lv.6", lvl: 82, gunlab: 48, rank: "Conqueror S14", price: 389, orig: 460, car: "Dodge Charger SRT Hellcat" },
        { gun: "M416 Fool Lv.7 MAX", xsuit: "4x X-Suits (Pharaoh, Anukra, Phoenixtra)", lvl: 70, gunlab: 45, rank: "Ace Dominator", price: 449, orig: 549, car: "Dodge Hornet GLH Concept" },
        { gun: "M416 Glacier + AKM Decisive Day", xsuit: "Blood Raven X-Suit Lv.4", lvl: 75, gunlab: 28, rank: "Ace Master", price: 163, orig: 199, car: "UAZ Golden Age" },
        { gun: "M416 Shinobi Lv.6", xsuit: "B-Raven X-Suit Lv.2", lvl: 80, gunlab: 21, rank: "Ace Rank", price: 198, orig: 249, car: "Dacia Dragon Hunter" },
        { gun: "M416 Fool Lv.5", xsuit: "Cryonix Wraith Ultimate", lvl: 83, gunlab: 23, rank: "Crown Rank", price: 198, orig: 239, car: "Mirado Summer Wave" },
        { gun: "Crimson Skyblade M416 Lv.4", xsuit: "Atomic Trigger S12K", lvl: 64, gunlab: 17, rank: "Crown Rank", price: 99, orig: 129, car: "Buggy Electro" },
        { gun: "AWM Godzilla Lv.7", xsuit: "Raven X-Suit", lvl: 72, gunlab: 26, rank: "Ace Rank", price: 79, orig: 99, car: "UAZ Aegis" },
        { gun: "M416 Glacier Lv.4 (Kill Msg)", xsuit: "52x Mythic Outfits", lvl: 68, gunlab: 14, rank: "Diamond Rank", price: 89, orig: 109, car: "Coupe RB Sports" },
        { gun: "Trio Glacier Combo (M4 + AKM + UMP)", xsuit: "3x Glacier Weapons", lvl: 71, gunlab: 18, rank: "Crown Rank", price: 140, orig: 175, car: "UAZ Snow Camo" },
        { gun: "Codebreaker AKM Lv.4", xsuit: "35x Mythic Outfits", lvl: 65, gunlab: 12, rank: "Crown Rank", price: 45, orig: 59, car: "Dacia Cyberpunk" },
        { gun: "DP28 Mythic + M416 Fool Lv.3", xsuit: "Dodge Charger SRT Hellcat", lvl: 72, gunlab: 18, rank: "Ace Rank", price: 115, orig: 145, car: "Dodge SRT Purple" },
        { gun: "Phoenixtra X-Suit Lv.4", xsuit: "25x GunLab Upgradables", lvl: 77, gunlab: 25, rank: "Ace Dominator", price: 220, orig: 275, car: "Lamborghini Huracan" },
        { gun: "AKM Golden Age + S12K Atomic", xsuit: "15 GunLab Upgradables", lvl: 60, gunlab: 15, rank: "Diamond Rank", price: 45, orig: 59, car: "UAZ Military" },
        { gun: "Gold Rank Starter Clean Account", xsuit: "Clean Account · Full Mail Access", lvl: 42, gunlab: 4, rank: "Gold Rank", price: 14, orig: 19, car: "Standard" },
      ];

      for (let i = 0; i < 70; i++) {
        const d = PUBG_DATA[i % PUBG_DATA.length];
        const variance = (i * 4) % 28;
        const finalPrice = Math.max(12, d.price + variance - 10);
        const sellerId = sellerIds[(i + 1) % sellerIds.length] as any;
        const mythics = 30 + (i * 5) % 80;
        const primaryImg = PUBG_REAL_PICS[i % PUBG_REAL_PICS.length];
        const secondaryImg = PUBG_REAL_PICS[(i + 2) % PUBG_REAL_PICS.length];

        const title = `${d.gun} · ${d.xsuit} · ${mythics} Mythic Outfits · ${d.gunlab}x GunLab · Lv.${d.lvl} · ${d.rank}`;
        const desc = `🔥 PUBG MOBILE / BGMI GLOBAL ACCOUNT — LEVEL ${d.lvl} 🔥\n\n` +
          `🔫 GUN LAB UPGRADES:\n` +
          `• Primary Weapon: ${d.gun}\n` +
          `• Total Upgradable GunLab Skins: ${d.gunlab}x\n` +
          `• Kill Message Broadcast & Custom Loot Crate Active\n\n` +
          `👑 X-SUITS & COSMETICS:\n` +
          `• Feature: ${d.xsuit}\n` +
          `• Mythic Outfits Collection: ${mythics}+\n` +
          `• Vehicle Skin: ${d.car}\n` +
          `• Season Rank: ${d.rank}\n\n` +
          `✅ Full Original Email Access & Unlinked Socials\n` +
          `✅ 100% Anti-Ban Guarantee — Hand Leveled\n` +
          `✅ Instant Automated Escrow Delivery`;

        await ctx.db.insert("listings", {
          sellerId,
          gameId: pubgId as any,
          categoryId: categoryId as any,
          title,
          slug: mkSlug("pubg", i),
          description: desc,
          price: finalPrice,
          originalPrice: d.orig ? finalPrice + rng(15, 55) : undefined,
          images: [primaryImg, secondaryImg],
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
    // 3. FREE FIRE — 70 Unique Real Listings & Screenshots
    // ═════════════════════════════════════════════════════════════════════════
    const ffId = gameMap["free-fire"];
    if (ffId) {
      const FF_REAL_PICS = [
        "https://cdn.gameboost.com/accounts/6226793/gallery/2104b9c9-83b5-4767-b4df-a89e759a0758.jpg",
        "https://cdn.gameboost.com/accounts/6226793/gallery/8e5872b2-440b-4356-88c5-10f824a46456.jpg",
        "https://cdn.gameboost.com/accounts/6226793/gallery/72958cb9-7e12-4219-aff7-a37f96846026.jpg",
        "https://cdn.gameboost.com/accounts/6226793/gallery/0d08959e-cbd4-4d12-89bb-2b264cb62cef.jpg",
        "https://cdn.gameboost.com/accounts/6192164/gallery/9f2d8523-3c61-460d-b067-424481a58b95.jpg",
        "https://cdn.gameboost.com/accounts/6258601/gallery/69d58882-0a80-4270-84bc-cb5fac11f0af.jpg",
        "https://cdn.gameboost.com/accounts/6278630/gallery/52ae2ce2-9c2e-4416-a8f7-da15fc0d6aa0.jpg",
        "https://cdn.gameboost.com/accounts/6278630/gallery/2e29e2fb-3625-4516-8d42-76b5b2a77bcf.jpg",
        "https://cdn.gameboost.com/accounts/6278630/gallery/9194d7eb-039e-4e75-89cb-f6364faf660e.jpg",
        "https://cdn.gameboost.com/accounts/5380080/gallery/a1b64e83-d616-402c-8f08-7c71a1594a3e.jpeg",
        "https://cdn.gameboost.com/accounts/6258394/gallery/67cd3f6d-8f25-46f6-83ba-dfa06461fac6.jpg",
        "https://cdn.gameboost.com/accounts/6259028/gallery/121-jbbnif9sns50vf62rv6k.jpg",
        "https://cdn.gameboost.com/accounts/6259034/gallery/25-5brhmv860p2mou261czi.jpg",
        "https://cdn.gameboost.com/accounts/6280767/gallery/9b7d7984-21a6-4aba-8c39-8106450aae7c.jpg",
        "https://cdn.gameboost.com/accounts/6280767/gallery/cb02f427-0edc-4ac2-bf7e-7c8caab323fc.jpg",
        "https://cdn.gameboost.com/accounts/6280767/gallery/5597a608-7e2e-45c8-b1fc-91993f58138e.jpg",
        "https://cdn.gameboost.com/accounts/6280767/gallery/f5e95392-9beb-4d01-9e33-3380f8653b38.jpg",
      ];

      const FF_DATA = [
        { bundle: "Sakura Season 1 VIP + Hip Hop", evos: "7 Evo Guns Maxed (Draco, Cobra, Megalodon)", lvl: 82, price: 289, orig: 350, server: "India Server", emotes: "LOL Emote · Flower Emote · Throne" },
        { bundle: "Golden Criminal Top Bundle", evos: "8 Evo Guns Maxed · 337 Vaults", lvl: 78, price: 189, orig: 239, server: "Global / India", emotes: "55 Emotes · FFWC Throne" },
        { bundle: "Money Heist + LOL Emote", evos: "Draco M10 + 2 Evo + 15 Mythic", lvl: 61, price: 29, orig: 39, server: "India Server", emotes: "LOL Emote · Tea Time" },
        { bundle: "Heroic Stacked 670+ Gun Skins", evos: "4 Evo Guns Maxed · 334 Rare Bundles", lvl: 81, price: 233, orig: 289, server: "India Server", emotes: "Bunny Bundle · Mythic Emotes" },
        { bundle: "One Punch Man Exclusive Skin", evos: "Multiple Evolutions · 2020 Veteran", lvl: 75, price: 200, orig: 249, server: "Global Server", emotes: "OPM Saitama Emote" },
        { bundle: "Yuji Itadori Bundle (Jujutsu Kaisen)", evos: "358 Gun Skins · 45 Mythic Guns", lvl: 67, price: 87, orig: 110, server: "LATAM / Global", emotes: "JJK Special Emotes" },
        { bundle: "AK47 Blue Flame Draco Lv.5 + SCAR Megalodon", evos: "2 Evo · 363 Costumes · 169 Bundles", lvl: 71, price: 42, orig: 55, server: "Indonesia", emotes: "Draco Emote · Megalodon Jump" },
        { bundle: "MP40 Cobra Lv.4 + 50 Mythic Weapons", evos: "2 Evo · 131 Bundles · 70 Vehicles", lvl: 67, price: 71, orig: 89, server: "North AMC", emotes: "Cobra Strike Emote" },
        { bundle: "FAMAS Demon Lv.7 + M1887 Sterling", evos: "4 Evo Maxed · 391 Vault Items", lvl: 74, price: 58, orig: 75, server: "Global Server", emotes: "Demon Wing Emote" },
        { bundle: "XM8 Destiny Lv.4 + MP40 Chromasonic Lv.4", evos: "3 Evo + 29 Mythic · Heroic S52", lvl: 64, price: 52, orig: 69, server: "LATAM Server", emotes: "Destiny Beam Emote" },
        { bundle: "Green Criminal Bundle + Arctic Blue", evos: "MP5 Platinum + UMP Evo", lvl: 69, price: 119, orig: 149, server: "India Server", emotes: "Criminal Dance Emote" },
        { bundle: "Level 64 Starter · Cindered Thompson Lv.3", evos: "2 Evo + 30 Mythic · 56 Characters", lvl: 64, price: 35, orig: 45, server: "North AMC", emotes: "Standard Emotes" },
      ];

      for (let i = 0; i < 70; i++) {
        const d = FF_DATA[i % FF_DATA.length];
        const variance = (i * 3) % 24;
        const finalPrice = Math.max(14, d.price + variance - 7);
        const sellerId = sellerIds[(i + 2) % sellerIds.length] as any;
        const vaults = 160 + (i * 8) % 280;
        const primaryImg = FF_REAL_PICS[i % FF_REAL_PICS.length];
        const secondaryImg = FF_REAL_PICS[(i + 2) % FF_REAL_PICS.length];

        const title = `LVL ${d.lvl} · ${d.bundle} · ${d.evos} · ${vaults}+ Vaults · ${d.server}`;
        const desc = `🔥 FREE FIRE HIGH-TIER VETERAN ACCOUNT (${d.server}) 🔥\n\n` +
          `👗 OUTFITS & RARE BUNDLES:\n` +
          `• Featured: ${d.bundle}\n` +
          `• Vault Collection: ${vaults}+ Costumes & Outfits\n` +
          `• Emotes: ${d.emotes}\n\n` +
          `🔫 WEAPON LAB & EVOLUTIONS:\n` +
          `• ${d.evos}\n` +
          `• Level: ${d.lvl} (5+ Years Active Veteran)\n\n` +
          `✅ Clean Login via Google Mail ID / Dummy Transfer\n` +
          `✅ 100% Zero Hackback Guarantee\n` +
          `✅ Instant Automated Escrow Delivery`;

        await ctx.db.insert("listings", {
          sellerId,
          gameId: ffId as any,
          categoryId: categoryId as any,
          title,
          slug: mkSlug("ff", i),
          description: desc,
          price: finalPrice,
          originalPrice: d.orig ? finalPrice + rng(10, 45) : undefined,
          images: [primaryImg, secondaryImg],
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
    // 4. ROBLOX — 70 Unique Real Listings & Screenshots
    // ═════════════════════════════════════════════════════════════════════════
    const robId = gameMap["roblox"];
    if (robId) {
      const ROB_REAL_PICS = [
        "https://cdn.gameboost.com/accounts/4013208/gallery/34aeb225-e312-4483-a1fb-b541540058dc.png",
        "https://cdn.gameboost.com/accounts/5353349/gallery/123-fd58c123-c94c-45f4-b70b-37ff033daee9-webp.webp",
        "https://cdn.gameboost.com/accounts/6280457/gallery/24-10bVNN.png",
        "https://cdn.gameboost.com/accounts/6285688/gallery/c30d6d64-035c-4653-84f5-e490b41b4556.png",
        "https://cdn.gameboost.com/accounts/6285752/gallery/014152d9-74f3-4f94-8d2b-1695cd53b5eb.jpg",
        "https://cdn.gameboost.com/accounts/6259028/gallery/121-jbbnif9sns50vf62rv6k.jpg",
        "https://cdn.gameboost.com/accounts/6213164/gallery/58e83257-bef7-4f00-b333-343193769e7b.jpg",
        "https://cdn.gameboost.com/accounts/6314375/gallery/86483c61-cfb3-4c49-96f2-f83b45e1331e.png",
      ];

      const ROB_DATA = [
        { main: "Headless Horseman + Korblox Deathspeaker", extra: "100k RAP · 15,000 Robux · Spatial Voice", year: 2008, price: 429, orig: 520 },
        { main: "Korblox Deathspeaker + 3-Letter Username", extra: "40k RAP · 5,000 Robux · Unverified", year: 2007, price: 185, orig: 230 },
        { main: "Dominus Frigidus + Valkyrie Helm", extra: "150k RAP · 20,000 Robux · 4-Letter OG", year: 2009, price: 479, orig: 590 },
        { main: "Blox Fruits Max Lv.2550 + Perm Kitsune + Perm Dragon", extra: "Godhuman · Sanguine Art · CDK · Dark Blade", year: 2019, price: 89, orig: 119 },
        { main: "Blox Fruits Max Level + Perm Dough + Perm Buddha", extra: "True Triple Katana · Soul Guitar · V4 Race Max", year: 2020, price: 65, orig: 85 },
        { main: "Blox Fruits Bounty 30M + Perm Portal + Perm Leopard", extra: "All Gamepasses · Shark Anchor · Max Stats", year: 2021, price: 95, orig: 125 },
        { main: "2008 OG Veteran Account · 4-Letter Name", extra: "25,000 RAP · OG Badges · Clean History", year: 2008, price: 79, orig: 99 },
        { main: "Headless Horseman Account · 2012 Created", extra: "50,000 RAP · 8,000 Robux · Voice Enabled", year: 2012, price: 349, orig: 420 },
        { main: "Super Happy Face + Korblox", extra: "80,000 RAP · Aesthetic Avatars · Premium Active", year: 2016, price: 299, orig: 360 },
        { main: "Blox Fruits Starter Max Level 2550", extra: "Godhuman + CDK + 50M Beli + 100k Frags", year: 2022, price: 28, orig: 38 },
        { main: "3-Letter OG Username @K7X", extra: "Unverified · 2008 Badge · Extremely Rare", year: 2008, price: 399, orig: 480 },
        { main: "Blox Fruits PvP Ready · Max Sanguine + Kitsune", extra: "Cursed Dual Katana · V4 Angel Maxed", year: 2021, price: 48, orig: 62 },
      ];

      for (let i = 0; i < 70; i++) {
        const d = ROB_DATA[i % ROB_DATA.length];
        const variance = (i * 5) % 25;
        const finalPrice = Math.max(19, d.price + variance - 8);
        const sellerId = sellerIds[(i + 3) % sellerIds.length] as any;
        const primaryImg = ROB_REAL_PICS[i % ROB_REAL_PICS.length];
        const secondaryImg = ROB_REAL_PICS[(i + 1) % ROB_REAL_PICS.length];

        const title = `${d.main} · ${d.extra} · Created ${d.year}`;
        const desc = `🌟 ROBLOX HIGH-TIER VETERAN / BLOX FRUITS ACCOUNT 🌟\n\n` +
          `🎭 ACCOUNT CORE:\n` +
          `• Featured Items: ${d.main}\n` +
          `• Features / Stats: ${d.extra}\n` +
          `• Account Creation Year: ${d.year} (OG Veteran Status)\n\n` +
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
          originalPrice: d.orig ? finalPrice + rng(15, 60) : undefined,
          images: [primaryImg, secondaryImg],
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
    // 5. CLASH ROYALE — 70 Unique Real Listings & Screenshots
    // ═════════════════════════════════════════════════════════════════════════
    const crId = gameMap["clash-royale"];
    if (crId) {
      const CR_REAL_PICS = [
        "https://cdn.gameboost.com/accounts/6043461/gallery/b4334910-e127-4238-a779-f87331d414a9.jpg",
        "https://cdn.gameboost.com/accounts/6043461/gallery/2cd5323a-ef84-4ab0-a7cf-e49bcc78f173.jpg",
        "https://cdn.gameboost.com/accounts/6043461/gallery/a5f3575d-ca30-4c55-bd2b-854054e4aad1.jpg",
        "https://cdn.gameboost.com/accounts/6043461/gallery/6857d901-c145-4128-ab22-187b4af802d1.jpg",
        "https://cdn.gameboost.com/accounts/6106597/gallery/8c3c3534-2c50-4f98-ab8f-2f2894580dff.jpg",
        "https://cdn.gameboost.com/accounts/6106597/gallery/b843a118-9f63-430b-9ad4-b4634b2e71b8.jpg",
        "https://cdn.gameboost.com/accounts/6106597/gallery/2c663c63-40f8-446d-86b5-e05a81d6763d.jpg",
        "https://cdn.gameboost.com/accounts/6106597/gallery/9ea12812-23e0-4d75-9c0e-cab1ab3f27c4.jpg",
        "https://cdn.gameboost.com/accounts/6209122/gallery/455645a1-1c45-46d1-8d3e-10a940a6310e.jpg",
        "https://cdn.gameboost.com/accounts/6209122/gallery/61716fcd-3c1b-42fb-9d0c-90d1473ab2ee.jpg",
        "https://cdn.gameboost.com/accounts/6209122/gallery/72f2e1b1-e2dc-4c8e-8878-986acca6b40c.jpg",
        "https://cdn.gameboost.com/accounts/6209122/gallery/97dc6385-c025-46a8-a10a-86549a10551a.jpg",
        "https://cdn.gameboost.com/accounts/6267350/gallery/e5cdf593-cfb8-4dfe-bbdd-6c0b76bb53e5.jpg",
        "https://cdn.gameboost.com/accounts/6292403/gallery/62f5eaa6-e1b5-4d5f-ab76-cf4727420843.jpg",
        "https://cdn.gameboost.com/accounts/6257455/gallery/471ce070-1e4d-4364-bca1-8dd316cdf518.jpg",
        "https://cdn.gameboost.com/accounts/6249304/gallery/b57b26f2-6e45-45d3-b35b-6840faf15679.jpg",
      ];

      const CR_DATA = [
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
        const d = CR_DATA[i % CR_DATA.length];
        const variance = (i * 3) % 18;
        const finalPrice = Math.max(15, d.price + variance - 6);
        const sellerId = sellerIds[(i + 4) % sellerIds.length] as any;
        const gold = (800000 + (i * 110000) % 2200000).toLocaleString();
        const primaryImg = CR_REAL_PICS[i % CR_REAL_PICS.length];
        const secondaryImg = CR_REAL_PICS[(i + 1) % CR_REAL_PICS.length];

        const title = `King Level ${d.kl} · ${d.trophies} 🏆 · ${d.evos} · ${d.cards} · ${d.rank}`;
        const desc = `👑 CLASH ROYALE ULTIMATE COMPETITIVE ACCOUNT 👑\n\n` +
          `🏆 PROGRESSION & RANKS:\n` +
          `• King Level: ${d.kl}\n` +
          `• Trophy Road: ${d.trophies} Max Trophies\n` +
          `• Ranked League: ${d.rank}\n\n` +
          `🃏 CARD COLLECTION & EVOLUTIONS:\n` +
          `• Evolutions: ${d.evos}\n` +
          `• Card Levels: ${d.cards}\n` +
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
          originalPrice: d.orig ? finalPrice + rng(10, 40) : undefined,
          images: [primaryImg, secondaryImg],
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
