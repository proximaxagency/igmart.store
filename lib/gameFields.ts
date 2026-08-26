// ─── Game-specific field configs ───────────────────────────────────────────
export type FieldType = "text" | "number" | "select" | "toggle" | "level";

export interface GameField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  icon?: string;
  hint?: string;
  required?: boolean;
}


export const GAME_FIELDS: Record<string, { emoji: string; color: string; fields: GameField[] }> = {
  "clash-of-clans": {
    emoji: "⚔️",
    color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
    fields: [
      {
        key: "townHallLevel", label: "Town Hall Level", type: "select", icon: "🏰", required: true,
        options: ["TH1","TH2","TH3","TH4","TH5","TH6","TH7","TH8","TH9","TH10","TH11","TH12","TH13","TH14","TH15","TH16","TH17","TH18"],
        hint: "TH18 released Nov 2025 — latest content",
      },
      { key: "barbarianKingLevel", label: "Barbarian King Level", type: "number", placeholder: "e.g. 95 (max 95 at TH16)", icon: "👑", hint: "Max 95 at TH16+" },
      { key: "archerQueenLevel", label: "Archer Queen Level", type: "number", placeholder: "e.g. 95 (max 95 at TH16)", icon: "🏹", hint: "Max 95 at TH16+" },
      { key: "grandWardenLevel", label: "Grand Warden Level", type: "number", placeholder: "e.g. 70 (max 70 at TH16)", icon: "📖", hint: "Max 70 at TH16+" },
      { key: "royalChampionLevel", label: "Royal Champion Level", type: "number", placeholder: "e.g. 45 (max 45 at TH16)", icon: "🛡️", hint: "Unlocks at TH13" },
      { key: "minionPrinceLevel", label: "Minion Prince Level", type: "number", placeholder: "e.g. 30", icon: "😈", hint: "Flying hero — unlocks at TH9 via Hero Hall Lv 3" },
      { key: "dragonDukeLevel", label: "Dragon Duke Level", type: "number", placeholder: "e.g. 20 (max 20)", icon: "🐉", hint: "New Feb 2026 flying hero — Builder Base" },
      { key: "builderHallLevel", label: "Builder Hall Level", type: "select", icon: "🔨",
        options: ["BH1","BH2","BH3","BH4","BH5","BH6","BH7","BH8","BH9","BH10"],
        hint: "Builder Base / Xtreme Village" },
      { key: "gems", label: "Gems", type: "number", placeholder: "e.g. 5000", icon: "💎" },
      { key: "trophies", label: "Home Village Trophies", type: "number", placeholder: "e.g. 6500", icon: "🏆" },
      { key: "warStars", label: "War Stars", type: "number", placeholder: "e.g. 2500", icon: "⭐" },
      { key: "clanWarLeague", label: "CWL League", type: "select", icon: "⚔️",
        options: ["Bronze","Silver","Gold","Crystal","Master","Champion","Titan","Legend"] },
      { key: "epicEquipments", label: "Epic Equipment Count", type: "number", placeholder: "e.g. 8", icon: "⚡", hint: "Craftable hero equipment" },
      {
        key: "wallsLevel", label: "Walls Max Level", type: "select", icon: "🧱",
        options: ["Level 1-5","Level 6-9","Level 10","Level 11","Level 12","Level 13","Level 14","Level 15","Level 16 (TH17)","Level 17 (TH18)"],
      },
      { key: "sceneries", label: "Premium Sceneries Owned", type: "number", placeholder: "e.g. 5", icon: "🌄" },
      { key: "supercellIdReady", label: "Supercell ID Transfer Ready", type: "toggle", icon: "✅", required: true },
    ],
  },

  "clash-royale": {
    emoji: "🃏",
    color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30",
    fields: [
      { key: "kingLevel", label: "King Tower Level", type: "number", placeholder: "e.g. 60 (max 70)", icon: "👑", required: true, hint: "Max King Level is 70 (Aug 2026)" },
      { key: "trophies", label: "Current Trophies", type: "number", placeholder: "e.g. 9000", icon: "🏆" },
      {
        key: "pathOfLegendRank", label: "Path of Legends Rank", type: "select", icon: "🥇",
        options: ["Challenger I","Challenger II","Challenger III","Master I","Master II","Master III","Champion","Grand Champion","Royal Champion","Ultimate Champion","Legendary Champion"],
      },
      { key: "gems", label: "Gems", type: "number", placeholder: "e.g. 2000", icon: "💎" },
      { key: "gold", label: "Gold", type: "number", placeholder: "e.g. 500000", icon: "🪙" },
      { key: "maxCards", label: "Max Level (Lv 15) Cards", type: "number", placeholder: "e.g. 80", icon: "🃏", hint: "Elite Wild Cards used" },
      { key: "evolutionsUnlocked", label: "Evolutions Unlocked", type: "number", placeholder: "e.g. 42 (max 42 total)", icon: "⚡", hint: "42 total evolutions as of 2026" },
      { key: "heroCards", label: "Hero Cards Owned", type: "select", icon: "🦸",
        options: ["None","Hero Valkyrie only","Hero Berserker only","Both Hero Cards","All Heroes maxed"],
        hint: "Hero Valkyrie & Hero Berserker are 2026 additions" },
      { key: "legendaryCards", label: "Legendary Cards Count", type: "number", placeholder: "e.g. 18", icon: "⭐" },
      { key: "starPoints", label: "Star Points", type: "number", placeholder: "e.g. 200000", icon: "🌟" },
      { key: "seasonWins", label: "Best Season Wins (PoL)", type: "number", placeholder: "e.g. 20", icon: "🏅" },
      { key: "passRoyale", label: "Pass Royale Active", type: "toggle", icon: "🎫" },
      { key: "supercellIdReady", label: "Supercell ID Transfer Ready", type: "toggle", icon: "✅", required: true },
    ],
  },

  "free-fire": {
    emoji: "🔥",
    color: "from-red-500/20 to-orange-500/10 border-red-500/30",
    fields: [
      { key: "accountLevel", label: "Account Level", type: "number", placeholder: "e.g. 80", icon: "📊", required: true },
      {
        key: "rank", label: "Current BR Rank", type: "select", icon: "🏆", required: true,
        options: ["Bronze","Silver","Gold","Platinum","Diamond","Heroic","Grand Master"],
        hint: "OB54 rank — Aug 2026 season",
      },
      {
        key: "csRank", label: "Clash Squad Rank", type: "select", icon: "⚔️",
        options: ["Bronze","Silver","Gold","Platinum","Diamond","Heroic","Grand Master"],
      },
      { key: "diamonds", label: "Diamonds", type: "number", placeholder: "e.g. 5000", icon: "💎" },
      { key: "skins", label: "Legendary Gun Skins", type: "number", placeholder: "e.g. 25", icon: "🎨" },
      { key: "evoGuns", label: "Evo Gun Skins (Maxed)", type: "number", placeholder: "e.g. 12", icon: "🔫", hint: "Maxed Evo guns = high value" },
      {
        key: "topCharacters", label: "Key Characters Owned", type: "select", icon: "🧑‍🤝‍🧑",
        options: ["Alok","Chrono","Kassie","Dimitri","Skyler","All S-Tier (Alok+Chrono+Kassie+Dimitri)","Full Roster"],
        hint: "OB54 S-Tier: Alok, Chrono (buffed), Kassie, Dimitri, Skyler",
      },
      {
        key: "topPet", label: "Best Pet Owned", type: "select", icon: "🐾",
        options: ["Rockie","Dreki","Beaston","Mr. Waggor","Agent Hop","Kactus","Hoot","Multiple top pets","Full collection"],
        hint: "Rockie is #1 meta pet (2026)",
      },
      { key: "bundles", label: "Outfit Bundles", type: "number", placeholder: "e.g. 30", icon: "👘" },
      {
        key: "region", label: "Account Region", type: "select", icon: "🌍",
        options: ["India","SEA","MENA","BR/LATN","North America","Europe","Other"],
      },
      { key: "bindingRemoved", label: "Binding Removable / Guest Account", type: "toggle", icon: "🔓" },
    ],
  },

  "pubg-mobile": {
    emoji: "🎯",
    color: "from-amber-600/20 to-yellow-600/10 border-amber-600/30",
    fields: [
      {
        key: "version", label: "Game Version", type: "select", icon: "🌐", required: true,
        options: ["BGMI (India)", "PUBG Mobile (Global)", "PUBG Mobile (KR/JP)", "PUBG Mobile (VN)"],
      },
      {
        key: "tier", label: "Current Season Tier", type: "select", icon: "🏆", required: true,
        options: ["Bronze","Silver","Gold","Platinum","Diamond","Crown","Ace","Ace Master","Ace Dominator","Conqueror"],
        hint: "2026: New Ace Master & Ace Dominator tiers added",
      },
      { key: "tierPoints", label: "Rank Points (RP)", type: "number", placeholder: "e.g. 4500", icon: "📈" },
      { key: "uc", label: "UC Balance", type: "number", placeholder: "e.g. 3000", icon: "💰" },
      {
        key: "xSuits", label: "X-Suits / Mythic Outfits", type: "number", placeholder: "e.g. 5", icon: "🥷",
        hint: "Count Mythic / X-Suit tier outfits specifically",
      },
      { key: "outfits", label: "Total Outfit Sets", type: "number", placeholder: "e.g. 40", icon: "👗" },
      {
        key: "glacierM416Level", label: "M416 Glacier Level", type: "select", icon: "❄️",
        options: ["Not owned","Level 1","Level 2","Level 3","Level 4","Level 5","Level 6","Level 7 (Max)"],
        hint: "M416 Glacier Lv 7 = highest value upgrade",
      },
      { key: "gunSkins", label: "Upgradable Gun Skins Count", type: "number", placeholder: "e.g. 20", icon: "🔫" },
      { key: "royalPass", label: "Royal Pass Seasons Completed", type: "number", placeholder: "e.g. 28", icon: "👑" },
      { key: "conquerorFrames", label: "Conqueror Season Frames", type: "number", placeholder: "e.g. 5", icon: "🖼️" },
      { key: "achievementPoints", label: "Achievement Points", type: "number", placeholder: "e.g. 8500", icon: "⭐" },
      { key: "emailLinked", label: "Email Linked / Changeable", type: "toggle", icon: "📧" },
    ],
  },

  "roblox": {
    emoji: "🧱",
    color: "from-sky-500/20 to-blue-500/10 border-sky-500/30",
    fields: [
      { key: "accountAge", label: "Account Age (years)", type: "number", placeholder: "e.g. 8 (2016 = 10yr)", icon: "📅", required: true, hint: "Older accounts are worth significantly more" },
      { key: "robux", label: "Robux Balance", type: "number", placeholder: "e.g. 10000", icon: "💰" },
      { key: "premiumActive", label: "Roblox Premium Active", type: "toggle", icon: "⭐" },
      { key: "rap", label: "RAP (Recent Avg. Price of Limiteds)", type: "number", placeholder: "e.g. 50000", icon: "📊", hint: "Key value indicator for limited accounts" },
      { key: "limiteds", label: "Limited Items Count", type: "number", placeholder: "e.g. 5", icon: "🏷️" },
      {
        key: "topLimiteds", label: "Notable Limiteds Owned", type: "select", icon: "💎",
        options: ["None","Korblox Deathspeaker","Headless Horseman","Korblox + Headless","Dom Set","Multiple high-value limiteds (100k+ RAP)"],
        hint: "Korblox + Headless = highest value combo",
      },
      {
        key: "bloxFruitsProgress", label: "Blox Fruits Progress", type: "select", icon: "🍎",
        options: ["Not played","Beginner","Max Level (2550)","Max + Kitsune","Max + Leopard","Max + Dragon","Max + Multiple Top Fruits"],
        hint: "Kitsune & Leopard = rarest 2026 fruits",
      },
      { key: "gamepassCount", label: "Gamepasses Owned", type: "number", placeholder: "e.g. 20", icon: "🎫" },
      { key: "followers", label: "Followers", type: "number", placeholder: "e.g. 500", icon: "👥" },
      { key: "emailLinked", label: "Email Linked / Changeable", type: "toggle", icon: "📧" },
    ],
  },
};;
