"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MessageSquare, X, ShieldCheck, ShieldAlert, Sparkles, User, Store, ChevronRight } from "lucide-react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { ChatBox } from "./ChatBox";

export function FloatingChatWidget() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isLoaded = !isLoading;
  const [isOpen, setIsOpen] = useState(false);
  const [activeConvId, setActiveConvId] = useState<Id<"conversations"> | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "orders" | "support">("all");

  const conversations = useQuery(
    api.conversations.listMyConversations,
    isAuthenticated ? {} : "skip"
  );

  if (!isLoaded || !isAuthenticated) return null;

  const filteredConversations = (conversations || []).filter((conv) => {
    if (activeTab === "orders") return conv.type === "order";
    if (activeTab === "support") return conv.type === "buyer_support" || conv.type === "seller_support" || conv.isEscalated;
    return true;
  });

  return (
    <>
      {/* FLOATING DOCK TRIGGER */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-primary to-accent-secondary text-white p-3.5 rounded-full shadow-2xl hover:scale-105 transition-all duration-200 flex items-center gap-2.5 cursor-pointer border border-white/20 group"
          aria-label="Open Live Chat Desk"
        >
          <div className="relative">
            <MessageSquare size={22} className="group-hover:rotate-6 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-background animate-pulse" />
          </div>
          <span className="hidden sm:inline font-heading font-black text-xs uppercase tracking-wider pr-1">
            Live Chat
          </span>
        </button>
      )}

      {/* EXPANDABLE CHAT DOCK */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] h-[580px] max-h-[calc(100vh-80px)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-surface border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent-secondary flex items-center justify-center text-white shadow-sm">
                <MessageSquare size={16} />
              </div>
              <div>
                <h3 className="font-heading font-black text-xs uppercase tracking-wider text-text">
                  {activeConvId ? "Chat Stream" : "Live Messages & Support"}
                </h3>
                <p className="text-[10px] text-text-muted flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Real-time active
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveConvId(null);
              }}
              className="p-1.5 rounded-lg hover:bg-elevated text-text-muted hover:text-text transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          {activeConvId ? (
            <ChatBox
              conversationId={activeConvId}
              onBack={() => setActiveConvId(null)}
              compact={true}
            />
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden bg-background/50">
              <div className="flex border-b border-border bg-surface/50 p-1 gap-1 shrink-0 text-xs">
                {(["all", "orders", "support"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={"flex-1 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer " + (
                      activeTab === tab
                        ? "bg-card text-primary shadow-sm border border-border"
                        : "text-text-muted hover:text-text"
                    )}
                  >
                    {tab === "all" ? "All" : tab === "orders" ? "Orders" : "Support"}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-border/60">
                {conversations === undefined ? (
                  <div className="p-8 text-center text-text-muted text-xs">Loading chats...</div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-text-muted text-xs">
                    <p className="font-bold text-text mb-1">No conversations found</p>
                    <p className="text-[11px]">When you buy, sell, or contact support, your chats appear here.</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const otherName = conv.otherUser?.displayName || "IGMART Support Desk";
                    const isDispute = conv.isEscalated || conv.type === "dispute_arbitration";

                    return (
                      <div
                        key={conv._id}
                        onClick={() => setActiveConvId(conv._id)}
                        className="p-3 hover:bg-elevated/60 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 text-sm shadow-sm"
                            style={{
                              background: isDispute
                                ? "linear-gradient(135deg, #F59E0B, #DC2626)"
                                : "linear-gradient(135deg, #3B82F6, #8B5CF6)"
                            }}
                          >
                            {otherName.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className="text-xs font-bold text-text truncate">{otherName}</p>
                              {isDispute && (
                                <span className="bg-warning/20 text-warning text-[9px] font-black px-1 rounded">
                                  DISPUTE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-text-muted truncate">
                              {conv.lastMessageText || "Tap to chat..."}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
