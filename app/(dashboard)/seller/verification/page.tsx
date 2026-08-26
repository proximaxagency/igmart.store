"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "@convex-dev/auth/react";
import { ShieldCheck, CheckCircle2, AlertCircle, FileText, Upload, Clock, Loader2 } from "lucide-react";

export default function SellerVerificationPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isLoaded = !isLoading;
  const kycStatus = useQuery(api.seller.getKYCStatus, isAuthenticated ? {} : "skip");
  const submitKYC = useMutation(api.seller.submitKYCVerification);

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("India");
  const [idType, setIdType] = useState("Passport");
  const [idDocumentUrl, setIdDocumentUrl] = useState("");
  const [addressProofUrl, setAddressProofUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !idDocumentUrl) return;

    setIsSubmitting(true);
    try {
      await submitKYC({
        fullName,
        country,
        idType,
        idDocumentUrl,
        addressProofUrl: addressProofUrl || undefined,
      });
      setSubmittedSuccess(true);
    } catch (err) {
      console.error("KYC submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl text-text flex items-center gap-2">
          <ShieldCheck className="text-primary" size={24} /> Seller Identity & KYC Verification
        </h1>
        <p className="text-text-muted text-xs mt-0.5">Verified sellers unlock lower commission fees, higher listing limits, and instant payouts</p>
      </div>

      {/* Verification Status Card */}
      {kycStatus ? (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
              kycStatus.status === "approved"
                ? "bg-success/10 text-success border border-success/20"
                : kycStatus.status === "rejected"
                ? "bg-danger/10 text-danger border border-danger/20"
                : "bg-warning/10 text-warning border border-warning/20"
            }`}>
              {kycStatus.status === "approved" ? <CheckCircle2 size={24} /> : <Clock size={24} />}
            </div>
            <div>
              <p className="font-heading font-bold text-lg text-text">
                Status: <span className="uppercase text-primary">{kycStatus.status.replace("_", " ")}</span>
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Application submitted on {new Date(kycStatus.createdAt).toLocaleDateString()}
              </p>
              {kycStatus.adminNotes && (
                <p className="text-xs text-warning mt-2 bg-warning/10 p-2 rounded-lg border border-warning/20">
                  Staff Notes: {kycStatus.adminNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* KYC Stepper Form */}
      {(!kycStatus || kycStatus.status === "rejected") && !submittedSuccess && (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary font-bold" : "text-text-muted"}`}>
              <span className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs">1</span>
              <span className="text-xs hidden sm:inline">Personal Details</span>
            </div>
            <div className="h-0.5 flex-1 bg-border mx-4" />
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary font-bold" : "text-text-muted"}`}>
              <span className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs">2</span>
              <span className="text-xs hidden sm:inline">ID Document</span>
            </div>
            <div className="h-0.5 flex-1 bg-border mx-4" />
            <div className={`flex items-center gap-2 ${step >= 3 ? "text-primary font-bold" : "text-text-muted"}`}>
              <span className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs">3</span>
              <span className="text-xs hidden sm:inline">Review & Submit</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Legal Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name as shown on government ID"
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-xs text-text outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Country of Residence</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-xs text-text outline-none focus:border-primary"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => fullName && setStep(2)}
                    disabled={!fullName}
                    className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-6 py-3 rounded-xl disabled:opacity-50 transition-colors"
                  >
                    Next: Upload Document â†’
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Document Type</label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-xs text-text outline-none focus:border-primary"
                  >
                    <option value="Passport">Passport</option>
                    <option value="National ID">National ID Card</option>
                    <option value="Driver License">Driver&apos;s License</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Government ID Document Link / File URL</label>
                  <input
                    type="url"
                    required
                    value={idDocumentUrl}
                    onChange={(e) => setIdDocumentUrl(e.target.value)}
                    placeholder="https://example.com/my-id-document.jpg"
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-xs text-text outline-none focus:border-primary font-mono"
                  />
                  <p className="text-[11px] text-text-muted mt-1">Provide a secure direct URL to your clear document image</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Address Proof Document URL (Optional)</label>
                  <input
                    type="url"
                    value={addressProofUrl}
                    onChange={(e) => setAddressProofUrl(e.target.value)}
                    placeholder="https://example.com/utility-bill.pdf"
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-xs text-text outline-none focus:border-primary font-mono"
                  />
                </div>
                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-elevated hover:bg-surface text-text font-bold text-xs px-6 py-3 rounded-xl transition-colors"
                  >
                    â† Back
                  </button>
                  <button
                    type="button"
                    onClick={() => idDocumentUrl && setStep(3)}
                    disabled={!idDocumentUrl}
                    className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-6 py-3 rounded-xl disabled:opacity-50 transition-colors"
                  >
                    Next: Review Application â†’
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
                  <h3 className="font-heading font-bold text-sm text-text">Confirm Verification Details</h3>
                  <div className="text-xs space-y-1 text-text-muted">
                    <p><strong className="text-text">Full Name:</strong> {fullName}</p>
                    <p><strong className="text-text">Country:</strong> {country}</p>
                    <p><strong className="text-text">Document Type:</strong> {idType}</p>
                    <p className="truncate"><strong className="text-text">ID File URL:</strong> {idDocumentUrl}</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-elevated hover:bg-surface text-text font-bold text-xs px-6 py-3 rounded-xl transition-colors"
                  >
                    â† Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null} Submit KYC Application
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {submittedSuccess && (
        <div className="bg-card border border-success/30 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-success/10 text-success rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="font-heading font-black text-xl text-text">KYC Verification Submitted!</h3>
          <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
            Our compliance team will review your identity document within 24 hours. You will receive an instant in-app notification once approved.
          </p>
        </div>
      )}
    </div>
  );
}
