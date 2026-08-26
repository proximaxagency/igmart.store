"use client";

import { ReactNode, useMemo } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

const rawConvexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const fallbackUrl = "https://patient-squirrel-8.convex.cloud";

function isValidUrl(url?: string): boolean {
  if (!url || url === "[SENSITIVE]" || !url.startsWith("http")) return false;
  try { new URL(url); return true; } catch { return false; }
}

const safeConvexUrl = isValidUrl(rawConvexUrl) ? rawConvexUrl! : fallbackUrl;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => new ConvexReactClient(safeConvexUrl), []);

  return (
    <ConvexAuthProvider client={convex}>
      {children}
    </ConvexAuthProvider>
  );
}
