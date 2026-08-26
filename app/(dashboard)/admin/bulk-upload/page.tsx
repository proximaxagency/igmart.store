"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Plus, Trash2, CheckCircle2, AlertCircle, Layers, Loader2,
  Sparkles, Image as ImageIcon, Upload, X, FileSpreadsheet,
  ChevronDown, ChevronUp, Info
} from "lucide-react";

// ────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────
interface RowImage {
  id: string;
  preview: string;       // blob URL for display
  storageId?: string;    // Convex storage ID after upload
  status: "idle" | "uploading" | "done" | "error";
  error?: string;
}

interface BulkRow {
  id: string;
  title: string;
  description: string;
  price: string;
  deliveryMethod: "automatic" | "manual" | "coordinate";
  deliveryTime: string;
  autoDeliveryData: string;
  region: string;
  rank: string;
  images: RowImage[];
  expanded: boolean;
}

function makeRow(): BulkRow {
  return {
    id: Math.random().toString(36).slice(2),
    title: "",
    description: "",
    price: "",
    deliveryMethod: "manual",
    deliveryTime: "24 hours",
    autoDeliveryData: "",
    region: "",
    rank: "",
    images: [],
    expanded: true,
  };
}

// ────────────────────────────────────────────────────────
// Image compressor (canvas, 1200px max, 80% JPEG)
// ────────────────────────────────────────────────────────
function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") { resolve(file); return; }
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width >= height) { height = Math.round(height / width * MAX); width = MAX; }
        else { width = Math.round(width / height * MAX); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => { if (!blob) { resolve(file); return; } resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" })); },
        "image/jpeg", 0.80
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

// ────────────────────────────────────────────────────────
// Row Image Uploader (mini, inline)
// ────────────────────────────────────────────────────────
function RowImageUploader({
  images,
  onImagesChange,
  generateUploadUrl,
}: {
  images: RowImage[];
  onImagesChange: (updater: RowImage[] | ((prev: RowImage[]) => RowImage[])) => void;
  generateUploadUrl: () => Promise<string>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const MAX = 8;

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    const newImgs: RowImage[] = [];

    for (const file of fileList) {
      if (images.length + newImgs.length >= MAX) break;
      if (!file.type.startsWith("image/")) continue;
      const preview = URL.createObjectURL(file);
      const id = Math.random().toString(36).slice(2);
      newImgs.push({ id, preview, status: "uploading" });
    }

    if (newImgs.length === 0) return;
    onImagesChange((prev) => [...prev, ...newImgs]);

    // Upload each image asynchronously
    for (let i = 0; i < newImgs.length; i++) {
      const file = fileList[i];
      const img = newImgs[i];
      try {
        const compressed = await compressImage(file);
        const url = await generateUploadUrl();
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": compressed.type },
          body: compressed,
        });
        if (!res.ok) throw new Error("Upload failed");
        const { storageId } = await res.json();
        onImagesChange((prev) =>
          prev.map((im) => (im.id === img.id ? { ...im, storageId, status: "done" } : im))
        );
      } catch (err: any) {
        onImagesChange((prev) =>
          prev.map((im) => (im.id === img.id ? { ...im, status: "error", error: err.message } : im))
        );
      }
    }
  }, [images.length, onImagesChange, generateUploadUrl]);

  const removeImage = (id: string) => {
    onImagesChange((prev) => prev.filter((img) => img.id !== id));
  };

  const doneCount = images.filter((i) => i.status === "done").length;
  const meetsMin = doneCount >= 4;

  return (
    <div className="space-y-3">
      {/* Upload Zone & Thumbnails */}
      <div className="flex flex-wrap items-center gap-2.5">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-elevated flex-shrink-0 group shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.preview} alt="" className="w-full h-full object-cover object-top" />
            {img.status === "uploading" && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                <Loader2 size={16} className="animate-spin text-white" />
              </div>
            )}
            {img.status === "error" && (
              <div className="absolute inset-0 bg-danger/70 flex items-center justify-center" title={img.error}>
                <AlertCircle size={16} className="text-white" />
              </div>
            )}
            {img.status === "done" && (
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center shadow">
                <CheckCircle2 size={10} className="text-white" />
              </div>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
              className="absolute top-1 left-1 w-5 h-5 bg-black/80 hover:bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove screenshot"
            >
              <X size={10} />
            </button>
          </div>
        ))}

        {/* Add Screenshot Button */}
        {images.length < MAX && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-elevated/40 hover:bg-primary/5 flex flex-col items-center justify-center gap-1 transition-all text-text-muted hover:text-primary cursor-pointer"
          >
            <Upload size={16} />
            <span className="text-[9px] font-bold">ADD</span>
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Validation status badge */}
      <div className={`text-[11px] font-bold flex items-center gap-1.5 ${meetsMin ? "text-success" : "text-warning"}`}>
        {meetsMin ? (
          <>
            <CheckCircle2 size={13} /> {doneCount} screenshots ready (Min. 4 satisfied)
          </>
        ) : (
          <>
            <AlertCircle size={13} /> {doneCount} of 4 minimum screenshots uploaded
          </>
        )}
        {images.some((i) => i.status === "uploading") && (
          <span className="text-text-muted font-normal text-[10px] animate-pulse">(uploading...)</span>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// Main Bulk Upload Page
// ────────────────────────────────────────────────────────
export default function BulkUploadPage() {
  const games = useQuery((api.listings as any).getGames) as any[] | undefined;
  const categories = useQuery((api.listings as any).getCategories) as any[] | undefined;
  const bulkCreate = useMutation((api.admin as any).bulkCreateListings);
  const generateUploadUrl = useMutation((api.listings as any).generateUploadUrl);

  const [gameId, setGameId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [rows, setRows] = useState<BulkRow[]>([makeRow()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const selectedGame = useMemo(() => games?.find((g) => g._id === gameId), [games, gameId]);
  const selectedCategory = useMemo(() => categories?.find((c) => c._id === categoryId), [categories, categoryId]);

  // Row helpers
  const addRow = () => setRows((r) => [...r, makeRow()]);

  const removeRow = (id: string) => {
    if (rows.length === 1) {
      setRows([makeRow()]);
      return;
    }
    setRows((r) => r.filter((row) => row.id !== id));
  };

  const updateRow = (id: string, patch: Partial<BulkRow>) =>
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const updateRowImages = (id: string, updater: RowImage[] | ((prev: RowImage[]) => RowImage[])) =>
    setRows((r) =>
      r.map((row) => {
        if (row.id !== id) return row;
        const newImgs = typeof updater === "function" ? updater(row.images) : updater;
        return { ...row, images: newImgs };
      })
    );

  const duplicateRow = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const dup: BulkRow = { ...row, id: Math.random().toString(36).slice(2), images: [] };
    setRows((r) => {
      const idx = r.findIndex((x) => x.id === id);
      const next = [...r];
      next.splice(idx + 1, 0, dup);
      return next;
    });
  };

  // Validate a row
  const validateRow = (row: BulkRow) => {
    const errors: string[] = [];
    if (!row.title.trim()) errors.push("Title required");
    if (!row.description.trim()) errors.push("Description required");
    const price = parseFloat(row.price);
    if (isNaN(price) || price <= 0) errors.push("Valid price required");
    const doneImages = row.images.filter((i) => i.status === "done");
    if (doneImages.length < 4) errors.push(`Need ≥4 screenshots (have ${doneImages.length})`);
    return errors;
  };

  // Summary stats
  const validRows = rows.filter((row) => validateRow(row).length === 0);
  const invalidRows = rows.filter((row) => validateRow(row).length > 0);
  const anyUploading = rows.some((row) => row.images.some((i) => i.status === "uploading"));

  const handlePublish = async () => {
    if (!gameId || !categoryId) {
      setFeedback({ type: "error", msg: "Please select a Game and Category first." });
      return;
    }
    if (validRows.length === 0) {
      setFeedback({ type: "error", msg: "No valid rows to publish. Please check row errors above." });
      return;
    }
    if (anyUploading) {
      setFeedback({ type: "error", msg: "Images are still uploading. Please wait." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    setProgress({ done: 0, total: validRows.length });

    try {
      const BATCH = 25;
      let done = 0;
      for (let i = 0; i < validRows.length; i += BATCH) {
        const chunk = validRows.slice(i, i + BATCH);
        const payload = chunk.map((row) => ({
          title: row.title.trim(),
          description: row.description.trim(),
          price: parseFloat(row.price),
          gameId: gameId as Id<"games">,
          categoryId: categoryId as Id<"categories">,
          deliveryMethod: row.deliveryMethod,
          deliveryTime: row.deliveryTime,
          autoDeliveryData: row.autoDeliveryData || undefined,
          images: row.images.filter((img) => img.status === "done" && img.storageId).map((img) => img.storageId!),
          attributes: {
            ...(row.region ? { region: row.region } : {}),
            ...(row.rank ? { rank: row.rank } : {}),
          },
          isSeeded: false,
        }));
        await bulkCreate({ listings: payload });
        done += chunk.length;
        setProgress({ done, total: validRows.length });
      }
      setFeedback({
        type: "success",
        msg: `Successfully published ${done} listings to ${selectedGame?.name || "catalog"}!`,
      });
      setRows([makeRow()]);
    } catch (err: any) {
      setFeedback({ type: "error", msg: err?.message || "Bulk publish failed. Please try again." });
    } finally {
      setIsSubmitting(false);
      setProgress(null);
    }
  };

  const inputCls = "w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-text outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-text-muted/50";

  return (
    <div className="space-y-6 max-w-7xl pb-24">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
              Staff Portal
            </span>
            <span className="text-[10px] bg-success/10 text-success font-bold px-2 py-0.5 rounded-md border border-success/20">
              Interactive Grid
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-text flex items-center gap-2.5">
            <FileSpreadsheet className="text-primary" size={28} /> Bulk Listing Importer
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Create listings in a spreadsheet table, upload minimum 4 direct screenshots per row, and publish all at once.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted bg-elevated border border-border rounded-xl px-3.5 py-2.5">
          <Info size={14} className="text-primary flex-shrink-0" />
          <span><strong className="text-text">Minimum 4 screenshots</strong> required per listing</span>
        </div>
      </div>

      {/* ── Feedback Banner ── */}
      {feedback && (
        <div className={`flex items-start gap-3 p-4 rounded-xl text-sm font-semibold border ${
          feedback.type === "success" ? "bg-success/10 text-success border-success/20" : "bg-danger/10 text-danger border-danger/20"
        }`}>
          {feedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* ── Step 1: Game & Category Selection ── */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <Layers size={17} className="text-primary" />
          <h2 className="font-heading font-bold text-base text-text">1. Target Game & Category</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1.5">Game *</label>
            <select
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-3 text-sm text-text font-semibold focus:outline-none focus:border-primary/60 transition-colors"
            >
              <option value="">-- Choose Game --</option>
              {games?.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1.5">Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-3 text-sm text-text font-semibold focus:outline-none focus:border-primary/60 transition-colors"
            >
              <option value="">-- Choose Category --</option>
              {categories?.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Step 2: Spreadsheet Rows ── */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Table header bar */}
        <div className="bg-elevated/60 border-b border-border px-5 py-3.5 flex items-center justify-between">
          <h2 className="font-heading font-bold text-base text-text flex items-center gap-2">
            <FileSpreadsheet size={17} className="text-primary" />
            2. Listing Rows
            <span className="ml-2 text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
              {rows.length} row{rows.length !== 1 ? "s" : ""}
            </span>
          </h2>
          <div className="flex items-center gap-2 text-xs">
            {validRows.length > 0 && (
              <span className="bg-success/10 text-success border border-success/20 font-bold px-2.5 py-1 rounded-lg">
                ✓ {validRows.length} ready
              </span>
            )}
            {invalidRows.length > 0 && (
              <span className="bg-warning/10 text-warning border border-warning/20 font-bold px-2.5 py-1 rounded-lg">
                ⚠ {invalidRows.length} incomplete
              </span>
            )}
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {rows.map((row, idx) => {
            const errors = validateRow(row);
            const isValid = errors.length === 0;
            const doneImgs = row.images.filter((i) => i.status === "done").length;

            return (
              <div key={row.id} className={`transition-colors ${isValid ? "" : "bg-warning/[0.02]"}`}>
                {/* Collapsed / Row Bar */}
                <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-border/40 bg-elevated/20">
                  <span className={`w-6 h-6 rounded-md text-[10px] font-black flex items-center justify-center flex-shrink-0 ${
                    isValid ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                  }`}>
                    {idx + 1}
                  </span>

                  <span className="flex-1 text-sm font-semibold text-text truncate min-w-0">
                    {row.title || <span className="text-text-muted font-normal italic">Untitled listing...</span>}
                  </span>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                    doneImgs >= 4 ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"
                  }`}>
                    {doneImgs}/4+ imgs
                  </span>

                  {row.price && (
                    <span className="text-[11px] font-bold bg-elevated border border-border text-text px-2 py-0.5 rounded-full flex-shrink-0">
                      ${parseFloat(row.price || "0").toFixed(2)}
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => duplicateRow(row.id)}
                      title="Duplicate row"
                      className="w-7 h-7 rounded-lg bg-elevated hover:bg-primary/10 hover:text-primary border border-border text-text-muted flex items-center justify-center transition-colors text-[11px] font-black cursor-pointer"
                    >
                      ⊕
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      title="Delete row"
                      className="w-7 h-7 rounded-lg hover:bg-danger/10 hover:text-danger border border-border bg-elevated text-text-muted flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateRow(row.id, { expanded: !row.expanded })}
                      className="w-7 h-7 rounded-lg bg-elevated hover:bg-border border border-border text-text-muted flex items-center justify-center transition-colors cursor-pointer"
                    >
                      {row.expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Form */}
                {row.expanded && (
                  <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-card">
                    {/* Left: Text & Pricing Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">
                          Listing Title <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          value={row.title}
                          onChange={(e) => updateRow(row.id, { title: e.target.value })}
                          placeholder="e.g. TH16 Clash of Clans — BK90 AQ90 Heroes"
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">
                          Description <span className="text-danger">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={row.description}
                          onChange={(e) => updateRow(row.id, { description: e.target.value })}
                          placeholder="Include account level, heroes, skins, warranty..."
                          className={`${inputCls} resize-y`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">
                            Price (USD) <span className="text-danger">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-bold text-sm">$</span>
                            <input
                              type="number"
                              min="1"
                              step="0.01"
                              value={row.price}
                              onChange={(e) => updateRow(row.id, { price: e.target.value })}
                              placeholder="0.00"
                              className={`${inputCls} pl-7`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">
                            Delivery Method
                          </label>
                          <select
                            value={row.deliveryMethod}
                            onChange={(e) => updateRow(row.id, { deliveryMethod: e.target.value as any })}
                            className={inputCls}
                          >
                            <option value="manual">Manual Transfer</option>
                            <option value="automatic">Automatic (Instant)</option>
                            <option value="coordinate">Coordinate with Buyer</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Delivery Time</label>
                          <select
                            value={row.deliveryTime}
                            onChange={(e) => updateRow(row.id, { deliveryTime: e.target.value })}
                            className={inputCls}
                          >
                            <option value="Instant">Instant</option>
                            <option value="1 hour">Within 1 hour</option>
                            <option value="24 hours">Within 24 hours</option>
                            <option value="1-3 days">1-3 days</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Region / Server</label>
                          <input
                            type="text"
                            value={row.region}
                            onChange={(e) => updateRow(row.id, { region: e.target.value })}
                            placeholder="Global / Asia / NA"
                            className={inputCls}
                          />
                        </div>
                      </div>

                      {row.deliveryMethod === "automatic" && (
                        <div>
                          <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">
                            Account Credentials (Auto Delivery)
                          </label>
                          <input
                            type="text"
                            value={row.autoDeliveryData}
                            onChange={(e) => updateRow(row.id, { autoDeliveryData: e.target.value })}
                            placeholder="username:password / login details"
                            className={inputCls}
                          />
                        </div>
                      )}
                    </div>

                    {/* Right: Direct Screenshot Uploader */}
                    <div className="bg-elevated/30 border border-border rounded-2xl p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <ImageIcon size={16} className="text-primary" />
                          <label className="text-xs font-bold text-text uppercase tracking-wider">
                            Direct Screenshots <span className="text-danger">*</span>
                          </label>
                        </div>
                        <p className="text-xs text-text-muted mb-4">
                          Select and upload files directly from your device. Minimum 4 screenshots required.
                        </p>

                        <RowImageUploader
                          images={row.images}
                          onImagesChange={(updater) => updateRowImages(row.id, updater)}
                          generateUploadUrl={generateUploadUrl}
                        />
                      </div>

                      {errors.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-1.5">
                          {errors.map((err, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-[11px] font-bold text-danger bg-danger/10 border border-danger/20 px-2.5 py-0.5 rounded-md">
                              <AlertCircle size={10} /> {err}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Row Button */}
        <div className="p-4 border-t border-border bg-elevated/20">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-hover border border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Plus size={16} /> Add Another Listing Row
          </button>
        </div>
      </div>

      {/* ── Sticky Bottom Publishing Bar ── */}
      <div className="sticky bottom-4 z-20 bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm">
          {progress ? (
            <span className="font-bold text-text flex items-center gap-2">
              <Loader2 className="animate-spin text-primary" size={16} />
              Publishing {progress.done} of {progress.total} listings...
            </span>
          ) : (
            <span className="text-text-muted">
              <span className="font-black text-text">{validRows.length}</span> ready to publish ·{" "}
              <span className="font-black text-warning">{invalidRows.length}</span> incomplete ·{" "}
              Target: <span className="font-bold text-primary">{selectedGame?.name || "Select Game"}</span> → <span className="font-semibold text-text">{selectedCategory?.name || "Select Category"}</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handlePublish}
          disabled={isSubmitting || validRows.length === 0 || !gameId || !categoryId || anyUploading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-xl font-heading font-black text-sm text-white shadow-lg shadow-primary/25 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          style={{ background: "var(--gradient-brand)" }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={17} />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <Sparkles size={17} />
              <span>Publish {validRows.length} Listing{validRows.length !== 1 ? "s" : ""}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
