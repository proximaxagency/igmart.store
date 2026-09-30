"use client";

import React from "react";
import Link from "next/link";
import { 
  Users, Database, DollarSign, AlertTriangle, Loader2, ArrowUpRight, 
  ShieldCheck, Clock, CheckCircle2, MessageSquare, Settings, ArrowRight,
  TrendingUp, Activity, FileText, RefreshCw, ShieldAlert
} from "lucide-react";
import { StatCard } from "@/components/ui/index";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useCurrency } from "@/components/providers/CurrencyProvider";

export default function AdminDashboardPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isLoaded = !isLoading;
  const { format } = useCurrency();

  const metrics = useQuery(api.admin.getAdminMetrics, isAuthenticated ? {} : "skip");
  const listingStats = useQuery(api.admin.getListingAdminStats, isAuthenticated ? {} : "skip");
  const auditLogs = useQuery(api.admin.listAuditLogs, isAuthenticated ? { limit: 12 } : "skip");

  return (
    <div className="space-y-8">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-text flex items-center gap-3">
            Admin Command Center
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-success/10 text-success border border-success/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Live Production
            </span>
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Real-time analytics, marketplace governance, and risk oversight.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/listings"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-primary/20"
          >
            Review Listings
            {listingStats && listingStats.pending > 0 && (
              <span className="bg-warning text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {listingStats.pending}
              </span>
            )}
            <ArrowUpRight size={14} />
          </Link>
          <Link
            href="/admin/disputes"
            className="px-4 py-2 rounded-xl bg-elevated hover:bg-border text-text font-bold text-xs transition-colors border border-border flex items-center gap-1.5"
          >
            Disputes
            {metrics && metrics.openDisputes > 0 && (
              <span className="bg-warning text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {metrics.openDisputes}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ── Pending Listings Action Banner ── */}
      {listingStats && listingStats.pending > 0 && (
        <div className="p-4 rounded-2xl bg-warning/10 border border-warning/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-warning/20 text-warning flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-text">
                {listingStats.pending} Listing{listingStats.pending > 1 ? "s" : ""} Awaiting Moderation Approval
              </p>
              <p className="text-xs text-text-muted">
                New seller submissions require review before appearing live on the marketplace.
              </p>
            </div>
          </div>
          <Link
            href="/admin/listings"
            className="px-4 py-2 rounded-xl bg-warning hover:bg-warning/90 text-black text-xs font-bold transition-colors text-center shrink-0"
          >
            Open Review Queue →
          </Link>
        </div>
      )}

      {/* ── Key Metrics Grid ── */}
      {metrics === undefined ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-card border border-border rounded-2xl animate-pulse flex items-center justify-center">
              <Loader2 className="animate-spin text-primary/40" size={24} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Gross Volume (GMV)</span>
              <div className="w-9 h-9 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="font-heading font-black text-2xl sm:text-3xl text-text">
              {format(metrics.gmv)}
            </div>
            <p className="text-[11px] text-text-muted mt-2 flex items-center gap-1">
              <TrendingUp size={13} className="text-success" />
              Across {metrics.totalOrders} total platform orders
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">User Community</span>
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Users size={18} />
              </div>
            </div>
            <div className="font-heading font-black text-2xl sm:text-3xl text-text">
              {metrics.totalUsers}
            </div>
            <p className="text-[11px] text-text-muted mt-2">
              <span className="text-primary font-bold">{metrics.activeSellers}</span> active registered sellers
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Live Inventory</span>
              <div className="w-9 h-9 rounded-xl bg-accent-secondary/10 text-accent-secondary flex items-center justify-center">
                <Database size={18} />
              </div>
            </div>
            <div className="font-heading font-black text-2xl sm:text-3xl text-text">
              {metrics.activeListings}
            </div>
            <p className="text-[11px] text-text-muted mt-2">
              Verified active game items & accounts
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Action Required</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                metrics.openDisputes > 0 ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"
              }`}>
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="font-heading font-black text-2xl sm:text-3xl text-text">
              {metrics.openDisputes} <span className="text-sm font-normal text-text-muted">disputes</span>
            </div>
            <p className="text-[11px] text-text-muted mt-2">
              <span className="text-warning font-bold">{metrics.openTickets}</span> open support inquiry tickets
            </p>
          </div>
        </div>
      )}

      {/* ── Quick Admin Actions Grid ── */}
      <div>
        <h2 className="font-heading font-black text-base text-text uppercase tracking-wider mb-3">
          Governance & Operations Hub
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Listings Moderation", desc: "Review & badges", href: "/admin/listings", icon: <Database size={18} /> },
            { label: "User Directory", desc: "Roles & wallets", href: "/admin/users", icon: <Users size={18} /> },
            { label: "Dispute Arbitrator", desc: "Escrow funds", href: "/admin/disputes", icon: <ShieldAlert size={18} /> },
            { label: "Finance & Payouts", desc: "Ledger & payouts", href: "/admin/finance", icon: <DollarSign size={18} /> },
            { label: "Live Support Desk", desc: "Customer chats", href: "/admin/support", icon: <MessageSquare size={18} /> },
            { label: "Global Settings", desc: "Fees & policies", href: "/admin/settings", icon: <Settings size={18} /> },
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="p-4 bg-card hover:bg-elevated border border-border hover:border-primary/50 rounded-2xl transition-all group flex flex-col justify-between"
            >
              <div className="text-primary group-hover:scale-110 transition-transform mb-3">
                {item.icon}
              </div>
              <div>
                <p className="font-heading font-bold text-xs text-text group-hover:text-primary-hover transition-colors leading-snug">
                  {item.label}
                </p>
                <p className="text-[10px] text-text-muted mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── System Activity & Audit Trail ── */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Activity size={17} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-text">Recent Administrative Audit Logs</h2>
              <p className="text-xs text-text-muted">Immutable trail of platform moderation actions</p>
            </div>
          </div>
          <Link
            href="/admin/audit"
            className="text-xs font-bold text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {auditLogs === undefined ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-10 text-text-muted text-xs">
            No audit events recorded yet. Platform actions will appear here in real-time.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {auditLogs.slice(0, 8).map((log) => (
              <div key={log._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-text truncate">
                      <span className="text-primary font-mono">{log.action}</span>
                      {log.targetType && (
                        <span className="text-text-muted font-normal ml-1.5">on {log.targetType}</span>
                      )}
                    </p>
                    <p className="text-[11px] text-text-muted truncate">
                      By <span className="text-text font-medium">{log.actorName || "Admin"}</span>
                      {log.metadata && typeof log.metadata === "object" && Object.keys(log.metadata).length > 0 && (
                        <span className="text-text-muted ml-1">
                          • {JSON.stringify(log.metadata).slice(0, 60)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-text-muted whitespace-nowrap shrink-0">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
