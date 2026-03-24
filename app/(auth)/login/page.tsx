"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, Eye, EyeOff, Loader2, UserCheck, Shield, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser, saveSession, initializeAdmin } from "@/lib/auth";
import { Suspense } from "react";

// Floating orb component for background atmosphere
function Orb({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        background: "radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)",
        ...style,
      }}
    />
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initializeAdmin();
    // Trigger entrance animation
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const from = searchParams.get("from") || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));
    const result = loginUser(email, password);
    setLoading(false);
    if (!result.success || !result.user) {
      setError(result.error ?? "Login failed");
      return;
    }
    saveSession(result.user);
    if (result.user.role === "admin") {
      router.replace("/dashboard");
    } else {
      router.replace(from ?? "/");
    }
  };

  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-end overflow-hidden"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* ── Full-bleed background image ── */}
      <img
        src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1800&q=85"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.45)" }}
      />

      {/* ── Violet gradient wash over image ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(88,28,135,0.55) 0%, rgba(49,46,129,0.45) 50%, rgba(15,10,30,0.7) 100%)",
        }}
      />

      {/* ── Atmospheric orbs ── */}
      <Orb style={{ width: 500, height: 500, top: "-10%", left: "-5%", opacity: 0.6 }} />
      <Orb style={{ width: 350, height: 350, bottom: "5%", left: "20%", opacity: 0.4 }} />

      {/* ── Left branding text (visible on large screens) ── */}
      <div
        className="absolute left-0 top-0 bottom-0 hidden lg:flex flex-col justify-between p-14 w-[52%]"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">Sellora</span>
        </div>

        {/* Hero copy */}
        <div className="space-y-6 max-w-md">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "#c4b5fd" }}
            >
              Marketplace Platform
            </p>
            <h1
              className="text-5xl font-black leading-tight text-white"
              style={{ letterSpacing: "-0.02em" }}
            >
              Commerce,<br />
              <span style={{ color: "#c4b5fd" }}>elevated.</span>
            </h1>
            <p className="text-white/60 mt-4 text-base leading-relaxed">
              Manage your inventory, fulfil orders, and grow — all from one intelligent dashboard.
            </p>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2">
            {["Inventory", "Orders", "Analytics", "Users"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm"
                style={{
                  background: "rgba(167,139,250,0.15)",
                  border: "1px solid rgba(167,139,250,0.3)",
                  color: "#ddd6fe",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">
          © {new Date().getFullYear()} Sellora · All rights reserved
        </p>
      </div>

      {/* ── Login card (right side) ── */}
      <div
        className="relative z-10 w-full lg:w-[480px] min-h-screen lg:min-h-0 flex items-center justify-center lg:justify-end"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateX(0)" : "translateX(24px)",
          transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
        }}
      >
        <div
          className="w-full lg:w-[420px] lg:m-6 rounded-none lg:rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.97)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Card top accent */}
          <div
            className="h-1.5 w-full shrink-0"
            style={{ background: "linear-gradient(90deg, #7c3aed, #818cf8, #4f46e5)" }}
          />

          {/* Card content */}
          <div className="flex-1 flex flex-col justify-center px-8 py-10 lg:py-12">
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2.5 mb-10">
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
              >
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-zinc-900 text-xl font-bold">Sellora</span>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h2
                className="text-2xl font-black text-zinc-900 tracking-tight"
                style={{ letterSpacing: "-0.02em" }}
              >
                {from ? "Sign in to continue" : "Welcome back"}
              </h2>
              <p className="text-zinc-400 text-sm mt-1.5">
                {from ? "Complete your order by signing in" : "Enter your credentials to access your account"}
              </p>
            </div>

            {/* Role hint cards */}
            <div className="grid grid-cols-2 gap-2.5 mb-7">
              <div
                className="rounded-2xl px-3.5 py-3 relative overflow-hidden"
                style={{ background: "#faf5ff", border: "1px solid #ede9fe" }}
              >
                {/* Corner accent */}
                <div
                  className="absolute top-0 right-0 h-8 w-8 rounded-bl-2xl"
                  style={{ background: "rgba(124,58,237,0.08)" }}
                />
                <div className="flex items-center gap-1.5 mb-1">
                  <Shield className="h-3.5 w-3.5" style={{ color: "#7c3aed" }} />
                  <span className="text-xs font-black" style={{ color: "#5b21b6" }}>Admin</span>
                </div>
                <p className="text-[10px] font-mono leading-tight" style={{ color: "#7c3aed" }}>
                  Administrator access
                </p>
              </div>
              <div
                className="rounded-2xl px-3.5 py-3 relative overflow-hidden"
                style={{ background: "#f0f4ff", border: "1px solid #e0e7ff" }}
              >
                <div
                  className="absolute top-0 right-0 h-8 w-8 rounded-bl-2xl"
                  style={{ background: "rgba(79,70,229,0.08)" }}
                />
                <div className="flex items-center gap-1.5 mb-1">
                  <UserCheck className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-xs font-black text-indigo-700">Customer</span>
                </div>
                <p className="text-[10px] text-indigo-400 leading-tight">Standard access</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-zinc-700 text-sm font-bold">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="h-12 text-sm border-zinc-200 bg-zinc-50 focus-visible:bg-white focus-visible:ring-violet-400 focus-visible:border-violet-400 rounded-xl transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-zinc-700 text-sm font-bold">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-12 text-sm pr-11 border-zinc-200 bg-zinc-50 focus-visible:bg-white focus-visible:ring-violet-400 focus-visible:border-violet-400 rounded-xl transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">⚠</span>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60 mt-1 group"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                  boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
                }}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1 bg-zinc-100" />
              <span className="text-xs text-zinc-400 font-medium">new here?</span>
              <div className="h-px flex-1 bg-zinc-100" />
            </div>

            {/* Register CTA */}
            <Link
              href="/register"
              className="w-full h-11 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all hover:shadow-sm"
              style={{
                borderColor: "#ede9fe",
                color: "#7c3aed",
                background: "#faf5ff",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#f5f3ff";
                (e.currentTarget as HTMLElement).style.borderColor = "#c4b5fd";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#faf5ff";
                (e.currentTarget as HTMLElement).style.borderColor = "#ede9fe";
              }}
            >
              Create an account
            </Link>
          </div>

          {/* Card bottom tag */}
          <div
            className="px-8 py-4 shrink-0 flex items-center justify-between"
            style={{ borderTop: "1px solid #f4f4f5", background: "#fafafa" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-5 w-5 rounded-md flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
              >
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-bold text-zinc-400">Sellora</span>
            </div>
            <p className="text-[10px] text-zinc-300">Marketplace · v1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}