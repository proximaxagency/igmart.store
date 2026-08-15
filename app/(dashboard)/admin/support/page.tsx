"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MessageSquare, Search, Loader2, CheckCircle2, ShieldCheck, ShieldAlert } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { ChatBox } from "@/components/chat";

export default function AdminSupportDeskPage() {
  const { user, isLoaded } = useUser();
  const [activeConvId, setActiveConvId] = useState<Id<"conversations"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const conversations = useQuery(api.admin.listSupportConversations, isLoaded && user ? {} : "skip");

  const filteredConversations = (conversations || []).filter((conv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const custName = (conv.customerName || "").toLowerCase();
    const lastMsg = (conv.lastMessageText || "").toLowerCase();
    return custName.includes(q) || lastMsg.includes(q);
  });

  return (
    <div className="h-[calc(100vh-140px)] min-h-[550px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-text flex items-center gap-2.5">
            <MessageSquare className="text-primary" size={24} /> Live Support Chat Desk
          </h1>
          <p className="text-text-muted text-xs mt-0.5">Real-time customer support, 3-way dispute arbitration & whisper notes</p>
        </div>
        <div className="flex items-center gap-2 bg-success/10 border border-success/20 text-success text-xs font-bold px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Live Real-Time Socket Active
        </div>
      </div>

      <div className="flex h-[calc(100%-48px)] bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        
        {/* Support Threads Sidebar */}
        <div className="w-[300px] sm:w-[340px] border-r border-border flex flex-col bg-surface/50 shrink-0">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <input
                type="text"
                placeholder="Search customers or tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text placeholder:text-text-muted outline-none focus:border-primary"
              />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/50">
            {conversations === undefined ? (
              <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-xs">
                No active support chats found.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConvId === conv._id;
                return (
                  <div
                    key={conv._id}
                    onClick={() => setActiveConvId(conv._id)}
                    className={`p-4 cursor-pointer transition-all border-l-[3px] ${
                      isActive
                        ? "bg-primary/10 border-l-primary"
                        : "border-l-transparent hover:bg-elevated/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-bold text-sm text-text truncate">
                        {conv.customerName}
                      </p>
                      <span className="text-[10px] text-text-muted">
                        {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted truncate mb-2">
                      {conv.lastMessageText || "Support conversation started"}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-elevated border border-border px-2 py-0.5 rounded text-text-secondary">
                        {conv.type}
                      </span>
                      <span className="text-[10px] text-success font-semibold flex items-center gap-1">
                        <CheckCircle2 size={11} /> Open
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Chat Workspace */}
        <div className="flex-1 flex flex-col bg-background min-w-0">
          {!activeConvId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-muted">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary mb-4">
                <MessageSquare size={32} />
              </div>
              <h3 className="font-heading font-black text-lg text-text mb-1">Select a Chat Thread</h3>
              <p className="text-xs max-w-sm">Choose a customer conversation from the list to start responding live with arbitration tools & staff notes.</p>
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
