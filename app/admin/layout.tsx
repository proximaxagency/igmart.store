"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, MessageSquare, Users, Database, AlertTriangle, Settings, ArrowLeft, ShieldAlert, Loader2, ShieldCheck, DollarSign, FileText } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";



export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user: clerkUser, isLoaded } = useUser();
  const dbUser = useQuery(api.users.getCurrentUser, isLoaded && clerkUser ? {} : "skip");

  const email = clerkUser?.primaryEmailAddress?.emailAddress?.toLowerCase() || clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase() || "";
  const isAdmin = email.includes("proximaxagency") || email === "proximaxagency@gmail.com" || dbUser?.role === "admin" || dbUser?.role === "super_admin";

  const links = [
    { href: "/admin", label: "Overview", icon: Shield },
    { href: "/admin/support", label: "Live Support Desk", icon: MessageSquare, badge: "LIVE" },
    { href: "/admin/verifications", label: "Seller KYC Queue", icon: ShieldCheck },
    { href: "/admin/finance", label: "Finance & Payouts", icon: DollarSign },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/listings", label: "Listing Moderation", icon: Database },
    { href: "/admin/disputes", label: "Disputes & Escrow", icon: AlertTriangle },
    { href: "/admin/risk", label: "Risk Operations", icon: ShieldAlert },
    { href: "/admin/audit", label: "System Audit Logs", icon: FileText },
    { href: "/admin/settings", label: "System Settings", icon: Settings },
  ];

  // 1. Loading State
  if (!isLoaded) {
    return (
      <div className="min-h-[calc(100vh-76px)] flex flex-col items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary mb-3" size={32} />
        <p className="text-xs text-text-muted">Verifying administrator credentials...</p>
      </div>
    );
  }

  // 2. Security Barrier: Deny access to non-admin users
  if (!clerkUser || !isAdmin) {
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

  // 3. Authorized Admin Workspace
  return (
    <div className="bg-background min-h-[calc(100vh-76px)] py-6 lg:py-10">
      <div className="container flex flex-col md:flex-row gap-6 lg:gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-[260px] lg:w-[280px] flex-shrink-0">
          <div className="bg-card border border-border rounded-2xl p-5 md:sticky md:top-[90px] shadow-sm">
            <div className="mb-6 pb-5 border-b border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] bg-danger/10 text-danger border border-danger/20 font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                  Admin Workspace
                </span>
                <p className="font-heading font-black text-xl text-text mt-2">IGMART Core</p>
              </div>
              <Link href="/" className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-elevated transition-colors" title="Back to Marketplace">
                <ArrowLeft size={18} />
              </Link>
            </div>

            <nav className="flex flex-col gap-1.5" aria-label="Admin Navigation">
              {links.map((link) => {
                const active = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? "bg-primary text-white shadow-sm"
                        : "text-text-secondary hover:bg-elevated hover:text-text"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className={`text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full ${
                        active ? "bg-white/20 text-white" : "bg-primary/10 text-primary border border-primary/20"
                      }`}>
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
