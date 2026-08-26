"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search, Bell, ShoppingBag, Menu, X, User, Heart,
  MessageSquare, LayoutDashboard, Shield, Settings, LogOut,
  Package, Wallet, ChevronRight, Check
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { currency, toggle: toggleCurrency } = useCurrency();
  const pathname = usePathname();
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();

  const dbUser = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : "skip");
  const notifications = useQuery(api.notifications.getMyNotifications, isAuthenticated ? {} : "skip");
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const isAdmin = dbUser?.role === "admin" || dbUser?.role === "super_admin";
  const userRole = dbUser?.role || "buyer";

  const user = isAuthenticated && dbUser ? {
    name: dbUser.displayName || dbUser.username || dbUser.email?.split("@")[0] || "User",
    role: userRole,
    imageUrl: dbUser.avatarUrl,
  } : null;

  const isLoaded = !isLoading;


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      // Focus first focusable element in menu
      setTimeout(() => menuPanelRef.current?.querySelector<HTMLElement>("a, button")?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Keyboard: Escape closes menu/dropdown; "/" opens search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (menuOpen) { setMenuOpen(false); menuBtnRef.current?.focus(); }
        if (activeDropdown) setActiveDropdown(null);
      }
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        window.location.href = "/search";
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen, activeDropdown]);

  // Focus trap inside mobile menu
  const handleMenuKeydown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !menuPanelRef.current) return;
    const focusable = Array.from(
      menuPanelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, []);

  // Dropdown hover with delay to avoid flicker
  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown("user");
  };
  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  const isActive = (path: string) => {
    if (path === "/marketplace") return pathname === "/marketplace" || pathname.startsWith("/marketplace/") || pathname.startsWith("/games/");
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const mainLinks = [
    { label: "Marketplace", href: "/marketplace" },
    { label: "Sell", href: "/sell" },
    { label: "Guides", href: "/guides" },
    { label: "Support", href: "/support" },
  ];

  const userMenuLinks = [
    ...(user?.role === "admin" ? [
      { icon: Shield, label: "Admin Operations", href: "/admin" },
      { icon: LayoutDashboard, label: "Seller Panel", href: "/seller/dashboard" },
      { icon: MessageSquare, label: "Live Support Desk", href: "/admin/support" },
    ] : user?.role === "seller" ? [
      { icon: LayoutDashboard, label: "Seller Dashboard", href: "/seller/dashboard" },
    ] : []),
    { icon: Package, label: "My Orders", href: "/account/orders" },
    { icon: Heart, label: "Wishlist", href: "/account/wishlist" },
    { icon: MessageSquare, label: "Messages", href: "/messages" },
    { icon: Wallet, label: "Wallet", href: "/account/wallet" },
    { icon: Settings, label: "Settings", href: "/account/settings" },
  ];

  return (
    <header
      className={`sticky top-0 z-[100] w-full transition-all duration-200 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-[0_1px_0_rgba(255,255,255,0.06)]"
          : "bg-background border-b border-transparent"
      }`}
    >
      <div className="container h-16 flex items-center justify-between gap-4">

        {/* Mobile menu toggle */}
        <button
          ref={menuBtnRef}
          onClick={() => setMenuOpen(true)}
          className="lg:hidden flex items-center justify-center w-10 h-10 -ml-2 text-text-muted hover:text-text hover:bg-elevated rounded-lg transition-colors"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <Menu size={22} />
        </button>

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0 lg:mr-6">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center font-heading font-black text-white text-base tracking-tighter transition-opacity group-hover:opacity-90"
            style={{ background: "var(--gradient-brand)" }}
            aria-hidden="true"
          >
            IG
          </div>
          <span className="font-heading font-black text-[20px] tracking-wide text-text">
            IGMART
          </span>
        </Link>

        {/* Desktop Nav — centered absolutely */}
        <nav
          className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 h-full"
          aria-label="Main navigation"
        >
          {mainLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`relative h-full px-4 flex items-center text-[14px] font-semibold transition-colors duration-150 ${
                isActive(link.href)
                  ? "text-text"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-primary rounded-t-sm" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-1">
          {/* Currency Toggle */}
          <button
            onClick={toggleCurrency}
            aria-label="Toggle currency"
            title={currency === "USD" ? "Switch to INR" : "Switch to USD"}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-elevated hover:border-primary/40 hover:bg-elevated/80 transition-all text-xs font-bold text-text-muted hover:text-text"
          >
            <span className="text-[11px] font-black">
              {currency === "USD" ? "$" : "₹"}
            </span>
            <span>{currency}</span>
          </button>

          {/* Search */}
          <Link
            href="/search"
            aria-label="Search (press / to open)"
            className="flex items-center justify-center w-10 h-10 rounded-lg text-text-muted hover:text-text hover:bg-elevated transition-colors"
          >
            <Search size={19} />
          </Link>

          {user ? (
            <div className="flex items-center gap-1">
              {/* Notifications */}
              <div
                className="relative hidden sm:block"
                onMouseEnter={() => setActiveDropdown("notifications")}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  aria-label="View notifications"
                  aria-expanded={activeDropdown === "notifications"}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${activeDropdown === "notifications" ? "text-text bg-elevated" : "text-text-muted hover:text-text hover:bg-elevated"}`}
                >
                  <Bell size={19} />
                  {notifications && notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-danger rounded-full" aria-hidden="true" />
                  )}
                </button>

                {activeDropdown === "notifications" && (
                  <div
                    className="absolute top-[calc(100%+8px)] right-0 z-[200]"
                    onMouseEnter={() => setActiveDropdown("notifications")}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div className="bg-surface border border-border rounded-xl w-[320px] shadow-[var(--shadow-xl)] overflow-hidden flex flex-col">
                      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-background">
                        <p className="text-sm font-bold text-text">Notifications</p>
                        {notifications && notifications.some(n => !n.isRead) && (
                          <button 
                            onClick={() => markAllAsRead()}
                            className="text-[11px] font-semibold text-primary hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-[360px] overflow-y-auto">
                        {notifications === undefined ? (
                          <div className="p-8 text-center text-text-muted text-sm">Loading...</div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center text-text-muted text-sm">No notifications yet.</div>
                        ) : (
                          notifications.map((n) => (
                            <Link
                              key={n._id}
                              href={n.link || "#"}
                              onClick={(e) => {
                                if (!n.isRead) markAsRead({ notificationId: n._id });
                                setActiveDropdown(null);
                              }}
                              className={`block p-4 border-b border-border hover:bg-elevated/50 transition-colors ${!n.isRead ? "bg-primary/5" : ""}`}
                            >
                              <div className="flex gap-3">
                                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                                <div>
                                  <p className={`text-sm ${!n.isRead ? "font-bold text-text" : "font-medium text-text-secondary"}`}>{n.title}</p>
                                  <p className="text-xs text-text-muted mt-1 leading-relaxed">{n.body}</p>
                                  <p className="text-[10px] text-text-muted mt-2 font-medium">
                                    {new Date(n.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Orders */}
              <Link
                href="/account/orders"
                aria-label="My orders"
                className="hidden sm:flex items-center justify-center w-10 h-10 text-text-muted hover:text-text hover:bg-elevated rounded-lg transition-colors"
              >
                <ShoppingBag size={19} />
              </Link>

              {/* User Dropdown */}
              <div
                ref={dropdownRef}
                className="relative hidden lg:block ml-1"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  aria-label="Account menu"
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === "user"}
                  className="flex items-center gap-2 px-1 py-1 rounded-full border border-border hover:border-primary/40 transition-all bg-elevated cursor-pointer"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-heading font-black text-white text-xs"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                </button>

                {activeDropdown === "user" && (
                  <div
                    className="absolute top-[calc(100%+8px)] right-0 z-[200]"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div className="bg-surface border border-border rounded-xl p-1.5 w-[220px] shadow-[var(--shadow-xl)]">
                      {/* User info header */}
                      <div className="px-3 py-2.5 border-b border-border mb-1">
                        <p className="text-sm font-bold text-text truncate">{user.name}</p>
                        <p className="text-xs text-text-muted font-medium capitalize mt-0.5">{user.role}</p>
                      </div>
                      {userMenuLinks.map(({ icon: Icon, label, href }) => (
                        <Link
                          key={label}
                          href={href}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-text hover:bg-elevated transition-colors"
                        >
                          <Icon size={15} />
                          {label}
                        </Link>
                      ))}
                      <div className="border-t border-border mt-1 pt-1">
                        <button onClick={async () => { await signOut(); router.push("/"); }} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-danger hover:bg-danger/8 w-full transition-colors text-left">
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 ml-1">
              <Link href="/login" className="text-sm font-semibold text-text-secondary hover:text-text transition-colors px-3 py-2 rounded-lg hover:bg-elevated">
                Log In
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
                style={{ background: "var(--gradient-brand)" }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Menu Overlay ───────────────────────── */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-[300] lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          onKeyDown={handleMenuKeydown}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-over panel */}
          <div
            ref={menuPanelRef}
            className="relative w-[300px] h-full bg-background border-r border-border flex flex-col shadow-[var(--shadow-xl)]"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border flex-shrink-0">
              <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded flex items-center justify-center font-heading font-black text-white text-sm"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  IG
                </div>
                <span className="font-heading font-black text-lg text-text">IGMART</span>
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-9 h-9 text-text-muted hover:text-text rounded-lg hover:bg-elevated transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-5">

              {/* Search shortcut */}
              <Link
                href="/search"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-xl text-text-muted hover:text-text hover:border-primary/40 transition-colors"
              >
                <Search size={17} />
                <span className="font-medium text-sm">Search games, items...</span>
              </Link>

              {/* Main nav links */}
              <nav className="flex flex-col" aria-label="Mobile navigation">
                {mainLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between py-3 px-2 text-[15px] font-semibold border-b border-border/50 last:border-0 transition-colors ${
                      isActive(link.href) ? "text-text" : "text-text-secondary hover:text-text"
                    }`}
                  >
                    {link.label}
                    <ChevronRight size={15} className="text-text-muted" />
                  </Link>
                ))}
              </nav>

              {/* Currency Toggle — mobile */}
              <button
                onClick={toggleCurrency}
                className="flex items-center justify-between w-full py-3 px-2 border-b border-border/50 text-[15px] font-semibold text-text-secondary hover:text-text transition-colors"
              >
                <span>Currency: {currency}</span>
                <span className="text-sm font-black bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
                  {currency === "USD" ? "Switch to ₹ INR" : "Switch to $ USD"}
                </span>
              </button>

              {/* User section */}
              <div className="mt-auto pt-4 border-t border-border">
                {user ? (
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/account/orders"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-2 text-sm font-semibold text-text hover:bg-elevated rounded-lg transition-colors"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-heading font-black text-white text-xs flex-shrink-0"
                        style={{ background: "var(--gradient-brand)" }}
                      >
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate leading-tight">{user.name}</p>
                        <p className="text-xs text-text-muted font-medium mt-0.5">My Account</p>
                      </div>
                    </Link>
                    <Link
                      href="/messages"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 py-2.5 px-3 text-sm font-medium text-text-muted hover:text-text hover:bg-elevated rounded-lg transition-colors"
                    >
                      <MessageSquare size={17} /> Messages
                    </Link>
                    <Link
                      href="/account/wallet"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 py-2.5 px-3 text-sm font-medium text-text-muted hover:text-text hover:bg-elevated rounded-lg transition-colors"
                    >
                      <Wallet size={17} /> Wallet
                    </Link>
                    <button onClick={async () => { await signOut(); router.push("/"); setMenuOpen(false); }} className="flex w-full items-center gap-3 p-3 rounded-xl text-sm font-semibold text-danger hover:bg-danger/10 transition-colors text-left">
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 pb-4">
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center w-full py-3 rounded-xl border border-border font-semibold text-sm text-text hover:bg-elevated transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center w-full py-3 rounded-xl font-semibold text-sm text-white hover:opacity-90 transition-opacity"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
