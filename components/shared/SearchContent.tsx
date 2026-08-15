"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo, useTransition, useEffect } from "react";
import Link from "next/link";
import { Search, Loader2, Package, Gamepad2, SlidersHorizontal, X } from "lucide-react";
import { GAMES } from "@/lib/data/igmartData";
import { GameCard } from "@/components/shared/GameCard";

export function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const query = searchParams.get("q") || "";
  const tab = searchParams.get("tab") || "listings";
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => { setLocalQuery(query); }, [query]);

  // Live listings from Convex
  const listings = useQuery(api.listings.listActiveListings, { limit: 100 });

  const filteredListings = useMemo(() => {
    if (!listings) return [];
    if (!query.trim()) return listings;
    const q = query.toLowerCase();
    return listings.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.gameName?.toLowerCase().includes(q)
    );
  }, [listings, query]);

  const filteredGames = useMemo(() => {
    if (!query.trim()) return GAMES;
    const q = query.toLowerCase();
    return GAMES.filter(
      (g) => g.name.toLowerCase().includes(q) || g.category?.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(localQuery.trim())}&tab=${tab}`);
    });
  };

  const setTab = (t: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}&tab=${t}`);
  };

  return (
    <>
      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-8 max-w-2xl mx-auto">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search game accounts, items, coins..."
            className="w-full bg-card border border-border rounded-2xl pl-11 pr-12 py-4 text-text text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
          />
          {localQuery && (
            <button
              type="button"
              onClick={() => { setLocalQuery(""); router.push("/search"); }}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
          >
            Go
          </button>
        </div>
      </form>

      {/* Heading */}
      <div className="mb-8">
        {query ? (
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-text">
              Results for <span className="text-primary">"{query}"</span>
            </h1>
            <p className="text-text-muted text-sm mt-1">
              {filteredListings.length} listing{filteredListings.length !== 1 ? "s" : ""} · {filteredGames.length} game{filteredGames.length !== 1 ? "s" : ""}
            </p>
          </div>
        ) : (
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-text">Browse Everything</h1>
            <p className="text-text-muted text-sm mt-1">Explore all active listings on IGMART</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-8 overflow-x-auto">
        {[
          { id: "listings", label: "Listings", count: filteredListings.length, icon: <Package size={14} /> },
          { id: "games", label: "Games", count: filteredGames.length, icon: <Gamepad2 size={14} /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-6 py-3.5 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id
                ? "text-text border-primary"
                : "text-text-muted border-transparent hover:text-text"
            }`}
          >
            {t.icon} {t.label}
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
              tab === t.id ? "bg-primary/20 text-primary" : "bg-surface text-text-muted border border-border"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Listings Tab */}
      {tab === "listings" && (
        <div>
          {listings === undefined ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredListings.map((listing) => (
                <Link
                  key={listing._id}
                  href={`/listing/${listing._id}`}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all"
                >
                  <div className="aspect-[4/3] bg-elevated flex items-center justify-center text-4xl border-b border-border">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      "🎮"
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-primary mb-1">{listing.gameName}</p>
                    <p className="text-sm font-bold text-text line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-2">
                      {listing.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-heading font-black text-xl text-text">${listing.price.toFixed(2)}</p>
                      <span className="text-[10px] bg-success/10 text-success border border-success/20 font-bold px-2 py-0.5 rounded-full">
                        {listing.deliveryTime || "Fast"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-4 text-3xl">🔍</div>
              <p className="font-bold text-text mb-1">No listings found</p>
              <p className="text-sm text-text-muted">
                {query ? `No listings match "${query}". Try different keywords.` : "No active listings yet."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Games Tab */}
      {tab === "games" && (
        <div>
          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {filteredGames.map((game) => (
                <GameCard key={game.id} {...game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-4 text-3xl">🕹️</div>
              <p className="font-bold text-text mb-1">No games found</p>
              <p className="text-sm text-text-muted">Try different keywords.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
