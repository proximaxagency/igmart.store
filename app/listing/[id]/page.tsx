import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Shield, MessageSquare, Zap, CheckCircle2, ChevronRight } from "lucide-react";
import { LISTINGS, SELLERS } from "@/lib/data/igmartData";
import { Badge, Stars, PriceDisplay, SellerAvatar, Button, Alert } from "@/components/ui/index";
import { ListingCard } from "@/components/shared/ListingCard";

interface Props {
  params: { id: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const listing = LISTINGS.find((l) => l.id === params.id);
  if (!listing) return { title: "Listing Not Found" };
  return {
    title: `${listing.title} | IGMART`,
    description: `Buy ${listing.title} for ${listing.game} on IGMART. Verified seller, secure escrow, instant delivery.`,
  };
}

function getBadgeVariant(badge: string): "hot" | "sale" | "popular" {
  if (badge === "HOT") return "hot";
  if (badge === "SALE") return "sale";
  return "popular";
}

export default function ListingPage({ params }: Props) {
  const listing = LISTINGS.find((l) => l.id === params.id);
  if (!listing) notFound();

  const seller = SELLERS.find((s) => s.username === listing.seller) || SELLERS[0];
  const relatedListings = LISTINGS.filter((l) => l.game === listing.game && l.id !== listing.id).slice(0, 4);

  return (
    <div className="bg-background min-h-screen pb-28 lg:pb-16">
      <div className="container py-6 sm:py-8">

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 mb-6 text-sm overflow-x-auto hide-scrollbar whitespace-nowrap">
          <Link href="/" className="text-text-muted hover:text-text-secondary transition-colors font-medium">Home</Link>
          <ChevronRight size={13} className="text-text-muted flex-shrink-0" aria-hidden="true" />
          <Link href="/marketplace" className="text-text-muted hover:text-text-secondary transition-colors font-medium">Marketplace</Link>
          <ChevronRight size={13} className="text-text-muted flex-shrink-0" aria-hidden="true" />
          <span className="text-text font-semibold truncate max-w-[200px] sm:max-w-xs">{listing.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ── Left: image + description ───────────────── */}
          <div className="flex-1 min-w-0">

            {/* Main image */}
            <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
              <div className="aspect-video relative bg-elevated">
                <Image
                  src={listing.image}
                  alt={listing.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className="object-cover"
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
                    {listing.game}
                  </span>
                  {listing.category && (
                    <span className="text-[11px] font-bold tracking-widest uppercase text-text-muted bg-elevated border border-border px-2.5 py-1 rounded-md">
                      {listing.category}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-heading font-black text-xl sm:text-2xl text-text mb-4 leading-tight">
                  {listing.title}
                </h1>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                  <Stars rating={listing.rating} count={listing.reviews} showText />
                  <span className="text-text-muted">·</span>
                  <span className="text-text-muted font-medium">Listing #{listing.id}</span>
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

            {/* Related listings */}
            {relatedListings.length > 0 && (
              <div>
                <h2 className="font-heading font-bold text-xl text-text mb-4">More from {listing.game}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {relatedListings.map((l) => (
                    <ListingCard key={l.id} {...l} variant="compact" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: purchase panel ─────────────────── */}
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
                    <Zap size={18} className="text-warning" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text leading-none mb-0.5">Delivery Speed</p>
                    <p className="text-xs font-medium text-text-muted">{listing.delivery}</p>
                  </div>
                </div>

                {/* Desktop CTA */}
                <div className="hidden lg:flex flex-col gap-3">
                  <Link
                    href="/checkout"
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
                  <Shield size={14} aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-wide">100% Trade Protection</span>
                </div>
              </div>

              {/* Seller card */}
              <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">About the Seller</p>

                <div className="flex items-center gap-3.5 mb-4">
                  <SellerAvatar username={seller.username} isVerified={seller.verified} size={44} />
                  <div className="min-w-0">
                    <Link
                      href={`/seller/${seller.username}`}
                      className="font-heading font-bold text-[15px] text-text hover:text-primary-hover transition-colors block truncate"
                    >
                      {seller.displayName}
                    </Link>
                    <Stars rating={seller.rating} count={seller.reviews} size={12} compact />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-elevated border border-border p-3 rounded-lg text-center">
                    <p className="font-heading font-black text-base text-text">{seller.orders.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Orders</p>
                  </div>
                  <div className="bg-elevated border border-border p-3 rounded-lg text-center">
                    <p className="font-heading font-black text-base text-text">{seller.responseRate}</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Response</p>
                  </div>
                </div>

                <Link
                  href={`/seller/${seller.username}`}
                  className="text-sm font-semibold text-primary-hover hover:underline"
                >
                  View full profile →
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky purchase bar ──────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-[90] px-4 pt-3 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <PriceDisplay price={listing.price} originalPrice={listing.originalPrice} size="md" showDiscount />
          <Link
            href="/checkout"
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
