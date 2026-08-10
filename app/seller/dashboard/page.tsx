import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, DollarSign, Package, Star, Plus } from "lucide-react";
import { StatCard, Badge } from "@/components/ui/index";

export const metadata: Metadata = {
  title: "Dashboard Overview | IGMART Seller",
};

const stats = [
  { label: "Total Revenue", value: "$4,520", icon: <DollarSign size={16} />, iconColor: "#4ade80", change: "+12%", positive: true },
  { label: "Active Orders", value: "3", icon: <Package size={16} />, iconColor: "#3b82f6", change: "0%", positive: false },
  { label: "Total Sales", value: "128", icon: <TrendingUp size={16} />, iconColor: "#a78bfa", change: "+5%", positive: true },
  { label: "Avg Rating", value: "4.9", icon: <Star size={16} />, iconColor: "#f59e0b", change: "+0.1", positive: true },
];

const orders = [
  { id: "ORD-001", title: "Valorant Immortal Account", price: "$150.00", status: "Delivering" },
  { id: "ORD-002", title: "WoW 100k Gold", price: "$45.00", status: "Completed" },
  { id: "ORD-003", title: "Apex Legends Predator Boost", price: "$200.00", status: "Pending" },
];

const statusVariant: Record<string, "success" | "warning" | "popular"> = {
  Completed: "success",
  Delivering: "popular",
  Pending: "warning",
};

const actionItems = [
  { step: 1, title: "Verify Identity", desc: "Required to withdraw funds.", done: true },
  { step: 2, title: "Add Payout Method", desc: "Link your bank or crypto wallet.", done: false },
  { step: 3, title: "Create a Listing", desc: "Start selling to earn money.", done: false },
];

export default function SellerDashboardPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl text-text">Dashboard</h1>
        <Link
          href="/sell/create"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          style={{ background: "var(--gradient-brand)" }}
        >
          <Plus size={16} /> New Listing
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Two-column grid */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Recent orders */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-bold text-lg text-text">Recent Orders</h2>
            <button className="text-sm font-semibold text-primary-hover hover:underline">View All</button>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left" aria-label="Recent orders">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-xs font-bold text-text-muted uppercase tracking-wider">Item</th>
                  <th className="pb-3 text-xs font-bold text-text-muted uppercase tracking-wider">Price</th>
                  <th className="pb-3 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={order.id} className={i < orders.length - 1 ? "border-b border-border" : ""}>
                    <td className="py-4 pr-4">
                      <p className="text-sm font-semibold text-text">{order.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{order.id}</p>
                    </td>
                    <td className="py-4 text-sm font-bold text-text pr-4">{order.price}</td>
                    <td className="py-4">
                      <Badge variant={statusVariant[order.status] ?? "default"}>{order.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="flex flex-col gap-3 sm:hidden">
            {orders.map((order) => (
              <div key={order.id} className="bg-elevated border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text leading-snug">{order.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{order.id}</p>
                  </div>
                  <Badge variant={statusVariant[order.status] ?? "default"}>{order.status}</Badge>
                </div>
                <p className="text-base font-bold text-text">{order.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action items */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-heading font-bold text-lg text-text mb-5">Action Items</h2>
          <div className="flex flex-col gap-4">
            {actionItems.map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                    item.done ? "bg-primary text-white" : "bg-primary/10 text-primary-hover border border-primary/30"
                  }`}
                >
                  {item.done ? "✓" : item.step}
                </div>
                <div>
                  <p className={`text-sm font-semibold mb-0.5 ${item.done ? "text-text-muted line-through" : "text-text"}`}>
                    {item.title}
                  </p>
                  <p className="text-xs text-text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
