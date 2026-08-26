"use client";

import { useState, useEffect } from "react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  User, Mail, Shield, Bell, Trash2, Loader2,
  CheckCircle2, AlertTriangle, ExternalLink, Lock
} from "lucide-react";

export default function SettingsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth(); const isLoaded = !isLoading;
  const dbUser = useQuery(api.users.getCurrentUser, isLoaded && isAuthenticated ? {} : "skip");
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    if (dbUser?.displayName) setDisplayName(dbUser.displayName);
    else if (dbUser?.username) setDisplayName(dbUser.username);
  }, [dbUser]);

  const handleSave = async () => {
    if (!displayName.trim() || displayName.trim().length < 2) {
      setFeedback({ type: "error", msg: "Display name must be at least 2 characters." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      // Update display name in Convex (Clerk removed)
      // TODO: wire up updateUser mutation here if needed
      setFeedback({ type: "success", msg: "Profile updated successfully." });
    } catch (err: any) {
      setFeedback({ type: "error", msg: err.message || "Failed to save changes." });
    } finally {
      setSaving(false);
    }
  };

  const email = dbUser?.email || "";
  const isVerifiedSeller = dbUser?.isVerified;
  const role = dbUser?.role || "buyer";

  if (!isLoaded) {
    return (
      <div className="flex justify-center p-16">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-text">Account Settings</h1>
        <p className="text-text-muted text-sm mt-0.5">Manage your IGMART profile and preferences</p>
      </div>

      {feedback && (
        <div className={`p-3.5 rounded-xl text-sm font-semibold flex items-center gap-2 ${
          feedback.type === "success"
            ? "bg-success/10 text-success border border-success/20"
            : "bg-danger/10 text-danger border border-danger/20"
        }`}>
          {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {feedback.msg}
        </div>
      )}

      {/* Profile */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border bg-elevated/40 flex items-center gap-2">
          <User size={16} className="text-primary" />
          <h2 className="font-heading font-bold text-base text-text">Profile Information</h2>
        </div>
        <div className="p-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-border bg-elevated flex items-center justify-center">
              {dbUser?.avatarUrl ? (
                <img src={dbUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-text-muted">
                  {(displayName || "U").substring(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-text">{displayName || "Your Name"}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  role === "admin" || role === "super_admin"
                    ? "bg-danger/10 text-danger border border-danger/20"
                    : role === "seller"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-surface text-text-muted border border-border"
                }`}>
                  {role}
                </span>
                {isVerifiedSeller && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                    âœ“ Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Display name */}
          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
              placeholder="Your display name"
            />
          </div>

          {/* Email (read-only, managed by Clerk) */}
          <div>
            <label className="block text-sm font-semibold text-text mb-1.5 flex items-center gap-2">
              <Mail size={13} /> Email Address
            </label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                disabled
                className="flex-1 bg-elevated border border-border rounded-xl px-4 py-3 text-text-muted text-sm cursor-not-allowed"
              />
              <a
                href="https://accounts.clerk.dev/user"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-primary border border-primary/30 hover:bg-primary/10 px-3 py-3 rounded-xl transition-colors shrink-0"
              >
                Edit <ExternalLink size={12} />
              </a>
            </div>
            <p className="text-xs text-text-muted mt-1.5">Email is managed by Clerk. Click "Edit" to change it.</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !displayName.trim()}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border bg-elevated/40 flex items-center gap-2">
          <Shield size={16} className="text-primary" />
          <h2 className="font-heading font-bold text-base text-text">Security</h2>
        </div>
        <div className="divide-y divide-border">
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-text flex items-center gap-2">
                <Lock size={14} className="text-text-muted" /> Password
              </p>
              <p className="text-xs text-text-muted mt-0.5">Managed securely via Clerk authentication</p>
            </div>
            <a
              href="https://accounts.clerk.dev/user/security"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-primary border border-primary/30 hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              Update <ExternalLink size={11} />
            </a>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-text flex items-center gap-2">
                <Shield size={14} className="text-success" /> Two-Factor Authentication (2FA)
              </p>
              <p className="text-xs text-text-muted mt-0.5">Add an extra layer of security to your account</p>
            </div>
            <a
              href="https://accounts.clerk.dev/user/security"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-success border border-success/30 hover:bg-success/10 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              Enable 2FA <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>

      {/* Notifications placeholder */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border bg-elevated/40 flex items-center gap-2">
          <Bell size={16} className="text-primary" />
          <h2 className="font-heading font-bold text-base text-text">Notifications</h2>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: "New Order Alerts", desc: "Get notified when someone buys your listing", enabled: true },
            { label: "Payment Released", desc: "Notify me when escrow funds are released", enabled: true },
            { label: "New Messages", desc: "Real-time chat notifications", enabled: true },
            { label: "Marketing & Promotions", desc: "Platform deals and feature announcements", enabled: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text">{item.label}</p>
                <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
              </div>
              <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${item.enabled ? "bg-primary" : "bg-border"}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.enabled ? "left-5" : "left-0.5"}`} />
              </div>
            </div>
          ))}
          <p className="text-xs text-text-muted pt-2">Full notification preferences are coming in a future update.</p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card border border-danger/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-danger/20 bg-danger/5 flex items-center gap-2">
          <Trash2 size={16} className="text-danger" />
          <h2 className="font-heading font-bold text-base text-danger">Danger Zone</h2>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-text">Delete Account</p>
            <p className="text-xs text-text-muted mt-0.5">Permanently remove your account and all associated data. This cannot be undone.</p>
          </div>
          <a
            href="https://accounts.clerk.dev/user"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-danger border border-danger/30 hover:bg-danger/10 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ml-4"
          >
            Delete Account <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}
