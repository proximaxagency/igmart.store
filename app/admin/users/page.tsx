"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Users, Search, Shield, Ban, CheckCircle, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function AdminUsersPage() {
  const { user, isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const users = useQuery(api.admin.listUsersAdmin, isLoaded && user ? {} : "skip");

  const setUserStatus = useMutation(api.admin.setUserStatus);
  const updateUserRole = useMutation(api.users.updateUserRole);

  const filteredUsers = users?.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (targetUserId: Id<"users">, status: "active" | "suspended" | "banned") => {
    try {
      await setUserStatus({
        targetUserId,
        status,
        reason: `Admin manual update to ${status}`,
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleRoleChange = async (targetUserId: Id<"users">, newRole: "buyer" | "seller" | "admin" | "moderator") => {
    try {
      await updateUserRole({
        targetUserId,
        newRole,
      });
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-black text-2xl text-text">User Management Desk</h1>
          <p className="text-text-muted text-xs mt-0.5">Control registered accounts, seller verification & system roles</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search username or email..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-text placeholder:text-text-muted outline-none focus:border-primary"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {users === undefined ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : filteredUsers && filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-muted font-bold">
                  <th className="p-4 pl-6">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-elevated/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                          {(u.displayName || u.username).substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text">{u.displayName || u.username}</p>
                          <p className="text-[11px] text-text-muted">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-mono text-text-muted">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value as any)}
                        className="bg-surface border border-border text-xs text-text font-semibold rounded-lg px-2.5 py-1.5 outline-none focus:border-primary"
                      >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        u.status === "active"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-danger/10 text-danger border-danger/20"
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {u.status === "active" ? (
                        <button
                          onClick={() => handleStatusChange(u._id, "suspended")}
                          className="text-xs font-bold text-danger border border-danger/30 hover:bg-danger/10 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
                        >
                          <Ban size={13} /> Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(u._id, "active")}
                          className="text-xs font-bold text-success border border-success/30 hover:bg-success/10 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
                        >
                          <CheckCircle size={13} /> Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-text-muted text-sm">No users matching search.</div>
        )}
      </div>
    </div>
  );
}
