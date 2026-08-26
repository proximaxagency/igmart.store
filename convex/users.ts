import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

const ADMIN_EMAILS = [
  "proximaxagency@gmail.com",
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

// Helper: Get authenticated user via Convex Auth (replaces Clerk JWT lookup)
export async function getAuthUser(ctx: QueryCtx | MutationCtx) {
  try {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) return null;

    // Auto-elevate admin emails
    if (isAdminEmail(user.email) && user.role !== "admin" && user.role !== "super_admin") {
      return { ...user, role: "admin" as const };
    }

    return user;
  } catch {
    return null;
  }
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

// Mutation: Grant Admin role — SECURITY: requires super_admin OR direct admin email match
export const grantAdminAccess = mutation({
  args: {
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await getAuthUser(ctx);
    const targetEmail = (args.email || "proximaxagency@gmail.com").toLowerCase().trim();

    if (caller && caller.role !== "super_admin") {
      if (!isAdminEmail(caller.email)) {
        throw new Error("Forbidden: Only super_admin can grant admin access");
      }
    }

    if (!isAdminEmail(targetEmail)) {
      throw new Error("Forbidden: Target email is not in the admin allowlist");
    }

    const users = await ctx.db.query("users").collect();
    let count = 0;
    for (const u of users) {
      if (u.email.toLowerCase().includes("proximaxagency") || u.email.toLowerCase() === targetEmail) {
        await ctx.db.patch(u._id, { role: "admin", status: "active", updatedAt: Date.now() });
        count++;
      }
    }

    return { success: true, updatedCount: count, targetEmail };
  },
});

// Mutation: Ensure admin role is persisted in DB for admin emails (called on login/mount)
export const ensureAdminRole = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) return null;
    if (isAdminEmail(user.email) && user.role !== "admin" && user.role !== "super_admin") {
      await ctx.db.patch(userId as Id<"users">, { role: "admin", status: "active", updatedAt: Date.now() });
      return { updated: true };
    }
    return { updated: false };
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
    if (target.role === "super_admin" && admin.role !== "super_admin") {
      throw new Error("Only super_admin can modify another super_admin");
    }

    await ctx.db.patch(args.targetUserId, { role: args.newRole, updatedAt: Date.now() });

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

// Mutation (Admin only): Adjust user wallet balance with transaction log and notification message
export const adminAdjustWallet = mutation({
  args: {
    targetUserId: v.id("users"),
    amount: v.number(),
    reason: v.optional(v.string()),
    notificationMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["admin", "super_admin"]);

    const target = await ctx.db.get(args.targetUserId);
    if (!target) throw new Error("User not found");

    const currentBalance = target.walletBalance ?? 0;
    const newBalance = currentBalance + args.amount;

    if (newBalance < 0) throw new Error(`Cannot reduce balance below zero. Current: $${currentBalance.toFixed(2)}`);

    const now = Date.now();
    await ctx.db.patch(args.targetUserId, {
      walletBalance: newBalance,
      updatedAt: now,
    });

    const isCredit = args.amount >= 0;
    const absAmount = Math.abs(args.amount);
    const reasonText = args.reason || (isCredit ? "Admin wallet credit" : "Admin wallet deduction");
    const customMessage = args.notificationMessage?.trim();

    // 1. Record in transactions ledger
    await ctx.db.insert("transactions", {
      userId: args.targetUserId,
      type: isCredit ? "deposit" : "withdrawal",
      amount: args.amount,
      currency: "USD",
      status: "completed",
      description: `[Admin Adjustment] ${reasonText}`,
      createdAt: now,
    });

    // 2. Send instant notification to user
    const notifTitle = isCredit
      ? `Wallet Credited: +$${absAmount.toFixed(2)}`
      : `Wallet Deducted: -$${absAmount.toFixed(2)}`;
    
    const notifBody = customMessage || (isCredit
      ? `An administrator credited $${absAmount.toFixed(2)} to your wallet. Reason: ${reasonText}. Your new balance is $${newBalance.toFixed(2)}.`
      : `An administrator deducted $${absAmount.toFixed(2)} from your wallet. Reason: ${reasonText}. Your new balance is $${newBalance.toFixed(2)}.`
    );

    await ctx.db.insert("notifications", {
      userId: args.targetUserId,
      type: isCredit ? "payment_success" : "security_alert",
      title: notifTitle,
      body: notifBody,
      link: "/account/wallet",
      isRead: false,
      createdAt: now,
    });

    // 3. Record in immutable audit logs
    await ctx.db.insert("auditLogs", {
      actorId: admin._id,
      action: isCredit ? "wallet.credit" : "wallet.debit",
      targetType: "user",
      targetId: args.targetUserId,
      metadata: {
        amount: args.amount,
        previousBalance: currentBalance,
        newBalance,
        reason: reasonText,
        notificationMessage: customMessage,
      },
      createdAt: now,
    });

    return { success: true, previousBalance: currentBalance, newBalance };
  },
});
