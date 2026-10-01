// IGMART.STORE — Game Detection & Metadata Resolution Engine
// Resolves actual game names and slugs for all database listings (including legacy IDs where gameName defaulted to 'Game Asset')

export interface DetectedGame {
  name: string;
  slug: string;
  category: string;
  poster: string;
  isDisallowed?: boolean;
}

// Known Convex DB gameId mappings (persisted in patient-squirrel-8)
export const KNOWN_GAME_IDS: Record<string, DetectedGame> = {
  // Clash of Clans
  "jh73ewp978g4821a4pm6aj4pvn8eym6y": {
    name: "Clash of Clans",
    slug: "clash-of-clans",
    category: "Strategy",
    poster: "/clash-of-clans-poster.jpg",
  },
  "jh75zxzzmagaz5xq8593nvehm98ezrm1": {
    name: "Clash of Clans",
    slug: "clash-of-clans",
    category: "Strategy",
    poster: "/clash-of-clans-poster.jpg",
  },

  // Clash Royale
  "jh792n3zjph198n0abgr0w31an8eztvp": {
    name: "Clash Royale",
    slug: "clash-royale",
    category: "Card Battler",
    poster: "/clash-royale-poster.png",
  },
  "jh7ecqt83yj3scn3ecxz0fhrfh8ez4qb": {
    name: "Clash Royale",
    slug: "clash-royale",
    category: "Card Battler",
    poster: "/clash-royale-poster.png",
  },

  // Roblox
  "jh7ec34d48c3nsec6meqtva6rd8ey2j8": {
    name: "Roblox",
    slug: "roblox",
    category: "Sandbox",
    poster: "/roblox-poster.png",
  },
  "jh7dvdhph4c1cfm34sa906md7h8eykz7": {
    name: "Roblox",
    slug: "roblox",
    category: "Sandbox",
    poster: "/roblox-poster.png",
  },

  // Free Fire
  "jh760zsgj871hse5gw6fr02b8h8ezc4v": {
    name: "Free Fire",
    slug: "free-fire",
    category: "Battle Royale",
    poster: "/free-fire-poster.png",
  },
  "jh77phwgqtrh8h8sy7a7qrqp558ez59j": {
    name: "Free Fire",
    slug: "free-fire",
    category: "Battle Royale",
    poster: "/free-fire-poster.png",
  },

  // Disallowed / Deprecated games (PUBG / BGMI)
  "jh78fb0a5y0671ynsrj1dz44a98ez9ky": {
    name: "PUBG Mobile / BGMI",
    slug: "pubg-mobile",
    category: "Battle Royale",
    poster: "/pubg-poster.png",
    isDisallowed: true,
  },
  "jh7f1zgy0v8z7ep35g54zr8nt58ezg01": {
    name: "PUBG Mobile / BGMI",
    slug: "pubg-mobile",
    category: "Battle Royale",
    poster: "/pubg-poster.png",
    isDisallowed: true,
  },
};

/**
 * Accurately detects game identity for any listing by ID, existing name, or text heuristics.
 */
