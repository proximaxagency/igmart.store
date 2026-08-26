"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "@convex-dev/auth/react";
import { BarChart3, TrendingUp, Star, Eye, Package, ShieldCheck, Loader2 } from "lucide-react";

export default function SellerAnalyticsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isLoaded = !isLoading;
  const analytics = useQuery(api.seller.getSellerAnalytics, isAuthenticated ? {} : "skip");

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl text-text flex items-center gap-2">
          <BarChart3 className="text-primary" size={24} /> Seller Performance & Offer Score
        </h1>
        <p className="text-text-muted text-xs mt-0.5">Understand your offer ranking signals, conversion rates, and storefront engagement</p>
      </div>

      {analytics === undefined ? (
        <div className="flex justify-center p-16">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-wider mb-2">
                <TrendingUp size={15} /> Total Revenue
              </div>
              <p className="font-heading font-black text-2xl sm:text-3xl text-text">
                ${(analytics?.totalRevenue ?? 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-wider mb-2">
                <Package size={15} /> Total Completed Orders
              </div>
              <p className="font-heading font-black text-2xl sm:text-3xl text-text">
                {analytics?.totalOrders ?? 0}
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-wider mb-2">
                <Eye size={15} /> Total Listing Views
              </div>
              <p className="font-heading font-black text-2xl sm:text-3xl text-text">
                {analytics?.totalViews ?? 0}
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-wider mb-2">
                <Star size={15} /> Storefront Rating
              </div>
              <p className="font-heading font-black text-2xl sm:text-3xl text-warning">
                {(analytics?.rating ?? 5.0).toFixed(1)} / 5.0
              </p>
            </div>
          </div>

          {/* Ranking & Level Perks */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-xl">
                <ShieldCheck size={32} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                  Seller Level
                </span>
                <h3 className="font-heading font-black text-xl text-text mt-1">{analytics?.sellerLevel} Seller Tier</h3>
                <p className="text-xs text-text-muted mt-0.5">Higher ranks unlock lower marketplace fees & boosted search visibility</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-text">IGMart Offer Score</p>
                <p className="text-xs text-success font-semibold">98.4 / 100 Excellent</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
