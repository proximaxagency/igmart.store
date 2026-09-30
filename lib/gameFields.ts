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
  tooltip?: string;
  required?: boolean;
}

export const GAME_FIELDS: Record<string, { emoji: string; color: string; fields: GameField[] }> = {
  "clash-of-clans": {
    emoji: "⚔️",
    color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
    fields: [
      {
        key: "currentRank",
        label: "Current Rank",
        type: "select",
        placeholder: "Current Rank",
        icon: "🏆",
        options: ["Current Rank", "Unranked", "Bronze League", "Silver League", "Gold League", "Crystal League", "Master League", "Champion League", "Titan League", "Legends League (5000+ Trophies)"],
      },
      {
        key: "maxedAccount",
        label: "Maxed Account",
        type: "select",
        placeholder: "Maxed Account",
        icon: "⚡",
        options: ["Maxed Account", "No", "Yes - 100% Fully Maxed", "Almost Maxed (90%+)", "Max Heroes Only", "Max Defenses Only", "Rush / Semi-Maxed Base"],
      },
      {
        key: "townHallLevel",
        label: "Town Hall",
        type: "select",
        placeholder: "Town Hall",
        icon: "🏰",
        required: true,
        options: ["Town Hall", "TH18 (Nov 2025)", "TH17", "TH16", "TH15", "TH14", "TH13", "TH12", "TH11", "TH10", "TH9", "TH8", "TH7", "TH6"],
        hint: "TH18 released Nov 2025",
      },
      {
        key: "gems",
        label: "Gems",
        type: "select",
        placeholder: "Gems",
        icon: "💎",
        options: ["Gems", "0 - 500", "500 - 1,000", "1,000 - 2,500", "2,500 - 5,000", "5,000 - 10,000", "10,000 - 25,000", "25,000+"],
      },
      {
        key: "originalEmail",
        label: "Original Email",
        type: "select",
        placeholder: "Select",
        icon: "📧",
        tooltip: "Original Email means you provide the first email address registered with this game account.",
        options: ["Select", "Yes - Full Access Original Email Included", "Yes - Clean Dedicated Email Transferable", "No - Linked to Personal Email", "Supercell ID Email Changeable Instantly"],
      },
      { key: "barbarianKingLevel", label: "Barbarian King Level", type: "number", placeholder: "e.g. 95 (max 95 at TH16)", icon: "👑", hint: "Max 95 at TH16+" },
      { key: "archerQueenLevel", label: "Archer Queen Level", type: "number", placeholder: "e.g. 95 (max 95 at TH16)", icon: "🏹", hint: "Max 95 at TH16+" },
      { key: "grandWardenLevel", label: "Grand Warden Level", type: "number", placeholder: "e.g. 70 (max 70 at TH16)", icon: "📖", hint: "Max 70 at TH16+" },
      { key: "royalChampionLevel", label: "Royal Champion Level", type: "number", placeholder: "e.g. 45 (max 45 at TH16)", icon: "🛡️", hint: "Unlocks at TH13" },
      { key: "minionPrinceLevel", label: "Minion Prince Level", type: "number", placeholder: "e.g. 30", icon: "😈", hint: "Flying hero — unlocks at TH9" },
      { key: "dragonDukeLevel", label: "Dragon Duke Level", type: "number", placeholder: "e.g. 20 (max 20)", icon: "🐉", hint: "New Builder Base flying hero" },
      {
        key: "builderHallLevel", label: "Builder Hall", type: "select", icon: "🔨", placeholder: "Builder Hall",
        options: ["Builder Hall", "BH10", "BH9", "BH8", "BH7", "BH6", "BH5", "BH4"],
      },
      { key: "epicEquipments", label: "Epic Equipment Count", type: "number", placeholder: "e.g. 8", icon: "⚡" },
      {
        key: "supercellIdReady", label: "Supercell ID Transfer Ready", type: "toggle", icon: "✅", required: true,
      },
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
      {
        key: "originalEmail",
        label: "Original Email",
        type: "select",
        placeholder: "Select",
        icon: "📧",
        tooltip: "Whether original creation email is transferred with this account.",
        options: ["Select", "Yes - Original Email Included", "Yes - Clean Dedicated Email Transferable", "No - Personal Email Linked", "Supercell ID Email Changeable"],
      },
      { key: "supercellIdReady", label: "Supercell ID Transfer Ready", type: "toggle", icon: "✅", required: true },
    ],
  },

  "free-fire": {
    emoji: "🔥",
    color: "from-red-500/20 to-orange-500/10 border-red-500/30",
    fields: [
      {
        key: "rank", label: "Current Rank", type: "select", icon: "🏆", required: true, placeholder: "Current Rank",
        options: ["Current Rank", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Heroic", "Grand Master"],
      },
      { key: "accountLevel", label: "Account Level", type: "number", placeholder: "e.g. 80", icon: "📊", required: true },
      {
        key: "csRank", label: "Clash Squad Rank", type: "select", icon: "⚔️", placeholder: "CS Rank",
        options: ["CS Rank", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Heroic", "Grand Master"],
      },
      { key: "diamonds", label: "Diamonds", type: "number", placeholder: "e.g. 5000", icon: "💎" },
      { key: "skins", label: "Legendary Gun Skins", type: "number", placeholder: "e.g. 25", icon: "🎨" },
      { key: "evoGuns", label: "Evo Gun Skins (Maxed)", type: "number", placeholder: "e.g. 12", icon: "🔫", hint: "Maxed Evo guns = high value" },
      {
        key: "topCharacters", label: "Key Characters Owned", type: "select", icon: "🧑‍🤝‍🧑",
        options: ["Alok", "Chrono", "Kassie", "Dimitri", "Skyler", "All S-Tier (Alok+Chrono+Kassie+Dimitri)", "Full Roster"],
      },
      {
        key: "originalEmail",
        label: "Original Email",
        type: "select",
        placeholder: "Select",
        icon: "📧",
        tooltip: "Original login creation email account status.",
        options: ["Select", "Yes - Original Email Included", "Yes - Clean Google/Facebook Account", "Guest Account / Fully Unbound"],
      },
      {
        key: "region", label: "Account Region", type: "select", icon: "🌍",
        options: ["India", "SEA", "MENA", "BR/LATN", "North America", "Europe", "Other"],
      },
      { key: "bindingRemoved", label: "Binding Removable / Guest Account", type: "toggle", icon: "🔓" },
    ],
  },

  "pokemon-go": {
    emoji: "⚡",
    color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
    fields: [
      {
        key: "trainerLevel", label: "Trainer Level", type: "select", icon: "⭐", required: true,
        options: ["Trainer Level", "Level 50 (MAX)", "Level 49", "Level 48", "Level 47", "Level 46", "Level 45+", "Level 40-44", "Level 35-39", "Level 30-34"],
      },
      {
        key: "team", label: "Team", type: "select", icon: "🛡️", required: true,
        options: ["Team", "Mystic (Blue)", "Valor (Red)", "Instinct (Yellow)", "Team Medallion Available (Changeable)"],
      },
      { key: "stardust", label: "Stardust Balance", type: "number", placeholder: "e.g. 5000000", icon: "✨" },
      {
        key: "shinyCount", label: "Shiny Pokémon Count", type: "number", placeholder: "e.g. 350", icon: "🌟",
      },
      { key: "legendaryCount", label: "Legendary & Mythical Count", type: "number", placeholder: "e.g. 220", icon: "🐉" },
      { key: "hundoCount", label: "100% IV (Hundo) Count", type: "number", placeholder: "e.g. 45", icon: "💯" },
      {
        key: "originalEmail",
        label: "Original Email",
        type: "select",
        placeholder: "Select",
        icon: "📧",
        tooltip: "Status of the email account used to register the Pokémon GO or PTC account.",
        options: ["Select", "Yes - Full Access PTC / Original Email Included", "Yes - Clean Gmail Linked", "Email Changeable on PTC"],
      },
      {
        key: "loginType", label: "Login Type", type: "select", icon: "🔐", required: true,
        options: ["Pokémon Trainer Club (PTC)", "Google Account", "Facebook", "Apple ID"],
      },
      { key: "nameChangeAvailable", label: "Name Change Available", type: "toggle", icon: "✏️" },
    ],
  },

  "roblox": {
    emoji: "🧱",
    color: "from-sky-500/20 to-blue-500/10 border-sky-500/30",
    fields: [
      { key: "accountAge", label: "Account Age (years)", type: "number", placeholder: "e.g. 8 (2016 = 10yr)", icon: "📅", required: true },
      { key: "robux", label: "Robux Balance", type: "number", placeholder: "e.g. 10000", icon: "💰" },
      { key: "premiumActive", label: "Roblox Premium Active", type: "toggle", icon: "⭐" },
      { key: "rap", label: "RAP (Recent Avg. Price of Limiteds)", type: "number", placeholder: "e.g. 50000", icon: "📊" },
      {
        key: "originalEmail",
        label: "Original Email",
        type: "select",
        placeholder: "Select",
        icon: "📧",
        tooltip: "Whether original registration email is included or unverified.",
        options: ["Select", "Yes - Original Email Included", "Unverified / No Email Ever Linked", "Clean Email Changeable"],
      },
      {
        key: "bloxFruitsProgress", label: "Blox Fruits Progress", type: "select", icon: "🍎",
        options: ["Not played", "Beginner", "Max Level (2550)", "Max + Kitsune", "Max + Leopard", "Max + Dragon", "Max + Multiple Top Fruits"],
      },
      { key: "emailLinked", label: "Email Linked / Changeable", type: "toggle", icon: "📧" },
    ],
  },
};;
