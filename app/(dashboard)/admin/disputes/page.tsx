"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "@convex-dev/auth/react";
import { Id } from "@/convex/_generated/dataModel";
import { Scale, CheckCircle2, RotateCcw, Loader2, AlertTriangle, MessageSquare } from "lucide-react";

type ConfirmAction = {
  orderId: Id<"orders">;
  resolution: "refund_buyer" | "release_to_seller";
  orderNum: string;
  amount: number;
} | null;

export default function AdminDisputesPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isLoaded = !isLoading;
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [reason, setReason] = useState("");

  const orders = useQuery(api.admin.listDisputedOrders, isAuthenticated ? {} : "skip");
  const resolveDispute = useMutation(api.admin.resolveDispute);

  const executeResolve = async () => {
    if (!confirm) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      await resolveDispute({ orderId: confirm.orderId, resolution: confirm.resolution, reason: reason || undefined });
      setFeedback({
        type: "success",
        msg: confirm.resolution === "refund_buyer"
          ? `Order #${confirm.orderNum} refunded $${confirm.amount.toFixed(2)} to buyer.`
          : `Order #${confirm.orderNum} funds released to seller.`,
      });
      setReason("");
    } catch (err: any) {
      setFeedback({ type: "error", msg: err.message || "Failed to resolve dispute" });
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl text-text flex items-center gap-2">
          <Scale className="text-warning" size={24} /> Dispute Resolution Center
        </h1>
        <p className="text-text-muted text-xs mt-0.5">Arbitrate buyer-seller disputes and release or refund escrow funds</p>
      </div>

      {feedback && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${
          feedback.type === "success" ? "bg-success/10 text-success border border-success/20" : "bg-danger/10 text-danger border border-danger/20"
        }`}>
          {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {feedback.msg}
        </div>
      )}

      {/* Confirm Modal */}
      {confirm && (
        <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-heading font-black text-lg text-text text-center mb-2">Confirm Resolution</h3>
            <p className="text-sm text-text-muted text-center mb-4">
              {confirm.resolution === "refund_buyer"
                ? `Refund $${confirm.amount.toFixed(2)} to buyer for order #${confirm.orderNum}?`
                : `Release $${confirm.amount.toFixed(2)} to seller for order #${confirm.orderNum}?`}
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Add resolution reason (optional)..."
              rows={2}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text placeholder:text-text-muted outline-none focus:border-primary resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 bg-elevated hover:bg-border text-text font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button
                onClick={executeResolve}
                disabled={actionLoading}
                className={`flex-1 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 ${
                  confirm.resolution === "refund_buyer" ? "bg-primary text-white" : "bg-success text-white"
                }`}
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {orders === undefined ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={28} /></div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-muted font-bold">
                  <th className="p-4 pl-6">Order</th>
                  <th className="p-4">Buyer</th>
                  <th className="p-4">Seller</th>
                  <th className="p-4">Item</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 pr-6 text-right">Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => {
                  const orderNum = order._id.slice(-6).toUpperCase();
                  return (
                    <tr key={order._id} className="hover:bg-elevated/50 transition-colors">
                      <td className="p-4 pl-6">
                        <p className="text-sm font-bold text-warning">#{orderNum}</p>
                        <p className="text-[11px] text-text-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="p-4 text-sm text-text">{order.buyerName}</td>
                      <td className="p-4 text-sm text-text">{order.sellerName}</td>
                      <td className="p-4 text-xs text-text-muted truncate max-w-[160px]">{order.listingTitle}</td>
                      <td className="p-4 text-sm font-black text-text">${order.totalAmount.toFixed(2)}</td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setConfirm({ orderId: order._id, resolution: "refund_buyer", orderNum, amount: order.totalAmount })}
                            className="text-xs font-bold text-primary border border-primary/30 hover:bg-primary/10 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <RotateCcw size={12} /> Refund Buyer
                          </button>
                          <button
                            onClick={() => setConfirm({ orderId: order._id, resolution: "release_to_seller", orderNum, amount: order.price - order.feeAmount })}
                            className="text-xs font-bold text-success border border-success/30 hover:bg-success/10 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <CheckCircle2 size={12} /> Release to Seller
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <Scale size={48} className="text-text-muted mx-auto mb-4 opacity-30" />
            <p className="font-bold text-text mb-1">No Active Disputes</p>
            <p className="text-sm text-text-muted">All orders are processing normally.</p>
          </div>
        )}
      </div>
    </div>
  );
}
