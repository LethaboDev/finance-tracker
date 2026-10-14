"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Wallet, ShoppingCart, Car,
  Briefcase, Laptop, PieChart, Coffee,
  Shield, Zap, Users, BarChart3,
} from "lucide-react";

/* ─── Slide 1: Balance Overview ─── */
function BalanceSlide() {
  return (
    <div className="space-y-3">
      <div className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-blue-200/70 text-[11px] font-semibold uppercase tracking-widest mb-1">Net Balance</p>
            <p className="text-4xl font-bold text-white tracking-tight">R 24,530</p>
            <p className="text-blue-200/50 text-xs mt-1">Updated just now</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-blue-200/50">Savings rate this month</span>
            <span className="text-emerald-300 font-bold">94.6%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300"
              initial={{ width: 0 }}
              animate={{ width: "94.6%" }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-400/15 border border-emerald-400/25 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-[11px] text-emerald-200 font-semibold">Income</span>
          </div>
          <p className="text-xl font-bold text-white">R 21,700</p>
          <p className="text-[10px] text-emerald-300/60 mt-0.5">6 transactions</p>
        </div>
        <div className="bg-rose-400/15 border border-rose-400/25 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingDown className="w-3.5 h-3.5 text-rose-300" />
            <span className="text-[11px] text-rose-200 font-semibold">Expenses</span>
          </div>
          <p className="text-xl font-bold text-white">R 1,170</p>
          <p className="text-[10px] text-rose-300/60 mt-0.5">4 transactions</p>
        </div>
      </div>

      <div className="bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-yellow-300" />
          <span className="text-xs text-blue-100/70">Best month yet</span>
        </div>
        <span className="text-xs font-semibold text-yellow-300">↑ 12% vs last month</span>
      </div>
    </div>
  );
}

/* ─── Slide 2: Transactions ─── */
function TransactionSlide() {
  const items = [
    { icon: Briefcase, label: "Monthly Salary", cat: "Salary", amount: "+R 18,500", type: "income", date: "1 May" },
    { icon: Laptop, label: "Freelance Project", cat: "Freelance", amount: "+R 3,200", type: "income", date: "3 May" },
    { icon: ShoppingCart, label: "Grocery Shopping", cat: "Food", amount: "-R 850", type: "expense", date: "4 May" },
    { icon: Car, label: "Fuel & Transport", cat: "Transport", amount: "-R 320", type: "expense", date: "5 May" },
    { icon: Coffee, label: "Coffee & Snacks", cat: "Food", amount: "-R 180", type: "expense", date: "6 May" },
  ];
  return (
    <div className="space-y-2">
      <div className="bg-white/10 border border-white/15 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <p className="text-sm font-semibold text-white">Recent Transactions</p>
          <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full text-blue-200/60 font-medium">May 2025</span>
        </div>
        <div className="divide-y divide-white/[0.07]">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${item.type === "income" ? "bg-emerald-400/20" : "bg-rose-400/20"}`}>
                  <item.icon className={`w-4 h-4 ${item.type === "income" ? "text-emerald-300" : "text-rose-300"}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/90">{item.label}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/40">{item.cat}</span>
                    <span className="text-[9px] text-white/30">{item.date}</span>
                  </div>
                </div>
              </div>
              <span className={`text-xs font-bold tabular-nums ${item.type === "income" ? "text-emerald-300" : "text-rose-300"}`}>
                {item.amount}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Slide 3: Categories ─── */
function CategorySlide() {
  const categories = [
    { label: "Housing", pct: 48, bar: "from-violet-400 to-indigo-400", amount: "R 5,600", dot: "bg-violet-400" },
    { label: "Food & Groceries", pct: 28, bar: "from-orange-400 to-amber-300", amount: "R 3,280", dot: "bg-orange-400" },
    { label: "Transport", pct: 14, bar: "from-cyan-400 to-sky-300", amount: "R 1,640", dot: "bg-cyan-400" },
    { label: "Entertainment", pct: 10, bar: "from-pink-400 to-rose-300", amount: "R 1,170", dot: "bg-pink-400" },
  ];
  return (
    <div className="space-y-3">
      <div className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-200/70" />
            <p className="text-sm font-semibold text-white">Spending by Category</p>
          </div>
          <span className="text-[10px] text-blue-200/50">This month</span>
        </div>
        <div className="space-y-4">
          {categories.map((c, i) => (
            <div key={c.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className="text-xs font-medium text-white/70">{c.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-white/30">{c.amount}</span>
                  <span className="text-xs font-bold text-white">{c.pct}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${c.bar} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${c.pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-xs text-blue-100/50">Total expenses this month</span>
        <span className="text-sm font-bold text-white">R 11,690</span>
      </div>
    </div>
  );
}

/* ─── Slide 4: Security & Admin ─── */
function SecuritySlide() {
  const items = [
    { icon: Shield, label: "JWT Authentication", desc: "Signed tokens on every request", color: "text-emerald-300", bg: "bg-emerald-400/15 border-emerald-400/20" },
    { icon: Users, label: "Role-Based Access", desc: "Admin and user roles enforced", color: "text-blue-300", bg: "bg-blue-400/15 border-blue-400/20" },
    { icon: BarChart3, label: "Admin Dashboard", desc: "Full platform stats & user control", color: "text-violet-300", bg: "bg-violet-400/15 border-violet-400/20" },
    { icon: Zap, label: "Instant Updates", desc: "Balance recalculates in real time", color: "text-yellow-300", bg: "bg-yellow-400/15 border-yellow-400/20" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.35 }}
          className={`${item.bg} border rounded-xl p-4`}
        >
          <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-3`}>
            <item.icon className={`w-4 h-4 ${item.color}`} />
          </div>
          <p className="text-xs font-bold text-white leading-tight">{item.label}</p>
          <p className="text-[10px] text-white/40 mt-1 leading-relaxed">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Slides config ─── */
const slides = [
  { key: "balance", tag: "Dashboard", label: "Your balance, always clear", subtitle: "Net worth updates the moment you log a transaction.", content: <BalanceSlide /> },
  { key: "transactions", tag: "Transactions", label: "Every transaction logged beautifully", subtitle: "Full history with category tags, dates and filters.", content: <TransactionSlide /> },
  { key: "categories", tag: "Analytics", label: "Understand where your money goes", subtitle: "Category breakdowns reveal your real spending habits.", content: <CategorySlide /> },
  { key: "security", tag: "Security", label: "Built secure from the ground up", subtitle: "JWT auth, role-based access, and admin oversight.", content: <SecuritySlide /> },
];

/* ─── Quick stats bar ─── */
const quickStats = [
  { label: "Transactions tracked", value: "500+" },
  { label: "Categories", value: "12" },
  { label: "Uptime", value: "99.9%" },
];

/* ─── Main Panel ─── */
export function AuthPanel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  function goTo(i: number) {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
  }

  const slide = slides[current];

  return (
    <div
      className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 text-white overflow-hidden relative"
      style={{ background: "linear-gradient(145deg, #1040A0 0%, #1652C4 40%, #1A5FD4 70%, #1245A8 100%)" }}
    >
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[380px] h-[380px] bg-sky-400 rounded-full opacity-[0.15] blur-[90px]" />
        <div className="absolute top-[35%] -right-20 w-[300px] h-[300px] bg-indigo-300 rounded-full opacity-[0.12] blur-[80px]" />
        <div className="absolute -bottom-20 left-[20%] w-[280px] h-[280px] bg-blue-300 rounded-full opacity-[0.10] blur-[80px]" />
      </div>

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

      {/* Logo */}
      <Link href="/" className="relative z-10 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
          <Wallet className="w-4.5 h-4.5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">
          Finance <span className="text-blue-200">Tracker</span>
        </span>
      </Link>

      {/* Quick stats */}
      <div className="relative z-10 flex gap-4">
        {quickStats.map((s) => (
          <div key={s.label} className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-center">
            <p className="text-lg font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-blue-200/60 mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Slide */}
      <div className="relative z-10 flex flex-col gap-4">
        {/* Slide tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {slides.map((s, i) => (
            <button
              key={s.key}
              onClick={() => goTo(i)}
              className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-all duration-200 ${i === current ? "bg-white text-blue-700" : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white/80"}`}
            >
              {s.tag}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.key}
            custom={direction}
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -28 }}
            transition={{ duration: 0.38, ease: "easeInOut" }}
            className="space-y-3"
          >
            <div>
              <h2 className="text-lg font-bold text-white leading-snug">{slide.label}</h2>
              <p className="text-blue-200/60 text-xs mt-0.5">{slide.subtitle}</p>
            </div>
            {slide.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="relative z-10">
        <div className="h-px bg-white/10 mb-4" />
        <p className="text-sm font-semibold text-white mb-1">LethaboDev</p>

        <p className="text-white/20 text-[11px] mt-2">© 2026 Finance Tracker. All rights reserved.</p>
      </div>
    </div>
  );
}
