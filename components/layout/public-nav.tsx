"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles, Menu, X, LogOut, LayoutDashboard, ShoppingBag,
  Home, ChevronDown, ArrowRight,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getSession, clearSession } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/",      icon: Home },
  { label: "Shop", href: "/#shop", icon: ShoppingBag },
];

export function PublicNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setUser(getSession()); }, [pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = () => {
    clearSession();
    setUser(null);
    setDropOpen(false);
    router.push("/");
  };

  // ── Shared text color based on scroll + bg ──
  const navColor = scrolled ? "#52525b" : "rgba(255,255,255,0.9)";
  const navHoverColor = scrolled ? "#7c3aed" : "white";
  const navHoverBg = scrolled ? "#f5f3ff" : "rgba(255,255,255,0.14)";

  return (
    <div
      className="min-h-screen flex flex-col bg-zinc-50"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* ══════════════════════════════════════════════
          NAVBAR — pill-style centered capsule
      ══════════════════════════════════════════════ */}
      <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-3">
        <header
          className="w-full max-w-5xl transition-all duration-300"
          style={{
            background: scrolled
              ? "rgba(255,255,255,0.96)"
              : "rgba(15,10,30,0.45)",
            backdropFilter: "blur(16px)",
            borderRadius: scrolled ? "1rem" : "1.5rem",
            border: scrolled
              ? "1px solid rgba(124,58,237,0.1)"
              : "1px solid rgba(255,255,255,0.12)",
            boxShadow: scrolled
              ? "0 4px 24px rgba(109,40,217,0.1), 0 1px 3px rgba(0,0,0,0.05)"
              : "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <div className="h-14 flex items-center justify-between px-4 sm:px-5">

            {/* ── Brand ── */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div
                className="h-8 w-8 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
              >
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="leading-none">
                <span
                  className="text-base font-black tracking-tight"
                  style={{ color: scrolled ? "#18181b" : "white", letterSpacing: "-0.02em" }}
                >
                  Sellora
                </span>
                <span
                  className="hidden sm:block text-[9px] font-bold uppercase tracking-widest -mt-0.5"
                  style={{ color: scrolled ? "#a1a1aa" : "rgba(255,255,255,0.5)" }}
                >
                  Marketplace
                </span>
              </div>
            </Link>

            {/* ── Desktop nav links — centered ── */}
            <nav className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
              {navLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-xl transition-all"
                  style={{ color: navColor }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = navHoverColor;
                    (e.currentTarget as HTMLElement).style.background = navHoverBg;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = navColor;
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <Icon style={{ width: 13, height: 13 }} />
                  {label}
                </Link>
              ))}
            </nav>

            {/* ── Right: auth actions ── */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              {user ? (
                <>
                  {/* My Orders link */}
                  <Link href="/my-orders">
                    <button
                      className="h-8 px-3 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all"
                      style={{ color: navColor }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = navHoverColor;
                        (e.currentTarget as HTMLElement).style.background = navHoverBg;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = navColor;
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      <ShoppingBag style={{ width: 13, height: 13 }} />
                      Orders
                    </button>
                  </Link>

                  {/* Admin dashboard link */}
                  {user.role === "admin" && (
                    <Link href="/dashboard">
                      <button
                        className="h-8 px-3 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all"
                        style={{ color: navColor }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = navHoverColor;
                          (e.currentTarget as HTMLElement).style.background = navHoverBg;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = navColor;
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                        }}
                      >
                        <LayoutDashboard style={{ width: 13, height: 13 }} />
                        Admin
                      </button>
                    </Link>
                  )}

                  {/* User avatar dropdown */}
                  <div className="relative" ref={dropRef}>
                    <button
                      onClick={() => setDropOpen((v) => !v)}
                      className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl transition-all"
                      style={
                        scrolled
                          ? { background: "#f5f3ff", border: "1px solid #ede9fe" }
                          : { background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.2)" }
                      }
                    >
                      <div
                        className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-black text-white relative"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                      >
                        {user.name?.charAt(0).toUpperCase()}
                        <span
                          className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full"
                          style={{ background: "#22c55e", border: "1.5px solid white" }}
                        />
                      </div>
                      <span
                        className="text-xs font-black"
                        style={{ color: scrolled ? "#3b0764" : "white", letterSpacing: "-0.01em" }}
                      >
                        {user.name?.split(" ")[0]}
                      </span>
                      <ChevronDown
                        style={{
                          width: 12, height: 12,
                          color: scrolled ? "#a78bfa" : "rgba(255,255,255,0.6)",
                          transform: dropOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </button>

                    {/* Dropdown panel */}
                    {dropOpen && (
                      <div
                        className="absolute right-0 mt-2 w-48 rounded-2xl overflow-hidden"
                        style={{
                          background: "white",
                          border: "1px solid #ede9fe",
                          boxShadow: "0 16px 48px rgba(109,40,217,0.15)",
                        }}
                      >
                        {/* User info header */}
                        <div
                          className="px-4 py-3"
                          style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
                        >
                          <p className="text-xs font-black text-white">{user.name}</p>
                          <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#c4b5fd" }}>
                            {user.role} account
                          </p>
                        </div>
                        {/* Menu items */}
                        <div className="p-1.5 space-y-0.5">
                          <Link href="/my-orders" onClick={() => setDropOpen(false)}>
                            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-zinc-700 hover:bg-violet-50 hover:text-violet-700 transition-colors text-left">
                              <ShoppingBag style={{ width: 14, height: 14, color: "#7c3aed" }} />
                              My Orders
                            </button>
                          </Link>
                          <Link href="/profile" onClick={() => setDropOpen(false)}>
                            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-zinc-700 hover:bg-violet-50 hover:text-violet-700 transition-colors text-left">
                              <Sparkles style={{ width: 14, height: 14, color: "#7c3aed" }} />
                              My Profile
                            </button>
                          </Link>
                          {user.role === "admin" && (
                            <Link href="/dashboard" onClick={() => setDropOpen(false)}>
                              <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-zinc-700 hover:bg-violet-50 hover:text-violet-700 transition-colors text-left">
                                <LayoutDashboard style={{ width: 14, height: 14, color: "#7c3aed" }} />
                                Dashboard
                              </button>
                            </Link>
                          )}
                        </div>
                        {/* Sign out */}
                        <div className="p-1.5 pt-0" style={{ borderTop: "1px solid #f5f3ff" }}>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors text-left"
                          >
                            <LogOut style={{ width: 14, height: 14 }} />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <button
                      className="h-8 px-4 rounded-xl text-sm font-bold transition-all"
                      style={{ color: navColor }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = navHoverBg;
                        (e.currentTarget as HTMLElement).style.color = navHoverColor;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = navColor;
                      }}
                    >
                      Sign In
                    </button>
                  </Link>
                  <Link href="/register">
                    <button
                      className="h-8 px-4 rounded-xl text-sm font-black text-white flex items-center gap-1.5 hover:opacity-90 transition-opacity group"
                      style={{
                        background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                        boxShadow: "0 2px 12px rgba(124,58,237,0.4)",
                      }}
                    >
                      Get Started
                      <ArrowRight style={{ width: 13, height: 13 }} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile toggle ── */}
            <button
              className="md:hidden h-8 w-8 rounded-xl flex items-center justify-center transition-colors"
              style={{ color: scrolled ? "#52525b" : "white" }}
              onClick={() => setMobileOpen((v) => !v)}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = navHoverBg; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {mobileOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
            </button>
          </div>
        </header>
      </div>

      {/* ── Mobile dropdown — slides down below pill ── */}
      {mobileOpen && (
        <div
          className="fixed top-[72px] inset-x-4 z-40 rounded-2xl overflow-hidden md:hidden"
          style={{
            background: "white",
            border: "1px solid rgba(124,58,237,0.1)",
            boxShadow: "0 16px 48px rgba(109,40,217,0.15)",
          }}
        >
          {/* Nav links */}
          <div className="p-2 space-y-0.5">
            {navLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-zinc-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
              >
                <Icon style={{ width: 15, height: 15, color: "#7c3aed" }} />
                {label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="p-2 pt-0" style={{ borderTop: "1px solid #f5f3ff" }}>
            {user ? (
              <>
                {/* User row */}
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
                  style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)" }}
                >
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white leading-tight">{user.name?.split(" ")[0]}</p>
                    <p className="text-[10px] font-semibold" style={{ color: "#c4b5fd" }}>{user.role} account</p>
                  </div>
                </div>
                {[
                  { href: "/my-orders",  icon: ShoppingBag,    label: "My Orders"  },
                  { href: "/profile",    icon: Sparkles,       label: "My Profile" },
                  ...(user.role === "admin" ? [{ href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }] : []),
                ].map(({ href, icon: Icon, label }) => (
                  <Link key={label} href={href} onClick={() => setMobileOpen(false)}>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-zinc-700 hover:bg-violet-50 hover:text-violet-700 transition-colors text-left">
                      <Icon style={{ width: 14, height: 14, color: "#7c3aed" }} />
                      {label}
                    </button>
                  </Link>
                ))}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors text-left mt-0.5"
                >
                  <LogOut style={{ width: 14, height: 14 }} />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <button className="w-full h-10 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <button
                    className="w-full h-10 rounded-xl text-white text-sm font-black hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 group"
                    style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" }}
                  >
                    Get Started
                    <ArrowRight style={{ width: 13, height: 13 }} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page content */}
      <main className="flex-1 pt-20">{children}</main>

      {/* ══════════════════════════════════════════════
          FOOTER — two-column with links
      ══════════════════════════════════════════════ */}
      <footer style={{ background: "#0f0a1e", borderTop: "1px solid rgba(124,58,237,0.15)" }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row justify-between gap-10">
            {/* Brand col */}
            <div className="space-y-4 max-w-xs">
              <div className="flex items-center gap-2.5">
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                >
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-black text-white text-base" style={{ letterSpacing: "-0.02em" }}>Sellora</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#4c1d95" }}>
                Your trusted marketplace for quality products at unbeatable prices.
              </p>
              {/* Social dots */}
              <div className="flex gap-2">
                {["F", "T", "I"].map((s) => (
                  <div
                    key={s}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors cursor-pointer"
                    style={{ background: "rgba(124,58,237,0.15)", color: "#7c3aed" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#7c3aed"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.15)"; (e.currentTarget as HTMLElement).style.color = "#7c3aed"; }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Link columns */}
            <div className="flex gap-12">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#4c1d95" }}>Shop</p>
                <div className="space-y-2">
                  {["Home", "All Items", "Categories", "New Arrivals"].map((l) => (
                    <Link key={l} href="/#shop">
                      <p className="text-xs font-semibold transition-colors cursor-pointer" style={{ color: "#3b1a6e" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#a78bfa"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#3b1a6e"; }}
                      >
                        {l}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#4c1d95" }}>Account</p>
                <div className="space-y-2">
                  {[
                    { label: "Sign In",   href: "/login"    },
                    { label: "Register",  href: "/register" },
                    { label: "My Orders", href: "/my-orders" },
                    { label: "Profile",   href: "/profile"  },
                  ].map(({ label, href }) => (
                    <Link key={label} href={href}>
                      <p className="text-xs font-semibold transition-colors cursor-pointer" style={{ color: "#3b1a6e" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#a78bfa"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#3b1a6e"; }}
                      >
                        {label}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-10 pt-6"
            style={{ borderTop: "1px solid rgba(124,58,237,0.1)" }}
          >
            <p className="text-[11px] font-semibold" style={{ color: "#3b1a6e" }}>
              © {new Date().getFullYear()} Sellora · All rights reserved
            </p>
            <div className="flex gap-4">
              {["Privacy", "Terms", "Contact"].map((l) => (
                <span
                  key={l}
                  className="text-[11px] font-semibold cursor-pointer transition-colors"
                  style={{ color: "#3b1a6e" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#a78bfa"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#3b1a6e"; }}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}