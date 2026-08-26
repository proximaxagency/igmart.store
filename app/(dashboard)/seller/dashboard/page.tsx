"use client";

import Link from "next/link";
import { 
  TrendingUp, DollarSign, Package, Star, Plus, ShieldCheck, Box, 
  ArrowUpRight, AlertCircle, CheckCircle2, Store, Zap, Loader2, Sparkles, MessageSquare, Edit, Eye
} from "lucide-react";
import { Badge } from "@/components/ui/index";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "@convex-dev/auth/react";
import { getImageUrl } from "@/lib/imageUrl";

const statusVariant: Record<string, "success" | "warning" | "danger" | "default"> = {
  active: "success",
  pending_review: "warning",
  draft: "default",
  sold: "success",
  rejected: "danger",
  paused: "warning",
};

export default function SellerDashboardPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isLoaded = !isLoading;

  const listings = useQuery(
    api.listings.getMyListings,
    isAuthenticated ? {} : "skip"
  );

  const analytics = useQuery(
    api.seller.getSellerAnalytics,
    isAuthenticated ? {} : "skip"
  );

  const balances = useQuery(
    api.transactions.getMyBalances,
    isAuthenticated ? {} : "skip"
  );

  const kycStatus = useQuery(
    api.seller.getKYCStatus,
    isAuthenticated ? {} : "skip"
  );

  const dbUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-card border border-border rounded-2xl">
        <Loader2 className="animate-spin text-primary mb-3" size={32} />
        <p className="text-sm font-semibold text-text-muted">Loading your Seller Workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-5 shadow-sm">
          <Store size={32} />
        </div>
        <h2 className="font-heading font-black text-2xl sm:text-3xl text-text mb-3">
          Sign In to Access Seller Center
        </h2>
        <p className="text-text-muted text-sm sm:text-base leading-relaxed mb-8">
          Join thousands of verified merchants on IGMART. Manage your active listings, automated instant delivery inventory, and withdraw earnings.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="/login">
            <button className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-primary/25 cursor-pointer">
              Sign In to Store
            </button>
          </a>
          <Link
            href="/sell"
            className="w-full sm:w-auto bg-elevated hover:bg-border text-text font-semibold px-6 py-3 rounded-xl transition-colors border border-border"
          >
            Learn How Selling Works
          </Link>
        </div>
      </div>
    );
  }

  const activeCount = listings?.filter((l) => l.status === "active").length ?? 0;
  const totalRev = analytics?.totalRevenue ?? 0;
  const totalOrders = analytics?.totalOrders ?? 0;
  const availableBal = balances?.walletBalance ?? 0;

  const stats = [
    { label: "Available Payout", value: `$${availableBal.toFixed(2)}`, icon: <DollarSign size={16} />, iconColor: "#4ade80", sub: "Ready for withdrawal" },
    { label: "Total Revenue", value: `$${totalRev.toFixed(2)}`, icon: <TrendingUp size={16} />, iconColor: "#a78bfa", sub: "Lifetime gross sales" },
    { label: "Active Listings", value: `${activeCount}`, icon: <Package size={16} />, iconColor: "#3b82f6", sub: "Live on marketplace" },
    { label: "Completed Orders", value: `${totalOrders}`, icon: <Star size={16} />, iconColor: "#f59e0b", sub: "100% Escrow fulfilled" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-text flex items-center gap-2.5">
            <Store className="text-primary" size={28} /> Merchant Dashboard
          </h1>
          <p className="text-text-muted text-xs sm:text-sm mt-1">
            Welcome back, <span className="font-bold text-text">{dbUser?.displayName || dbUser?.username || "Seller"}</span>! Monitor live sales and manage deliveries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/sell/create"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent-secondary text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-95 shadow-md shadow-primary/20 transition-all cursor-pointer"
          >
            <Plus size={16} /> New Listing
          </Link>
        </div>
      </div>

      {/* KYC Alert if not verified */}
      {(!kycStatus || kycStatus.status !== "approved") && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-text">Verify Identity & Unlock Instant Withdrawals</h4>
              <p className="text-xs text-text-muted mt-0.5">
                Complete a 2-minute identity verification to earn the <span className="text-success font-bold">Verified Merchant</span> badge and lower fee rates.
              </p>
            </div>
          </div>
          <Link
            href="/seller/verification"
            className="shrink-0 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {kycStatus?.status === "pending" ? "Check Status (Pending)" : "Verify Identity"}
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-muted text-xs font-bold uppercase tracking-wider">{s.label}</span>
              <div className="p-1.5 rounded-lg bg-surface border border-border" style={{ color: s.iconColor }}>
                {s.icon}
              </div>
            </div>
            <p className="font-heading font-black text-xl sm:text-2xl text-text">{s.value}</p>
            <p className="text-[11px] text-text-muted mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Two-column workspace */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Main Column: Listings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-base sm:text-lg text-text flex items-center gap-2">
                <Package className="text-primary" size={18} /> My Active Listings ({listings?.length || 0})
              </h2>
              <Link href="/sell/create" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                <Plus size={13} /> Add Item
              </Link>
            </div>

            {listings === undefined ? (
              <div className="text-center py-10 text-text-muted text-xs flex justify-center items-center gap-2">
                <Loader2 className="animate-spin text-primary" size={18} /> Loading listings...
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-surface border border-border text-text-muted flex items-center justify-center mx-auto mb-3">
                  <Box size={24} />
                </div>
                <p className="font-bold text-sm text-text mb-1">No Listings Created Yet</p>
                <p className="text-xs text-text-muted mb-4 max-w-sm mx-auto">
                  List game accounts, coins, items, or boosting services across Clash of Clans, Free Fire, BGMI, PUBG, Roblox and more.
                </p>
                <Link
                  href="/sell/create"
                  className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                >
                  <Plus size={14} /> Create First Listing
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border text-text-muted text-[11px] font-bold uppercase tracking-wider">
                      <th className="pb-3 pr-4">Item Details</th>
                      <th className="pb-3 pr-4">Price</th>
                      <th className="pb-3 pr-4">Views</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {listings.map((l) => {
                      const safeImg = getImageUrl(l.images?.[0]);
                      return (
                        <tr key={l._id} className="hover:bg-elevated/40 transition-colors">
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-elevated relative overflow-hidden flex-shrink-0 border border-border">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={safeImg} alt="" className="w-full h-full object-cover object-top" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-text truncate max-w-[180px] sm:max-w-xs">{l.title}</p>
                                <p className="text-[11px] text-text-muted truncate max-w-[180px] sm:max-w-xs mt-0.5">{l.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 pr-4 font-bold text-text">${l.price.toFixed(2)}</td>
                          <td className="py-3.5 pr-4 text-text-muted">{l.views || 0}</td>
                          <td className="py-3.5 pr-4">
                            <Badge variant={statusVariant[l.status] ?? "default"} size="sm">
                              {l.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/sell/create?edit=${l._id}`}
                                className="inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-bold px-2.5 py-1 rounded-lg transition-colors text-xs"
                                title="Edit Listing"
                              >
                                <Edit size={12} /> Edit
                              </Link>
                              <Link
                                href={`/listing/${l._id}`}
                                className="inline-flex items-center gap-1 bg-elevated hover:bg-border text-text-muted hover:text-text border border-border font-medium px-2 py-1 rounded-lg transition-colors text-xs"
                                title="View Public Listing"
                              >
                                <Eye size={12} />
                              </Link>
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
        </div>

        {/* Right Sidebar: Shortcuts & Escrow Security */}
        <div className="space-y-6">
          {/* Quick Hub Controls */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="font-heading font-bold text-sm text-text mb-4 flex items-center gap-2">
              <Zap className="text-primary" size={16} /> Quick Actions
            </h3>
            <div className="space-y-2.5">
              <Link
                href="/seller/inventory"
                className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border hover:border-primary/40 transition-all text-xs font-semibold text-text group"
              >
                <div className="flex items-center gap-2.5">
                  <Box size={16} className="text-primary group-hover:scale-110 transition-transform" />
                  <span>Instant Delivery Vault</span>
                </div>
                <ArrowUpRight size={14} className="text-text-muted group-hover:text-primary transition-colors" />
              </Link>

              <Link
                href="/seller/earnings"
                className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border hover:border-primary/40 transition-all text-xs font-semibold text-text group"
              >
                <div className="flex items-center gap-2.5">
                  <DollarSign size={16} className="text-success group-hover:scale-110 transition-transform" />
                  <span>Withdraw Earnings</span>
                </div>
                <ArrowUpRight size={14} className="text-text-muted group-hover:text-primary transition-colors" />
              </Link>

              <Link
                href="/messages"
                className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border hover:border-primary/40 transition-all text-xs font-semibold text-text group"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare size={16} className="text-purple-400 group-hover:scale-110 transition-transform" />
                  <span>Buyer Messages</span>
                </div>
                <ArrowUpRight size={14} className="text-text-muted group-hover:text-primary transition-colors" />
              </Link>

              <Link
                href="/seller/analytics"
                className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border hover:border-primary/40 transition-all text-xs font-semibold text-text group"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Store Analytics</span>
                </div>
                <ArrowUpRight size={14} className="text-text-muted group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>

          {/* Seller Protection Guarantee */}
          <div className="bg-surface/60 border border-border rounded-2xl p-5 text-xs text-text-muted space-y-2.5">
            <h4 className="font-heading font-bold text-text flex items-center gap-2">
              <ShieldCheck className="text-success" size={16} /> 100% Seller Protection
            </h4>
            <p className="leading-relaxed">
              Every buyer deposit is held in strict escrow before you deliver credentials. Once confirmed, funds automatically clear to your balance.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
