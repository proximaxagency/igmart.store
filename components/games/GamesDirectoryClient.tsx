"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Users, Flame, Star, ArrowRight, Gamepad2 } from "lucide-react";
import { useGameVisibility } from "@/lib/gamesVisibility";

export function GamesDirectoryClient() {
  const { visibleGames, isLoaded } = useGameVisibility();

  if (visibleGames.length === 0) {
    return (
      <div className="p-12 text-center bg-card border border-border rounded-2xl">
        <Gamepad2 className="mx-auto text-text-muted mb-3 opacity-30" size={40} />
        <p className="font-bold text-base text-text">No Games Currently Active</p>
        <p className="text-xs text-text-muted mt-1">Please check back shortly or contact 24/7 support.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {visibleGames.map((game) => (
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
              className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="bg-primary/90 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                {game.category}
              </span>
              {game.popular && (
                <span className="bg-amber-500 text-black font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Flame size={10} /> HOT
                </span>
              )}
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
              <span className="flex items-center gap-1 font-semibold text-warning">
                <Star size={12} fill="currentColor" /> {game.rating}
              </span>
              <span className="font-mono text-[11px] bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                {game.listings} Offers Live
              </span>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <h2 className="font-heading font-black text-xl text-text group-hover:text-primary transition-colors">
                {game.name}
              </h2>
              <div className="flex items-center gap-4 text-xs text-text-muted mt-2">
                <span className="flex items-center gap-1.5">
                  <Users size={13} className="text-primary" /> {game.sellers} Verified Sellers
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-success" /> Escrow Safe
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-bold text-primary group-hover:text-primary-hover">
              <span>Explore Marketplace</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
