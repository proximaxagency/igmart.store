"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Stars, EmptyState } from "@/components/ui/index";
import { ListingCard } from "@/components/shared/ListingCard";
import { Loader2, SlidersHorizontal, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";

import { GAMES, POKEMON_LISTINGS } from "@/lib/data/igmartData";
import { detectGameFromListing } from "@/lib/gameDetection";
import { useGameVisibility } from "@/lib/gamesVisibility";

const ITEMS_PER_PAGE = 15;

function getNormalizedSlug(slug: string) {
  // Normalize spaces → hyphens (handles accidental URLs like /games/free fire)
  const cleaned = (slug || "").replace(/%20/g, "-").replace(/\s+/g, "-").toLowerCase();
  if (
    cleaned === "pokemon-go" ||
    cleaned === "pokemongo" ||
    cleaned === "pokimon-go" ||
    cleaned === "pokimon" ||
    cleaned === "pogo"
  ) {
    return "pokemon-go";
  }
  if (cleaned === "free-fire" || cleaned === "freefire") return "free-fire";
  if (cleaned === "clash-of-clans" || cleaned === "coc") return "clash-of-clans";
  if (cleaned === "clash-royale" || cleaned === "cr") return "clash-royale";
  if (cleaned === "roblox") return "roblox";
  return cleaned;
}

export default function GameDetailPage() {
  const params = useParams();
  const rawSlug = (params?.slug as string) ?? "";
  const normalizedSlug = getNormalizedSlug(rawSlug);
  const { isGameVisible, isLoaded } = useGameVisibility();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recommended");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Load all games from Convex
  const games = useQuery(api.listings.getGames);
  // Load all active listings from Convex
  const allListings = useQuery(api.listings.listActiveListings, { limit: 1000 });

  const game = useMemo(() => {
    // Explicitly reject any PUBG or BGMI slugs
    if (normalizedSlug.includes("pubg") || normalizedSlug.includes("bgmi")) {
      return null;
    }
    if (games && games.length > 0) {
      const mappedGames = games.map((g) => {
        const s = (g.slug || "").toLowerCase();
        const n = (g.name || "").toLowerCase();
        if (s.includes("pubg") || s.includes("bgmi") || n.includes("pubg") || n.includes("bgmi")) {
          return {
            ...g,
            name: "Pokémon GO",
            slug: "pokemon-go",
            category: "AR / Adventure",
            imageUrl: "/pokemon-go-poster.png",
            isPopular: true,
            isActive: true,
          };
        }
        return g;
      });
      const match = mappedGames.find((g) => g.slug === normalizedSlug && !g.slug.includes("pubg") && !g.slug.includes("bgmi"));
      if (match) return match;
    }
    // Fallback to static GAMES if not in Convex
    const local = GAMES.find((g) => g.slug === normalizedSlug);
    if (local) {
      return {
        _id: local.id as any,
        name: local.name,
        slug: local.slug,
        category: local.category,
        imageUrl: local.image,
        isActive: true,
        isPopular: local.popular,
        metrics: {
          activeListings: local.listings,
          totalSellers: local.sellers,
          rating: local.rating,
        },
      };
    }
    return null;
  }, [games, normalizedSlug]);

  const gameListings = useMemo(() => {
    if (!game) return [];
    let filtered: any[] = [];
    if (allListings && allListings.length > 0) {
      filtered = allListings.filter((l) => {
        const detected = detectGameFromListing(l);
        if (detected.isDisallowed) return false;
        return (
          detected.slug === normalizedSlug ||
          detected.name.toLowerCase() === game.name.toLowerCase() ||
          (l.gameName && l.gameName.toLowerCase().includes(game.name.toLowerCase()))
        );
      });
    }
    if (filtered.length === 0 && (normalizedSlug === "pokemon-go" || game.slug === "pokemon-go")) {
      filtered = POKEMON_LISTINGS;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((l) => l.title.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q));
    }
    if (minPrice && !isNaN(Number(minPrice))) {
      filtered = filtered.filter((l) => l.price >= Number(minPrice));
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      filtered = filtered.filter((l) => l.price <= Number(maxPrice));
    }
    if (sort === "price_asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
    else if (sort === "newest") filtered = [...filtered].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    else filtered = [...filtered].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    return filtered;
  }, [allListings, game, search, sort, minPrice, maxPrice]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sort, minPrice, maxPrice, normalizedSlug]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(gameListings.length / ITEMS_PER_PAGE));
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return gameListings.slice(start, start + ITEMS_PER_PAGE);
  }, [gameListings, currentPage]);

  // Loading
  if (games === undefined || allListings === undefined) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="animate-spin text-primary" />
          <p className="text-text-muted font-semibold text-sm">Loading game…</p>
        </div>
      </div>
    );
  }

  // Temporarily paused/hidden game by admin
  if (isLoaded && !isGameVisible(normalizedSlug)) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <SlidersHorizontal size={30} />
        </div>
        <h1 className="font-heading font-black text-2xl text-text">Game Catalog Temporarily Offline</h1>
        <p className="text-text-muted max-w-md text-sm">
          Trading for this game is temporarily paused by marketplace administration. All existing seller accounts and orders remain completely safe and preserved.
        </p>
        <div className="flex gap-3">
          <Link href="/games" className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors">
            Browse Active Games
          </Link>
          <Link href="/marketplace" className="px-5 py-2.5 rounded-xl border border-border text-text font-semibold text-sm hover:border-primary/50 transition-colors">
            All Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Not found
  if (!game) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="text-7xl font-black text-border">404</div>
        <h1 className="font-heading font-black text-2xl text-text">Game Not Found</h1>
        <p className="text-text-muted max-w-sm">
          This game is not available or could not be found. Browse all available games below.
        </p>
        <div className="flex gap-3">
          <Link href="/" className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors">
            Return Home
          </Link>
          <Link href="/marketplace" className="px-5 py-2.5 rounded-xl border border-border text-text font-semibold text-sm hover:border-primary/50 transition-colors">
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const posterSrc = game.imageUrl ?? "/clash-of-clans-poster.jpg";
  const listingCount = gameListings.length > 0 ? gameListings.length : (game.metrics?.activeListings ?? 0);
  const sellerCount = game.metrics?.totalSellers ?? 0;
  const rating = game.metrics?.rating ?? 4.9;

  const startIdx = gameListings.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, gameListings.length);

  return (
    <div className="bg-background min-h-screen pb-16">
      {/* Game Hero */}
      <div className="relative h-[280px] sm:h-[320px] lg:h-[360px] flex items-end pb-8 sm:pb-12 border-b border-border">
        <Image
          src={posterSrc}
          alt={game.name}
          fill
          sizes="100vw"
          priority
          unoptimized
          className="object-cover object-top z-0 opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-[1]" />

        <div className="container relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <Link href="/marketplace" className="text-text-muted text-xs sm:text-sm font-semibold hover:text-text transition-colors">Marketplace</Link>
            <span className="text-border-strong">/</span>
            <span className="text-text text-xs sm:text-sm font-bold">{game.name}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-text">
              {game.name} Marketplace
            </h1>
            <Link
              href={`/marketplace?game=${game.slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-primary/40 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all w-fit shadow-sm"
            >
              <span>View in All Marketplace</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4">
            {[
              { label: "ACTIVE LISTINGS", val: listingCount.toLocaleString() },
              { label: "VERIFIED SELLERS", val: sellerCount.toLocaleString() },
              { label: "AVERAGE RATING", val: rating, isRating: true },
            ].map((stat, idx) => (
              <div key={idx} className="bg-surface/80 border border-border/80 px-4 py-3 rounded-xl backdrop-blur-md min-w-[140px]">
                <p className="text-[10px] sm:text-xs text-text-muted font-bold tracking-wider uppercase mb-1">{stat.label}</p>
                {stat.isRating ? (
                  <div className="flex items-center gap-2">
                    <p className="font-heading font-black text-xl text-text">{stat.val}</p>
                    <Stars rating={Number(stat.val)} size={14} />
                  </div>
                ) : (
                  <p className="font-heading font-black text-xl text-text">{stat.val}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters */}
          <div className="w-full lg:w-[280px] flex-shrink-0">
            <div className="lg:sticky lg:top-[100px] flex flex-col gap-6">
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <h3 className="font-heading font-bold text-lg text-text mb-4">Filters</h3>

                {/* Search */}
                <div className="relative mb-4">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search listings…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2.5 text-sm font-medium text-text placeholder:text-text-muted focus:outline-none focus:border-primary-hover transition-colors"
                  />
                </div>

                <div className="h-px bg-border my-4" />

                <h3 className="font-heading font-bold text-base text-text mb-3">Price Range</h3>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg pl-7 pr-3 py-2.5 text-sm font-medium text-text placeholder:text-text-muted focus:outline-none focus:border-primary-hover transition-colors min-h-[44px]"
                    />
                  </div>
                  <span className="text-text-muted font-bold">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg pl-7 pr-3 py-2.5 text-sm font-medium text-text placeholder:text-text-muted focus:outline-none focus:border-primary-hover transition-colors min-h-[44px]"
                    />
                  </div>
                </div>

                {(search || minPrice || maxPrice) && (
                  <button
                    onClick={() => { setSearch(""); setMinPrice(""); setMaxPrice(""); }}
                    className="mt-4 w-full text-xs font-semibold text-primary hover:underline text-center"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-sm font-semibold text-text-secondary">
                Showing <strong className="text-text font-bold">{startIdx}–{endIdx}</strong> of <strong className="text-text font-bold">{gameListings.length}</strong> listings
                {totalPages > 1 && (
                  <span className="text-text-muted text-xs ml-2">(Page {currentPage} of {totalPages})</span>
                )}
              </p>
              <div className="relative min-w-[200px]">
                <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full appearance-none bg-card border border-border rounded-lg pl-8 pr-10 py-2.5 text-sm font-semibold text-text focus:outline-none focus:border-primary-hover min-h-[44px] cursor-pointer"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_asc">Lowest Price</option>
                  <option value="price_desc">Highest Price</option>
                  <option value="newest">Newest</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            {paginatedListings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {paginatedListings.map((listing) => (
                    <ListingCard
                      key={listing._id}
                      id={listing._id}
                      title={listing.title}
                      game={detectGameFromListing(listing).name || game.name}
                      price={listing.price}
                      originalPrice={listing.originalPrice}
                      seller={(listing as any).sellerName ?? "Verified Seller"}
                      rating={5}
                      reviews={0}
                      delivery={listing.deliveryTime ?? "Instant"}
                      image={listing.images?.[0] ?? posterSrc}
                      badge={listing.badge}
                    />
                  ))}
                </div>

                {/* Pagination Controls (15 per page) */}
                {totalPages > 1 && (
                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
                    <p className="text-xs text-text-muted font-medium">
                      Page {currentPage} of {totalPages} ({gameListings.length} accounts available)
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-card text-xs font-bold text-text disabled:opacity-40 disabled:pointer-events-none hover:border-primary/50 transition-colors"
                      >
                        <ChevronLeft size={14} /> Previous
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 300, behavior: "smooth" });
                          }}
                          className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${
                            currentPage === pageNum
                              ? "bg-primary text-white shadow-md shadow-primary/20"
                              : "bg-card border border-border text-text-muted hover:text-text hover:border-primary/30"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-card text-xs font-bold text-text disabled:opacity-40 disabled:pointer-events-none hover:border-primary/50 transition-colors"
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-8">
                <EmptyState
                  icon="🎮"
                  title={search ? "No results found" : "No listings yet"}
                  description={search ? `No listings match "${search}". Try a different search.` : "Check back soon — new listings are added daily."}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
