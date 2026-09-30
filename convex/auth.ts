import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { DataModel } from "./_generated/dataModel";

const ADMIN_EMAILS = [
  "proximaxagency@gmail.com",
  "dev@igmart.store",
];

function generateUsername(email: string): string {
  const base = email.split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .slice(0, 18);
  return base + "_" + Math.floor(Math.random() * 9000 + 1000);
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    // Email + Password
    Password<DataModel>({
      profile(params) {
        const email = (params.email as string).toLowerCase().trim();
        const isAdmin = ADMIN_EMAILS.includes(email) || email.includes("proximaxagency");
        const username = (params.username as string | undefined) || generateUsername(email);
        const now = Date.now();

        return {
          email,
          username: username.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 30),
          displayName: (params.name as string | undefined) || username,
          role: isAdmin ? "admin" : "buyer",
          status: "active",
          createdAt: now,
          updatedAt: now,
          walletBalance: 0,
          pendingBalance: 0,
        };
      },
    }),

    // Google OAuth
    Google({
      profile(googleProfile) {
        const email = (googleProfile.email as string).toLowerCase().trim();
        const isAdmin = ADMIN_EMAILS.includes(email) || email.includes("proximaxagency");
        const username = generateUsername(email);
        const now = Date.now();

        return {
          id: googleProfile.sub as string,
          email,
          username,
          displayName: (googleProfile.name as string) || username,
          avatarUrl: googleProfile.picture as string | undefined,
          role: isAdmin ? "admin" : "buyer",
          status: "active",
          createdAt: now,
          updatedAt: now,
          walletBalance: 0,
          pendingBalance: 0,
        };
      },
    }),
  ],
});
