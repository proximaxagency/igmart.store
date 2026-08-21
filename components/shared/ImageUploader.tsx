"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Upload, X, ImageIcon, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";

interface ImageUploaderProps {
  value: string[];           // current array of storageIds or URLs
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

export function ImageUploader({
  value = [],
  onChange,
  maxImages = 5,
  className = "",
  label = "Listing Images",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.listings.generateUploadUrl);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const tempId = Math.random().toString(36).slice(2);
    const preview = URL.createObjectURL(file);

    setUploading((prev) => [
      ...prev,
      { id: tempId, name: file.name, preview, progress: "uploading" },
    ]);

    try {
      // 1. Get a one-time Convex upload URL
      const uploadUrl = await generateUploadUrl();

      // 2. POST the file directly to Convex storage
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) throw new Error("Upload failed");

      const { storageId } = await response.json();

      // 3. Add the storageId to the parent value
      onChange([...value, storageId]);

      setUploading((prev) =>
        prev.map((u) => (u.id === tempId ? { ...u, progress: "done" } : u))
      );

      // Clean up the temp preview entry after a short delay
      setTimeout(() => {
        setUploading((prev) => prev.filter((u) => u.id !== tempId));
        URL.revokeObjectURL(preview);
      }, 800);
    } catch (err) {
      setUploading((prev) =>
        prev.map((u) =>
          u.id === tempId
            ? { ...u, progress: "error", error: err instanceof Error ? err.message : "Upload failed" }
            : u
        )
      );
    }
  }, [value, onChange, generateUploadUrl]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const remaining = maxImages - value.length - uploading.filter((u) => u.progress === "uploading").length;
      const toUpload = Array.from(files).slice(0, remaining);
      toUpload.forEach(uploadFile);
    },
    [value.length, uploading, maxImages, uploadFile]
  );

  const removeImage = (idx: number) => {
    const next = [...value];
    next.splice(idx, 1);
    onChange(next);
  };

  const removeUploading = (id: string) => {
    setUploading((prev) => prev.filter((u) => u.id !== id));
  };

  const canAddMore = value.length + uploading.filter((u) => u.progress === "uploading").length < maxImages;

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-bold text-text">
          {label}
          <span className="text-text-muted font-normal ml-1">
            ({value.length}/{maxImages})
          </span>
        </label>
      )}

      {/* Drop zone */}
      {canAddMore && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-3
            border-2 border-dashed rounded-xl cursor-pointer
            py-8 px-4 transition-all duration-200
            ${dragOver
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-primary/3 bg-card"
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload size={22} className="text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-text">
              Drop images here or <span className="text-primary">click to upload</span>
            </p>
            <p className="text-xs text-text-muted mt-1">
              PNG, JPG, WEBP · Max {maxImages} images
            </p>
          </div>
        </div>
      )}

      {/* Uploaded images grid */}
      {(value.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Committed images */}
          {value.map((src, idx) => (
            <UploadedThumb
              key={src + idx}
              src={src}
              onRemove={() => removeImage(idx)}
            />
          ))}

          {/* In-progress uploads */}
          {uploading.map((u) => (
            <div
              key={u.id}
              className="relative aspect-video rounded-xl overflow-hidden border border-border bg-elevated"
            >
              <Image
                src={u.preview}
                alt={u.name}
                fill
                unoptimized
                className="object-cover opacity-50"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                {u.progress === "uploading" && (
                  <Loader2 size={22} className="animate-spin text-primary" />
                )}
                {u.progress === "done" && (
                  <div className="w-7 h-7 rounded-full bg-success flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                )}
                {u.progress === "error" && (
                  <>
                    <AlertCircle size={22} className="text-danger" />
                    <p className="text-[10px] text-danger font-semibold px-2 text-center">
                      {u.error ?? "Failed"}
                    </p>
                  </>
                )}
              </div>
              {u.progress !== "uploading" && (
                <button
                  onClick={() => removeUploading(u.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center hover:bg-danger/20 transition-colors"
                >
                  <X size={12} className="text-text" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty hint */}
      {value.length === 0 && uploading.length === 0 && !canAddMore && (
        <div className="flex items-center gap-2 text-text-muted text-xs">
          <ImageIcon size={14} />
          <span>No images uploaded yet</span>
        </div>
      )}
    </div>
  );
}

// ── Committed thumbnail with auto-resolve for storageIds ─────────────────────
function UploadedThumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  // If it's a storage ID (not a URL), resolve it via Convex
  const isStorageId = !src.startsWith("http") && !src.startsWith("/");

  // For storage IDs we use the img tag with a convex getUrl approach
  // For regular URLs we use Next/Image directly
  return (
    <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-elevated group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={isStorageId ? `/__convex_storage/${src}` : src}
        alt="Listing image"
        className="w-full h-full object-cover object-top"
        onError={(e) => {
          // Fallback: try using it as-is if custom path fails
          (e.target as HTMLImageElement).src = src;
        }}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      <button
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-background/90 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger/20"
      >
        <X size={13} className="text-text" />
      </button>
      <div className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-bold bg-background/80 text-text-muted px-1.5 py-0.5 rounded-md">
          {isStorageId ? "Uploaded" : "URL"}
        </span>
      </div>
    </div>
  );
}
