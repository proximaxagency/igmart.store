"use client";

import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "@convex-dev/auth/react";
import {
  ShieldCheck, CheckCircle2, AlertCircle, FileText, Upload, Clock,
  Loader2, Eye, X, Image as ImageIcon, Camera, Lock, ArrowRight, ArrowLeft
} from "lucide-react";
import { ConvexImage } from "@/components/shared/ConvexImage";

// ── Client-side high-fidelity compression for ID documents ───────────────────
function compressIdImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
      resolve(file);
      return;
    }
    const img = document.createElement("img");
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_SIDE = 1800; // High resolution to keep fine text on IDs legible
      let { width, height } = img;
      if (width > MAX_SIDE || height > MAX_SIDE) {
        if (width >= height) {
          height = Math.round((height / width) * MAX_SIDE);
          width = MAX_SIDE;
        } else {
          width = Math.round((width / height) * MAX_SIDE);
          height = MAX_SIDE;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(
            new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            })
          );
        },
        "image/jpeg",
        0.88
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.src = objectUrl;
  });
}

// Convert a file to Base64 string fallback
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// ── KYC Document Upload Component ───────────────────────────────────────────
interface DocumentUploaderProps {
  label: string;
  hint: string;
  required?: boolean;
  value: string;
  onChange: (storageIdOrUrl: string) => void;
  onPreviewModal: (url: string, title: string) => void;
}

function DocumentUploader({
  label,
  hint,
  required,
  value,
  onChange,
  onPreviewModal,
}: DocumentUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localBlob, setLocalBlob] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.listings.generateUploadUrl);

  const handleFileProcess = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setUploadError("Please upload an image file (JPG, PNG, or WEBP).");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setUploadError("Image file size must be less than 15MB.");
        return;
      }

      setUploadError(null);
      setIsUploading(true);

      const previewUrl = URL.createObjectURL(file);
      setLocalBlob(previewUrl);

      try {
        const compressed = await compressIdImage(file);

        // Upload to Convex storage
        let storageId = "";
        try {
          const postUrl = await generateUploadUrl();
          const res = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": compressed.type },
            body: compressed,
          });
          if (res.ok) {
            const data = await res.json();
            storageId = data.storageId;
          }
        } catch (storageErr) {
          console.warn("[KYC] Storage upload fallback:", storageErr);
        }

        // If storage uploaded successfully, use the storageId. Otherwise fallback to base64
        if (storageId) {
          onChange(storageId);
        } else {
          const b64 = await fileToBase64(compressed);
          onChange(b64);
        }
      } catch (err: any) {
        setUploadError(err?.message || "Failed to process image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [generateUploadUrl, onChange]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const removeDoc = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setLocalBlob(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasValue = Boolean(value || localBlob);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">
          {label} {required && <span className="text-primary">*</span>}
        </label>
        {hasValue && (
          <span className="text-[10px] font-bold text-success flex items-center gap-1">
            <CheckCircle2 size={12} /> Ready
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileProcess(e.target.files[0]);
          }
        }}
      />

      {hasValue ? (
        /* Preview Card */
        <div className="relative bg-surface border border-border hover:border-primary/40 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              onClick={() => onPreviewModal(localBlob || value, label)}
              className="relative w-16 h-14 rounded-xl overflow-hidden bg-elevated border border-border shrink-0 cursor-pointer group"
            >
              <ConvexImage
                src={localBlob || value}
                alt="Uploaded Document"
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Eye size={16} />
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-text flex items-center gap-1.5 truncate">
                <Lock size={12} className="text-success shrink-0" />
                <span>Document Image Secured</span>
              </p>
              <p className="text-[11px] text-text-muted mt-0.5 truncate">
                Encrypted storage Â· Ready for compliance review
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onPreviewModal(localBlob || value, label)}
              className="p-2 rounded-xl bg-elevated hover:bg-border text-text transition-colors text-xs font-bold flex items-center gap-1"
              title="View full document"
            >
              <Eye size={14} />
              <span className="hidden sm:inline">Inspect</span>
            </button>
            <button
              type="button"
              onClick={removeDoc}
              className="p-2 rounded-xl bg-danger/10 hover:bg-danger/20 text-danger transition-colors text-xs font-bold flex items-center gap-1"
              title="Remove and upload different image"
            >
              <X size={14} />
              <span className="hidden sm:inline">Change</span>
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone Card */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none ${
            dragOver
              ? "border-primary bg-primary/10 scale-[1.01]"
              : "border-border hover:border-primary/50 bg-surface hover:bg-elevated/40"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-primary" size={28} />
              <p className="text-xs font-bold text-text">Securing & Uploading Document...</p>
              <p className="text-[11px] text-text-muted">High-resolution image optimization</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Camera size={22} />
              </div>
              <p className="text-xs font-bold text-text">
                Click to upload image or <span className="text-primary">take a photo</span>
              </p>
              <p className="text-[11px] text-text-muted mt-1 max-w-xs">{hint}</p>
              <span className="mt-3 text-[10px] font-mono bg-elevated px-2.5 py-1 rounded-full text-text-muted border border-border">
                JPG, PNG, WEBP up to 15MB
              </span>
            </>
          )}
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-danger flex items-center gap-1.5 mt-1 font-medium">
          <AlertCircle size={13} />
          {uploadError}
        </p>
      )}
    </div>
  );
}

