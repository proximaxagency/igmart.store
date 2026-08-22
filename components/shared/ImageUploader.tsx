"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Upload, X, ImageIcon, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";

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
        "image/jpeg", 0.75
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

export function ImageUploader({
  value = [],
  onChange,
  maxImages = 5,
  className = "",
  label = "Listing Images",
}: ImageUploaderProps) {
  // ─────────────────────────────────────────────────────────────────────────
  // `committed` ref owns the authoritative list of uploaded image IDs.
  // It is NEVER overwritten by incoming `value` prop changes after mount
  // (which would reset mid-upload images). Only external FULL resets (value
  // going from N->0) sync it back to empty so the form can be cleared.
  // ─────────────────────────────────────────────────────────────────────────
  const committed = useRef<string[]>(value);
  const seeded = useRef(false);
  if (!seeded.current) {
    committed.current = [...value];
    seeded.current = true;
  }

  const prevLen = useRef(value.length);
  useEffect(() => {
    // Only reset when parent explicitly clears the list
    if (value.length === 0 && prevLen.current > 0) {
      committed.current = [];
      setDisplayIds([]);
    }
    prevLen.current = value.length;
  }, [value.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const [displayIds, setDisplayIds] = useState<string[]>(() => [...value]);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.listings.generateUploadUrl);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const tempId = Math.random().toString(36).slice(2);
    const preview = URL.createObjectURL(file);
    setUploading((p) => [...p, { id: tempId, name: file.name, preview, progress: "uploading" }]);

    try {
      const compressed = await compressImage(file);
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": compressed.type },
        body: compressed,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json();

      // Synchronous JS mutation — safe, no race between concurrent callbacks
      committed.current = [...committed.current, storageId];
      const snap = committed.current;
      setDisplayIds(snap);
      onChange(snap);

      setUploading((p) => p.map((u) => u.id === tempId ? { ...u, progress: "done" } : u));
      setTimeout(() => {
        setUploading((p) => p.filter((u) => u.id !== tempId));
        URL.revokeObjectURL(preview);
      }, 800);
    } catch (err) {
      setUploading((p) =>
        p.map((u) => u.id === tempId ? { ...u, progress: "error", error: err instanceof Error ? err.message : "Upload failed" } : u)
      );
    }
  }, [onChange, generateUploadUrl]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const inFlight = uploading.filter((u) => u.progress === "uploading").length;
    const slots = maxImages - committed.current.length - inFlight;
    Array.from(files).slice(0, Math.max(0, slots)).forEach(uploadFile);
  }, [uploading, maxImages, uploadFile]);

  // Paste support
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
    setDisplayIds([...committed.current]);
    onChange(committed.current);
  }, [onChange]);

  const inFlight = uploading.filter((u) => u.progress === "uploading").length;
  const canAddMore = displayIds.length + inFlight < maxImages;

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-bold text-text">
          {label}
          <span className="text-text-muted font-normal ml-1">({displayIds.length}/{maxImages})</span>
          <span className="ml-2 text-[10px] font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded-full border border-success/20">Auto-compressed</span>
        </label>
      )}

      {canAddMore && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl cursor-pointer py-8 px-4 transition-all duration-200 ${dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 bg-card"}`}
        >
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload size={22} className="text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-text">Drop images here or <span className="text-primary">click to upload</span></p>
            <p className="text-xs text-text-muted mt-1">PNG, JPG, WEBP · Max {maxImages} images · Ctrl+V to paste</p>
          </div>
        </div>
      )}

      {(displayIds.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {displayIds.map((src, idx) => (
            <UploadedThumb key={src + idx} src={src} onRemove={() => removeImage(idx)} />
          ))}
          {uploading.map((u) => (
            <div key={u.id} className="relative aspect-video rounded-xl overflow-hidden border border-border bg-elevated">
              <Image src={u.preview} alt={u.name} fill unoptimized className="object-cover opacity-50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                {u.progress === "uploading" && <><Loader2 size={22} className="animate-spin text-primary" /><p className="text-[10px] text-primary font-semibold">Compressing…</p></>}
                {u.progress === "done" && <div className="w-7 h-7 rounded-full bg-success flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12" /></svg></div>}
                {u.progress === "error" && <><AlertCircle size={22} className="text-danger" /><p className="text-[10px] text-danger font-semibold px-2 text-center">{u.error ?? "Failed"}</p></>}
              </div>
              {u.progress !== "uploading" && (
                <button onClick={() => setUploading((p) => p.filter((x) => x.id !== u.id))} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center hover:bg-danger/20 transition-colors">
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
      <button onClick={onRemove} className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-background/90 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger/20">
        <X size={13} className="text-text" />
      </button>
    </div>
  );
}
