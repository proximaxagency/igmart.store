import type { Metadata } from "next";
import Link from "next/link";
import { GAMES, LISTINGS } from "@/lib/data/igmartData";
import { SectionHeading, EmptyState } from "@/components/ui/index";
import { ListingCard } from "@/components/shared/ListingCard";
import { GameCard } from "@/components/shared/GameCard";

export const metadata: Metadata = {
  title: "Search Results | IGMART",
};

interface Props {
  searchParams: { q?: string; tab?: string };
}

export default function SearchPage({ searchParams }: Props) {
  const query = searchParams.q?.toLowerCase() || "";
  const tab = searchParams.tab || "listings"; // 'listings' or 'games'

  const matchedGames = GAMES.filter(g => g.name.toLowerCase().includes(query) || g.category.toLowerCase().includes(query));
  const matchedListings = LISTINGS.filter(l => l.title.toLowerCase().includes(query) || l.game.toLowerCase().includes(query) || l.seller.toLowerCase().includes(query));

  return (
    <div className="bg-background min-h-[calc(100vh-76px)] py-12 lg:py-16">
      <div className="container">
        <SectionHeading 
          eyebrow="Search" 
          title={`Results for "${query}"`} 
          subtitle={query ? "" : "Enter a search term to find games, accounts, and items."} 
        />

        {/* Custom Tabs */}
        <div className="flex border-b border-border mb-10 overflow-x-auto hide-scrollbar">
          <Link 
            href={`/search?q=${query}&tab=listings`}
            className={`px-6 py-4 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${
              tab === "listings" ? "text-text border-primary" : "text-text-muted border-transparent hover:text-text-secondary"
            }`}
          >
            Listings ({matchedListings.length})
          </Link>
          <Link 
            href={`/search?q=${query}&tab=games`}
            className={`px-6 py-4 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${
              tab === "games" ? "text-text border-primary" : "text-text-muted border-transparent hover:text-text-secondary"
            }`}
          >
            Games ({matchedGames.length})
          </Link>
        </div>

        {/* Listings Tab */}
        {tab === "listings" && (
          <div>
            {matchedListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {matchedListings.map((listing) => (
                  <ListingCard key={listing.id} {...listing} />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon="🔍" 
                title={`No listings found for "${query}"`} 
                description="Try checking your spelling or using different keywords." 
              />
            )}
          </div>
        )}

        {/* Games Tab */}
        {tab === "games" && (
          <div>
            {matchedGames.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {matchedGames.map((game) => (
                  <GameCard key={game.id} {...game} />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon="🕹️" 
                title={`No games found for "${query}"`} 
                description="We couldn't find any games matching that search." 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
