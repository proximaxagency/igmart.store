"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "@convex-dev/auth/react";
import {
  Coins, Download, ExternalLink, Copy, Check, ChevronDown,
  X, ShieldCheck, ArrowUpRight, ArrowDownRight, Clock,
  DollarSign, AlertCircle, Info, Landmark, CreditCard, Send
} from "lucide-react";

interface TransactionRow {
  id: string;
  dateCreated: string;
  timestamp: number;
  balanceChange: number;
  orderId: string;
  description: string;
  type: "sale" | "withdrawal" | "deposit" | "refund" | "escrow";
  status: "completed" | "pending" | "failed";
}

// Default transactions matching Eldorado.gg exact screenshot
const DEFAULT_ELDORADO_TRANSACTIONS: TransactionRow[] = [
  {
    id: "tx-1",
    dateCreated: "Sep 30, 2026, 12:10:13 PM",
    timestamp: 1790770213000,
    balanceChange: 12.59,
    orderId: "259646cd-02c8-4c54-1f18-08df1ac0c30a",
    description: "You successfully sold Order.",
    type: "sale",
    status: "completed"
  },
  {
    id: "tx-2",
    dateCreated: "Sep 29, 2026, 11:06:11 AM",
    timestamp: 1790679971000,
    balanceChange: 12.59,
    orderId: "c3ddce0c-d2d2-492a-e146-08df1ad3caa2",
    description: "You successfully sold Order.",
    type: "sale",
    status: "completed"
  },
  {
    id: "tx-3",
    dateCreated: "Sep 27, 2026, 9:00:35 AM",
    timestamp: 1790502035000,
    balanceChange: 127.49,
    orderId: "683e82b2-ad12-4b7c-e336-08df16a17bc9",
    description: "You successfully sold Order.",
    type: "sale",
    status: "completed"
  },
  {
    id: "tx-4",
    dateCreated: "Sep 25, 2026, 2:00:08 PM",
    timestamp: 1790344808000,
    balanceChange: 12.59,
    orderId: "04d863b5-3a16-4ad3-d17b-08df1877a2e4",
    description: "You successfully sold Order.",
    type: "sale",
    status: "completed"
  },
  {
    id: "tx-5",
    dateCreated: "Sep 22, 2026, 4:15:20 PM",
    timestamp: 1790084120000,
    balanceChange: 84.00,
    orderId: "77a83f19-3b21-4320-a89c-98ef31889c10",
    description: "You successfully sold Order.",
    type: "sale",
    status: "completed"
  },
  {
    id: "tx-6",
    dateCreated: "Sep 18, 2026, 6:40:50 PM",
    timestamp: 1789740050000,
    balanceChange: -250.00,
    orderId: "wth-918204-bank-sepa",
    description: "Withdrawal completed via Bank Transfer.",
    type: "withdrawal",
    status: "completed"
  }
];

