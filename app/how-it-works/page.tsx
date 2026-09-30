"use client";

import Link from "next/link";
import { ShieldCheck, Zap, DollarSign, MessageSquare, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/index";

export default function HowItWorksPage() {
  return (
    <div className="bg-background min-h-[calc(100vh-76px)] py-16">
      <div className="container max-w-4xl space-y-16">
        {/* Hero */}
        <div className="text-center space-y-4">
          <SectionHeading 
            eyebrow="Safe & Transparent" 
            title="How IGMART Protects Every Transaction" 
            center 
          />
          <p className="text-text-muted text-base max-w-2xl mx-auto">
            Our escrow system guarantees that buyers receive exactly what they paid for, and sellers get guaranteed payouts.
          </p>
        </div>

        {/* Buyers Flow */}
        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <h2 className="font-heading font-black text-2xl text-text flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</span>
            For Buyers
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-text text-base">Browse & Purchase</h3>
              <p className="text-xs text-text-muted leading-relaxed">Choose from verified accounts, items, or services. Payment is securely held in IGMART Escrow.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-text text-base">Receive Delivery</h3>
              <p className="text-xs text-text-muted leading-relaxed">Get instant automatic credentials or communicate with the seller directly in live chat.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-text text-base">Confirm & Release</h3>
              <p className="text-xs text-text-muted leading-relaxed">Inspect your order. Once satisfied, confirm delivery to release funds to the seller.</p>
            </div>
          </div>
        </div>

        {/* Sellers Flow */}
        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <h2 className="font-heading font-bold text-2xl text-text flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center text-sm font-bold">2</span>
            For Sellers
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-text text-base">List Assets</h3>
              <p className="text-xs text-text-muted leading-relaxed">Create detailed listings with instant auto-delivery or manual transfer options in under 2 minutes.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-text text-base">Fulfill Orders</h3>
              <p className="text-xs text-text-muted leading-relaxed">When an order is placed, buyer funds are guaranteed. Deliver the account or service promptly.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-text text-base">Instant Payouts</h3>
              <p className="text-xs text-text-muted leading-relaxed">Withdraw your earnings directly to your bank account, PayPal, or Crypto wallet.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary/20 via-card to-primary/10 border border-primary/30 rounded-2xl p-8 text-center space-y-4">
          <h3 className="font-heading font-black text-2xl text-text">Ready to get started?</h3>
          <div className="flex justify-center gap-4 pt-2">
            <Link href="/marketplace" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-hover transition-colors text-sm">
              Explore Marketplace
            </Link>
            <Link href="/sell/create" className="bg-surface border border-border text-text font-bold px-6 py-3 rounded-xl hover:bg-elevated transition-colors text-sm">
              Create a Listing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
