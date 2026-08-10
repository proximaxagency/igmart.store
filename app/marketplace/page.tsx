"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { CATEGORIES, LISTINGS } from "@/lib/data/igmartData";
import { SectionHeading } from "@/components/ui/index";
import { ListingCard } from "@/components/shared/ListingCard";

const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Newest", value: "newest" },
  { label: "Lowest Price", value: "price_asc" },
  { label: "Highest Price", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
];

const DELIVERY_OPTIONS = ["Instant", "Under 1 Hour", "Under 24 Hours"];

// Sidebar filter panel — shared between desktop sidebar and mobile sheet
function FilterPanel({ onClose }: { onClose?: () => void }) {
  const [deliveries, setDeliveries] = useState<string[]>([]);

  const toggleDelivery = (d: string) => {
    setDeliveries((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          placeholder="Search listings..."
          className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors min-h-[44px]"
          aria-label="Search listings"
        />
      </div>

      {/* Delivery */}
      <div>
        <h3 className="text-sm font-bold text-text mb-3">Delivery Speed</h3>
        <div className="flex flex-col gap-2.5">
          {DELIVERY_OPTIONS.map((d) => {
            const checked = deliveries.includes(d);
            return (
              <label key={d} className="flex items-center gap-3 cursor-pointer group">
                <div className={`relative w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${checked ? "bg-primary border-primary" : "bg-background border-border group-hover:border-primary/50"}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDelivery(d)}
                    className="absolute opacity-0 inset-0 cursor-pointer"
                    aria-label={d}
                  />
                  {checked && (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none" className="pointer-events-none" aria-hidden="true">
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

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Price */}
      <div>
        <h3 className="text-sm font-bold text-text mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">$</span>
            <input
              type="number"
              placeholder="Min"
              className="w-full bg-background border border-border rounded-lg pl-7 pr-3 py-2.5 text-sm font-medium text-text placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors min-h-[44px]"
              aria-label="Minimum price"
            />
          </div>
          <span className="text-text-muted font-medium">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">$</span>
            <input
              type="number"
              placeholder="Max"
              className="w-full bg-background border border-border rounded-lg pl-7 pr-3 py-2.5 text-sm font-medium text-text placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors min-h-[44px]"
              aria-label="Maximum price"
            />
          </div>
        </div>
      </div>

      {/* Mobile: action buttons */}
      {onClose && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => { setDeliveries([]); }}
            className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-text-muted hover:text-text hover:border-border-strong transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ background: "var(--gradient-brand)" }}
          >
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

  return (
    <div className="bg-background min-h-screen pb-16">
      {/* Page hero */}
      <div className="bg-surface border-b border-border py-8 lg:py-10">
        <div className="container">
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-text mb-1.5">Marketplace</h1>
          <p className="text-text-muted text-sm">Browse thousands of accounts, items, and services from verified sellers.</p>
        </div>
      </div>

      <div className="container pt-6">
        {/* Category strip */}
        <div
          className="flex gap-2.5 overflow-x-auto pb-5 mb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar"
          role="tablist"
          aria-label="Filter by category"
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/marketplace/${cat.slug}`}
              role="tab"
              className="flex-shrink-0 flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 min-w-[170px] hover:bg-elevated hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] transition-all duration-150 group"
            >
              <span className="text-2xl group-hover:scale-105 transition-transform" aria-hidden="true">{cat.icon}</span>
              <div>
                <p className="font-heading font-bold text-sm text-text group-hover:text-primary-hover transition-colors">{cat.name}</p>
                <p className="text-[11px] font-medium text-text-muted mt-0.5">{cat.count.toLocaleString()} listings</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile filter/sort bar */}
        <div className="flex items-center gap-2 py-4 border-t border-border lg:hidden">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-semibold text-text-secondary hover:text-text hover:border-border-strong transition-colors min-h-[44px]"
            aria-label="Open filters"
            aria-expanded={mobileFiltersOpen}
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
          <div className="relative flex-1">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full appearance-none bg-card border border-border rounded-xl px-4 py-2.5 pr-9 text-sm font-semibold text-text focus:outline-none focus:border-primary/60 min-h-[44px] cursor-pointer"
              aria-label="Sort listings"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        {/* Main layout */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0" aria-label="Filters">
            <div className="lg:sticky lg:top-[80px] bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-5">Filters</h2>
              <FilterPanel />
            </div>
          </aside>

          {/* Listings area */}
          <div className="flex-1 min-w-0">
            {/* Desktop top bar */}
            <div className="hidden lg:flex items-center justify-between gap-4 mb-5">
              <p className="text-sm text-text-muted">
                Showing <strong className="text-text font-bold">{LISTINGS.length}</strong> listings
              </p>
              <div className="relative min-w-[200px]">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full appearance-none bg-card border border-border rounded-xl px-4 py-2.5 pr-9 text-sm font-semibold text-text focus:outline-none focus:border-primary/60 min-h-[44px] cursor-pointer"
                  aria-label="Sort listings"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" aria-hidden="true" />
              </div>
            </div>

            {/* Mobile listing count */}
            <p className="text-sm text-text-muted mb-4 lg:hidden">
              <strong className="text-text font-bold">{LISTINGS.length}</strong> listings
            </p>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {LISTINGS.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-10" aria-label="Pagination">
              <button
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card text-text-muted hover:text-text hover:border-border-strong transition-colors"
                aria-label="Previous page"
                disabled
              >
                <ChevronDown size={16} className="rotate-90" aria-hidden="true" />
              </button>
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                    p === 1
                      ? "bg-primary text-white border border-primary"
                      : "border border-border bg-card text-text-muted hover:text-text hover:border-border-strong"
                  }`}
                  aria-label={`Page ${p}`}
                  aria-current={p === 1 ? "page" : undefined}
                >
                  {p}
                </button>
              ))}
              <button
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card text-text-muted hover:text-text hover:border-border-strong transition-colors"
                aria-label="Next page"
              >
                <ChevronDown size={16} className="-rotate-90" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[300] lg:hidden flex flex-col justify-end" role="dialog" aria-modal="true" aria-label="Filters">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-background rounded-t-2xl border-t border-border p-5 max-h-[80vh] overflow-y-auto pb-safe">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-lg text-text">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-text-muted hover:text-text hover:bg-elevated transition-colors"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>
            <FilterPanel onClose={() => setMobileFiltersOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
