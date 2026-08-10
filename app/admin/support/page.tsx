"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MessageSquare, Send, Search, User, ShieldCheck, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function AdminSupportDeskPage() {
  const { user, isLoaded } = useUser();
  const [activeConvId, setActiveConvId] = useState<Id<"conversations"> | null>(null);
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversations = useQuery(api.admin.listSupportConversations, isLoaded && user ? {} : "skip");
  const messages = useQuery(
    api.conversations.listMessages,
    activeConvId && isLoaded && user ? { conversationId: activeConvId } : "skip"
  );

  const sendMessage = useMutation(api.conversations.sendMessage);

  const activeConv = conversations?.find((c) => c._id === activeConvId);

  // Auto scroll messages to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConvId) return;

    const content = messageText.trim();
    setMessageText("");

    try {
      await sendMessage({
        conversationId: activeConvId,
        content,
        type: "text",
      });
    } catch (err) {
      console.error("Failed to send support response:", err);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] min-h-[550px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-text flex items-center gap-2.5">
            <MessageSquare className="text-primary" size={24} /> Live Support Chat Desk
          </h1>
          <p className="text-text-muted text-xs mt-0.5">Real-time customer support & resolution hub</p>
        </div>
        <div className="flex items-center gap-2 bg-success/10 border border-success/20 text-success text-xs font-bold px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Live Real-Time Socket Active
        </div>
      </div>

      <div className="flex h-[calc(100%-48px)] bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        
        {/* Support Threads Sidebar */}
        <div className="w-[300px] sm:w-[340px] border-r border-border flex flex-col bg-surface/50">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <input
                type="text"
                placeholder="Search customers or tickets..."
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
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-xs">
                No active support chats found.
              </div>
            ) : (
              conversations.map((conv) => {
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
        <div className="flex-1 flex flex-col bg-background">
          {!activeConvId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-muted">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary mb-4">
                <MessageSquare size={32} />
              </div>
              <h3 className="font-heading font-black text-lg text-text mb-1">Select a Chat Thread</h3>
              <p className="text-xs max-w-sm">Choose a customer conversation from the list to start responding live.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 px-6 border-b border-border bg-surface flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-sm">
                    {activeConv?.customerName?.substring(0, 2).toUpperCase() || "CU"}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-text">{activeConv?.customerName}</h3>
                    <p className="text-[11px] text-text-muted flex items-center gap-1">
                      Role: <span className="text-text font-semibold uppercase">{activeConv?.customerRole}</span> · Type: {activeConv?.type}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Stream */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-3.5">
                {messages === undefined ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin text-primary" size={24} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-xs text-text-muted py-8">
                    No messages in this support conversation yet. Type below to send a message.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isStaff = msg.isMe;
                    return (
                      <div
                        key={msg._id}
                        className={`max-w-[80%] ${isStaff ? "self-end" : "self-start"}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-text-muted">
                            {msg.senderName}
                          </span>
                        </div>
                        <div
                          className={`p-3 px-4 text-xs leading-relaxed shadow-sm ${
                            isStaff
                              ? "bg-primary text-white rounded-2xl rounded-tr-none"
                              : "bg-surface border border-border text-text rounded-2xl rounded-tl-none"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <p className={`text-[10px] text-text-muted mt-1 ${isStaff ? "text-right" : "text-left"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t border-border bg-surface">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your official support response..."
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-xs text-text placeholder:text-text-muted outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="bg-primary hover:bg-primary-hover text-white font-bold px-5 py-3 rounded-xl text-xs inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Send Reply <Send size={14} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
