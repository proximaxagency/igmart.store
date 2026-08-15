"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Search, Loader2, MessageSquare } from "lucide-react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { ChatBox } from "@/components/chat";

export default function MessagesPage() {
  const { user, isLoaded } = useUser();
  const [activeConvId, setActiveConvId] = useState<Id<"conversations"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const conversations = useQuery(
    api.conversations.listMyConversations,
    isLoaded && user ? {} : "skip"
  );

  const filteredConversations = (conversations || []).filter((conv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const otherName = (conv.otherUser?.displayName || "").toLowerCase();
    const lastMsg = (conv.lastMessageText || "").toLowerCase();
    return otherName.includes(q) || lastMsg.includes(q);
  });

  // Loading state
  if (!isLoaded) {
    return (
      <div className="container py-8 max-w-7xl h-[calc(100vh-76px)] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // Signed-out state
  if (!user) {
    return (
      <div className="container py-16 max-w-xl mx-auto text-center">
        <div className="bg-card border border-border rounded-2xl p-10 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-5">
            <MessageSquare size={32} />
          </div>
          <h1 className="font-heading font-black text-2xl text-text mb-2">Sign In to Access Messages</h1>
          <p className="text-text-muted text-sm mb-8 leading-relaxed">
            Chat with buyers and sellers, coordinate deliveries, and get real-time support — all in one place.
          </p>
          <SignInButton mode="modal">
            <button className="w-full bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 cursor-pointer">
              Sign In to Chat
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-7xl h-[calc(100vh-76px)]">
      <div className="flex h-full bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl">

        {/* Sidebar */}
        <div className="w-[300px] sm:w-[340px] border-r border-border flex flex-col bg-background/50 shrink-0">
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-heading font-black text-xl text-text">Messages</h1>
              <span className="bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
                {conversations?.length || 0}
              </span>
            </div>
            <div className="bg-elevated border border-border rounded-xl px-3 py-2.5 flex items-center gap-2">
              <Search size={15} className="text-text-muted shrink-0" />
              <input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-text text-xs sm:text-sm w-full placeholder:text-text-muted"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {conversations === undefined ? (
              <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-primary" size={20} />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center p-8 text-text-muted">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-bold text-text text-sm mb-1">
                  {searchQuery ? "No results" : "No conversations yet"}
                </p>
                <p className="text-xs leading-relaxed">
                  {searchQuery
                    ? "Try different keywords."
                    : "Buy or sell a listing to start chatting with other gamers."}
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

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background min-w-0">
          {!activeConvId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-text-muted">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                <MessageSquare size={28} />
              </div>
              <h3 className="font-heading font-black text-base text-text mb-1">Select a Conversation</h3>
              <p className="text-xs max-w-xs text-text-muted leading-relaxed">
                Connect with buyers, sellers, or support agents with full escrow protection.
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
