"use client";
import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Search, SlidersHorizontal, ChevronDown, X,
  Loader2, ChevronLeft, ChevronRight, Flame, Star
} from "lucide-react";
import { GAMES, CATEGORIES } from "@/lib/data/igmartData";
import { useCurrency } from "@/components/providers/CurrencyProvider";

const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Newest", value: "newest" },
  { label: "Lowest Price", value: "price_asc" },
  { label: "Highest Price", value: "price_desc" },
];

const DELIVERY_OPTIONS = ["Instant", "1 hour", "24 hours", "1-3 days"];
const PAGE_SIZE = 24;

/* ─────────────────────────── Filter Panel ─────────────────────────── */
function FilterPanel({
  search, setSearch,
  deliveries, setDeliveries,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  onClose,
}: {
  search: string; setSearch: (v: string) => void;
  deliveries: string[]; setDeliveries: (v: string[]) => void;
  minPrice: string; setMinPrice: (v: string) => void;
  maxPrice: string; setMaxPrice: (v: string) => void;
  onClose?: () => void;
}) {
  const toggleDelivery = (d: string) =>
    setDeliveries(deliveries.includes(d) ? deliveries.filter((x) => x !== d) : [...deliveries, d]);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search listings..."
          className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors min-h-[44px]"
        />
      </div>

      <div>
        <h3 className="text-xs font-black text-text-muted uppercase tracking-widest mb-3">Delivery Speed</h3>
        <div className="flex flex-col gap-2.5">
          {DELIVERY_OPTIONS.map((d) => {
            const checked = deliveries.includes(d);
            return (
              <label key={d} className="flex items-center gap-3 cursor-pointer group">
                <div className={`relative w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${checked ? "bg-primary border-primary" : "bg-background border-border group-hover:border-primary/50"}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggleDelivery(d)} className="absolute opacity-0 inset-0 cursor-pointer" />
                  {checked && (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4.5L4 7.5L10 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-text-muted group-hover:text-text transition-colors">{d}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-border" />

      <div>
        <h3 className="text-xs font-black text-text-muted uppercase tracking-widest mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">$</span>
            <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-7 pr-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors min-h-[44px]" />
          </div>
          <span className="text-text-muted">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">$</span>
            <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-7 pr-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors min-h-[44px]" />
          </div>
        </div>
      </div>

      <button
        onClick={() => { setSearch(""); setDeliveries([]); setMinPrice(""); setMaxPrice(""); }}
        className="text-xs font-bold text-text-muted hover:text-primary transition-colors text-left"
      >
        Clear all filters
      </button>

      {onClose && (
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity" style={{ background: "var(--gradient-brand)" }}>
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Game Selector Rail ─────────────────────────── */
function GameRail({
  activeGame,
  setActiveGame,
}: {
  activeGame: string | null;
  setActiveGame: (slug: string | null) => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
      {/* All Games pill */}
      <button
        onClick={() => setActiveGame(null)}
        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
          activeGame === null
            ? "bg-primary text-white border-primary shadow-md shadow-primary/25"
            : "bg-card text-text-muted border-border hover:border-primary/40 hover:text-text"
        }`}
      >
        🎮 All Games
      </button>

      {GAMES.map((game) => (
        <button
          key={game.id}
          onClick={() => setActiveGame(game.slug === activeGame ? null : game.slug)}
          className={`flex-shrink-0 flex items-center gap-2.5 rounded-xl border transition-all group overflow-hidden ${
            activeGame === game.slug
              ? "border-primary shadow-md shadow-primary/20"
              : "border-border hover:border-primary/40"
          }`}
          style={{ padding: 0 }}
        >
          {/* Mini poster thumbnail */}
          <div className="relative w-10 h-10 flex-shrink-0 overflow-hidden">
            <Image
              src={game.image}
              alt={game.name}
              fill
              sizes="40px"
              className={`object-cover object-top transition-opacity ${activeGame === game.slug ? "opacity-100" : "opacity-70 group-hover:opacity-90"}`}
            />
          </div>
          <div className="pr-4 text-left">
            <p className={`text-sm font-bold leading-tight transition-colors ${activeGame === game.slug ? "text-primary" : "text-text group-hover:text-primary-hover"}`}>
              {game.name}
            </p>
            <p className="text-[10px] text-text-muted font-medium">{game.listings.toLocaleString()} listings</p>
          </div>
          {activeGame === game.slug && (
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          )}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────── Listing Card ─────────────────────────── */
function ListingGridCard({ listing }: { listing: Record<string, unknown> }) {
  const l = listing as {
    _id: string; title: string; gameName?: string; price: number;
    images?: string[]; deliveryTime?: string; _creationTime: number;
  };
  const { format } = useCurrency();
  const rawImg = l.images?.[0];
  const safeImg = (rawImg && (rawImg.startsWith("http://") || rawImg.startsWith("https://") || rawImg.startsWith("/")))
    ? rawImg
    : "/clash-of-clans-poster.jpg";

  return (
    <Link
      href={`/listing/${l._id}`}
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="aspect-[4/3] bg-elevated relative overflow-hidden">
        {safeImg ? (
          <Image
            src={safeImg}
            alt={l.title}
            fill
            loading="lazy"
            unoptimized={safeImg.startsWith("http")}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover object-top will-change-transform group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎮</div>
        )}
        {/* Game name tag */}
        {l.gameName && (
          <div className="absolute top-2.5 left-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-sm text-primary px-2 py-1 rounded-md border border-primary/30">
              {l.gameName}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm font-bold text-text line-clamp-2 leading-snug group-hover:text-primary-hover transition-colors mb-3">{l.title}</p>
        <div className="flex items-center justify-between">
          <p className="font-heading font-black text-xl text-text">{format(l.price)}</p>
          <span className="text-[10px] bg-elevated text-text-muted font-bold px-2.5 py-1 rounded-full border border-border">
            {l.deliveryTime || "Fast"}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────── Skeleton Card ─────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-elevated" />
      <div className="p-4 space-y-2.5">
        <div className="h-2.5 bg-elevated rounded-full w-1/3" />
        <div className="h-4 bg-elevated rounded-full w-full" />
        <div className="h-4 bg-elevated rounded-full w-2/3" />
        <div className="flex items-center justify-between mt-2">
          <div className="h-6 bg-elevated rounded-full w-1/4" />
          <div className="h-5 bg-elevated rounded-full w-16" />
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────────── Main Page ─────────────────────────── */
export default function MarketplacePage() {
  const [sort, setSort] = useState("recommended");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [deliveries, setDeliveries] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const rawListings = useQuery(api.listings.listActiveListings, { limit: 500 });

  const handleGameSelect = useCallback((slug: string | null) => {
    setActiveGame(slug);
    setPage(1);
  }, []);

  const listings = useMemo(() => {
    if (!rawListings) return [];
    let result = [...rawListings];

    // Game filter
    if (activeGame) {
      const game = GAMES.find(g => g.slug === activeGame);
      if (game) {
        result = result.filter(l =>
          l.gameName?.toLowerCase().includes(game.name.toLowerCase()) ||
          (game.slug === "pubg-mobile" && (l.gameName?.toLowerCase().includes("pubg") || l.gameName?.toLowerCase().includes("bgmi")))
        );
      }
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) => l.title.toLowerCase().includes(q) || l.gameName?.toLowerCase().includes(q)
      );
    }

    // Delivery filter
    if (deliveries.length > 0) {
      result = result.filter((l) => l.deliveryTime && deliveries.some((d) => l.deliveryTime!.toLowerCase().includes(d.toLowerCase())));
    }

    // Price filter
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) result = result.filter((l) => l.price >= min);
    if (!isNaN(max)) result = result.filter((l) => l.price <= max);

    // Sort
    if (sort === "newest") {
      result.sort((a, b) => b._creationTime - a._creationTime);
    } else if (sort === "price_asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "recommended" && !activeGame && !search.trim() && deliveries.length === 0) {
      // Apply 50% CoC quota on the top page
      const cocListings = result.filter(l => l.gameName?.toLowerCase().includes("clash of clans"));
      const otherListings = result.filter(l => !l.gameName?.toLowerCase().includes("clash of clans"));
      
      const mixed = [];
      let cIdx = 0;
      let oIdx = 0;
      
      while (cIdx < cocListings.length || oIdx < otherListings.length) {
        if (mixed.length % 2 === 0) {
          if (cIdx < cocListings.length) mixed.push(cocListings[cIdx++]);
          else if (oIdx < otherListings.length) mixed.push(otherListings[oIdx++]);
        } else {
          if (oIdx < otherListings.length) mixed.push(otherListings[oIdx++]);
          else if (cIdx < cocListings.length) mixed.push(cocListings[cIdx++]);
        }
      }
      result = mixed;
    }

    return result;
  }, [rawListings, activeGame, search, deliveries, minPrice, maxPrice, sort]);

  // Reset page when filters change
  useMemo(() => { setPage(1); }, [search, deliveries, minPrice, maxPrice, sort, activeGame]);

  const totalPages = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = listings.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const activeFilterCount = [search, ...deliveries, minPrice, maxPrice].filter(Boolean).length;

  const activeGameData = activeGame ? GAMES.find(g => g.slug === activeGame) : null;

  return (
    <div className="bg-background min-h-screen pb-20">

      {/* ── Hero / Header ── */}
      <div className="relative overflow-hidden bg-surface border-b border-border">
        {/* Subtle background game art when game is selected */}
        {activeGameData && (
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
            <Image
              src={activeGameData.image}
              alt=""
              fill
              className="object-cover object-top blur-xl scale-110"
              sizes="100vw"
            />
          </div>
        )}
        <div className="container relative z-10 py-8 lg:py-10">
          {/* Eyebrow + Title */}
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">
              {activeGameData ? activeGameData.category : "All Games"} · Accounts Marketplace
            </p>
            <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-text leading-tight">
              {activeGameData ? (
                <>{activeGameData.name} <span className="text-text-muted font-bold">Accounts</span></>
              ) : (
                <>Browse <span className="text-transparent bg-clip-text" style={{ backgroundImage: "var(--gradient-brand)" }}>Gaming Accounts</span></>
              )}
            </h1>
            {activeGameData ? (
              <p className="text-sm text-text-muted mt-1.5">
                {activeGameData.listings.toLocaleString()} listings · {activeGameData.sellers.toLocaleString()} sellers ·{" "}
                <span className="inline-flex items-center gap-1"><Star size={11} className="text-yellow-400 fill-yellow-400" /> {activeGameData.rating}/5.0</span>
              </p>
            ) : (
              <p className="text-sm text-text-muted mt-1.5">
                Verified accounts with escrow protection. Instant delivery available.
              </p>
            )}
          </div>

          {/* Game Rail */}
          <GameRail activeGame={activeGame} setActiveGame={handleGameSelect} />
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="container pt-6">
        {/* Mobile filter/sort bar */}
        <div className="flex items-center gap-2 pb-4 lg:hidden">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-semibold text-text-secondary hover:text-text transition-colors min-h-[44px] relative"
          >
            <SlidersHorizontal size={16} /> Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="relative flex-1">
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="w-full appearance-none bg-card border border-border rounded-xl px-4 py-2.5 pr-9 text-sm font-semibold text-text focus:outline-none focus:border-primary/60 min-h-[44px] cursor-pointer">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0">
            <div className="lg:sticky lg:top-[80px] bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs font-black text-text-muted uppercase tracking-widest">Filters</h2>
                {activeFilterCount > 0 && (
                  <span className="text-[10px] font-black bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <FilterPanel
                search={search} setSearch={setSearch}
                deliveries={deliveries} setDeliveries={setDeliveries}
                minPrice={minPrice} setMinPrice={setMinPrice}
                maxPrice={maxPrice} setMaxPrice={setMaxPrice}
              />

              {/* Browse by game section in sidebar */}
              <div className="mt-8">
                <h3 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Browse by Game</h3>
                <div className="flex flex-col gap-2">
                  {GAMES.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => handleGameSelect(game.slug === activeGame ? null : game.slug)}
                      className={`flex items-center gap-3 w-full rounded-xl p-2.5 text-left transition-all border ${
                        activeGame === game.slug
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "border-transparent hover:bg-elevated hover:border-border text-text-secondary hover:text-text"
                      }`}
                    >
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={game.image} alt={game.name} fill sizes="36px" className="object-cover object-top" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate">{game.name}</p>
                        <p className="text-[10px] text-text-muted font-medium">{game.listings.toLocaleString()} listings</p>
                      </div>
                      {game.popular && <Flame size={13} className="text-orange-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Listings Area */}
          <div className="flex-1 min-w-0">
            {/* Desktop top bar */}
            <div className="hidden lg:flex items-center justify-between gap-4 mb-5">
              <p className="text-sm text-text-muted">
                {rawListings === undefined ? (
                  <span className="inline-flex items-center gap-1.5"><Loader2 size={13} className="animate-spin" /> Loading...</span>
                ) : (
                  <>Showing <strong className="text-text font-bold">{paginated.length}</strong> of <strong className="text-text font-bold">{listings.length}</strong> listings</>
                )}
              </p>
              <div className="relative min-w-[200px]">
                <select value={sort} onChange={(e) => setSort(e.target.value)}
                  className="w-full appearance-none bg-card border border-border rounded-xl px-4 py-2.5 pr-9 text-sm font-semibold text-text focus:outline-none focus:border-primary/60 min-h-[44px] cursor-pointer">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            </div>

            {/* Mobile listing count */}
            <p className="text-sm text-text-muted mb-4 lg:hidden">
              {rawListings === undefined ? "Loading..." : <><strong className="text-text font-bold">{listings.length}</strong> listings</>}
            </p>

            {/* Grid */}
            {rawListings === undefined ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : paginated.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {paginated.map((listing) => (
                  <ListingGridCard key={listing._id} listing={listing as unknown as Record<string, unknown>} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center text-4xl mb-5">🔍</div>
                <p className="font-heading font-bold text-lg text-text mb-2">No listings found</p>
                <p className="text-sm text-text-muted mb-6 max-w-xs">
                  {activeGame ? `No ${activeGameData?.name} listings match your filters.` : "Try adjusting your filters or clearing them."}
                </p>
                <div className="flex gap-3 flex-wrap justify-center">
                  {activeGame && (
                    <button
                      onClick={() => handleGameSelect(null)}
                      className="text-sm font-bold text-primary border border-primary/30 hover:bg-primary/10 px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Show All Games
                    </button>
                  )}
                  <button
                    onClick={() => { setSearch(""); setDeliveries([]); setMinPrice(""); setMaxPrice(""); }}
                    className="text-sm font-bold text-text-secondary border border-border hover:bg-elevated px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-card text-text-muted hover:text-text hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let p: number;
                  if (totalPages <= 7) { p = i + 1; }
                  else if (safePage <= 4) { p = i + 1; if (i === 6) p = totalPages; }
                  else if (safePage >= totalPages - 3) { p = totalPages - 6 + i; }
                  else { const offsets = [-3, -2, -1, 0, 1, 2, 3]; p = safePage + offsets[i]; }
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                        p === safePage ? "bg-primary text-white border border-primary shadow-md shadow-primary/25" : "border border-border bg-card text-text-muted hover:text-text hover:border-primary/40"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-card text-text-muted hover:text-text hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            {totalPages > 1 && (
              <p className="text-center text-xs text-text-muted mt-2">
                Page {safePage} of {totalPages}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[300] lg:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative bg-background rounded-t-2xl border-t border-border p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-lg text-text">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="w-9 h-9 rounded-lg text-text-muted hover:text-text hover:bg-elevated flex items-center justify-center transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Game selector in mobile sheet */}
            <div className="mb-6">
              <h3 className="text-xs font-black text-text-muted uppercase tracking-widest mb-3">Select Game</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleGameSelect(null)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm font-bold transition-all ${
                    activeGame === null ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-text-secondary"
                  }`}
                >
                  🎮 All
                </button>
                {GAMES.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => handleGameSelect(game.slug === activeGame ? null : game.slug)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm font-bold transition-all text-left ${
                      activeGame === game.slug ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-text-secondary"
                    }`}
                  >
                    <div className="relative w-7 h-7 rounded-md overflow-hidden flex-shrink-0">
                      <Image src={game.image} alt={game.name} fill sizes="28px" className="object-cover object-top" />
                    </div>
                    <span className="truncate text-xs">{game.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-border mb-6" />

            <FilterPanel
              search={search} setSearch={setSearch}
              deliveries={deliveries} setDeliveries={setDeliveries}
              minPrice={minPrice} setMinPrice={setMinPrice}
              maxPrice={maxPrice} setMaxPrice={setMaxPrice}
              onClose={() => setMobileFiltersOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
