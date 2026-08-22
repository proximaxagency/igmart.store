"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ListingCard } from "@/components/shared/ListingCard";
import { Loader2 } from "lucide-react";

export function FeaturedListings() {
  const listings = useQuery(api.listings.listActiveListings, { limit: 8 });

  if (listings === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-20 text-text-muted">
        No featured accounts available at the moment.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {listings.map((listing) => (
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
