"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Loader2, CheckCircle, XCircle, Eye, Filter, AlertTriangle,
  ShieldCheck, Clock, Flame, Tag, Star, TrendingUp, RefreshCw,
  ChevronDown, CheckSquare, Search, PauseCircle, PlayCircle,
  ExternalLink, Sparkles, Layers, DollarSign, Package, AlertCircle,
  X, Check, ShieldAlert, ArrowUpRight
} from "lucide-react";
import { ConvexImage } from "@/components/shared/ConvexImage";
import { useCurrency } from "@/components/providers/CurrencyProvider";

type StatusFilter = "pending_review" | "active" | "paused" | "rejected" | "removed";

const STATUS_OPTIONS: { value: StatusFilter; label: string; color: string; activeColor: string }[] = [
  { value: "pending_review", label: "Pending Review", color: "text-warning border-warning/30 bg-warning/5", activeColor: "text-warning border-warning bg-warning/15" },
  { value: "active", label: "Live Active", color: "text-success border-success/30 bg-success/5", activeColor: "text-success border-success bg-success/15" },
  { value: "paused", label: "Unlisted / Paused", color: "text-amber-400 border-amber-500/30 bg-amber-500/5", activeColor: "text-amber-400 border-amber-500 bg-amber-500/15" },
  { value: "rejected", label: "Rejected", color: "text-danger border-danger/30 bg-danger/5", activeColor: "text-danger border-danger bg-danger/15" },
  { value: "removed", label: "Removed", color: "text-text-muted border-border bg-elevated", activeColor: "text-text border-text/40 bg-elevated" },
];

const BADGE_OPTIONS = ["HOT", "SALE", "POPULAR", "NEW"] as const;

const UNLIST_REASONS = [
  "Pricing error / unrealistic price",
  "Suspected duplicate or spam listing",
  "Policy or community guideline violation",
  "Seller requested temporary hold",
  "Wrong category or game selected",
  "Account details or proof verification pending",
  "Quality / description clarification required",
];

const REJECT_REASONS = [
  "Images are blurry, missing, or do not match the account",
  "Price is unrealistic or does not reflect account value",
  "Description contains prohibited external links or off-platform contact",
  "Account attributes/specifications are incomplete",
  "Duplicate submission of an existing listing",
  "Violates IGMarket marketplace security policies",
];

