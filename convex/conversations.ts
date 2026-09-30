import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUser, requireAuthUser, isDbUser } from "./users";

// ── GET OR CREATE CONVERSATION ──────────────────────────────────────────
export const getOrCreateConversation = mutation({
  args: {
    type: v.union(
      v.literal("buyer_seller"),
      v.literal("buyer_support"),
      v.literal("seller_support"),
      v.literal("order"),
      v.literal("internal_staff"),
      v.literal("dispute_arbitration")
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

    // Dedup: reuse existing order conversation
    if (args.relatedOrderId) {
      const existing = await ctx.db
        .query("conversations")
        .withIndex("by_order", (q) => q.eq("relatedOrderId", args.relatedOrderId))
        .first();
      if (existing) return existing._id;
    }

    // Dedup: reuse existing support conversation for this user (no order linked)
    if ((args.type === "buyer_support" || args.type === "seller_support") && !args.relatedOrderId) {
      const allConvs = await ctx.db
        .query("conversations")
        .withIndex("by_type", (q) => q.eq("type", args.type))
        .order("desc")
        .take(100);

      const existing = allConvs.find(
        (c) => c.participants.includes(user._id) && c.status === "active"
      );
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
    const user = await getAuthUser(ctx);
    if (!isDbUser(user)) return [];

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(50);

    // ── Batch-fetch all participant user records (avoids N+1) ──────────
    const relevantConvs = conversations.filter((conv) => {
      const isParticipant = conv.participants.includes(user._id);
      const isStaffAccess = ["admin", "support_agent", "moderator", "super_admin"].includes(user.role) &&
        (conv.type === "buyer_support" || conv.type === "seller_support" || conv.type === "internal_staff" || conv.type === "dispute_arbitration" || conv.isEscalated);
      return isParticipant || isStaffAccess;
    });

    const allParticipantIds = [
      ...new Set(relevantConvs.flatMap((c) => c.participants).filter((p) => p !== user._id)),
    ];
    const participantRecords = await Promise.all(allParticipantIds.map((id) => ctx.db.get(id)));
    const participantMap = new Map(allParticipantIds.map((id, i) => [id, participantRecords[i]]));

    const filtered = [];
    for (const conv of relevantConvs) {
      {
        const otherParticipantId = conv.participants.find((p) => p !== user._id);
        let otherUser = null;
        if (otherParticipantId) {
          otherUser = participantMap.get(otherParticipantId) ?? null;
        }

        // Fetch support agent details if present
        let supportAgent = null;
        if (conv.supportAgentId) {
          const agent = await ctx.db.get(conv.supportAgentId);
          if (agent) {
            supportAgent = {
              displayName: agent.displayName || agent.username,
              avatarUrl: agent.avatarUrl,
              role: agent.role,
            };
          }
        }

        // Fetch related order if any
        let orderData = null;
        if (conv.relatedOrderId) {
          const order = await ctx.db.get(conv.relatedOrderId);
          if (order) {
            orderData = {
              orderNumber: order._id.slice(-6).toUpperCase(),
              status: order.status,
              totalAmount: order.totalAmount,
            };
          }
        }

        filtered.push({
          ...conv,
          otherUser: otherUser ? {
            _id: otherUser._id,
            displayName: otherUser.displayName || otherUser.username,
            avatarUrl: otherUser.avatarUrl,
            role: otherUser.role,
            isVerified: otherUser.isVerified,
          } : null,
          supportAgent,
          orderData,
        });
      }
    }

    return filtered;
  },
});

// ── GET CONVERSATION DETAILS ───────────────────────────────────────────
export const getConversationDetails = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return null;

    const isParticipant = conv.participants.includes(user._id);
    const isStaff = ["support_agent", "moderator", "admin", "super_admin"].includes(user.role);
    if (!isParticipant && !isStaff) {
      throw new Error("Forbidden: Access denied to conversation");
    }

    // Hydrate all participants
    const participantsData = [];
    for (const pId of conv.participants) {
      const pUser = await ctx.db.get(pId);
      if (pUser) {
        participantsData.push({
          _id: pUser._id,
          displayName: pUser.displayName || pUser.username,
          avatarUrl: pUser.avatarUrl,
          role: pUser.role,
          isVerified: pUser.isVerified,
        });
      }
    }

    // Order info if attached
    let orderDetails = null;
    if (conv.relatedOrderId) {
      const order = await ctx.db.get(conv.relatedOrderId);
      if (order) {
        const listing = await ctx.db.get(order.listingId);
        orderDetails = {
          _id: order._id,
          orderNumber: order._id.slice(-6).toUpperCase(),
          status: order.status,
          totalAmount: order.totalAmount,
          price: order.price,
          listingTitle: listing?.title || "Game Asset",
          listingImage: listing?.images?.[0] || "",
        };
      }
    }

    return {
      ...conv,
      participantsData,
      orderDetails,
      currentUserRole: user.role,
      currentUserId: user._id,
      isStaff,
    };
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
      v.literal("support_note"),
      v.literal("credential_vault")
    )),
    metadata: v.optional(v.any()),
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
      metadata: args.metadata,
      attachments: args.attachments,
      replyToMessageId: args.replyToMessageId,
      isRead: false,
      readBy: [user._id],
      createdAt: now,
    });

    // Update conversation metadata
    await ctx.db.patch(args.conversationId, {
      lastMessageText: msgType === "support_note" ? "🔒 Staff note added" : args.content.slice(0, 100),
      lastMessageAt: now,
      updatedAt: now,
    });

    // Notify other participants real-time
    for (const participantId of conv.participants) {
      if (participantId !== user._id) {
        if (msgType === "support_note") continue; // Don't notify customers on internal notes
        
        await ctx.db.insert("notifications", {
          userId: participantId,
          type: "new_message",
          title: "New message from " + (user.displayName || user.username),
          body: args.content.slice(0, 80),
          link: "/messages?id=" + args.conversationId,
          isRead: false,
          createdAt: now,
        });
      }
    }

    return messageId;
  },
});

