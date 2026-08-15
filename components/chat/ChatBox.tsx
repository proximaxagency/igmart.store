"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  ShieldCheck, ShieldAlert, Send, Lock, Key, Copy, Check, Eye, EyeOff,
  HelpCircle, AlertTriangle, User, Store, Loader2, ArrowLeft, MoreVertical,
  Paperclip, Sparkles, MessageSquare
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface ChatBoxProps {
  conversationId: Id<"conversations">;
  onBack?: () => void;
  compact?: boolean;
}

export function ChatBox({ conversationId, onBack, compact = false }: ChatBoxProps) {
  const { user, isLoaded } = useUser();
  const [messageText, setMessageText] = useState("");
  const [isStaffNote, setIsStaffNote] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedCreds, setRevealedCreds] = useState<Record<string, boolean>>({});

  // Credential input state
  const [credLogin, setCredLogin] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [credEmailPass, setCredEmailPass] = useState("");
  const [credNote, setCredNote] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  const convDetails = useQuery(
    api.conversations.getConversationDetails,
    isLoaded && user ? { conversationId } : "skip"
  );

  const messages = useQuery(
    api.conversations.listMessages,
    isLoaded && user ? { conversationId } : "skip"
  );

  const sendMessage = useMutation(api.conversations.sendMessage);
  const escalateToSupport = useMutation(api.conversations.escalateToSupport);
  const joinAsSupportAgent = useMutation(api.conversations.joinAsSupportAgent);

  const isStaff = convDetails?.isStaff ?? false;
  const isEscalated = convDetails?.isEscalated ?? false;
  const orderDetails = convDetails?.orderDetails;

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim()) return;

    const content = messageText.trim();
    setMessageText("");

    try {
      await sendMessage({
        conversationId,
        content,
        type: isStaffNote ? "support_note" : "text",
      });
      setIsStaffNote(false);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleSendCredentials = async () => {
    if (!credLogin.trim() || !credPassword.trim()) return;

    try {
      await sendMessage({
        conversationId,
        content: "🔐 Automated Encrypted Credential Vault Delivered",
        type: "credential_vault",
        metadata: {
          login: credLogin.trim(),
          password: credPassword.trim(),
          emailPass: credEmailPass.trim(),
          note: credNote.trim(),
        },
      });

      setCredLogin("");
      setCredPassword("");
      setCredEmailPass("");
      setCredNote("");
      setShowCredentialModal(false);
    } catch (err) {
      console.error("Failed to send credentials:", err);
    }
  };

  const handleEscalate = async () => {
    if (!escalationReason.trim()) return;
    try {
      await escalateToSupport({
        conversationId,
        reason: escalationReason.trim(),
      });
      setShowEscalateModal(false)
      setEscalationReason("");
    } catch (err) {
      console.error("Failed to escalate:", err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedCreds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!convDetails || messages === undefined) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-card">
        <Loader2 className="animate-spin text-primary mb-3" size={28} />
        <p className="text-xs text-text-muted font-medium">Connecting to secure chat channel...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-card overflow-hidden relative">
      {/* HEADER */}
      <div className="p-3 sm:p-4 border-b border-border bg-surface/80 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-elevated text-text-muted hover:text-text transition-colors sm:hidden"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex items-center -space-x-2">
            {convDetails.participantsData.slice(0, 3).map((p) => (
              <div
                key={p._id}
                className="w-8 h-8 rounded-full border-2 border-surface flex items-center justify-center font-bold text-xs text-white shadow-sm"
                style={{
                  background: p.role === "admin" || p.role === "support_agent"
                    ? "linear-gradient(135deg, #F59E0B, #D97706)"
                    : p.role === "seller"
                    ? "linear-gradient(135deg, #8B5CF6, #6D28D9)"
                    : "linear-gradient(135deg, #3B82F6, #1D4ED8)"
                }}
              >
                {p.displayName.substring(0, 1).toUpperCase()}
              </div>
            ))}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-sm text-text truncate">
                {convDetails.type === "order" ? ("Order #" + (orderDetails?.orderNumber || "Trade")) : "Live Channel"}
              </h2>
              {isEscalated ? (
                <span className="inline-flex items-center gap-1 bg-warning/15 border border-warning/30 text-warning px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
                  <ShieldAlert size={10} /> 3-Way Dispute Room
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-success/15 border border-success/30 text-success px-2 py-0.5 rounded-full text-[10px] font-bold">
                  <ShieldCheck size={10} /> Escrow Protected
                </span>
              )}
            </div>
            <p className="text-[11px] text-text-muted truncate">
              {convDetails.participantsData.map((p) => p.displayName).join(" • ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isEscalated && (
            <button
              onClick={() => setShowEscalateModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 bg-elevated hover:bg-warning/10 hover:border-warning/40 border border-border text-text-secondary hover:text-warning px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <HelpCircle size={13} /> Summon Support Agent
            </button>
          )}
          {isStaff && !convDetails.participants.includes(convDetails.currentUserId) && (
            <button
              onClick={() => joinAsSupportAgent({ conversationId })}
              className="bg-amber-500 hover:bg-amber-600 text-black px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 shadow-md shadow-amber-500/20"
            >
              <ShieldCheck size={14} /> Join as Agent
            </button>
          )}
        </div>
      </div>

      {/* ESCROW / ORDER STATUS BAR */}
      {orderDetails && (
        <div className="bg-primary/5 border-b border-border/80 px-4 py-2 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-text truncate">{orderDetails.listingTitle}</span>
            <span className="text-text-muted">•</span>
            <span className="font-extrabold text-primary">${orderDetails.totalAmount.toFixed(2)}</span>
          </div>
          <span className="bg-surface border border-border px-2 py-0.5 rounded-md font-bold text-[10px] text-text-secondary uppercase">
            Status: {orderDetails.status}
          </span>
        </div>
      )}

      {/* SAFETY NOTICE BANNER */}
      <div className="bg-elevated/40 border-b border-border/50 px-4 py-1.5 flex items-center justify-between text-[11px] text-text-muted">
        <span className="flex items-center gap-1.5">
          <Lock size={11} className="text-primary" /> Never share passwords or make payments outside IGMART Escrow.
        </span>
        <span className="text-[10px] text-success font-bold hidden sm:inline">24/7 Monitored</span>
      </div>

      {/* MESSAGES STREAM */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-muted">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
              <MessageSquare size={24} />
            </div>
            <p className="text-sm font-bold text-text mb-1">Encrypted Room Started</p>
            <p className="text-xs max-w-xs text-text-muted">
              You are communicating safely. Use the tools below to send messages, credentials, or invite support.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.isMe;
            const isSystem = msg.type === "system";
            const isStaffNoteMsg = msg.type === "support_note";
            const isCredVault = msg.type === "credential_vault";

            if (isSystem) {
              return (
                <div key={msg._id} className="flex justify-center my-2">
                  <div className="bg-surface border border-border/80 text-text-secondary px-3.5 py-1.5 rounded-full text-[11px] font-medium max-w-lg text-center shadow-sm">
                    {msg.content}
                  </div>
                </div>
              );
            }

            if (isStaffNoteMsg) {
              return (
                <div key={msg._id} className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 my-2 text-xs">
                  <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Lock size={12} /> Staff Internal Whisper (Hidden from customers)
                    </span>
                    <span className="text-[10px] text-amber-400/80">{msg.senderName}</span>
                  </div>
                  <p className="text-amber-200/90 leading-relaxed">{msg.content}</p>
                </div>
              );
            }

            if (isCredVault && msg.metadata) {
              const { login, password, emailPass, note } = msg.metadata;
              const isRevealed = revealedCreds[msg._id] || false;

              return (
                <div key={msg._id} className="max-w-md mx-auto my-3 bg-card border-2 border-primary/40 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                        <Key size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text">Encrypted Credential Vault</h4>
                        <p className="text-[10px] text-text-muted">Delivered via Escrow Protection</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleReveal(msg._id)}
                      className="text-text-muted hover:text-text text-xs flex items-center gap-1 bg-elevated px-2 py-1 rounded-md cursor-pointer"
                    >
                      {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                      {isRevealed ? "Hide" : "Reveal"}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="bg-background/80 border border-border rounded-lg p-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-text-muted block font-sans">LOGIN / USERNAME:</span>
                        <span className="text-text font-bold">{isRevealed ? login : "••••••••••••"}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(login, "login-" + msg._id)}
                        className="text-primary hover:text-primary-hover p-1.5 rounded-md hover:bg-elevated cursor-pointer"
                        title="Copy Username"
                      >
                        {copiedId === ("login-" + msg._id) ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div className="bg-background/80 border border-border rounded-lg p-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-text-muted block font-sans">PASSWORD:</span>
                        <span className="text-text font-bold">{isRevealed ? password : "••••••••••••"}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(password, "pass-" + msg._id)}
                        className="text-primary hover:text-primary-hover p-1.5 rounded-md hover:bg-elevated cursor-pointer"
                        title="Copy Password"
                      >
                        {copiedId === ("pass-" + msg._id) ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                      </button>
                    </div>

                    {emailPass && (
                      <div className="bg-background/80 border border-border rounded-lg p-2.5 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-text-muted block font-sans">EMAIL ACCESS / 2FA:</span>
                          <span className="text-text font-bold">{isRevealed ? emailPass : "••••••••••••"}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(emailPass, "mail-" + msg._id)}
                          className="text-primary hover:text-primary-hover p-1.5 rounded-md hover:bg-elevated cursor-pointer"
                          title="Copy Email Pass"
                        >
                          {copiedId === ("mail-" + msg._id) ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                        </button>
                      </div>
                    )}

                    {note && (
                      <div className="text-[11px] text-text-muted bg-elevated/40 p-2 rounded-lg font-sans">
                        <strong className="text-text">Note:</strong> {note}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg._id}
                className={"flex flex-col " + (isMe ? "items-end" : "items-start")}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[11px] font-bold text-text-secondary">
                    {isMe ? "You" : msg.senderName}
                  </span>
                  {msg.isStaffSender ? (
                    <span className="bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase flex items-center gap-0.5">
                      <ShieldCheck size={9} /> Staff
                    </span>
                  ) : msg.senderRole === "seller" ? (
                    <span className="bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                      Seller
                    </span>
                  ) : (
                    <span className="bg-blue-500/20 text-blue-300 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                      Buyer
                    </span>
                  )}
                  <span className="text-[10px] text-text-muted">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div
                  className={"max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-sm " + (
                    isMe
                      ? "bg-primary text-white rounded-tr-none font-medium"
                      : msg.isStaffSender
                      ? "bg-amber-500/10 border border-amber-500/30 text-text rounded-tl-none"
                      : "bg-surface border border-border text-text rounded-tl-none"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QUICK SHORTCUTS TOOLBAR */}
      <div className="px-4 py-2 border-t border-border bg-surface/50 flex flex-wrap items-center gap-2 text-xs shrink-0">
        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Actions:</span>
        {(convDetails.currentUserRole === "seller" || isStaff) && (
          <button
            onClick={() => setShowCredentialModal(true)}
            className="bg-primary/10 hover:bg-primary/20 text-primary-hover border border-primary/25 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Key size={12} /> Send Credentials Safely
          </button>
        )}
        {isStaff && (
          <button
            onClick={() => setIsStaffNote(!isStaffNote)}
            className={"px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer " + (
              isStaffNote
                ? "bg-amber-500 text-black border-amber-500"
                : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30"
            )}
          >
            <Lock size={12} /> {isStaffNote ? "Whisper Mode Active" : "Add Staff Note"}
          </button>
        )}
        {!isEscalated && (
          <button
            onClick={() => setShowEscalateModal(true)}
            className="sm:hidden text-text-muted hover:text-warning text-xs flex items-center gap-1 bg-elevated px-2 py-1 rounded-md cursor-pointer"
          >
            <HelpCircle size={12} /> Escalate
          </button>
        )}
      </div>

      {/* INPUT FORM */}
      <form onSubmit={handleSend} className="p-3 border-t border-border bg-surface flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder={isStaffNote ? "Write staff-only note (invisible to customers)..." : "Type a message..."}
          className={"flex-1 bg-background border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-text outline-none transition-all placeholder:text-text-muted " + (
            isStaffNote ? "border-amber-500/50 focus:border-amber-500 ring-1 ring-amber-500/20" : "border-border focus:border-primary"
          )}
        />
        <button
          type="submit"
          disabled={!messageText.trim()}
          className={"p-2.5 rounded-xl font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer " + (
            isStaffNote ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-primary hover:bg-primary-hover"
          )}
        >
          <Send size={16} />
        </button>
      </form>

      {/* ESCALATION MODAL */}
      {showEscalateModal && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-5 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-2.5 text-warning mb-3">
              <AlertTriangle size={22} />
              <h3 className="font-heading font-black text-base text-text">Summon Support Agent</h3>
            </div>
            <p className="text-xs text-text-muted mb-4 leading-relaxed">
              This will escalate your order conversation into a <strong>3-Way Arbitration Room</strong>. An official IGMART support agent will step in to inspect trade logs and verify delivery.
            </p>
            <label className="block text-xs font-bold text-text mb-1">Reason for Escalation</label>
            <select
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-text outline-none mb-4"
            >
              <option value="">Select a reason...</option>
              <option value="Seller hasn't sent credentials">Seller hasn't sent credentials</option>
              <option value="Credentials invalid or password incorrect">Credentials invalid or password incorrect</option>
              <option value="Account features differ from listing description">Account features differ from listing description</option>
              <option value="Buyer unresponsive after delivery">Buyer unresponsive after delivery</option>
              <option value="Need support agent trade assistance">Need support agent trade assistance</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEscalateModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-elevated hover:bg-border text-text cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEscalate}
                disabled={!escalationReason}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-warning hover:bg-warning/90 text-black disabled:opacity-40 cursor-pointer"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREDENTIAL DELIVERY MODAL */}
      {showCredentialModal && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-5 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-2.5 text-primary mb-3">
              <Key size={20} />
              <h3 className="font-heading font-black text-base text-text">Safe Credential Vault</h3>
            </div>
            <p className="text-xs text-text-muted mb-4">
              Credentials are encrypted and securely embedded into the chat stream with copy buttons.
            </p>
            <div className="space-y-3 mb-4 text-xs">
              <div>
                <label className="block font-bold text-text mb-1">Login / Username *</label>
                <input
                  type="text"
                  placeholder="e.g. clash_player_99"
                  value={credLogin}
                  onChange={(e) => setCredLogin(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-text outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-bold text-text mb-1">Password *</label>
                <input
                  type="text"
                  placeholder="e.g. SupercellPass2026!"
                  value={credPassword}
                  onChange={(e) => setCredPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-text outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-bold text-text mb-1">Email / 2FA Recovery (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. mailpass123 or backup codes"
                  value={credEmailPass}
                  onChange={(e) => setCredEmailPass(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-text outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-bold text-text mb-1">Instructions for Buyer</label>
                <textarea
                  placeholder="e.g. Log in with Supercell ID, link your personal email."
                  value={credNote}
                  onChange={(e) => setCredNote(e.target.value)}
                  rows={2}
                  className="w-full bg-background border border-border rounded-lg p-2 text-text outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCredentialModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-elevated hover:bg-border text-text cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendCredentials}
                disabled={!credLogin || !credPassword}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white disabled:opacity-40 cursor-pointer"
              >
                Deliver Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
