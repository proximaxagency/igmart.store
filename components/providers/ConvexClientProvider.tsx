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
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "[SENSITIVE]" 
  ? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 
  : "pk_test_ZnVsbC13b21iYXQtNDcuY2xlcmsuYWNjb3VudHMuZGV2JA";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => new ConvexReactClient(safeConvexUrl), []);

  if (clerkPublishableKey) {
    return (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    );
  }

  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}
