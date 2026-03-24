"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { toast } from "sonner";
import {
  Search, CheckCircle2, Truck, XCircle, RotateCcw, Clock,
  RefreshCw, Package, Filter, ClipboardList, TrendingUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { orderApi, itemApi } from "@/lib/api";
import type { Order, OrderStatus, Item } from "@/types";

// ─── localStorage helpers ─────────────────────────────────────────────────────
const STATUS_KEY = "sellora_order_status";
function loadStatuses(): Record<string, OrderStatus> {
  try { return JSON.parse(localStorage.getItem(STATUS_KEY) ?? "{}"); } catch { return {}; }
}
function saveStatuses(s: Record<string, OrderStatus>) {
  localStorage.setItem(STATUS_KEY, JSON.stringify(s));
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, {
  label: string; bg: string; color: string; darkBg: string; icon: React.ElementType;
}> = {
  pending:   { label: "Pending",   bg: "#fffbeb", color: "#d97706", darkBg: "#92400e", icon: Clock },
  accepted:  { label: "Accepted",  bg: "#eff6ff", color: "#2563eb", darkBg: "#1e40af", icon: CheckCircle2 },
  shipped:   { label: "Shipped",   bg: "#f5f3ff", color: "#7c3aed", darkBg: "#5b21b6", icon: Truck },
  completed: { label: "Completed", bg: "#f0fdf4", color: "#16a34a", darkBg: "#14532d", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", bg: "#fef2f2", color: "#ef4444", darkBg: "#991b1b", icon: XCircle },
  refunded:  { label: "Refunded",  bg: "#f9fafb", color: "#6b7280", darkBg: "#374151", icon: RotateCcw },
};

const STATUS_ACTIONS: Array<{
  status: OrderStatus; label: string; icon: React.ElementType;
  bg: string; color: string; hoverBg: string;
}> = [
  { status: "accepted",  label: "Accept",   icon: CheckCircle2, bg: "#eff6ff", color: "#2563eb", hoverBg: "#dbeafe" },
  { status: "shipped",   label: "Ship",     icon: Truck,        bg: "#f5f3ff", color: "#7c3aed", hoverBg: "#ede9fe" },
  { status: "completed", label: "Complete", icon: CheckCircle2, bg: "#f0fdf4", color: "#16a34a", hoverBg: "#dcfce7" },
  { status: "cancelled", label: "Cancel",   icon: XCircle,      bg: "#fef2f2", color: "#ef4444", hoverBg: "#fee2e2" },
  { status: "refunded",  label: "Refund",   icon: RotateCcw,    bg: "#f9fafb", color: "#6b7280", hoverBg: "#f3f4f6" },
];

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
}

// ─── Tiny sparkline bar (visual weight indicator) ─────────────────────────────
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1 w-full rounded-full mt-2" style={{ background: "#f4f4f5" }}>
      <div
        className="h-1 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function AdminOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Record<string, Item>>({});
  const [statuses, setStatuses] = useState<Record<string, OrderStatus>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [allOrders, allItems] = await Promise.all([orderApi.getAll(), itemApi.getAll()]);
      setOrders(allOrders.sort((a, b) => (b.id ?? 0) - (a.id ?? 0)));
      const m: Record<string, Item> = {};
      allItems.forEach((p) => { m[p.itemId] = p; });
      setItems(m);
      setStatuses(loadStatuses());
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const getStatus = (id: string | number): OrderStatus => statuses[String(id)] ?? "pending";

  const updateStatus = (id: string | number, s: OrderStatus) => {
    const next = { ...statuses, [String(id)]: s };
    setStatuses(next);
    saveStatuses(next);
    toast.success(`Order #${id} marked as ${s}`);
  };

  const filtered = orders.filter((o) => {
    const name = (o.user?.name ?? o.userId).toLowerCase();
    const matchSearch =
      name.includes(search.toLowerCase()) ||
      o.itemId.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search);
    const matchStatus = statusFilter === "all" || getStatus(o.id ?? "") === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = orders.reduce((acc, o) => {
    const s = getStatus(o.id ?? "");
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <div
      className="space-y-6"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >

      {/* ══════════════════════════════════════════════
          PAGE HEADER — title + refresh
      ══════════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="h-1 w-6 rounded-full"
              style={{ background: "linear-gradient(90deg, #7c3aed, #4f46e5)" }}
            />
            <span
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: "#7c3aed" }}
            >
              Admin
            </span>
          </div>
          <h1 className="text-xl font-black text-zinc-900 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
            Orders
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {loading ? "Loading…" : `${orders.length} total · ${filtered.length} shown`}
          </p>
        </div>
        <button
          onClick={refresh}
          className="h-10 px-4 rounded-xl border border-zinc-200 bg-white text-sm font-bold text-zinc-600 flex items-center gap-2 hover:bg-zinc-50 transition-colors shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* ══════════════════════════════════════════════
          STATUS OVERVIEW — horizontal scrollable cards
          with mini progress bars
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          const active = statusFilter === s;
          const count = counts[s] ?? 0;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(active ? "all" : s)}
              className="rounded-2xl p-4 text-left transition-all hover:shadow-md group relative overflow-hidden"
              style={{
                background: active ? cfg.bg : "white",
                border: active ? `2px solid ${cfg.color}` : "1px solid #f4f4f5",
                boxShadow: active
                  ? `0 0 0 3px ${cfg.bg}, 0 4px 12px rgba(0,0,0,0.06)`
                  : "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {/* Background watermark icon */}
              <Icon
                className="absolute -bottom-2 -right-2 h-12 w-12 opacity-5 transition-opacity group-hover:opacity-10"
                style={{ color: cfg.color }}
              />
              <div className="flex items-center justify-between mb-2">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{ background: active ? `${cfg.color}20` : "#f4f4f5" }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                </div>
                {active && (
                  <span
                    className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                    style={{ background: cfg.color, color: "white" }}
                  >
                    ON
                  </span>
                )}
              </div>
              <p
                className="text-2xl font-black leading-none"
                style={{ color: active ? cfg.color : "#18181b" }}
              >
                {loading ? "—" : count}
              </p>
              <p className="text-[11px] font-semibold text-zinc-400 mt-0.5">{cfg.label}</p>
              <MiniBar value={count} max={maxCount} color={cfg.color} />
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════
          TOOLBAR — search + filter (inline, no gap)
      ══════════════════════════════════════════════ */}
      <div
        className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-4 rounded-2xl bg-white border border-zinc-100"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div className="flex gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              className="pl-9 h-10 rounded-xl border-zinc-200 text-sm focus-visible:ring-violet-400 focus-visible:border-violet-400 bg-zinc-50 focus-visible:bg-white transition-colors"
              placeholder="Search by customer, item or order ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Status filter */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | OrderStatus)}>
            <SelectTrigger className="w-40 h-10 rounded-xl border-zinc-200 text-sm bg-zinc-50">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-zinc-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count pill */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0"
          style={{ background: "#f5f3ff", color: "#7c3aed" }}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TABLE
      ══════════════════════════════════════════════ */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          border: "1px solid #f4f4f5",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow style={{ background: "#faf9ff" }}>
              <TableHead className="w-16 text-[10px] font-black uppercase tracking-wider text-zinc-400 pl-5">
                Order
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                Item
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                Customer
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                Date
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                Value
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                Status
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider text-zinc-400 text-right pr-5">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="border-zinc-50">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full rounded-lg" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="h-16 w-16 rounded-3xl flex items-center justify-center"
                      style={{ background: "#f5f3ff" }}
                    >
                      <Package className="h-8 w-8" style={{ color: "#c4b5fd" }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-600">No orders found</p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {search ? "Try a different search term" : "Orders will appear here"}
                      </p>
                    </div>
                    {search && (
                      <button
                        className="text-xs font-bold hover:underline"
                        style={{ color: "#7c3aed" }}
                        onClick={() => setSearch("")}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => {
                const item = items[order.itemId];
                const status = getStatus(order.id ?? "");
                const cfg = STATUS_CONFIG[status];
                return (
                  <TableRow
                    key={order.id}
                    className="border-zinc-50 transition-colors group"
                    style={{ borderLeft: "3px solid transparent" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#faf9ff";
                      (e.currentTarget as HTMLElement).style.borderLeftColor = cfg.color;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "";
                      (e.currentTarget as HTMLElement).style.borderLeftColor = "transparent";
                    }}
                  >
                    {/* Order ID */}
                    <TableCell className="pl-5">
                      <span
                        className="text-xs font-black font-mono px-2 py-1 rounded-lg"
                        style={{ background: "#f5f3ff", color: "#7c3aed" }}
                      >
                        #{order.id}
                      </span>
                    </TableCell>

                    {/* Item */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-10 w-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                          style={{ background: "#f5f3ff", border: "1px solid #ede9fe" }}
                        >
                          {item?.images?.[0] ? (
                            <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="h-5 w-5" style={{ color: "#c4b5fd" }} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-zinc-900 leading-tight truncate max-w-[140px]">
                            {item?.name || item?.description || order.itemId}
                          </p>
                          <span
                            className="text-[10px] font-black font-mono px-1.5 py-0.5 rounded-md mt-0.5 inline-block"
                            style={{ background: "#f5f3ff", color: "#7c3aed" }}
                          >
                            {order.itemId}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* Avatar initial */}
                        <div
                          className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                        >
                          {(order.user?.name ?? order.userId).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 leading-tight">
                            {order.user?.name ?? order.userId}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-mono">{order.userId}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <span className="text-sm text-zinc-500 font-medium">{order.date}</span>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      {item?.price != null ? (
                        <span className="text-sm font-black text-zinc-900">
                          LKR {Number(item.price).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-zinc-300 text-xs">—</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={status} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-5">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        {STATUS_ACTIONS.map(({ status: s, label, icon: Icon, bg, color, hoverBg }) =>
                          status !== s ? (
                            <button
                              key={s}
                              onClick={() => updateStatus(order.id ?? "", s)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border transition-colors"
                              style={{ background: bg, color, borderColor: `${color}33` }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = hoverBg; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = bg; }}
                            >
                              <Icon className="h-3 w-3" />{label}
                            </button>
                          ) : null
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Table footer */}
        {!loading && filtered.length > 0 && (
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: "1px solid #f4f4f5", background: "#fafafa" }}
          >
            <p className="text-xs text-zinc-400">
              Showing <strong className="text-zinc-700">{filtered.length}</strong> of{" "}
              <strong className="text-zinc-700">{orders.length}</strong> orders
            </p>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" style={{ color: "#a78bfa" }} />
              <span className="text-xs font-bold" style={{ color: "#7c3aed" }}>
                {counts["completed"] ?? 0} completed
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return <Suspense><AdminOrdersContent /></Suspense>;
}