"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ListingCard } from "@/components/shared/ListingCard";
import { useGameVisibility } from "@/lib/gamesVisibility";
import { detectGameFromListing } from "@/lib/gameDetection";

// ── Skeleton placeholder while data loads ──────────────────────────────
function ListingCardSkeleton() {
  return (
    <div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-video w-full bg-elevated" />
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="h-2.5 bg-elevated rounded-full w-1/3" />
        <div className="space-y-1.5">
          <div className="h-3 bg-elevated rounded-full w-full" />
          <div className="h-3 bg-elevated rounded-full w-3/4" />
        </div>
        <div className="mt-auto flex items-end justify-between">
          <div className="h-5 bg-elevated rounded-full w-16" />
          <div className="h-3 bg-elevated rounded-full w-12" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedListings() {
  const { isGameVisible } = useGameVisibility();
  // Fetch active listings
  const rawListings = useQuery(api.listings.listActiveListings, { limit: 50 });

  // Show 8 skeletons while loading
  if (rawListings === undefined) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const validListings = rawListings.filter((l) => {
    const detected = detectGameFromListing(l);
    if (detected.isDisallowed) return false;
    return isGameVisible(detected.slug);
  });

  if (validListings.length === 0) {
    return (
      <div className="text-center py-20 text-text-muted">
        No featured accounts available at the moment.
      </div>
    );
  }

  // 50% quota for CoC (4 CoC listings, 4 Other listings)
  const cocListings = validListings.filter(l => detectGameFromListing(l).slug === "clash-of-clans");
  const otherListings = validListings.filter(l => detectGameFromListing(l).slug !== "clash-of-clans");

  const displayListings = [];
  let cIdx = 0;
  let oIdx = 0;

  while (displayListings.length < 8 && (cIdx < cocListings.length || oIdx < otherListings.length)) {
    if (displayListings.length % 2 === 0) {
      if (cIdx < cocListings.length) displayListings.push(cocListings[cIdx++]);
      else if (oIdx < otherListings.length) displayListings.push(otherListings[oIdx++]);
    } else {
      if (oIdx < otherListings.length) displayListings.push(otherListings[oIdx++]);
      else if (cIdx < cocListings.length) displayListings.push(cocListings[cIdx++]);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {displayListings.map((listing) => {
        const detected = detectGameFromListing(listing);
        return (
          <ListingCard
            key={listing._id}
            id={listing._id}
            title={listing.title}
            game={detected.name}
            price={listing.price}
            originalPrice={listing.originalPrice}
            rating={listing.sellerRating ?? 5}
            seller={listing.sellerName ?? "Verified Seller"}
            image={listing.images?.[0] ?? detected.poster}
            badge={listing.badge}
            delivery={listing.deliveryTime}
          />
        );
      })}
    </div>
  );
}
