import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

const ADMIN_EMAILS = [
  "proximaxagency@gmail.com",
  "proximaxagency-2983@users.noreply.github.com",
  "dev@igmart.store",
];

function isAdminEmail(email?: string) {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return ADMIN_EMAILS.includes(normalized) || normalized.includes("proximaxagency");
}

// Helper: Check if user is a valid persistent DB document
export function isDbUser(user: any): user is Doc<"users"> {
  return !!user && typeof user._id === "string" && !user._id.startsWith("synthetic_");
}

// Helper: Get authenticated user from Clerk JWT
export async function getAuthUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  let user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  const userEmail = identity.email || user?.email || "";

  // If user record doesn't exist yet by clerkId, search by email
  if (!user && userEmail) {
    const byEmail = await ctx.db.query("users").collect();
    user = byEmail.find((u) => u.email.toLowerCase() === userEmail.toLowerCase()) || null;
  }

  // If user is an admin email, ensure their role is admin
  if (user && isAdminEmail(user.email)) {
    if (user.role !== "admin" && user.role !== "super_admin") {
      user = { ...user, role: "admin" };
    }
  }

  // If user DB record doesn't exist yet, return null so queries don't pass invalid string IDs to indexes
  return user;
}


// Helper: Require authenticated user or throw
export async function requireAuthUser(ctx: QueryCtx | MutationCtx) {
  const user = await getAuthUser(ctx);
  if (!user) throw new Error("Unauthorized: Authentication required");
  if (user.status === "banned" || user.status === "suspended") {
    throw new Error(`Forbidden: Account is ${user.status}`);
  }
  return user;
}

// Helper: Require specific role or throw (Admins & Super Admins have omni-permission access to all panels)
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: Array<Doc<"users">["role"]>
) {
  const user = await requireAuthUser(ctx);
  if (user.role === "admin" || user.role === "super_admin") {
    return user;
  }
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Forbidden: Access requires one of [${allowedRoles.join(", ")}]`);
  }
  return user;
}

// Query: Get current logged-in user profile
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getAuthUser(ctx);
  },
});



// Mutation: Sync user from Clerk identity upon sign up / login
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    const now = Date.now();
    const role = isAdminEmail(args.email) ? "admin" : "buyer";

    if (existing) {
      const updatedRole = isAdminEmail(args.email) ? "admin" : existing.role;
      await ctx.db.patch(existing._id, {
        email: args.email,
        displayName: args.displayName ?? existing.displayName,
        avatarUrl: args.avatarUrl ?? existing.avatarUrl,
        role: updatedRole,
        lastSeenAt: now,
        updatedAt: now,
      });
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      username: args.username,
      displayName: args.displayName ?? args.username,
      avatarUrl: args.avatarUrl,
      role: role,
      status: "active",
      walletBalance: 0,
      pendingBalance: 0,
      createdAt: now,
      updatedAt: now,
      lastSeenAt: now,
    });

    return userId;
  },
});

// Mutation: Explicitly grant Admin role to a target email
export const grantAdminAccess = mutation({
  args: {
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const targetEmail = (args.email || "proximaxagency@gmail.com").toLowerCase().trim();
    const users = await ctx.db.query("users").collect();

    let count = 0;
    for (const u of users) {
      if (u.email.toLowerCase().includes("proximaxagency") || u.email.toLowerCase() === targetEmail) {
        await ctx.db.patch(u._id, {
          role: "admin",
          status: "active",
          updatedAt: Date.now(),
        });
        count++;
      }
    }

    return { success: true, updatedCount: count, targetEmail };
  },
});


// Mutation (Admin only): Change user role
export const updateUserRole = mutation({
  args: {
    targetUserId: v.id("users"),
    newRole: v.union(
      v.literal("buyer"),
      v.literal("seller"),
      v.literal("support_agent"),
      v.literal("moderator"),
      v.literal("admin"),
      v.literal("super_admin")
    ),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin", "super_admin"]);

    const target = await ctx.db.get(args.targetUserId);
    if (!target) throw new Error("Target user not found");

    await ctx.db.patch(args.targetUserId, {
      role: args.newRole,
      updatedAt: Date.now(),
    });

    // Record Immutable Audit Log
    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      action: "user.update_role",
      targetType: "user",
      targetId: args.targetUserId,
      metadata: { oldRole: target.role, newRole: args.newRole },
      createdAt: Date.now(),
    });

    return true;
  },
});
