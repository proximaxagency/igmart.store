"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "@convex-dev/auth/react";
import { Wallet, ArrowUpRight, ArrowDownRight, Activity, Plus, Loader2, Info } from "lucide-react";

export default function WalletPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isLoaded = !isLoading;
  const balances = useQuery(api.transactions.getMyBalances, isAuthenticated ? {} : "skip");
  const transactions = useQuery(api.transactions.getMyTransactions, isAuthenticated ? {} : "skip");
  const [showFundInfo, setShowFundInfo] = useState(false);

  const walletBalance = balances?.walletBalance ?? 0;
  const pendingBalance = balances?.pendingBalance ?? 0;

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl text-text mb-6">Wallet & Balances</h1>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Available balance */}
        <div className="rounded-xl p-6 border border-border shadow-sm" style={{ background: "linear-gradient(135deg, var(--color-card), var(--color-elevated))" }}>
          <div className="flex items-center gap-2 text-text-muted text-sm font-medium mb-3">
            <Wallet size={15} />
            Available Balance
          </div>
          <p className="font-heading font-black text-4xl text-text mb-5">
            ${walletBalance.toFixed(2)}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFundInfo(!showFundInfo)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Plus size={15} /> Add Funds
            </button>
            <a
              href="/seller/earnings"
              className="flex-1 flex items-center justify-center gap-1.5 bg-elevated hover:bg-border text-text text-sm font-bold px-4 py-2.5 rounded-xl transition-colors border border-border"
            >
              Withdraw
            </a>
          </div>
          {showFundInfo && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-text-muted leading-relaxed">
              <p className="flex items-start gap-2">
                <Info size={13} className="text-primary mt-0.5 flex-shrink-0" />
                To add funds, please contact support or use the in-app payment flow at checkout. Wallet top-ups via bank transfer, crypto, or card are coming soon.
              </p>
            </div>
          )}
        </div>

        {/* Pending balance */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-2 text-text-muted text-sm font-medium mb-3">
            <Activity size={15} />
            Pending Balance (Escrow)
          </div>
          <p className="font-heading font-black text-4xl text-text-muted">
            ${pendingBalance.toFixed(2)}
          </p>
          <p className="text-sm text-text-muted mt-3 leading-relaxed">
            Funds held securely in escrow for active orders. Released when you confirm delivery.
          </p>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg text-text">Recent Transactions</h2>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          {transactions === undefined ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : transactions.length > 0 ? (
            transactions.map((tx, i) => {
              const isCredit = tx.amount > 0;
              return (
                <div
                  key={tx._id}
                  className={`flex items-center justify-between p-4 ${i < transactions.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCredit ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                      }`}
                    >
                      {isCredit ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">{tx.description}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} Â· #{tx._id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-bold ${isCredit ? "text-success" : "text-text"}`}>
                      {isCredit ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                      tx.status === "completed" ? "text-success" : tx.status === "pending" ? "text-warning" : "text-danger"
                    }`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center">
              <Wallet size={40} className="text-text-muted mx-auto mb-3 opacity-40" />
              <p className="text-sm text-text-muted font-medium">No transactions yet.</p>
              <p className="text-xs text-text-muted mt-1">Your purchase and earning history will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
