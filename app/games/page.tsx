import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { GAMES } from "@/lib/data/igmartData";
import { SectionHeading } from "@/components/ui/index";
import { ShieldCheck, Users, Flame, Star, ArrowRight, Gamepad2 } from "lucide-react";
import { JsonLd, getBreadcrumbSchema } from "@/components/seo/JsonLd";
import { GamesDirectoryClient } from "@/components/games/GamesDirectoryClient";

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
        <GamesDirectoryClient />

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
