import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { GAMES, LISTINGS, SELLERS, REVIEWS, GUIDES, FAQ_ITEMS } from "@/lib/data/igmartData";
import { Badge, Stars, SectionHeading, Button } from "@/components/ui/index";
import { GameCard } from "@/components/shared/GameCard";
import { ListingCard } from "@/components/shared/ListingCard";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import HomepageClient from "@/components/home/HomepageClient";
import { Zap, ShieldCheck, MessageSquare, Scale, Star, ArrowRight, BadgeCheck, Clock, Wallet } from "lucide-react";

export const metadata: Metadata = {
  title: "IGMART — #1 Gaming Account Marketplace | Buy & Sell Game Accounts",
  description: "Buy and sell verified gaming accounts across 300+ games. Secure escrow, instant delivery, verified sellers. Join 3M+ gamers on IGMART.",
};

const trustItems = [
  { icon: ShieldCheck, title: "Escrow Protection", desc: "Your payment is held securely until you confirm delivery. 100% risk-free." },
  { icon: BadgeCheck, title: "Verified Sellers", desc: "Every seller passes KYC identity checks, history review, and delivery monitoring." },
  { icon: MessageSquare, title: "24/7 Live Support", desc: "Real humans available around the clock to resolve any issue instantly." },
  { icon: Scale, title: "Fair Dispute System", desc: "Independent resolution team ensures a fair outcome for every dispute." },
];

const howItWorks = [
  { step: "01", title: "Find Your Account", desc: "Search across 300+ games. Filter by game, price, hero level, rank, and delivery speed.", action: { label: "Browse Accounts", href: "/marketplace/accounts" } },
  { step: "02", title: "Pay with Escrow", desc: "Your funds are held safely until you receive and confirm the account is exactly as described.", action: { label: "How It Works", href: "/how-it-works" } },
  { step: "03", title: "Sell & Earn", desc: "List your gaming accounts in minutes. Join 18K+ verified sellers and start earning from your assets.", action: { label: "Start Selling", href: "/sell" } },
];

const whyBuyHere = [
  { icon: BadgeCheck, label: "100% Verified Accounts", sub: "Every listing is reviewed by our team" },
  { icon: Wallet, label: "Secure Escrow Payment", sub: "Funds released only on your approval" },
  { icon: Zap, label: "Instant Delivery", sub: "Most accounts transferred within minutes" },
  { icon: Clock, label: "24/7 Dispute Cover", sub: "Full support if anything goes wrong" },
];

