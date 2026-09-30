"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConvexAuth } from "@convex-dev/auth/react";
import { Box, Plus, Key, CheckCircle2, Lock, Loader2 } from "lucide-react";

export default function SellerInventoryPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isLoaded = !isLoading;
  const listings = useQuery(api.listings.getMyListings, isAuthenticated ? {} : "skip");
  const inventory = useQuery(api.seller.getInventory, isAuthenticated ? {} : "skip");
  const addInventoryItem = useMutation(api.seller.addInventoryItem);

  const [selectedListingId, setSelectedListingId] = useState<string>("");
  const [secretData, setSecretData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListingId || !secretData.trim()) return;

    setIsSubmitting(true);
    try {
      await addInventoryItem({
        listingId: selectedListingId as Id<"listings">,
        secretData: secretData.trim(),
      });
      setSecretData("");
    } catch (err) {
      console.error("Failed to add inventory item:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-black text-2xl text-text flex items-center gap-2">
            <Box className="text-primary" size={24} /> Inventory Vault (Instant Delivery)
          </h1>
          <p className="text-text-muted text-xs mt-0.5">Pre-load digital account logins or keys into the vault for 100% automated instant buyer delivery</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Deposit Credentials Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-heading font-bold text-base text-text flex items-center gap-2 mb-4">
            <Lock className="text-primary" size={16} /> Deposit Vault Credentials
          </h2>
          <form onSubmit={handleAddStock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Target Listing</label>
              <select
                value={selectedListingId}
                onChange={(e) => setSelectedListingId(e.target.value)}
                required
                className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary"
              >
                <option value="">-- Select Active Listing --</option>
                {listings?.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.title} (${l.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Login Credentials / Secret Key</label>
              <textarea
                required
                rows={4}
                value={secretData}
                onChange={(e) => setSecretData(e.target.value)}
                placeholder="Username:Password&#10;Recovery Key: XYZ-12345"
                className="w-full bg-surface border border-border rounded-xl p-3 text-xs text-text placeholder:text-text-muted outline-none focus:border-primary font-mono"
              />
              <p className="text-[11px] text-text-muted mt-1">Stored securely. Automatically transferred to buyer upon payment verification.</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedListingId || !secretData.trim()}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-xs py-3 px-4 rounded-xl disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Deposit to Vault
            </button>
          </form>
        </div>

        {/* Vault Stock Table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border bg-surface flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-text">Live Vault Stock ({inventory?.length ?? 0})</h2>
          </div>

          {inventory === undefined ? (
            <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : inventory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-text-muted font-bold">
                    <th className="p-4 pl-6">Item Vault ID</th>
                    <th className="p-4">Encrypted Payload</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {inventory.map((item) => (
                    <tr key={item._id} className="hover:bg-elevated/50 transition-colors">
                      <td className="p-4 pl-6 text-xs font-mono font-bold text-text">#{item._id.slice(-6)}</td>
                      <td className="p-4 text-xs font-mono text-text-muted max-w-[200px] truncate">
                        {item.secretData.substring(0, 10)}... (Encrypted)
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          item.status === "available"
                            ? "bg-success/10 text-success border border-success/20"
                            : "bg-elevated text-text-muted border border-border"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-xs text-text-muted">{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-text-muted text-xs">
              No digital stock deposited yet. Select a listing above to deposit instant delivery credentials.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
