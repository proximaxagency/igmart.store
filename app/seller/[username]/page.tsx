import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SELLERS, LISTINGS } from "@/lib/data/igmartData";
import { Stars, Button, SellerAvatar, EmptyState, Badge } from "@/components/ui/index";
import { ListingCard } from "@/components/shared/ListingCard";
import { MessageSquare, Calendar, Zap, ShieldCheck, Package } from "lucide-react";

interface Props {
  params: { username: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const seller = SELLERS.find((s) => s.username === params.username);
  if (!seller) return { title: "Seller Not Found" };
  return {
    title: `${seller.displayName} | IGMART`,
    description: `View ${seller.displayName}'s seller profile and listings on IGMART. ${seller.orders.toLocaleString()} completed orders.`,
  };
}

export default function SellerProfilePage({ params }: Props) {
  const seller = SELLERS.find((s) => s.username === params.username);
  if (!seller) notFound();

  const sellerListings = LISTINGS.filter((l) => l.seller === seller.username);

  const stats = [
    { icon: Package, label: "Total Orders", val: seller.orders.toLocaleString() },
    { icon: ShieldCheck, label: "Response Rate", val: seller.responseRate },
    { icon: Zap, label: "Avg Delivery", val: "< 15 min", highlight: true },
    { icon: MessageSquare, label: "Active Listings", val: sellerListings.length },
  ];

  return (
    <div className="bg-background min-h-screen pb-16">
      <div className="container py-6 sm:py-10">

        {/* ── Seller header card ─────────────────────── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8 shadow-[var(--shadow-md)]">
          {/* Banner */}
          <div
            className="h-28 sm:h-40 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0d1a3a 0%, #1a2040 50%, #0f1116 100%)" }}
          >
            {/* Decorative gradient line */}
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 right-0 h-px opacity-40"
              style={{ background: "linear-gradient(90deg, transparent, var(--color-primary), #06b6d4, var(--color-primary), transparent)" }}
            />
            {seller.verified && (
              <div className="absolute top-3 right-3 sm:top-5 sm:right-5">
                <Badge variant="verified" size="md">
                  <ShieldCheck size={13} /> IGMART Verified
                </Badge>
              </div>
            )}
          </div>

          {/* Profile info */}
          <div className="px-5 sm:px-8 pb-8 relative" style={{ marginTop: "-52px" }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 sm:gap-6">
              {/* Avatar + info */}
              <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-card bg-card overflow-hidden flex-shrink-0 shadow-[var(--shadow-lg)]">
                  <div
                    className="w-full h-full flex items-center justify-center font-heading font-black text-4xl sm:text-5xl text-white"
                    style={{ background: "var(--gradient-brand)" }}
                    aria-hidden="true"
                  >
                    {seller.username.slice(0, 2).toUpperCase()}
                  </div>
                </div>

                <div className="mb-1">
                  <h1 className="font-heading font-black text-xl sm:text-2xl text-text mb-0.5">
                    {seller.displayName}
                  </h1>
                  <p className="text-text-muted text-sm font-medium mb-2">@{seller.username}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Stars rating={seller.rating} count={seller.reviews} showText size={14} />
                    <span aria-hidden="true" className="text-border-strong hidden sm:inline">·</span>
                    <div className="flex items-center gap-1.5 text-text-muted text-sm font-medium">
                      <Calendar size={14} aria-hidden="true" />
                      <span>Member since 2024</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="w-full sm:w-auto">
                <Button variant="gradient" size="lg" fullWidth icon={<MessageSquare size={16} />}>
                  Contact Seller
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-7 pt-6 border-t border-border">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-elevated rounded-xl p-4 border border-border/50">
                  <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2 ${stat.highlight ? "text-success" : "text-text-muted"}`}>
                    <stat.icon size={13} aria-hidden="true" />
                    <span>{stat.label}</span>
                  </div>
                  <p className="font-heading font-black text-xl sm:text-2xl text-text">{stat.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main content + sidebar ──────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* Listings */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-xl text-text">Active Listings</h2>
              <span className="text-sm text-text-muted font-medium">{sellerListings.length} listings</span>
            </div>

            {sellerListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {sellerListings.map((listing) => (
                  <ListingCard key={listing.id} {...listing} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="📦"
                title="No active listings"
                description="This seller currently has no active listings."
                action={
                  <Link href="/marketplace" className="text-primary-hover font-semibold text-sm hover:underline">
                    Browse Marketplace
                  </Link>
                }
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[300px] flex-shrink-0 flex flex-col gap-5">

            {/* About */}
            <div>
              <h2 className="font-heading font-bold text-lg text-text mb-3">About</h2>
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-text-muted text-[14px] leading-relaxed prose-width">
                  Professional seller specializing in premium gaming accounts and boosting services.
                  Fast delivery and excellent customer support guaranteed. Feel free to contact me
                  with any questions before purchasing!
                </p>
              </div>
            </div>

            {/* Recent reviews */}
            <div>
              <h2 className="font-heading font-bold text-lg text-text mb-3">Recent Reviews</h2>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {[
                  { text: "Fast delivery and exactly as described!", user: "Buyer_101", ago: "2 days ago" },
                  { text: "Great seller, very communicative and quick.", user: "GamerX99", ago: "5 days ago" },
                  { text: "Top notch, would buy again for sure.", user: "Priya_K", ago: "1 week ago" },
                ].map((review, i, arr) => (
                  <div key={i} className={`p-4 ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
                    <div className="flex items-start justify-between mb-2">
                      <Stars rating={5} size={11} />
                      <span className="text-[10px] text-text-muted font-medium">{review.ago}</span>
                    </div>
                    <p className="text-[13px] font-semibold text-text mb-1 line-clamp-2">{review.text}</p>
                    <p className="text-[11px] text-text-muted font-medium">{review.user}</p>
                  </div>
                ))}
                <div className="p-4 border-t border-border">
                  <Link href="#reviews" className="text-sm font-semibold text-primary-hover hover:underline">
                    View all reviews →
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