// ── Main Page Component ─────────────────────────────────────────────────────
export default function SellerVerificationPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
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
  const [previewModal, setPreviewModal] = useState<{ url: string; title: string } | null>(null);

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
      {/* ── Page Header ── */}
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl text-text flex items-center gap-2">
          <ShieldCheck className="text-primary" size={26} /> Seller Identity & KYC Verification
        </h1>
        <p className="text-text-muted text-xs mt-1">
          Upload official government identification to unlock verified seller badges, lower escrow fees, and instant crypto & wire payouts.
        </p>
      </div>

      {/* ── Verification Status Card (If application exists) ── */}
      {kycStatus ? (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shrink-0 ${
                  kycStatus.status === "approved"
                    ? "bg-success/10 text-success border border-success/20"
                    : kycStatus.status === "rejected"
                    ? "bg-danger/10 text-danger border border-danger/20"
                    : "bg-warning/10 text-warning border border-warning/20"
                }`}
              >
                {kycStatus.status === "approved" ? <CheckCircle2 size={24} /> : <Clock size={24} />}
              </div>
              <div>
                <p className="font-heading font-bold text-lg text-text flex items-center gap-2">
                  Status: <span className="uppercase text-primary">{kycStatus.status.replace("_", " ")}</span>
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Application submitted on {new Date(kycStatus.createdAt).toLocaleDateString()}
                </p>
                {kycStatus.adminNotes && (
                  <p className="text-xs text-warning mt-2 bg-warning/10 p-2.5 rounded-xl border border-warning/20">
                    Compliance Note: {kycStatus.adminNotes}
                  </p>
                )}
              </div>
            </div>

            {/* Document Thumbnail Preview for Seller */}
            {kycStatus.idDocumentUrl && (
              <div className="flex items-center gap-3 bg-surface border border-border rounded-xl p-2.5">
                <div
                  onClick={() => setPreviewModal({ url: kycStatus.idDocumentUrl, title: `${kycStatus.idType} Document` })}
                  className="relative w-14 h-12 rounded-lg overflow-hidden bg-elevated border border-border cursor-pointer group shrink-0"
                >
                  <ConvexImage
                    src={kycStatus.idDocumentUrl}
                    alt="Uploaded ID"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Eye size={14} />
                  </div>
                </div>
                <div className="text-left text-xs pr-2">
                  <p className="font-bold text-text">{kycStatus.idType}</p>
                  <button
                    type="button"
                    onClick={() => setPreviewModal({ url: kycStatus.idDocumentUrl, title: `${kycStatus.idType} Document` })}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    View Document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* ── KYC Stepper Form ── */}
      {(!kycStatus || kycStatus.status === "rejected") && !submittedSuccess && (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary font-bold" : "text-text-muted"}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? "bg-primary text-white shadow-md shadow-primary/25" : "bg-elevated border border-border"
              }`}>1</span>
              <span className="text-xs hidden sm:inline">Personal Details</span>
            </div>
            <div className="h-0.5 flex-1 bg-border mx-4" />
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary font-bold" : "text-text-muted"}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? "bg-primary text-white shadow-md shadow-primary/25" : "bg-elevated border border-border"
              }`}>2</span>
              <span className="text-xs hidden sm:inline">Upload Images</span>
            </div>
            <div className="h-0.5 flex-1 bg-border mx-4" />
            <div className={`flex items-center gap-2 ${step >= 3 ? "text-primary font-bold" : "text-text-muted"}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 3 ? "bg-primary text-white shadow-md shadow-primary/25" : "bg-elevated border border-border"
              }`}>3</span>
              <span className="text-xs hidden sm:inline">Review & Submit</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── STEP 1: Personal Details ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Legal Full Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full legal name exactly as shown on government ID"
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-xs text-text outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Country of Residence <span className="text-primary">*</span>
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-xs text-text outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Other">Other Country</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => fullName && setStep(2)}
                    disabled={!fullName.trim()}
                    className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-6 py-3 rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-primary/20"
                  >
                    <span>Next: Upload ID Images</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Upload Images (Direct File / Photo) ── */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Select Document Type <span className="text-primary">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {["Passport", "National ID", "Driver License"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setIdType(type)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                          idType === type
                            ? "bg-primary/10 border-primary text-primary shadow-sm"
                            : "bg-surface border-border text-text hover:border-primary/40"
                        }`}
                      >
                        {type === "Driver License" ? "Driver's License" : type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Government ID Image Uploader */}
                <DocumentUploader
                  label={`Government ${idType === "Driver License" ? "Driver's License" : idType} Photo / Image`}
                  hint="Upload a clear, readable photo of your ID document. Ensure all 4 edges are visible with no glare."
                  required
                  value={idDocumentUrl}
                  onChange={setIdDocumentUrl}
                  onPreviewModal={(url, title) => setPreviewModal({ url, title })}
                />

                {/* Optional Address Proof Image Uploader */}
                <DocumentUploader
                  label="Proof of Address Document (Optional)"
                  hint="Utility bill, bank statement, or official government letter dated within the last 3 months."
                  value={addressProofUrl}
                  onChange={setAddressProofUrl}
                  onPreviewModal={(url, title) => setPreviewModal({ url, title })}
                />

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-elevated hover:bg-border text-text font-bold text-xs px-6 py-3 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => idDocumentUrl && setStep(3)}
                    disabled={!idDocumentUrl}
                    className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-6 py-3 rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-primary/20"
                  >
                    <span>Next: Review Application</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Review & Submit ── */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                  <h3 className="font-heading font-bold text-sm text-text flex items-center gap-2">
                    <ShieldCheck size={18} className="text-primary" />
                    Review Identity Verification Application
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-card border border-border p-3.5 rounded-xl">
                      <span className="text-[10px] text-text-muted uppercase font-bold">Applicant Legal Name</span>
                      <p className="font-bold text-text mt-0.5">{fullName}</p>
                    </div>

                    <div className="bg-card border border-border p-3.5 rounded-xl">
                      <span className="text-[10px] text-text-muted uppercase font-bold">Country</span>
                      <p className="font-bold text-text mt-0.5">{country}</p>
                    </div>

                    <div className="bg-card border border-border p-3.5 rounded-xl">
                      <span className="text-[10px] text-text-muted uppercase font-bold">Document Type</span>
                      <p className="font-bold text-text mt-0.5">{idType}</p>
                    </div>

                    <div className="bg-card border border-border p-3.5 rounded-xl">
                      <span className="text-[10px] text-text-muted uppercase font-bold">Security Standard</span>
                      <p className="font-bold text-success mt-0.5 flex items-center gap-1">
                        <Lock size={12} /> AES-256 Cloud Vault
                      </p>
                    </div>
                  </div>

                  {/* Document Image Thumbnails in Review Step */}
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2.5">
                      Attached Document Images
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* ID Document Preview */}
                      <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                        <div
                          onClick={() => setPreviewModal({ url: idDocumentUrl, title: `${idType} Image` })}
                          className="relative w-16 h-14 rounded-lg overflow-hidden bg-elevated border border-border cursor-pointer group shrink-0"
                        >
                          <ConvexImage
                            src={idDocumentUrl}
                            alt="Primary ID Image"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Eye size={14} />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-text truncate">Government {idType}</p>
                          <button
                            type="button"
                            onClick={() => setPreviewModal({ url: idDocumentUrl, title: `${idType} Image` })}
                            className="text-[11px] text-primary hover:underline font-semibold"
                          >
                            Inspect full size
                          </button>
                        </div>
                      </div>

                      {/* Optional Address Proof Preview */}
                      {addressProofUrl ? (
                        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                          <div
                            onClick={() => setPreviewModal({ url: addressProofUrl, title: "Address Proof Image" })}
                            className="relative w-16 h-14 rounded-lg overflow-hidden bg-elevated border border-border cursor-pointer group shrink-0"
                          >
                            <ConvexImage
                              src={addressProofUrl}
                              alt="Address Proof Image"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <Eye size={14} />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-text truncate">Address Proof Document</p>
                            <button
                              type="button"
                              onClick={() => setPreviewModal({ url: addressProofUrl, title: "Address Proof Image" })}
                              className="text-[11px] text-primary hover:underline font-semibold"
                            >
                              Inspect full size
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-card/50 border border-dashed border-border rounded-xl p-3 flex items-center text-text-muted text-xs">
                          No address proof attached (optional)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-elevated hover:bg-border text-text font-bold text-xs px-6 py-3 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md shadow-primary/20 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                    <span>Submit KYC Application</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ── Success Screen ── */}
      {submittedSuccess && (
        <div className="bg-card border border-success/30 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-sm animate-in fade-in">
          <div className="w-16 h-16 bg-success/10 text-success rounded-2xl flex items-center justify-center mx-auto border border-success/20">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="font-heading font-black text-2xl text-text">KYC Verification Submitted!</h3>
          <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
            Your document images have been securely transmitted to our compliance verification vault. Our moderation team reviews applications within 24 hours.
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                setSubmittedSuccess(false);
                setStep(1);
              }}
              className="px-5 py-2.5 rounded-xl bg-elevated hover:bg-border text-text text-xs font-bold border border-border transition-colors cursor-pointer"
            >
              Done & Return
            </button>
          </div>
        </div>
      )}

      {/* ── Full Size Image Inspection Lightbox Modal ── */}
      {previewModal && (
        <div
          onClick={() => setPreviewModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h4 className="font-heading font-bold text-sm text-text flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                {previewModal.title}
              </h4>
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="p-1.5 rounded-lg hover:bg-elevated text-text-muted hover:text-text transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[75vh] bg-black/40">
              <ConvexImage
                src={previewModal.url}
                alt={previewModal.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
