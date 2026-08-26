"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Loader2, CheckCircle, XCircle, Eye, Filter, AlertTriangle,
  ShieldCheck, Clock, Flame, Tag, Star, TrendingUp, RefreshCw,
  ChevronDown, CheckSquare, Search
} from "lucide-react";
import { ConvexImage } from "@/components/shared/ConvexImage";

type StatusFilter = "pending_review" | "active" | "rejected" | "removed" | "paused";

const STATUS_OPTIONS: { value: StatusFilter; label: string; color: string }[] = [
  { value: "pending_review", label: "Pending Review", color: "text-warning border-warning/30 bg-warning/10" },
  { value: "active", label: "Live", color: "text-success border-success/30 bg-success/10" },
  { value: "rejected", label: "Rejected", color: "text-danger border-danger/30 bg-danger/10" },
  { value: "paused", label: "Paused", color: "text-text-muted border-border bg-elevated" },
  { value: "removed", label: "Removed", color: "text-text-muted border-border bg-elevated" },
];

const BADGE_OPTIONS = ["HOT", "SALE", "POPULAR", "NEW"] as const;

export default function AdminListingsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending_review");
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rejectModal, setRejectModal] = useState<{ id: Id<"listings">; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [badgeModal, setBadgeModal] = useState<{ id: Id<"listings">; title: string } | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<typeof BADGE_OPTIONS[number] | "">("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [showSeeded, setShowSeeded] = useState(false);

  const listings = useQuery(api.admin.listPendingListings, { status: statusFilter, excludeSeeded: !showSeeded });
  const approveListing = useMutation(api.admin.approveListing);
  const rejectListing = useMutation(api.admin.rejectListing);
  const bulkApprove = useMutation(api.admin.bulkApproveListings);

  const filtered = listings?.filter(l =>
    !searchTerm || l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.gameName.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  const showFeedback = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

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
    } catch (e: any) {
      showFeedback("error", e.message || "Failed to reject listing.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selected.size === 0) return;
    setActionLoading("bulk");
    try {
      const result = await bulkApprove({ listingIds: Array.from(selected) as Id<"listings">[] });
      showFeedback("success", `${result.count} listings approved and are now live!`);
      setSelected(new Set());
    } catch (e: any) {
      showFeedback("error", e.message || "Bulk approval failed.");
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
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(l => l._id)));
    }
  };

  const currentStatus = STATUS_OPTIONS.find(s => s.value === statusFilter)!;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-black text-2xl text-text">Listing Review Queue</h1>
          <p className="text-text-muted text-xs mt-0.5">Approve or reject seller listings before they go live</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Bulk approve */}
          {statusFilter === "pending_review" && selected.size > 0 && (
            <button
              onClick={handleBulkApprove}
              disabled={actionLoading === "bulk"}
              className="flex items-center gap-2 bg-success hover:opacity-90 text-white font-bold px-4 py-2 rounded-xl text-sm transition-opacity"
            >
              {actionLoading === "bulk" ? <Loader2 size={15} className="animate-spin" /> : <CheckSquare size={15} />}
              Approve {selected.size} Selected
            </button>
          )}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${feedback.type === "success" ? "bg-success/10 text-success border border-success/20" : "bg-danger/10 text-danger border border-danger/20"}`}>
          {feedback.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {feedback.msg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search listings, sellers..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-text placeholder:text-text-muted outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value); setSelected(new Set()); }}
              className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${statusFilter === opt.value ? opt.color : "border-border bg-card text-text-muted hover:border-primary/30"}`}
            >
              {opt.label}
            </button>
          ))}
          <label className="flex items-center gap-2 ml-2 cursor-pointer bg-elevated border border-border px-3 py-2 rounded-xl">
            <input 
              type="checkbox" 
              checked={showSeeded} 
              onChange={(e) => setShowSeeded(e.target.checked)} 
              className="accent-primary" 
            />
            <span className="text-xs font-bold text-text-muted whitespace-nowrap">Show Seed Data</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {listings === undefined ? (
          <div className="flex justify-center p-16"><Loader2 className="animate-spin text-primary" size={28} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-text-muted text-sm">
            <CheckCircle size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-semibold">{statusFilter === "pending_review" ? "No listings awaiting review 🎉" : "No listings found"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-surface border-b border-border text-[11px] uppercase tracking-wider text-text-muted font-bold">
                  {statusFilter === "pending_review" && (
                    <th className="p-4 pl-5 w-10">
                      <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="accent-primary cursor-pointer w-4 h-4" />
                    </th>
                  )}
                  <th className="p-4">Listing</th>
                  <th className="p-4">Seller</th>
                  <th className="p-4">Game</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(l => (
                  <tr key={l._id} className={`hover:bg-elevated/50 transition-colors ${selected.has(l._id) ? "bg-primary/5" : ""}`}>
                    {statusFilter === "pending_review" && (
                      <td className="p-4 pl-5">
                        <input type="checkbox" checked={selected.has(l._id)} onChange={() => toggleSelect(l._id)} className="accent-primary cursor-pointer w-4 h-4" />
                      </td>
                    )}
                    {/* Listing */}
                    <td className="p-4 max-w-[260px]">
                      <div className="flex items-start gap-3">
                        {l.images?.[0] ? (
                          <div className="w-12 h-10 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-elevated">
                            <ConvexImage src={l.images[0]} alt="" className="w-full h-full object-cover object-top" />
                          </div>
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-elevated flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-text line-clamp-2 leading-snug">{l.title}</p>
                          {l.badge && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary mt-0.5 inline-block">{l.badge}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Seller */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-text">{l.sellerName}</p>
                        {l.sellerIsVerified && <ShieldCheck size={12} className="text-success" />}
                      </div>
                      <p className="text-[11px] text-text-muted">{l.sellerEmail}</p>
                      {l.sellerRating > 0 && (
                        <p className="text-[11px] text-warning flex items-center gap-1 mt-0.5">
                          <Star size={10} fill="currentColor" />{l.sellerRating.toFixed(1)}
                        </p>
                      )}
                    </td>
                    {/* Game */}
                    <td className="p-4 text-sm text-text-muted font-medium">{l.gameName}</td>
                    {/* Price */}
                    <td className="p-4">
                      <p className="text-sm font-black text-text">${l.price.toFixed(2)}</p>
                      {l.originalPrice && <p className="text-[11px] text-text-muted line-through">${l.originalPrice.toFixed(2)}</p>}
                    </td>
                    {/* Date */}
                    <td className="p-4 text-[11px] text-text-muted">
                      <div className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(l.createdAt).toLocaleDateString()} {new Date(l.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="p-4 pr-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {statusFilter === "pending_review" ? (
                          <>
                            {/* Approve with badge */}
                            <button
                              onClick={() => setBadgeModal({ id: l._id, title: l.title })}
                              disabled={actionLoading === l._id}
                              className="flex items-center gap-1.5 text-xs font-bold text-success border border-success/30 hover:bg-success/10 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              {actionLoading === l._id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                              Approve
                            </button>
                            {/* Reject */}
                            <button
                              onClick={() => setRejectModal({ id: l._id, title: l.title })}
                              disabled={actionLoading === l._id}
                              className="flex items-center gap-1.5 text-xs font-bold text-danger border border-danger/30 hover:bg-danger/10 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        ) : (
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_OPTIONS.find(s => s.value === statusFilter)?.color}`}>
                            {statusFilter.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve with Badge Modal */}
      {badgeModal && (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={24} />
            </div>
            <h3 className="font-heading font-black text-lg text-text text-center mb-1">Approve Listing</h3>
            <p className="text-xs text-text-muted text-center mb-5 line-clamp-2">"{badgeModal.title}"</p>
            <p className="text-xs font-bold text-text-muted mb-2">Assign Badge (Optional)</p>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {BADGE_OPTIONS.map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedBadge(selectedBadge === b ? "" : b)}
                  className={`text-xs font-black py-2 rounded-lg border transition-all ${selectedBadge === b ? "border-primary bg-primary/10 text-primary" : "border-border bg-elevated text-text-muted hover:border-primary/30"}`}
                >
                  {b === "HOT" ? "🔥" : b === "SALE" ? "💸" : b === "POPULAR" ? "⭐" : "🆕"} {b}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setBadgeModal(null)} className="flex-1 bg-elevated hover:bg-border text-text font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button
                onClick={() => handleApprove(badgeModal.id, selectedBadge || undefined)}
                disabled={!!actionLoading}
                className="flex-1 bg-success hover:opacity-90 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                Approve & Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center mx-auto mb-4">
              <XCircle size={24} />
            </div>
            <h3 className="font-heading font-black text-lg text-text text-center mb-1">Reject Listing</h3>
            <p className="text-xs text-text-muted text-center mb-4 line-clamp-2">"{rejectModal.title}"</p>
            <label className="text-xs font-bold text-text-muted block mb-1.5">Rejection Reason <span className="text-danger">*</span></label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Images are unclear, price is too high, description is misleading..."
              className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-muted outline-none focus:border-danger resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="flex-1 bg-elevated hover:bg-border text-text font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || !!actionLoading}
                className="flex-1 bg-danger hover:opacity-90 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                Reject & Notify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
