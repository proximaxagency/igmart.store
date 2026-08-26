"use client";

import React, { useState, useEffect, type ImgHTMLAttributes } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const DEFAULT_FALLBACK = "/clash-of-clans-poster.jpg";

/**
 * Checks if a string is already a direct URL (http, https, relative path, data, blob).
 */
export function isDirectUrl(val?: string | null): boolean {
  if (!val || typeof val !== "string") return false;
  const trimmed = val.trim();
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  );
}

/**
 * Custom React hook that resolves any image representation
 * (direct URL or Convex storage ID) into a real, loadable public URL.
 */
export function useResolvedImageUrl(
  img?: string | null,
  fallback = DEFAULT_FALLBACK
): string {
  const isStorageId = !!img && typeof img === "string" && !isDirectUrl(img);

  const resolvedFromConvex = useQuery(
    (api.listings as any).getImageUrl,
    isStorageId ? { storageId: img!.trim() } : "skip"
  );

  if (!img || typeof img !== "string" || img.trim() === "") {
    return fallback;
  }

  if (isDirectUrl(img)) {
    return img.trim();
  }

  // If it's a storage ID, return the resolved signed URL from Convex
  return resolvedFromConvex || fallback;
}

export interface ConvexImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  fallback?: string;
}

/**
 * High-performance image component that automatically resolves Convex storage IDs
 * into live public URLs, and safely handles fallbacks without error loops.
 */
export function ConvexImage({
  src,
  fallback = DEFAULT_FALLBACK,
  alt = "",
  className = "",
  style,
  onError,
  ...props
}: ConvexImageProps) {
  const resolvedUrl = useResolvedImageUrl(src, fallback);
  const [currentSrc, setCurrentSrc] = useState(resolvedUrl);

  useEffect(() => {
    setCurrentSrc(resolvedUrl);
  }, [resolvedUrl]);

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      loading={props.loading ?? "lazy"}
      onError={(e) => {
        if (currentSrc !== fallback) {
          setCurrentSrc(fallback);
        }
        if (onError) {
          onError(e);
        }
      }}
    />
  );
}
