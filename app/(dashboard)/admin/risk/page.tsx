"use client";

import { ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";

export default function AdminRiskPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl text-text flex items-center gap-2">
          <ShieldAlert className="text-warning" size={24} /> Fraud & Risk Operations Desk
        </h1>
        <p className="text-text-muted text-xs mt-0.5">Automated velocity triggers, suspicious IP detection, and chargeback signals</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="w-16 h-16 bg-success/10 border border-success/20 text-success rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} />
        </div>
        <h3 className="font-heading font-black text-xl text-text">No High-Risk Anomalies Detected</h3>
        <p className="text-text-muted text-xs max-w-md mx-auto leading-relaxed">
          System velocity and risk scoring algorithms report normal operation. Flagged accounts or suspicious order surges will trigger alerts here.
        </p>
      </div>
    </div>
  );
}
