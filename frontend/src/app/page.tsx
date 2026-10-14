"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp, Shield, BarChart3, ArrowRight, CheckCircle2,
  Wallet, PieChart, Bell, Zap, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: TrendingUp,
    title: "Income & Expense Tracking",
    desc: "Log every transaction in seconds. Tag it with a category and date — full history at your fingertips.",
  },
  {
    icon: BarChart3,
    title: "Live Balance Dashboard",
    desc: "Your net balance, total income, and total expenses update the moment you add or remove a transaction.",
  },
  {
    icon: PieChart,
    title: "Category Filtering",
    desc: "Filter by Food, Transport, Housing, Salary and more to understand exactly where your money goes.",
  },
  {
    icon: Shield,
    title: "JWT-Secured Accounts",
    desc: "Every request is authenticated with a signed token. Your data stays private and protected.",
  },
  {
    icon: Users,
    title: "Multi-user Support",
    desc: "Each user has their own isolated account with their own transactions and balance.",
  },
  {
    icon: Bell,
    title: "Admin Dashboard",
    desc: "Role-based access gives admins a full view of all users, transactions, and platform statistics.",
  },
];

const highlights = [
  "Income & expense tracking",
  "Category-based filtering",
  "Real-time balance updates",
  "Admin dashboard & user management",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-[#0F172A]">
            Finance <span className="text-[#4F46E5]">Tracker</span>
          </span>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <motion.div initial="hidden" animate="show" className="flex flex-col items-center gap-6">
            <motion.span custom={0} variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-sm font-medium border border-[#C7D2FE]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
              Personal finance, simplified
            </motion.span>

            <motion.h1 custom={1} variants={fadeUp}
              className="text-5xl sm:text-6xl font-bold tracking-tight text-[#0F172A] max-w-3xl leading-tight">
              Take control of your{" "}
              <span className="text-[#4F46E5]">finances</span>
            </motion.h1>

            <motion.p custom={2} variants={fadeUp}
              className="text-lg text-[#64748B] max-w-xl leading-relaxed">
              Finance Tracker makes it effortless to log transactions, monitor your balance,
              and understand your spending — all in one clean, powerful dashboard.
            </motion.p>

            <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link href="/register">
                <Button size="lg"
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold px-8 h-12 shadow-lg shadow-indigo-200 transition-all duration-200">
                  Start for free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline"
                  className="h-12 px-8 font-semibold border-[#E2E8F0] hover:bg-[#F1F5F9]">
                  Sign in
                </Button>
              </Link>
            </motion.div>

            <motion.ul custom={4} variants={fadeUp}
              className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-2">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-1.5 text-sm text-[#64748B]">
                  <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                  {h}
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </section>

        {/* Mock dashboard preview strip */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-3 gap-4"
          >
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
              <p className="text-xs font-medium text-[#64748B] mb-1">Net Balance</p>
              <p className="text-2xl font-bold text-[#0F172A]">R 24,530.00</p>
              <div className="mt-3 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div className="h-full w-[94%] bg-gradient-to-r from-[#4F46E5] to-indigo-400 rounded-full" />
              </div>
              <p className="text-xs text-[#64748B] mt-1.5">Savings rate 94.6%</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                <p className="text-xs font-medium text-[#64748B]">Total Income</p>
              </div>
              <p className="text-2xl font-bold text-green-600">R 21,700.00</p>
              <p className="text-xs text-[#94A3B8] mt-1">6 transactions this month</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <Wallet className="w-3.5 h-3.5 text-[#4F46E5]" />
                <p className="text-xs font-medium text-[#64748B]">Top Category</p>
              </div>
              <p className="text-2xl font-bold text-[#0F172A]">Housing</p>
              <p className="text-xs text-[#94A3B8] mt-1">48% of total expenses</p>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-sm font-medium border border-[#C7D2FE] mb-4">
              <Zap className="w-3.5 h-3.5" />
              Everything included
            </span>
            <h2 className="text-3xl font-bold text-[#0F172A]">Built for real financial clarity</h2>
            <p className="text-[#64748B] mt-2 max-w-md mx-auto text-sm leading-relaxed">
              A full-stack system with a Java Spring Boot backend, JWT authentication, and a clean React frontend.
            </p>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} custom={i} variants={fadeUp}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-6 flex flex-col gap-4 hover:shadow-lg hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-200 group">
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center group-hover:bg-[#4F46E5] transition-colors duration-200">
                  <f.icon className="w-5 h-5 text-[#4F46E5] group-hover:text-white transition-colors duration-200" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0F172A] mb-1">{f.title}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative bg-[#4338CA] rounded-3xl p-12 text-center text-white overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-400 rounded-full opacity-20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-violet-500 rounded-full opacity-20 blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-3">Ready to get started?</h2>
              <p className="text-indigo-200 mb-8 max-w-md mx-auto">
                Create your free account in seconds and start tracking your finances today.
              </p>
              <Link href="/register">
                <Button size="lg"
                  className="bg-white text-[#4F46E5] hover:bg-indigo-50 font-semibold px-8 h-12">
                  Create free account
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-lg font-bold text-[#0F172A]">
                Finance <span className="text-[#4F46E5]">Tracker</span>
              </p>
              <p className="text-sm text-[#64748B] mt-0.5">Smart personal finance management</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-[#0F172A]">LethaboDev</p>

            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
            <span>© 2026 Finance Tracker. Built with Next.js, Spring Boot &amp; PostgreSQL.</span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#4F46E5]" />
              Powered by Finance Tracker
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
