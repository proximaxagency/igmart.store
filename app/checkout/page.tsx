import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Lock, CreditCard, Wallet, Bitcoin } from "lucide-react";
import { LISTINGS } from "@/lib/data/igmartData";
import { Button, Alert } from "@/components/ui/index";

export const metadata: Metadata = {
  title: "Secure Checkout | IGMART",
};

export default function CheckoutPage() {
  const listing = LISTINGS[0];
  const fee = listing.price * 0.03;
  const total = listing.price + fee;

  return (
    <div className="bg-background min-h-screen pb-16">
      <div className="container py-8 sm:py-12 max-w-5xl">

        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--gradient-brand)" }}
            aria-hidden="true"
          >
            <Lock size={16} className="text-white" />
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-text">Secure Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ── Left: Forms ────────────────────────────── */}
          <div className="flex-1 flex flex-col gap-5">

            {/* Step 1: Delivery details */}
            <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
              <h2 className="font-heading font-bold text-[17px] text-text mb-5 flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-black flex-shrink-0" aria-hidden="true">1</span>
                Delivery Details
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="ingame-id" className="block text-sm font-semibold text-text-secondary mb-1.5">
                    In-Game Character Name / ID <span className="text-danger">*</span>
                  </label>
                  <input
                    id="ingame-id"
                    type="text"
                    placeholder="e.g. PlayerName#1234"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text text-sm font-medium focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-text-muted min-h-[48px]"
                  />
                  <p className="text-xs text-text-muted mt-1.5">Make sure this matches exactly to avoid delivery delays.</p>
                </div>
                <div>
                  <label htmlFor="order-notes" className="block text-sm font-semibold text-text-secondary mb-1.5">
                    Order Notes <span className="text-text-muted font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="order-notes"
                    rows={3}
                    placeholder="Any specific instructions for the seller..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text text-sm font-medium focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-text-muted resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment */}
            <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
              <h2 className="font-heading font-bold text-[17px] text-text mb-5 flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-black flex-shrink-0" aria-hidden="true">2</span>
                Payment Method
              </h2>

              <fieldset>
                <legend className="sr-only">Select payment method</legend>
                <div className="flex flex-col gap-3">
                  {/* Card */}
                  <label className="flex items-center gap-4 border-2 border-primary bg-primary/5 p-4 rounded-xl cursor-pointer">
                    <input type="radio" name="payment" defaultChecked className="w-4 h-4 accent-primary cursor-pointer" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-text">Credit or Debit Card</p>
                      <p className="text-xs text-text-muted">Processed securely by Stripe</p>
                    </div>
                    <CreditCard size={20} className="text-primary flex-shrink-0" aria-hidden="true" />
                  </label>

                  {/* Wallet */}
                  <label className="flex items-center gap-4 border-2 border-border bg-background p-4 rounded-xl cursor-pointer hover:border-primary/40 transition-colors">
                    <input type="radio" name="payment" className="w-4 h-4 accent-primary cursor-pointer" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-text">IGMART Wallet</p>
                      <p className="text-xs text-text-muted">
                        Available: <span className="text-success font-semibold">$50.00</span>
                      </p>
                    </div>
                    <Wallet size={20} className="text-text-muted flex-shrink-0" aria-hidden="true" />
                  </label>

                  {/* Crypto */}
                  <label className="flex items-center gap-4 border-2 border-border bg-background p-4 rounded-xl cursor-pointer hover:border-primary/40 transition-colors">
                    <input type="radio" name="payment" className="w-4 h-4 accent-primary cursor-pointer" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-text">Cryptocurrency</p>
                      <p className="text-xs text-text-muted">BTC, ETH, USDT, USDC</p>
                    </div>
                    <Bitcoin size={20} className="text-warning flex-shrink-0" aria-hidden="true" />
                  </label>
                </div>
              </fieldset>

              {/* Card fields */}
              <div className="mt-5 p-4 bg-background border border-border rounded-xl flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Card Number"
                  aria-label="Card number"
                  className="w-full bg-transparent border border-border rounded-lg px-4 py-3 text-text text-sm font-medium focus:outline-none focus:border-primary/60 min-h-[44px] placeholder:text-text-muted"
                />
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    aria-label="Expiry date"
                    className="flex-1 bg-transparent border border-border rounded-lg px-4 py-3 text-text text-sm font-medium focus:outline-none focus:border-primary/60 min-h-[44px] placeholder:text-text-muted"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    aria-label="Security code"
                    className="flex-1 bg-transparent border border-border rounded-lg px-4 py-3 text-text text-sm font-medium focus:outline-none focus:border-primary/60 min-h-[44px] placeholder:text-text-muted"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Order summary ───────────────────── */}
          <div className="w-full lg:w-[360px] flex-shrink-0">
            <div className="lg:sticky lg:top-[84px] bg-card border border-border rounded-xl p-5 sm:p-6">
              <h2 className="font-heading font-bold text-[17px] text-text mb-5">Order Summary</h2>

              {/* Listing */}
              <div className="flex gap-3.5 mb-5 pb-5 border-b border-border">
                <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-border">
                  <Image src={listing.image} alt={listing.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-sm font-semibold text-text leading-snug line-clamp-2">{listing.title}</p>
                  <p className="text-xs text-text-muted mt-1">
                    Seller:{" "}
                    <Link href={`/seller/${listing.seller}`} className="text-primary-hover hover:underline">
                      {listing.seller}
                    </Link>
                  </p>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="flex flex-col gap-3 pb-5 border-b border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Subtotal</span>
                  <span className="text-sm font-semibold text-text">${listing.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Buyer Fee (3%)</span>
                  <span className="text-sm font-semibold text-text">${fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Discount</span>
                  <span className="text-sm font-semibold text-success">-$0.00</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-5">
                <span className="text-base font-bold text-text">Total</span>
                <span className="font-heading font-black text-3xl text-text">${total.toFixed(2)}</span>
              </div>

              {/* Pay button */}
              <Button
                variant="gradient"
                size="lg"
                fullWidth
                icon={<Lock size={16} />}
              >
                Pay Securely
              </Button>

              <p className="text-center text-xs text-text-muted mt-3 leading-relaxed">
                By clicking "Pay Securely", you agree to our{" "}
                <Link href="/terms" className="text-primary-hover hover:underline">Terms of Service</Link>.
              </p>

              {/* Trust badge */}
              <Alert variant="success" icon={<ShieldCheck size={18} />} title="IGMART Trade Protection" className="mt-4">
                Your payment is held securely in escrow until you confirm delivery.
              </Alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
