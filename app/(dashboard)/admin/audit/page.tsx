"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Shield, FileText, Loader2 } from "lucide-react";

export default function AdminAuditPage() {
  const { user, isLoaded } = useUser();
  const logs = useQuery(api.admin.listAuditLogs, isLoaded && user ? {} : "skip");

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl text-text flex items-center gap-2">
          <Shield className="text-primary" size={24} /> Immutable System Audit Logs
        </h1>
        <p className="text-text-muted text-xs mt-0.5">Chronological record of all administrative state modifications, status changes, and approvals</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {logs === undefined ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-muted font-bold">
                  <th className="p-4 pl-6">Actor</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target Type</th>
                  <th className="p-4 pr-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-elevated/50 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="text-xs font-bold text-text">{log.actorName}</p>
                      <p className="text-[10px] text-text-muted uppercase font-semibold">{log.actorRole || "Staff"}</p>
                    </td>
                    <td className="p-4 text-xs font-mono text-primary font-bold">{log.action}</td>
                    <td className="p-4 text-xs text-text-muted">{log.targetType} (#{log.targetId.slice(-6)})</td>
                    <td className="p-4 pr-6 text-xs text-text-muted">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-text-muted text-sm">No audit logs recorded yet.</div>
        )}
      </div>
    </div>
  );
}
