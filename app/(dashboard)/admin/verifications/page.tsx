"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConvexAuth } from "@convex-dev/auth/react";
import {
  ShieldCheck, CheckCircle2, XCircle, FileText, ExternalLink,
  Loader2, Eye, X, Image as ImageIcon, MapPin, UserCheck
} from "lucide-react";
import { ConvexImage } from "@/components/shared/ConvexImage";

export default function AdminVerificationsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isLoaded = !isLoading;
  const verifications = useQuery(api.admin.listPendingVerifications, isAuthenticated ? {} : "skip");
  const reviewVerification = useMutation(api.admin.reviewVerification);

  const [inspectModal, setInspectModal] = useState<{ url: string; title: string; applicant: string } | null>(null);
  const [rejectingId, setRejectingId] = useState<Id<"sellerVerifications"> | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleReview = async (
    verificationId: Id<"sellerVerifications">,
    status: "approved" | "rejected",
    customReason?: string
  ) => {
    setProcessingId(verificationId);
    try {
      await reviewVerification({
        verificationId,
        status,
        adminNotes:
          status === "approved"
            ? "Verification documents verified and approved by admin."
            : customReason || "ID document unreadable or mismatched with account name.",
      });
      setRejectingId(null);
      setRejectReason("");
    } catch (err) {
      console.error("Failed to review verification:", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-text flex items-center gap-2">
            <ShieldCheck className="text-primary" size={26} /> Seller KYC Verification Queue
          </h1>
          <p className="text-text-muted text-xs mt-0.5">
            Review uploaded government ID and address documents to grant verified seller privileges.
          </p>
        </div>
        {verifications && (
          <span className="text-xs font-bold bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-xl w-fit">
            {verifications.length} Pending Applications
          </span>
        )}
      </div>

      {/* ── Queue Table ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {verifications === undefined ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : verifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-muted font-bold">
                  <th className="p-4 pl-6">Applicant</th>
                  <th className="p-4">Country</th>
                  <th className="p-4">Doc Type</th>
                  <th className="p-4">Uploaded Images</th>
                  <th className="p-4 pr-6 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {verifications.map((v) => (
                  <tr key={v._id} className="hover:bg-elevated/40 transition-colors">
                    {/* Applicant Info */}
                    <td className="p-4 pl-6">
                      <p className="text-sm font-bold text-text">{v.fullName}</p>
                      <p className="text-[11px] text-text-muted">
                        @{v.username} Â· {v.userEmail}
                      </p>
                    </td>

                    {/* Country */}
                    <td className="p-4 text-xs font-semibold text-text">{v.country}</td>

                    {/* Doc Type */}
                    <td className="p-4 text-xs font-mono text-primary font-bold">{v.idType}</td>

                    {/* Uploaded Document Thumbnails with Modal Inspection */}
                    <td className="p-4 text-xs">
                      <div className="flex items-center gap-2.5">
                        {/* Primary ID Image */}
                        <div
                          onClick={() =>
                            setInspectModal({
                              url: v.idDocumentUrl,
                              title: `Government ${v.idType}`,
                              applicant: v.fullName,
                            })
                          }
                          className="relative w-14 h-11 rounded-lg overflow-hidden bg-elevated border border-border cursor-pointer group shrink-0"
                          title="Click to inspect ID document in full resolution"
                        >
                          <ConvexImage
                            src={v.idDocumentUrl}
                            alt="Government ID"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Eye size={13} />
                          </div>
                        </div>

                        {/* Optional Address Proof Image */}
                        {v.addressProofUrl ? (
                          <div
                            onClick={() =>
                              setInspectModal({
                                url: v.addressProofUrl!,
                                title: "Address Proof Document",
                                applicant: v.fullName,
                              })
                            }
                            className="relative w-14 h-11 rounded-lg overflow-hidden bg-elevated border border-border cursor-pointer group shrink-0"
                            title="Click to inspect Address Proof"
                          >
                            <ConvexImage
                              src={v.addressProofUrl}
                              alt="Address Proof"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <Eye size={13} />
                            </div>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          onClick={() =>
                            setInspectModal({
                              url: v.idDocumentUrl,
                              title: `Government ${v.idType}`,
                              applicant: v.fullName,
                            })
                          }
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-bold"
                        >
                          Inspect <Eye size={11} />
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-6 text-right">
                      {rejectingId === v._id ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="text"
                            placeholder="Rejection reason..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="bg-surface border border-danger/40 rounded-lg px-2.5 py-1 text-xs text-text outline-none w-44"
                          />
                          <button
                            onClick={() => handleReview(v._id, "rejected", rejectReason)}
                            disabled={processingId === v._id}
                            className="text-xs font-bold text-white bg-danger hover:bg-danger/90 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setRejectingId(null)}
                            className="text-xs text-text-muted hover:text-text px-1"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleReview(v._id, "approved")}
                            disabled={processingId === v._id}
                            className="text-xs font-bold text-success border border-success/30 hover:bg-success/10 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {processingId === v._id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={13} />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectingId(v._id)}
                            disabled={processingId === v._id}
                            className="text-xs font-bold text-danger border border-danger/30 hover:bg-danger/10 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-text-muted text-sm space-y-2">
            <UserCheck className="mx-auto text-success/40" size={36} />
            <p className="font-bold text-text">No Pending Verifications</p>
            <p className="text-xs text-text-muted">All seller KYC applications have been reviewed.</p>
          </div>
        )}
      </div>

      {/* ── Inspection Lightbox Modal ── */}
      {inspectModal && (
        <div
          onClick={() => setInspectModal(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h4 className="font-heading font-bold text-sm text-text flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  {inspectModal.title}
                </h4>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Applicant: <strong className="text-text">{inspectModal.applicant}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectModal(null)}
                className="p-1.5 rounded-lg hover:bg-elevated text-text-muted hover:text-text transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[78vh] bg-black/50">
              <ConvexImage
                src={inspectModal.url}
                alt={inspectModal.title}
                className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-lg border border-white/10"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
