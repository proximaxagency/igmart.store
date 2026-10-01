// IGMART.STORE — Game Visibility Governance Engine
// Enables admins to show or hide games on the main storefront while 100% preserving account data

"use client";

import { useState, useEffect, useCallback } from "react";
import { GAMES } from "@/lib/data/igmartData";

export const STORAGE_KEY = "igmart_enabled_games";
export const VISIBILITY_EVENT = "igmart_game_visibility_changed";

// Default: all 5 games active
export const DEFAULT_ACTIVE_SLUGS = [
  "clash-of-clans",
  "pokemon-go",
  "free-fire",
  "roblox",
  "clash-royale",
];

// Helper to get active slugs synchronously from localStorage or cookies
export function getActiveGameSlugs(): string[] {
  if (typeof window === "undefined") {
    return DEFAULT_ACTIVE_SLUGS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Cookie fallback
    const match = document.cookie.match(new RegExp(`(^| )${STORAGE_KEY}=([^;]+)`));
    if (match && match[2]) {
      const parsed = JSON.parse(decodeURIComponent(match[2]));
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("[GameVisibility] Error reading stored settings:", e);
  }

  return DEFAULT_ACTIVE_SLUGS;
}

// Save active slugs to both localStorage and cookie, then broadcast
export function saveActiveGameSlugs(slugs: string[]): void {
  if (typeof window === "undefined") return;

  try {
    const clean = Array.from(new Set(slugs));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent(JSON.stringify(clean))}; path=/; max-age=31536000; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent(VISIBILITY_EVENT, { detail: clean }));
  } catch (e) {
    console.error("[GameVisibility] Failed to save game settings:", e);
  }
}

// React hook for consuming and updating game visibility state
export function useGameVisibility() {
  const [activeSlugs, setActiveSlugs] = useState<string[]>(DEFAULT_ACTIVE_SLUGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setActiveSlugs(getActiveGameSlugs());
    setIsLoaded(true);

    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setActiveSlugs(e.detail);
      } else {
        setActiveSlugs(getActiveGameSlugs());
      }
    };

    window.addEventListener(VISIBILITY_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(VISIBILITY_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const isGameVisible = useCallback(
    (slugOrId: string) => {
      const s = slugOrId.toLowerCase().trim();
      return activeSlugs.some((a) => a.toLowerCase() === s);
    },
    [activeSlugs]
  );

  const toggleGame = useCallback(
    (slug: string) => {
      const normalized = slug.toLowerCase().trim();
      const next = activeSlugs.includes(normalized)
        ? activeSlugs.filter((s) => s !== normalized)
        : [...activeSlugs, normalized];
      setActiveSlugs(next);
      saveActiveGameSlugs(next);
    },
    [activeSlugs]
  );

  const setGameVisibility = useCallback(
    (slug: string, isVisible: boolean) => {
      const normalized = slug.toLowerCase().trim();
      let next: string[];
      if (isVisible) {
        next = activeSlugs.includes(normalized) ? activeSlugs : [...activeSlugs, normalized];
      } else {
        next = activeSlugs.filter((s) => s !== normalized);
      }
      setActiveSlugs(next);
      saveActiveGameSlugs(next);
    },
    [activeSlugs]
  );

  const setAllGames = useCallback((slugs: string[]) => {
    setActiveSlugs(slugs);
    saveActiveGameSlugs(slugs);
  }, []);

  // Filtered games array from raw GAMES catalog
  const visibleGames = GAMES.filter((g) => isGameVisible(g.slug) || isGameVisible(g.id));

  return {
    allGames: GAMES,
    visibleGames,
    activeSlugs,
    isGameVisible,
    toggleGame,
    setGameVisibility,
    setAllGames,
    isLoaded,
  };
}
