"use client";

import { GAMES } from "@/lib/data/igmartData";
import { GameCard } from "@/components/shared/GameCard";
import { useGameVisibility } from "@/lib/gamesVisibility";

export function HomePopularGames() {
  const { isGameVisible } = useGameVisibility();

  const visiblePopular = GAMES.filter((g) => g.popular && isGameVisible(g.slug));

  if (visiblePopular.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {visiblePopular.map((game) => (
        <GameCard
          key={game.id}
          id={game.id}
          name={game.name}
          slug={game.slug}
          image={game.image}
          sellers={game.sellers}
        />
      ))}
    </div>
  );
}
