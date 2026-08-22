"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ListingCard } from "@/components/shared/ListingCard";
import { Loader2 } from "lucide-react";

export function FeaturedListings() {
  const rawListings = useQuery(api.listings.listActiveListings, { limit: 50 });

  if (rawListings === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // 50% quota for CoC (4 CoC listings, 4 Other listings)
  const cocListings = rawListings.filter(l => l.gameName?.toLowerCase().includes("clash of clans"));
  const otherListings = rawListings.filter(l => !l.gameName?.toLowerCase().includes("clash of clans"));
  
  const displayListings = [];
  let cIdx = 0;
  let oIdx = 0;
  
  while (displayListings.length < 8 && (cIdx < cocListings.length || oIdx < otherListings.length)) {
    // Try to take 1 CoC, 1 Other in an alternating pattern to maintain 50% quota
    if (displayListings.length % 2 === 0) {
      if (cIdx < cocListings.length) displayListings.push(cocListings[cIdx++]);
      else if (oIdx < otherListings.length) displayListings.push(otherListings[oIdx++]);
    } else {
      if (oIdx < otherListings.length) displayListings.push(otherListings[oIdx++]);
      else if (cIdx < cocListings.length) displayListings.push(cocListings[cIdx++]);
    }
  }

  if (displayListings.length === 0) {
    return (
      <div className="text-center py-20 text-text-muted">
        No featured accounts available at the moment.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {displayListings.map((listing) => (
        <ListingCard
          key={listing._id}
          id={listing._id}
          title={listing.title}
          game={listing.gameName ?? "Unknown Game"}
          price={listing.price}
          originalPrice={listing.originalPrice}
          rating={listing.sellerRating ?? 5}
          seller={listing.sellerName ?? "Verified Seller"}
          image={listing.images?.[0] ?? "/clash-of-clans-poster.jpg"}
          badge={listing.badge}
          delivery={listing.deliveryTime}
        />
      ))}
    </div>
  );
}