export default function AdminListingsPage() {
  const { format } = useCurrency();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending_review");
  const [searchTerm, setSearchTerm] = useState("");
  const [gameFilter, setGameFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showSeeded, setShowSeeded] = useState(false);

  // Modals state
  const [rejectModal, setRejectModal] = useState<{ id: Id<"listings">; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [unlistModal, setUnlistModal] = useState<{ id: Id<"listings">; title: string; price: number } | null>(null);
  const [unlistReason, setUnlistReason] = useState(UNLIST_REASONS[0]);
  const [customUnlistReason, setCustomUnlistReason] = useState("");
  const [unlistTargetStatus, setUnlistTargetStatus] = useState<"paused" | "removed">("paused");

  const [bulkUnlistModalOpen, setBulkUnlistModalOpen] = useState(false);
  const [bulkUnlistReason, setBulkUnlistReason] = useState(UNLIST_REASONS[0]);

  const [badgeModal, setBadgeModal] = useState<{ id: Id<"listings">; title: string } | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<typeof BADGE_OPTIONS[number] | "">("");

  const [detailsModal, setDetailsModal] = useState<any | null>(null);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Queries using existing cloud-deployed Convex functions
  const adminMetrics = useQuery(api.admin.getAdminMetrics);
  const games = useQuery(api.listings.getGames);
  const listings = useQuery(api.admin.listPendingListings, {
    status: statusFilter,
    excludeSeeded: !showSeeded
  });

  // Cloud-deployed Mutations
  const approveListing = useMutation(api.admin.approveListing);
  const rejectListing = useMutation(api.admin.rejectListing);
  const updateListingStatus = useMutation(api.admin.updateListingStatus);
  const bulkApprove = useMutation(api.admin.bulkApproveListings);

  const showFeedback = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 5000);
  };

  const filtered = listings?.filter(l => {
    const matchesSearch = !searchTerm ||
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.sellerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.gameName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGame = gameFilter === "all" || l.gameId === gameFilter;

    return matchesSearch && matchesGame;
  }) ?? [];

  // Calculate stats for current view
  const currentViewCount = filtered.length;
  const currentViewTotalValue = filtered.reduce((sum, l) => sum + (l.price || 0), 0);

  // Actions
  const handleApprove = async (id: Id<"listings">, badge?: typeof BADGE_OPTIONS[number]) => {
    setActionLoading(id);
    try {
      await approveListing({ listingId: id, badge: badge || undefined });
      showFeedback("success", "Listing approved and is now live! Seller has been notified.");
      setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
      setBadgeModal(null);
    } catch (e: any) {
      showFeedback("error", e.message || "Failed to approve listing.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    setActionLoading(rejectModal.id);
    try {
      await rejectListing({ listingId: rejectModal.id, reason: rejectReason });
      showFeedback("success", "Listing rejected. Seller has been notified with the reason.");
      setRejectModal(null);
      setRejectReason("");
      setSelected(prev => { const s = new Set(prev); s.delete(rejectModal.id); return s; });
    } catch (e: any) {
      showFeedback("error", e.message || "Failed to reject listing.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnlist = async () => {
    if (!unlistModal) return;
    const finalReason = customUnlistReason.trim() || unlistReason;
    setActionLoading(unlistModal.id);
    try {
      await updateListingStatus({
        listingId: unlistModal.id,
        status: unlistTargetStatus,
        reason: finalReason,
      });
      showFeedback("success", `Listing unlisted (${unlistTargetStatus}). Seller has been notified.`);
      setUnlistModal(null);
      setCustomUnlistReason("");
      setSelected(prev => { const s = new Set(prev); s.delete(unlistModal.id); return s; });
    } catch (e: any) {
      showFeedback("error", e.message || "Failed to unlist listing.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRelist = async (id: Id<"listings">) => {
    setActionLoading(id);
    try {
      await updateListingStatus({
        listingId: id,
        status: "active",
      });
      showFeedback("success", "Listing relisted! It is now live on the marketplace.");
      setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
    } catch (e: any) {
      showFeedback("error", e.message || "Failed to relist listing.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selected.size === 0) return;
    setActionLoading("bulk");
    try {
      const result = await bulkApprove({ listingIds: Array.from(selected) as Id<"listings">[] });
      showFeedback("success", `${result.count} listings approved and live!`);
      setSelected(new Set());
    } catch (e: any) {
      showFeedback("error", e.message || "Bulk approval failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkUnlist = async () => {
    if (selected.size === 0) return;
    setActionLoading("bulk");
    try {
      let count = 0;
      for (const id of Array.from(selected) as Id<"listings">[]) {
        await updateListingStatus({
          listingId: id,
          status: "paused",
          reason: bulkUnlistReason,
        });
        count++;
      }
      showFeedback("success", `${count} listings unlisted successfully.`);
      setSelected(new Set());
      setBulkUnlistModalOpen(false);
    } catch (e: any) {
      showFeedback("error", e.message || "Bulk unlist failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkRelist = async () => {
    if (selected.size === 0) return;
    setActionLoading("bulk");
    try {
      let count = 0;
      for (const id of Array.from(selected) as Id<"listings">[]) {
        await updateListingStatus({
          listingId: id,
          status: "active",
        });
        count++;
      }
      showFeedback("success", `${count} listings relisted and live!`);
      setSelected(new Set());
    } catch (e: any) {
      showFeedback("error", e.message || "Bulk relist failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length && filtered.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(l => l._id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-text flex items-center gap-3">
            Listing Moderation & Governance
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <ShieldCheck size={13} />
              Admin Controls
            </span>
          </h1>
          <p className="text-text-muted text-xs sm:text-sm mt-1">
            Review pending listings, unlist or pause active items, and govern marketplace seller inventory.
          </p>
        </div>

        {/* Action button in header */}
        <div className="flex items-center gap-2">
          <Link
            href="/sell/create"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-card hover:bg-elevated text-text border border-border text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            Create Listing
            <ArrowUpRight size={13} />
          </Link>
          <Link
            href="/marketplace"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-primary/20"
          >
            Live Marketplace
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>

      {/* ── Stats Summary Bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Live Active */}
        <button
          onClick={() => { setStatusFilter("active"); setSelected(new Set()); }}
          className={`p-4 rounded-2xl border text-left transition-all ${statusFilter === "active" ? "border-success bg-success/15 shadow-sm" : "bg-card border-border hover:border-success/50"}`}
        >
          <div className="flex items-center justify-between text-success text-xs font-bold uppercase tracking-wider mb-2">
            <span>Live Marketplace</span>
            <CheckCircle size={14} />
          </div>
          <div className="font-heading font-black text-2xl text-success">
            {adminMetrics ? adminMetrics.activeListings : <Loader2 size={18} className="animate-spin inline text-success/40" />}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Active verified offers</p>
        </button>

        {/* Pending Review */}
        <button
          onClick={() => { setStatusFilter("pending_review"); setSelected(new Set()); }}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${statusFilter === "pending_review" ? "border-warning bg-warning/15 shadow-sm" : "bg-card border-border hover:border-warning/50"}`}
        >
          <div className="flex items-center justify-between text-warning text-xs font-bold uppercase tracking-wider mb-2">
            <span>Pending Review</span>
            <Clock size={14} />
          </div>
          <div className="font-heading font-black text-2xl text-warning">
            {statusFilter === "pending_review" && listings !== undefined ? listings.length : "Queue"}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Awaiting staff approval</p>
        </button>

        {/* Unlisted / Paused */}
        <button
          onClick={() => { setStatusFilter("paused"); setSelected(new Set()); }}
          className={`p-4 rounded-2xl border text-left transition-all ${statusFilter === "paused" ? "border-amber-500 bg-amber-500/15 shadow-sm" : "bg-card border-border hover:border-amber-500/50"}`}
        >
          <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Unlisted / Paused</span>
            <PauseCircle size={14} />
          </div>
          <div className="font-heading font-black text-2xl text-amber-400">
            {statusFilter === "paused" && listings !== undefined ? listings.length : "Unlisted"}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Hidden from public store</p>
        </button>

        {/* Total in Current Tab */}
        <div className="p-4 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between text-text-muted text-xs font-bold uppercase tracking-wider mb-2">
            <span>Tab Inventory Value</span>
            <DollarSign size={14} className="text-primary" />
          </div>
          <div className="font-heading font-black text-2xl text-text">
            {format(currentViewTotalValue)}
          </div>
          <p className="text-[11px] text-text-muted mt-1">{currentViewCount} items in view</p>
        </div>
      </div>

      {/* ── Feedback Banner ── */}
      {feedback && (
        <div className={`p-3.5 rounded-2xl text-sm font-semibold flex items-center justify-between gap-3 ${feedback.type === "success" ? "bg-success/10 text-success border border-success/30 shadow-sm" : "bg-danger/10 text-danger border border-danger/30 shadow-sm"}`}>
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{feedback.msg}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-text-muted hover:text-text p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Filters & Controls Bar ── */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-4 shadow-sm">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_OPTIONS.map(opt => {
            const isActive = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => { setStatusFilter(opt.value); setSelected(new Set()); }}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${isActive ? opt.activeColor : opt.color + " hover:border-primary/40"}`}
              >
                <span>{opt.label}</span>
                {statusFilter === opt.value && listings && (
                  <span className="text-[10px] text-text-muted">
                    ({listings.length})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search, Game Filter, Seed Toggle, Bulk Action Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1 border-t border-border">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search listing title, seller, email..."
                className="w-full bg-elevated border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-text placeholder:text-text-muted outline-none focus:border-primary transition-colors"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Game Filter */}
            {games && games.length > 0 && (
              <select
                value={gameFilter}
                onChange={e => setGameFilter(e.target.value)}
                className="bg-elevated border border-border rounded-xl px-3 py-2 text-xs text-text font-medium outline-none focus:border-primary cursor-pointer"
              >
                <option value="all">All Games ({games.length})</option>
                {games.map(g => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
            )}

            {/* Seed Toggle */}
            <label className="flex items-center gap-2 cursor-pointer bg-elevated hover:bg-border/60 border border-border px-3 py-2 rounded-xl transition-colors select-none">
              <input
                type="checkbox"
                checked={showSeeded}
                onChange={(e) => setShowSeeded(e.target.checked)}
                className="accent-primary cursor-pointer w-3.5 h-3.5"
              />
              <span className="text-xs font-semibold text-text-muted whitespace-nowrap">Include Seed Data</span>
            </label>
          </div>

          {/* Bulk Actions Button when selected */}
          {selected.size > 0 && (
            <div className="flex items-center gap-2 bg-elevated border border-border px-3 py-1.5 rounded-xl">
              <span className="text-xs font-black text-primary whitespace-nowrap">
                {selected.size} Selected
              </span>

              {statusFilter === "pending_review" && (
                <button
                  onClick={handleBulkApprove}
                  disabled={actionLoading === "bulk"}
                  className="flex items-center gap-1.5 bg-success hover:opacity-90 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-opacity"
                >
                  {actionLoading === "bulk" ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                  Approve All
                </button>
              )}

              {statusFilter === "active" && (
                <button
                  onClick={() => setBulkUnlistModalOpen(true)}
                  disabled={actionLoading === "bulk"}
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold px-3 py-1.5 rounded-lg text-xs transition-opacity"
                >
                  {actionLoading === "bulk" ? <Loader2 size={12} className="animate-spin" /> : <PauseCircle size={12} />}
                  Unlist Selected
                </button>
              )}

              {(statusFilter === "paused" || statusFilter === "rejected") && (
                <button
                  onClick={handleBulkRelist}
                  disabled={actionLoading === "bulk"}
                  className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-opacity"
                >
                  {actionLoading === "bulk" ? <Loader2 size={12} className="animate-spin" /> : <PlayCircle size={12} />}
                  Relist Selected
                </button>
              )}

              <button
                onClick={() => setSelected(new Set())}
                className="text-text-muted hover:text-text text-xs px-2 py-1"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {listings === undefined ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <p className="text-xs text-text-muted">Loading marketplace catalog...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-text-muted">
            <CheckCircle size={44} className="mx-auto mb-3 opacity-20 text-primary" />
            <p className="font-heading font-bold text-base text-text">No listings found</p>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
              {statusFilter === "pending_review"
                ? "All caught up! There are currently no new listings awaiting review."
                : "No listings found for this status tab."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-surface border-b border-border text-[11px] uppercase tracking-wider text-text-muted font-bold">
                  <th className="p-4 pl-5 w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="accent-primary cursor-pointer w-4 h-4 rounded"
                    />
                  </th>
                  <th className="p-4">Listing Details</th>
                  <th className="p-4">Game</th>
                  <th className="p-4">Seller</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status & Badge</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 pr-5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(l => {
                  const isSelected = selected.has(l._id);
                  const isPending = l.status === "pending_review";
                  const isActive = l.status === "active";
                  const isPaused = l.status === "paused" || l.status === "removed";
                  const isRejected = l.status === "rejected";

                  return (
                    <tr
                      key={l._id}
                      className={`hover:bg-elevated/40 transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 pl-5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(l._id)}
                          className="accent-primary cursor-pointer w-4 h-4 rounded"
                        />
                      </td>

                      {/* Listing Details */}
                      <td className="p-4 max-w-[300px]">
                        <div className="flex items-start gap-3">
                          {l.images?.[0] ? (
                            <div className="w-14 h-12 rounded-xl overflow-hidden border border-border flex-shrink-0 bg-elevated relative group">
                              <ConvexImage src={l.images[0]} alt="" className="w-full h-full object-cover object-center" />
                              {l.images.length > 1 && (
                                <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-[9px] font-bold text-white px-1 rounded">
                                  +{l.images.length - 1}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="w-14 h-12 rounded-xl bg-elevated border border-border flex-shrink-0 flex items-center justify-center text-text-muted">
                              <Package size={16} />
                            </div>
                          )}

                          <div className="min-w-0">
                            <Link
                              href={`/listing/${l._id}`}
                              target="_blank"
                              className="text-sm font-bold text-text hover:text-primary line-clamp-2 leading-snug transition-colors flex items-center gap-1 group"
                              title={l.title}
                            >
                              <span>{l.title}</span>
                              <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-primary transition-opacity" />
                            </Link>

                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[10px] text-text-muted font-mono">
                                ID: {l._id.slice(-6).toUpperCase()}
                              </span>
                              {l.deliveryMethod && (
                                <span className="text-[10px] text-text-muted bg-elevated px-1.5 py-0.5 rounded border border-border/50 uppercase font-bold">
                                  {l.deliveryMethod}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Game */}
                      <td className="p-4 text-xs font-semibold text-text whitespace-nowrap">
                        <span className="bg-elevated px-2.5 py-1 rounded-lg border border-border/60">
                          {l.gameName}
                        </span>
                      </td>

                      {/* Seller */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-text">{l.sellerName}</p>
                          {l.sellerIsVerified && <ShieldCheck size={12} className="text-success flex-shrink-0" />}
                        </div>
                        <p className="text-[11px] text-text-muted">{l.sellerEmail || "No email"}</p>
                        {l.sellerRating > 0 && (
                          <p className="text-[11px] text-warning flex items-center gap-1 mt-0.5">
                            <Star size={10} fill="currentColor" />
                            <span>{l.sellerRating.toFixed(1)}</span>
                          </p>
                        )}
                      </td>

                      {/* Price */}
                      <td className="p-4 whitespace-nowrap">
                        <p className="text-sm font-black text-text">${l.price.toFixed(2)}</p>
                        {l.originalPrice && l.originalPrice > l.price && (
                          <p className="text-[10px] text-text-muted line-through">
                            ${l.originalPrice.toFixed(2)}
                          </p>
                        )}
                      </td>

                      {/* Status & Badge */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isActive ? "text-success border-success/30 bg-success/10" :
                            isPending ? "text-warning border-warning/30 bg-warning/10" :
                            isPaused ? "text-amber-400 border-amber-500/30 bg-amber-500/10" :
                            isRejected ? "text-danger border-danger/30 bg-danger/10" :
                            "text-text-muted border-border bg-elevated"
                          }`}>
                            {l.status.replace("_", " ")}
                          </span>

                          {l.badge && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                              {l.badge}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-[11px] text-text-muted whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock size={11} />
                          <span>{new Date(l.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Inspect Details */}
                          <button
                            onClick={() => setDetailsModal(l)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-text bg-elevated border border-border hover:border-primary/40 transition-colors"
                            title="Inspect full listing details"
                          >
                            <Eye size={14} />
                          </button>

                          {/* If Pending: Approve / Reject */}
                          {isPending && (
                            <>
                              <button
                                onClick={() => {
                                  setBadgeModal({ id: l._id, title: l.title });
                                  setSelectedBadge("");
                                }}
                                disabled={actionLoading === l._id}
                                className="flex items-center gap-1 text-xs font-bold text-success border border-success/30 hover:bg-success/15 px-2.5 py-1.5 rounded-lg transition-colors"
                                title="Approve listing"
                              >
                                {actionLoading === l._id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                <span>Approve</span>
                              </button>

                              <button
                                onClick={() => {
                                  setRejectModal({ id: l._id, title: l.title });
                                  setRejectReason(REJECT_REASONS[0]);
                                }}
                                disabled={actionLoading === l._id}
                                className="flex items-center gap-1 text-xs font-bold text-danger border border-danger/30 hover:bg-danger/15 px-2.5 py-1.5 rounded-lg transition-colors"
                                title="Reject listing"
                              >
                                <XCircle size={12} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {/* If Live: Unlist Button */}
                          {isActive && (
                            <button
                              onClick={() => {
                                setUnlistModal({ id: l._id, title: l.title, price: l.price });
                                setUnlistReason(UNLIST_REASONS[0]);
                                setCustomUnlistReason("");
                                setUnlistTargetStatus("paused");
                              }}
                              disabled={actionLoading === l._id}
                              className="flex items-center gap-1 text-xs font-bold text-amber-400 border border-amber-500/30 hover:bg-amber-500/15 px-2.5 py-1.5 rounded-lg transition-colors"
                              title="Unlist or pause listing from store"
                            >
                              <PauseCircle size={12} />
                              <span>Unlist</span>
                            </button>
                          )}

                          {/* If Unlisted or Rejected: Relist Button */}
                          {(isPaused || isRejected) && (
                            <button
                              onClick={() => handleRelist(l._id)}
                              disabled={actionLoading === l._id}
                              className="flex items-center gap-1 text-xs font-bold text-success border border-success/30 hover:bg-success/15 px-2.5 py-1.5 rounded-lg transition-colors"
                              title="Make active and live on marketplace"
                            >
                              {actionLoading === l._id ? <Loader2 size={12} className="animate-spin" /> : <PlayCircle size={12} />}
                              <span>Relist</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── UNLIST MODAL (Feature-rich with preset reasons + status selector) ── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {unlistModal && (
        <div className="fixed inset-0 z-[500] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5 text-amber-400">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <PauseCircle size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-text">Unlist Listing</h3>
                  <p className="text-xs text-text-muted">Take listing offline from public marketplace</p>
                </div>
              </div>
              <button
                onClick={() => setUnlistModal(null)}
                className="text-text-muted hover:text-text p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Listing Target Card */}
            <div className="p-3 bg-elevated border border-border rounded-xl">
              <p className="text-xs font-bold text-text line-clamp-2">{unlistModal.title}</p>
              <p className="text-xs text-text-muted mt-1">
                Current Price: <span className="font-black text-text">${unlistModal.price.toFixed(2)}</span>
              </p>
            </div>

            {/* Unlist Action Type */}
            <div>
              <label className="text-xs font-bold text-text-muted block mb-1.5">Unlist Action Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUnlistTargetStatus("paused")}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    unlistTargetStatus === "paused"
                      ? "border-amber-500 bg-amber-500/15 text-amber-400"
                      : "border-border bg-elevated text-text-muted hover:border-amber-500/40"
                  }`}
                >
                  <p className="font-black">Pause / Unlist</p>
                  <p className="text-[10px] opacity-75 font-normal">Can be relisted anytime</p>
                </button>

                <button
                  type="button"
                  onClick={() => setUnlistTargetStatus("removed")}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    unlistTargetStatus === "removed"
                      ? "border-danger bg-danger/15 text-danger"
                      : "border-border bg-elevated text-text-muted hover:border-danger/40"
                  }`}
                >
                  <p className="font-black">Remove Permanently</p>
                  <p className="text-[10px] opacity-75 font-normal">Takedown for violations</p>
                </button>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="text-xs font-bold text-text-muted block mb-1.5">Preset Reasons</label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {UNLIST_REASONS.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setUnlistReason(r); setCustomUnlistReason(""); }}
                    className={`w-full text-left text-xs p-2 rounded-lg border transition-all ${
                      unlistReason === r && !customUnlistReason
                        ? "border-amber-500 bg-amber-500/10 text-amber-300 font-bold"
                        : "border-border/60 bg-elevated/60 text-text-muted hover:border-border text-[11px]"
                    }`}
                  >
                    • {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="text-xs font-bold text-text-muted block mb-1.5">Custom Reason / Seller Note (Optional)</label>
              <textarea
                rows={2}
                value={customUnlistReason}
                onChange={e => setCustomUnlistReason(e.target.value)}
                placeholder="Type custom note explaining to the seller why this was unlisted..."
                className="w-full bg-elevated border border-border rounded-xl p-3 text-xs text-text placeholder:text-text-muted outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUnlistModal(null)}
                className="flex-1 bg-elevated hover:bg-border text-text font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUnlist}
                disabled={actionLoading === unlistModal.id}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                {actionLoading === unlistModal.id ? <Loader2 size={14} className="animate-spin" /> : <PauseCircle size={14} />}
                Confirm Unlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── BULK UNLIST MODAL ── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {bulkUnlistModalOpen && (
        <div className="fixed inset-0 z-[500] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5 text-amber-400">
                <PauseCircle size={20} />
                <h3 className="font-heading font-black text-lg text-text">
                  Bulk Unlist ({selected.size} Listings)
                </h3>
              </div>
              <button onClick={() => setBulkUnlistModalOpen(false)} className="text-text-muted hover:text-text">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-text-muted">
              You are about to unlist <span className="font-bold text-text">{selected.size} listings</span>. Their status will change to paused and sellers will be notified.
            </p>

            <div>
              <label className="text-xs font-bold text-text-muted block mb-1.5">Select Reason</label>
              <div className="space-y-1.5">
                {UNLIST_REASONS.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setBulkUnlistReason(r)}
                    className={`w-full text-left text-xs p-2 rounded-lg border transition-all ${
                      bulkUnlistReason === r
                        ? "border-amber-500 bg-amber-500/10 text-amber-300 font-bold"
                        : "border-border bg-elevated text-text-muted text-[11px]"
                    }`}
                  >
                    • {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setBulkUnlistModalOpen(false)}
                className="flex-1 bg-elevated hover:bg-border text-text font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUnlist}
                disabled={actionLoading === "bulk"}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                {actionLoading === "bulk" ? <Loader2 size={14} className="animate-spin" /> : <PauseCircle size={14} />}
                Unlist All {selected.size}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── APPROVE / BADGE MODAL ── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {badgeModal && (
        <div className="fixed inset-0 z-[500] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Sparkles size={24} />
            </div>

            <div className="text-center">
              <h3 className="font-heading font-black text-lg text-text">Approve Listing</h3>
              <p className="text-xs text-text-muted line-clamp-2 mt-1">"{badgeModal.title}"</p>
            </div>

            <div>
              <label className="text-xs font-bold text-text-muted block mb-2 text-center">
                Optional Promotional Badge
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BADGE_OPTIONS.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBadge(selectedBadge === b ? "" : b)}
                    className={`text-xs font-black py-2.5 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                      selectedBadge === b
                        ? "border-primary bg-primary/15 text-primary shadow-sm"
                        : "border-border bg-elevated text-text-muted hover:border-primary/40"
                    }`}
                  >
                    <span>{b === "HOT" ? "🔥" : b === "SALE" ? "💸" : b === "POPULAR" ? "⭐" : "🆕"}</span>
                    <span>{b}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setBadgeModal(null)}
                className="flex-1 bg-elevated hover:bg-border text-text font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(badgeModal.id, selectedBadge ? (selectedBadge as any) : undefined)}
                disabled={!!actionLoading}
                className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-primary/20"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Approve & Go Live
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── REJECT MODAL ── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {rejectModal && (
        <div className="fixed inset-0 z-[500] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5 text-danger">
                <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center">
                  <XCircle size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-text">Reject Listing</h3>
                  <p className="text-xs text-text-muted">Explain why this listing cannot be published</p>
                </div>
              </div>
              <button onClick={() => setRejectModal(null)} className="text-text-muted hover:text-text">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-elevated border border-border rounded-xl">
              <p className="text-xs font-bold text-text line-clamp-2">"{rejectModal.title}"</p>
            </div>

            <div>
              <label className="text-xs font-bold text-text-muted block mb-1.5">Common Rejection Reasons</label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {REJECT_REASONS.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRejectReason(r)}
                    className={`w-full text-left text-xs p-2 rounded-lg border transition-all ${
                      rejectReason === r
                        ? "border-danger bg-danger/10 text-danger font-bold"
                        : "border-border/60 bg-elevated text-text-muted hover:border-border text-[11px]"
                    }`}
                  >
                    • {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text-muted block mb-1.5">Reason Details Sent to Seller <span className="text-danger">*</span></label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Explain what the seller needs to correct before resubmitting..."
                className="w-full bg-elevated border border-border rounded-xl p-3 text-xs text-text placeholder:text-text-muted outline-none focus:border-danger resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 bg-elevated hover:bg-border text-text font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || !!actionLoading}
                className="flex-1 bg-danger hover:opacity-90 text-white font-bold py-2.5 rounded-xl text-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {actionLoading === rejectModal.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Reject & Notify Seller
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── QUICK DETAILS DRAWER / MODAL ── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {detailsModal && (
        <div className="fixed inset-0 z-[500] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] font-mono text-text-muted">LISTING INSPECTOR</span>
                <h3 className="font-heading font-black text-xl text-text line-clamp-1">{detailsModal.title}</h3>
              </div>
              <button onClick={() => setDetailsModal(null)} className="text-text-muted hover:text-text p-1">
                <X size={20} />
              </button>
            </div>

            {/* Images Carousel / Grid */}
            {detailsModal.images && detailsModal.images.length > 0 && (
              <div>
                <p className="text-xs font-bold text-text-muted mb-2">Uploaded Screenshots & Proof ({detailsModal.images.length})</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {detailsModal.images.map((img: string, idx: number) => (
                    <a
                      key={idx}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-video rounded-xl overflow-hidden border border-border bg-elevated hover:opacity-90 transition-opacity block"
                    >
                      <ConvexImage src={img} alt="" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-elevated border border-border">
                <span className="text-[10px] text-text-muted font-bold uppercase">Price</span>
                <p className="font-black text-base text-text">${detailsModal.price.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-elevated border border-border">
                <span className="text-[10px] text-text-muted font-bold uppercase">Game</span>
                <p className="font-bold text-xs text-text truncate">{detailsModal.gameName}</p>
              </div>
              <div className="p-3 rounded-xl bg-elevated border border-border">
                <span className="text-[10px] text-text-muted font-bold uppercase">Delivery</span>
                <p className="font-bold text-xs text-text uppercase">{detailsModal.deliveryMethod || "Manual"}</p>
              </div>
              <div className="p-3 rounded-xl bg-elevated border border-border">
                <span className="text-[10px] text-text-muted font-bold uppercase">Status</span>
                <p className="font-bold text-xs text-text uppercase">{detailsModal.status}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-bold text-text-muted mb-1.5">Seller Description</p>
              <div className="p-3.5 rounded-xl bg-elevated border border-border text-xs text-text whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                {detailsModal.description || "No description provided."}
              </div>
            </div>

            {/* Seller profile */}
            <div className="p-3.5 rounded-xl bg-elevated border border-border flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-text flex items-center gap-1.5">
                  Seller: {detailsModal.sellerName}
                  {detailsModal.sellerIsVerified && <ShieldCheck size={13} className="text-success" />}
                </p>
                <p className="text-[11px] text-text-muted">{detailsModal.sellerEmail}</p>
              </div>
              <Link
                href={`/admin/users?search=${encodeURIComponent(detailsModal.sellerEmail || detailsModal.sellerName)}`}
                className="text-xs font-bold text-primary hover:underline"
              >
                View Seller Account →
              </Link>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Link
                href={`/listing/${detailsModal._id}`}
                target="_blank"
                className="px-4 py-2 rounded-xl bg-elevated hover:bg-border text-text text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                Open in Public Store
                <ExternalLink size={13} />
              </Link>

              <div className="flex gap-2">
                {detailsModal.status === "active" && (
                  <button
                    onClick={() => {
                      setDetailsModal(null);
                      setUnlistModal({ id: detailsModal._id, title: detailsModal.title, price: detailsModal.price });
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <PauseCircle size={14} />
                    Unlist
                  </button>
                )}
                {detailsModal.status === "paused" && (
                  <button
                    onClick={() => {
                      handleRelist(detailsModal._id);
                      setDetailsModal(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-success hover:opacity-90 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <PlayCircle size={14} />
                    Relist Now
                  </button>
                )}
                <button
                  onClick={() => setDetailsModal(null)}
                  className="px-4 py-2 rounded-xl bg-elevated hover:bg-border text-text text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
