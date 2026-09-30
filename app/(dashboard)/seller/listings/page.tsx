"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "@convex-dev/auth/react";
import { Id } from "@/convex/_generated/dataModel";
import {
  Package, Plus, Pause, Play, Trash2, Edit, Loader2, AlertTriangle, CheckCircle2, LayoutGrid
} from "lucide-react";
import { Badge } from "@/components/ui/index";
import { ConvexImage } from "@/components/shared/ConvexImage";

const statusVariant: Record<string, "success" | "warning" | "danger" | "default"> = {
  active: "success", pending_review: "warning", draft: "default",
  sold: "success", rejected: "danger", paused: "warning", removed: "danger",
};

type ConfirmAction = { type: "pause" | "resume" | "delete"; listingId: Id<"listings">; title: string } | null;

export default function SellerListingsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isLoaded = !isLoading;
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const listings = useQuery(api.listings.getMyListings, isAuthenticated ? {} : "skip");
  const updateListing = useMutation(api.listings.updateListing);
  const deleteListing = useMutation(api.listings.deleteListing);

  const executeAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      if (confirm.type === "pause") {
        await updateListing({ listingId: confirm.listingId, status: "paused" });
        setFeedback({ type: "success", msg: `"${confirm.title}" has been paused.` });
      } else if (confirm.type === "resume") {
        await updateListing({ listingId: confirm.listingId, status: "active" });
        setFeedback({ type: "success", msg: `"${confirm.title}" is now live again.` });
      } else if (confirm.type === "delete") {
        await deleteListing({ listingId: confirm.listingId });
        setFeedback({ type: "success", msg: `"${confirm.title}" has been removed.` });
      }
    } catch (err: any) {
      setFeedback({ type: "error", msg: err.message || "Action failed" });
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-text flex items-center gap-2">
            <Package className="text-primary" size={24} /> My Listings
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Manage your active listings, pause or remove items</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/sell/create"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-primary/20"
          >
            <Plus size={16} /> List
          </Link>
          <Link
            href="/admin/bulk-upload"
            className="inline-flex items-center gap-2 bg-elevated hover:bg-border text-text border border-border text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
          >
            <LayoutGrid size={16} /> Bulk List
          </Link>
        </div>
      </div>

      {feedback && (
        <div className={`p-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${
          feedback.type === "success" ? "bg-success/10 text-success border border-success/20" : "bg-danger/10 text-danger border border-danger/20"
        }`}>
          {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {feedback.msg}
        </div>
      )}

      {/* Confirm Modal */}
      {confirm && (
        <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
              confirm.type === "delete" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"
            }`}>
              <AlertTriangle size={24} />
            </div>
            <h3 className="font-heading font-black text-lg text-text text-center mb-2">Confirm Action</h3>
            <p className="text-sm text-text-muted text-center mb-6">
              {confirm.type === "pause" && `Pause "${confirm.title}"? It will be hidden from the marketplace.`}
              {confirm.type === "resume" && `Resume "${confirm.title}"? It will become visible again.`}
              {confirm.type === "delete" && `Remove "${confirm.title}"? This cannot be undone.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 bg-elevated hover:bg-border text-text font-bold py-2.5 rounded-xl text-sm">
                Cancel
              </button>
              <button
                onClick={executeAction}
                disabled={actionLoading}
                className={`flex-1 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 ${
                  confirm.type === "delete" ? "bg-danger text-white" : confirm.type === "resume" ? "bg-success text-white" : "bg-warning text-white"
                }`}
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                {confirm.type === "delete" ? "Remove" : confirm.type === "pause" ? "Pause" : "Resume"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Listings table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {listings === undefined ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={28} /></div>
        ) : listings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-muted font-bold">
                  <th className="p-4 pl-6">Listing</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Views</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listings.map((l) => {
                  return (
                    <tr key={l._id} className="hover:bg-elevated/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-elevated relative overflow-hidden flex-shrink-0 border border-border">
                            <ConvexImage src={l.images?.[0]} alt="" className="w-full h-full object-cover object-top" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-text truncate max-w-[180px] sm:max-w-xs">{l.title}</p>
                            <p className="text-[11px] text-text-muted truncate max-w-[180px] sm:max-w-xs mt-0.5">{l.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-bold text-text">${l.price.toFixed(2)}</td>
                      <td className="p-4 text-sm text-text-muted">{l.views || 0}</td>
                    <td className="p-4">
                      <Badge variant={statusVariant[l.status] ?? "default"} size="sm">
                        {l.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {l.status === "active" && (
                          <button
                            onClick={() => setConfirm({ type: "pause", listingId: l._id, title: l.title })}
                            className="text-xs font-bold text-warning border border-warning/30 hover:bg-warning/10 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <Pause size={12} /> Pause
                          </button>
                        )}
                        {l.status === "paused" && (
                          <button
                            onClick={() => setConfirm({ type: "resume", listingId: l._id, title: l.title })}
                            className="text-xs font-bold text-success border border-success/30 hover:bg-success/10 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <Play size={12} /> Resume
                          </button>
                        )}
                        <Link
                          href={`/sell/create?edit=${l._id}`}
                          className="text-xs font-bold text-primary border border-primary/30 hover:bg-primary/10 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Edit size={12} /> Edit
                        </Link>
                        {l.status !== "sold" && (
                          <button
                            onClick={() => setConfirm({ type: "delete", listingId: l._id, title: l.title })}
                            className="text-xs font-bold text-danger border border-danger/30 hover:bg-danger/10 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Remove
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
        ) : (
          <div className="p-16 text-center">
            <Package size={48} className="text-text-muted mx-auto mb-4 opacity-30" />
            <p className="font-bold text-text mb-2">No listings yet</p>
            <p className="text-sm text-text-muted mb-6">Create your first listing to start selling on IGMART.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/sell/create"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                <Plus size={16} /> Create Listing
              </Link>
              <Link
                href="/admin/bulk-upload"
                className="inline-flex items-center gap-2 bg-elevated hover:bg-border text-text border border-border font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                <LayoutGrid size={16} /> Bulk Upload
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
