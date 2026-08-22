"use client";

import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation as useConvexMutation } from "convex/react";
import { GAME_FIELDS } from "@/lib/gameFields";
import { Plus, Trash2, Upload, AlertCircle, CheckCircle, Loader2, ImagePlus, X } from "lucide-react";

// Number of blank rows to start with
const INITIAL_ROWS = 10;

interface RowData {
  id: string;
  title: string;
  price: string;
  description: string;
  attrs: Record<string, string>;
  images: string[];         // committed convex storage IDs or URLs
  imageFiles: File[];       // local files queued for upload
  imagePreviews: string[];  // object URLs for preview
  uploadStatus: "idle" | "uploading" | "done" | "error";
}

function emptyRow(): RowData {
  return {
    id: Math.random().toString(36).slice(2),
    title: "",
    price: "",
    description: "",
    attrs: {},
    images: [],
    imageFiles: [],
    imagePreviews: [],
    uploadStatus: "idle",
  };
}

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
        if (width >= height) { height = Math.round((height / width) * MAX); width = MAX; }
        else { width = Math.round((width / height) * MAX); height = MAX; }
      }
      const c = document.createElement("canvas");
      c.width = width; c.height = height;
      c.getContext("2d")!.drawImage(img, 0, 0, width, height);
      c.toBlob((blob) => {
        if (!blob) { resolve(file); return; }
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg", lastModified: Date.now() }));
      }, "image/jpeg", 0.75);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export default function BulkUploadPage() {
  const games = useQuery(api.listings.getGames);
  const categories = useQuery(api.listings.getCategories);
  const bulkCreate = useMutation(api.admin.bulkCreateListings);
  const generateUploadUrl = useMutation(api.listings.generateUploadUrl);

  const [gameId, setGameId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [rows, setRows] = useState<RowData[]>(() => Array.from({ length: INITIAL_ROWS }, emptyRow));
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const selectedGame = games?.find((g) => g._id === gameId);
  const gameSlug = selectedGame?.slug === "bgmi" || selectedGame?.slug === "pubg-global" ? "pubg-mobile" : selectedGame?.slug ?? "";
  const gameConfig = GAME_FIELDS[gameSlug];
  // Show only the first 10 most important fields
  const visibleFields = gameConfig?.fields.slice(0, 10) ?? [];

  const updateRow = useCallback((id: string, patch: Partial<RowData>) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, ...patch } : r));
  }, []);

  const updateAttr = useCallback((rowId: string, key: string, val: string) => {
    setRows((prev) => prev.map((r) => r.id === rowId ? { ...r, attrs: { ...r.attrs, [key]: val } } : r));
  }, []);

  const addRows = () => setRows((p) => [...p, ...Array.from({ length: 5 }, emptyRow)]);
  const removeRow = (id: string) => setRows((p) => p.filter((r) => r.id !== id));

  // ── Per-row image handling ────────────────────────────────────────────────
  const handleRowImages = useCallback((rowId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setRows((prev) => prev.map((r) => {
      if (r.id !== rowId) return r;
      const newFiles = Array.from(files);
      const combined = [...r.imageFiles, ...newFiles].slice(0, 5);
      const previews = combined.map((f) => URL.createObjectURL(f));
      
      // Revoke old previews to avoid memory leaks
      r.imagePreviews.forEach((u) => URL.revokeObjectURL(u));
      return { ...r, imageFiles: combined, imagePreviews: previews, images: [], uploadStatus: "idle" };
    }));
  }, []);

  const removeRowImage = useCallback((rowId: string, imgIdx: number) => {
    setRows((prev) => prev.map((r) => {
      if (r.id !== rowId) return r;
      const files = r.imageFiles.filter((_, i) => i !== imgIdx);
      URL.revokeObjectURL(r.imagePreviews[imgIdx]);
      const previews = r.imagePreviews.filter((_, i) => i !== imgIdx);
      return { ...r, imageFiles: files, imagePreviews: previews };
    }));
  }, []);

  // ── Upload images for a single row ───────────────────────────────────────
  const uploadRowImages = async (row: RowData): Promise<string[]> => {
    if (row.imageFiles.length === 0) return [];
    const ids: string[] = [];
    for (const file of row.imageFiles) {
      const compressed = await compressImage(file);
      const url = await generateUploadUrl();
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": compressed.type }, body: compressed });
      if (!res.ok) throw new Error(`Image upload failed for row`);
      const { storageId } = await res.json();
      ids.push(storageId);
    }
    return ids;
  };

  // ── Submit all rows ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!gameId || !categoryId) {
      setFeedback({ type: "error", msg: "Please select a game and category first." });
      return;
    }
    const filledRows = rows.filter((r) => r.title.trim() && r.price.trim() && !isNaN(parseFloat(r.price)));
    if (filledRows.length === 0) {
      setFeedback({ type: "error", msg: "Fill in at least one row with a Title and Price." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      // Upload images for all rows that have files
      const listings = [];
      for (const row of filledRows) {
        updateRow(row.id, { uploadStatus: "uploading" });
        let imageIds: string[] = [];
        if (row.imageFiles.length > 0) {
          imageIds = await uploadRowImages(row);
        }
        updateRow(row.id, { uploadStatus: "done", images: imageIds });

        const attrs: Record<string, any> = {};
        for (const [k, v] of Object.entries(row.attrs)) {
          if (v) attrs[k] = isNaN(Number(v)) ? v : Number(v);
        }

        listings.push({
          title: row.title.trim(),
          description: row.description.trim() || `${selectedGame?.name ?? "Game"} account listing`,
          price: parseFloat(row.price),
          gameId: gameId as Id<"games">,
          categoryId: categoryId as Id<"categories">,
          deliveryMethod: "manual" as const,
          deliveryTime: "24 hours",
          images: imageIds.length > 0 ? imageIds : [selectedGame?.imageUrl ?? "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800"],
          attributes: Object.keys(attrs).length > 0 ? attrs : undefined,
          isSeeded: false,
        });
      }

      const inserted = await bulkCreate({ listings });
      setFeedback({ type: "success", msg: `✅ Successfully uploaded ${inserted.length} listings!` });
      // Reset filled rows
      setRows(Array.from({ length: INITIAL_ROWS }, emptyRow));
    } catch (e: any) {
      setFeedback({ type: "error", msg: e.message || "Upload failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-text outline-none focus:border-primary transition-all";

  return (
    <div className="container max-w-7xl py-8 sm:py-12 space-y-6">
      <div>
        <h1 className="font-heading font-black text-2xl text-text">Bulk Upload</h1>
        <p className="text-text-muted text-sm mt-1">
          Fill in rows below. Drag &amp; drop photos onto each row. Only rows with a title &amp; price will be submitted.
        </p>
      </div>

      {/* Game & Category selectors */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Game</label>
          <select
            value={gameId}
            onChange={(e) => { setGameId(e.target.value); setCategoryId(""); }}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-text outline-none focus:border-primary"
          >
            <option value="">Select a game...</option>
            {games?.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-text outline-none focus:border-primary"
          >
            <option value="">Select a category...</option>
            {categories?.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {gameId && (
        <>
          {/* Scrollable grid */}
          <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-elevated border-b border-border">
                    <th className="sticky left-0 bg-elevated px-3 py-2.5 text-left font-bold text-text-muted w-6 z-10">#</th>
                    <th className="px-3 py-2.5 text-left font-bold text-text-muted min-w-[180px]">Title <span className="text-danger">*</span></th>
                    <th className="px-3 py-2.5 text-left font-bold text-text-muted w-[90px]">Price (₹) <span className="text-danger">*</span></th>
                    {visibleFields.map((f) => (
                      <th key={f.key} className="px-3 py-2.5 text-left font-bold text-text-muted min-w-[110px]">
                        {f.icon} {f.label}
                      </th>
                    ))}
                    <th className="px-3 py-2.5 text-left font-bold text-text-muted min-w-[160px]">Photos</th>
                    <th className="px-3 py-2.5 text-left font-bold text-text-muted w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <BulkRow
                      key={row.id}
                      row={row}
                      idx={idx}
                      fields={visibleFields}
                      inputCls={inputCls}
                      onUpdate={updateRow}
                      onAttr={updateAttr}
                      onImages={handleRowImages}
                      onRemoveImage={removeRowImage}
                      onRemoveRow={removeRow}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={addRows} className="flex items-center gap-2 px-4 py-2 bg-card border border-border hover:border-primary/40 rounded-xl text-sm font-bold text-text transition-colors">
              <Plus size={15} /> Add 5 More Rows
            </button>
            <span className="text-xs text-text-muted">{rows.filter((r) => r.title && r.price).length} / {rows.length} rows filled</span>
          </div>

          {feedback && (
            <div className={`p-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${feedback.type === "success" ? "bg-success/10 text-success border border-success/20" : "bg-danger/10 text-danger border border-danger/20"}`}>
              {feedback.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {feedback.msg}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3.5 bg-primary hover:opacity-90 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Uploading all rows…</> : <><Upload size={16} /> Publish All Listings</>}
          </button>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual row component
// ─────────────────────────────────────────────────────────────────────────────
interface BulkRowProps {
  row: RowData;
  idx: number;
  fields: any[];
  inputCls: string;
  onUpdate: (id: string, patch: Partial<RowData>) => void;
  onAttr: (rowId: string, key: string, val: string) => void;
  onImages: (rowId: string, files: FileList | null) => void;
  onRemoveImage: (rowId: string, idx: number) => void;
  onRemoveRow: (id: string) => void;
}

function BulkRow({ row, idx, fields, inputCls, onUpdate, onAttr, onImages, onRemoveImage, onRemoveRow }: BulkRowProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const hasContent = row.title || row.price;

  return (
    <tr
      className={`border-b border-border transition-colors ${hasContent ? "bg-card" : "bg-background hover:bg-card/50"} ${row.uploadStatus === "done" ? "opacity-60" : ""}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onImages(row.id, e.dataTransfer.files);
      }}
    >
      {/* Row number */}
      <td className="sticky left-0 bg-inherit px-3 py-2 text-text-muted font-bold z-10">
        {row.uploadStatus === "uploading" ? <Loader2 size={12} className="animate-spin text-primary" /> : idx + 1}
      </td>

      {/* Title */}
      <td className="px-2 py-1.5">
        <input
          value={row.title}
          onChange={(e) => onUpdate(row.id, { title: e.target.value })}
          placeholder="Account title…"
          className={inputCls}
        />
      </td>

      {/* Price */}
      <td className="px-2 py-1.5">
        <input
          value={row.price}
          onChange={(e) => onUpdate(row.id, { price: e.target.value })}
          placeholder="999"
          type="number"
          min="0"
          className={inputCls}
        />
      </td>

      {/* Game-specific fields */}
      {fields.map((f) => (
        <td key={f.key} className="px-2 py-1.5">
          {f.type === "select" ? (
            <select
              value={row.attrs[f.key] ?? ""}
              onChange={(e) => onAttr(row.id, f.key, e.target.value)}
              className={inputCls}
            >
              <option value="">—</option>
              {f.options?.map((o: string) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : f.type === "toggle" ? (
            <select
              value={row.attrs[f.key] ?? ""}
              onChange={(e) => onAttr(row.id, f.key, e.target.value)}
              className={inputCls}
            >
              <option value="">—</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          ) : (
            <input
              value={row.attrs[f.key] ?? ""}
              onChange={(e) => onAttr(row.id, f.key, e.target.value)}
              placeholder={f.placeholder ?? ""}
              type={f.type === "number" ? "number" : "text"}
              className={inputCls}
            />
          )}
        </td>
      ))}

      {/* Images */}
      <td className="px-2 py-1.5">
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onImages(row.id, e.target.files)} />
        {row.imagePreviews.length === 0 ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors border border-dashed border-border hover:border-primary/50 rounded-lg px-2 py-1.5 text-[11px] w-full justify-center"
          >
            <ImagePlus size={13} /> Drop or click
          </button>
        ) : (
          <div className="flex gap-1 flex-wrap">
            {row.imagePreviews.map((src, i) => (
              <div key={i} className="relative group w-10 h-10 rounded-md overflow-hidden border border-border flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => onRemoveImage(row.id, i)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            {row.imagePreviews.length < 5 && (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-10 h-10 rounded-md border border-dashed border-border hover:border-primary/50 flex items-center justify-center text-text-muted hover:text-primary transition-colors flex-shrink-0"
              >
                <Plus size={12} />
              </button>
            )}
          </div>
        )}
      </td>

      {/* Delete row */}
      <td className="px-2 py-1.5">
        <button onClick={() => onRemoveRow(row.id)} className="text-text-muted hover:text-danger transition-colors">
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  );
}
