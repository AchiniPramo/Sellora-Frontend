"use client";

import { useEffect, useState } from "react";
import {
  Users, ShoppingBag, ClipboardList, TrendingUp, ArrowRight,
  Sparkles, Activity, Package, Zap, BarChart3, CircleDot,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { userApi, itemApi, orderApi } from "@/lib/api";
import type { Item, Order } from "@/types";
import { getSession } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";

interface Stats { users: number; items: number; orders: number; }

function RingChart({ value, max, color, size = 56 }: { value: number; max: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? value / max : 0;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f4f4f5" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}

function SparkBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-1.5 w-full rounded-full mt-2" style={{ background: "#f4f4f5" }}>
      <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionUser | null>(null);

  useEffect(() => {
    setSession(getSession());
    async function load() {
      const [users, progs, orders] = await Promise.all([
        userApi.getAll().catch(() => []),
        itemApi.getAll().catch(() => []),
        orderApi.getAll().catch(() => []),
      ]);
      
      setStats({ 
        users: 2, 
        items: progs.length, 
        orders: orders.length 
      });

      setRecentOrders(orders.sort((a, b) => (b.id ?? 0) - (a.id ?? 0)).slice(0, 6));
      setItems([...progs].reverse());
      setLoading(false);
    }
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const maxStat = Math.max(stats?.users ?? 0, stats?.items ?? 0, stats?.orders ?? 0, 1);

  const statCards = [
    { label: "Users",  value: stats?.users  ?? 0, icon: Users,        color: "#7c3aed", bg: "#f5f3ff", href: "/users"  },
    { label: "Items",  value: stats?.items  ?? 0, icon: ShoppingBag,  color: "#6d28d9", bg: "#ede9fe", href: "/items"  },
    { label: "Orders", value: stats?.orders ?? 0, icon: ClipboardList, color: "#4f46e5", bg: "#eef2ff", href: "/orders" },
  ];

  return (
    <div className="space-y-5" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #1a0533 0%, #2d1060 50%, #1e1b4b 100%)",
          boxShadow: "0 8px 32px rgba(109,40,217,0.25)",
        }}
      >
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(167,139,250,0.8) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)", transform: "translateY(40%)" }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-7 py-7">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-white/15 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#c4b5fd" }}>
                Sellora Admin
              </span>
            </div>
            <h2 className="text-3xl font-black text-white leading-tight" style={{ letterSpacing: "-0.03em" }}>
              {greeting},<br />
              <span style={{ color: "#c4b5fd" }}>
                {session?.name?.split(" ")[0] ?? "there"}
              </span>{" "}👋
            </h2>
            <p className="text-white/50 text-sm mt-2">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="flex flex-col gap-3 shrink-0">
            <div
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl self-start"
              style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.2)" }}
            >
              <Activity className="h-4 w-4" style={{ color: "#c4b5fd" }} />
              <span className="text-white text-xs font-bold">Live</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex gap-5">
              {statCards.map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-xl font-black text-white leading-none">
                    {loading ? "—" : value}
                  </p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#a78bfa" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}>
            <div
              className="bg-white rounded-2xl p-5 cursor-pointer group transition-all hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden"
              style={{ border: "1px solid #f4f4f5", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <Icon
                className="absolute -bottom-3 -right-3 h-16 w-16 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity"
                style={{ color }}
              />
              <div className="flex items-start justify-between mb-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon className="h-4.5 w-4.5" style={{ color, width: 18, height: 18 }} />
                </div>
                <RingChart value={value} max={maxStat} color={color} size={52} />
              </div>
              <p className="text-3xl font-black text-zinc-900 leading-none" style={{ letterSpacing: "-0.03em" }}>
                {loading ? <span className="inline-block h-8 w-14 rounded-lg bg-zinc-100 animate-pulse" /> : value}
              </p>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-1.5">{label}</p>
              <SparkBar value={value} max={maxStat} color={color} />
            </div>
          </Link>
        ))}

        <div
          className="rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden sm:col-span-3 lg:col-span-1"
          style={{
            background: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 55%, #4f46e5 100%)",
            boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
          }}
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative z-10">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center mb-4">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Store Health</p>
            <p className="text-2xl font-black text-white" style={{ letterSpacing: "-0.02em" }}>
              {loading ? "—" : `${stats?.orders ?? 0} orders`}
            </p>
            <p className="text-white/50 text-xs mt-1">across {stats?.items ?? 0} items</p>
          </div>
          <Link href="/orders" className="relative z-10 mt-4">
            <button
              className="w-full h-9 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors group"
              style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              View Orders
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className="lg:col-span-2 bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid #f4f4f5", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #f9f9f9" }}>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "#f5f3ff" }}>
                <ClipboardList className="h-3.5 w-3.5" style={{ color: "#7c3aed" }} />
              </div>
              <span className="text-sm font-black text-zinc-800">Recent Orders</span>
            </div>
            <Link href="/orders">
              <button className="text-xs font-bold flex items-center gap-1 transition-colors hover:underline underline-offset-2" style={{ color: "#7c3aed" }}>
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </Link>
          </div>

          <div className="divide-y divide-zinc-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              ))
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-10">
                <CircleDot className="h-8 w-8 mx-auto mb-2 text-zinc-200" />
                <p className="text-sm text-zinc-400 font-medium">No orders yet</p>
              </div>
            ) : (
              recentOrders.map((e) => (
                <div key={e.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-zinc-50/60 group">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                  >
                    {(e.user?.name ?? e.userId).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-800 truncate">{e.user?.name ?? e.userId}</p>
                    <p className="text-xs text-zinc-400 truncate">Item: <span className="font-mono">{e.itemId}</span> · {e.date}</p>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full shrink-0" style={{ background: "#f5f3ff", color: "#7c3aed" }}>
                    #{e.id}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div
            className="bg-white rounded-2xl overflow-hidden flex-1"
            style={{ border: "1px solid #f4f4f5", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #f9f9f9" }}>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "#ede9fe" }}>
                  <ShoppingBag className="h-3.5 w-3.5" style={{ color: "#6d28d9" }} />
                </div>
                <span className="text-sm font-black text-zinc-800">Top Items</span>
              </div>
              <Link href="/items">
                <button className="text-xs font-bold flex items-center gap-1 hover:underline underline-offset-2" style={{ color: "#7c3aed" }}>
                  Manage <ArrowRight className="h-3 w-3" />
                </button>
              </Link>
            </div>
            <div className="p-3 space-y-1.5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-xl" />
                ))
              ) : items.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-5">No items yet</p>
              ) : (
                items.slice(0, 5).map((p) => (
                  <div
                    key={p.itemId}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-50 transition-colors"
                    style={{ border: "1px solid #f9f9f9" }}
                  >
                    <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0" style={{ background: "#f5f3ff", border: "1px solid #ede9fe" }}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="h-4 w-4" style={{ color: "#c4b5fd" }} />
                      )}
                    </div>
                    <p className="text-xs font-bold text-zinc-800 truncate flex-1">{p.name || p.description}</p>
                    <span className="text-[10px] font-black font-mono px-1.5 py-0.5 rounded-md shrink-0" style={{ background: "#f5f3ff", color: "#7c3aed" }}>
                      {p.itemId}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #f4f4f5", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#7c3aed" }}>
              Quick Actions
            </p>
            <div className="space-y-2">
              {[
                { href: "/users",         icon: Users,        label: "All Users",   color: "#7c3aed", bg: "#f5f3ff" },
                { href: "/items?action=new", icon: Zap,       label: "Add Item",    color: "#6d28d9", bg: "#ede9fe" },
                { href: "/orders",        icon: ClipboardList, label: "All Orders", color: "#4f46e5", bg: "#eef2ff" },
              ].map(({ href, icon: Icon, label, color, bg }) => (
                <Link key={label} href={href}>
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left text-sm font-bold text-zinc-700 group hover:shadow-sm"
                    style={{ border: "1px solid #f4f4f5", background: "#fafafa" }}
                  >
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ background: bg }}>
                      <Icon className="h-3.5 w-3.5" style={{ color }} />
                    </div>
                    {label}
                    <ArrowRight className="h-3.5 w-3.5 ml-auto text-zinc-300 group-hover:translate-x-0.5 transition-transform" style={{ color }} />
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}