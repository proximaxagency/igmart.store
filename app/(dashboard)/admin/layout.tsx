"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield, MessageSquare, Users, Database, AlertTriangle, Settings,
  ArrowLeft, ShieldAlert, Loader2, ShieldCheck, DollarSign, FileText,
  LayoutDashboard, Upload, Menu, X, ChevronRight, CheckCircle2,
  ExternalLink, Sparkles, Gamepad2
} from "lucide-react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface NavGroup {
  groupName: string;
  items: {
    href: string;
    label: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
  }[];
}

const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    groupName: "OPERATIONS",
    items: [
      { href: "/admin", label: "Overview", icon: Shield },
      { href: "/admin/support", label: "Live Support Desk", icon: MessageSquare, badge: "LIVE", badgeColor: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
      { href: "/seller/dashboard", label: "Seller Panel", icon: LayoutDashboard },
    ],
  },
  {
    groupName: "MARKETPLACE",
    items: [
      { href: "/admin/listings", label: "Listing Moderation", icon: Database },
      { href: "/admin/games", label: "Game Visibility", icon: Gamepad2, badge: "SHOW/HIDE", badgeColor: "bg-primary/15 text-primary border border-primary/30" },
      { href: "/admin/verifications", label: "Seller KYC Queue", icon: ShieldCheck },
      { href: "/admin/bulk-upload", label: "Bulk Upload", icon: Upload },
    ],
  },
  {
    groupName: "FINANCE & ESCROW",
    items: [
      { href: "/admin/disputes", label: "Disputes & Escrow", icon: AlertTriangle },
      { href: "/admin/finance", label: "Finance & Payouts", icon: DollarSign },
    ],
  },
  {
    groupName: "SYSTEM & SECURITY",
    items: [
      { href: "/admin/users", label: "User Management", icon: Users },
      { href: "/admin/risk", label: "Risk Operations", icon: ShieldAlert },
      { href: "/admin/audit", label: "System Audit Logs", icon: FileText },
      { href: "/admin/settings", label: "System Settings", icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isLoaded = !isLoading;
  const dbUser = useQuery(api.users.getCurrentUser, isLoaded && isAuthenticated ? {} : "skip");
  const ensureAdminRole = useMutation(api.users.ensureAdminRole);
  const attemptedRef = useRef(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Safe admin role sync
  useEffect(() => {
    if (isAuthenticated && dbUser && !attemptedRef.current) {
      const email = dbUser?.email?.toLowerCase() || "";
      const isAdminEmail = email.includes("proximaxagency") || email === "proximaxagency@gmail.com";
      if (isAdminEmail && dbUser.role !== "admin" && dbUser.role !== "super_admin") {
        attemptedRef.current = true;
        ensureAdminRole().catch(() => {});
      }
    }
  }, [isAuthenticated, dbUser, ensureAdminRole]);

  const email = dbUser?.email?.toLowerCase() || "";
  const isAdmin = email.includes("proximaxagency") || email === "proximaxagency@gmail.com" || dbUser?.role === "admin" || dbUser?.role === "super_admin";

  // 1. Loading State
  if (!isLoaded || (isAuthenticated && dbUser === undefined)) {
    return (
      <div className="min-h-[calc(100vh-76px)] flex flex-col items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary mb-3" size={32} />
        <p className="text-xs text-text-muted">Verifying administrator credentials...</p>
      </div>
    );
  }

  // 2. Not Authenticated State
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-76px)] flex items-center justify-center bg-background px-4 py-16">
        <div className="text-center max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl space-y-5">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto">
            <Shield size={36} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
              Staff Portal
            </span>
            <h1 className="font-heading font-black text-2xl text-text mt-3 mb-2">Sign In Required</h1>
            <p className="text-text-muted text-xs leading-relaxed">
              Please sign in with your administrator account to access the IGMART Core control desk.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login?redirect=/admin"
              className="inline-flex items-center justify-center w-full bg-primary hover:bg-primary-hover text-white font-bold text-xs py-3 px-6 rounded-xl transition-colors"
            >
              Sign In to Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Security Barrier: Deny access to non-admin users
  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-76px)] flex items-center justify-center bg-background px-4 py-16">
        <div className="text-center max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl space-y-5">
          <div className="w-16 h-16 bg-danger/10 border border-danger/20 text-danger rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert size={36} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-danger bg-danger/10 px-2.5 py-1 rounded-md border border-danger/20">
              403 Forbidden Access
            </span>
            <h1 className="font-heading font-black text-2xl text-text mt-3 mb-2">Admin Permission Required</h1>
            <p className="text-text-muted text-xs leading-relaxed">
              You do not have administrative privileges to view this portal. Access is restricted exclusively to authorized staff accounts.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full bg-primary hover:bg-primary-hover text-white font-bold text-xs py-3 px-6 rounded-xl transition-colors"
            >
              Return to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const staffName = dbUser?.displayName || dbUser?.username || "proximax";

  const renderNavLinks = () => (
    <div className="space-y-5">
      {ADMIN_NAV_GROUPS.map((group) => (
        <div key={group.groupName} className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted/70 px-3 pb-1">
            {group.groupName}
          </p>
          {group.items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-primary text-white shadow-sm font-bold"
                    : "text-text-secondary hover:bg-elevated hover:text-text"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full ${
                      active
                        ? "bg-white/20 text-white"
                        : item.badgeColor || "bg-primary/10 text-primary border border-primary/20"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-background min-h-[calc(100vh-76px)] py-5 lg:py-8">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Mobile Admin Header ── */}
        <div className="md:hidden flex items-center justify-between bg-card border border-border rounded-xl p-3 mb-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-danger/10 border border-danger/20 flex items-center justify-center text-danger">
              <Shield size={16} />
            </div>
            <div>
              <p className="font-heading font-black text-xs text-text">IGMART Core</p>
              <p className="text-[10px] text-text-muted">Staff Control Desk</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-elevated hover:bg-border rounded-lg text-xs font-bold text-text border border-border"
          >
            <Menu size={14} />
            <span>Admin Menu</span>
          </button>
        </div>

        {/* ── Mobile Drawer ── */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm md:hidden flex justify-start">
            <div className="w-[280px] bg-card border-r border-border h-full p-4 overflow-y-auto flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Shield size={18} className="text-danger" />
                    <span className="font-heading font-black text-sm text-text">Admin Workspace</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg hover:bg-elevated text-text-muted"
                  >
                    <X size={18} />
                  </button>
                </div>
                {renderNavLinks()}
              </div>

              <div className="pt-4 border-t border-border mt-4">
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-elevated text-text text-xs font-bold rounded-xl"
                >
                  <ArrowLeft size={14} />
                  <span>Exit to Marketplace</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Desktop Layout ── */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block w-[240px] lg:w-[260px] flex-shrink-0">
            <div className="bg-card border border-border rounded-2xl p-4 md:sticky md:top-[90px] shadow-sm space-y-4">
              
              {/* Staff Profile Header */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 via-amber-500 to-primary flex items-center justify-center font-heading font-black text-white text-sm shadow flex-shrink-0">
                  {staffName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-heading font-bold text-xs text-text truncate">
                      {staffName}
                    </p>
                    <CheckCircle2 size={13} className="text-cyan-400 flex-shrink-0" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                    SUPER ADMIN
                  </span>
                </div>
              </div>

              {/* Title & Back Link */}
              <div className="pb-3 border-b border-border flex items-center justify-between">
                <div>
                  <span className="text-[9px] bg-danger/10 text-danger border border-danger/20 font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                    Admin Workspace
                  </span>
                  <p className="font-heading font-black text-base text-text mt-1">IGMART Core</p>
                </div>
                <Link
                  href="/"
                  className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-elevated transition-colors"
                  title="Back to Marketplace"
                >
                  <ArrowLeft size={16} />
                </Link>
              </div>

              {/* Categorized Navigation */}
              <nav aria-label="Admin Navigation">
                {renderNavLinks()}
              </nav>

              {/* Quick Switch to Seller Hub */}
              <div className="pt-3 border-t border-border">
                <Link
                  href="/seller/dashboard"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/20 text-xs font-bold text-primary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard size={14} />
                    <span>Seller Panel</span>
                  </div>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
