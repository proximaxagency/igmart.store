"use client";

import Link from "next/link";
import { TrendingUp, DollarSign, Package, Star, Plus } from "lucide-react";
import { StatCard, Badge } from "@/components/ui/index";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const stats = [
  { label: "Total Revenue", value: "$0.00", icon: <DollarSign size={16} />, iconColor: "#4ade80", change: "0%", positive: true },
  { label: "Active Orders", value: "0", icon: <Package size={16} />, iconColor: "#3b82f6", change: "0%", positive: false },
  { label: "Total Sales", value: "0", icon: <TrendingUp size={16} />, iconColor: "#a78bfa", change: "0%", positive: true },
  { label: "Avg Rating", value: "0.0", icon: <Star size={16} />, iconColor: "#f59e0b", change: "0", positive: true },
];

const actionItems = [
  { step: 1, title: "Verify Identity", desc: "Required to withdraw funds.", done: true },
  { step: 2, title: "Add Payout Method", desc: "Link your bank or crypto wallet.", done: false },
  { step: 3, title: "Create a Listing", desc: "Start selling to earn money.", done: false },
];

const statusVariant: Record<string, "success" | "warning" | "danger" | "default"> = {
  active: "success",
  pending_review: "warning",
  draft: "default",
  sold: "success",
  rejected: "danger",
  paused: "warning",
};

export default function SellerDashboardPage() {
  const listings = useQuery(api.listings.getMyListings);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl text-text">Dashboard</h1>
        <Link
          href="/sell/create"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          style={{ background: "var(--gradient-brand)" }}
        >
          <Plus size={16} /> New Listing
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Two-column grid */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Live Listings */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-bold text-lg text-text">My Active Listings</h2>
            <button className="text-sm font-semibold text-primary-hover hover:underline">View All</button>
          </div>

          {listings === undefined ? (
            <div className="text-center py-8 text-text-muted">Loading listings...</div>
          ) : listings.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
              <p className="text-text-muted mb-3">You don't have any listings yet.</p>
              <Link href="/sell/create" className="text-primary font-bold hover:underline">Create your first listing</Link>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-xs font-bold text-text-muted uppercase tracking-wider">Title</th>
                      <th className="pb-3 text-xs font-bold text-text-muted uppercase tracking-wider">Price</th>
                      <th className="pb-3 text-xs font-bold text-text-muted uppercase tracking-wider">Views</th>
                      <th className="pb-3 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((listing, i) => (
                      <tr key={listing._id} className={i < listings.length - 1 ? "border-b border-border" : ""}>
                        <td className="py-4 pr-4">
                          <p className="text-sm font-semibold text-text">{listing.title}</p>
                          <p className="text-xs text-text-muted mt-0.5 truncate max-w-[200px]">{listing.description}</p>
                        </td>
                        <td className="py-4 text-sm font-bold text-text pr-4">${listing.price.toFixed(2)}</td>
                        <td className="py-4 text-sm font-medium text-text-muted pr-4">{listing.views}</td>
                        <td className="py-4">
                          <Badge variant={statusVariant[listing.status] ?? "default"}>{listing.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="flex flex-col gap-3 sm:hidden">
                {listings.map((listing) => (
                  <div key={listing._id} className="bg-elevated border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text leading-snug">{listing.title}</p>
                      </div>
                      <Badge variant={statusVariant[listing.status] ?? "default"}>{listing.status}</Badge>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-base font-bold text-text">${listing.price.toFixed(2)}</p>
                      <p className="text-xs text-text-muted">{listing.views} views</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Action items */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-heading font-bold text-lg text-text mb-5">Action Items</h2>
          <div className="flex flex-col gap-4">
            {actionItems.map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                    item.done || (item.step === 3 && listings && listings.length > 0) ? "bg-primary text-white" : "bg-primary/10 text-primary-hover border border-primary/30"
                  }`}
                >
                  {item.done || (item.step === 3 && listings && listings.length > 0) ? "✓" : item.step}
                </div>
                <div>
                  <p className={`text-sm font-semibold mb-0.5 ${item.done || (item.step === 3 && listings && listings.length > 0) ? "text-text-muted line-through" : "text-text"}`}>
                    {item.title}
                  </p>
                  <p className="text-xs text-text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
