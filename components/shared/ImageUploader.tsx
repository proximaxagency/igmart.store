"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Upload, X, ImageIcon, Loader2, AlertCircle } from "lucide-react";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  className?: string;
  label?: string;
}

interface UploadingFile {
  id: string;
  name: string;
  preview: string;
  progress: "uploading" | "done" | "error";
  error?: string;
}

// ── Client-side compression via Canvas ───────────────────────────────────────
function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
      resolve(file);
      return;
    }
    const img = document.createElement("img");
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_SIDE = 1200;
      let { width, height } = img;
      if (width > MAX_SIDE || height > MAX_SIDE) {
        if (width >= height) { height = Math.round((height / width) * MAX_SIDE); width = MAX_SIDE; }
        else { width = Math.round((width / height) * MAX_SIDE); height = MAX_SIDE; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg", lastModified: Date.now() }));
        },
        "image/jpeg", 0.80
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

export function ImageUploader({
  value = [],
  onChange,
  maxImages = 10,
  className = "",
  label = "Listing Images",
}: ImageUploaderProps) {
  // ──────────────────────────────────────────────────────────────────────────
  // DESIGN: `committed` ref is the SOLE source of truth for uploaded IDs.
  // We NEVER read from `value` prop after mount — doing so causes the parent's
  // state-setter (onChange) to trigger a re-render that feeds a new `value`
  // back in, which would overwrite in-flight uploads leaving only 1 image.
  //
  // Reset detection: if parent passes value=[] after we had images we treat
  // that as "form cleared" and wipe the ref too.
  // ──────────────────────────────────────────────────────────────────────────
  const committed = useRef<string[]>([]);
  const initialized = useRef(false);

  // Seed once on first render with whatever the parent provides
  if (!initialized.current) {
    committed.current = [...value];
    initialized.current = true;
  }

  // Detect parent-driven full reset (value goes N → 0)
  const prevValueLen = useRef(value.length);
  useEffect(() => {
    if (value.length === 0 && prevValueLen.current > 0) {
      committed.current = [];
      setDisplayIds([]);
    }
    prevValueLen.current = value.length;
  }, [value.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // `displayIds` mirrors `committed.current` for rendering only
  const [displayIds, setDisplayIds] = useState<string[]>(() => [...value]);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.listings.generateUploadUrl);

  // Track in-flight count via ref so handleFiles/uploadFile never read stale state
  const inFlightCount = useRef(0);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const tempId = Math.random().toString(36).slice(2);
    const preview = URL.createObjectURL(file);
    inFlightCount.current++;
    setUploading((p) => [...p, { id: tempId, name: file.name, preview, progress: "uploading" }]);

    try {
      const compressed = await compressImage(file);
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": compressed.type },
        body: compressed,
      });
      if (!res.ok) throw new Error(`Upload failed (HTTP ${res.status})`);
      const { storageId } = await res.json();

      // Append to ref FIRST (synchronous — no render race possible)
      committed.current = [...committed.current, storageId];
      const snap = [...committed.current];
      setDisplayIds(snap);
      onChange(snap);

      setUploading((p) => p.map((u) => u.id === tempId ? { ...u, progress: "done" } : u));
      setTimeout(() => {
        setUploading((p) => p.filter((u) => u.id !== tempId));
        URL.revokeObjectURL(preview);
      }, 1000);
    } catch (err) {
      setUploading((p) =>
        p.map((u) => u.id === tempId
          ? { ...u, progress: "error", error: err instanceof Error ? err.message : "Upload failed" }
          : u)
      );
    } finally {
      inFlightCount.current = Math.max(0, inFlightCount.current - 1);
    }
  }, [onChange, generateUploadUrl]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    // Use refs — never stale
    const slots = maxImages - committed.current.length - inFlightCount.current;
    if (slots <= 0) return;
    Array.from(files).slice(0, slots).forEach(uploadFile);
    if (inputRef.current) inputRef.current.value = "";
  }, [maxImages, uploadFile]);

  // Paste support (Ctrl+V anywhere on page)
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      const imgs: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) { const f = items[i].getAsFile(); if (f) imgs.push(f); }
      }
      if (imgs.length) {
        e.preventDefault();
        const dt = new DataTransfer();
        imgs.forEach((f) => dt.items.add(f));
        handleFiles(dt.files);
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [handleFiles]);

  const removeImage = useCallback((idx: number) => {
    committed.current = committed.current.filter((_, i) => i !== idx);
    const snap = [...committed.current];
    setDisplayIds(snap);
    onChange(snap);
  }, [onChange]);

  const canAddMore = displayIds.length + inFlightCount.current < maxImages;

  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-bold text-text">
          {label}
          <span className="text-text-muted font-normal ml-1">({displayIds.length}/{maxImages})</span>
          <span className="ml-2 text-[10px] font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded-full border border-success/20">Auto-compressed</span>
        </label>
      )}

      {/* Drop zone */}
      {canAddMore && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl cursor-pointer py-8 px-4 transition-all duration-200 select-none ${
            dragOver ? "border-primary bg-primary/10 scale-[1.01]" : "border-border hover:border-primary/50 bg-card hover:bg-elevated/40"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center pointer-events-none">
            <Upload size={22} className="text-primary" />
          </div>
          <div className="text-center pointer-events-none">
            <p className="text-sm font-bold text-text">Drop images here or <span className="text-primary">click to upload</span></p>
            <p className="text-xs text-text-muted mt-1">PNG, JPG, WEBP · Max {maxImages} images · Ctrl+V to paste</p>
          </div>
        </div>
      )}

      {/* Thumbnails grid */}
      {(displayIds.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {displayIds.map((src, idx) => (
            <UploadedThumb key={src + idx} src={src} onRemove={() => removeImage(idx)} />
          ))}
          {uploading.map((u) => (
            <div key={u.id} className="relative aspect-video rounded-xl overflow-hidden border border-border bg-elevated">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u.preview} alt={u.name} className="w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                {u.progress === "uploading" && <><Loader2 size={22} className="animate-spin text-primary" /><p className="text-[10px] text-primary font-semibold">Uploading…</p></>}
                {u.progress === "done" && (
                  <div className="w-7 h-7 rounded-full bg-success flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                )}
                {u.progress === "error" && <><AlertCircle size={22} className="text-danger" /><p className="text-[10px] text-danger font-semibold px-2 text-center">{u.error ?? "Failed"}</p></>}
              </div>
              {u.progress !== "uploading" && (
                <button
                  type="button"
                  onClick={() => setUploading((p) => p.filter((x) => x.id !== u.id))}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center hover:bg-danger/20 transition-colors"
                >
                  <X size={12} className="text-text" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {displayIds.length === 0 && uploading.length === 0 && !canAddMore && (
        <div className="flex items-center gap-2 text-text-muted text-xs">
          <ImageIcon size={14} /><span>No images uploaded yet</span>
        </div>
      )}
    </div>
  );
}

function UploadedThumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  const isStorageId = !src.startsWith("http") && !src.startsWith("/");
  return (
    <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-elevated group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={isStorageId ? `/__convex_storage/${src}` : src}
        alt="Listing image"
        className="w-full h-full object-cover object-top"
        onError={(e) => { (e.target as HTMLImageElement).src = src; }}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-background/90 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger/20"
      >
        <X size={13} className="text-text" />
      </button>
    </div>
  );
}