// ── ESCALATE TO SUPPORT (SUMMON 3-WAY AGENT) ─────────────────────────
export const escalateToSupport = mutation({
  args: {
    conversationId: v.id("conversations"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    const now = Date.now();

    // Mark conversation as escalated
    await ctx.db.patch(args.conversationId, {
      isEscalated: true,
      escalationReason: args.reason,
      type: "dispute_arbitration",
      updatedAt: now,
    });

    // Post system announcement in chat
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: user._id,
      content: "⚠️ Conversation escalated to Support Desk by " + (user.displayName || user.username) + '. Reason: "' + args.reason + '". An official Support Agent has been dispatched to arbitrate.',
      type: "system",
      isRead: false,
      readBy: [user._id],
      createdAt: now,
    });

    // Log audit log
    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      action: "conversation.escalate_support",
      targetType: "conversation",
      targetId: args.conversationId,
      metadata: { reason: args.reason },
      createdAt: now,
    });

    return { success: true };
  },
});

// ── JOIN AS SUPPORT AGENT ──────────────────────────────────────────────
export const joinAsSupportAgent = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const isStaff = ["support_agent", "moderator", "admin", "super_admin"].includes(user.role);
    if (!isStaff) throw new Error("Forbidden: Staff role required");

    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    const now = Date.now();
    const participants = [...conv.participants];
    if (!participants.includes(user._id)) {
      participants.push(user._id);
    }

    await ctx.db.patch(args.conversationId, {
      participants,
      supportAgentId: user._id,
      updatedAt: now,
    });

    // Post announcement
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: user._id,
      content: "🛡️ Verified Support Agent " + (user.displayName || user.username) + " has joined this room to assist and arbitrate.",
      type: "system",
      isRead: false,
      readBy: [user._id],
      createdAt: now,
    });

    return { success: true };
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

    const result = [];
    for (const msg of messages) {
      // Filter out internal support notes for regular buyers/sellers
      if (msg.type === "support_note" && !isStaff) continue;

      const sender = await ctx.db.get(msg.senderId);
      result.push({
        ...msg,
        senderName: sender?.displayName || sender?.username || "System",
        senderAvatar: sender?.avatarUrl,
        senderRole: sender?.role || "buyer",
        isStaffSender: sender ? ["support_agent", "moderator", "admin", "super_admin"].includes(sender.role) : false,
        isMe: msg.senderId === user._id,
      });
    }

    return result;
  },
});

