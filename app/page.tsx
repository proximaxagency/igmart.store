import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { GAMES, CATEGORIES, LISTINGS, SELLERS, REVIEWS, GUIDES, FAQ_ITEMS } from "@/lib/data/igmartData";
import { Badge, Stars, SectionHeading, Button } from "@/components/ui/index";
import { GameCard } from "@/components/shared/GameCard";
import { ListingCard } from "@/components/shared/ListingCard";
import HomepageClient from "@/components/home/HomepageClient";
import { Zap, ShieldCheck, MessageSquare, Scale, Star, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "IGMART — The #1 Gaming Marketplace | Buy & Sell Gaming Assets",
  description: "Buy, sell and trade gaming accounts, items, currency and boosting services across 300+ games. Secure escrow, verified sellers, 24/7 support. Join 3M+ gamers.",
};

const trustItems = [
  { icon: ShieldCheck, title: "Escrow Protection", desc: "Funds are held securely until you confirm delivery. Risk-free every time." },
  { icon: Star, title: "Verified Sellers", desc: "Every seller passes identity verification, history review, and delivery monitoring." },
  { icon: MessageSquare, title: "24/7 Support", desc: "Our team is available around the clock to help resolve any issue." },
  { icon: Scale, title: "Fair Disputes", desc: "Independent dispute resolution with a fair outcome for both parties." },
];

const howItWorks = [
  { step: "01", title: "Find What You Need", desc: "Search across 300+ games and thousands of listings. Filter by game, category, price, and delivery speed.", action: { label: "Browse Marketplace", href: "/marketplace" } },
  { step: "02", title: "Buy Securely", desc: "Pay with confidence. Your funds are held in escrow until you receive exactly what was promised.", action: { label: "How It Works", href: "/how-it-works" } },
  { step: "03", title: "Trade & Earn", desc: "Become a seller and earn from your gaming expertise. Create a listing in minutes and start earning.", action: { label: "Start Selling", href: "/sell" } },
];

