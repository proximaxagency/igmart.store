import type { Metadata } from "next";
import { Users, Database, DollarSign, AlertTriangle, CheckCircle2 } from "lucide-react";
import { StatCard, Badge, Button } from "@/components/ui/index";

export const metadata: Metadata = {
  title: "Admin Dashboard | IGMART Core",
};

const stats = [
  { label: "Platform Volume", value: "$1.2M", icon: <DollarSign size={16} />, iconColor: "#4ade80", change: "+15%", positive: true },
  { label: "Active Users", value: "45,231", icon: <Users size={16} />, iconColor: "#3b82f6", change: "+2%", positive: true },
  { label: "Active Listings", value: "8,942", icon: <Database size={16} />, iconColor: "#a78bfa", change: "+5%", positive: true },
  { label: "Open Disputes", value: "12", icon: <AlertTriangle size={16} />, iconColor: "#ef4444", change: "-3", positive: true },
];

const alerts = [
  {
    type: "danger" as const,
    icon: <AlertTriangle size={18} className="text-danger mt-0.5 flex-shrink-0" />,
    title: "High Dispute Rate — User \"GoldFarm\"",
    desc: "This seller has received 3 disputes in the last 24 hours. Automatic pause applied to listings.",
    action: { label: "Review", variant: "danger" as const },
  },
  {
    type: "info" as const,
    icon: <Users size={18} className="text-primary-hover mt-0.5 flex-shrink-0" />,
    title: "New Seller Verification Request",
    desc: "User \"ProGamer99\" has submitted ID verification documents.",
    action: { label: "Approve", variant: "primary" as const },
  },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-heading font-bold text-2xl text-text mb-6">System Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Alerts */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-heading font-bold text-lg text-text mb-5">System Alerts & Activity</h2>
        <div className="flex flex-col gap-3">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 bg-elevated border border-border rounded-xl"
              role="alert"
            >
              {alert.icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text mb-1">{alert.title}</p>
                <p className="text-sm text-text-muted leading-relaxed">{alert.desc}</p>
              </div>
              <Button variant={alert.action.variant} size="sm" className="flex-shrink-0">
                {alert.action.label}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
