"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/index";
import { ShoppingBag, Loader2, ArrowRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function OrdersPage() {
  const { user, isLoaded } = useUser();
  const orders = useQuery(api.orders.getMyOrders, isLoaded && user ? {} : "skip");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="popular">Completed</Badge>;
      case "delivered":
        return <Badge variant="hot">Delivered</Badge>;
      case "delivering":
        return <Badge variant="new">Delivering</Badge>;
      case "paid":
        return <Badge variant="new">Paid</Badge>;
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
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-text">My Orders</h1>
          <p className="text-text-muted text-sm mt-1">Track and manage your marketplace purchases and sales</p>
        </div>
        <Link
          href="/marketplace"
          className="hidden sm:inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          Explore Marketplace <ArrowRight size={14} />
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {orders === undefined ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="animate-spin text-primary" size={28} />
            <p className="text-sm text-text-muted">Loading your orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-muted font-bold">
                  <th className="p-4 pl-6">Order ID</th>
                  <th className="p-4">Item</th>
                  <th className="p-4">Party</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-elevated/50 transition-colors">
                    <td className="p-4 pl-6 text-sm font-mono font-bold text-text">
                      #{order._id.slice(-8).toUpperCase()}
                      <br />
                      <span className="text-[11px] font-sans text-text-muted font-normal">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-semibold text-text max-w-[200px] truncate">
                      {order.listingTitle}
                    </td>
                    <td className="p-4 text-sm">
                      <span className="text-primary font-medium">{order.counterpartName}</span>
                    </td>
                    <td className="p-4 text-sm font-black text-text">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-4">{getStatusBadge(order.status)}</td>
                    <td className="p-4 pr-6 text-right">
                      <Link
                        href={`/messages`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover border border-primary/30 hover:border-primary px-3 py-1.5 rounded-lg transition-all"
                      >
                        Contact & Chat
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 px-4 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
              <ShoppingBag size={28} />
            </div>
            <h3 className="font-heading font-black text-xl text-text mb-2">No orders found</h3>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              You haven&apos;t placed or received any orders yet. When you buy or sell items on IGMART, they will appear here.
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Browse Marketplace
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
