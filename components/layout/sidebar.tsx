"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, ShoppingBag, ClipboardList,
  UserCircle, LogOut, Sparkles, Home, PackageSearch
} from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { clearSession, getSession, isAdmin } from "@/lib/auth";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/auth";

const adminNav = [
  { label: "Dashboard",  href: "/dashboard",  icon: LayoutDashboard },
  { label: "All Users",  href: "/users",       icon: Users },
  { label: "Items",      href: "/items",       icon: ShoppingBag },
  { label: "Orders",     href: "/orders",      icon: ClipboardList },
  { label: "My Profile", href: "/profile",     icon: UserCircle },
];

const userNav = [
  { label: "Shop",       href: "/",            icon: Home },
  { label: "My Orders",  href: "/my-orders",   icon: PackageSearch },
  { label: "My Profile", href: "/profile",     icon: UserCircle },
];

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  admin:   { bg: "rgba(167,139,250,0.18)", color: "#c4b5fd" },
  user:    { bg: "rgba(129,140,248,0.18)", color: "#a5b4fc" },
  manager: { bg: "rgba(129,140,248,0.18)", color: "#a5b4fc" },
  cashier: { bg: "rgba(110,231,183,0.18)", color: "#6ee7b7" },
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { open, close } = useSidebar();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => { setUser(getSession()); }, [pathname]);

  const handleSignOut = () => {
    clearSession();
    close();
    router.replace("/");
  };

  const nav = user?.role === "admin" ? adminNav : userNav;

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background: "linear-gradient(160deg, #1a0533 0%, #2d1060 45%, #160428 100%)",
          borderRight: "1px solid rgba(167,139,250,0.12)",
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-base font-bold text-white tracking-tight">Sellora</p>
            <p className="text-xs" style={{ color: "#a78bfa" }}>
              {user?.role === "admin" ? "Admin Panel" : "My Account"}
            </p>
          </div>
        </div>

        {/* User chip */}
        {user && (
          <div
            className="mx-3 mt-3 rounded-xl px-3 py-2.5"
            style={{
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(167,139,250,0.15)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold mt-0.5 inline-block"
                  style={
                    ROLE_STYLE[user.role]
                      ? { background: ROLE_STYLE[user.role].bg, color: ROLE_STYLE[user.role].color }
                      : { background: "rgba(255,255,255,0.1)", color: "#94a3b8" }
                  }
                >
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/" && pathname.startsWith(href + "/"));
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "text-white"
                    : "hover:bg-white/5 transition-colors"
                )}
                style={
                  active
                    ? { background: "linear-gradient(90deg, rgba(124,58,237,0.35), rgba(79,70,229,0.25))" }
                    : { color: "#94a3b8" }
                }
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = "white";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                }}
              >
                <Icon
                  className="h-4 w-4 shrink-0"
                  style={{ color: active ? "#c4b5fd" : undefined }}
                />
                <span>{label}</span>
                {active && (
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ background: "#a78bfa" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider label */}
        <div className="px-5 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#4c1d95" }}>
            Account
          </p>
        </div>

        {/* Sign Out */}
        <div
          className="px-3 pb-5 pt-1"
          style={{ borderTop: "1px solid rgba(167,139,250,0.08)" }}
        >
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
            style={{ color: "#94a3b8" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#fca5a5";
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#94a3b8";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
          <p className="text-[10px] mt-3 px-1" style={{ color: "#3b1a6e" }}>
            Sellora v1.0 · Marketplace
          </p>
        </div>
      </aside>
    </>
  );
}