export default function HomePage() {
  const popularGames = GAMES.filter((g) => g.popular).slice(0, 10);
  const featuredSellers = SELLERS;
  const featuredGuides = GUIDES.slice(0, 5);

  return (
    <>
      {/* ══════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════ */}
      <section
        aria-label="Hero"
        className="relative overflow-hidden min-h-[580px] flex items-center py-20 lg:py-32"
        style={{ background: "linear-gradient(180deg, #07080f 0%, #0a0c14 60%, var(--color-surface) 100%)" }}
      >
        {/* Ambient glow blobs */}
        <div aria-hidden="true" className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full pointer-events-none z-0"
          style={{ background: "radial-gradient(ellipse, rgba(99,60,255,0.13) 0%, transparent 70%)" }} />
        <div aria-hidden="true" className="absolute bottom-0 right-0 w-[500px] h-[300px] pointer-events-none z-0"
          style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 70%)" }} />

        {/* Background hero image */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <Image src="/images/hero-space.png" alt="" fill className="object-cover" priority />
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-background/20 to-surface pointer-events-none" />

        <div className="container relative z-10 text-center">
          {/* Trust pill */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 text-primary-hover px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
              <ShieldCheck size={12} aria-hidden="true" />
              Verified Accounts · Escrow Protected
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading font-black text-[clamp(2.4rem,6.5vw,5rem)] uppercase text-text leading-[1.04] tracking-tight max-w-4xl mx-auto mb-5">
            Buy & Sell{" "}
            <span className="text-gradient-brand">Game Accounts</span>
            <br className="hidden sm:block" /> The Safe Way
          </h1>

          {/* Sub */}
          <p className="text-text-muted text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            The #1 marketplace for verified gaming accounts across{" "}
            <strong className="text-text font-semibold">300+ games</strong> — with escrow protection, instant delivery, and 3M+ trusted players.
          </p>

          <HomepageClient action="search" />

          {/* Stats strip */}
          <div className="flex flex-wrap justify-center gap-5 sm:gap-10 mt-10">
            {[
              { label: "3M+ Gamers", icon: "🎮" },
              { label: "300+ Games", icon: "🕹️" },
              { label: "45K+ Accounts", icon: "👤" },
              { label: "Instant Delivery", icon: "⚡" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2" aria-hidden="true">
                <span className="text-lg">{b.icon}</span>
                <span className="text-text-secondary text-sm font-semibold">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. WHY BUY HERE — value strip
      ══════════════════════════════════════════ */}
      <section aria-label="Why buy on IGMART" className="bg-surface border-y border-border py-8">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {whyBuyHere.map((item) => (
              <div key={item.label} className="flex items-center gap-3.5 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon size={20} className="text-primary-hover" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-text leading-snug">{item.label}</p>
                  <p className="text-[11px] text-text-muted leading-snug mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. POPULAR GAMES
      ══════════════════════════════════════════ */}
      <section aria-labelledby="games-heading" className="bg-background py-14 lg:py-20">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <SectionHeading
              eyebrow="Browse by Game"
              title="Popular Games"
              subtitle="Find accounts for the most traded games on IGMART."
            />
            <Link href="/games" className="text-primary-hover text-sm font-semibold flex items-center gap-1 hover:gap-1.5 transition-all pb-2 flex-shrink-0">
              All games <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {popularGames.map((game) => (
              <GameCard key={game.id} id={game.id} name={game.name} slug={game.slug} image={game.image} sellers={game.sellers} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. FEATURED LISTINGS
      ══════════════════════════════════════════ */}
      <section aria-labelledby="listings-heading" className="bg-surface py-14 lg:py-20 border-t border-border">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <SectionHeading
              eyebrow="Hot Right Now"
              title="Featured Accounts"
              subtitle="Hand-picked listings from our top verified sellers."
            />
            <Link href="/marketplace" className="text-primary-hover text-sm font-semibold flex items-center gap-1 hover:gap-1.5 transition-all pb-2 flex-shrink-0">
              All accounts <ArrowRight size={15} />
            </Link>
          </div>
          <FeaturedListings />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. TRUST / SECURITY
      ══════════════════════════════════════════ */}
      <section
        aria-labelledby="trust-heading"
        className="bg-background py-14 lg:py-20 border-t border-border relative overflow-hidden"
      >
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(99,60,255,0.09) 0%, transparent 65%)" }} />
        <div className="container relative z-10">
          <SectionHeading
            eyebrow="The IGMART Difference"
            title="Your Security Is Our Priority"
            subtitle="Every transaction is monitored and protected. We vet every seller, hold funds in escrow, and provide 24/7 dispute resolution."
            center
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {trustItems.map((item, idx) => (
              <div key={idx} className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200">
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

      {/* ══════════════════════════════════════════
          6. HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section aria-labelledby="how-heading" className="bg-surface py-14 lg:py-20 border-t border-border">
        <div className="container">
          <SectionHeading eyebrow="Getting Started" title="How IGMART Works" center />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {howItWorks.map((s, i) => (
              <div key={s.step} className="relative text-center">
                {/* Connector line */}
                {i < howItWorks.length - 1 && (
                  <div aria-hidden="true" className="hidden md:block absolute top-7 left-[calc(50%+2rem)] right-[-50%] h-px bg-gradient-to-r from-border via-primary/30 to-transparent" />
                )}
                <div
                  className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center font-heading font-black text-xl text-white mb-5 shadow-lg"
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

      {/* ══════════════════════════════════════════
          7. TOP SELLERS
      ══════════════════════════════════════════ */}
      <section aria-labelledby="sellers-heading" className="bg-background py-14 lg:py-20 border-t border-border">
        <div className="container">
          <SectionHeading eyebrow="Top Sellers" title="Meet Our Best Sellers" center />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
            {featuredSellers.map((seller) => (
              <Link
                key={seller.id}
                href={`/seller/${seller.username}`}
                className="block rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] transition-all duration-200 group"
              >
                <div className="flex items-center gap-3.5 mb-5">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-heading font-black text-base text-white flex-shrink-0 shadow-md"
                    style={{ background: "var(--gradient-brand)" }}
                    aria-hidden="true"
                  >
                    {seller.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-heading font-bold text-[15px] text-text truncate group-hover:text-primary-hover transition-colors">{seller.displayName}</p>
                      {seller.verified && <Badge variant="verified" size="sm">✓</Badge>}
                    </div>
                    <p className="text-xs text-text-muted font-medium mt-0.5">Member since {seller.memberSince}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Rating", val: `${seller.rating}★` },
                    { label: "Orders", val: seller.orders.toLocaleString() },
                    { label: "Response", val: seller.responseTime },
                  ].map((m) => (
                    <div key={m.label} className="bg-elevated rounded-xl p-2.5 text-center">
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

      {/* ══════════════════════════════════════════
          8. SELL CTA
      ══════════════════════════════════════════ */}
      <section
        aria-labelledby="sell-cta-heading"
        className="py-20 lg:py-28 border-y border-border relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #10163a 0%, #0d1020 50%, #12183f 100%)" }}
      >
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(99,60,255,0.12) 0%, transparent 60%)" }} />
        <div className="container text-center relative z-10">
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-primary-hover mb-4">For Gamers · By Gamers</p>
          <h2 id="sell-cta-heading" className="font-heading font-black text-3xl sm:text-4xl lg:text-[2.75rem] text-text mb-4 uppercase tracking-tight leading-tight">
            Turn Your Accounts Into{" "}
            <span className="text-gradient-brand">Real Money</span>
          </h2>
          <p className="text-text-muted text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Join 18,000+ verified sellers on IGMART. List your gaming accounts in minutes and earn from assets you no longer use.
          </p>
          <HomepageClient action="sellcta" />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          9. REVIEWS
      ══════════════════════════════════════════ */}
      <section aria-labelledby="reviews-heading" className="bg-surface py-14 lg:py-20">
        <div className="container">
          <SectionHeading eyebrow="Community Trust" title="What Gamers Say" center />
          <div className="flex flex-col items-center mb-8">
            <Stars rating={5} size={22} />
            <p className="text-text-muted text-sm mt-2">
              <strong className="text-text font-bold">4.8/5</strong> — based on verified marketplace reviews
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {REVIEWS.map((r) => (
              <div key={r.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col h-full hover:border-border-strong transition-colors">
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
        </div>
      </section>

      {/* ══════════════════════════════════════════
          10. GUIDES
      ══════════════════════════════════════════ */}
      <section aria-labelledby="guides-heading" className="bg-background py-14 lg:py-20 border-t border-border">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <SectionHeading eyebrow="Gaming Guides" title="Read Our Latest Guides" />
            <Link href="/guides" className="text-primary-hover text-sm font-semibold flex items-center gap-1 hover:gap-1.5 transition-all pb-2 flex-shrink-0">
              All guides <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {featuredGuides.map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.slug}`}
                className="group block rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] transition-all duration-200"
              >
                <div className="aspect-video relative overflow-hidden bg-elevated">
                  <Image
                    src={guide.image}
                    alt={guide.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover object-top group-hover:scale-[1.04] transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
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

      {/* ══════════════════════════════════════════
          11. FAQ
      ══════════════════════════════════════════ */}
      <section aria-labelledby="faq-heading" className="bg-surface py-14 lg:py-20 border-t border-border">
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
