"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const footerCols = [
  {
    heading: "IGMART",
    links: [
      { label: "About", href: "/about" },
      { label: "Games", href: "/games" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Guides", href: "/guides" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Marketplace",
    links: [
      { label: "Accounts", href: "/marketplace/accounts" },
      { label: "Items", href: "/marketplace/items" },
      { label: "Currency", href: "/marketplace/currency" },
      { label: "Boosting", href: "/marketplace/boosting" },
      { label: "Services", href: "/marketplace/services" },
      { label: "Game Keys", href: "/marketplace/game-keys" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", href: "/support" },
      { label: "Contact Support", href: "/support/contact" },
      { label: "Orders", href: "/account/orders" },
      { label: "Disputes", href: "/disputes" },
      { label: "Buyer Protection", href: "/buyer-protection" },
    ],
  },
  {
    heading: "Sell",
    links: [
      { label: "Start Selling", href: "/sell" },
      { label: "Seller Dashboard", href: "/seller/dashboard" },
      { label: "Seller Fees", href: "/fees" },
      { label: "Create Listing", href: "/sell/create" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookies", href: "/cookies" },
      { label: "Refund Policy", href: "/refund-policy" },
    ],
  },
];

const popularGames = [
  "Valorant", "Fortnite", "CS2", "Minecraft", "League of Legends",
  "GTA V", "Apex Legends", "World of Warcraft", "Roblox", "FC 25",
];

function FooterColumn({ heading, links, defaultOpen = false }: {
  heading: string;
  links: { label: string; href: string }[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      {/* Desktop heading */}
      <p className="hidden sm:block text-[11px] font-bold tracking-[0.1em] uppercase text-text-muted mb-3">
        {heading}
      </p>

      {/* Mobile accordion trigger */}
      <button
        className="sm:hidden w-full flex items-center justify-between py-3 text-sm font-semibold text-text-secondary border-b border-border"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {heading}
        <ChevronDown
          size={16}
          className={`text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Links */}
      <ul className={`flex flex-col gap-2 mt-3 ${open ? "block" : "hidden sm:flex"}`}>
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-[13px] font-medium text-text-muted hover:text-text-secondary transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border relative overflow-hidden">
      {/* Decorative top gradient line */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-px opacity-50"
        style={{ background: "linear-gradient(90deg, transparent, var(--color-primary), #06b6d4, var(--color-primary), transparent)" }}
      />

      <div className="container py-12 sm:py-14">
        {/* 5-column grid — desktop; accordion — mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-6 sm:gap-y-10">
          {footerCols.map((col, i) => (
            <FooterColumn key={col.heading} heading={col.heading} links={col.links} defaultOpen={i === 0} />
          ))}
        </div>

        {/* Popular games */}
        <div className="border-t border-border mt-10 pt-8">
          <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-text-muted mb-3">
            Popular Games
          </p>
          <div className="flex flex-wrap gap-2">
            {popularGames.map((game) => (
              <Link
                key={game}
                href={`/games/${game.toLowerCase().replace(/ /g, "-")}`}
                className="text-[12px] font-medium text-text-muted hover:text-primary-hover px-2.5 py-1 border border-border hover:border-primary/30 rounded-full transition-colors"
              >
                {game}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--gradient-brand)" }}
              aria-hidden="true"
            >
              <span className="text-[9px] text-white font-black">IG</span>
            </div>
            <p className="text-[12px] text-text-muted">
              © {new Date().getFullYear()} IGMART.STORE — All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/legal/do-not-sell"
              className="text-[12px] text-text-muted hover:text-text-secondary transition-colors underline underline-offset-3"
            >
              Do Not Sell My Personal Information
            </Link>
            <span className="text-[12px] text-text-muted">igmart.store</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