// ── GET OR CREATE CONVERSATION BY LISTING (Buyer → Seller) ─────────────
export const getOrCreateByListing = mutation({
  args: {
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");

    // Prevent sellers from messaging themselves
    if (listing.sellerId === user._id) {
      throw new Error("Cannot start a conversation with yourself");
    }

    // Check if conversation already exists between this buyer and seller for this listing
    const allConversations = await ctx.db
      .query("conversations")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(200);

    const existing = allConversations.find(
      (conv) =>
        conv.type === "buyer_seller" &&
        conv.relatedListingId === args.listingId &&
        conv.participants.includes(user._id) &&
        conv.participants.includes(listing.sellerId)
    );

    if (existing) return existing._id;

    // Create new conversation
    const now = Date.now();
    const conversationId = await ctx.db.insert("conversations", {
      type: "buyer_seller",
      participants: [user._id, listing.sellerId],
      relatedListingId: args.listingId,
      lastMessageAt: now,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // Post system intro message
    const seller = await ctx.db.get(listing.sellerId);
    await ctx.db.insert("messages", {
      conversationId,
      senderId: user._id,
      content: `💬 New inquiry about "${listing.title.slice(0, 60)}" — ${user.displayName || user.username} is interested.`,
      type: "system",
      isRead: false,
      readBy: [user._id],
      createdAt: now,
    });

    // Notify the seller
    await ctx.db.insert("notifications", {
      userId: listing.sellerId,
      type: "new_message",
      title: `New buyer inquiry from ${user.displayName || user.username}`,
      body: `Someone is interested in "${listing.title.slice(0, 50)}"`,
      link: "/messages?id=" + conversationId,
      isRead: false,
      createdAt: now,
    });

    return conversationId;
  },
});

// ── GET UNREAD MESSAGE COUNT (for floating widget badge) ───────────────
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!isDbUser(user)) return 0;

    // Get all conversations this user participates in
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(50);

    const myConvs = conversations.filter((conv) =>
      conv.participants.includes(user._id)
    );

    let totalUnread = 0;
    for (const conv of myConvs) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", conv._id)
        )
        .order("desc")
        .take(50);

      for (const msg of messages) {
        if (msg.senderId === user._id) continue;
        if (msg.type === "support_note") continue;
        const readBy = msg.readBy || [];
        if (!readBy.includes(user._id)) {
          totalUnread++;
        }
      }
    }

    return totalUnread;
  },
});

// ── MARK CONVERSATION AS READ ──────────────────────────────────────────
export const markConversationRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    const isParticipant = conv.participants.includes(user._id);
    const isStaff = ["support_agent", "moderator", "admin", "super_admin"].includes(user.role);
    if (!isParticipant && !isStaff) return;

    // Mark all unread messages from others as read
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(100);

    for (const msg of messages) {
      if (msg.senderId === user._id) continue;
      const readBy = msg.readBy || [];
      if (!readBy.includes(user._id)) {
        await ctx.db.patch(msg._id, {
          readBy: [...readBy, user._id],
          isRead: true,
        });
      }
    }

    return { success: true };
  },
});

// ── GENERATE UPLOAD URL (file attachments in chat) ─────────────────────
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuthUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
