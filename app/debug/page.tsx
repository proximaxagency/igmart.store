"use client";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DebugPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const dbUser = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : "skip");

  return (
    <div className="p-10 text-white">
      <h1>Debug Auth (Convex Auth)</h1>
      <p>Is Loading: {isLoading ? "Yes" : "No"}</p>
      <p>Is Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
      <p>User: {dbUser ? `${dbUser.email} (${dbUser.role})` : "None"}</p>
    </div>
  );
}
