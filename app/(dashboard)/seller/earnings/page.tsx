"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "@convex-dev/auth/react";
import Link from "next/link";
import {
  Wallet, Activity, ArrowUpRight, ArrowDownRight, DollarSign,
  Send, Loader2, CheckCircle2, ShieldAlert, ShieldCheck, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/index";

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
  const [method, setMethod] = useState<"bank" | "payoneer" | "skrill" | "crypto">("bank");
  const [payoutDetails, setPayoutDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableBalance = balances?.walletBalance ?? 0;
  const pendingBalance = balances?.pendingBalance ?? 0;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0 || withdrawAmount > availableBalance || !payoutDetails) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await requestWithdrawal({
        amount: withdrawAmount,
        method,
        payoutDetails,
      });
      setAmount("");
      setPayoutDetails("");
      setSuccessMessage(true);
    } catch (err: any) {
      console.error("Failed to request withdrawal:", err);
      setErrorMessage(err.message || "Failed to process withdrawal request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl text-text flex items-center gap-2">
          <DollarSign className="text-primary" size={24} /> Seller Earnings & Withdrawal Station
        </h1>
        <p className="text-text-muted text-xs mt-0.5">Manage your revenue ledger, escrow holds, and initiate payout withdrawals</p>
      </div>

      {/* Balance Cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-wider mb-2">
            <Wallet size={15} /> Available for Withdrawal
          </div>
          <p className="font-heading font-black text-3xl sm:text-4xl text-text">${availableBalance.toFixed(2)}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-wider mb-2">
            <Activity size={15} /> Escrow Pending Balance
          </div>
          <p className="font-heading font-black text-3xl sm:text-4xl text-text-muted">${pendingBalance.toFixed(2)}</p>
          <p className="text-[11px] text-text-muted mt-2">Funds held safely in escrow during warranty window</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Request Payout Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-heading font-bold text-base text-text flex items-center gap-2 mb-4">
            <Send className="text-primary" size={16} /> Request Payout Withdrawal
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
                <div className="mb-4 bg-success/10 border border-success/20 text-success p-3 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} /> Withdrawal request submitted to Finance queue!
                </div>
              )}

              {errorMessage && (
                <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} /> {errorMessage}
                </div>
              )}

              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Withdrawal Amount ($USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    max={availableBalance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100.00"
                    className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Payout Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary"
                  >
                    <option value="bank">Bank Wire Transfer</option>
                    <option value="payoneer">Payoneer</option>
                    <option value="skrill">Skrill</option>
                    <option value="crypto">USDT Crypto (TRC20)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Payout Destination Details</label>
                  <input
                    type="text"
                    required
                    value={payoutDetails}
                    onChange={(e) => setPayoutDetails(e.target.value)}
                    placeholder="IBAN / Payoneer Email / USDT Address"
                    className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary font-mono text-[11px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !amount || parseFloat(amount) > availableBalance || !payoutDetails}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-xs py-3 px-4 rounded-xl disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null} Submit Withdrawal Request
                </button>
              </form>
            </>
          )}
        </div>

        {/* Ledger Activity */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border bg-surface">
            <h2 className="font-heading font-bold text-base text-text">Financial Ledger History</h2>
          </div>

          {transactions === undefined ? (
            <div className="flex justify-center p-8">
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
                        <p className="text-[10px] text-text-muted">{new Date(tx.createdAt).toLocaleDateString()}</p>
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
