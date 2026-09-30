"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Search, Loader2, MessageSquare, ShoppingBag, ShieldAlert, Headphones, Users, ArrowLeft } from "lucide-react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { ChatBox } from "@/components/chat";

type ConvFilter = "all" | "orders" | "direct" | "support";

function MessagesContent() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isLoaded = !isLoading;
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") as Id<"conversations"> | null;

  const [activeConvId, setActiveConvId] = useState<Id<"conversations"> | null>(initialId);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<ConvFilter>("all");

  const conversations = useQuery(
    api.conversations.listMyConversations,
    isAuthenticated ? {} : "skip"
  );

  useEffect(() => {
    if (initialId) {
      setActiveConvId(initialId);
    }
  }, [initialId]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="container py-8 max-w-7xl h-[calc(100vh-76px)] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // Signed-out state
  if (!isAuthenticated) {
    return (
      <div className="container py-16 max-w-xl mx-auto text-center px-4">
        <div className="bg-card border border-border rounded-2xl p-10 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-5">
            <MessageSquare size={32} />
          </div>
          <h1 className="font-heading font-black text-2xl text-text mb-2">Sign In to Access Messages</h1>
          <p className="text-text-muted text-sm mb-8 leading-relaxed">
            Chat with buyers and sellers, coordinate deliveries, and get real-time support — all in one place.
          </p>
          <a href="/login">
            <button className="w-full bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 cursor-pointer">
              Sign In to Chat
            </button>
          </a>
        </div>
      </div>
    );
  }

  const filteredConversations = (conversations || []).filter((conv) => {
    // Tab filter
    if (filterTab === "orders" && conv.type !== "order") return false;
    if (filterTab === "direct" && conv.type !== "buyer_seller") return false;
    if (
      filterTab === "support" &&
      conv.type !== "buyer_support" &&
      conv.type !== "seller_support" &&
      conv.type !== "dispute_arbitration" &&
      !conv.isEscalated
    ) {
      return false;
    }

    // Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const otherName = (conv.otherUser?.displayName || "").toLowerCase();
    const lastMsg = (conv.lastMessageText || "").toLowerCase();
    return otherName.includes(q) || lastMsg.includes(q);
  });

  return (
    <div className="container py-4 sm:py-8 max-w-7xl h-[calc(100vh-80px)] sm:h-[calc(100vh-76px)]">
      <div className="flex h-full bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl relative">

        {/* ── Sidebar (Conversation List) ── */}
        <div
          className={`w-full md:w-[320px] lg:w-[360px] border-r border-border flex flex-col bg-background/50 shrink-0 ${
            activeConvId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header & Search */}
          <div className="p-4 sm:p-5 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="font-heading font-black text-xl text-text flex items-center gap-2">
                Messages
                <span className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                  {conversations?.length || 0}
                </span>
              </h1>
            </div>

            <div className="bg-elevated border border-border rounded-xl px-3 py-2 flex items-center gap-2">
              <Search size={15} className="text-text-muted shrink-0" />
              <input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-text text-xs sm:text-sm w-full placeholder:text-text-muted"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pt-1">
              {[
                { id: "all", label: "All" },
                { id: "orders", label: "Orders" },
                { id: "direct", label: "Direct" },
                { id: "support", label: "Support" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id as ConvFilter)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                    filterTab === tab.id
                      ? "bg-primary text-white shadow-sm"
                      : "bg-elevated text-text-muted hover:text-text hover:bg-elevated/80 border border-border/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {conversations === undefined ? (
              <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-primary" size={20} />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center p-8 text-text-muted">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-bold text-text text-sm mb-1">
                  {searchQuery ? "No matching conversations" : "No conversations yet"}
                </p>
                <p className="text-xs leading-relaxed max-w-xs mx-auto">
                  {searchQuery
                    ? "Try different keywords."
                    : "Browse listings and chat with sellers or buyers directly."}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConvId === conv._id;
                const otherName = conv.otherUser?.displayName || "IGMART Support";
                const isDispute = conv.isEscalated || conv.type === "dispute_arbitration";

                return (
                  <div
                    key={conv._id}
                    onClick={() => setActiveConvId(conv._id)}
                    className={`flex items-center gap-3 p-4 cursor-pointer border-l-[3px] transition-colors ${
                      isActive
                        ? "bg-primary/10 border-l-primary"
                        : "bg-transparent border-l-transparent hover:bg-elevated/50"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 text-sm shadow-sm"
                      style={{
                        background: isDispute
                          ? "linear-gradient(135deg, #F59E0B, #DC2626)"
                          : conv.type === "buyer_seller"
                          ? "linear-gradient(135deg, #10B981, #059669)"
                          : "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                      }}
                    >
                      {otherName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-xs font-bold text-text truncate">{otherName}</p>
                          {isDispute && (
                            <span className="bg-warning/20 text-warning text-[9px] font-black px-1 rounded shrink-0">
                              DISPUTE
                            </span>
                          )}
                          {conv.type === "order" && (
                            <span className="bg-primary/20 text-primary text-[9px] font-black px-1 rounded shrink-0">
                              ORDER
                            </span>
                          )}
                          {conv.type === "buyer_seller" && (
                            <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-1 rounded shrink-0">
                              SELLER
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-text-muted shrink-0 ml-1">
                          {new Date(conv.lastMessageAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted truncate">
                        {conv.lastMessageText || "No messages yet"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Active Chat Area ── */}
        <div
          className={`flex-1 flex flex-col bg-background min-w-0 ${
            activeConvId ? "flex" : "hidden md:flex"
          }`}
        >
          {!activeConvId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-text-muted">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                <MessageSquare size={28} />
              </div>
              <h3 className="font-heading font-black text-base text-text mb-1">Select a Conversation</h3>
              <p className="text-xs max-w-xs text-text-muted leading-relaxed">
                Connect with buyers, sellers, or support agents with full trade protection and quick replies.
              </p>
            </div>
          ) : (
            <ChatBox
              conversationId={activeConvId}
              onBack={() => setActiveConvId(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-8 max-w-7xl h-[calc(100vh-76px)] flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
