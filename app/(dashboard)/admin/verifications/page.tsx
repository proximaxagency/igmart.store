"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { ShieldCheck, CheckCircle2, XCircle, FileText, ExternalLink, Loader2 } from "lucide-react";

export default function AdminVerificationsPage() {
  const { user, isLoaded } = useUser();
  const verifications = useQuery(api.admin.listPendingVerifications, isLoaded && user ? {} : "skip");
  const reviewVerification = useMutation(api.admin.reviewVerification);

  const handleReview = async (verificationId: Id<"sellerVerifications">, status: "approved" | "rejected") => {
    try {
      await reviewVerification({
        verificationId,
        status,
        adminNotes: status === "approved" ? "Verification document approved by admin" : "ID document unverified",
      });
    } catch (err) {
      console.error("Failed to review verification:", err);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl text-text flex items-center gap-2">
          <ShieldCheck className="text-primary" size={24} /> Seller KYC Verification Queue
        </h1>
        <p className="text-text-muted text-xs mt-0.5">Review seller identity applications, government documents, and grant verified seller privileges</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {verifications === undefined ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : verifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-muted font-bold">
                  <th className="p-4 pl-6">Applicant</th>
                  <th className="p-4">Country</th>
                  <th className="p-4">Doc Type</th>
                  <th className="p-4">Document Link</th>
                  <th className="p-4 pr-6 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {verifications.map((v) => (
                  <tr key={v._id} className="hover:bg-elevated/50 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="text-sm font-bold text-text">{v.fullName}</p>
                      <p className="text-[11px] text-text-muted">@{v.username} · {v.userEmail}</p>
                    </td>
                    <td className="p-4 text-xs font-semibold text-text">{v.country}</td>
                    <td className="p-4 text-xs font-mono text-text-muted">{v.idType}</td>
                    <td className="p-4 text-xs">
                      <a
                        href={v.idDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline font-bold"
                      >
                        View ID <ExternalLink size={12} />
                      </a>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReview(v._id, "approved")}
                          className="text-xs font-bold text-success border border-success/30 hover:bg-success/10 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <CheckCircle2 size={13} /> Approve
                        </button>
                        <button
                          onClick={() => handleReview(v._id, "rejected")}
                          className="text-xs font-bold text-danger border border-danger/30 hover:bg-danger/10 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-text-muted text-sm">No pending seller KYC verifications.</div>
        )}
      </div>
    </div>
  );
}
