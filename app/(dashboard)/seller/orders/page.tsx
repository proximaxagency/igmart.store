"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/index";
import { DollarSign, Loader2, MessageSquare, ArrowRight, Package, ShieldCheck } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function SellerOrdersPage() {
  const { user, isLoaded } = useUser();
  const orders = useQuery(
    api.orders.getMyOrders,
    isLoaded && user ? { role: "seller" } : "skip"
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="popular">Completed</Badge>;
      case "delivered":
        return <Badge variant="hot">Delivered</Badge>;
      case "delivering":
        return <Badge variant="new">Delivering</Badge>;
      case "paid":
        return <Badge variant="new">Escrow Paid</Badge>;
      case "disputed":
        return <Badge variant="sale">Disputed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-text flex items-center gap-2">
            <DollarSign className="text-primary" size={26} /> Merchant Order Ledger
          </h1>
          <p className="text-text-muted text-xs sm:text-sm mt-1">Manage buyer deliveries, escrow confirmations, and customer communication</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {orders === undefined ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="animate-spin text-primary" size={28} />
            <p className="text-sm text-text-muted">Loading your sales orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-muted font-bold">
                  <th className="p-4 pl-6">Order ID</th>
                  <th className="p-4">Listing</th>
                  <th className="p-4">Buyer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-elevated/50 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-text">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-text truncate max-w-[200px]">{order.listingTitle}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-text-secondary">{order.counterpartName}</p>
                    </td>
                    <td className="p-4 font-black text-text text-sm">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link
                        href="/messages"
                        className="inline-flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        <MessageSquare size={13} /> Chat & Deliver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 bg-surface border border-border rounded-2xl flex items-center justify-center text-text-muted mb-4">
              <Package size={28} />
            </div>
            <h3 className="font-heading font-bold text-lg text-text mb-1">No Orders Yet</h3>
            <p className="text-xs text-text-muted max-w-sm mb-6">
              When buyers purchase your game accounts or services, their orders and escrow status will appear here.
            </p>
            <Link
              href="/sell/create"
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              Create New Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
