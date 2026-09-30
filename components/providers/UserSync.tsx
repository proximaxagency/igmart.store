"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Runs globally on every page — safely syncs admin role without crashing or spamming RPC errors
export function UserSync() {
  const { isAuthenticated } = useConvexAuth();
  const dbUser = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : "skip");
  const ensureAdminRole = useMutation(api.users.ensureAdminRole);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && dbUser && !attemptedRef.current) {
      const email = dbUser?.email?.toLowerCase() || "";
      const isAdminEmail = email.includes("proximaxagency") || email === "proximaxagency@gmail.com";
      if (isAdminEmail && dbUser.role !== "admin" && dbUser.role !== "super_admin") {
        attemptedRef.current = true;
        ensureAdminRole().catch(() => {});
      }
    }
  }, [isAuthenticated, dbUser, ensureAdminRole]);

  return null;
}
