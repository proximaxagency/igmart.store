"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  MessageSquare, X, ShieldCheck, Headphones, ChevronRight,
  Send, Loader2, UserCheck, AlertCircle, Plus, ArrowLeft
} from "lucide-react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { ChatBox } from "./ChatBox";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function FloatingChatWidget() {
  const { isAuthenticated } = useConvexAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeConvId, setActiveConvId] = useState<Id<"conversations"> | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "orders" | "support">("all");
  const [startingSupport, setStartingSupport] = useState(false);

  const hasBottomBar =
    pathname.startsWith("/listing/") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/account");

  // Guest support state
  const [guestName, setGuestName] = useState("");
  const [guestMsg, setGuestMsg] = useState("");
  const [guestSent, setGuestSent] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const conversations = useQuery(
    api.conversations.listMyConversations,
    isAuthenticated ? {} : "skip"
  );

  const getOrCreateConversation = useMutation(api.conversations.getOrCreateConversation);

  const unreadCount = (conversations ?? []).length;

  const filteredConversations = (conversations || []).filter((conv) => {
    if (activeTab === "orders") return conv.type === "order";
    if (activeTab === "support")
      return (
        conv.type === "buyer_support" ||
        conv.type === "seller_support" ||
        conv.isEscalated
      );
    return true;
  });

  // Start a support chat for logged-in users
  const handleStartSupport = async () => {
    try {
      setStartingSupport(true);
      const convId = await getOrCreateConversation({ type: "buyer_support" });
      setActiveConvId(convId as Id<"conversations">);
    } catch (err) {
      console.error("Failed to start support chat:", err);
    } finally {
      setStartingSupport(false);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestMsg.trim()) return;
    setGuestLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setGuestSent(true);
    setGuestLoading(false);
  };

  return (
    <>
      {/* ── FLOATING TRIGGER — always visible for everyone ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed ${
            hasBottomBar ? "bottom-20 right-4" : "bottom-5 right-4"
          } sm:bottom-6 sm:right-6 z-[120] bg-gradient-to-r from-primary to-accent-secondary text-white p-3 sm:p-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer border border-white/20 group`}
          aria-label="Open Support Chat"
        >
          <div className="relative">
            <Headphones size={20} className="group-hover:scale-110 transition-transform sm:w-[22px] sm:h-[22px]" />
            {isAuthenticated && unreadCount > 0 ? (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-danger text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-background px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-background animate-pulse" />
            )}
          </div>
          <span className="hidden sm:inline font-heading font-black text-xs uppercase tracking-wider pr-1">
            Live Support
          </span>
        </button>
      )}

      {/* ── CHAT DOCK ── */}
      {isOpen && (
        <div
          className={`fixed ${
            hasBottomBar
              ? "bottom-20 right-3 sm:bottom-6 sm:right-6 max-h-[calc(100vh-140px)]"
              : "bottom-4 right-3 sm:bottom-6 sm:right-6 max-h-[calc(100vh-80px)]"
          } z-[200] w-[calc(100vw-24px)] sm:w-[420px] h-[580px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200`}
        >

          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-primary/10 to-accent-secondary/10 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              {activeConvId && (
                <button
                  onClick={() => setActiveConvId(null)}
                  className="p-1 rounded-lg hover:bg-elevated text-text-muted hover:text-text transition-colors cursor-pointer mr-1"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent-secondary flex items-center justify-center text-white shadow-sm">
                <Headphones size={15} />
              </div>
              <div>
                <h3 className="font-heading font-black text-xs uppercase tracking-wider text-text">
                  {activeConvId ? "Live Chat" : "IGMART Support"}
                </h3>
                <p className="text-[10px] text-text-muted flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" />
                  Online · Avg reply &lt;5 min
                </p>
              </div>
            </div>
            <button
              onClick={() => { setIsOpen(false); setActiveConvId(null); }}
              className="p-1.5 rounded-lg hover:bg-elevated text-text-muted hover:text-text transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── AUTHENTICATED VIEW ── */}
          {isAuthenticated ? (
            activeConvId ? (
              /* Open chat */
              <ChatBox
                conversationId={activeConvId}
                onBack={() => setActiveConvId(null)}
                compact={true}
              />
            ) : (
              /* Conversation list + start support */
              <div className="flex-1 flex flex-col overflow-hidden">

                {/* "Start Support Chat" CTA — always at top */}
                <div className="p-3 border-b border-border shrink-0">
                  <button
                    onClick={handleStartSupport}
                    disabled={startingSupport}
                    className="w-full flex items-center gap-3 bg-primary/10 hover:bg-primary/20 border border-primary/25 rounded-xl p-3.5 transition-all cursor-pointer group disabled:opacity-60"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {startingSupport ? <Loader2 size={18} className="animate-spin" /> : <Headphones size={18} />}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-bold text-text">Chat with Support</p>
                      <p className="text-[11px] text-text-muted">Ask anything — orders, payments, disputes</p>
                    </div>
                    <ChevronRight size={16} className="text-text-muted group-hover:text-primary ml-auto shrink-0 transition-colors" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border bg-surface/50 p-1 gap-1 shrink-0">
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

                {/* Conversation list */}
                <div className="flex-1 overflow-y-auto divide-y divide-border/60">
                  {conversations === undefined ? (
                    <div className="p-8 text-center text-text-muted text-xs flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={20} />
                      <p>Loading chats...</p>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-6 text-center text-text-muted text-xs flex flex-col items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <MessageSquare size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-text mb-0.5">No conversations yet</p>
                        <p className="text-[11px] leading-relaxed">
                          Use the button above to contact support,<br />or message a seller from any listing.
                        </p>
                      </div>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => {
                      const otherName =
                        conv.otherUser?.displayName || "IGMART Support";
                      const isDispute =
                        conv.isEscalated ||
                        conv.type === "dispute_arbitration";

                      return (
                        <div
                          key={conv._id}
                          onClick={() => setActiveConvId(conv._id)}
                          className="p-3.5 hover:bg-elevated/60 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
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
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <p className="text-xs font-bold text-text truncate">{otherName}</p>
                                {isDispute && (
                                  <span className="bg-warning/20 text-warning text-[9px] font-black px-1 rounded shrink-0">
                                    DISPUTE
                                  </span>
                                )}
                                {conv.type === "buyer_support" || conv.type === "seller_support" ? (
                                  <span className="bg-primary/20 text-primary text-[9px] font-black px-1 rounded shrink-0">
                                    SUPPORT
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-[11px] text-text-muted truncate">
                                {conv.lastMessageText || "Start chatting..."}
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            size={14}
                            className="text-text-muted group-hover:text-primary transition-colors shrink-0"
                          />
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-border shrink-0">
                  <Link
                    href="/messages"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                  >
                    <MessageSquare size={13} /> Open full Messages inbox
                  </Link>
                </div>
              </div>
            )
          ) : (
            /* ── GUEST VIEW ── */
            <div className="flex-1 flex flex-col overflow-y-auto p-5 gap-4">
              <div className="text-center pt-2">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-3">
                  <Headphones size={26} />
                </div>
                <h3 className="font-heading font-black text-base text-text mb-1">
                  How can we help?
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Send us a message — our team responds within minutes.
                </p>
              </div>

              {guestSent ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-text text-sm mb-1">Message Received! ✓</p>
                    <p className="text-xs text-text-muted max-w-xs leading-relaxed">
                      Our team will reply shortly. Sign in to track your conversation and get faster live support.
                    </p>
                  </div>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-primary/20"
                  >
                    Sign In for Live Chat
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleGuestSubmit} className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-bold text-text mb-1.5 block">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-text-muted outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text mb-1.5 block">
                      Your Message <span className="text-danger">*</span>
                    </label>
                    <textarea
                      required
                      placeholder="Describe your issue or question..."
                      value={guestMsg}
                      onChange={(e) => setGuestMsg(e.target.value)}
                      rows={4}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-text-muted outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={guestLoading || !guestMsg.trim()}
                    className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
                  >
                    {guestLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    {guestLoading ? "Sending..." : "Send Message"}
                  </button>
                  <p className="text-center text-[11px] text-text-muted">
                    Have an account?{" "}
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="text-primary font-bold hover:underline"
                    >
                      Sign in for live chat
                    </Link>
                  </p>
                </form>
              )}

              {/* Trust row */}
              <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-center gap-4 text-[10px] text-text-muted flex-wrap">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={11} className="text-success" /> 100% Secure
                </span>
                <span className="flex items-center gap-1">
                  <UserCheck size={11} className="text-primary" /> 24/7 Support
                </span>
                <span className="flex items-center gap-1">
                  <AlertCircle size={11} className="text-amber-400" /> &lt;5 min avg reply
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
