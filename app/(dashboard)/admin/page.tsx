"use client";

import React from "react";
import { Users, Database, DollarSign, AlertTriangle, Loader2 } from "lucide-react";
import { StatCard, Button } from "@/components/ui/index";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { useUser } from "@clerk/nextjs";

type AlertType = {
  type: "info" | "danger" | "warning";
  icon: React.ReactNode;
  title: string;
  desc: string;
  action: { label: string; variant: "primary" | "secondary" | "danger" } | null;
};

const alerts: AlertType[] = [
  {
    type: "info",
    icon: <Users size={18} className="text-primary-hover mt-0.5 flex-shrink-0" />,
    title: "System Status Normal",
    desc: "All real-time marketplace & live support sockets are operational.",
    action: null,
  },
];

export default function AdminDashboardPage() {
  const { user, isLoaded } = useUser();
  const metrics = useQuery(api.admin.getAdminMetrics, isLoaded && user ? {} : "skip");

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl text-text mb-6">System Overview</h1>

      {/* Stats */}
      {metrics === undefined ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="Platform Volume" value={`$${metrics.gmv.toFixed(2)}`} icon={<DollarSign size={16} />} iconColor="#4ade80" change="" positive={true} />
          <StatCard label="Active Users" value={metrics.totalUsers.toString()} icon={<Users size={16} />} iconColor="#3b82f6" change="" positive={true} />
          <StatCard label="Active Listings" value={metrics.activeListings.toString()} icon={<Database size={16} />} iconColor="#a78bfa" change="" positive={true} />
          <StatCard label="Open Disputes" value={metrics.openDisputes.toString()} icon={<AlertTriangle size={16} />} iconColor="#ef4444" change="" positive={true} />
        </div>
      )}

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
              {alert.action && (
                <Button variant={alert.action.variant} size="sm" className="flex-shrink-0">
                  {alert.action.label}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
