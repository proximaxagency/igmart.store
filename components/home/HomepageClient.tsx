"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

interface Props {
  action: "search" | "faq" | "sellcta";
  faqItems?: { q: string; a: string }[];
}

export default function HomepageClient({ action, faqItems }: Props) {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ── Hero search bar ──────────────────────────────
  if (action === "search") {
    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchVal.trim()) router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`);
    };

    return (
      <form onSubmit={handleSearch} className="flex justify-center w-full">
        <div className="flex items-center bg-elevated border border-border rounded-xl px-4 gap-3 w-full max-w-[560px] focus-within:border-primary/50 transition-colors shadow-[var(--shadow-md)]">
          <Search size={17} className="text-text-muted flex-shrink-0" aria-hidden="true" />
          <input
            id="hero-search"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search games, accounts, items..."
            aria-label="Search marketplace"
            className="flex-1 bg-transparent border-none outline-none text-text placeholder:text-text-muted text-[15px] py-3.5 min-w-0"
          />
          <button
            type="submit"
            id="hero-search-btn"
            className="flex-shrink-0 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            style={{ background: "var(--gradient-brand)" }}
          >
            Search
          </button>
        </div>
      </form>
    );
  }

  // ── FAQ accordion ────────────────────────────────
  if (action === "faq" && faqItems) {
    return (
      <div className="flex flex-col gap-2" role="list">
        {faqItems.map((item, i) => {
          const isOpen = openFaq === i;
          return (
            <div
              key={i}
              className="bg-card border border-border rounded-xl overflow-hidden"
              role="listitem"
            >
              <button
                id={`faq-btn-${i}`}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                onClick={() => setOpenFaq(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-3 bg-transparent border-none cursor-pointer hover:bg-elevated/50 transition-colors"
              >
                <span className="text-sm font-semibold text-text">{item.q}</span>
                {isOpen
                  ? <ChevronUp size={15} className="text-text-muted flex-shrink-0 transition-transform" />
                  : <ChevronDown size={15} className="text-text-muted flex-shrink-0 transition-transform" />
                }
              </button>
              {isOpen && (
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-btn-${i}`}
                  className="px-5 pb-5 text-sm text-text-muted leading-relaxed border-t border-border pt-4"
                >
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── Sell CTA buttons ─────────────────────────────
  if (action === "sellcta") {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/sell"
          className="inline-flex items-center justify-center gap-2 font-semibold text-[15px] text-white px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity min-w-[180px]"
          style={{ background: "var(--gradient-brand)" }}
        >
          Start Selling Free
          <ArrowRight size={18} />
        </Link>
        <Link
          href="/how-it-works"
          className="inline-flex items-center justify-center gap-2 font-semibold text-[15px] text-text-secondary hover:text-text border border-border hover:border-border-strong bg-transparent hover:bg-elevated px-8 py-3.5 rounded-xl transition-all min-w-[180px]"
        >
          How It Works
        </Link>
      </div>
    );
  }

  return null;
}
