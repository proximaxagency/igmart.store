"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Gamepad2, CheckCircle2, ShieldCheck, Eye, EyeOff, Sparkles,
  Layers, ArrowUpRight, AlertCircle, Info, RefreshCw, Filter, Check
} from "lucide-react";
import {
  useGameVisibility,
  DEFAULT_ACTIVE_SLUGS,
  saveActiveGameSlugs
} from "@/lib/gamesVisibility";

export default function AdminGamesManagementPage() {
  const { allGames, activeSlugs, isGameVisible, toggleGame, setAllGames, isLoaded } = useGameVisibility();
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedbackMsg = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleToggle = (slug: string, name: string) => {
    const currentlyVisible = isGameVisible(slug);
    toggleGame(slug);
    showFeedbackMsg(
      currentlyVisible
        ? `"${name}" is now HIDDEN from the main storefront.`
        : `"${name}" is now LIVE on the main storefront!`
    );
  };

  const handlePreset = (slugs: string[], label: string) => {
    setAllGames(slugs);
    showFeedbackMsg(`Preset applied: ${label} (${slugs.length} games active)`);
  };

  const activeCount = allGames.filter((g) => isGameVisible(g.slug)).length;
  const hiddenCount = allGames.length - activeCount;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-text flex items-center gap-3">
            <Gamepad2 className="text-primary" size={28} />
            Game Catalog & Storefront Visibility
          </h1>
          <p className="text-text-muted text-xs sm:text-sm mt-1">
            Toggle which games appear for buyers and sellers on the main website. All existing listings and account data remain 100% safe and intact.
          </p>
        </div>

        {/* Action presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/games"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-card hover:bg-elevated text-text border border-border text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Live Directory</span>
            <ArrowUpRight size={13} />
          </Link>
          <Link
            href="/marketplace"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-primary/20"
          >
            <span>Marketplace</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {/* ── Status KPI Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Supported Games</span>
          <p className="font-heading font-black text-2xl text-text mt-1">{allGames.length}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Core game catalog</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-success uppercase tracking-wider">Live On Main Website</span>
          <p className="font-heading font-black text-2xl text-success mt-1">{activeCount}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Visible to buyers & sellers</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Temporarily Hidden</span>
          <p className="font-heading font-black text-2xl text-amber-400 mt-1">{hiddenCount}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Data fully preserved in database</p>
        </div>
      </div>

      {/* ── Zero Data Loss Guarantee Banner ── */}
      <div className="bg-gradient-to-r from-primary/10 via-card to-accent-secondary/10 border border-primary/25 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck size={22} />
        </div>
        <div className="space-y-1">
          <h4 className="font-heading font-bold text-sm text-text flex items-center gap-2">
            Zero Data Loss Architecture
            <span className="text-[10px] font-mono bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold">
              SAFE TOGGLE
            </span>
          </h4>
          <p className="text-xs text-text-muted leading-relaxed">
            Hiding a game only removes its category cards and filters from the public storefront. 
            <strong className="text-text font-semibold"> All account credentials, seller listings, pricing history, and order data are preserved without alteration. </strong>
            Whenever you toggle a game back on, its listings will immediately reappear for buyers.
          </p>
        </div>
      </div>

      {/* ── Quick Preset Buttons ── */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-primary" />
          <span className="text-xs font-bold text-text">Quick Visibility Presets:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handlePreset(DEFAULT_ACTIVE_SLUGS, "All 5 Games")}
            className="px-3 py-1.5 rounded-xl bg-elevated hover:bg-border text-text text-xs font-bold border border-border transition-colors cursor-pointer"
          >
            Show All 5 Games
          </button>
          <button
            onClick={() => handlePreset(["clash-of-clans", "free-fire"], "2 Games (CoC + Free Fire)")}
            className="px-3 py-1.5 rounded-xl bg-elevated hover:bg-border text-text text-xs font-bold border border-border transition-colors cursor-pointer"
          >
            Top 2 Games (CoC & Free Fire)
          </button>
          <button
            onClick={() => handlePreset(["clash-of-clans", "pokemon-go", "free-fire"], "3 Games (CoC, Pokemon GO, Free Fire)")}
            className="px-3 py-1.5 rounded-xl bg-elevated hover:bg-border text-text text-xs font-bold border border-border transition-colors cursor-pointer"
          >
            Top 3 Games (CoC, Pokémon GO, Free Fire)
          </button>
        </div>
      </div>

      {/* ── Feedback Notification ── */}
      {feedback && (
        <div className="p-3.5 rounded-2xl bg-success/15 border border-success/30 text-success text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* ── Game Cards Grid with Toggles ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allGames.map((game) => {
          const isVisible = isGameVisible(game.slug);

          return (
            <div
              key={game.id}
              className={`bg-card border rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between shadow-sm ${
                isVisible
                  ? "border-border hover:border-primary/50"
                  : "border-border/60 opacity-80 bg-surface/50"
              }`}
            >
              {/* Game Artwork */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-elevated">
                <Image
                  src={game.image}
                  alt={game.name}
                  fill
                  className={`object-cover object-top transition-transform duration-300 ${
                    isVisible ? "" : "grayscale-[40%]"
                  }`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Status Overlay Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-md backdrop-blur-md flex items-center gap-1.5 ${
                      isVisible
                        ? "bg-success/20 text-success border-success/40"
                        : "bg-black/70 text-amber-300 border-amber-500/40"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isVisible ? "bg-success animate-pulse" : "bg-amber-400"
                      }`}
                    />
                    {isVisible ? "Active On Store" : "Hidden from Public"}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-bold bg-black/60 backdrop-blur-sm text-text-muted px-2 py-0.5 rounded border border-white/10 uppercase">
                    {game.category}
                  </span>
                </div>
              </div>

              {/* Game Info & Controls */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-heading font-black text-lg text-text">{game.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-1 font-mono">
                    <span>{game.listings} listings</span>
                    <span>•</span>
                    <span>{game.sellers} verified sellers</span>
                    <span>•</span>
                    <span className="text-warning">★ {game.rating}</span>
                  </div>
                </div>

                {/* Toggle Bar */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {isVisible ? (
                      <Eye size={16} className="text-success" />
                    ) : (
                      <EyeOff size={16} className="text-amber-400" />
                    )}
                    <span className="text-xs font-bold text-text">
                      {isVisible ? "Visible on Main Site" : "Hidden from Main Site"}
                    </span>
                  </div>

                  {/* Accessible Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isVisible}
                    onClick={() => handleToggle(game.slug, game.name)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isVisible ? "bg-success" : "bg-elevated border-border"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isVisible ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
