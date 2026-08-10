"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Users, Database, AlertTriangle, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: Shield },
    { href: "/admin/users", label: "Users & Sellers", icon: Users },
    { href: "/admin/listings", label: "Listings", icon: Database },
    { href: "/admin/disputes", label: "Disputes", icon: AlertTriangle },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="bg-background min-h-[calc(100vh-76px)] py-8 lg:py-12">
      <div className="container flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-[280px] flex-shrink-0">
          <div className="bg-card border border-border rounded-2xl p-5 md:sticky md:top-[100px]">
            <div className="mb-6 pb-6 border-b border-border">
              <p className="text-[10px] text-danger font-bold uppercase tracking-wider mb-1">Admin Panel</p>
              <p className="font-heading font-black text-xl text-text">IGMART Core</p>
            </div>
            
            <nav className="flex flex-col gap-2">
              {links.map((link) => {
                const active = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      active ? "bg-danger text-white shadow-md shadow-danger/20" : "text-text-muted hover:bg-elevated hover:text-text"
                    }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
