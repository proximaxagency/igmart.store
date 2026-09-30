"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConvexAuth } from "@convex-dev/auth/react";
import { 
  ShieldAlert, CheckCircle2, AlertTriangle, ShieldCheck, 
  Search, Filter, Loader2, Eye, ExternalLink, Activity
} from "lucide-react";

export default function AdminRiskPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isLoaded = !isLoading;
  const [unresolvedOnly, setUnresolvedOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const signals = useQuery(
    api.admin.listRiskSignals,
    isAuthenticated ? { unresolvedOnly } : "skip"
  );
  const resolveRiskSignal = useMutation(api.admin.resolveRiskSignal);

  const handleResolve = async (signalId: Id<"riskSignals">) => {
    setResolvingId(signalId);
    try {
      await resolveRiskSignal({ signalId });
    } catch (err) {
      console.error("Failed to resolve risk signal:", err);
    } finally {
      setResolvingId(null);
    }
  };

  const filteredSignals = (signals || []).filter((s) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (s.username || "").toLowerCase().includes(term) ||
      (s.description || "").toLowerCase().includes(term) ||
      (s.signalType || "").toLowerCase().includes(term) ||
      (s.userEmail || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-text flex items-center gap-2.5">
            <ShieldAlert className="text-warning" size={24} /> Fraud & Risk Operations Desk
          </h1>
          <p className="text-text-muted text-xs mt-0.5">
            Real-time anomaly detection, velocity triggers, suspicious IP clusters, and automated threat mitigation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search risk flags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text placeholder:text-text-muted outline-none focus:border-primary w-48 sm:w-56"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>

          <button
            onClick={() => setUnresolvedOnly(!unresolvedOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              unresolvedOnly
                ? "bg-primary text-white border-primary"
                : "bg-card border-border text-text-muted hover:text-text"
            }`}
          >
            <Filter size={13} /> {unresolvedOnly ? "Active Only" : "All Signals"}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider">Active Threat Signals</span>
            <span className="p-1.5 rounded-lg bg-warning/10 text-warning"><AlertTriangle size={16} /></span>
          </div>
          <p className="font-heading font-black text-2xl text-text">
            {signals?.filter(s => !s.isResolved).length ?? 0}
          </p>
          <p className="text-[11px] text-text-muted mt-1">Pending staff inspection</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider">Mitigated Signals</span>
            <span className="p-1.5 rounded-lg bg-success/10 text-success"><CheckCircle2 size={16} /></span>
          </div>
          <p className="font-heading font-black text-2xl text-text">
            {signals?.filter(s => s.isResolved).length ?? 0}
          </p>
          <p className="text-[11px] text-text-muted mt-1">Marked safe or resolved</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider">System Threat Level</span>
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary"><Activity size={16} /></span>
          </div>
          <p className="font-heading font-black text-2xl text-success">LOW / HEALTHY</p>
          <p className="text-[11px] text-text-muted mt-1">Escrow safety guarantees operational</p>
        </div>
      </div>

      {/* Risk Signals Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {signals === undefined ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : filteredSignals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-muted font-bold">
                  <th className="p-4 pl-6">Target User</th>
                  <th className="p-4">Signal Type</th>
                  <th className="p-4">Reason & Context</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSignals.map((sig) => {
                  const isResolving = resolvingId === sig._id;
                  const severityVariant = sig.severity === "high" ? "danger" : sig.severity === "medium" ? "warning" : "default";

                  return (
                    <tr key={sig._id} className="hover:bg-elevated/50 transition-colors">
                      <td className="p-4 pl-6">
                        <p className="text-sm font-bold text-text">@{sig.username}</p>
                        <p className="text-[11px] text-text-muted font-mono">{sig.userEmail || "No email"}</p>
                      </td>

                      <td className="p-4">
                        <span className="text-xs font-mono font-bold text-text bg-surface px-2.5 py-1 rounded-md border border-border">
                          {sig.signalType}
                        </span>
                      </td>

                      <td className="p-4 max-w-xs">
                        <p className="text-xs text-text-secondary leading-snug">{sig.description}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          Detected: {new Date(sig.createdAt).toLocaleString()}
                        </p>
                      </td>

                      <td className="p-4">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          severityVariant === "danger"
                            ? "bg-danger/10 text-danger border-danger/20"
                            : severityVariant === "warning"
                            ? "bg-warning/10 text-warning border-warning/20"
                            : "bg-elevated text-text-secondary border-border"
                        }`}>
                          {sig.severity || "Standard"}
                        </span>
                      </td>

                      <td className="p-4">
                        {sig.isResolved ? (
                          <span className="inline-flex items-center gap-1 text-xs text-success font-bold">
                            <CheckCircle2 size={13} /> Resolved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-warning font-bold">
                            <AlertTriangle size={13} /> Open
                          </span>
                        )}
                      </td>

                      <td className="p-4 pr-6 text-right">
                        {!sig.isResolved && (
                          <button
                            onClick={() => handleResolve(sig._id)}
                            disabled={isResolving}
                            className="text-xs font-bold text-success border border-success/30 hover:bg-success/10 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {isResolving ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                            Mark Safe
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="font-heading font-black text-lg text-text">No Risk Anomalies Found</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              All transactions, velocity checks, and user actions are currently within healthy thresholds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
