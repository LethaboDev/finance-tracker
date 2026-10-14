"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users, ArrowLeft, Loader2, Trash2, TrendingUp, TrendingDown,
  Wallet, Activity, ShieldCheck, ShieldAlert, DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api, type User, type Transaction, type AdminStats } from "@/lib/api";
import { clearToken, isAuthenticated } from "@/lib/auth";
import { safeDate, fmtDate } from "@/lib/date";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const },
  }),
};

function StatCard({ title, value, icon: Icon, color, sub, index }: {
  title: string; value: string | number; icon: React.ElementType; color: string; sub?: string; index: number;
}) {
  return (
    <motion.div custom={index} variants={fadeUp} initial="hidden" animate="show">
      <Card className="bg-white border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#64748B] font-medium mb-2">{title}</p>
              <p className="text-3xl font-bold text-[#0F172A] tracking-tight">{value}</p>
              {sub && <p className="text-xs text-[#94A3B8] mt-1">{sub}</p>}
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [transactionsError, setTransactionsError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [tab, setTab] = useState<"users" | "transactions">("users");

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(n);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Stats is the admin gate — if this fails you're not admin (or token expired)
      const s = await api.admin.getStats();
      setStats(s);
    } catch {
      if (!isAuthenticated()) {
        router.push("/login");
      } else {
        setForbidden(true);
      }
      setLoading(false);
      return;
    }

    // Load users and transactions independently — one failing won't kill the panel
    setUsersError("");
    setTransactionsError("");
    api.admin.getUsers()
      .then(u => setUsers(u))
      .catch(() => setUsersError("Could not load users — try refreshing."));
    api.admin.getTransactions()
      .then(t => setTransactions(t))
      .catch((e: unknown) => setTransactionsError(
        e instanceof Error ? e.message : "Could not load transactions — try refreshing."
      ));

    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    load();
  }, [load, router]);

  async function handleDeleteUser(id: number) {
    setDeleting(id);
    try {
      await api.admin.deleteUser(id);
      await load();
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-6">
        <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Access Denied</h1>
          <p className="text-[#64748B]">You do not have admin privileges to view this page.</p>
        </div>
        <Button onClick={() => router.push("/dashboard")} className="bg-[#4F46E5] hover:bg-[#4338CA] text-white gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const netBalance = stats ? stats.totalIncome - stats.totalExpenses : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#0F172A]">
              Admin <span className="text-[#4F46E5]">Panel</span>
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { clearToken(); router.push("/"); }} className="text-[#64748B] gap-1.5">
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-[#0F172A]">Platform Overview</h1>
          <p className="text-[#64748B] mt-1">Platform-wide statistics, user management and transactions.</p>
        </motion.div>

        {/* Stats — 5 cards: users, transactions, income, expenses, net */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <StatCard index={0} title="Total Users" value={stats.totalUsers} icon={Users} color="bg-[#EEF2FF] text-[#4F46E5]" sub="Registered accounts" />
            <StatCard index={1} title="Transactions" value={stats.totalTransactions} icon={Activity} color="bg-blue-50 text-blue-600" sub="Across all users" />
            <StatCard index={2} title="Total Income" value={fmt(stats.totalIncome)} icon={TrendingUp} color="bg-green-50 text-green-600" sub="All-time income" />
            <StatCard index={3} title="Total Expenses" value={fmt(stats.totalExpenses)} icon={TrendingDown} color="bg-red-50 text-red-500" sub="All-time expenses" />
            <StatCard
              index={4}
              title="Net Balance"
              value={fmt(netBalance)}
              icon={DollarSign}
              color={netBalance >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-500"}
              sub={netBalance >= 0 ? "Platform surplus" : "Platform deficit"}
            />
          </div>
        )}

        {/* Tab bar */}
        <div className="flex rounded-xl border border-[#E2E8F0] overflow-hidden w-fit bg-white text-sm">
          {(["users", "transactions"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 font-medium transition-colors ${tab === t ? "bg-[#4F46E5] text-white" : "text-[#64748B] hover:bg-[#F8FAFC]"}`}
            >
              {t === "users" ? `Users (${users.length})` : `Transactions (${transactions.length})`}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {tab === "users" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white border-[#E2E8F0] shadow-sm">
              <CardHeader className="px-7 py-5 border-b border-[#F1F5F9]">
                <CardTitle className="text-lg font-bold text-[#0F172A]">All Users</CardTitle>
                <p className="text-sm text-[#64748B] mt-0.5">{users.length} registered account{users.length !== 1 ? "s" : ""}</p>
              </CardHeader>
              <CardContent className="p-0">
                {usersError ? (
                  <div className="py-16 text-center text-red-400">
                    <p className="text-sm font-medium">{usersError}</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="py-16 text-center text-[#94A3B8]">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No users found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F1F5F9]">
                    {users.map((user, i) => (
                        <motion.div
                          key={user.id}
                          custom={i}
                          variants={fadeUp}
                          initial="hidden"
                          animate="show"
                          className="flex items-center justify-between px-7 py-5 hover:bg-[#F8FAFC] transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                              <span className="text-base font-bold text-[#4F46E5]">
                                {(user.fullName ?? user.email ?? "?")[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#0F172A]">{user.fullName ?? "—"}</p>
                              <p className="text-xs text-[#64748B]">{user.email}</p>
                              <p className="text-xs text-[#94A3B8] mt-0.5">
                                {user.transactionCount ?? 0} transaction{(user.transactionCount ?? 0) !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              className={`text-xs font-semibold border-0 px-3 py-1 ${user.role === "ADMIN" ? "bg-[#EEF2FF] text-[#4F46E5]" : "bg-[#F1F5F9] text-[#64748B]"}`}
                            >
                              {user.role}
                            </Badge>
                            {user.role !== "ADMIN" && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deleting === user.id}
                                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-[#94A3B8] hover:text-red-500 hover:bg-red-50 transition-all"
                              >
                                {deleting === user.id
                                  ? <Loader2 className="w-4 h-4 animate-spin" />
                                  : <Trash2 className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Transactions Tab */}
        {tab === "transactions" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white border-[#E2E8F0] shadow-sm">
              <CardHeader className="px-7 py-5 border-b border-[#F1F5F9]">
                <CardTitle className="text-lg font-bold text-[#0F172A]">All Transactions</CardTitle>
                <p className="text-sm text-[#64748B] mt-0.5">{transactions.length} transaction{transactions.length !== 1 ? "s" : ""} across the platform</p>
              </CardHeader>
              <CardContent className="p-0">
                {transactionsError ? (
                  <div className="py-16 text-center text-red-400">
                    <p className="text-sm font-medium">{transactionsError}</p>
                    <p className="text-xs mt-1 text-[#94A3B8]">Raw error — check Azure App Service logs for details.</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="py-16 text-center text-[#94A3B8]">
                    <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No transactions on the platform yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F1F5F9]">
                    {transactions
                      .sort((a, b) => safeDate(b.createdAt ?? b.date).getTime() - safeDate(a.createdAt ?? a.date).getTime())
                      .map((tx, i) => (
                        <motion.div
                          key={tx.id}
                          custom={i}
                          variants={fadeUp}
                          initial="hidden"
                          animate="show"
                          className="flex items-center justify-between px-7 py-5 hover:bg-[#F8FAFC] transition-colors"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === "INCOME" ? "bg-green-50" : "bg-red-50"}`}>
                              {tx.type === "INCOME"
                                ? <TrendingUp className="w-5 h-5 text-green-600" />
                                : <TrendingDown className="w-5 h-5 text-red-500" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#0F172A] truncate">{tx.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs py-0 px-2 bg-[#F1F5F9] text-[#64748B] border-0">
                                  {tx.category}
                                </Badge>
                                <span className="text-xs text-[#94A3B8]">{fmtDate(tx.createdAt ?? tx.date)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                            <Badge className={`text-xs border-0 ${tx.type === "INCOME" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                              {tx.type}
                            </Badge>
                            <span className={`text-base font-bold tabular-nums ${tx.type === "INCOME" ? "text-green-600" : "text-red-500"}`}>
                              {tx.type === "INCOME" ? "+" : "-"}{fmt(tx.amount)}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
