"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UserSync() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || "";
    const username = user.username || email.split("@")[0] || "user";
    const displayName = user.fullName || username;
    const avatarUrl = user.imageUrl;

    syncUser({
      clerkId: user.id,
      email,
      username,
      displayName,
      avatarUrl,
    }).catch((err) => {
      console.error("[UserSync] Failed to sync Clerk user with Convex:", err);
    });
  }, [isLoaded, user, syncUser]);

  return null;
}
