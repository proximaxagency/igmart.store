"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, SlidersHorizontal, ChevronDown, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORIES } from "@/lib/data/igmartData";
import { SectionHeading } from "@/components/ui/index";

const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Newest", value: "newest" },
  { label: "Lowest Price", value: "price_asc" },
  { label: "Highest Price", value: "price_desc" },
];

const DELIVERY_OPTIONS = ["Instant", "1 hour", "24 hours", "1-3 days"];
const PAGE_SIZE = 24;

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
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search listings..."
          className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors min-h-[44px]"
        />
      </div>

      <div>
        <h3 className="text-sm font-bold text-text mb-3">Delivery Speed</h3>
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
        <h3 className="text-sm font-bold text-text mb-3">Price Range</h3>
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
        className="text-xs font-bold text-text-muted hover:text-text transition-colors text-left"
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

export default function MarketplacePage() {
  const [sort, setSort] = useState("recommended");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [deliveries, setDeliveries] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);

  // Live Convex listings — fetch larger batch for client-side filter+sort+paginate
  const rawListings = useQuery(api.listings.listActiveListings, { limit: 500 });

  const listings = useMemo(() => {
    if (!rawListings) return [];
    let result = [...rawListings];

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
    if (sort === "newest") result.sort((a, b) => b._creationTime - a._creationTime);
    else if (sort === "price_asc") result.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") result.sort((a, b) => b.price - a.price);
    // recommended = default Convex order (by views/createdAt)

    return result;
  }, [rawListings, search, deliveries, minPrice, maxPrice, sort]);

  // Reset page when filters change
  useMemo(() => { setPage(1); }, [search, deliveries, minPrice, maxPrice, sort]);

  const totalPages = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = listings.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const activeFilterCount = [search, ...deliveries, minPrice, maxPrice].filter(Boolean).length;

  return (
    <div className="bg-background min-h-screen pb-16">
      <div className="bg-surface border-b border-border py-8 lg:py-10">
        <div className="container">
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-text mb-1.5">Marketplace</h1>
          <p className="text-text-muted text-sm">Browse verified accounts, items, and services from trusted sellers.</p>
        </div>
      </div>

      <div className="container pt-6">
        {/* Category strip */}
        <div className="flex gap-2.5 overflow-x-auto pb-5 mb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`/marketplace/${cat.slug}`}
              className="flex-shrink-0 flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 min-w-[170px] hover:bg-elevated hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-sm transition-all group">
              <span className="text-2xl group-hover:scale-105 transition-transform">{cat.icon}</span>
              <div>
                <p className="font-heading font-bold text-sm text-text group-hover:text-primary-hover transition-colors">{cat.name}</p>
                <p className="text-[11px] font-medium text-text-muted mt-0.5">{cat.count?.toLocaleString()} listings</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile filter/sort bar */}
        <div className="flex items-center gap-2 py-4 border-t border-border lg:hidden">
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
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0">
            <div className="lg:sticky lg:top-[80px] bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider">Filters</h2>
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
            </div>
          </aside>

          {/* Listings area */}
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
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-elevated" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-elevated rounded w-1/3" />
                      <div className="h-4 bg-elevated rounded w-full" />
                      <div className="h-4 bg-elevated rounded w-2/3" />
                      <div className="h-6 bg-elevated rounded w-1/4 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : paginated.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {paginated.map((listing) => (
                  <Link
                    key={listing._id}
                    href={`/listing/${listing._id}`}
                    className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all"
                  >
                    <div className="aspect-[4/3] bg-elevated flex items-center justify-center text-5xl border-b border-border overflow-hidden">
                      {listing.images?.[0] ? (
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : "🎮"}
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-primary mb-1">{listing.gameName}</p>
                      <p className="text-sm font-bold text-text line-clamp-2 leading-snug group-hover:text-primary-hover transition-colors mb-2">{listing.title}</p>
                      <div className="flex items-center justify-between">
                        <p className="font-heading font-black text-xl text-text">${listing.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2">                          <span className="text-[10px] bg-elevated text-text-muted font-bold px-2 py-0.5 rounded-full border border-border">{listing.deliveryTime || "Fast"}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-3xl mb-4">🔍</div>
                <p className="font-bold text-text mb-1">No listings found</p>
                <p className="text-sm text-text-muted mb-5">Try adjusting your filters or clearing them.</p>
                <button
                  onClick={() => { setSearch(""); setDeliveries([]); setMinPrice(""); setMaxPrice(""); }}
                  className="text-sm font-bold text-primary border border-primary/30 hover:bg-primary/10 px-4 py-2 rounded-xl transition-colors"
                >
                  Clear Filters
                </button>
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
                  // Show pages around current
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
          <div className="relative bg-background rounded-t-2xl border-t border-border p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-lg text-text">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="w-9 h-9 rounded-lg text-text-muted hover:text-text hover:bg-elevated flex items-center justify-center transition-colors">
                <X size={18} />
              </button>
            </div>
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
