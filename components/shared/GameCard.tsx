import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";

export type GameCardVariant = "default" | "compact" | "featured";

export interface GameCardProps {
  id: string;
  name: string;
  slug: string;
  image: string;
  sellers: number;
  listings?: number;
  variant?: GameCardVariant;
  className?: string;
}

export function GameCard({
  name,
  slug,
  image,
  sellers,
  listings,
  variant = "default",
  className = "",
}: GameCardProps) {
  if (variant === "compact") {
    return (
      <Link
        href={`/games/${slug}`}
        className={`group flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-border-strong hover:bg-elevated transition-all duration-150 ${className}`}
      >
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-elevated">
          <Image src={image} alt={name} fill className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="font-heading font-bold text-sm text-text truncate group-hover:text-primary-hover transition-colors">
            {name}
          </p>
          <p className="text-[11px] text-text-muted font-medium mt-0.5">
            {sellers.toLocaleString()} sellers
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/games/${slug}`}
      className={`group relative overflow-hidden rounded-xl bg-card border border-border transition-all duration-200 hover:border-border-strong hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] ${className}`}
    >
      <div className={`relative w-full ${variant === "featured" ? "aspect-[2/3]" : "aspect-[3/4] sm:aspect-[4/5]"}`}>
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover object-top opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-heading font-black text-base sm:text-lg text-white leading-tight mb-1 group-hover:text-primary-hover transition-colors line-clamp-2">
            {name}
          </h3>
          <div className="flex items-center gap-1.5 text-white/60 text-[11px] font-medium">
            <Users size={11} />
            <span>{sellers.toLocaleString()} sellers</span>
          </div>
        </div>

        {/* Hover overlay accent */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </div>
    </Link>
  );
}
