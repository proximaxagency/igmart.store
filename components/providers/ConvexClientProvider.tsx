"use client";

import { ReactNode, useMemo } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const rawConvexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const fallbackUrl = "https://patient-squirrel-8.convex.cloud";

function isValidUrl(url?: string): boolean {
  if (!url || url === "[SENSITIVE]" || !url.startsWith("http")) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const safeConvexUrl = isValidUrl(rawConvexUrl) ? rawConvexUrl! : fallbackUrl;
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Log warning in dev — do NOT throw, which would crash the entire React tree
if (!clerkPublishableKey && process.env.NODE_ENV === "development") {
  console.warn("[IGMART] Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY — running without Clerk auth");
}

import { UserSync } from "./UserSync";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => new ConvexReactClient(safeConvexUrl), []);

  // If Clerk key is available, use authenticated Convex provider
  if (clerkPublishableKey) {
    return (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <UserSync />
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    );
  }

  // Fallback: unauthenticated Convex — site still renders, auth features disabled
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}
