// IGMART.STORE — Game Visibility Governance Engine
// Enables admins to show or hide games on the main storefront while 100% preserving account data
// Features monotonic timestamp reconciliation to prevent serverless cold boots from resetting admin preferences

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GAMES } from "@/lib/data/igmartData";

export const STORAGE_KEY = "igmart_enabled_games";
export const STATE_KEY = "igmart_game_visibility_state_v2";
export const VISIBILITY_EVENT = "igmart_game_visibility_changed";

// Default: all 5 games active
export const DEFAULT_ACTIVE_SLUGS = [
  "clash-of-clans",
  "pokemon-go",
  "free-fire",
  "roblox",
  "clash-royale",
];

export interface GameVisibilityState {
  activeSlugs: string[];
  updatedAt: number;
  isUserConfigured: boolean;
}

// Helper to get full visibility state synchronously from localStorage or cookies
export function getStoredVisibilityState(): GameVisibilityState {
  if (typeof window === "undefined") {
    return {
      activeSlugs: DEFAULT_ACTIVE_SLUGS,
      updatedAt: 0,
      isUserConfigured: false,
    };
  }

  try {
    // 1. Try reading rich state from localStorage
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.activeSlugs)) {
        return {
          activeSlugs: parsed.activeSlugs,
          updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
          isUserConfigured: Boolean(parsed.isUserConfigured),
        };
      }
    }

    // 2. Cookie fallback for STATE_KEY
    const matchState = document.cookie.match(new RegExp(`(?:^|; )${STATE_KEY}=([^;]+)`));
    if (matchState && matchState[1]) {
      const parsed = JSON.parse(decodeURIComponent(matchState[1]));
      if (parsed && Array.isArray(parsed.activeSlugs)) {
        return {
          activeSlugs: parsed.activeSlugs,
          updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
          isUserConfigured: Boolean(parsed.isUserConfigured),
        };
      }
    }

    // 3. Legacy fallback to raw slugs STORAGE_KEY
    const legacyRaw = localStorage.getItem(STORAGE_KEY);
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const isCustom =
          parsed.length !== DEFAULT_ACTIVE_SLUGS.length ||
          !DEFAULT_ACTIVE_SLUGS.every((s) => parsed.includes(s));
        return {
          activeSlugs: parsed,
          updatedAt: isCustom ? Date.now() : 0,
          isUserConfigured: isCustom,
        };
      }
    }

    // 4. Legacy cookie fallback
    const matchLegacy = document.cookie.match(new RegExp(`(?:^|; )${STORAGE_KEY}=([^;]+)`));
    if (matchLegacy && matchLegacy[1]) {
      const parsed = JSON.parse(decodeURIComponent(matchLegacy[1]));
      if (Array.isArray(parsed) && parsed.length > 0) {
        const isCustom =
          parsed.length !== DEFAULT_ACTIVE_SLUGS.length ||
          !DEFAULT_ACTIVE_SLUGS.every((s) => parsed.includes(s));
        return {
          activeSlugs: parsed,
          updatedAt: isCustom ? Date.now() : 0,
          isUserConfigured: isCustom,
        };
      }
    }
  } catch (e) {
    console.warn("[GameVisibility] Error reading stored settings:", e);
  }

  return {
    activeSlugs: DEFAULT_ACTIVE_SLUGS,
    updatedAt: 0,
    isUserConfigured: false,
  };
}

// Helper to get active slugs synchronously
export function getActiveGameSlugs(): string[] {
  return getStoredVisibilityState().activeSlugs;
}

// Save active slugs with monotonic timestamp and sync to server
export function saveActiveGameSlugs(slugs: string[], customTimestamp?: number): void {
  if (typeof window === "undefined") return;

  try {
    const clean = Array.from(new Set(slugs.map((s) => s.toLowerCase().trim())));
    const now = customTimestamp || Date.now();
    const state: GameVisibilityState = {
      activeSlugs: clean,
      updatedAt: now,
      isUserConfigured: true,
    };

    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));

    const cookieOpts = "path=/; max-age=31536000; SameSite=Lax";
    document.cookie = `${STATE_KEY}=${encodeURIComponent(JSON.stringify(state))}; ${cookieOpts}`;
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent(JSON.stringify(clean))}; ${cookieOpts}`;

    window.dispatchEvent(new CustomEvent(VISIBILITY_EVENT, { detail: clean }));

    // Sync to centralized server API
    fetch("/api/games-visibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    }).catch((err) => {
      console.warn("[GameVisibility] Server sync failed:", err);
    });
  } catch (e) {
    console.error("[GameVisibility] Failed to save game settings:", e);
  }
}

// React hook for consuming and updating game visibility state
export function useGameVisibility() {
  const [activeSlugs, setActiveSlugs] = useState<string[]>(() => getActiveGameSlugs());
  const [isLoaded, setIsLoaded] = useState(false);
  const activeSlugsRef = useRef(activeSlugs);
  activeSlugsRef.current = activeSlugs;

  useEffect(() => {
    const initial = getStoredVisibilityState();
    setActiveSlugs(initial.activeSlugs);
    setIsLoaded(true);

    // Sync from server API with monotonic timestamp reconciliation
    const syncFromServer = async () => {
      try {
        const res = await fetch("/api/games-visibility", { cache: "no-store" });
        if (!res.ok) return;

        const serverData = await res.json();
        if (!serverData || !Array.isArray(serverData.activeSlugs)) return;

        const local = getStoredVisibilityState();

        // ── DEFENSE 1: Cold server restart protection ───────────────────────
        // If the serverless container restarted (isUserConfigured is false or updatedAt is 0)
        // BUT the client has explicit user configuration:
        // NEVER overwrite client state! Warm up the cold server container instead!
        if (!serverData.isUserConfigured && local.isUserConfigured) {
          fetch("/api/games-visibility", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(local),
          }).catch(() => {});
          return;
        }

        // ── DEFENSE 2: Client has newer saved configuration ─────────────────
        // If client's timestamp is newer than server, warm up the server
        if (local.isUserConfigured && local.updatedAt > (serverData.updatedAt || 0)) {
          fetch("/api/games-visibility", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(local),
          }).catch(() => {});
          return;
        }

        // ── DEFENSE 3: Server has valid user-configured state ───────────────
        // Either server is newer, or client is not yet user-configured
        if (serverData.isUserConfigured || !local.isUserConfigured) {
          const currentSorted = [...activeSlugsRef.current].sort().join(",");
          const newSorted = [...serverData.activeSlugs].sort().join(",");

          if (currentSorted !== newSorted) {
            const newState: GameVisibilityState = {
              activeSlugs: serverData.activeSlugs,
              updatedAt: serverData.updatedAt || Date.now(),
              isUserConfigured: Boolean(serverData.isUserConfigured),
            };

            try {
              localStorage.setItem(STATE_KEY, JSON.stringify(newState));
              localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData.activeSlugs));
              const cookieOpts = "path=/; max-age=31536000; SameSite=Lax";
              document.cookie = `${STATE_KEY}=${encodeURIComponent(JSON.stringify(newState))}; ${cookieOpts}`;
              document.cookie = `${STORAGE_KEY}=${encodeURIComponent(JSON.stringify(serverData.activeSlugs))}; ${cookieOpts}`;
            } catch (_) {}

            setActiveSlugs(serverData.activeSlugs);
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

    // Periodic heartbeat sync every 15 seconds to keep all open tabs synchronized
    const interval = setInterval(syncFromServer, 15000);

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
