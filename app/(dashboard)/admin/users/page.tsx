"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { 
  Users, Search, Ban, CheckCircle, Loader2, ShieldCheck, AlertTriangle, 
  Wallet, Plus, Minus, Bell, Send, ArrowUpRight, ArrowDownRight, RefreshCw,
  Mail, UserCheck, ShieldAlert, Sparkles, DollarSign
} from "lucide-react";
import { useConvexAuth } from "@convex-dev/auth/react";

type ConfirmAction = {
  type: "suspend" | "ban" | "restore" | "role";
  userId: Id<"users">;
  username: string;
  newRole?: string;
} | null;

type WalletModalData = {
  userId: Id<"users">;
  username: string;
  email: string;
  currentBalance: number;
} | null;

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

const COMMON_REASONS = [
  "Dispute resolution / Refund",
  "Promotional bonus / Reward",
  "Compensation for technical delay",
  "Administrative balance correction",
  "Fee adjustment / Waiver",
  "Custom manual adjustment",
];

export default function AdminUsersPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Wallet Management Modal State
  const [walletModal, setWalletModal] = useState<WalletModalData>(null);
  const [walletMode, setWalletMode] = useState<"credit" | "debit">("credit");
  const [walletAmount, setWalletAmount] = useState("");
  const [walletReason, setWalletReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [walletNotificationMessage, setWalletNotificationMessage] = useState("");
  const [sendNotification, setSendNotification] = useState(true);
  const [walletLoading, setWalletLoading] = useState(false);

  const users = useQuery(api.admin.listUsersAdmin, isAuthenticated ? {
    searchTerm: searchTerm || undefined,
    roleFilter: roleFilter || undefined,
    statusFilter: statusFilter || undefined,
  } : "skip");

  const setUserStatus = useMutation(api.admin.setUserStatus);
  const updateUserRole = useMutation(api.users.updateUserRole);
  const adjustWallet = useMutation(api.users.adminAdjustWallet);

  const executeAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      if (confirm.type === "suspend") {
        await setUserStatus({ targetUserId: confirm.userId, status: "suspended", reason: "Suspended by admin" });
        setFeedback({ type: "success", msg: `@${confirm.username} has been suspended.` });
      } else if (confirm.type === "ban") {
        await setUserStatus({ targetUserId: confirm.userId, status: "banned", reason: "Banned by admin" });
        setFeedback({ type: "success", msg: `@${confirm.username} has been banned.` });
      } else if (confirm.type === "restore") {
        await setUserStatus({ targetUserId: confirm.userId, status: "active", reason: "Restored by admin" });
        setFeedback({ type: "success", msg: `@${confirm.username} has been restored.` });
      } else if (confirm.type === "role" && confirm.newRole) {
        await updateUserRole({ targetUserId: confirm.userId, newRole: confirm.newRole as any });
        setFeedback({ type: "success", msg: `@${confirm.username} role updated to ${confirm.newRole}.` });
      }
    } catch (err: any) {
      setFeedback({ type: "error", msg: err.message || "Action failed" });
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletModal) return;
    const parsed = parseFloat(walletAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setFeedback({ type: "error", msg: "Please enter a valid positive dollar amount." });
      return;
    }

    const sign = walletMode === "credit" ? 1 : -1;
    const finalAmount = sign * parsed;
    const calculatedNewBalance = walletModal.currentBalance + finalAmount;

    if (calculatedNewBalance < 0) {
      setFeedback({ type: "error", msg: `Cannot deduct $${parsed.toFixed(2)}. User only has $${walletModal.currentBalance.toFixed(2)}.` });
      return;
    }

    const effectiveReason = walletReason === "Custom manual adjustment" && customReason.trim()
      ? customReason.trim()
      : walletReason;

    setWalletLoading(true);
    setFeedback(null);
    try {
      const result = await adjustWallet({
        targetUserId: walletModal.userId,
        amount: finalAmount,
        reason: effectiveReason,
        notificationMessage: sendNotification ? walletNotificationMessage.trim() || undefined : undefined,
      });

      setFeedback({
        type: "success",
        msg: `${walletMode === "credit" ? "Added" : "Deducted"} $${parsed.toFixed(2)} ${walletMode === "credit" ? "to" : "from"} @${walletModal.username}. New balance: $${result.newBalance.toFixed(2)}${sendNotification ? " (Notification sent)" : ""}`,
      });

      // Reset modal
      setWalletModal(null);
      setWalletAmount("");
      setCustomReason("");
      setWalletNotificationMessage("");
    } catch (err: any) {
      setFeedback({ type: "error", msg: err.message || "Wallet adjustment failed." });
    } finally {
      setWalletLoading(false);
    }
  };

  const parsedAmount = parseFloat(walletAmount) || 0;
  const previewNewBalance = walletModal
    ? walletMode === "credit"
      ? walletModal.currentBalance + parsedAmount
      : Math.max(0, walletModal.currentBalance - parsedAmount)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl pb-20">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
              Staff Administration
            </span>
            <span className="text-[10px] bg-success/10 text-success font-bold px-2 py-0.5 rounded-md border border-success/20">
              Live Wallet Control
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-text flex items-center gap-2.5">
            <Users className="text-primary" size={28} /> User Management &amp; Wallet Desk
          </h1>
          <p className="text-text-muted text-sm mt-1">
            View user profiles, modify roles/permissions, and instantly add or deduct wallet balances with notification alerts.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, @handle..."
              className="bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-text placeholder:text-text-muted outline-none focus:border-primary/60 w-full sm:w-64 transition-all"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2.5 text-xs text-text font-semibold outline-none focus:border-primary/60 transition-all cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="support_agent">Support Agent</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2.5 text-xs text-text font-semibold outline-none focus:border-primary/60 transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* ── Feedback Banner ── */}
      {feedback && (
        <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-3 border shadow-sm ${
          feedback.type === "success" ? "bg-success/10 text-success border-success/20" : "bg-danger/10 text-danger border-danger/20"
        }`}>
          {feedback.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* ── Wallet Adjustment Modal ── */}
      {walletModal && (
        <div className="fixed inset-0 z-[400] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
                  <Wallet size={22} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-text">Adjust User Wallet</h3>
                  <p className="text-xs text-text-muted">
                    @{walletModal.username} · <span className="font-mono">{walletModal.email}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWalletModal(null)}
                className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-elevated transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWalletSubmit} className="space-y-5">
              {/* Credit vs Debit Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-elevated/70 p-1.5 rounded-2xl border border-border">
                <button
                  type="button"
                  onClick={() => setWalletMode("credit")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    walletMode === "credit"
                      ? "bg-success text-white shadow-md shadow-success/20 scale-[1.02]"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  <ArrowUpRight size={16} /> Add Money (Credit)
                </button>
                <button
                  type="button"
                  onClick={() => setWalletMode("debit")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    walletMode === "debit"
                      ? "bg-danger text-white shadow-md shadow-danger/20 scale-[1.02]"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  <ArrowDownRight size={16} /> Subtract Money (Debit)
                </button>
              </div>

              {/* Balance comparison card */}
              <div className="grid grid-cols-2 gap-3 bg-elevated/40 border border-border rounded-2xl p-4">
                <div>
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Current Balance</p>
                  <p className="font-heading font-black text-xl text-text mt-0.5">
                    ${walletModal.currentBalance.toFixed(2)}
                  </p>
                </div>
                <div className="border-l border-border pl-4">
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">New Balance After</p>
                  <p className={`font-heading font-black text-xl mt-0.5 ${
                    walletMode === "credit" ? "text-success" : "text-warning"
                  }`}>
                    ${previewNewBalance.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1.5">
                  Amount to {walletMode === "credit" ? "Add" : "Subtract"} (USD) <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-base font-bold">$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                    required
                    className="w-full bg-background border border-border rounded-2xl pl-8 pr-4 py-3 text-base font-bold text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-text-muted/40"
                  />
                </div>

                {/* Quick preset amount chips */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWalletAmount(amt.toString())}
                      className="text-xs font-bold bg-elevated hover:bg-primary/10 hover:text-primary hover:border-primary/40 border border-border text-text-muted px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason Selection */}
              <div>
                <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1.5">
                  Transaction Reason <span className="text-danger">*</span>
                </label>
                <select
                  value={walletReason}
                  onChange={(e) => setWalletReason(e.target.value)}
                  className="w-full bg-background border border-border rounded-2xl px-3.5 py-2.5 text-xs text-text font-semibold outline-none focus:border-primary transition-colors cursor-pointer mb-2"
                >
                  {COMMON_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                {walletReason === "Custom manual adjustment" && (
                  <input
                    type="text"
                    placeholder="Enter custom reason for transaction history..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-text outline-none focus:border-primary transition-colors"
                  />
                )}
              </div>

              {/* Notification to User */}
              <div className="bg-elevated/30 border border-border rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-text cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendNotification}
                      onChange={(e) => setSendNotification(e.target.checked)}
                      className="accent-primary w-4 h-4 rounded cursor-pointer"
                    />
                    <Bell size={14} className="text-primary" />
                    <span>Send Notification Message to User</span>
                  </label>
                  <span className="text-[10px] text-text-muted">In-App Alert</span>
                </div>

                {sendNotification && (
                  <div>
                    <textarea
                      rows={2}
                      placeholder={`Optional custom message to @${walletModal.username} (e.g. "We have credited your account for Order #1234 dispute...")`}
                      value={walletNotificationMessage}
                      onChange={(e) => setWalletNotificationMessage(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl p-3 text-xs text-text placeholder:text-text-muted/60 outline-none focus:border-primary resize-y"
                    />
                    <p className="text-[10px] text-text-muted mt-1">
                      If left blank, a default notification with the amount &amp; reason will be delivered.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWalletModal(null)}
                  className="flex-1 bg-elevated hover:bg-border text-text font-bold py-3 rounded-xl transition-colors text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={walletLoading || !parsedAmount}
                  className={`flex-1 font-heading font-black py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 text-white shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    walletMode === "credit"
                      ? "bg-success hover:opacity-90 shadow-success/20"
                      : "bg-danger hover:opacity-90 shadow-danger/20"
                  }`}
                >
                  {walletLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : walletMode === "credit" ? (
                    <>
                      <Plus size={16} /> Credit ${parsedAmount.toFixed(2)}
                    </>
                  ) : (
                    <>
                      <Minus size={16} /> Deduct ${parsedAmount.toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm Role / Suspend Dialog ── */}
      {confirm && (
        <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="font-heading font-black text-lg text-text text-center mb-2">Confirm Action</h3>
            <p className="text-sm text-text-muted text-center mb-6">
              {confirm.type === "suspend" && `Suspend @${confirm.username}? They will lose access immediately.`}
              {confirm.type === "ban" && `Permanently ban @${confirm.username}? This is a severe action.`}
              {confirm.type === "restore" && `Restore @${confirm.username}'s account to active?`}
              {confirm.type === "role" && `Change @${confirm.username}'s role to "${confirm.newRole}"?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 bg-elevated hover:bg-border text-text font-bold py-2.5 rounded-xl transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                disabled={actionLoading}
                className={`flex-1 font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer ${
                  confirm.type === "restore" ? "bg-success hover:bg-success text-white" : "bg-danger hover:opacity-90 text-white"
                }`}
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                {confirm.type === "restore" ? "Restore" : confirm.type === "role" ? "Confirm" : "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Users Data Table ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {users === undefined ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3 text-text-muted">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-xs font-semibold">Loading user accounts...</p>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-surface border-b border-border text-[11px] uppercase tracking-wider text-text-muted font-bold">
                  <th className="p-4 pl-6">User Account</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Wallet Balance</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-elevated/40 transition-colors">
                    {/* User info */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-black flex items-center justify-center text-xs border border-primary/20 flex-shrink-0">
                          {(u.displayName || u.username || "U").substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-text flex items-center gap-1.5 truncate">
                            {u.displayName || u.username}
                            {u.isVerified && <ShieldCheck size={14} className="text-success flex-shrink-0" />}
                          </p>
                          <p className="text-[11px] text-text-muted truncate">
                            @{u.username} · Joined {new Date(u.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-4 text-xs font-mono text-text-muted">{u.email}</td>

                    {/* Role dropdown */}
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => setConfirm({ type: "role", userId: u._id, username: u.username, newRole: e.target.value })}
                        className="bg-surface border border-border text-xs text-text font-bold rounded-lg px-2.5 py-1.5 outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="support_agent">Support Agent</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        u.status === "active"
                          ? "bg-success/10 text-success border-success/20"
                          : u.status === "suspended"
                          ? "bg-warning/10 text-warning border-warning/20"
                          : "bg-danger/10 text-danger border-danger/20"
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    {/* Wallet Balance & Quick Adjust */}
                    <td className="p-4">
                      <div className="inline-flex items-center gap-2 bg-elevated/60 border border-border rounded-xl px-3 py-1.5">
                        <span className="font-heading font-black text-sm text-text">
                          ${(u.walletBalance ?? 0).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setWalletModal({
                            userId: u._id,
                            username: u.username,
                            email: u.email,
                            currentBalance: u.walletBalance ?? 0,
                          })}
                          title="Manage wallet balance"
                          className="w-6 h-6 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 flex items-center justify-center transition-colors cursor-pointer text-xs font-bold"
                        >
                          <Wallet size={12} />
                        </button>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Open Wallet Button */}
                        <button
                          type="button"
                          onClick={() => setWalletModal({
                            userId: u._id,
                            username: u.username,
                            email: u.email,
                            currentBalance: u.walletBalance ?? 0,
                          })}
                          className="flex items-center gap-1.5 text-xs font-bold text-primary border border-primary/30 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <DollarSign size={13} />
                          <span>Wallet</span>
                        </button>

                        {/* Suspend / Ban / Restore */}
                        {u.status === "active" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setConfirm({ type: "suspend", userId: u._id, username: u.username })}
                              className="text-xs font-bold text-warning border border-warning/30 hover:bg-warning/10 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              Suspend
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirm({ type: "ban", userId: u._id, username: u.username })}
                              className="text-xs font-bold text-danger border border-danger/30 hover:bg-danger/10 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Ban size={12} /> Ban
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirm({ type: "restore", userId: u._id, username: u.username })}
                            className="text-xs font-bold text-success border border-success/30 hover:bg-success/10 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle size={12} /> Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-text-muted text-sm space-y-2">
            <Users size={40} className="mx-auto text-text-muted/30" />
            <p className="font-bold text-text">No users found</p>
            <p className="text-xs">No accounts matched your search criteria or role filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
