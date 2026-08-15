"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Heart, Wallet, Settings, ShieldCheck, ChevronRight } from "lucide-react";

const navLinks = [
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/wallet", label: "Wallet", icon: Wallet },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-background min-h-[calc(100vh-64px)]">

      {/* Mobile tab bar — horizontal scroll */}
      <div className="md:hidden bg-surface border-b border-border sticky top-16 z-[50]">
        <div className="container">
          <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 flex-shrink-0 py-3.5 px-4 text-sm font-semibold border-b-2 transition-colors ${
                    active
                      ? "border-primary text-text"
                      : "border-transparent text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar */}
          <aside className="hidden md:block w-[240px] flex-shrink-0" aria-label="Account navigation">
            <div className="bg-card border border-border rounded-xl p-4 md:sticky md:top-[84px]">
              {/* User info */}
              <div className="flex items-center gap-3.5 mb-5 pb-5 border-b border-border">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-heading font-black text-lg text-white flex-shrink-0"
                  style={{ background: "var(--gradient-brand)" }}
                  aria-hidden="true"
                >
                  U
                </div>
                <div className="min-w-0">
                  <p className="font-heading font-bold text-sm text-text truncate">User Account</p>
                  <div className="flex items-center gap-1.5 text-success text-[11px] font-bold uppercase tracking-wider mt-0.5">
                    <ShieldCheck size={12} aria-hidden="true" />
                    Verified
                  </div>
                </div>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col gap-1" aria-label="Account sections">
                {navLinks.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        active
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-text-muted hover:bg-elevated hover:text-text"
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Page content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
