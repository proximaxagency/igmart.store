"use client";

import { useEffect } from "react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Runs globally on every page — persists admin role to DB for admin emails
// so layout-level role checks always see the correct role in dbUser
export function UserSync() {
  const { isAuthenticated } = useConvexAuth();
  const dbUser = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : "skip");
  const ensureAdminRole = useMutation(api.users.ensureAdminRole);

  useEffect(() => {
    if (isAuthenticated && dbUser) {
      ensureAdminRole().catch(() => {});
    }
  }, [isAuthenticated, dbUser, ensureAdminRole]);

  return null;
}

