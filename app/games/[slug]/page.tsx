import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { GAMES, LISTINGS, CATEGORIES } from "@/lib/data/igmartData";
import { Stars, EmptyState } from "@/components/ui/index";
import { ListingCard } from "@/components/shared/ListingCard";
import { Search } from "lucide-react";

interface Props {
  params: { slug: string };
}

function getNormalizedSlug(slug: string) {
  if (slug === "bgmi" || slug === "pubg-global" || slug === "pubg") return "pubg-mobile";
  return slug;
}

export function generateMetadata({ params }: Props): Metadata {
  const normalizedSlug = getNormalizedSlug(params.slug);
  const game = GAMES.find((g) => g.slug === normalizedSlug);
  if (!game) return { title: "Game Not Found" };
  return {
    title: `${game.name} Accounts Marketplace | IGMART`,
    description: `Buy and sell verified ${game.name} accounts with escrow protection on IGMART.`,
  };
}

export default function GameDetailPage({ params }: Props) {
  const normalizedSlug = getNormalizedSlug(params.slug);
  const game = GAMES.find((g) => g.slug === normalizedSlug);
  if (!game) notFound();

  const gameListings = LISTINGS.filter((l) => l.game === game.name || (game.slug === "pubg-mobile" && (l.game === "BGMI" || l.game === "PUBG Global" || l.game === "PUBG Mobile / BGMI")));

  return (
    <div className="bg-background min-h-screen">
      {/* Game Hero */}
      <div className="relative h-[280px] sm:h-[320px] lg:h-[360px] flex items-end pb-8 sm:pb-12 border-b border-border">
        <Image 
          src={game.image} 
          alt={game.name} 
          fill 
          sizes="100vw"
          priority
          className="object-cover object-top z-0 opacity-35" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-[1]" />
        
        <div className="container relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <Link href="/marketplace" className="text-text-muted text-xs sm:text-sm font-semibold hover:text-text transition-colors">Marketplace</Link>
            <span className="text-border-strong">/</span>
            <span className="text-text text-xs sm:text-sm font-bold">{game.name}</span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-text mb-6">
            {game.name} Marketplace
          </h1>
          
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {[
              { label: "ACTIVE LISTINGS", val: game.listings.toLocaleString() },
              { label: "VERIFIED SELLERS", val: game.sellers.toLocaleString() },
              { label: "AVERAGE RATING", val: game.rating, isRating: true },
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
            {/* Desktop Sticky Container */}
            <div className="lg:sticky lg:top-[100px] flex flex-col gap-6">
              
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-heading font-bold text-lg text-text mb-4">Categories</h3>
                <div className="flex flex-col gap-3">
                  {CATEGORIES.map(cat => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-5 h-5 rounded border border-border bg-background group-hover:border-primary transition-colors">
                        <input type="checkbox" className="peer absolute opacity-0 w-full h-full cursor-pointer" />
                        <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity absolute pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <div className="absolute inset-0 bg-primary opacity-0 peer-checked:opacity-100 rounded-sm transition-opacity pointer-events-none" />
                      </div>
                      <span className="text-sm font-semibold text-text-secondary group-hover:text-text transition-colors flex items-center gap-2">
                        <span>{cat.icon}</span> {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
                
                <div className="h-px bg-border my-6" />
                
                <h3 className="font-heading font-bold text-lg text-text mb-4">Price Range</h3>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                    <input type="number" placeholder="Min" className="w-full bg-background border border-border rounded-lg pl-7 pr-3 py-2.5 text-sm font-medium text-text placeholder:text-text-muted focus:outline-none focus:border-primary-hover transition-colors min-h-[44px]" />
                  </div>
                  <span className="text-text-muted font-bold">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                    <input type="number" placeholder="Max" className="w-full bg-background border border-border rounded-lg pl-7 pr-3 py-2.5 text-sm font-medium text-text placeholder:text-text-muted focus:outline-none focus:border-primary-hover transition-colors min-h-[44px]" />
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Listings Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-sm font-semibold text-text-secondary">
                Showing <strong className="text-text font-bold">{gameListings.length}</strong> featured listings
              </p>
              <div className="relative min-w-[200px]">
                <select className="w-full appearance-none bg-card border border-border rounded-lg px-4 py-2.5 pr-10 text-sm font-semibold text-text focus:outline-none focus:border-primary-hover min-h-[44px] cursor-pointer">
                  <option>Recommended</option>
                  <option>Lowest Price</option>
                  <option>Highest Price</option>
                  <option>Newest</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            {gameListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {gameListings.map((listing) => (
                  <ListingCard key={listing.id} {...listing} />
                ))}
              </div>
            ) : (
              <div className="mt-8">
                <EmptyState 
                  icon="🎮" 
                  title="No listings found" 
                  description="Try adjusting your filters or check back later." 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
