"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { SectionHeading } from "@/components/ui/index";

export default function WishlistPage() {
  return (
    <div className="container py-12 max-w-4xl min-h-[calc(100vh-76px)]">
      <SectionHeading eyebrow="Saved Items" title="My Wishlist" />

      <div className="bg-card border border-border rounded-2xl p-12 text-center mt-6 space-y-4">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
          <Heart size={32} />
        </div>
        <h2 className="font-heading font-bold text-xl text-text">Your Wishlist is Empty</h2>
        <p className="text-text-muted text-sm max-w-md mx-auto">
          Browse the marketplace and click the heart icon on any listing to save your favorite accounts, items, and services here!
        </p>
        <Link 
          href="/marketplace" 
          className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-hover transition-colors text-sm"
        >
          <ShoppingCart size={16} /> Explore Marketplace
        </Link>
      </div>
    </div>
  );
}
