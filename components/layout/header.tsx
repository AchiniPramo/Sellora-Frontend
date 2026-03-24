"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Sparkles, ChevronRight, Bell } from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { getSession } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import Link from "next/link";

// ── Route metadata ────────────────────────────────────────────────────────────
const ROUTE_META: Record<string, { title: string; parent?: string; parentHref?: string; emoji: string }> = {
  "/dashboard": { title: "Dashboard",  emoji: "📊" },
  "/users":     { title: "All Users",  parent: "Dashboard", parentHref: "/dashboard", emoji: "👥" },
  "/items":     { title: "Items",      parent: "Dashboard", parentHref: "/dashboard", emoji: "📦" },
  "/orders":    { title: "Orders",     parent: "Dashboard", parentHref: "/dashboard", emoji: "🧾" },
  "/my-orders": { title: "My Orders",  emoji: "🛍️" },
  "/profile":   { title: "My Profile", emoji: "👤" },
};

function getRouteMeta(pathname: string) {
  for (const [key, val] of Object.entries(ROUTE_META)) {
    if (pathname === key || pathname.startsWith(key + "/")) return { ...val, key };
  }
  return { title: "Sellora", emoji: "✦", key: "/" };
}

const ROLE_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  admin:   { bg: "#f5f3ff", color: "#7c3aed", dot: "#7c3aed" },
  user:    { bg: "#eef2ff", color: "#4f46e5", dot: "#4f46e5" },
  manager: { bg: "#eef2ff", color: "#4f46e5", dot: "#4f46e5" },
  cashier: { bg: "#f0fdf4", color: "#16a34a", dot: "#16a34a" },
};

export function Header() {
  const pathname = usePathname();
  const meta = getRouteMeta(pathname);
  const { toggle } = useSidebar();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setUser(getSession()); }, [pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const roleStyle = user
    ? (ROLE_STYLE[user.role] ?? { bg: "#f4f4f5", color: "#71717a", dot: "#71717a" })
    : null;

  return (
    <header
      className="sticky top-0 z-40 flex h-16 items-center justify-between px-4 sm:px-6 transition-all duration-200"
      style={{
        background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.92)",
        backdropFilter: "blur(14px)",
        borderBottom: scrolled
          ? "1px solid rgba(124,58,237,0.12)"
          : "1px solid rgba(124,58,237,0.06)",
        boxShadow: scrolled
          ? "0 2px 16px rgba(109,40,217,0.08)"
          : "0 1px 3px rgba(109,40,217,0.04)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── LEFT: mobile toggle + breadcrumb ── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden h-9 w-9 rounded-xl flex items-center justify-center text-zinc-500 transition-colors shrink-0"
          style={{ border: "1px solid #f4f4f5" }}
          onClick={toggle}
          aria-label="Toggle menu"
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f5f3ff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <Menu className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
        </button>

        {/* Mobile brand */}
        <div className="lg:hidden shrink-0">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        {/* Breadcrumb — desktop */}
        <div className="hidden lg:flex items-center gap-1.5 min-w-0">
          {/* Sellora root */}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 shrink-0 transition-colors"
            style={{ color: "#a1a1aa" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#7c3aed"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#a1a1aa"; }}
          >
            <div
              className="h-5 w-5 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
            >
              <Sparkles className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-xs font-bold">Sellora</span>
          </Link>

          {/* Parent crumb */}
          {meta.parent && meta.parentHref && (
            <>
              <ChevronRight className="h-3 w-3 shrink-0" style={{ color: "#d4d4d8" }} />
              <Link
                href={meta.parentHref}
                className="text-xs font-semibold transition-colors shrink-0"
                style={{ color: "#a1a1aa" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#7c3aed"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#a1a1aa"; }}
              >
                {meta.parent}
              </Link>
            </>
          )}

          {/* Current page */}
          <ChevronRight className="h-3 w-3 shrink-0" style={{ color: "#d4d4d8" }} />
          <div className="flex items-center gap-2 min-w-0">
            {/* Page emoji chip */}
            <span
              className="h-6 px-2 rounded-lg text-xs flex items-center gap-1 font-black shrink-0"
              style={{ background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ede9fe" }}
            >
              <span className="text-[11px]">{meta.emoji}</span>
              {meta.title}
            </span>
          </div>
        </div>

        {/* Mobile — just the current page title */}
        <div className="lg:hidden flex items-center gap-2 min-w-0">
          <span className="text-sm font-black text-zinc-800 truncate" style={{ letterSpacing: "-0.01em" }}>
            {meta.title}
          </span>
        </div>
      </div>

      {/* ── RIGHT: notification bell + user chip ── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Notification bell (decorative) */}
        <button
          className="h-9 w-9 rounded-xl flex items-center justify-center text-zinc-400 relative transition-colors"
          style={{ border: "1px solid #f4f4f5" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#f5f3ff";
            (e.currentTarget as HTMLElement).style.color = "#7c3aed";
            (e.currentTarget as HTMLElement).style.borderColor = "#ede9fe";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#a1a1aa";
            (e.currentTarget as HTMLElement).style.borderColor = "#f4f4f5";
          }}
        >
          <Bell style={{ width: 16, height: 16 }} />
          {/* Unread dot */}
          <span
            className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
            style={{ background: "#7c3aed", border: "2px solid white" }}
          />
        </button>

        {/* User chip */}
        {user && roleStyle && (
          <Link
            href="/profile"
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-all"
            style={{ border: "1px solid #f4f4f5" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#f5f3ff";
              (e.currentTarget as HTMLElement).style.borderColor = "#ede9fe";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.borderColor = "#f4f4f5";
            }}
          >
            {/* Avatar with online dot */}
            <div className="relative shrink-0">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>
              {/* Online indicator */}
              <span
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full"
                style={{ background: "#22c55e", border: "2px solid white" }}
              />
            </div>

            {/* Name + role */}
            <div className="hidden sm:block">
              <p className="text-xs font-black text-zinc-800 leading-none" style={{ letterSpacing: "-0.01em" }}>
                {user.name?.split(" ")[0]}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: roleStyle.dot }}
                />
                <span
                  className="text-[10px] font-bold capitalize"
                  style={{ color: roleStyle.color }}
                >
                  {user.role}
                </span>
              </div>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}