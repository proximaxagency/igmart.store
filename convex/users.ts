import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Helper: Get authenticated user from Clerk JWT
export async function getAuthUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
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

// Helper: Require specific role or throw
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: Array<Doc<"users">["role"]>
) {
  const user = await requireAuthUser(ctx);
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

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        displayName: args.displayName ?? existing.displayName,
        avatarUrl: args.avatarUrl ?? existing.avatarUrl,
        lastSeenAt: now,
        updatedAt: now,
      });
      return existing._id;
    }

    // Default role is buyer
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      username: args.username,
      displayName: args.displayName ?? args.username,
      avatarUrl: args.avatarUrl,
      role: "buyer",
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
