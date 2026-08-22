"use client";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function DebugPage() {
  const { getToken, isLoaded, userId } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && userId) {
      getToken({ template: "convex" })
        .then(t => setToken(t))
        .catch(e => setError(e.toString()));
    }
  }, [isLoaded, userId, getToken]);

  return (
    <div className="p-10 text-white">
      <h1>Debug Clerk Token</h1>
      <p>Is Loaded: {isLoaded ? "Yes" : "No"}</p>
      <p>User ID: {userId || "None"}</p>
      <p>Error: {error}</p>
      <p>Token: {token ? token.substring(0, 20) + "..." : "None"}</p>
    </div>
  );
}
