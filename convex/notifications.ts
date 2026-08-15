import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUser, requireAuthUser, isDbUser } from "./users";


export const getMyNotifications = query({
  args: {},
  handler: async (ctx) => {
    // Use getAuthUser (returns null) instead of requireAuthUser (throws)
    // This prevents crash when Clerk user hasn't been synced to Convex yet
    const user = await getAuthUser(ctx);
    if (!isDbUser(user)) return [];
    
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
  },
});


export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);
    const notification = await ctx.db.get(args.notificationId);
    
    if (!notification) throw new Error("Notification not found");
    if (notification.userId !== user._id) throw new Error("Unauthorized");
    
    await ctx.db.patch(args.notificationId, { isRead: true });
    return true;
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuthUser(ctx);
    
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id).eq("isRead", false))
      .collect();
      
    for (const notif of unreadNotifications) {
      await ctx.db.patch(notif._id, { isRead: true });
    }
    
    return true;
  },
});
