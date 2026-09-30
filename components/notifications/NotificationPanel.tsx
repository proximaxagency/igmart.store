"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "@convex-dev/auth/react";
import {
  Bell, Check, CheckCheck, Trash2, X, ShoppingBag,
  MessageSquare, ShieldCheck, AlertCircle, Coins, Clock,
  ExternalLink, Sparkles, Filter, ChevronRight
} from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: "order_created" | "order_updated" | "payment_success" | "new_message" | "support_reply" | "listing_approved" | "security_alert";
  isRead: boolean;
  createdAt: number;
  link?: string;
}

// Realistic default notifications for demonstration / new users
const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Order Payment Cleared",
    body: "Order #259646cd funds ($12.59) released to your wallet from TradeShield escrow.",
    type: "payment_success",
    isRead: false,
    createdAt: Date.now() - 1000 * 60 * 12, // 12 mins ago
    link: "/seller/wallet",
  },
  {
    id: "notif-2",
    title: "New Customer Inquiry",
    body: "Buyer asked about Town Hall 15 Clash of Clans instant delivery warranty.",
    type: "new_message",
    isRead: false,
    createdAt: Date.now() - 1000 * 60 * 45, // 45 mins ago
    link: "/messages",
  },
  {
    id: "notif-3",
    title: "New Account Sale Recorded",
    body: "Congratulations! Your listing 'TH14 Max Heroes + 6000 Gems' has been purchased.",
    type: "order_created",
    isRead: false,
    createdAt: Date.now() - 1000 * 60 * 180, // 3 hours ago
    link: "/seller/dashboard/orders",
  },
  {
    id: "notif-4",
    title: "Merchant Level Up: Verified Seller",
    body: "Your identity KYC documentation was approved. Automated instant delivery is now unlocked.",
    type: "listing_approved",
    isRead: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    link: "/seller/verification",
  },
  {
    id: "notif-5",
    title: "Security Shield Active",
    body: "2-Factor Authentication & IP protection enabled for your Merchant account.",
    type: "security_alert",
    isRead: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
    link: "/account/settings",
  },
];

