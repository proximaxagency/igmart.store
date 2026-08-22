"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Users, Search, Ban, CheckCircle, Loader2, ShieldCheck, AlertTriangle, Wallet, Plus, Minus } from "lucide-react";
import { useUser } from "@clerk/nextjs";

type ConfirmAction = {
  type: "suspend" | "ban" | "restore" | "role";
  userId: Id<"users">;
  username: string;
  newRole?: string;
} | null;

type WalletModal = {
  userId: Id<"users">;
  username: string;
  currentBalance: number;
} | null;

export default function AdminUsersPage() {
  const { user, isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Wallet state
  const [walletModal, setWalletModal] = useState<WalletModal>(null);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletReason, setWalletReason] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);

  const users = useQuery(api.admin.listUsersAdmin, isLoaded && user ? {
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

  const handleWalletAdjust = async (sign: 1 | -1) => {
    if (!walletModal) return;
    const parsed = parseFloat(walletAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setFeedback({ type: "error", msg: "Enter a valid positive amount." });
      return;
    }
    setWalletLoading(true);
    setFeedback(null);
    try {
      const result = await adjustWallet({
        targetUserId: walletModal.userId,
        amount: sign * parsed,
        reason: walletReason || undefined,
      });
      setFeedback({
        type: "success",
        msg: `${sign > 0 ? "Added" : "Deducted"} $${parsed.toFixed(2)} ${sign > 0 ? "to" : "from"} @${walletModal.username}. New balance: $${result.newBalance.toFixed(2)}`,
      });
      setWalletModal(null);
      setWalletAmount("");
      setWalletReason("");
    } catch (err: any) {
      setFeedback({ type: "error", msg: err.message || "Wallet adjustment failed." });
    } finally {
      setWalletLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-black text-2xl text-text">User Management Desk</h1>
          <p className="text-text-muted text-xs mt-0.5">Control accounts, roles, wallet balances &amp; platform access</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-text placeholder:text-text-muted outline-none focus:border-primary w-full sm:w-52"
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2.5 text-xs text-text outline-none focus:border-primary"
          >
            <option value="">All Roles</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2.5 text-xs text-text outline-none focus:border-primary"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {feedback && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${
          feedback.type === "success" ? "bg-success/10 text-success border border-success/20" : "bg-danger/10 text-danger border border-danger/20"
        }`}>
          {feedback.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {feedback.msg}
        </div>
      )}

      {/* Confirmation Dialog */}
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
                className="flex-1 bg-elevated hover:bg-border text-text font-bold py-2.5 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                disabled={actionLoading}
                className={`flex-1 font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 ${
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

      {/* Wallet Adjustment Modal */}
      {walletModal && (
        <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <Wallet size={24} />
            </div>
            <h3 className="font-heading font-black text-lg text-text text-center mb-1">Wallet Adjustment</h3>
            <p className="text-xs text-text-muted text-center mb-1">@{walletModal.username}</p>
            <p className="text-center mb-5">
              <span className="text-xs text-text-muted">Current balance: </span>
              <span className="font-black text-text text-sm">${walletModal.currentBalance.toFixed(2)}</span>
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                    className="w-full bg-elevated border border-border rounded-xl pl-7 pr-4 py-2.5 text-sm text-text outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Reason (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Refund, Bonus, Correction..."
                  value={walletReason}
                  onChange={(e) => setWalletReason(e.target.value)}
                  className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-muted outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <button
                onClick={() => handleWalletAdjust(1)}
                disabled={walletLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-success hover:opacity-90 text-white font-bold py-2.5 rounded-xl transition-opacity text-sm"
              >
                {walletLoading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                Add
              </button>
              <button
                onClick={() => handleWalletAdjust(-1)}
                disabled={walletLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-danger hover:opacity-90 text-white font-bold py-2.5 rounded-xl transition-opacity text-sm"
              >
                {walletLoading ? <Loader2 size={15} className="animate-spin" /> : <Minus size={15} />}
                Deduct
              </button>
            </div>
            <button
              onClick={() => { setWalletModal(null); setWalletAmount(""); setWalletReason(""); }}
              className="w-full bg-elevated hover:bg-border text-text-muted font-semibold py-2 rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {users === undefined ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={28} /></div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-muted font-bold">
                  <th className="p-4 pl-6">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Wallet</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-elevated/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                          {(u.displayName || u.username).substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text flex items-center gap-1">
                            {u.displayName || u.username}
                            {u.isVerified && <ShieldCheck size={12} className="text-success" />}
                          </p>
                          <p className="text-[11px] text-text-muted">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-mono text-text-muted">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => setConfirm({ type: "role", userId: u._id, username: u.username, newRole: e.target.value })}
                        className="bg-surface border border-border text-xs text-text font-semibold rounded-lg px-2.5 py-1.5 outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="support_agent">Support</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
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
                    <td className="p-4">
                      <button
                        onClick={() => setWalletModal({ userId: u._id, username: u.username, currentBalance: u.walletBalance ?? 0 })}
                        className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-primary border border-border hover:border-primary/40 px-2.5 py-1.5 rounded-lg transition-all"
                      >
                        <Wallet size={12} />
                        ${(u.walletBalance ?? 0).toFixed(2)}
                      </button>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.status === "active" ? (
                          <>
                            <button
                              onClick={() => setConfirm({ type: "suspend", userId: u._id, username: u.username })}
                              className="text-xs font-bold text-warning border border-warning/30 hover:bg-warning/10 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              Suspend
                            </button>
                            <button
                              onClick={() => setConfirm({ type: "ban", userId: u._id, username: u.username })}
                              className="text-xs font-bold text-danger border border-danger/30 hover:bg-danger/10 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <Ban size={12} /> Ban
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirm({ type: "restore", userId: u._id, username: u.username })}
                            className="text-xs font-bold text-success border border-success/30 hover:bg-success/10 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
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
          <div className="p-12 text-center text-text-muted text-sm">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            No users found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
