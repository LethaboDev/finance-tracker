"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthPanel } from "@/components/AuthPanel";
import { api } from "@/lib/api";
import { saveToken, saveFullName } from "@/lib/auth";

function StrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-[#E2E8F0]"}`} />
        ))}
      </div>
      <p className="text-xs text-[#64748B]">{labels[score]}</p>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await api.auth.register(form.fullName, form.email, form.password);
      saveToken(res.token);
      if (res.fullName) saveFullName(res.fullName);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const requirements = [
    { label: "At least 8 characters", met: form.password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(form.password) },
    { label: "One number", met: /[0-9]/.test(form.password) },
  ];

  return (
    <div className="min-h-screen flex">
      <AuthPanel />

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F8FAFC]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <Link href="/" className="lg:hidden block text-xl font-bold tracking-tight text-[#0F172A] mb-8">
            Finance <span className="text-[#4F46E5]">Tracker</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Create your account</h1>
            <p className="text-[#64748B] text-sm">Free forever — no credit card needed</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm font-medium text-[#0F172A]">Full Name</Label>
              <Input id="fullName" type="text" placeholder="John Doe" value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)} required className="h-11 border-[#E2E8F0] bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-[#0F172A]">Email address</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={form.email}
                onChange={(e) => update("email", e.target.value)} required className="h-11 border-[#E2E8F0] bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-[#0F172A]">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  value={form.password} onChange={(e) => update("password", e.target.value)}
                  required className="h-11 border-[#E2E8F0] pr-10 bg-white" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <StrengthBar password={form.password} />
              {form.password && (
                <ul className="space-y-1 mt-1">
                  {requirements.map((r) => (
                    <li key={r.label} className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${r.met ? "text-green-500" : "text-[#CBD5E1]"}`} />
                      {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-sm font-medium text-[#0F172A]">Confirm password</Label>
              <Input id="confirm" type="password" placeholder="••••••••" value={form.confirm}
                onChange={(e) => update("confirm", e.target.value)} required className="h-11 border-[#E2E8F0] bg-white" />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </motion.p>
            )}

            <Button type="submit" disabled={loading}
              className="w-full h-11 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#64748B]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#4F46E5] font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
