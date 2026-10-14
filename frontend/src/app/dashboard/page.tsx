"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Wallet, Plus, Trash2, LogOut,
  Loader2, X, CheckCircle2, ShieldCheck, BarChart3,
  ArrowUpRight, ArrowDownRight, Lightbulb, Quote, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, type Transaction, type CreateTransaction } from "@/lib/api";
import { clearToken, getFullName, isAuthenticated } from "@/lib/auth";
import { safeDate, fmtDate } from "@/lib/date";

const CATEGORIES = ["Food", "Transport", "Housing", "Entertainment", "Healthcare", "Education", "Salary", "Freelance", "Other"];

const TIPS = [
  "Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
  "Pay yourself first — automate savings before you spend anything.",
  "An emergency fund of 3–6 months of expenses is your safety net.",
  "Review subscriptions monthly — you're likely paying for something you forgot.",
  "Small daily savings compound into life-changing wealth over time.",
  "Avoid lifestyle inflation — when income grows, so should your savings rate.",
];

const QUOTE = {
  text: "Do not save what is left after spending; instead spend what is left after saving.",
  author: "Warren Buffett",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" as const },
  }),
};

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -60 }}
      transition={{ duration: 0.35, ease: "easeOut" as const }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#0F172A] text-white px-5 py-3 rounded-2xl shadow-2xl"
    >
      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onDone} className="ml-2 text-white/60 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState("");
  const [tipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [form, setForm] = useState<CreateTransaction>({
    description: "", amount: 0, type: "INCOME", category: "Other",
    date: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const displayName = getFullName() ?? "there";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [txs, bal] = await Promise.all([
        api.transactions.getAll(),
        api.transactions.getBalance(),
      ]);
      setTransactions(txs);
      setBalance(bal);
    } catch {
      clearToken();
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    load();
    api.admin.getStats()
      .then(() => setIsAdmin(true))
      .catch(() => setIsAdmin(false));
  }, [load, router]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.transactions.create(form);
      setOpen(false);
      setForm({ description: "", amount: 0, type: "INCOME", category: "Other", date: new Date().toISOString().split("T")[0] });
      await load();
      setToast("Transaction added successfully!");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to add transaction.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    setDeleting(id);
    try {
      await api.transactions.delete(id);
      await load();
      setToast("Transaction deleted.");
    } finally {
      setDeleting(null);
    }
  }

  function logout() {
    clearToken();
    router.push("/");
  }

  const income = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const filtered = transactions
    .filter((t) => filter === "ALL" || t.type === filter)
    .filter((t) => categoryFilter === "ALL" || t.category === categoryFilter)
    .filter((t) => !search || t.description.toLowerCase().includes(search.toLowerCase()));
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

  const topCategory = (() => {
    const expenseTxs = transactions.filter((t) => t.type === "EXPENSE");
    if (!expenseTxs.length) return null;
    const totals: Record<string, number> = {};
    expenseTxs.forEach((t) => { totals[t.category] = (totals[t.category] ?? 0) + t.amount; });
    return Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
  })();

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(n);

  const today = new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast("")} />}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#0F172A]">
              Finance <span className="text-[#4F46E5]">Tracker</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/admin")}
                className="border-[#E2E8F0] text-[#4F46E5] hover:bg-[#EEF2FF] gap-1.5 hidden sm:flex"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Panel
              </Button>
            )}
            <span className="text-sm text-[#64748B] hidden md:block">
              Hey, <span className="font-semibold text-[#0F172A]">{displayName}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={logout} className="text-[#64748B] hover:text-[#0F172A] gap-1.5">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-sm text-[#64748B] font-medium mb-1">{today}</p>
              <h1 className="text-3xl font-bold text-[#0F172A]">
                Welcome back, <span className="text-[#4F46E5]">{displayName}</span> 👋
              </h1>
              <p className="text-[#64748B] mt-1">
                {transactions.length === 0
                  ? "No transactions yet — add your first one below."
                  : `You have ${transactions.length} transaction${transactions.length === 1 ? "" : "s"} on record.`}
              </p>
            </div>
            {isAdmin && (
              <Button
                onClick={() => router.push("/dashboard/admin")}
                className="sm:hidden bg-[#4F46E5] hover:bg-[#4338CA] text-white gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Panel
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show">
            <Card className="bg-gradient-to-br from-[#4F46E5] to-[#6D28D9] border-0 shadow-lg text-white h-full">
              <CardContent className="p-7">
                <div className="flex items-start justify-between mb-6">
                  <p className="text-indigo-200 text-sm font-medium">Current Balance</p>
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-4xl font-bold tracking-tight">{fmt(balance)}</p>
                <p className="text-indigo-200 text-xs mt-2">Net balance across all transactions</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show">
            <Card className="bg-white border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow h-full">
              <CardContent className="p-7">
                <div className="flex items-start justify-between mb-6">
                  <p className="text-[#64748B] text-sm font-medium">Total Income</p>
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-[#0F172A] tracking-tight">{fmt(income)}</p>
                <p className="text-[#94A3B8] text-xs mt-2">
                  {transactions.filter((t) => t.type === "INCOME").length} income transaction{transactions.filter((t) => t.type === "INCOME").length !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show">
            <Card className="bg-white border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow h-full">
              <CardContent className="p-7">
                <div className="flex items-start justify-between mb-6">
                  <p className="text-[#64748B] text-sm font-medium">Total Expenses</p>
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <ArrowDownRight className="w-5 h-5 text-red-500" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-[#0F172A] tracking-tight">{fmt(expenses)}</p>
                <p className="text-[#94A3B8] text-xs mt-2">
                  {transactions.filter((t) => t.type === "EXPENSE").length} expense transaction{transactions.filter((t) => t.type === "EXPENSE").length !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main content + sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

          {/* Transactions — 2/3 width */}
          <motion.div className="xl:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="bg-white border-[#E2E8F0] shadow-sm">
              <CardHeader className="px-7 py-6 border-b border-[#F1F5F9] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold text-[#0F172A]">Transactions</CardTitle>
                    <p className="text-[#64748B] text-sm mt-0.5">
                      {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                      {search || categoryFilter !== "ALL" ? " matching filters" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex rounded-lg border border-[#E2E8F0] overflow-hidden text-sm">
                      {(["ALL", "INCOME", "EXPENSE"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`px-4 py-2 font-medium transition-colors ${filter === f ? "bg-[#4F46E5] text-white" : "bg-white text-[#64748B] hover:bg-[#F1F5F9]"}`}
                        >
                          {f === "ALL" ? "All" : f === "INCOME" ? "Income" : "Expenses"}
                        </button>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setOpen(true)}
                      className="bg-[#4F46E5] hover:bg-[#4338CA] text-white gap-2 h-9 px-4"
                    >
                      <Plus className="w-4 h-4" />
                      Add Transaction
                    </Button>
                  </div>
                </div>

                {/* Search + category row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <Input
                      placeholder="Search transactions..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 h-9 border-[#E2E8F0] bg-white text-sm"
                    />
                    {search && (
                      <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-9 rounded-md border border-[#E2E8F0] bg-white px-3 text-sm text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] min-w-[140px]"
                  >
                    <option value="ALL">All Categories</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {filtered.length === 0 ? (
                  <div className="py-20 text-center text-[#94A3B8]">
                    <Wallet className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-base font-medium">No transactions found</p>
                    <p className="text-sm mt-1">
                      {search || categoryFilter !== "ALL"
                        ? "Try adjusting your search or filters"
                        : filter === "ALL" ? 'Click "Add Transaction" to get started' : `No ${filter.toLowerCase()} transactions yet`}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F1F5F9]">
                    {filtered
                      .sort((a, b) => safeDate(b.createdAt ?? b.date).getTime() - safeDate(a.createdAt ?? a.date).getTime())
                      .map((tx, i) => (
                        <motion.div
                          key={tx.id}
                          custom={i}
                          variants={fadeUp}
                          initial="hidden"
                          animate="show"
                          className="flex items-center justify-between px-7 py-5 hover:bg-[#F8FAFC] transition-colors group"
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
                          <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                            <span className={`text-base font-bold tabular-nums ${tx.type === "INCOME" ? "text-green-600" : "text-red-500"}`}>
                              {tx.type === "INCOME" ? "+" : "-"}{fmt(tx.amount)}
                            </span>
                            <button
                              onClick={() => handleDelete(tx.id)}
                              disabled={deleting === tx.id}
                              className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-[#94A3B8] hover:text-red-500 hover:bg-red-50 transition-all duration-150"
                            >
                              {deleting === tx.id
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar — 1/3 width */}
          <motion.div
            className="xl:col-span-1 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            {/* Quote */}
            <Card className="bg-gradient-to-br from-[#4F46E5] to-[#6D28D9] border-0 shadow-lg text-white">
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-indigo-300 mb-4" />
                <p className="text-sm leading-relaxed font-medium text-indigo-100 italic">
                  &ldquo;{QUOTE.text}&rdquo;
                </p>
                <p className="text-xs text-indigo-300 mt-3 font-semibold">— {QUOTE.author}</p>
              </CardContent>
            </Card>

            {/* Financial Health */}
            {transactions.length > 0 && (
              <Card className="bg-white border-[#E2E8F0] shadow-sm">
                <CardHeader className="px-6 py-4 border-b border-[#F1F5F9]">
                  <CardTitle className="text-base font-bold text-[#0F172A]">Your Financial Health</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[#64748B]">Savings Rate</span>
                      <span className={`text-sm font-bold ${savingsRate >= 20 ? "text-green-600" : savingsRate >= 0 ? "text-yellow-500" : "text-red-500"}`}>
                        {savingsRate}%
                      </span>
                    </div>
                    <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${savingsRate >= 20 ? "bg-green-500" : savingsRate >= 0 ? "bg-yellow-400" : "bg-red-400"}`}
                        style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      {savingsRate >= 20 ? "Great job! You're saving well." : savingsRate >= 0 ? "Try to save at least 20% of income." : "Expenses exceed income — review your spending."}
                    </p>
                  </div>

                  {topCategory && (
                    <div className="flex items-center justify-between py-3 border-t border-[#F1F5F9]">
                      <span className="text-sm text-[#64748B]">Top expense</span>
                      <Badge className="bg-red-50 text-red-500 border-0 text-xs font-semibold">{topCategory}</Badge>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3">
                    <span className="text-sm text-[#64748B]">Avg transaction</span>
                    <span className="text-sm font-semibold text-[#0F172A]">
                      {fmt(transactions.reduce((s, t) => s + t.amount, 0) / transactions.length)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tip of the day */}
            <Card className="bg-[#FAFAF5] border-[#E8E8D8] shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Financial Tip</span>
                </div>
                <p className="text-sm text-[#0F172A] leading-relaxed">{TIPS[tipIndex]}</p>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card className="bg-white border-[#E2E8F0] shadow-sm">
              <CardContent className="p-6 space-y-3">
                <p className="text-sm font-bold text-[#0F172A] mb-4">Quick Actions</p>
                <Button
                  onClick={() => setOpen(true)}
                  className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white gap-2 justify-start"
                >
                  <Plus className="w-4 h-4" />
                  Add Transaction
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/admin")}
                    className="w-full border-[#E2E8F0] text-[#4F46E5] hover:bg-[#EEF2FF] gap-2 justify-start"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Open Admin Panel
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={logout}
                  className="w-full border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] gap-2 justify-start"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Add Transaction Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white border-[#E2E8F0] sm:max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle className="text-[#0F172A] text-xl font-bold">New Transaction</DialogTitle>
            <p className="text-[#64748B] text-sm">Record your income or expense below.</p>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-5 mt-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#0F172A]">Description</Label>
              <Input
                placeholder="e.g. Grocery shopping at Checkers"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                className="border-[#E2E8F0] bg-white h-12 text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#0F172A]">Amount (ZAR)</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount || ""}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                  required
                  className="border-[#E2E8F0] bg-white h-12 text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#0F172A]">Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  className="border-[#E2E8F0] bg-white h-12 text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#0F172A]">Type</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as "INCOME" | "EXPENSE" })}
                  className="w-full h-12 rounded-md border border-[#E2E8F0] bg-white px-3 text-base text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#0F172A]">Category</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-12 rounded-md border border-[#E2E8F0] bg-white px-3 text-base text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {formError && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                {formError}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-[#E2E8F0] h-12 text-base"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white h-12 font-semibold text-base"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add Transaction"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
