"use client";

import Link from "next/link";
import Image from "next/image";
import { Shield, MessageSquare, Zap, CheckCircle2, ChevronRight, ChevronLeft, Loader2, ArrowRight } from "lucide-react";
import { Badge, Stars, PriceDisplay, Button, Alert } from "@/components/ui/index";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useCurrency } from "@/components/providers/CurrencyProvider";

import { ConvexImage, useResolvedImageUrl } from "@/components/shared/ConvexImage";

function getBadgeVariant(badge: string): "hot" | "sale" | "popular" | "new" {
  if (badge === "HOT") return "hot";
  if (badge === "SALE") return "sale";
  if (badge === "NEW") return "new";
  return "popular";
}

/* ── Recommendation Card ─────────────────────────────────────────────── */
function RecoCard({ listing }: { listing: Record<string, unknown> }) {
  const l = listing as {
    _id: string; title: string; price: number; originalPrice?: number;
    images?: string[]; deliveryTime?: string; badge?: string; gameName?: string;
  };
  const { format } = useCurrency();
  return (
    <Link
      href={`/listing/${l._id}`}
      className="group flex-shrink-0 w-[220px] sm:w-[240px] bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-200"
    >
      <div className="relative aspect-[4/3] bg-elevated overflow-hidden">
        {l.images?.[0] ? (
          <ConvexImage
            src={l.images[0]}
            alt={l.title}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎮</div>
        )}
        {l.badge && (
          <div className="absolute top-2 left-2">
            <Badge variant={getBadgeVariant(l.badge)}>{l.badge}</Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
      <div className="p-3.5">
        <p className="text-sm font-bold text-text line-clamp-2 leading-snug group-hover:text-primary-hover transition-colors mb-2.5">
          {l.title}
        </p>
        <div className="flex items-center justify-between">
          <p className="font-heading font-black text-lg text-text">{format(l.price)}</p>
          <span className="text-[10px] bg-elevated text-text-muted font-bold px-2 py-0.5 rounded-full border border-border">
            {l.deliveryTime || "Instant"}
          </span>
        </div>
        {l.originalPrice && l.originalPrice > l.price && (
          <p className="text-[11px] text-text-muted line-through mt-0.5">{format(l.originalPrice)}</p>
        )}
      </div>
    </Link>
  );
}

export default function ListingPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [activeImg, setActiveImg] = useState(0);

  const listing = useQuery(
    api.listings.getListingById,
    id ? { listingId: id as Id<"listings"> } : "skip"
  );
  const incrementViews = useMutation(api.listings.incrementViews);

  // Hook must be called unconditionally at the top of the component
  const activeRawImage = listing?.images?.[activeImg];
  const activeImageSrc = useResolvedImageUrl(activeRawImage, "/clash-of-clans-poster.jpg");

  // Fetch all active listings for same game (for recommendations)
  const allActiveListings = useQuery(
    api.listings.listActiveListings,
    listing?.gameId ? { gameId: listing.gameId as Id<"games">, limit: 50 } : "skip"
  );

  // Filter out current listing, shuffle, take 8
  const recommendations = useMemo(() => {
    if (!allActiveListings || !id) return [];
    const others = allActiveListings.filter((l) => l._id !== id);
    // Fisher-Yates shuffle for variety
    const arr = [...others];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 8);
  }, [allActiveListings, id]);

  useEffect(() => {
    if (listing && id) {
      incrementViews({ listingId: id as Id<"listings"> }).catch(() => {});
    }
  }, [!!listing]);

  // Reset active image when listing changes
  useEffect(() => { setActiveImg(0); }, [id]);

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

  const gameName = listing.gameName ?? "Game Asset";
  const gameSlug = (() => {
    // We import GAMES inside the component or at the top. Let's just require it or use the same logic as the slug page.
    const normalized = gameName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (normalized.includes("pubg") || normalized.includes("bgmi")) return "pubg-mobile";
    if (normalized.includes("free-fire")) return "free-fire";
    if (normalized.includes("clash-of-clans")) return "clash-of-clans";
    if (normalized.includes("clash-royale")) return "clash-royale";
    return normalized;
  })();

  return (
    <div className="bg-background min-h-screen pb-28 lg:pb-16">
      <div className="container py-6 sm:py-8">

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 mb-6 text-sm overflow-x-auto hide-scrollbar whitespace-nowrap">
          <Link href="/" className="text-text-muted hover:text-text-secondary transition-colors font-medium">Home</Link>
          <ChevronRight size={13} className="text-text-muted flex-shrink-0" />
          <Link href="/marketplace" className="text-text-muted hover:text-text-secondary transition-colors font-medium">Marketplace</Link>
          <ChevronRight size={13} className="text-text-muted flex-shrink-0" />
          <Link href={`/games/${gameSlug}`} className="text-text-muted hover:text-text-secondary transition-colors font-medium">{gameName}</Link>
          <ChevronRight size={13} className="text-text-muted flex-shrink-0" />
          <span className="text-text font-semibold truncate max-w-[200px] sm:max-w-xs">{listing.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ── Left: image + description ── */}
          <div className="flex-1 min-w-0">

            {/* Main image */}
            <div className="bg-card border border-border rounded-xl overflow-hidden mb-6 relative group">
              <div className="relative bg-elevated/50 flex items-center justify-center min-h-[300px] overflow-hidden">
                {/* Blurred background image to fill awkward gaps */}
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-xl opacity-40 scale-110"
                  style={{ backgroundImage: activeImageSrc ? `url(${activeImageSrc})` : undefined }}
                />
                
                {/* Main uncropped image */}
                <ConvexImage
                  src={listing.images?.[activeImg]}
                  alt={listing.title}
                  className="w-full h-auto max-h-[70vh] object-contain relative z-10 transition-opacity duration-300"
                />
                {listing.badge && (
                  <div className="absolute top-3 left-3">
                    <Badge variant={getBadgeVariant(listing.badge)}>{listing.badge}</Badge>
                  </div>
                )}
              </div>

              {/* Mobile/Desktop overlay arrows for image navigation */}
              {listing.images && listing.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.preventDefault(); setActiveImg(prev => (prev === 0 ? listing.images!.length - 1 : prev - 1)); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-primary/90 text-white flex items-center justify-center backdrop-blur-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all z-10"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); setActiveImg(prev => (prev === listing.images!.length - 1 ? 0 : prev + 1)); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-primary/90 text-white flex items-center justify-center backdrop-blur-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all z-10"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}


              {/* Gallery thumbnails */}
              {listing.images && listing.images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto hide-scrollbar bg-elevated/30 border-t border-border">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImg === idx ? "border-primary shadow-[0_0_0_2px_var(--color-primary)]" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <ConvexImage
                        src={img}
                        alt={`Screenshot ${idx + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  ))}
                </div>
              )}

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

        {/* ── YOU MAY ALSO LIKE ─────────────────────────────────────────────── */}
        {recommendations.length > 0 && (
          <section className="mt-10 pt-8 border-t border-border">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">More from {gameName}</p>
                <h2 className="font-heading font-black text-xl sm:text-2xl text-text">You May Also Like</h2>
              </div>
              <Link
                href={`/games/${gameSlug}`}
                className="flex items-center gap-1.5 text-sm font-bold text-primary-hover hover:gap-2.5 transition-all flex-shrink-0"
              >
                View all <ArrowRight size={15} />
              </Link>
            </div>

            {/* Horizontally scrollable card row */}
            <div className="flex gap-4 overflow-x-auto pb-3 hide-scrollbar -mx-1 px-1">
              {recommendations.map((rec) => (
                <RecoCard key={rec._id} listing={rec as Record<string, unknown>} />
              ))}
            </div>
          </section>
        )}

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


