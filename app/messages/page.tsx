"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Search, Loader2, ShieldCheck, ShieldAlert, MessageSquare, ChevronRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { ChatBox } from "@/components/chat";

export default function MessagesPage() {
  const { user, isLoaded } = useUser();
  const [activeConvId, setActiveConvId] = useState<Id<"conversations"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const conversations = useQuery(api.conversations.listMyConversations, isLoaded && user ? {} : "skip");

  const filteredConversations = (conversations || []).filter((conv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const otherName = (conv.otherUser?.displayName || "").toLowerCase();
    const lastMsg = (conv.lastMessageText || "").toLowerCase();
    return otherName.includes(q) || lastMsg.includes(q);
  });

  return (
    <div className="container py-8 max-w-7xl h-[calc(100vh-76px)]">
      <div className="flex h-full bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Sidebar */}
        <div className="w-[320px] sm:w-[360px] border-r border-border flex flex-col bg-background/50 shrink-0">
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-heading font-black text-xl text-text">Messages</h1>
              <span className="bg-primary/10 border border-primary/20 text-primary-hover px-2.5 py-0.5 rounded-full text-xs font-bold">
                {conversations?.length || 0} Threads
              </span>
            </div>
            <div className="bg-elevated border border-border rounded-xl px-3 py-2.5 flex items-center">
              <Search size={16} className="text-text-muted mr-2" />
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
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center p-8 text-text-muted text-xs">
                <p className="font-bold text-text mb-1">No conversations found</p>
                <p>Start a trade or open a support ticket to start chatting.</p>
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
                      isActive ? "bg-primary/10 border-l-primary" : "bg-transparent border-l-transparent hover:bg-elevated/50"
                    }`}
                  >
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
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-xs font-bold text-text truncate">
                            {otherName}
                          </p>
                          {isDispute && (
                            <span className="bg-warning/20 text-warning text-[9px] font-black px-1 rounded">
                              DISPUTE
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-text-muted shrink-0 ml-1">
                          {new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
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
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                <MessageSquare size={28} />
              </div>
              <h3 className="font-heading font-black text-base text-text mb-1">Select a Conversation</h3>
              <p className="text-xs max-w-sm text-text-muted">
                Connect directly with buyers, sellers, or support agents with escrow protection and safe credential transfer.
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
