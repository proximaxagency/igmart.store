import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthUser, requireRole } from "./users";

// ── CREATE SUPPORT TICKET ──────────────────────────────────────────────
export const createTicket = mutation({
  args: {
    category: v.union(
      v.literal("order_issue"),
      v.literal("payment_issue"),
      v.literal("seller_dispute"),
      v.literal("account_issue"),
      v.literal("technical_issue"),
      v.literal("other")
    ),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent")),
    subject: v.string(),
    description: v.string(),
    relatedOrderId: v.optional(v.id("orders")),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const now = Date.now();
    const ticketNumber = `TICK-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create linked conversation
    const conversationId = await ctx.db.insert("conversations", {
      type: user.role === "seller" ? "seller_support" : "buyer_support",
      participants: [user._id],
      relatedOrderId: args.relatedOrderId,
      lastMessageText: args.description.slice(0, 100),
      lastMessageAt: now,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // Create initial user message in support channel
    await ctx.db.insert("messages", {
      conversationId,
      senderId: user._id,
      content: args.description,
      type: "text",
      isRead: false,
      readBy: [user._id],
      createdAt: now,
    });

    // Create ticket record
    const ticketId = await ctx.db.insert("supportTickets", {
      ticketNumber,
      conversationId,
      userId: user._id,
      category: args.category,
      priority: args.priority,
      status: "open",
      subject: args.subject,
      createdAt: now,
      updatedAt: now,
    });

    return { ticketId, ticketNumber, conversationId };
  },
});

// ── LIST TICKETS (Role-Scoped) ─────────────────────────────────────────
export const listTickets = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const isStaff = ["support_agent", "moderator", "admin", "super_admin"].includes(user.role);

    let tickets;
    if (isStaff) {
      // Staff see all tickets
      tickets = await ctx.db.query("supportTickets").order("desc").take(100);
    } else {
      // Buyers & Sellers see only their own tickets
      tickets = await ctx.db
        .query("supportTickets")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .take(50);
    }

    // Hydrate user and agent details
    const hydrated = [];
    for (const t of tickets) {
      const ticketUser = await ctx.db.get(t.userId);
      let agent = null;
      if (t.assignedAgentId) {
        agent = await ctx.db.get(t.assignedAgentId);
      }

      hydrated.push({
        ...t,
        userName: ticketUser?.displayName || ticketUser?.username || "Unknown",
        userEmail: ticketUser?.email,
        assignedAgentName: agent ? agent.displayName || agent.username : "Unassigned",
      });
    }

    return hydrated;
  },
});

// ── ASSIGN / UPDATE TICKET (Staff Only) ────────────────────────────────
export const updateTicket = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("assigned"),
      v.literal("waiting_for_customer"),
      v.literal("waiting_for_seller"),
      v.literal("resolved"),
      v.literal("closed")
    )),
    priority: v.optional(v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent"))),
    assignedAgentId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const staff = await requireRole(ctx, ["support_agent", "moderator", "admin", "super_admin"]);

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");

    const now = Date.now();
    const updates: any = { updatedAt: now };

    if (args.status) updates.status = args.status;
    if (args.priority) updates.priority = args.priority;
    if (args.assignedAgentId) updates.assignedAgentId = args.assignedAgentId;
    if (args.status === "resolved" || args.status === "closed") updates.resolvedAt = now;

    await ctx.db.patch(args.ticketId, updates);

    // Audit log for resolution or assignment
    await ctx.db.insert("auditLogs", {
      actorId: staff._id,
      action: "ticket.update",
      targetType: "supportTicket",
      targetId: args.ticketId,
      metadata: updates,
      createdAt: now,
    });

    return true;
  },
});
