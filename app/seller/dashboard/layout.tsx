"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShieldCheck, Box, DollarSign, BarChart3,
  MessageSquare, Settings, ArrowLeft, Shield, Menu, X, ChevronRight
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user: clerkUser } = useUser();
  const dbUser = useQuery(api.users.getCurrentUser, clerkUser ? {} : "skip");
  const [moreOpen, setMoreOpen] = useState(false);

  const email = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase() || "";
  const isAdmin =
    email.includes("proximaxagency") ||
    email === "proximaxagency@gmail.com" ||
    dbUser?.role === "admin" ||
    dbUser?.role === "super_admin";

  const allLinks = [
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: Shield, badge: "STAFF" }] : []),
    { href: "/seller/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/seller/verification", label: "KYC", icon: ShieldCheck, badge: "KYC" },
    { href: "/seller/inventory", label: "Inventory", icon: Box },
    { href: "/seller/dashboard/orders", label: "Orders", icon: DollarSign },
    { href: "/seller/earnings", label: "Earnings", icon: DollarSign },
    { href: "/seller/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/account/settings", label: "Settings", icon: Settings },
  ];

  // Bottom bar: show first 4 most important + "More" button
  const bottomLinks = [
    { href: "/seller/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/seller/dashboard/orders", label: "Orders", icon: DollarSign },
    { href: "/seller/earnings", label: "Earnings", icon: DollarSign },
    { href: "/seller/inventory", label: "Inventory", icon: Box },
    { href: "/messages", label: "Messages", icon: MessageSquare },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="bg-background min-h-[calc(100vh-76px)]">
      <div className="container flex flex-col md:flex-row gap-6 lg:gap-8 py-6 lg:py-10 pb-24 md:pb-10">

        {/* ── Desktop Sidebar (always visible md+) ── */}
        <aside className="hidden md:block w-full md:w-[240px] lg:w-[260px] flex-shrink-0">
          <div className="bg-card border border-border rounded-2xl p-5 md:sticky md:top-[90px] shadow-sm">
            <div className="mb-5 pb-4 border-b border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                  Seller Hub
                </span>
                <p className="font-heading font-black text-lg text-text mt-1.5">Merchant Center</p>
              </div>
              <Link
                href="/"
                className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-elevated transition-colors"
                title="Back to Marketplace"
              >
                <ArrowLeft size={16} />
              </Link>
            </div>

            <nav className="flex flex-col gap-1" aria-label="Seller navigation">
              {allLinks.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? "bg-primary text-white shadow-sm"
                        : "text-text-secondary hover:bg-elevated hover:text-text"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span
                        className={`text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded-full ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-primary/10 text-primary border border-primary/20"
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* ── Mobile: Always-Visible Bottom Tab Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-[150] md:hidden">
        {/* "More" slide-up drawer */}
        {moreOpen && (
          <div
            className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
        )}

        {moreOpen && (
          <div className="fixed bottom-[64px] left-0 right-0 z-[150] bg-card border-t border-border shadow-2xl rounded-t-2xl px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Seller Hub</p>
                <p className="font-heading font-black text-base text-text">All Sections</p>
              </div>
              <button
                onClick={() => setMoreOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-elevated transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="grid grid-cols-2 gap-2 pb-2">
              {allLinks.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? "bg-primary text-white"
                        : "bg-elevated text-text-secondary hover:text-text hover:bg-border"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="truncate">{link.label}</span>
                    {link.badge && (
                      <span
                        className={`ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                          active ? "bg-white/20 text-white" : "bg-primary/10 text-primary border border-primary/20"
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              <Link
                href="/"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold text-text-muted hover:text-text bg-elevated hover:bg-border transition-all"
              >
                <ArrowLeft size={16} />
                Back to Store
              </Link>
            </nav>
          </div>
        )}

        {/* Persistent bottom nav */}
        <nav
          className="flex items-center bg-card/95 backdrop-blur-md border-t border-border h-16 px-1"
          aria-label="Seller bottom navigation"
        >
          {bottomLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-2 relative"
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                    active ? "bg-primary text-white shadow-md" : "text-text-muted"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={`text-[10px] font-bold leading-none ${
                    active ? "text-primary" : "text-text-muted"
                  }`}
                >
                  {link.label}
                </span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-b-full" />
                )}
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2"
            aria-label="More navigation options"
            aria-expanded={moreOpen}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                moreOpen ? "bg-primary text-white" : "text-text-muted"
              }`}
            >
              {moreOpen ? <X size={18} /> : <Menu size={18} />}
            </div>
            <span className={`text-[10px] font-bold leading-none ${moreOpen ? "text-primary" : "text-text-muted"}`}>
              More
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
}