export default function NotificationPanel() {
  const { isAuthenticated } = useConvexAuth();
  const dbNotifications = useQuery(api.notifications.getMyNotifications, isAuthenticated ? {} : "skip");
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "orders" | "messages">("all");
  const [localDismissed, setLocalDismissed] = useState<string[]>([]);
  const [readOverrides, setReadOverrides] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Combine live and sample notifications
  const allNotifications: NotificationItem[] = React.useMemo(() => {
    let combined: NotificationItem[] = [];

    if (dbNotifications && dbNotifications.length > 0) {
      combined = dbNotifications.map((n: any) => ({
        id: n._id,
        title: n.title,
        body: n.body,
        type: n.type || "order_updated",
        isRead: readOverrides[n._id] ?? n.isRead,
        createdAt: n.createdAt,
        link: n.link,
      }));
    } else {
      // Use sample notifications if DB has none yet
      combined = SAMPLE_NOTIFICATIONS.map((n) => ({
        ...n,
        isRead: readOverrides[n.id] ?? n.isRead,
      }));
    }

    return combined.filter((n) => !localDismissed.includes(n.id));
  }, [dbNotifications, readOverrides, localDismissed]);

  const unreadCount = allNotifications.filter((n) => !n.isRead).length;

  // Filter based on active tab
  const filteredNotifications = allNotifications.filter((n) => {
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "orders") return n.type === "order_created" || n.type === "order_updated" || n.type === "payment_success";
    if (activeTab === "messages") return n.type === "new_message" || n.type === "support_reply";
    return true;
  });

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setReadOverrides((prev) => ({ ...prev, [id]: true }));
    try {
      if (isAuthenticated && !id.startsWith("notif-")) {
        await markAsRead({ notificationId: id as any });
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    const newOverrides: Record<string, boolean> = {};
    allNotifications.forEach((n) => {
      newOverrides[n.id] = true;
    });
    setReadOverrides((prev) => ({ ...prev, ...newOverrides }));
    try {
      if (isAuthenticated) {
        await markAllAsRead();
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLocalDismissed((prev) => [...prev, id]);
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "order_created":
      case "order_updated":
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={15} />
          </div>
        );
      case "payment_success":
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Coins size={15} />
          </div>
        );
      case "new_message":
      case "support_reply":
        return (
          <div className="w-8 h-8 rounded-lg bg-sky-400/10 text-sky-400 border border-sky-400/20 flex items-center justify-center flex-shrink-0">
            <MessageSquare size={15} />
          </div>
        );
      case "listing_approved":
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={15} />
          </div>
        );
      case "security_alert":
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={15} />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* ── Trigger Bell Button ── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="View notifications"
        aria-expanded={isOpen}
        className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
          isOpen
            ? "text-amber-400 bg-amber-400/10 border border-amber-400/30 shadow-sm"
            : "text-text-muted hover:text-text hover:bg-elevated border border-transparent"
        }`}
      >
        <Bell size={19} className={isOpen ? "text-amber-400" : undefined} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[17px] h-[17px] bg-red-500 text-white font-black text-[10px] rounded-full flex items-center justify-center px-1 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Popover Panel (No gap glitch, solid container) ── */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] bg-[#121622] border border-[#1e2436] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] z-[250] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-[#1e2436] bg-[#0e121c]/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-sm text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-black bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full">
                  {unreadCount} NEW
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center px-3 py-2 border-b border-[#1e2436] bg-[#121622] gap-1 overflow-x-auto text-[11px] font-bold">
            {[
              { id: "all", label: "All" },
              { id: "unread", label: `Unread (${unreadCount})` },
              { id: "orders", label: "Orders & Sales" },
              { id: "messages", label: "Chat" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-amber-400 text-black shadow-sm font-black"
                    : "text-gray-400 hover:text-white hover:bg-[#1a2030]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#1e2436]/60">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <Check size={18} />
                </div>
                <p className="text-xs font-bold text-white">All Caught Up!</p>
                <p className="text-[11px] text-gray-400 max-w-[200px] mx-auto">
                  You have no pending notifications in this section.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isUnread = !notif.isRead;
                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 flex items-start gap-3 transition-colors group relative ${
                      isUnread
                        ? "bg-[#141a2b] hover:bg-[#182035]"
                        : "bg-[#121622] hover:bg-[#161c2c]"
                    }`}
                  >
                    {/* Icon */}
                    {getNotificationIcon(notif.type)}

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <Link
                          href={notif.link || "#"}
                          onClick={() => {
                            if (isUnread) setReadOverrides((p) => ({ ...p, [notif.id]: true }));
                            setIsOpen(false);
                          }}
                          className={`text-xs font-bold transition-colors line-clamp-1 hover:underline ${
                            isUnread ? "text-white" : "text-gray-300"
                          }`}
                        >
                          {notif.title}
                        </Link>
                        <span className="text-[10px] text-gray-500 font-mono flex-shrink-0">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
                        {notif.body}
                      </p>

                      {/* Bottom action tags */}
                      <div className="flex items-center justify-between mt-2 pt-1">
                        {notif.link ? (
                          <Link
                            href={notif.link}
                            onClick={() => {
                              if (isUnread) setReadOverrides((p) => ({ ...p, [notif.id]: true }));
                              setIsOpen(false);
                            }}
                            className="text-[10px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                          >
                            <span>Open</span>
                            <ChevronRight size={11} />
                          </Link>
                        ) : <div />}

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isUnread && (
                            <button
                              onClick={(e) => handleMarkAsRead(notif.id, e)}
                              className="text-[10px] text-gray-400 hover:text-emerald-400 p-1 rounded hover:bg-white/5"
                              title="Mark as read"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDismiss(notif.id, e)}
                            className="text-[10px] text-gray-400 hover:text-rose-400 p-1 rounded hover:bg-white/5"
                            title="Dismiss"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Unread dot */}
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-2 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-[#0e121c] border-t border-[#1e2436] flex items-center justify-between text-[11px]">
            <Link
              href="/account/settings"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Notification Preferences
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setIsOpen(false)}
              className="text-amber-400 hover:text-amber-300 font-bold transition-colors"
            >
              View Orders
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
