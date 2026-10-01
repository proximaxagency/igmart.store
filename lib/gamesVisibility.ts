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

// Save active slugs to both localStorage and cookie, then broadcast and sync to server
export function saveActiveGameSlugs(slugs: string[]): void {
  if (typeof window === "undefined") return;

  try {
    const clean = Array.from(new Set(slugs));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent(JSON.stringify(clean))}; path=/; max-age=31536000; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent(VISIBILITY_EVENT, { detail: clean }));

    // Sync to centralized server API so mobile devices and other browsers update immediately
    fetch("/api/games-visibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeSlugs: clean }),
    }).catch((err) => {
      console.warn("[GameVisibility] Server sync failed:", err);
    });
  } catch (e) {
    console.error("[GameVisibility] Failed to save game settings:", e);
  }
}

// React hook for consuming and updating game visibility state
export function useGameVisibility() {
  const [activeSlugs, setActiveSlugs] = useState<string[]>(getActiveGameSlugs());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setActiveSlugs(getActiveGameSlugs());
    setIsLoaded(true);

    // Sync from server API so phone immediately picks up changes made on laptop/admin
    const syncFromServer = async () => {
      try {
        const res = await fetch("/api/games-visibility", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.activeSlugs) && data.activeSlugs.length > 0) {
            setActiveSlugs((current) => {
              const currentSorted = [...current].sort().join(",");
              const newSorted = [...data.activeSlugs].sort().join(",");
              if (currentSorted !== newSorted) {
                try {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(data.activeSlugs));
                  document.cookie = `${STORAGE_KEY}=${encodeURIComponent(JSON.stringify(data.activeSlugs))}; path=/; max-age=31536000; SameSite=Lax`;
                } catch (_) {}
                return data.activeSlugs;
              }
              return current;
            });
          }
        }
      } catch (err) {
        // Silently preserve local state if network is unavailable
      }
    };

    // Immediate initial sync
    syncFromServer();

    // Listen to local tab changes
    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setActiveSlugs(e.detail);
      } else {
        setActiveSlugs(getActiveGameSlugs());
      }
    };

    window.addEventListener(VISIBILITY_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // Re-sync when user focuses tab or switches back to browser on mobile
    window.addEventListener("focus", syncFromServer);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncFromServer();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Periodic heartbeat sync every 10 seconds to keep mobile tabs completely updated
    const interval = setInterval(syncFromServer, 10000);

    return () => {
      window.removeEventListener(VISIBILITY_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("focus", syncFromServer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
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
