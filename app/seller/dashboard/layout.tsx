"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShieldCheck, Box, DollarSign, BarChart3, MessageSquare, Settings, ArrowLeft } from "lucide-react";

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/seller/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/seller/verification", label: "Identity Verification", icon: ShieldCheck, badge: "KYC" },
    { href: "/seller/inventory", label: "Inventory Vault", icon: Box },
    { href: "/seller/dashboard/orders", label: "My Orders", icon: DollarSign },
    { href: "/seller/earnings", label: "Earnings & Withdraw", icon: DollarSign },
    { href: "/seller/analytics", label: "Performance Analytics", icon: BarChart3 },
    { href: "/messages", label: "Buyer Messages", icon: MessageSquare },
    { href: "/account/settings", label: "Store Settings", icon: Settings },
  ];

  return (
    <div className="bg-background min-h-[calc(100vh-76px)] py-6 lg:py-10">
      <div className="container flex flex-col md:flex-row gap-6 lg:gap-8">
        {/* Seller Navigation Sidebar */}
        <aside className="w-full md:w-[260px] lg:w-[280px] flex-shrink-0">
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

            <nav className="flex flex-col gap-1.5" aria-label="Seller Center Navigation">
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

        {/* Main Seller Workspace */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
