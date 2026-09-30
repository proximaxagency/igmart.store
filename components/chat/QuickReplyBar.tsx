"use client";

import React, { useState } from "react";
import { Zap, ChevronDown, ChevronUp } from "lucide-react";

interface QuickReplyBarProps {
  onSelect: (text: string) => void;
  isSeller?: boolean;
}

const SELLER_TEMPLATES = [
  { emoji: "👋", label: "Greeting", text: "Hi! Thanks for your interest in this account. How can I help you?" },
  { emoji: "✅", label: "Available", text: "Yes, this account is still available! Would you like to proceed with the purchase?" },
  { emoji: "📋", label: "Details", text: "Here are the full account details as listed. Let me know if you need any additional information." },
  { emoji: "💰", label: "Price firm", text: "The price is firm as listed. This is a premium verified account with instant delivery." },
  { emoji: "⚡", label: "Delivery", text: "I offer instant delivery via secure credential transfer. You'll receive full access within minutes of payment." },
  { emoji: "🔐", label: "Credentials sent", text: "Account credentials have been sent securely. Please verify access and confirm delivery." },
  { emoji: "🎉", label: "Thanks", text: "Thank you for your purchase! If you have any issues, please don't hesitate to reach out." },
  { emoji: "⏳", label: "Processing", text: "I'm preparing your account for delivery. Please allow a few minutes while I verify everything." },
];

const BUYER_TEMPLATES = [
  { emoji: "👋", label: "Interested", text: "Hi! I'm interested in this account. Is it still available?" },
  { emoji: "❓", label: "Question", text: "Could you provide more details about this listing?" },
  { emoji: "💰", label: "Negotiate", text: "Would you consider a lower price for this account?" },
  { emoji: "✅", label: "Confirmed", text: "I've confirmed access to the account. Everything looks good, thank you!" },
  { emoji: "⚠️", label: "Issue", text: "I'm having an issue with the account. Could you help me resolve this?" },
];

export function QuickReplyBar({ onSelect, isSeller = false }: QuickReplyBarProps) {
  const [expanded, setExpanded] = useState(false);
  const templates = isSeller ? SELLER_TEMPLATES : BUYER_TEMPLATES;
  const visibleTemplates = expanded ? templates : templates.slice(0, 4);

  return (
    <div className="border-t border-border bg-surface/50">
      <div className="flex items-center gap-1.5 px-3 py-1.5">
        <div className="flex items-center gap-1 text-text-muted shrink-0">
          <Zap size={12} className="text-warning" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Quick</span>
        </div>
        <div className="flex flex-wrap gap-1 flex-1 overflow-hidden">
          {visibleTemplates.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(tpl.text)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-elevated border border-border text-[11px] font-semibold text-text-secondary hover:text-text hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer whitespace-nowrap"
              title={tpl.text}
            >
              <span>{tpl.emoji}</span>
              <span>{tpl.label}</span>
            </button>
          ))}
        </div>
        {templates.length > 4 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-md hover:bg-elevated text-text-muted hover:text-text transition-colors cursor-pointer shrink-0"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}
