"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, Lock, Wallet, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button, Alert } from "@/components/ui/index";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState, Suspense } from "react";
import { Id } from "@/convex/_generated/dataModel";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get("listing");
  const { user, isLoaded } = useUser();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const listing = useQuery(
    api.listings.getListingById,
    listingId ? { listingId: listingId as Id<"listings"> } : "skip"
  );
  const balances = useQuery(api.transactions.getMyBalances, isLoaded && user ? {} : "skip");
  const createOrder = useMutation(api.orders.createOrder);

  if (!isLoaded || listing === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!listingId || listing === null) {
    return (
      <div className="container py-16 text-center">
        <AlertTriangle size={48} className="text-warning mx-auto mb-4" />
        <h1 className="font-heading font-black text-2xl text-text mb-2">Listing Not Found</h1>
        <p className="text-text-muted mb-6">This listing may have been removed or is no longer available.</p>
        <Link href="/marketplace" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-16 text-center max-w-lg mx-auto">
        <Lock size={48} className="text-primary mx-auto mb-4" />
        <h1 className="font-heading font-black text-2xl text-text mb-2">Sign In to Continue</h1>
        <p className="text-text-muted mb-6">You need to be signed in to complete your purchase.</p>
        <Link href="/login" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl">
          Sign In
        </Link>
      </div>
    );
  }

  const fee = Math.round(listing.price * 0.03 * 100) / 100;
  const total = Math.round((listing.price + fee) * 100) / 100;
  const walletBalance = balances?.walletBalance ?? 0;
  const hasSufficientFunds = walletBalance >= total;

  const handlePurchase = async () => {
    if (!hasSufficientFunds) {
      setError(`Insufficient wallet balance. You need $${total.toFixed(2)} but have $${walletBalance.toFixed(2)}.`);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const orderId = await createOrder({ listingId: listingId as Id<"listings"> });
      setSuccess(`Order #${(orderId as string).slice(-6).toUpperCase()} placed successfully!`);
      setTimeout(() => router.push(`/account/orders`), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container py-16 text-center max-w-lg mx-auto">
        <div className="bg-card border border-border rounded-2xl p-10">
          <CheckCircle2 size={56} className="text-success mx-auto mb-4" />
          <h1 className="font-heading font-black text-2xl text-text mb-2">Order Placed!</h1>
          <p className="text-text-muted mb-6">{success}</p>
          <p className="text-sm text-text-muted">Redirecting to your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-16">
      <div className="container py-8 sm:py-12 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--gradient-brand)" }}>
            <Lock size={16} className="text-white" />
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-text">Secure Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left: wallet info */}
          <div className="flex-1 flex flex-col gap-5">
            {/* Wallet balance */}
            <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
              <h2 className="font-heading font-bold text-[17px] text-text mb-4 flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-black flex-shrink-0">1</span>
                Payment — IGMART Wallet
              </h2>
              <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <Wallet size={20} className={`${hasSufficientFunds ? "text-success" : "text-danger"}`} />
                  <div>
                    <p className="font-bold text-sm text-text">Available Balance</p>
                    <p className={`text-xl font-black ${hasSufficientFunds ? "text-success" : "text-danger"}`}>
                      ${walletBalance.toFixed(2)}
                    </p>
                  </div>
                </div>
                {!hasSufficientFunds && (
                  <Link href="/account/wallet" className="text-xs font-bold text-primary border border-primary/30 hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors">
                    Add Funds
                  </Link>
                )}
              </div>
              {!hasSufficientFunds && (
                <Alert variant="warning" icon={<AlertTriangle size={16} />} title="Insufficient Balance" className="mt-4">
                  You need ${(total - walletBalance).toFixed(2)} more to complete this purchase. Add funds to your wallet first.
                </Alert>
              )}
            </div>

            {/* Escrow info */}
            <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
              <h2 className="font-heading font-bold text-[17px] text-text mb-4 flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-black flex-shrink-0">2</span>
                Escrow Protection
              </h2>
              <div className="flex flex-col gap-3">
                {[
                  { icon: "🔒", text: "Your payment is held securely in escrow until you confirm delivery" },
                  { icon: "✅", text: "Release payment only when you receive exactly what was promised" },
                  { icon: "🛡️", text: "Open a dispute if there's any issue — we arbitrate fairly" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-surface rounded-xl border border-border">
                    <span className="text-lg">{item.icon}</span>
                    <p className="text-sm text-text-secondary leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: order summary */}
          <div className="w-full lg:w-[360px] flex-shrink-0">
            <div className="lg:sticky lg:top-[84px] bg-card border border-border rounded-xl p-5 sm:p-6">
              <h2 className="font-heading font-bold text-[17px] text-text mb-5">Order Summary</h2>

              {/* Listing info */}
              <div className="flex gap-3.5 mb-5 pb-5 border-b border-border">
                <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-border bg-surface flex items-center justify-center">
                  {listing.images?.[0] ? (
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🎮</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-sm font-semibold text-text leading-snug line-clamp-2">{listing.title}</p>
                  <p className="text-xs text-text-muted mt-1">
                    Seller: <span className="text-primary-hover">{listing.sellerName}</span>
                    {listing.sellerIsVerified && <span className="ml-1 text-success">✓</span>}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {listing.gameName} · {listing.deliveryTime}
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
                  <span className="text-sm text-text-secondary">Buyer Protection Fee (3%)</span>
                  <span className="text-sm font-semibold text-text">${fee.toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-5">
                <span className="text-base font-bold text-text">Total</span>
                <span className="font-heading font-black text-3xl text-text">${total.toFixed(2)}</span>
              </div>

              {error && (
                <Alert variant="danger" icon={<AlertTriangle size={16} />} title="Error" className="mb-4">
                  {error}
                </Alert>
              )}

              <button
                onClick={handlePurchase}
                disabled={loading || !hasSufficientFunds}
                className={`w-full flex items-center justify-center gap-2 font-bold px-6 py-3.5 rounded-xl transition-all text-white ${
                  hasSufficientFunds && !loading
                    ? "bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 shadow-lg shadow-primary/25 cursor-pointer"
                    : "bg-elevated text-text-muted cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing...</>
                ) : (
                  <><Lock size={16} /> Pay ${total.toFixed(2)} Securely</>
                )}
              </button>

              <p className="text-center text-xs text-text-muted mt-3 leading-relaxed">
                By clicking Pay, you agree to our{" "}
                <Link href="/legal/terms" className="text-primary-hover hover:underline">Terms of Service</Link>.
              </p>

              <Alert variant="success" icon={<ShieldCheck size={18} />} title="IGMART Trade Protection" className="mt-4">
                Payment is held in escrow. Release only when you've received your item.
              </Alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
