import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthUser, requireRole } from "./users";

// ── GET OR CREATE CONVERSATION ──────────────────────────────────────────
export const getOrCreateConversation = mutation({
  args: {
    type: v.union(
      v.literal("buyer_seller"),
      v.literal("buyer_support"),
      v.literal("seller_support"),
      v.literal("order"),
      v.literal("internal_staff")
    ),
    targetUserId: v.optional(v.id("users")),
    relatedOrderId: v.optional(v.id("orders")),
    relatedListingId: v.optional(v.id("listings")),
    relatedTicketId: v.optional(v.id("supportTickets")),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const now = Date.now();

    // Determine participants
    const participants = [user._id];
    if (args.targetUserId && !participants.includes(args.targetUserId)) {
      participants.push(args.targetUserId);
    }

    // Check existing conversation
    if (args.relatedOrderId) {
      const existing = await ctx.db
        .query("conversations")
        .withIndex("by_order", (q) => q.eq("relatedOrderId", args.relatedOrderId))
        .first();
      if (existing) return existing._id;
    }

    const conversationId = await ctx.db.insert("conversations", {
      type: args.type,
      participants,
      relatedOrderId: args.relatedOrderId,
      relatedListingId: args.relatedListingId,
      relatedTicketId: args.relatedTicketId,
      lastMessageAt: now,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return conversationId;
  },
});

// ── LIST USER CONVERSATIONS (REAL-TIME SUBSCRIPTION) ───────────────────
export const listMyConversations = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuthUser(ctx);

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(50);

    // Filter conversations where current user is a participant or staff member
    const filtered = [];
    for (const conv of conversations) {
      const isParticipant = conv.participants.includes(user._id);
      const isStaffAccess = (user.role === "admin" || user.role === "support_agent" || user.role === "moderator") && 
                            (conv.type === "buyer_support" || conv.type === "seller_support" || conv.type === "internal_staff");
      
      if (isParticipant || isStaffAccess) {
        // Fetch participant details
        const otherParticipantId = conv.participants.find((p) => p !== user._id);
        let otherUser = null;
        if (otherParticipantId) {
          otherUser = await ctx.db.get(otherParticipantId);
        }

        filtered.push({
          ...conv,
          otherUser: otherUser ? {
            displayName: otherUser.displayName || otherUser.username,
            avatarUrl: otherUser.avatarUrl,
            role: otherUser.role,
          } : null,
        });
      }
    }

    return filtered;
  },
});

// ── SEND REAL-TIME MESSAGE ─────────────────────────────────────────────
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    type: v.optional(v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("file"),
      v.literal("system"),
      v.literal("order_update"),
      v.literal("support_note")
    )),
    attachments: v.optional(v.array(v.string())),
    replyToMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    // Verify membership or staff privilege
    const isParticipant = conv.participants.includes(user._id);
    const isStaff = ["support_agent", "moderator", "admin", "super_admin"].includes(user.role);
    if (!isParticipant && !isStaff) {
      throw new Error("Forbidden: Cannot access this conversation");
    }

    // Support notes are staff only
    const msgType = args.type ?? "text";
    if (msgType === "support_note" && !isStaff) {
      throw new Error("Forbidden: Support notes require staff permissions");
    }

    const now = Date.now();

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: user._id,
      content: args.content,
      type: msgType,
      attachments: args.attachments,
      replyToMessageId: args.replyToMessageId,
      isRead: false,
      readBy: [user._id],
      createdAt: now,
    });

    // Update conversation metadata
    await ctx.db.patch(args.conversationId, {
      lastMessageText: args.content.slice(0, 100),
      lastMessageAt: now,
      updatedAt: now,
    });

    // Notify other participants real-time
    for (const participantId of conv.participants) {
      if (participantId !== user._id) {
        await ctx.db.insert("notifications", {
          userId: participantId,
          type: "new_message",
          title: `New message from ${user.displayName || user.username}`,
          body: args.content.slice(0, 80),
          link: `/messages?id=${args.conversationId}`,
          isRead: false,
          createdAt: now,
        });
      }
    }

    return messageId;
  },
});

// ── GET REAL-TIME MESSAGES FOR CONVERSATION ────────────────────────────
export const listMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    const isParticipant = conv.participants.includes(user._id);
    const isStaff = ["support_agent", "moderator", "admin", "super_admin"].includes(user.role);
    if (!isParticipant && !isStaff) {
      throw new Error("Forbidden: Access denied");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .take(100);

    // Hydrate sender details
    const result = [];
    for (const msg of messages) {
      // Filter out internal support notes for buyers/sellers
      if (msg.type === "support_note" && !isStaff) continue;

      const sender = await ctx.db.get(msg.senderId);
      result.push({
        ...msg,
        senderName: sender?.displayName || sender?.username || "System",
        senderAvatar: sender?.avatarUrl,
        isMe: msg.senderId === user._id,
      });
    }

    return result;
  },
});
