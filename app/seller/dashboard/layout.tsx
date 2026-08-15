"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShieldCheck, Box, DollarSign, BarChart3, MessageSquare, Settings, ArrowLeft, Shield, Menu, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user: clerkUser } = useUser();
  const dbUser = useQuery(api.users.getCurrentUser, clerkUser ? {} : "skip");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const email = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase() || "";
  const isAdmin = email.includes("proximaxagency") || email === "proximaxagency@gmail.com" || dbUser?.role === "admin" || dbUser?.role === "super_admin";

  const links = [
    ...(isAdmin ? [{ href: "/admin", label: "Admin Operations", icon: Shield, badge: "STAFF" }] : []),
    { href: "/seller/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/seller/verification", label: "Identity Verification", icon: ShieldCheck, badge: "KYC" },
    { href: "/seller/inventory", label: "Inventory Vault", icon: Box },
    { href: "/seller/dashboard/orders", label: "My Orders", icon: DollarSign },
    { href: "/seller/earnings", label: "Earnings & Withdraw", icon: DollarSign },
    { href: "/seller/analytics", label: "Performance Analytics", icon: BarChart3 },
    { href: "/messages", label: "Buyer Messages", icon: MessageSquare },
    { href: "/account/settings", label: "Store Settings", icon: Settings },
  ];

  const NavLinks = () => (
    <nav className="flex flex-col gap-1.5" aria-label="Seller Center Navigation">
      {links.map((link) => {
        const active = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setSidebarOpen(false)}
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
  );

  return (
    <div className="bg-background min-h-[calc(100vh-76px)] py-6 lg:py-10">
      <div className="container flex flex-col md:flex-row gap-6 lg:gap-8">

        {/* Mobile hamburger bar */}
        <div className="flex md:hidden items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
          <div>
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
              Seller Hub
            </span>
            <p className="font-heading font-black text-sm text-text mt-1">Merchant Center</p>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-elevated border border-border text-text hover:bg-border transition-colors"
            aria-label="Open seller menu"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-[200] md:hidden flex" role="dialog" aria-modal="true" aria-label="Seller navigation">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            {/* Slide panel */}
            <div className="relative w-[280px] h-full bg-background border-r border-border flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
                <div>
                  <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                    Seller Hub
                  </span>
                  <p className="font-heading font-black text-lg text-text mt-1">Merchant Center</p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-center w-9 h-9 text-text-muted hover:text-text rounded-lg hover:bg-elevated transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <NavLinks />
              </div>
              <div className="p-4 border-t border-border">
                <Link href="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 text-text-muted hover:text-text text-sm font-semibold transition-colors">
                  <ArrowLeft size={16} />
                  Back to Marketplace
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Seller Navigation Sidebar — desktop */}
        <aside className="hidden md:block w-full md:w-[260px] lg:w-[280px] flex-shrink-0">
          <div className="bg-card border border-border rounded-2xl p-5 md:sticky md:top-[90px] shadow-sm">
            <div className="mb-6 pb-5 border-b border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                  Seller Hub
                </span>
                <p className="font-heading font-black text-xl text-text mt-2">Merchant Center</p>
              </div>
              <Link href="/" className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-elevated transition-colors" title="Back to Marketplace">
                <ArrowLeft size={18} />
              </Link>
            </div>
            <NavLinks />
          </div>
        </aside>

        {/* Main Seller Workspace */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
