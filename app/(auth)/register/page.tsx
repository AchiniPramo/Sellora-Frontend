"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser, saveSession, initializeAdmin } from "@/lib/auth";

const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:7000";

async function ensureUserInBackend(params: {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address?: string;
}) {
  try {
    const check = await fetch(`${API_GATEWAY}/api/v1/users/${params.id}`);
    if (check.status === 200) return;
    const formData = new FormData();
    formData.append("nic", params.id);
    formData.append("name", params.name);
    formData.append("address", params.address || "N/A");
    formData.append("mobile", params.mobile);
    formData.append("email", params.email);
    const placeholderBlob = new Blob([], { type: "image/png" });
    formData.append("picture", new File([placeholderBlob], "avatar.png", { type: "image/png" }));
    await fetch(`${API_GATEWAY}/api/v1/users`, { method: "POST", body: formData });
  } catch {
    console.warn("Could not sync user to user-service");
  }
}

// Atmospheric orb — same as login page
function Orb({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        background: "radial-gradient(circle, rgba(167,139,250,0.22) 0%, transparent 70%)",
        ...style,
      }}
    />
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    mobile: "",
    email: "",
    address: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initializeAdmin();
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.username || !form.password || !form.name || !form.mobile || !form.email) {
      setError("Username, password, email, full name and mobile are required.");
      return;
    }
    if (form.username.length > 10) {
      setError("Username must be 10 characters or less.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    setLoading(true);
    const result = registerUser({
      username: form.username,
      password: form.password,
      name: form.name,
      mobile: form.mobile,
      email: form.email,
      address: form.address || undefined,
    });
    if (!result.success || !result.user) {
      setLoading(false);
      setError(result.error ?? "Registration failed");
      return;
    }
    await ensureUserInBackend({
      id: result.user.id,
      name: form.name,
      mobile: form.mobile,
      email: form.email,
      address: form.address || undefined,
    });
    setLoading(false);
    saveSession(result.user);
    router.replace("/");
  };

  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-end overflow-hidden"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* ── Full-bleed background image (same as login) ── */}
      <img
        src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1800&q=85"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.45)" }}
      />

      {/* ── Violet gradient wash ── */}
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

      {/* ── Left branding (large screens) ── */}
      <div
        className="absolute left-0 top-0 bottom-0 hidden lg:flex flex-col justify-between p-14 w-[42%]"
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
        <div className="space-y-6 max-w-sm">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "#c4b5fd" }}
            >
              Join thousands of shoppers
            </p>
            <h1
              className="text-5xl font-black leading-tight text-white"
              style={{ letterSpacing: "-0.02em" }}
            >
              Start your<br />
              <span style={{ color: "#c4b5fd" }}>journey.</span>
            </h1>
            <p className="text-white/60 mt-4 text-base leading-relaxed">
              Create your free account in seconds and start shopping the best products at unbeatable prices.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {[
              { step: "01", text: "Fill in your details" },
              { step: "02", text: "Create your credentials" },
              { step: "03", text: "Start shopping instantly" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <span
                  className="text-xs font-black w-8 shrink-0"
                  style={{ color: "#a78bfa" }}
                >
                  {step}
                </span>
                <div className="h-px flex-1" style={{ background: "rgba(167,139,250,0.2)" }} />
                <span className="text-sm text-white/70 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">
          © {new Date().getFullYear()} Sellora · All rights reserved
        </p>
      </div>

      {/* ── Register card (right side) ── */}
      <div
        className="relative z-10 w-full lg:w-[600px] min-h-screen lg:min-h-0 flex items-center justify-center lg:justify-end"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateX(0)" : "translateX(24px)",
          transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
        }}
      >
        <div
          className="w-full lg:w-[560px] lg:m-6 rounded-none lg:rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.97)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Top gradient accent bar */}
          <div
            className="h-1.5 w-full shrink-0"
            style={{ background: "linear-gradient(90deg, #7c3aed, #818cf8, #4f46e5)" }}
          />

          {/* Card content */}
          <div className="flex-1 flex flex-col justify-center px-8 py-10">

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2.5 mb-8">
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
              >
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-zinc-900 text-xl font-bold">Sellora</span>
            </div>

            {/* Heading + step indicator */}
            <div className="flex items-start justify-between mb-7">
              <div>
                <h2
                  className="text-2xl font-black text-zinc-900 tracking-tight"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Create account
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  It&apos;s free and only takes a minute
                </p>
              </div>
              <div className="hidden sm:flex gap-1.5 shrink-0 mt-1">
                {["Register", "Shop"].map((s, i) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={
                      i === 0
                        ? { background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ede9fe" }
                        : { background: "#f4f4f5", color: "#a1a1aa" }
                    }
                  >
                    {i + 1} {s}
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* ── Personal Info ── */}
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2"
                  style={{ color: "#7c3aed" }}
                >
                  <span
                    className="h-4 w-4 rounded-full flex items-center justify-center text-white text-[8px] font-black"
                    style={{ background: "#7c3aed" }}
                  >1</span>
                  Personal Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { field: "name",    label: "Full Name",  placeholder: "John Doe",       required: true,  type: "text" },
                    { field: "mobile",  label: "Mobile",     placeholder: "07X XXX XXXX",   required: true,  type: "text" },
                    { field: "email",   label: "Email",      placeholder: "john@email.com", required: true,  type: "email" },
                    { field: "address", label: "Address",    placeholder: "123 Main St",    required: false, type: "text" },
                  ].map(({ field, label, placeholder, required, type }) => (
                    <div key={field} className="space-y-1.5">
                      <Label className="text-zinc-700 text-sm font-bold">
                        {label}{" "}
                        {required
                          ? <span className="text-red-400">*</span>
                          : <span className="text-zinc-400 font-normal text-xs">(optional)</span>
                        }
                      </Label>
                      <Input
                        type={type}
                        placeholder={placeholder}
                        value={form[field as keyof typeof form]}
                        onChange={(e) => set(field, e.target.value)}
                        className="h-10 rounded-xl border-zinc-200 bg-zinc-50 text-sm focus-visible:bg-white focus-visible:ring-violet-400 focus-visible:border-violet-400 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Divider ── */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-100" />
                <p
                  className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                  style={{ color: "#7c3aed" }}
                >
                  <span
                    className="h-4 w-4 rounded-full flex items-center justify-center text-white text-[8px] font-black"
                    style={{ background: "#7c3aed" }}
                  >2</span>
                  Login Credentials
                </p>
                <div className="h-px flex-1 bg-zinc-100" />
              </div>

              {/* ── Credentials ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Username */}
                <div className="space-y-1.5">
                  <Label className="text-zinc-700 text-sm font-bold">
                    Username <span className="text-red-400">*</span>
                    <span className="text-zinc-400 font-normal text-xs ml-1">(max 10)</span>
                  </Label>
                  <Input
                    placeholder="myusername"
                    maxLength={10}
                    value={form.username}
                    onChange={(e) => set("username", e.target.value)}
                    autoComplete="username"
                    className="h-10 rounded-xl border-zinc-200 bg-zinc-50 text-sm focus-visible:bg-white focus-visible:ring-violet-400 focus-visible:border-violet-400 transition-colors"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label className="text-zinc-700 text-sm font-bold">
                    Password <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPwd ? "text" : "password"}
                      placeholder="Min 4 chars"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      className="h-10 pr-10 rounded-xl border-zinc-200 bg-zinc-50 text-sm focus-visible:bg-white focus-visible:ring-violet-400 focus-visible:border-violet-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <Label className="text-zinc-700 text-sm font-bold">
                    Confirm <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    type="password"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    className="h-10 rounded-xl border-zinc-200 bg-zinc-50 text-sm focus-visible:bg-white focus-visible:ring-violet-400 focus-visible:border-violet-400 transition-colors"
                  />
                </div>
              </div>

              {/* Error */}
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
                className="w-full h-12 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60 group"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                  boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
                }}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
                ) : (
                  <>
                    Create Account & Sign In
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1 bg-zinc-100" />
              <span className="text-xs text-zinc-400 font-medium">have an account?</span>
              <div className="h-px flex-1 bg-zinc-100" />
            </div>

            {/* Sign in CTA */}
            <Link
              href="/login"
              className="w-full h-11 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all"
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
              Sign in instead
            </Link>
          </div>

          {/* Card footer tag */}
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