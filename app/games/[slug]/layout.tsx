import type { Metadata } from "next";
import { GAMES } from "@/lib/data/igmartData";

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const game = GAMES.find((g) => g.slug === slug);

  if (!game) {
    return {
      title: "Game Accounts & Marketplace | IGMART",
      description: "Buy and sell verified game accounts, currency, and items with instant delivery.",
    };
  }

  const title = `Buy & Sell ${game.name} Accounts, Items & Assets | IGMART`;
  const description = `Shop verified ${game.name} accounts, items, and assets on IGMART. Instant delivery, 100% escrow protection, and 24/7 support. Join thousands of satisfied players.`;

  return {
    title,
    description,
    keywords: `${game.name} accounts, buy ${game.name} account, sell ${game.name} items, ${game.name} trading, IGMART gaming marketplace`,
    alternates: {
      canonical: `https://igmart.store/games/${game.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://igmart.store/games/${game.slug}`,
      images: game.image ? [{ url: game.image, alt: game.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: game.image ? [game.image] : undefined,
    },
  };
}

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