export default function HomePage() {
  const popularGames = GAMES.filter((g) => g.popular).slice(0, 8);
  const featuredListings = LISTINGS.slice(0, 8);
  const featuredSellers = SELLERS;
  const featuredGuides = GUIDES.slice(0, 5);

  return (
    <>
      {/* ═════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════ */}
      <section
        aria-label="Hero"
        className="relative overflow-hidden min-h-[560px] flex items-center py-20 lg:py-28"
        style={{ background: "linear-gradient(180deg, #0A0C12 0%, var(--color-background) 70%, var(--color-surface) 100%)" }}
      >
        {/* Background image — low opacity */}
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
          <Image src="/images/hero-space.png" alt="" fill className="object-cover" priority />
        </div>
        {/* Gradient overlays */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/70 via-background/60 to-surface pointer-events-none" />
        <div
          aria-hidden="true"
          className="absolute top-[25%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full z-[1] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 70%)" }}
        />

        <div className="container relative z-10 text-center">
          {/* Trust badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/25 text-primary-hover px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
              <ShieldCheck size={13} aria-hidden="true" />
              Trade-Protected Marketplace
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading font-black text-[clamp(2.25rem,6vw,4.5rem)] uppercase text-text leading-[1.05] tracking-tight max-w-4xl mx-auto mb-5">
            Your Gaming{" "}
            <span className="text-gradient-brand">Marketplace</span>
          </h1>

          {/* Subheading */}
          <p className="text-text-muted text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Buy, sell and trade gaming accounts, items, currency and services across{" "}
            <strong className="text-text font-semibold">300+ games</strong> with 3M+ verified players worldwide.
          </p>

          <HomepageClient action="search" />

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-10">
            {[
              { label: "3M+ Gamers", icon: "🎮" },
              { label: "300+ Games", icon: "🕹️" },
              { label: "Instant Delivery", icon: "⚡" },
              { label: "24/7 Support", icon: "💬" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2" aria-hidden="true">
                <span className="text-lg">{b.icon}</span>
                <span className="text-text-secondary text-sm font-medium">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════
          2. CATEGORIES
      ══════════════════════════════════════════ */}
      <section aria-labelledby="cat-heading" className="bg-surface py-10 lg:py-14 border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 id="cat-heading" className="font-heading font-black text-xl text-text">Browse by Category</h2>
            <Link href="/marketplace" className="text-primary-hover text-sm font-semibold flex items-center gap-1 hover:gap-1.5 transition-all">
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/marketplace/${cat.slug}`}
                className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-elevated hover:-translate-y-0.5 transition-all duration-150 text-center group"
              >
                <span className="text-2xl sm:text-3xl mb-2 group-hover:scale-105 transition-transform duration-200" aria-hidden="true">
                  {cat.icon}
                </span>
                <span className="text-[12px] sm:text-sm font-semibold text-text-muted group-hover:text-text transition-colors leading-tight">
                  {cat.name}
                </span>
                <span className="text-[10px] font-medium text-text-muted mt-0.5 opacity-70">
                  {(cat.count / 1000).toFixed(0)}K+
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════
          3. POPULAR GAMES
      ══════════════════════════════════════════ */}
      <section aria-labelledby="games-heading" className="bg-background py-12 lg:py-20">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <SectionHeading eyebrow="Trending Now" title="Popular Games" subtitle="The most traded games on IGMART right now." />
            <Link href="/games" className="text-primary-hover text-sm font-semibold flex items-center gap-1 hover:gap-1.5 transition-all pb-2 flex-shrink-0">
              All games <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4">
            {popularGames.map((game) => (
              <GameCard key={game.id} id={game.id} name={game.name} slug={game.slug} image={game.image} sellers={game.sellers} />
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════
          4. FEATURED LISTINGS
      ══════════════════════════════════════════ */}
      <section aria-labelledby="listings-heading" className="bg-surface py-12 lg:py-20 border-t border-border">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <SectionHeading eyebrow="Marketplace" title="Featured Listings" subtitle="Hand-picked listings from our top verified sellers." />
            <Link href="/marketplace" className="text-primary-hover text-sm font-semibold flex items-center gap-1 hover:gap-1.5 transition-all pb-2 flex-shrink-0">
              All listings <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════
          5. TRUST / SECURITY
      ══════════════════════════════════════════ */}
      <section
        aria-labelledby="trust-heading"
        className="bg-background py-12 lg:py-20 border-t border-border relative overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(37,99,235,0.08) 0%, transparent 65%)" }}
        />
        <div className="container relative z-10">
          <SectionHeading
            eyebrow="The IGMART Difference"
            title="Your Security Is Our Priority"
            subtitle="Every transaction on IGMART is monitored and protected. We vet every seller, hold funds in escrow, and provide 24/7 dispute resolution."
            center
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-10">
            {trustItems.map((item, idx) => (
              <div key={idx} className="bg-card border border-border rounded-xl p-5 sm:p-6 text-center hover:border-primary/30 transition-colors">
                <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <item.icon size={24} aria-hidden="true" />
                </div>
                <h3 className="font-heading font-bold text-[15px] text-text mb-2">{item.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════
          6. HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section aria-labelledby="how-heading" className="bg-surface py-12 lg:py-20 border-t border-border">
        <div className="container">
          <SectionHeading eyebrow="Getting Started" title="How IGMART Works" center />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            {howItWorks.map((s) => (
              <div key={s.step} className="text-center">
                <div
                  className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center font-heading font-black text-xl text-white mb-5 shadow-[var(--shadow-md)]"
                  style={{ background: "var(--gradient-brand)" }}
                  aria-hidden="true"
                >
                  {s.step}
                </div>
                <h3 className="font-heading font-bold text-[17px] text-text mb-2">{s.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed mb-5 max-w-xs mx-auto">{s.desc}</p>
                <Link href={s.action.href} className="text-primary-hover font-semibold text-sm inline-flex items-center gap-1 hover:gap-1.5 transition-all">
                  {s.action.label} <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════
          7. TOP SELLERS
      ══════════════════════════════════════════ */}
      <section aria-labelledby="sellers-heading" className="bg-background py-12 lg:py-20 border-t border-border">
        <div className="container">
          <SectionHeading eyebrow="Top Sellers" title="Meet Our Best Sellers" center />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-10">
            {featuredSellers.map((seller) => (
              <Link
                key={seller.id}
                href={`/seller/${seller.username}`}
                className="block rounded-xl border border-border bg-card p-5 hover:border-border-strong hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] transition-all duration-200"
              >
                <div className="flex items-center gap-3.5 mb-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-heading font-black text-base text-white flex-shrink-0"
                    style={{ background: "var(--gradient-brand)" }}
                    aria-hidden="true"
                  >
                    {seller.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-heading font-bold text-[15px] text-text truncate">{seller.displayName}</p>
                      {seller.verified && <Badge variant="verified" size="sm">✓</Badge>}
                    </div>
                    <p className="text-xs text-text-muted font-medium">Member since {seller.memberSince}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Rating", val: `${seller.rating}★` },
                    { label: "Orders", val: seller.orders.toLocaleString() },
                    { label: "Response", val: seller.responseTime },
                  ].map((m) => (
                    <div key={m.label} className="bg-elevated rounded-lg p-2.5 text-center">
                      <p className="font-heading font-black text-sm text-text">{m.val}</p>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════
          8. SELL CTA
      ══════════════════════════════════════════ */}
      <section
        aria-labelledby="sell-cta-heading"
        className="py-16 lg:py-24 border-y border-border"
        style={{ background: "linear-gradient(135deg, #141e35 0%, #12151c 50%, #131840 100%)" }}
      >
        <div className="container text-center">
          <p className="text-xs font-bold tracking-[0.1em] uppercase text-primary-hover mb-4">For Gamers</p>
          <h2 id="sell-cta-heading" className="font-heading font-black text-3xl sm:text-4xl lg:text-[2.75rem] text-text mb-4 uppercase tracking-tight">
            Start Earning From Your{" "}
            <span className="text-gradient-brand">Gaming Skills</span>
          </h2>
          <p className="text-text-muted text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Join 18,000+ verified sellers on IGMART. List your gaming accounts, items, services and earn money doing what you love.
          </p>
          <HomepageClient action="sellcta" />
        </div>
      </section>

      {/* ═════════════════════════════════════════
          9. REVIEWS
      ══════════════════════════════════════════ */}
      <section aria-labelledby="reviews-heading" className="bg-surface py-12 lg:py-20">
        <div className="container">
          <SectionHeading eyebrow="Community Trust" title="What Gamers Say" center />
          <div className="flex flex-col items-center mb-8">
            <Stars rating={5} size={22} />
            <p className="text-text-muted text-sm mt-2">
              <strong className="text-text font-bold">4.8/5</strong> — based on verified marketplace reviews
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {REVIEWS.map((r) => (
              <div key={r.id} className="bg-card border border-border rounded-xl p-4 sm:p-5 flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm text-text">{r.author}</p>
                    <p className="text-xs text-text-muted mt-0.5">{r.date}</p>
                  </div>
                  <Stars rating={r.rating} size={13} />
                </div>
                <p className="font-semibold text-sm text-text-secondary mb-2 leading-snug">{r.title}</p>
                <p className="text-sm text-text-muted leading-relaxed mb-4 flex-grow">{r.body}</p>
                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border/60">
                  {r.verified && <Badge variant="verified" size="sm">✓ Verified</Badge>}
                  <Badge variant="default" size="sm">{r.game}</Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/reviews" className="text-primary-hover text-sm font-semibold inline-flex items-center gap-1 hover:gap-1.5 transition-all">
              View All Reviews <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════
          10. GUIDES
      ══════════════════════════════════════════ */}
      <section aria-labelledby="guides-heading" className="bg-background py-12 lg:py-20 border-t border-border">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <SectionHeading eyebrow="Gaming Guides" title="Read Our Latest Guides" />
            <Link href="/guides" className="text-primary-hover text-sm font-semibold flex items-center gap-1 hover:gap-1.5 transition-all pb-2 flex-shrink-0">
              All guides <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {featuredGuides.map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.slug}`}
                className="group block rounded-xl overflow-hidden border border-border bg-card hover:border-border-strong hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] transition-all duration-200"
              >
                <div className="aspect-video relative overflow-hidden bg-elevated">
                  <Image
                    src={guide.image}
                    alt={guide.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="hot" size="sm">{guide.category}</Badge>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-medium text-text-muted mb-1.5">{guide.date} · {guide.readTime}</p>
                  <p className="text-[13px] font-semibold text-text leading-snug group-hover:text-primary-hover transition-colors line-clamp-2">
                    {guide.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════
          11. FAQ
      ══════════════════════════════════════════ */}
      <section aria-labelledby="faq-heading" className="bg-surface py-12 lg:py-20 border-t border-border">
        <div className="container max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" center />
          <HomepageClient action="faq" faqItems={FAQ_ITEMS} />
          <div className="text-center mt-8">
            <Link href="/faq" className="text-primary-hover text-sm font-semibold inline-flex items-center gap-1 hover:gap-1.5 transition-all">
              View all FAQs <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
