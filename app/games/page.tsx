import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { GAMES } from "@/lib/data/igmartData";
import { SectionHeading, Badge } from "@/components/ui/index";

export const metadata: Metadata = {
  title: "All Games",
  description: "Browse our complete directory of supported games.",
};

export default function GamesPage() {
  const categories = Array.from(new Set(GAMES.map(g => g.category)));
  
  return (
    <div className="container py-12 lg:py-16">
      <SectionHeading eyebrow="Directory" title="All Supported Games" subtitle="Browse our complete list of supported games and find exactly what you're looking for." />
      
      {/* Mobile-optimized Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex-1 flex items-center bg-card border border-border rounded-xl px-4 min-h-[48px] focus-within:border-primary-hover focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <Search size={20} className="text-text-muted mr-3" />
          <input 
            placeholder="Search for a game..." 
            className="bg-transparent border-none outline-none text-text w-full text-base placeholder:text-text-muted"
          />
        </div>
        
        {/* Horizontal scrollable tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 hide-scrollbar" style={{ scrollbarWidth: "none" }}>
          <button className="bg-primary hover:bg-primary-hover text-white px-5 rounded-lg min-h-[48px] font-bold text-sm whitespace-nowrap transition-colors flex-shrink-0">
            All Games
          </button>
          {categories.map(c => (
            <button key={c} className="bg-card border border-border text-text-secondary hover:text-text hover:bg-elevated px-5 rounded-lg min-h-[48px] font-bold text-sm whitespace-nowrap transition-colors flex-shrink-0">
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {GAMES.map(game => (
          <Link
            key={game.id}
            href={`/games/${game.slug}`}
            className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary-hover/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
          >
            <div className="aspect-video relative overflow-hidden bg-elevated">
              <Image 
                src={game.image} 
                alt={game.name} 
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              {game.popular && (
                <div className="absolute top-3 left-3">
                  <Badge variant="hot">HOT</Badge>
                </div>
              )}
              
              <div className="absolute bottom-3 left-3 right-3">
                <p className="font-heading font-black text-lg text-white leading-tight mb-0.5">{game.name}</p>
                <p className="text-xs font-semibold text-text-muted">{game.category}</p>
              </div>
            </div>
            
            <div className="p-4 flex justify-between items-center bg-card">
              <div>
                <p className="text-lg font-bold text-text leading-tight">{game.listings.toLocaleString()}</p>
                <p className="text-[11px] font-bold tracking-wider uppercase text-text-muted">Listings</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-right">
                <p className="text-lg font-bold text-text leading-tight">{game.sellers.toLocaleString()}</p>
                <p className="text-[11px] font-bold tracking-wider uppercase text-text-muted">Sellers</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
