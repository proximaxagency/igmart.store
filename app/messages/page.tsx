"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Search, MoreVertical, Send, Image as ImageIcon, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function MessagesPage() {
  const { user } = useUser();
  const [activeConvId, setActiveConvId] = useState<Id<"conversations"> | null>(null);
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversations = useQuery(api.conversations.listMyConversations);
  const messages = useQuery(
    api.conversations.listMessages,
    activeConvId ? { conversationId: activeConvId } : "skip"
  );
  
  const sendMessage = useMutation(api.conversations.sendMessage);

  const activeConv = conversations?.find((c) => c._id === activeConvId);

  // Auto-scroll to bottom of messages
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
        type: "text"
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      // fallback handling here
    }
  };

  return (
    <div className="container py-8 max-w-7xl h-[calc(100vh-76px)]">
      <div className="flex h-full bg-surface border border-border rounded-xl overflow-hidden shadow-2xl">
        
        {/* Sidebar */}
        <div className="w-[320px] border-r border-border flex flex-col bg-background/50">
          <div className="p-5 border-b border-border">
            <h1 className="font-heading font-bold text-xl text-text mb-4">Messages</h1>
            <div className="bg-elevated border border-border rounded-lg px-3 py-2 flex items-center">
              <Search size={16} className="text-text-muted mr-2" />
              <input 
                placeholder="Search conversations..." 
                className="bg-transparent border-none outline-none text-text text-[13px] w-full placeholder:text-text-muted" 
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations === undefined ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
            ) : conversations.length === 0 ? (
              <div className="text-center p-8 text-text-muted text-sm">No conversations yet.</div>
            ) : (
              conversations.map((conv) => {
                const isActive = activeConvId === conv._id;
                const otherName = conv.otherUser?.displayName || "Unknown";
                const isUnread = false; // Add unread logic later

                return (
                  <div 
                    key={conv._id} 
                    onClick={() => setActiveConvId(conv._id)}
                    className={`flex items-center gap-3 p-4 cursor-pointer border-l-[3px] border-b border-b-border transition-colors ${
                      isActive ? "bg-primary/5 border-l-primary" : "bg-transparent border-l-transparent hover:bg-elevated/50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-sm" style={{ background: "var(--gradient-brand)" }}>
                      {otherName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className={`text-[14px] truncate ${isUnread ? "font-bold text-text" : "font-semibold text-text-secondary"}`}>
                          {otherName}
                        </p>
                        <span className={`text-[11px] ${isUnread ? "text-primary font-semibold" : "text-text-muted"}`}>
                          {new Date(conv.lastMessageAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`text-[13px] truncate ${isUnread ? "text-text font-medium" : "text-text-muted"}`}>
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
        <div className="flex-1 flex flex-col bg-background">
          {!activeConvId ? (
            <div className="flex-1 flex items-center justify-center text-text-muted">
              Select a conversation to start messaging
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 px-6 border-b border-border flex items-center justify-between bg-surface">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm" style={{ background: "var(--gradient-brand)" }}>
                    {activeConv?.otherUser?.displayName?.substring(0,2).toUpperCase() || "UN"}
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-text">{activeConv?.otherUser?.displayName || "Unknown User"}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_var(--color-success)]" />
                      <span className="text-[12px] text-text-muted font-medium">Online</span>
                    </div>
                  </div>
                </div>
                <button className="text-text-muted hover:text-text transition-colors"><MoreVertical size={20} /></button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                {messages === undefined ? (
                  <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-primary" /></div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex justify-center items-center text-text-muted text-sm">Send a message to start the conversation!</div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.isMe;
                    return (
                      <div key={msg._id} className={`max-w-[75%] ${isMe ? "self-end" : "self-start"}`}>
                        <div 
                          className={`p-3 px-4 text-[14px] leading-relaxed shadow-sm ${
                            isMe 
                              ? "bg-primary text-white rounded-2xl rounded-br-sm" 
                              : "bg-elevated border border-border text-text rounded-2xl rounded-bl-sm"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <p className={`text-[11px] text-text-muted mt-1.5 ${isMe ? "text-right" : "text-left"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Area */}
              <div className="p-5 border-t border-border bg-surface">
                <form onSubmit={handleSend} className="flex items-center gap-3 bg-background border border-border rounded-xl p-2 pl-4 focus-within:border-primary/50 transition-colors shadow-sm">
                  <button type="button" className="text-text-muted hover:text-primary transition-colors"><ImageIcon size={20} /></button>
                  <input 
                    type="text" 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..." 
                    className="flex-1 bg-transparent border-none outline-none text-text text-[14px]" 
                  />
                  <button 
                    type="submit" 
                    disabled={!messageText.trim()}
                    className="bg-primary text-white p-2.5 rounded-lg flex items-center justify-center hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </form>
                <p className="text-[11px] text-text-muted text-center mt-3 font-medium">
                  Keep all communication on IGMART. Do not share external contact info to stay protected by our escrow system.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