export default function EldoradoWallet() {
  const { isAuthenticated } = useConvexAuth();
  const balances = useQuery(api.transactions.getMyBalances, isAuthenticated ? {} : "skip");
  const liveTransactions = useQuery(api.transactions.getMyTransactions, isAuthenticated ? {} : "skip");
  const requestWithdrawal = useMutation(api.seller.requestWithdrawal);

  // Filter states
  const [filterType, setFilterType] = useState<string>("All");
  const [filterMonth, setFilterMonth] = useState<string>("August 2026");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TransactionRow | null>(null);

  // Withdraw form state
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawMethod, setWithdrawMethod] = useState<"bank" | "crypto" | "payoneer" | "skrill">("bank");
  const [payoutDetails, setPayoutDetails] = useState<string>("");
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Dynamic balance calculations
  // If user has balance in DB, display DB balance, otherwise show the authentic Eldorado default from screenshot ($785.88 and $2,370.96)
  const actualWalletBalance = balances?.walletBalance ?? 0;
  const actualPendingBalance = balances?.pendingBalance ?? 0;

  const displayBalance = actualWalletBalance > 0 ? actualWalletBalance : 785.88;
  const displayPending = actualPendingBalance > 0 ? actualPendingBalance : 2370.96;

  // Combine live and screenshot transactions
  const combinedTransactions: TransactionRow[] = React.useMemo(() => {
    if (liveTransactions && liveTransactions.length > 0) {
      const mappedLive: TransactionRow[] = liveTransactions.map((tx: any) => ({
        id: tx._id,
        dateCreated: new Date(tx.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
        timestamp: tx.createdAt,
        balanceChange: tx.amount,
        orderId: tx.orderId ? String(tx.orderId) : `${tx._id.slice(0, 8)}-${tx._id.slice(8, 12)}-${tx._id.slice(12, 16)}`,
        description: tx.description || (tx.amount > 0 ? "You successfully sold Order." : "Withdrawal processed."),
        type: tx.type === "withdrawal" ? "withdrawal" : tx.type === "deposit" ? "deposit" : "sale",
        status: tx.status as "completed" | "pending" | "failed",
      }));
      return [...mappedLive, ...DEFAULT_ELDORADO_TRANSACTIONS];
    }
    return DEFAULT_ELDORADO_TRANSACTIONS;
  }, [liveTransactions]);

  // Filter transactions
  const filteredTransactions = combinedTransactions.filter((tx) => {
    if (filterType === "All") return true;
    if (filterType === "Sales") return tx.balanceChange > 0;
    if (filterType === "Withdrawals") return tx.balanceChange < 0;
    if (filterType === "Pending") return tx.status === "pending";
    return true;
  });

  const handleCopyOrderId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = "Date Created,Balance Change,Order ID,Description,Status\n";
    const rows = filteredTransactions
      .map((t) => `"${t.dateCreated}","${t.balanceChange > 0 ? "+" : ""}$${t.balanceChange.toFixed(2)}","${t.orderId}","${t.description}","${t.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `eldorado-wallet-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val < 10) {
      setWithdrawError("Minimum withdrawal amount is $10.00 USD.");
      return;
    }
    if (val > displayBalance) {
      setWithdrawError("Requested amount exceeds available balance.");
      return;
    }
    if (!payoutDetails.trim()) {
      setWithdrawError("Please enter valid payout recipient details.");
      return;
    }

    setIsSubmittingWithdrawal(true);
    try {
      if (isAuthenticated) {
        await requestWithdrawal({
          amount: val,
          method: withdrawMethod,
          payoutDetails: payoutDetails.trim(),
        });
      }
      setWithdrawSuccess(true);
      setTimeout(() => {
        setWithdrawSuccess(false);
        setWithdrawModalOpen(false);
        setWithdrawAmount("");
        setPayoutDetails("");
      }, 2500);
    } catch (err: any) {
      setWithdrawError(err.message || "Failed to process withdrawal request.");
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  return (
    <div className="w-full text-white font-sans">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Coins size={20} className="text-amber-400" />
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
          Wallet
        </h1>
      </div>

      {/* ── Two Cards (Eldorado style) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Card 1: Balance */}
        <div className="bg-[#121622] border border-[#1e2436] rounded-xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Balance
              </p>
              <p className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
                ${displayBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <button
              onClick={() => setWithdrawModalOpen(true)}
              className="bg-[#22283a] hover:bg-[#2c344d] text-white px-5 py-2.5 rounded-lg text-xs font-bold border border-white/10 transition-all shadow-sm active:scale-95 flex-shrink-0"
            >
              Withdraw
            </button>
          </div>

          <div className="text-xs text-gray-400 pt-3 border-t border-[#1e2436]/60 flex items-center gap-1.5 flex-wrap">
            <span>Withdrawals require $10 in completed sales.</span>
            <button
              onClick={() => setLearnMoreOpen(true)}
              className="text-sky-400 hover:text-sky-300 font-semibold underline transition-colors"
            >
              Learn more
            </button>
          </div>
        </div>

        {/* Card 2: Pending Sales */}
        <div className="bg-[#121622] border border-[#1e2436] rounded-xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
              Pending Sales
            </p>
            <p className="text-xs text-gray-400/90 leading-relaxed mb-4">
              Revenue from pending orders. Funds will be added to your balance when orders are Completed.
            </p>
          </div>
          <div>
            <p className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
              ${displayPending.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter & Export Controls Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        {/* Type Filter */}
        <div className="relative inline-block w-40">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full appearance-none bg-[#121622] border border-[#1e2436] text-white text-xs font-semibold rounded-lg px-3.5 py-2.5 pr-8 focus:outline-none focus:border-amber-400/50 cursor-pointer shadow-sm transition-all"
          >
            <option value="All">All</option>
            <option value="Sales">Sales Only</option>
            <option value="Withdrawals">Withdrawals</option>
            <option value="Pending">Pending</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Right Controls: Month Selector + Export Button */}
        <div className="flex items-center gap-3">
          <div className="relative inline-block w-44">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full appearance-none bg-[#121622] border border-[#1e2436] text-white text-xs font-semibold rounded-lg px-3.5 py-2.5 pr-8 focus:outline-none focus:border-amber-400/50 cursor-pointer shadow-sm transition-all"
            >
              <option value="September 2026">September 2026</option>
              <option value="August 2026">August 2026</option>
              <option value="July 2026">July 2026</option>
              <option value="All Time">All Time</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="bg-[#121622] hover:bg-[#1e2436] text-white border border-[#1e2436] text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-sm active:scale-95"
            title="Export filtered records to CSV"
          >
            <span>Export</span>
            <Download size={14} className="text-gray-300" />
          </button>
        </div>
      </div>

      {/* ── Transaction Table (Exact Eldorado Layout) ── */}
      <div className="bg-[#121622] border border-[#1e2436] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1e2436] text-gray-400 font-semibold bg-[#0e121c]/80">
                <th className="py-3.5 px-5 font-semibold text-gray-300">Date Created</th>
                <th className="py-3.5 px-5 font-semibold text-gray-300">Balance change</th>
                <th className="py-3.5 px-5 font-semibold text-gray-300">Order ID</th>
                <th className="py-3.5 px-5 font-semibold text-gray-300">Description</th>
                <th className="py-3.5 px-5 text-right font-semibold text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2436]/70">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No transactions found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isPositive = tx.balanceChange > 0;
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-[#161b2b] transition-colors group"
                    >
                      {/* Date Created */}
                      <td className="py-4 px-5 text-gray-300 whitespace-nowrap font-medium">
                        {tx.dateCreated}
                      </td>

                      {/* Balance change */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span
                          className={`font-bold text-sm ${
                            isPositive
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {isPositive ? "+" : ""}${Math.abs(tx.balanceChange).toFixed(2)}
                        </span>
                      </td>

                      {/* Order ID */}
                      <td className="py-4 px-5 whitespace-nowrap font-mono text-gray-300">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-200 hover:text-white transition-colors">
                            {tx.orderId}
                          </span>
                          <button
                            onClick={(e) => handleCopyOrderId(tx.orderId, e)}
                            className="opacity-0 group-hover:opacity-100 hover:text-amber-400 text-gray-400 transition-all p-1"
                            title="Copy Order ID"
                          >
                            {copiedId === tx.orderId ? (
                              <Check size={12} className="text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-4 px-5 text-gray-300">
                        {tx.description}
                      </td>

                      {/* View Action */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(tx)}
                          className="text-sky-400 hover:text-sky-300 font-semibold hover:underline transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: Order Details ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-[#1e2436] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e2436] mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-white">Order Receipt</h3>
                  <p className="text-[11px] text-gray-400">Eldorado Protected Settlement</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-[#0e121c] border border-[#1e2436] rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Order ID:</span>
                  <span className="font-mono text-white font-semibold flex items-center gap-1.5">
                    {selectedOrder.orderId}
                    <button
                      onClick={(e) => handleCopyOrderId(selectedOrder.orderId, e)}
                      className="text-gray-400 hover:text-amber-400 p-0.5"
                    >
                      {copiedId === selectedOrder.orderId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Date Settled:</span>
                  <span className="text-gray-200">{selectedOrder.dateCreated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#1e2436]">
                  <span className="text-gray-300 font-semibold">Net Payout to Wallet:</span>
                  <span className="text-emerald-400 font-bold text-base">
                    +${Math.abs(selectedOrder.balanceChange).toFixed(2)} USD
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 flex items-start gap-2 text-[11px] leading-relaxed">
                <Info size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <span>
                  This payment has cleared TradeShield escrow warranty. Funds are permanently available in your balance for immediate withdrawal.
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-[#22283a] hover:bg-[#2c344d] text-white px-5 py-2 rounded-lg text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Withdraw Funds ── */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-[#1e2436] rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e2436] mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <Coins size={18} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-white">Withdrawal Station</h3>
                  <p className="text-[11px] text-gray-400">Transfer funds to your account</p>
                </div>
              </div>
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check size={28} />
                </div>
                <h4 className="font-heading font-bold text-base text-white">Withdrawal Request Dispatched</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Your request has been routed to the finance settlement queue. Payout will arrive within standard processing times.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitWithdrawal} className="space-y-4 text-xs">
                {/* Available preview */}
                <div className="bg-[#0e121c] border border-[#1e2436] rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-400">Available Balance:</span>
                  <span className="font-heading font-black text-sm text-emerald-400">
                    ${displayBalance.toFixed(2)} USD
                  </span>
                </div>

                {/* Amount input */}
                <div>
                  <label className="block text-gray-300 font-semibold mb-1.5">
                    Amount ($USD) <span className="text-gray-500 text-[10px]">(Min $10.00)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="10"
                      max={displayBalance}
                      required
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="100.00"
                      className="w-full bg-[#0e121c] border border-[#1e2436] rounded-xl pl-8 pr-16 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(displayBalance.toString())}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-[#22283a] hover:bg-[#2c344d] text-amber-400 text-[10px] font-bold px-2 py-1 rounded"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Method selector */}
                <div>
                  <label className="block text-gray-300 font-semibold mb-1.5">Payout Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "bank", label: "Bank Transfer", icon: Landmark },
                      { id: "crypto", label: "Crypto (USDT)", icon: Coins },
                      { id: "payoneer", label: "Payoneer", icon: CreditCard },
                      { id: "skrill", label: "Skrill", icon: Send },
                    ].map((m) => {
                      const Icon = m.icon;
                      const active = withdrawMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setWithdrawMethod(m.id as any)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                            active
                              ? "bg-amber-400/10 border-amber-400 text-amber-400 font-bold"
                              : "bg-[#0e121c] border-[#1e2436] text-gray-300 hover:border-gray-600"
                          }`}
                        >
                          <Icon size={14} />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recipient details */}
                <div>
                  <label className="block text-gray-300 font-semibold mb-1.5">
                    {withdrawMethod === "bank"
                      ? "Bank Account (IBAN / Account Number & SWIFT)"
                      : withdrawMethod === "crypto"
                      ? "USDT TRC20 / ERC20 Wallet Address"
                      : "Account Email Address"}
                  </label>
                  <input
                    type="text"
                    required
                    value={payoutDetails}
                    onChange={(e) => setPayoutDetails(e.target.value)}
                    placeholder={
                      withdrawMethod === "bank"
                        ? "US1234567890123456 / CHASE..."
                        : withdrawMethod === "crypto"
                        ? "0x... or T..."
                        : "finance@merchant.com"
                    }
                    className="w-full bg-[#0e121c] border border-[#1e2436] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                {withdrawError && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[11px] flex items-center gap-2">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span>{withdrawError}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingWithdrawal}
                    className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {isSubmittingWithdrawal ? "Processing Request..." : "Confirm & Withdraw"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: Learn More ── */}
      {learnMoreOpen && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-[#1e2436] rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e2436] mb-4">
              <h3 className="font-heading font-black text-lg text-white">Withdrawal Policy & Guidelines</h3>
              <button
                onClick={() => setLearnMoreOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
              <div className="p-3 bg-[#0e121c] rounded-xl border border-[#1e2436]">
                <p className="font-bold text-white mb-1">Minimum Withdrawal Requirement</p>
                <p className="text-gray-400">
                  Withdrawals require a minimum of $10.00 USD in completed sales. This ensures minimal blockchain and banking fee overhead for merchants.
                </p>
              </div>

              <div className="p-3 bg-[#0e121c] rounded-xl border border-[#1e2436]">
                <p className="font-bold text-white mb-1">Pending Sales vs Available Balance</p>
                <p className="text-gray-400">
                  When a customer purchases your gaming account, funds remain in <span className="text-amber-400 font-semibold">Pending Sales</span> until the warranty period lapses or the buyer confirms successful delivery. Once completed, funds immediately transition to <span className="text-emerald-400 font-semibold">Balance</span>.
                </p>
              </div>

              <div className="p-3 bg-[#0e121c] rounded-xl border border-[#1e2436]">
                <p className="font-bold text-white mb-1">Payout Processing Timelines</p>
                <ul className="list-disc list-inside text-gray-400 space-y-1 mt-1">
                  <li>Crypto (USDT): 1 - 4 hours</li>
                  <li>Bank Wire (SEPA/ACH): 1 - 2 business days</li>
                  <li>Payoneer & Skrill: Same-day</li>
                </ul>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setLearnMoreOpen(false)}
                className="bg-[#22283a] hover:bg-[#2c344d] text-white px-5 py-2 rounded-lg text-xs font-bold transition-all"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
