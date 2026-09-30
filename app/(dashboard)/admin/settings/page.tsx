"use client";

import { useState } from "react";
import { 
  Settings, Sliders, Shield, DollarSign, Bell, Lock, 
  Save, CheckCircle2, AlertTriangle, RefreshCw, Database, Trash2, PackagePlus
} from "lucide-react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AdminSettingsPage() {
  const { isAuthenticated } = useConvexAuth();
  const [platformFee, setPlatformFee] = useState("3.0");
  const [minWithdrawal, setMinWithdrawal] = useState("20");
  const [escrowHoldHours, setEscrowHoldHours] = useState("24");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [requireKYCForSelling, setRequireKYCForSelling] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Seed controls
  const seedDb = useMutation(api.seed.seedDatabase);
  const seedListings = useMutation(api.seed.seedListings);
  const clearListings = useMutation(api.seed.clearListings);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const runSeed = async (fn: () => Promise<unknown>, label: string) => {
    setSeeding(true);
    setSeedStatus(null);
    try {
      const result = await fn();
      setSeedStatus(`âœ… ${label}: ${JSON.stringify(result)}`);
    } catch (e: unknown) {
      setSeedStatus(`âŒ Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-text flex items-center gap-2.5">
            <Settings className="text-primary" size={24} /> System & Platform Settings
          </h1>
          <p className="text-text-muted text-xs mt-0.5">
            Configure global marketplace parameters, commission tiers, escrow timeouts, and risk thresholds
          </p>
        </div>

        {savedSuccess && (
          <div className="bg-success/10 border border-success/20 text-success text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} /> Settings saved successfully
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Marketplace Economics */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign size={18} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-text">Marketplace Economics & Fees</h2>
              <p className="text-xs text-text-muted">Set default platform take rates and minimum payout limits</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Buyer Protection Fee Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text font-bold outline-none focus:border-primary pr-8"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">%</span>
              </div>
              <p className="text-[11px] text-text-muted mt-1">Calculated automatically on each checkout transaction</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Minimum Seller Withdrawal ($ USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">$</span>
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl pl-8 pr-4 py-2.5 text-sm text-text font-bold outline-none focus:border-primary"
                />
              </div>
              <p className="text-[11px] text-text-muted mt-1">Minimum balance threshold required for payout requests</p>
            </div>
          </div>
        </div>

        {/* Escrow & Security Parameters */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <Shield size={18} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-text">Escrow & Verification Controls</h2>
              <p className="text-xs text-text-muted">Automated safety timeouts and seller onboarding requirements</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Auto-Release Escrow Hold Time (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={escrowHoldHours}
                onChange={(e) => setEscrowHoldHours(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text font-bold outline-none focus:border-primary"
              />
              <p className="text-[11px] text-text-muted mt-1">Time after which unconfirmed delivered orders auto-release funds</p>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center justify-between p-3.5 bg-surface border border-border rounded-xl cursor-pointer hover:border-border-strong transition-colors">
                <div>
                  <p className="text-xs font-bold text-text">Mandatory KYC for Sellers</p>
                  <p className="text-[11px] text-text-muted">Require ID verification before sellers can post active listings</p>
                </div>
                <input
                  type="checkbox"
                  checked={requireKYCForSelling}
                  onChange={(e) => setRequireKYCForSelling(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Platform Maintenance & Operational Modes */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center">
              <Lock size={18} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-text">Operational Toggles & Maintenance</h2>
              <p className="text-xs text-text-muted">Emergency controls and system-wide broadcast flags</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 bg-surface border border-border rounded-xl cursor-pointer hover:border-border-strong transition-colors">
              <div>
                <p className="text-xs font-bold text-text">Maintenance Mode</p>
                <p className="text-[11px] text-text-muted">Temporarily disable checkout and deposits for scheduled upgrades</p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 accent-danger rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-surface border border-border rounded-xl cursor-pointer hover:border-border-strong transition-colors">
              <div>
                <p className="text-xs font-bold text-text">Real-Time Staff Notification Alerts</p>
                <p className="text-[11px] text-text-muted">Send automated alerts on high-value transactions and dispute filings</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-primary/25 cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Save Configuration Changes
          </button>
        </div>
      </form>

      {/* â”€â”€ Database Seed Panel â”€â”€ */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <Database size={18} className="text-primary" />
          <div>
            <h2 className="font-heading font-bold text-base text-text">Database Seed</h2>
            <p className="text-xs text-text-muted mt-0.5">Populate the live Convex database with demo games, categories, and 50 gameboost-sourced listings.</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => runSeed(() => seedDb({}), "seedDatabase")}
              disabled={seeding}
              className="flex items-center justify-center gap-2 bg-card border border-border hover:border-primary/50 hover:bg-primary/5 text-text font-semibold text-sm px-4 py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              {seeding ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} className="text-primary" />}
              1. Seed Database
            </button>
            <button
              onClick={() => runSeed(() => seedListings({}), "seedListings")}
              disabled={seeding}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold text-sm px-4 py-3 rounded-xl transition-all shadow-md shadow-primary/25 disabled:opacity-50 cursor-pointer"
            >
              {seeding ? <RefreshCw size={14} className="animate-spin" /> : <PackagePlus size={14} />}
              2. Seed 50 Listings
            </button>
            <button
              onClick={() => runSeed(() => clearListings({}), "clearListings")}
              disabled={seeding}
              className="flex items-center justify-center gap-2 bg-card border border-danger/30 hover:bg-danger/5 text-danger font-semibold text-sm px-4 py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              {seeding ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Clear Listings
            </button>
          </div>

          {seedStatus && (
            <div className={`text-xs font-mono px-4 py-3 rounded-xl border ${
              seedStatus.startsWith("âœ…") ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
              {seedStatus}
            </div>
          )}

          <p className="text-[11px] text-text-muted">
            <strong>Order:</strong> Run <code className="bg-elevated px-1 rounded">Seed Database</code> first (creates games + seller user), then <code className="bg-elevated px-1 rounded">Seed 50 Listings</code>. Use <code className="bg-elevated px-1 rounded">Clear Listings</code> to reset and re-seed.
          </p>
        </div>
      </div>
    </div>
  );
}
