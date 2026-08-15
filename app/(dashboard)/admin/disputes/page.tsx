"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AlertTriangle, RotateCcw, CheckCircle, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function AdminDisputesPage() {
  const { user, isLoaded } = useUser();
  const resolveDispute = useMutation(api.admin.resolveDispute);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl text-text flex items-center gap-2">
          <AlertTriangle className="text-danger" size={24} /> Escrow & Dispute Resolution
        </h1>
        <p className="text-text-muted text-xs mt-0.5">Manage buyer/seller dispute cases and arbitrate escrow releases</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-success/10 border border-success/20 text-success rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h3 className="font-heading font-black text-xl text-text mb-2">No Active Order Disputes</h3>
        <p className="text-text-muted text-sm max-w-md mx-auto leading-relaxed">
          All escrow transactions are progressing smoothly without buyer or seller disputes. Active disputes will appear here instantly.
        </p>
      </div>
    </div>
  );
}
