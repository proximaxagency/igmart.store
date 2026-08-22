"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Loader2, UploadCloud, ChevronRight, Gamepad2, Shield, Star,
  Swords, Gem, Trophy, Zap, Flame, Package, Lock, Eye, EyeOff
} from "lucide-react";
import { ImageUploader } from "@/components/shared/ImageUploader";

// ─── Game-specific field configs ───────────────────────────────────────────
type FieldType = "text" | "number" | "select" | "toggle" | "level";

interface GameField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  icon?: string;
  hint?: string;
  required?: boolean;
}

const GAME_FIELDS: Record<string, { emoji: string; color: string; fields: GameField[] }> = {
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
      { key: "minionPrinceLevel", label: "Minion Prince Level", type: "number", placeholder: "e.g. 30 (max 30 at TH17)", icon: "😈", hint: "New! Unlocks at TH17" },
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
};


export default function CreateListingPage() {
  const router = useRouter();
  
  const games = useQuery(api.listings.getGames);
  const categories = useQuery(api.listings.getCategories);
  const createListing = useMutation(api.listings.createListing);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    gameId: "" as Id<"games"> | "",
    categoryId: "" as Id<"categories"> | "",
    deliveryMethod: "manual" as "automatic" | "manual" | "coordinate",
    deliveryTime: "24 hours",
    autoDeliveryData: "",
  });

  const [gameDetails, setGameDetails] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const selectedGame = useMemo(() => {
    if (!formData.gameId || !games) return null;
    return games.find(g => g._id === formData.gameId) || null;
  }, [formData.gameId, games]);

  const gameConfig = useMemo(() => {
    if (!selectedGame) return null;
    const slug = selectedGame.slug === "bgmi" || selectedGame.slug === "pubg-global" ? "pubg-mobile" : selectedGame.slug;
    return GAME_FIELDS[slug] || null;
  }, [selectedGame]);

  const handleGameChange = (gameId: string) => {
    setFormData({ ...formData, gameId: gameId as any });
    setGameDetails({}); // reset details when game changes
  };

  const handleDetailChange = (key: string, value: any) => {
    setGameDetails(prev => ({ ...prev, [key]: value }));
  };

  // Auto-generate title from game details
  const autoTitle = useMemo(() => {
    if (!selectedGame) return "";
    const g = gameDetails;
    const slug = selectedGame.slug;

    if (slug === "clash-of-clans" && g.townHallLevel) {
      const heroes = [
        g.barbarianKingLevel && `BK${g.barbarianKingLevel}`,
        g.archerQueenLevel && `AQ${g.archerQueenLevel}`,
        g.grandWardenLevel && `GW${g.grandWardenLevel}`,
        g.royalChampionLevel && `RC${g.royalChampionLevel}`,
        g.minionPrinceLevel && `MP${g.minionPrinceLevel}`,
      ].filter(Boolean).join("/");
      const extras = [
        g.dragonDukeLevel && `Dragon Duke Lv${g.dragonDukeLevel}`,
        g.gems && `${g.gems} Gems`,
        g.epicEquipments && `${g.epicEquipments} Epic Equip`,
      ].filter(Boolean).join(" · ");
      return `${g.townHallLevel} Clash of Clans Account${heroes ? " — " + heroes + " Heroes" : ""}${extras ? " · " + extras : ""}`;
    }
    if (slug === "free-fire" && g.rank) {
      return `FF ${g.rank} Account — Lv.${g.accountLevel || "?"} ${g.diamonds ? "· " + g.diamonds + " Diamonds" : ""}${g.evoGuns ? " · " + g.evoGuns + " Evo Guns" : ""}${g.topCharacters ? " · " + g.topCharacters.split(" ")[0] : ""}`;
    }
    if ((slug === "pubg-mobile" || slug === "bgmi" || slug === "pubg-global") && g.tier) {
      const prefix = g.version ? g.version.split(" ")[0] : "PUBG/BGMI";
      const glacier = g.glacierM416Level && g.glacierM416Level !== "Not owned" ? ` · M416 Glacier ${g.glacierM416Level}` : "";
      return `${prefix} ${g.tier} — ${g.uc ? g.uc + " UC" : ""}${g.xSuits ? " · " + g.xSuits + " X-Suits" : ""}${glacier}${g.outfits ? " · " + g.outfits + " Outfits" : ""}`;
    }
    if (slug === "roblox" && g.accountAge) {
      const limiteds = g.topLimiteds && g.topLimiteds !== "None" ? " · " + g.topLimiteds : (g.limiteds ? " · " + g.limiteds + " Limiteds" : "");
      const blox = g.bloxFruitsProgress && g.bloxFruitsProgress !== "Not played" ? " · Blox Fruits " + g.bloxFruitsProgress.split("(")[0].trim() : "";
      return `Roblox Account — ${g.accountAge}yr Old${g.robux ? " · " + g.robux + " Robux" : ""}${g.premiumActive ? " · Premium" : ""}${limiteds}${blox}`;
    }
    if (slug === "clash-royale" && g.kingLevel) {
      const evo = g.evolutionsUnlocked ? ` · ${g.evolutionsUnlocked} Evos` : "";
      const hero = g.heroCards && g.heroCards !== "None" ? ` · ${g.heroCards}` : "";
      return `Clash Royale KL${g.kingLevel} — ${g.trophies ? g.trophies + " Trophies" : ""}${evo}${hero}${g.legendaryCards ? " · " + g.legendaryCards + " Legendaries" : ""}`;
    }
    return `${selectedGame.name} Account`;
  }, [selectedGame, gameDetails]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.gameId || !formData.categoryId) return;
    
    const finalTitle = formData.title || autoTitle;
    if (!finalTitle || !formData.price) return;
    
    setIsSubmitting(true);
    try {
      await createListing({
        title: finalTitle,
        description: formData.description || buildAutoDescription(selectedGame?.slug || "", gameDetails),
        price: parseFloat(formData.price),
        gameId: formData.gameId as Id<"games">,
        categoryId: formData.categoryId as Id<"categories">,
        deliveryMethod: formData.deliveryMethod,
        deliveryTime: formData.deliveryTime,
        autoDeliveryData: formData.autoDeliveryData || undefined,
        images: uploadedImages.length > 0 ? uploadedImages : [selectedGame?.imageUrl ?? "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800"],
        attributes: Object.keys(gameDetails).length > 0 ? gameDetails : undefined,
      });
      router.push("/seller/dashboard");
    } catch (error) {
      console.error("Failed to create listing:", error);
      alert("Failed to create listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full bg-background border border-border rounded-xl px-4 py-3 text-text text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-text-muted/60";
  const labelCls = "block text-sm font-semibold text-text mb-1.5";

  return (
    <div className="container max-w-3xl py-8 sm:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Package size={20} />
          </div>
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-text">Create a New Listing</h1>
            <p className="text-text-muted text-sm">Fill in the details to attract buyers fast</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── STEP 1: Game & Category ── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-elevated/40 flex items-center gap-2">
            <Gamepad2 size={18} className="text-primary" />
            <h2 className="font-heading font-bold text-base text-text">Select Game & Category</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Game <span className="text-danger">*</span></label>
              <select
                value={formData.gameId}
                onChange={(e) => handleGameChange(e.target.value)}
                required
                className={inputCls}
              >
                <option value="">Select a game...</option>
                {games?.map(g => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Category <span className="text-danger">*</span></label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value as any })}
                required
                className={inputCls}
              >
                <option value="">Select a category...</option>
                {categories?.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── STEP 2: Game-Specific Details ── */}
        {gameConfig && (
          <div className={`bg-card border rounded-2xl overflow-hidden bg-gradient-to-br ${gameConfig.color}`}>
            <div className="px-6 py-4 border-b border-border/50 flex items-center gap-2">
              <span className="text-xl">{gameConfig.emoji}</span>
              <h2 className="font-heading font-bold text-base text-text">
                {selectedGame?.name} — Account Details
              </h2>
              <span className="ml-auto text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                Auto-fills title
              </span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {gameConfig.fields.map((field) => (
                  <div key={field.key} className={field.type === "toggle" ? "sm:col-span-1" : ""}>
                    <label className={labelCls}>
                      <span className="mr-1.5">{field.icon}</span>
                      {field.label}
                      {field.required && <span className="text-danger ml-1">*</span>}
                    </label>

                    {field.type === "toggle" ? (
                      <button
                        type="button"
                        onClick={() => handleDetailChange(field.key, !gameDetails[field.key])}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                          gameDetails[field.key]
                            ? "bg-success/10 border-success/40 text-success"
                            : "bg-background border-border text-text-muted"
                        }`}
                      >
                        <div className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${gameDetails[field.key] ? "bg-success" : "bg-border"}`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${gameDetails[field.key] ? "left-5" : "left-0.5"}`} />
                        </div>
                        {gameDetails[field.key] ? "Yes" : "No"}
                      </button>
                    ) : field.type === "select" ? (
                      <select
                        value={gameDetails[field.key] || ""}
                        onChange={(e) => handleDetailChange(field.key, e.target.value)}
                        required={field.required}
                        className={inputCls}
                      >
                        <option value="">Select...</option>
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        min={field.type === "number" ? 0 : undefined}
                        placeholder={field.placeholder}
                        required={field.required}
                        value={gameDetails[field.key] || ""}
                        onChange={(e) => handleDetailChange(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)}
                        className={inputCls}
                      />
                    )}
                    {field.hint && (
                      <p className="text-[11px] text-text-muted mt-1">{field.hint}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Auto-generated title preview */}
              {autoTitle && (
                <div className="mt-5 p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-2">
                  <Zap size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-0.5">Auto-Generated Title Preview</p>
                    <p className="text-sm font-semibold text-text">{autoTitle}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: Listing Info ── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-elevated/40 flex items-center gap-2">
            <Star size={18} className="text-primary" />
            <h2 className="font-heading font-bold text-base text-text">Listing Details</h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className={labelCls}>
                Listing Title
                {autoTitle && <span className="ml-2 text-xs font-medium text-text-muted">(leave blank to use auto-generated)</span>}
              </label>
              <input
                type="text"
                placeholder={autoTitle || "e.g. Max Level Account with Rare Skins"}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Description <span className="text-danger">*</span></label>
              <textarea
                required
                rows={5}
                placeholder="Describe the account, item, or service in detail. Include any special features, what makes it unique, warranty/support info, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`${inputCls} resize-y`}
              />
            </div>

            <div>
              <label className={labelCls}>Price (USD) <span className="text-danger">*</span></label>
              <div className="relative max-w-[200px]">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold text-sm">$</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className={`${inputCls} pl-8`}
                />
              </div>
              {formData.price && (
                <p className="text-xs text-text-muted mt-1.5">
                  You receive <span className="font-bold text-success">${(parseFloat(formData.price) * 0.87).toFixed(2)}</span> after 13% platform fee
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── STEP 4: Delivery ── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-elevated/40 flex items-center gap-2">
            <Zap size={18} className="text-primary" />
            <h2 className="font-heading font-bold text-base text-text">Delivery Settings</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Delivery Method</label>
                <select
                  value={formData.deliveryMethod}
                  onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value as any })}
                  className={inputCls}
                >
                  <option value="manual">Manual Transfer (via Chat)</option>
                  <option value="automatic">Automatic Delivery (Instant)</option>
                  <option value="coordinate">Coordinate with Buyer</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Delivery Timeframe</label>
                <select
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                  className={inputCls}
                >
                  <option value="Instant">Instant</option>
                  <option value="1 hour">Within 1 hour</option>
                  <option value="24 hours">Within 24 hours</option>
                  <option value="1-3 days">1 - 3 days</option>
                </select>
              </div>
            </div>

            {formData.deliveryMethod === "automatic" && (
              <div>
                <label className={labelCls}>
                  <Lock size={13} className="inline mr-1" />
                  Automatic Delivery Data
                  <span className="ml-2 text-xs font-bold bg-success/15 text-success px-2 py-0.5 rounded-full">🔒 Encrypted</span>
                </label>
                <p className="text-xs text-text-muted mb-3">
                  This is revealed to the buyer ONLY after confirmed payment. Never visible until then.
                </p>
                <div className="relative">
                  <textarea
                    required
                    rows={3}
                    placeholder={"Email: player@example.com\nPassword: YourPass123\nNote: Linked to Gmail — ready to change"}
                    value={formData.autoDeliveryData}
                    onChange={(e) => setFormData({ ...formData, autoDeliveryData: e.target.value })}
                    className={`${inputCls} resize-y font-mono text-sm`}
                    style={{ filter: showPassword ? "none" : "blur(4px)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-3 right-3 text-text-muted hover:text-text transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {!showPassword && formData.autoDeliveryData && (
                  <p className="text-xs text-text-muted mt-1">Click 👁️ to preview your delivery data</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── STEP 5: Media ── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-elevated/40 flex items-center gap-2">
            <UploadCloud size={18} className="text-primary" />
            <h2 className="font-heading font-bold text-base text-text">Screenshots & Media</h2>
            <span className="ml-auto text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">Live Upload</span>
          </div>
          <div className="p-6">
            <ImageUploader
              value={uploadedImages}
              onChange={setUploadedImages}
              maxImages={5}
              label="Account Screenshots"
            />
            <p className="text-xs text-text-muted mt-3">
              💡 Listings with screenshots get <strong>3× more buyers</strong>. Upload up to 5 images — drag & drop supported.
            </p>
          </div>
        </div>

        {/* ── Submit ── */}
        <div className="flex items-center justify-between pt-2 pb-6">
          <p className="text-xs text-text-muted">
            By publishing, you agree to our{" "}
            <a href="/legal/terms" className="text-primary hover:underline">Seller Terms</a>
          </p>
          <button
            type="submit"
            disabled={isSubmitting || !games || !categories}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/25 text-sm cursor-pointer"
          >
            {isSubmitting ? (
              <><Loader2 size={17} className="animate-spin" /> Publishing...</>
            ) : (
              <><Flame size={17} /> Publish Listing</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function buildAutoDescription(slug: string, details: Record<string, any>): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(details)) {
    if (value === undefined || value === "" || value === 0) continue;
    const label = key.replace(/([A-Z])/g, " $1").trim();
    lines.push(`• ${label}: ${typeof value === "boolean" ? (value ? "Yes" : "No") : value}`);
  }
  return lines.join("\n") || "Premium gaming account for sale. Contact for more details.";
}
