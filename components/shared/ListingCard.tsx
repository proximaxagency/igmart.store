import Link from "next/link";
import Image from "next/image";
import { Badge, Stars, PriceDisplay, WishlistButton } from "@/components/ui/index";
import { Zap } from "lucide-react";

export type ListingCardVariant = "default" | "compact" | "horizontal";

export interface ListingCardProps {
  id: string;
  title: string;
  game: string;
  price: number;
  originalPrice?: number | null;
  rating: number;
  reviews?: number;
  seller: string;
  image: string;
  badge?: string | null;
  delivery?: string | null;
  variant?: ListingCardVariant;
  className?: string;
}

function getBadgeVariant(badge: string) {
  if (badge === "HOT") return "hot";
  if (badge === "SALE") return "sale";
  return "popular";
}

// ── Horizontal layout (list view) ──────────────────
function HorizontalListingCard({ id, title, game, price, originalPrice, rating, reviews, seller, image, badge, delivery, className = "" }: ListingCardProps) {
  return (
    <Link
      href={`/listing/${id}`}
      aria-label={`${title} — ${game}`}
      className={`group flex items-center gap-4 bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:border-border-strong hover:shadow-[var(--shadow-sm)] hover:bg-elevated/40 ${className}`}
    >
      <div className="relative w-28 h-20 flex-shrink-0 overflow-hidden bg-elevated">
        <Image src={image} alt="" fill loading="lazy" className="object-cover object-top" />
        {badge && (
          <div className="absolute top-2 left-2">
            <Badge variant={getBadgeVariant(badge)}>{badge}</Badge>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 py-3 pr-4">
        <p className="text-sm font-semibold text-text leading-snug line-clamp-1 mb-1 group-hover:text-primary-hover transition-colors">
          {title}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-text-muted mb-1.5">
          <span className="font-bold uppercase tracking-wider">{game}</span>
          {delivery && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1 text-warning font-semibold">
                <Zap size={10} /> {delivery}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between">
          <PriceDisplay price={price} originalPrice={originalPrice} size="sm" showDiscount />
          <Stars rating={rating} count={reviews} compact />
        </div>
      </div>
    </Link>
  );
}

// ── Compact layout (minimal) ───────────────────────
function CompactListingCard({ id, title, game, price, rating, image, badge, className = "" }: ListingCardProps) {
  return (
    <Link
      href={`/listing/${id}`}
      aria-label={`${title} — ${game}`}
      className={`group flex flex-col bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:border-border-strong hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] ${className}`}
    >
      <div className="relative aspect-video overflow-hidden bg-elevated">
        <Image src={image} alt="" fill loading="lazy" className="object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        {badge && (
          <div className="absolute top-2 left-2">
            <Badge variant={getBadgeVariant(badge)}>{badge}</Badge>
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          <Stars rating={rating} compact />
        </div>
      </div>
      <div className="p-3">
        <p className="text-[13px] font-semibold text-text line-clamp-1 mb-2">{title}</p>
        <div className="flex items-center justify-between">
          <PriceDisplay price={price} size="sm" />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider bg-elevated px-2 py-0.5 rounded-full border border-border">{game}</span>
        </div>
      </div>
    </Link>
  );
}

// ── Default card (full info) ────────────────────────
export function ListingCard({
  id, title, game, price, originalPrice, rating, reviews, seller, image, badge, delivery,
  variant = "default",
  className = "",
}: ListingCardProps) {
  if (variant === "horizontal") return <HorizontalListingCard {...{ id, title, game, price, originalPrice, rating, reviews, seller, image, badge, delivery, variant, className }} />;
  if (variant === "compact") return <CompactListingCard {...{ id, title, game, price, originalPrice, rating, reviews, seller, image, badge, delivery, variant, className }} />;

  return (
    <Link
      href={`/listing/${id}`}
      aria-label={`${title} — ${game}`}
      className={`group flex flex-col bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:border-border-strong hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] ${className}`}
    >
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-elevated">
        <Image
          src={image}
          alt=""
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-top will-change-transform transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

        {/* Badge */}
        {badge && (
          <div className="absolute top-2.5 left-2.5">
            <Badge variant={getBadgeVariant(badge)}>{badge}</Badge>
          </div>
        )}

        {/* Wishlist */}
        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <WishlistButton />
        </div>

        {/* Delivery tag */}
        {delivery && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-black/65 backdrop-blur-sm px-2 py-1 rounded-full border border-white/8">
            <Zap size={10} className="text-warning" />
            <span className="text-[10px] font-bold text-white">{delivery}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Game tag + title */}
        <div>
          <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-text-muted mb-1.5">
            {game}
          </span>
          <p className="text-[13px] font-semibold text-text leading-snug line-clamp-2 group-hover:text-primary-hover transition-colors duration-150">
            {title}
          </p>
        </div>

        {/* Footer: price + rating */}
        <div className="mt-auto flex items-end justify-between">
          <PriceDisplay price={price} originalPrice={originalPrice} size="md" showDiscount />
          <div className="flex flex-col items-end gap-0.5">
            <Stars rating={rating} compact />
            <span className="text-[10px] font-medium text-text-muted truncate max-w-[80px]">
              {seller}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
