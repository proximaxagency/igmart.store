"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "@convex-dev/auth/react";
import Link from "next/link";
import {
  Wallet, Activity, ArrowUpRight, ArrowDownRight, DollarSign,
  Send, Loader2, CheckCircle2, ShieldAlert, ShieldCheck, AlertCircle,
  Landmark, CreditCard, Coins, Sparkles, Info, Check
} from "lucide-react";
import { Button } from "@/components/ui/index";

type PayoutRail = "bank" | "paypal" | "crypto" | "upi";

export default function SellerEarningsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isLoaded = !isLoading;
  const dbUser = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : "skip");
  const kycStatus = useQuery(api.seller.getKYCStatus, isAuthenticated ? {} : "skip");
  const balances = useQuery(api.transactions.getMyBalances, isAuthenticated ? {} : "skip");
  const transactions = useQuery(api.transactions.getMyTransactions, isAuthenticated ? {} : "skip");
  const requestWithdrawal = useMutation(api.seller.requestWithdrawal);

  // KYC Verification check
  const email = dbUser?.email?.toLowerCase() || "";
  const isAdmin = email.includes("proximaxagency") || email === "proximaxagency@gmail.com" || dbUser?.role === "admin" || dbUser?.role === "super_admin";
  const isKycApproved = isAdmin || !!(dbUser?.isVerified || kycStatus?.status === "approved");

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PayoutRail>("bank");

  // Method-specific input states
  const [bankHolder, setBankHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankSwift, setBankSwift] = useState("");

  const [paypalEmail, setPaypalEmail] = useState("");
  const [cryptoAddress, setCryptoAddress] = useState("");

  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableBalance = balances?.walletBalance ?? 0;
  const pendingBalance = balances?.pendingBalance ?? 0;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0 || withdrawAmount > availableBalance) {
      setErrorMessage("Please enter a valid amount within your available balance.");
      return;
    }

    let backendMethod: "bank" | "payoneer" | "skrill" | "crypto" = "bank";
    let formattedDetails = "";

    if (method === "bank") {
      if (!bankHolder.trim() || !bankAccount.trim() || !bankName.trim()) {
        setErrorMessage("Please fill in all bank wire account details.");
        return;
      }
      backendMethod = "bank";
      formattedDetails = `[Bank Wire] Name: ${bankHolder.trim()} | Bank: ${bankName.trim()} | Acct/IBAN: ${bankAccount.trim()} | SWIFT/IFSC: ${bankSwift.trim() || "N/A"}`;
    } else if (method === "paypal") {
      if (!paypalEmail.trim() || !paypalEmail.includes("@")) {
        setErrorMessage("Please provide a valid PayPal email address.");
        return;
      }
      backendMethod = "payoneer";
      formattedDetails = `[PayPal] Email: ${paypalEmail.trim()}`;
    } else if (method === "crypto") {
      if (!cryptoAddress.trim() || !cryptoAddress.startsWith("0x")) {
        setErrorMessage("Please provide a valid BEP-20 (BNB Smart Chain) address starting with 0x.");
        return;
      }
      backendMethod = "crypto";
      formattedDetails = `[USDT BEP20] Address: ${cryptoAddress.trim()} (BNB Smart Chain)`;
    } else if (method === "upi") {
      if (!upiId.trim() || !upiId.includes("@")) {
        setErrorMessage("Please provide a valid UPI ID (e.g. mobile@upi or username@bank).");
        return;
      }
      backendMethod = "bank";
      formattedDetails = `[UPI] VPA: ${upiId.trim()} | Name: ${upiName.trim() || dbUser?.displayName || "Merchant"}`;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await requestWithdrawal({
        amount: withdrawAmount,
        method: backendMethod,
        payoutDetails: formattedDetails,
      });

      setAmount("");
      setBankHolder("");
      setBankName("");
      setBankAccount("");
      setBankSwift("");
      setPaypalEmail("");
      setCryptoAddress("");
      setUpiId("");
      setUpiName("");
      setSuccessMessage(true);
    } catch (err: any) {
      console.error("Failed to request withdrawal:", err);
      setErrorMessage(err.message || "Failed to process withdrawal request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-text flex items-center gap-2.5">
          <DollarSign className="text-primary" size={28} /> Seller Earnings & Settlement Station
        </h1>
        <p className="text-text-muted text-xs sm:text-sm mt-1">
          Manage your revenue ledger, escrow holds, and withdraw funds directly to your preferred payment rail.
        </p>
      </div>

      {/* ── Highlighted Payout Rail Options Banner ── */}
      <div className="bg-gradient-to-r from-primary/15 via-card to-accent-secondary/15 border border-primary/30 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="bg-primary/20 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles size={11} /> Official Merchant Payout Rails
          </span>
          <span className="text-xs text-text-muted">• Zero Processing Hidden Fees</span>
        </div>

        <h2 className="font-heading font-black text-lg sm:text-xl text-text">
          We Pay Out In: Bank Wire Transfer · PayPal · USDT (BEP20) · UPI
        </h2>
        <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
          Choose your preferred payout method below. Withdrawals are processed daily by our finance operations desk upon verification.
        </p>

        {/* 4 Cards Showcase */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
          <div className="bg-surface/90 border border-border rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Landmark size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-text">Bank Wire</p>
              <p className="text-[10px] text-text-muted">Direct SWIFT / ACH / Wire</p>
            </div>
          </div>

          <div className="bg-surface/90 border border-border rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-text">PayPal</p>
              <p className="text-[10px] text-text-muted">Instant Global USD Transfer</p>
            </div>
          </div>

          <div className="bg-surface/90 border border-border rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <Coins size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-text">USDT (BEP20)</p>
              <p className="text-[10px] text-text-muted">BNB Smart Chain (Low Gas)</p>
            </div>
          </div>

          <div className="bg-surface/90 border border-border rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Send size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-text">UPI</p>
              <p className="text-[10px] text-text-muted">Instant INR Direct Settlement</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Balance Cards ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-wider mb-2">
            <Wallet size={15} /> Available for Withdrawal
          </div>
          <p className="font-heading font-black text-3xl sm:text-4xl text-text">${availableBalance.toFixed(2)}</p>
          <p className="text-[11px] text-success mt-2 font-medium">Ready for immediate transfer</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-wider mb-2">
            <Activity size={15} /> Escrow Pending Balance
          </div>
          <p className="font-heading font-black text-3xl sm:text-4xl text-text-muted">${pendingBalance.toFixed(2)}</p>
          <p className="text-[11px] text-text-muted mt-2">Funds held safely in escrow during buyer warranty window</p>
        </div>
      </div>

      {/* ── Main Form & History Grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Request Payout Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="font-heading font-bold text-base text-text flex items-center gap-2">
            <Send className="text-primary" size={16} /> Initiate Payout Request
          </h2>

          {!isKycApproved ? (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-4 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  <ShieldAlert className="text-amber-400" size={18} />
                  KYC Verification Required
                </div>
                <p className="text-text-muted leading-relaxed">
                  First-time seller withdrawals require an approved identity verification (KYC) to prevent unauthorized routing and comply with payout security guidelines.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-amber-500/20 text-[11px]">
                  <span className="text-text-muted">Verification Status:</span>
                  <span className="font-bold uppercase text-amber-400">
                    {kycStatus?.status ? kycStatus.status.replace("_", " ") : "Not Submitted"}
                  </span>
                </div>
              </div>

              <Link
                href="/seller/verification"
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-xs py-3 px-4 rounded-xl transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
              >
                <ShieldCheck size={16} />
                {kycStatus?.status === "pending" ? "Check KYC Submission" : "Complete KYC Identity Verification"}
              </Link>
            </div>
          ) : (
            <>
              {successMessage && (
                <div className="bg-success/15 border border-success/30 text-success p-3.5 rounded-xl text-xs flex items-center gap-2.5 font-bold">
                  <CheckCircle2 size={16} /> Withdrawal request submitted to Finance settlement queue!
                </div>
              )}

              {errorMessage && (
                <div className="bg-rose-500/15 border border-rose-500/30 text-rose-400 p-3.5 rounded-xl text-xs flex items-center gap-2.5 font-bold">
                  <AlertCircle size={16} /> {errorMessage}
                </div>
              )}

              <form onSubmit={handleWithdraw} className="space-y-4">
                {/* Amount */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      Withdrawal Amount ($USD)
                    </label>
                    <button
                      type="button"
                      onClick={() => setAmount(availableBalance.toString())}
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      MAX (${availableBalance.toFixed(2)})
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="1"
                      max={availableBalance}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100.00"
                      className="w-full bg-surface border border-border rounded-xl pl-8 pr-4 py-2.5 text-xs text-text outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>

                {/* Method Selector Tabs */}
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Choose Payout Rail
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "bank", label: "Bank Wire", icon: Landmark },
                      { id: "paypal", label: "PayPal", icon: CreditCard },
                      { id: "crypto", label: "USDT (BEP20)", icon: Coins },
                      { id: "upi", label: "UPI (INR)", icon: Send },
                    ].map((m) => {
                      const Icon = m.icon;
                      const isSelected = method === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMethod(m.id as PayoutRail)}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                            isSelected
                              ? "border-primary bg-primary/15 text-primary shadow-sm"
                              : "border-border bg-surface text-text-muted hover:border-primary/40"
                          }`}
                        >
                          <Icon size={14} />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Destination Fields */}
                <div className="space-y-3 pt-1">
                  {method === "bank" && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted mb-1">Account Holder Full Name</label>
                        <input
                          type="text"
                          required
                          value={bankHolder}
                          onChange={(e) => setBankHolder(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted mb-1">Bank Name</label>
                        <input
                          type="text"
                          required
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. Chase / HDFC / Barclays"
                          className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted mb-1">Account Number / IBAN</label>
                        <input
                          type="text"
                          required
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          placeholder="IBAN or Account Number"
                          className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text font-mono outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted mb-1">SWIFT / BIC / IFSC Code</label>
                        <input
                          type="text"
                          required
                          value={bankSwift}
                          onChange={(e) => setBankSwift(e.target.value)}
                          placeholder="SWIFT or IFSC routing code"
                          className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text font-mono outline-none focus:border-primary"
                        />
                      </div>
                    </>
                  )}

                  {method === "paypal" && (
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted mb-1">PayPal Account Email</label>
                      <input
                        type="email"
                        required
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text outline-none focus:border-primary"
                      />
                      <p className="text-[10px] text-text-muted mt-1">
                        Funds will be deposited into your verified PayPal account in USD.
                      </p>
                    </div>
                  )}

                  {method === "crypto" && (
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted mb-1">
                        USDT BEP-20 Wallet Address (BNB Smart Chain)
                      </label>
                      <input
                        type="text"
                        required
                        value={cryptoAddress}
                        onChange={(e) => setCryptoAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text font-mono outline-none focus:border-primary"
                      />
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] mt-2 flex items-start gap-1.5">
                        <Info size={13} className="shrink-0 mt-0.5" />
                        <span>Ensure your address is on the <strong>BNB Smart Chain (BEP20)</strong>. Transfers sent to TRC20 or ERC20 addresses will be rejected.</span>
                      </div>
                    </div>
                  )}

                  {method === "upi" && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted mb-1">UPI ID / VPA</label>
                        <input
                          type="text"
                          required
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. mobile@upi or username@okhdfcbank"
                          className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text font-mono outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted mb-1">Registered Account Holder Name</label>
                        <input
                          type="text"
                          value={upiName}
                          onChange={(e) => setUpiName(e.target.value)}
                          placeholder="Account holder name as on UPI"
                          className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text outline-none focus:border-primary"
                        />
                      </div>
                      <p className="text-[10px] text-text-muted">
                        Settled instantly in Indian Rupees (INR) at current spot exchange rates.
                      </p>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !amount || parseFloat(amount) > availableBalance || parseFloat(amount) <= 0}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-xs py-3 px-4 rounded-xl disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2 shadow-md shadow-primary/20 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Submit Payout Request
                </button>
              </form>
            </>
          )}
        </div>

        {/* Financial Ledger History */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border bg-surface flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-text">Financial Ledger History</h2>
            <span className="text-xs text-text-muted font-mono">{transactions?.length || 0} Transactions</span>
          </div>

          {transactions === undefined ? (
            <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : transactions.length > 0 ? (
            <div className="divide-y divide-border">
              {transactions.map((tx) => {
                const isPositive = tx.amount > 0;
                return (
                  <div key={tx._id} className="p-4 flex items-center justify-between hover:bg-elevated/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isPositive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                      }`}>
                        {isPositive ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text">{tx.description}</p>
                        <p className="text-[10px] text-text-muted">{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-mono font-bold ${isPositive ? "text-success" : "text-text"}`}>
                      {isPositive ? "+" : ""}${tx.amount.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-text-muted text-xs">No payout transactions recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
