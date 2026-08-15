"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  DollarSign, ShieldCheck, TrendingUp, Zap, Sparkles, CheckCircle2, 
  HelpCircle, ArrowRight, Lock, Users, Award, ChevronDown
} from "lucide-react";
import { Badge } from "@/components/ui/index";
import { GAMES } from "@/lib/data/igmartData";

export default function SellOnboardingPage() {
  const [calcPrice, setCalcPrice] = useState(150);
  const feeRate = 0.05; // 5%
  const feeAmount = calcPrice * feeRate;
  const sellerProfit = calcPrice - feeAmount;

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does the seller protection escrow work?",
      a: "When a buyer places an order, their payment is instantly locked in IGMART Escrow. You are notified to safely deliver the account login or in-game item through our encrypted chatbox. Once the buyer confirms or the auto-timer expires, funds clear directly to your wallet for withdrawal."
    },
    {
      q: "What are the seller fees?",
      a: "IGMART charges an industry-low flat 5% fee on completed sales. Listing your items is 100% free with unlimited listings."
    },
    {
      q: "How do I withdraw my earnings?",
      a: "You can withdraw your available balance instantly via Bank Transfer, Crypto (USDT, BTC, ETH), PayPal, Skrill, or Payoneer. Verified sellers enjoy instant 15-minute processing."
    },
    {
      q: "What games can I sell on IGMART?",
      a: "You can sell accounts, currency, boosting, and items across all Supercell games (Clash of Clans, Clash Royale, Brawl Stars, Squad Busters, Hay Day, Boom Beach) as well as Free Fire, BGMI, PUBG Global, Roblox, and more."
    },
    {
      q: "How do I deliver digital accounts automatically?",
      a: "Use our Inventory Vault feature to pre-deposit account credentials. When a buyer checks out, our system delivers the credentials immediately without you having to be online."
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      
      {/* ─── HERO SECTION ─── */}
      <div className="relative overflow-hidden py-16 sm:py-24 border-b border-border bg-gradient-to-b from-card/80 via-background to-background">
        <div className="container max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary-hover px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles size={14} /> Official Merchant Gateway
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-text leading-tight sm:leading-none mb-6">
            Turn Your Gaming Assets Into <span className="bg-gradient-to-r from-primary to-accent-secondary bg-clip-text text-transparent">Real Income</span>
          </h1>
          <p className="text-text-muted text-sm sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Sell accounts, in-game currency, and boosting services to over 3 million verified gamers. Enjoy 100% escrow protection, automated delivery, and instant withdrawals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/seller/dashboard"
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent-secondary text-white font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-xl hover:opacity-95 shadow-xl shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Open Seller Dashboard <ArrowRight size={16} />
            </Link>
            <Link
              href="/sell/create"
              className="w-full sm:w-auto bg-card hover:bg-elevated border border-border text-text font-bold text-sm sm:text-base px-7 py-3.5 rounded-xl transition-colors cursor-pointer"
            >
              List an Item Now
            </Link>
          </div>

          {/* Mini Stat Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-12 max-w-3xl mx-auto text-left">
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider block">Industry Low Fee</span>
              <p className="font-heading font-black text-xl text-success mt-1">5% Flat</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider block">Escrow Protected</span>
              <p className="font-heading font-black text-xl text-primary mt-1">100% Guaranteed</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider block">Payout Speed</span>
              <p className="font-heading font-black text-xl text-warning mt-1">&lt; 15 Mins</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider block">Active Buyers</span>
              <p className="font-heading font-black text-xl text-purple-400 mt-1">3M+ Gamers</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── INTERACTIVE PROFIT CALCULATOR ─── */}
      <div className="container py-16 sm:py-20 max-w-4xl">
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-text">
              Seller Fee & Profit Calculator
            </h2>
            <p className="text-text-muted text-xs sm:text-sm mt-2">
              See exactly how much cash lands directly in your pocket after our low 5% platform fee.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 items-center bg-surface/50 border border-border rounded-2xl p-6 sm:p-8">
            <div className="space-y-4">
              <label className="block text-xs font-bold text-text uppercase tracking-wider">
                Listing Price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-text-muted text-lg">$</span>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={calcPrice}
                  onChange={(e) => setCalcPrice(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-3 text-lg font-black text-text outline-none focus:border-primary"
                />
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="5"
                value={calcPrice}
                onChange={(e) => setCalcPrice(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-text-muted font-bold">
                <span>$10</span>
                <span>$500</span>
                <span>$1,000+</span>
              </div>
            </div>

            <div className="space-y-3 bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted font-medium">Buyer Pays:</span>
                <span className="font-bold text-text">${calcPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-3 border-b border-border">
                <span className="text-text-muted font-medium">IGMART Platform Fee (5%):</span>
                <span className="font-bold text-text-muted">-${feeAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <div>
                  <span className="text-xs font-bold text-text block">Your Net Earnings:</span>
                  <span className="text-[10px] text-success font-semibold">Available for instant payout</span>
                </div>
                <span className="font-heading font-black text-2xl sm:text-3xl text-success">
                  ${sellerProfit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── POPULAR GAMES TO SELL ─── */}
      <div className="container py-12 max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-text">
            High-Demand Games on IGMART
          </h2>
          <p className="text-text-muted text-xs sm:text-sm mt-2">
            Thousands of buyers actively searching for accounts, coins, and items right now.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {GAMES.slice(0, 10).map((g) => (
            <Link
              key={g.id}
              href={`/sell/create?game=${g.slug}`}
              className="bg-card border border-border hover:border-primary/50 rounded-2xl p-4 text-center transition-all duration-200 hover:-translate-y-1 group shadow-sm flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center font-black text-primary text-sm mb-3 group-hover:scale-105 transition-transform">
                {g.name.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-heading font-bold text-xs sm:text-sm text-text group-hover:text-primary transition-colors line-clamp-1">
                {g.name}
              </h3>
              <span className="text-[10px] text-text-muted mt-1">{g.listings} active listings</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── HOW IT WORKS (3 STEPS) ─── */}
      <div className="bg-card/40 border-y border-border py-16 sm:py-20">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-text">
              How Selling Works
            </h2>
            <p className="text-text-muted text-xs sm:text-sm mt-2">Simple 3-step trade cycle protected by escrow</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 relative shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-black text-base flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-heading font-bold text-base text-text mb-2">Create Your Listing</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Add title, description, price, and screenshots. Optionally pre-deposit logins in the Inventory Vault for 100% automated delivery.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 relative shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-black text-base flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-heading font-bold text-base text-text mb-2">Buyer Deposits Escrow</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                When a buyer purchases, their funds are locked safely in escrow. Deliver credentials via our encrypted 3-way chatbox.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 relative shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-black text-base flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-heading font-bold text-base text-text mb-2">Instant Cash Out</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Buyer confirms delivery and funds automatically clear to your balance. Withdraw instantly to Bank, Crypto, PayPal, or Skrill.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SELLER FAQS ─── */}
      <div className="container py-16 sm:py-20 max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-text">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm text-text hover:bg-elevated/40 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-text-muted shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-text-muted leading-relaxed border-t border-border/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── BOTTOM CTA ─── */}
      <div className="border-t border-border bg-gradient-to-r from-primary/15 via-accent-secondary/15 to-primary/15 py-14 text-center">
        <div className="container max-w-2xl">
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-text mb-3">
            Ready to Start Selling?
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mb-6">
            Join thousands of gamers earning on IGMART today. No upfront costs or hidden fees.
          </p>
          <Link
            href="/seller/dashboard"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent-secondary text-white font-extrabold text-sm px-8 py-3.5 rounded-xl hover:opacity-95 shadow-xl shadow-primary/25 transition-all cursor-pointer"
          >
            Launch Seller Center <ArrowRight size={16} />
          </Link>
        </div>
      </div>

    </div>
  );
}
