"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Database, CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function AdminListingsPage() {
  const { user, isLoaded } = useUser();
  const listings = useQuery(api.listings.listActiveListings, {});
  const updateListingStatus = useMutation(api.admin.updateListingStatus);

  const handleStatus = async (listingId: Id<"listings">, status: "active" | "rejected" | "removed") => {
    try {
      await updateListingStatus({ listingId, status });
    } catch (err) {
      console.error("Failed to update listing status:", err);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl text-text">Listing Moderation Desk</h1>
        <p className="text-text-muted text-xs mt-0.5">Review, approve, pause or remove marketplace listings</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {listings === undefined ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : listings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-muted font-bold">
                  <th className="p-4 pl-6">Listing Title</th>
                  <th className="p-4">Game</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listings.map((l) => (
                  <tr key={l._id} className="hover:bg-elevated/50 transition-colors">
                    <td className="p-4 pl-6 text-sm font-bold text-text max-w-[240px] truncate">
                      {l.title}
                    </td>
                    <td className="p-4 text-xs text-text-muted font-semibold">{l.gameName || "Gaming Asset"}</td>
                    <td className="p-4 text-sm font-black text-text">${l.price.toFixed(2)}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/20">
                        {l.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleStatus(l._id, "rejected")}
                          className="text-xs font-bold text-warning border border-warning/30 hover:bg-warning/10 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                        <button
                          onClick={() => handleStatus(l._id, "removed")}
                          className="text-xs font-bold text-danger border border-danger/30 hover:bg-danger/10 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-text-muted text-sm">No listings currently needing moderation.</div>
        )}
      </div>
    </div>
  );
}
