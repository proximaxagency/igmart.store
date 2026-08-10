"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Wallet, ArrowUpRight, ArrowDownRight, Activity, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/index";

export default function WalletPage() {
  const { user, isLoaded } = useUser();
  const balances = useQuery(api.transactions.getMyBalances, isLoaded && user ? {} : "skip");
  const transactions = useQuery(api.transactions.getMyTransactions, isLoaded && user ? {} : "skip");

  const walletBalance = balances?.walletBalance ?? 0;
  const pendingBalance = balances?.pendingBalance ?? 0;

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl text-text mb-6">Wallet & Balances</h1>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Available balance */}
        <div
          className="rounded-xl p-6 border border-border shadow-sm"
          style={{ background: "linear-gradient(135deg, var(--color-card), var(--color-elevated))" }}
        >
          <div className="flex items-center gap-2 text-text-muted text-sm font-medium mb-3">
            <Wallet size={15} aria-hidden="true" />
            Available Balance
          </div>
          <p className="font-heading font-black text-4xl text-text mb-5">
            ${walletBalance.toFixed(2)}
          </p>
          <div className="flex gap-3">
            <Button variant="primary" size="sm" icon={<Plus size={15} />} className="flex-1">
              Add Funds
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Withdraw
            </Button>
          </div>
        </div>

        {/* Pending balance */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-2 text-text-muted text-sm font-medium mb-3">
            <Activity size={15} aria-hidden="true" />
            Pending Balance (Escrow)
          </div>
          <p className="font-heading font-black text-4xl text-text-muted">
            ${pendingBalance.toFixed(2)}
          </p>
          <p className="text-sm text-text-muted mt-3">Funds held securely in escrow for active transactions.</p>
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
              const isDeposit = tx.type === "deposit" || tx.type === "payment_released";
              return (
                <div
                  key={tx._id}
                  className={`flex items-center justify-between p-4 ${
                    i < transactions.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isDeposit ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                      }`}
                      aria-hidden="true"
                    >
                      {isDeposit ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">{tx.description}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString()} · #{tx._id.slice(-6)}
                      </p>
                    </div>
                  </div>
                  <p className={`text-base font-bold ${isDeposit ? "text-success" : "text-text"}`}>
                    {isDeposit ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-text-muted font-medium">No transactions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
