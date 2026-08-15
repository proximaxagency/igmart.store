"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { DollarSign, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function AdminFinancePage() {
  const { user, isLoaded } = useUser();
  const withdrawals = useQuery(api.admin.listWithdrawalRequests, isLoaded && user ? {} : "skip");
  const reviewWithdrawal = useMutation(api.admin.reviewWithdrawal);

  const handleReview = async (withdrawalId: Id<"withdrawalRequests">, status: "completed" | "rejected") => {
    try {
      await reviewWithdrawal({ withdrawalId, status });
    } catch (err) {
      console.error("Failed to review withdrawal:", err);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl text-text flex items-center gap-2">
          <DollarSign className="text-success" size={24} /> Payout & Withdrawal Approval Queue
        </h1>
        <p className="text-text-muted text-xs mt-0.5">Audit requested seller payouts across Bank Wire, Payoneer, Skrill, and Crypto</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {withdrawals === undefined ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : withdrawals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-muted font-bold">
                  <th className="p-4 pl-6">Seller</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Payout Details</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {withdrawals.map((w) => (
                  <tr key={w._id} className="hover:bg-elevated/50 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="text-sm font-bold text-text">@{w.username}</p>
                      <p className="text-[11px] text-text-muted">{w.userEmail}</p>
                    </td>
                    <td className="p-4 text-sm font-black text-success">${w.amount.toFixed(2)}</td>
                    <td className="p-4 text-xs font-bold uppercase text-text">{w.method}</td>
                    <td className="p-4 text-xs font-mono text-text-muted max-w-[200px] truncate">{w.payoutDetails}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReview(w._id, "completed")}
                          className="text-xs font-bold text-success border border-success/30 hover:bg-success/10 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <CheckCircle2 size={13} /> Process & Release
                        </button>
                        <button
                          onClick={() => handleReview(w._id, "rejected")}
                          className="text-xs font-bold text-danger border border-danger/30 hover:bg-danger/10 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <XCircle size={13} /> Reject & Refund
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-text-muted text-sm">No pending seller withdrawal requests.</div>
        )}
      </div>
    </div>
  );
}