export function detectGameFromListing(listing: {
  gameId?: string;
  gameName?: string;
  gameSlug?: string;
  title?: string;
  description?: string;
}): DetectedGame {
  // 1. Direct gameId match
  if (listing.gameId && KNOWN_GAME_IDS[listing.gameId]) {
    return KNOWN_GAME_IDS[listing.gameId];
  }

  // 2. Direct gameSlug match
  const rawSlug = (listing.gameSlug || "").toLowerCase().trim();
  if (rawSlug) {
    if (rawSlug.includes("clash-of-clans") || rawSlug === "coc") {
      return { name: "Clash of Clans", slug: "clash-of-clans", category: "Strategy", poster: "/clash-of-clans-poster.jpg" };
    }
    if (rawSlug.includes("clash-royale") || rawSlug === "cr") {
      return { name: "Clash Royale", slug: "clash-royale", category: "Card Battler", poster: "/clash-royale-poster.png" };
    }
    if (rawSlug.includes("roblox")) {
      return { name: "Roblox", slug: "roblox", category: "Sandbox", poster: "/roblox-poster.png" };
    }
    if (rawSlug.includes("free-fire") || rawSlug === "freefire") {
      return { name: "Free Fire", slug: "free-fire", category: "Battle Royale", poster: "/free-fire-poster.png" };
    }
    if (rawSlug.includes("pokemon") || rawSlug.includes("pokémon") || rawSlug === "pogo") {
      return { name: "Pokémon GO", slug: "pokemon-go", category: "AR / Adventure", poster: "/pokemon-go-poster.png" };
    }
    if (rawSlug.includes("pubg") || rawSlug.includes("bgmi")) {
      return { name: "PUBG Mobile / BGMI", slug: "pubg-mobile", category: "Battle Royale", poster: "/pubg-poster.png", isDisallowed: true };
    }
  }

  // 3. Meaningful gameName match (not generic 'Game Asset')
  const rawName = (listing.gameName || "").toLowerCase().trim();
  if (rawName && rawName !== "game asset" && rawName !== "unknown") {
    if (rawName.includes("pubg") || rawName.includes("bgmi")) {
      return { name: "PUBG Mobile / BGMI", slug: "pubg-mobile", category: "Battle Royale", poster: "/pubg-poster.png", isDisallowed: true };
    }
    if (rawName.includes("clash of clans") || rawName === "coc") {
      return { name: "Clash of Clans", slug: "clash-of-clans", category: "Strategy", poster: "/clash-of-clans-poster.jpg" };
    }
    if (rawName.includes("clash royale") || rawName === "cr") {
      return { name: "Clash Royale", slug: "clash-royale", category: "Card Battler", poster: "/clash-royale-poster.png" };
    }
    if (rawName.includes("roblox")) {
      return { name: "Roblox", slug: "roblox", category: "Sandbox", poster: "/roblox-poster.png" };
    }
    if (rawName.includes("free fire")) {
      return { name: "Free Fire", slug: "free-fire", category: "Battle Royale", poster: "/free-fire-poster.png" };
    }
    if (rawName.includes("pokemon") || rawName.includes("pokémon") || rawName === "pogo") {
      return { name: "Pokémon GO", slug: "pokemon-go", category: "AR / Adventure", poster: "/pokemon-go-poster.png" };
    }
  }

  // 4. Text-based heuristic detection from title and description
  const text = `${listing.title || ""} ${listing.description || ""}`.toLowerCase();

  // Reject PUBG/BGMI
  if (
    text.includes("pubg") ||
    text.includes("bgmi") ||
    text.includes("glacier m416") ||
    text.includes("m416 glacier") ||
    text.includes("godzilla awm") ||
    text.includes("x-suit") ||
    text.includes("gunlab")
  ) {
    return { name: "PUBG Mobile / BGMI", slug: "pubg-mobile", category: "Battle Royale", poster: "/pubg-poster.png", isDisallowed: true };
  }

  // Clash of Clans (Town Hall, TH14, TH15, TH16, TH17, TH18, Barbarian King, Supercell ID)
  if (
    text.includes("clash of clans") ||
    text.includes("town hall") ||
    /\bth\s*\d+/i.test(text) ||
    text.includes("supercell id") ||
    text.includes("heroes 10") ||
    text.includes("builder base") ||
    text.includes("champion scenery")
  ) {
    return { name: "Clash of Clans", slug: "clash-of-clans", category: "Strategy", poster: "/clash-of-clans-poster.jpg" };
  }

  // Clash Royale (King Tower, KT15, KT16, Evolutions, PEKKA, Trophies & Emotes)
  if (
    text.includes("clash royale") ||
    /\bkt\s*\d+/i.test(text) ||
    text.includes("king tower") ||
    text.includes("evolutions") ||
    text.includes("evo cards") ||
    text.includes("pekka") ||
    (text.includes("trophies") && (text.includes("emotes") || text.includes("deck") || text.includes("cards")))
  ) {
    return { name: "Clash Royale", slug: "clash-royale", category: "Card Battler", poster: "/clash-royale-poster.png" };
  }

  // Roblox (Robux, Blox Fruits, Korblox, RAP, Dominus, Valkyrie)
  if (
    text.includes("roblox") ||
    text.includes("robux") ||
    text.includes("blox fruits") ||
    text.includes("korblox") ||
    text.includes("dominus") ||
    text.includes("valkyrie helm") ||
    (text.includes("rap") && text.includes("veteran"))
  ) {
    return { name: "Roblox", slug: "roblox", category: "Sandbox", poster: "/roblox-poster.png" };
  }

  // Free Fire (Evo Guns, Criminal Top, Thompson, Itadori, Sakura Bundle, Booyah)
  if (
    text.includes("free fire") ||
    text.includes("evo guns") ||
    text.includes("criminal top") ||
    text.includes("cindered thompson") ||
    text.includes("sakura bundle") ||
    text.includes("booyah") ||
    text.includes("garena")
  ) {
    return { name: "Free Fire", slug: "free-fire", category: "Battle Royale", poster: "/free-fire-poster.png" };
  }

  // Pokémon GO (Shundo, Mewtwo, Rayquaza, Stardust, PTC, Armored Mewtwo)
  if (
    text.includes("pokemon") ||
    text.includes("pokémon") ||
    text.includes("shundo") ||
    text.includes("mewtwo") ||
    text.includes("rayquaza") ||
    text.includes("stardust") ||
    text.includes("ptc")
  ) {
    return { name: "Pokémon GO", slug: "pokemon-go", category: "AR / Adventure", poster: "/pokemon-go-poster.png" };
  }

  return {
    name: listing.gameName && listing.gameName !== "Game Asset" ? listing.gameName : "Gaming Account",
    slug: "other",
    category: "Accounts",
    poster: "/clash-of-clans-poster.jpg",
  };
}
