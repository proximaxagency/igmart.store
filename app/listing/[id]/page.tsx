"use client";

import Link from "next/link";
import Image from "next/image";
import { Shield, MessageSquare, Zap, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { Badge, Stars, PriceDisplay, Button, Alert } from "@/components/ui/index";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { notFound } from "next/navigation";
import { useEffect } from "react";

function getBadgeVariant(badge: string): "hot" | "sale" | "popular" | "new" {
  if (badge === "HOT") return "hot";
  if (badge === "SALE") return "sale";
  if (badge === "NEW") return "new";
  return "popular";
}

export default function ListingPage({ params }: { params: { id: string } }) {
  const listing = useQuery(api.listings.getListingById, {
    listingId: params.id as Id<"listings">,
  });
  const incrementViews = useMutation(api.listings.incrementViews);

  useEffect(() => {
    if (listing) {
      incrementViews({ listingId: params.id as Id<"listings"> }).catch(() => {});
    }
  }, [!!listing]);

  // Loading state
  if (listing === undefined) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-text-muted">
          <Loader2 size={36} className="animate-spin text-primary" />
          <p className="font-semibold text-sm">Loading listing…</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!listing) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="text-7xl font-black text-border">404</div>
        <h1 className="font-heading font-black text-2xl text-text">Listing Not Found</h1>
        <p className="text-text-muted max-w-sm">
          This listing may have been removed or the link is incorrect.
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

  const image = listing.images?.[0] ?? "/clash-of-clans-poster.jpg";
  const gameName = listing.gameName ?? "Game Asset";

  return (
    <div className="bg-background min-h-screen pb-28 lg:pb-16">
      <div className="container py-6 sm:py-8">

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 mb-6 text-sm overflow-x-auto hide-scrollbar whitespace-nowrap">
          <Link href="/" className="text-text-muted hover:text-text-secondary transition-colors font-medium">Home</Link>
          <ChevronRight size={13} className="text-text-muted flex-shrink-0" />
          <Link href="/marketplace" className="text-text-muted hover:text-text-secondary transition-colors font-medium">Marketplace</Link>
          <ChevronRight size={13} className="text-text-muted flex-shrink-0" />
          <span className="text-text font-semibold truncate max-w-[200px] sm:max-w-xs">{listing.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ── Left: image + description ── */}
          <div className="flex-1 min-w-0">

            {/* Main image */}
            <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
              <div className="aspect-video relative bg-elevated">
                <Image
                  src={image}
                  alt={listing.title}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className="object-cover object-top"
                />
                {listing.badge && (
                  <div className="absolute top-3 left-3">
                    <Badge variant={getBadgeVariant(listing.badge)}>{listing.badge}</Badge>
                  </div>
                )}
              </div>

              <div className="p-5 sm:p-7">
                {/* Tags */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-text-muted bg-elevated border border-border px-2.5 py-1 rounded-md">
                    {gameName}
                  </span>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-text-muted bg-elevated border border-border px-2.5 py-1 rounded-md">
                    Accounts
                  </span>
                </div>

                {/* Title */}
                <h1 className="font-heading font-black text-xl sm:text-2xl text-text mb-4 leading-tight">
                  {listing.title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                  <Stars rating={5} count={0} showText />
                  <span className="text-text-muted">·</span>
                  <span className="text-text-muted font-medium">{listing.views ?? 0} views</span>
                </div>

                <div className="h-px bg-border mb-6" />

                {/* Description */}
                <h2 className="font-heading font-bold text-lg text-text mb-3">Description</h2>
                <div className="text-text-secondary text-[15px] leading-relaxed whitespace-pre-wrap mb-5">
                  {listing.description}
                </div>

                <Alert variant="success" icon={<CheckCircle2 size={18} />}>
                  This is a fully verified listing. The seller has provided all necessary proofs to our moderation team. Delivery is guaranteed within the specified timeframe or you get a full refund.
                </Alert>
              </div>
            </div>
          </div>

          {/* ── Right: purchase panel ── */}
          <div className="w-full lg:w-[360px] flex-shrink-0">
            <div className="lg:sticky lg:top-[80px] flex flex-col gap-4">

              {/* Purchase card */}
              <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Total Price</p>
                <div className="mb-5">
                  <PriceDisplay
                    price={listing.price}
                    originalPrice={listing.originalPrice}
                    size="lg"
                    showDiscount
                  />
                </div>

                {/* Delivery info */}
                <div className="bg-elevated border border-border rounded-xl p-3.5 flex items-center gap-3.5 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <Zap size={18} className="text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text leading-none mb-0.5">Delivery Speed</p>
                    <p className="text-xs font-medium text-text-muted">{listing.deliveryTime ?? "Instant"}</p>
                  </div>
                </div>

                {/* Desktop CTA */}
                <div className="hidden lg:flex flex-col gap-3">
                  <Link
                    href={`/checkout?listing=${listing._id}`}
                    className="flex items-center justify-center gap-2 font-semibold text-[15px] text-white w-full py-3.5 rounded-xl hover:opacity-90 transition-opacity"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    Buy Now
                  </Link>
                  <Button variant="outline" fullWidth icon={<MessageSquare size={16} />}>
                    Contact Seller
                  </Button>
                </div>

                {/* Trust badge */}
                <div className="flex items-center justify-center gap-1.5 mt-4 text-success">
                  <Shield size={14} />
                  <span className="text-xs font-bold uppercase tracking-wide">100% Trade Protection</span>
                </div>
              </div>

              {/* Seller card */}
              <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">About the Seller</p>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-base">
                      {(listing.sellerName ?? "S")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading font-bold text-[15px] text-text truncate">
                      {listing.sellerName ?? "Verified Seller"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {listing.sellerIsVerified && (
                        <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-md">✓ VERIFIED</span>
                      )}
                      <Stars rating={listing.sellerRating ?? 5} size={11} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-elevated border border-border p-3 rounded-lg text-center">
                    <p className="font-heading font-black text-base text-text">4.9★</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Rating</p>
                  </div>
                  <div className="bg-elevated border border-border p-3 rounded-lg text-center">
                    <p className="font-heading font-black text-base text-text">100%</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Response</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-[90] px-4 pt-3 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <PriceDisplay price={listing.price} originalPrice={listing.originalPrice} size="md" showDiscount />
          <Link
            href={`/checkout?listing=${listing._id}`}
            className="flex-shrink-0 inline-flex items-center justify-center font-semibold text-sm text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity min-h-[44px]"
            style={{ background: "var(--gradient-brand)" }}
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
}
