import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { GAMES } from "@/lib/data/igmartData";
import { SectionHeading } from "@/components/ui/index";
import { ShieldCheck, Users, Flame, Star, ArrowRight, Gamepad2 } from "lucide-react";
import { JsonLd, getBreadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "All Supported Games — Browse Accounts & Assets | IGMART",
  description: "Explore verified gaming accounts, currency, items, and boosting across all supported games on IGMART. 100% Escrow Protection, instant delivery, 24/7 support.",
  alternates: {
    canonical: "https://igmart.store/games",
  },
  openGraph: {
    title: "All Supported Games — Browse Accounts & Assets | IGMART",
    description: "Explore verified gaming accounts, currency, items, and boosting across all supported games on IGMART.",
    url: "https://igmart.store/games",
  },
};

export default function GamesDirectoryPage() {
  const breadcrumb = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Games", url: "/games" },
  ]);

  return (
    <div className="bg-background min-h-screen py-12 lg:py-16">
      <JsonLd data={breadcrumb} />
      <div className="container max-w-6xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary-hover px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Gamepad2 size={14} /> Official Game Directory
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-text tracking-tight">
            Browse By Supported Game
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Select a game to browse verified accounts, rare items, and boosting services protected by IGMART Escrow.
          </p>
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map((game) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className="group bg-card border border-border hover:border-primary/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-elevated">
                <Image
                  src={game.image}
                  alt={game.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="bg-primary/90 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                    {game.category}
                  </span>
                  {game.popular && (
                    <span className="bg-amber-500/90 text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Flame size={11} /> HOT
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star size={13} className="fill-amber-400" />
                    <span>{game.rating}</span>
                  </div>
                  <span className="text-[11px] text-gray-300">
                    {game.listings.toLocaleString()} active listings
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col justify-between flex-grow gap-4">
                <div>
                  <h2 className="font-heading font-black text-xl text-text group-hover:text-primary-hover transition-colors mb-1">
                    {game.name}
                  </h2>
                  <p className="text-text-muted text-xs">
                    Over {game.sellers.toLocaleString()} verified sellers offering instant delivery accounts and items.
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                  <span>Browse {game.name}</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Escrow Guarantee Callout */}
        <div className="bg-[#121622] border border-[#1e2436] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-white">100% Escrow Trade Protection</h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
                Every trade is protected by our automated escrow system. Funds are released to the seller only when you inspect and verify complete account delivery.
              </p>
            </div>
          </div>
          <Link
            href="/how-it-works"
            className="shrink-0 bg-primary hover:bg-primary-hover text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          >
            Learn How It Works
          </Link>
        </div>
      </div>
    </div>
  );
}
