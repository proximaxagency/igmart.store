import type { Metadata } from "next";
import { Wallet, ArrowUpRight, ArrowDownRight, Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/index";

export const metadata: Metadata = {
  title: "Wallet | IGMART",
};

const transactions = [
  { id: "TX-100", type: "deposit" as const, amount: 200, date: "Oct 12, 2026", status: "completed", desc: "Wallet Top-up" },
  { id: "TX-101", type: "purchase" as const, amount: -150, date: "Oct 12, 2026", status: "completed", desc: "Valorant Account" },
];

export default function WalletPage() {
  return (
    <div>
      <h1 className="font-heading font-bold text-2xl text-text mb-6">Wallet & Balances</h1>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Available balance */}
        <div
          className="rounded-xl p-6 border border-border"
          style={{ background: "linear-gradient(135deg, var(--color-card), var(--color-elevated))" }}
        >
          <div className="flex items-center gap-2 text-text-muted text-sm font-medium mb-3">
            <Wallet size={15} aria-hidden="true" />
            Available Balance
          </div>
          <p className="font-heading font-black text-4xl text-text mb-5">$50.00</p>
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
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-2 text-text-muted text-sm font-medium mb-3">
            <Activity size={15} aria-hidden="true" />
            Pending Balance
          </div>
          <p className="font-heading font-black text-4xl text-text-muted">$0.00</p>
          <p className="text-sm text-text-muted mt-3">Funds held in escrow for active orders.</p>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg text-text">Recent Transactions</h2>
          <button className="text-sm font-semibold text-primary-hover hover:underline">View All</button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {transactions.map((tx, i) => {
            const isDeposit = tx.type === "deposit";
            return (
              <div
                key={tx.id}
                className={`flex items-center justify-between p-4 ${i < transactions.length - 1 ? "border-b border-border" : ""}`}
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
                    <p className="text-sm font-semibold text-text">{tx.desc}</p>
                    <p className="text-xs text-text-muted mt-0.5">{tx.date} · {tx.id}</p>
                  </div>
                </div>
                <p className={`text-base font-bold ${isDeposit ? "text-success" : "text-text"}`}>
                  {isDeposit ? "+" : ""}{tx.amount < 0 ? "" : "+"}${Math.abs(tx.amount).toFixed(2)}
                </p>
              </div>
            );
          })}

          {transactions.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-text-muted">No transactions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
