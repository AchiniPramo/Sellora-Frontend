"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package, ShoppingCart, ArrowLeft, Tag, Calendar,
  CheckCircle2, Truck, XCircle, RotateCcw, Clock,
  Minus, Plus, ShieldCheck, Loader2, ShoppingBag, Trash2
} from "lucide-react";
import { orderApi, itemApi } from "@/lib/api";
import type { Order, OrderStatus, Item } from "@/types";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// ─── localStorage helpers ─────────────────────────────────────────────────────
const STATUS_KEY = "sellora_order_status";
const QTY_KEY = "sellora_order_qty";
function loadStatuses(): Record<string, OrderStatus> {
  try { return JSON.parse(localStorage.getItem(STATUS_KEY) ?? "{}"); } catch { return {}; }
}
function loadQtys(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(QTY_KEY) ?? "{}"); } catch { return {}; }
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  pending:   { label: "Pending",   bg: "#fffbeb", color: "#d97706", icon: Clock },
  accepted:  { label: "Accepted",  bg: "#eff6ff", color: "#2563eb", icon: CheckCircle2 },
  shipped:   { label: "Shipped",   bg: "#f5f3ff", color: "#7c3aed", icon: Truck },
  completed: { label: "Completed", bg: "#f0fdf4", color: "#16a34a", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", bg: "#fef2f2", color: "#ef4444", icon: XCircle },
  refunded:  { label: "Refunded",  bg: "#f9fafb", color: "#6b7280", icon: RotateCcw },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon className="h-3 w-3" />{cfg.label}
    </span>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function MyOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlAction = searchParams.get("action");
  const urlItemId = searchParams.get("itemId");

  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const [pendingItem, setPendingItem] = useState<Item | null>(null);
  const [loadingItem, setLoadingItem] = useState(false);
  const [newOrderQty, setNewOrderQty] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [programs, setPrograms] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<Record<string, OrderStatus>>({});
  const [qtys, setQtys] = useState<Record<string, number>>({});

  useEffect(() => {
    setStatuses(loadStatuses());
    setQtys(loadQtys());
    setSession(getSession());
  }, []);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      const returnUrl = urlItemId ? `/my-orders?action=new&itemId=${urlItemId}` : "/my-orders";
      router.replace(`/login?from=${encodeURIComponent(returnUrl)}`);
    }
  }, [router, urlItemId]);

  useEffect(() => {
    if (urlAction !== "new" || !urlItemId) return;
    setLoadingItem(true);
    itemApi.getById(urlItemId)
      .then(setPendingItem)
      .catch(() => toast.error("Item not found"))
      .finally(() => setLoadingItem(false));
  }, [urlAction, urlItemId]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const [allEnrollments, allPrograms] = await Promise.all([orderApi.getAll(), itemApi.getAll()]);
      setPrograms(allPrograms);
      const s = getSession();
      const mine = s
        ? allEnrollments.filter((e) => e.userId === s.id).sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
        : [];
      setOrders(mine);
      setStatuses(loadStatuses());
      setQtys(loadQtys());
    } catch { /* services may not be running */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const getStatus = (id: string | number): OrderStatus => statuses[String(id)] ?? "pending";
  const getQty = (id: string | number): number => qtys[String(id)] ?? 1;
  const findProgram = (itemId: string) => programs.find((p) => p.itemId === itemId);

  const handleConfirmOrder = async () => {
    const s = getSession();
    if (!s || !urlItemId) return;
    setConfirming(true);
    try {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const created = await orderApi.create({ userId: s.id, itemId: urlItemId, date: dateStr });
      const sid = String(created.id);
      const nextStatuses = { ...loadStatuses(), [sid]: "pending" as OrderStatus };
      const nextQtys = { ...loadQtys(), [sid]: newOrderQty };
      localStorage.setItem(STATUS_KEY, JSON.stringify(nextStatuses));
      localStorage.setItem(QTY_KEY, JSON.stringify(nextQtys));
      toast.success("🎉 Order placed successfully!");
      router.replace("/my-orders");
      fetchOrders();
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  const handleDeleteOrder = async (orderId: number | undefined) => {
    if (!orderId) return;
    try {
      await orderApi.delete(orderId);
      toast.success("Order removed from history");
      const sid = String(orderId);
      const nextStatuses = { ...loadStatuses() };
      const nextQtys = { ...loadQtys() };
      delete nextStatuses[sid];
      delete nextQtys[sid];
      localStorage.setItem(STATUS_KEY, JSON.stringify(nextStatuses));
      localStorage.setItem(QTY_KEY, JSON.stringify(nextQtys));
      fetchOrders();
    } catch {
      toast.error("Failed to remove order");
    }
  };

  const unitPrice = pendingItem?.price ?? 0;
  if (!session) return null;

  return (
    <div
      className="max-w-4xl mx-auto px-4 sm:px-6 py-8"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <button className="h-9 w-9 rounded-xl border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-50 transition-colors shadow-sm">
            <ArrowLeft className="h-4 w-4 text-zinc-600" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">My Orders</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Track and manage your purchases</p>
        </div>
      </div>

      {/* ── Confirm Order Card ──────────────────────────────────────────── */}
      {urlAction === "new" && urlItemId && (
        <div className="mb-10">
          {loadingItem ? (
            <div className="rounded-2xl border border-zinc-100 bg-white p-8">
              <div className="flex gap-6">
                <Skeleton className="h-36 w-36 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-7 w-56" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-10 w-36" />
                </div>
              </div>
            </div>
          ) : pendingItem ? (
            <div
              className="rounded-2xl bg-white overflow-hidden"
              style={{ boxShadow: "0 4px 6px -1px rgba(109,40,217,0.08), 0 10px 40px -5px rgba(109,40,217,0.1)", border: "1px solid #ede9fe" }}
            >
              {/* Top accent bar */}
              <div
                className="h-1.5 w-full"
                style={{ background: "linear-gradient(90deg, #7c3aed, #4f46e5)" }}
              />
              {/* Confirm header */}
              <div className="flex items-center gap-2.5 px-6 py-3.5 border-b border-zinc-50" style={{ background: "#faf9ff" }}>
                <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "#ede9fe" }}>
                  <ShieldCheck className="h-3.5 w-3.5" style={{ color: "#7c3aed" }} />
                </div>
                <span className="text-sm font-bold" style={{ color: "#5b21b6" }}>Confirm Your Order</span>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Image */}
                  <div
                    className="w-full sm:w-40 h-40 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                    style={{ background: "#f5f3ff", border: "1px solid #ede9fe" }}
                  >
                    {pendingItem.images?.[0] ? (
                      <img src={pendingItem.images[0]} alt={pendingItem.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-12 w-12" style={{ color: "#c4b5fd" }} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {pendingItem.category && (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
                        style={{ background: "#eef2ff", color: "#4f46e5" }}
                      >
                        <Tag className="h-3 w-3" />{pendingItem.category}
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-zinc-900 leading-tight">
                      {pendingItem.name || pendingItem.description}
                    </h3>
                    <p className="text-zinc-400 text-xs font-mono mt-1">SKU: {pendingItem.itemId}</p>
                    {pendingItem.shortDescription && (
                      <p className="text-zinc-500 text-sm mt-2">{pendingItem.shortDescription}</p>
                    )}

                    {/* Price + qty */}
                    <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-end gap-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Quantity</p>
                        <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
                          <button
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-white hover:text-zinc-900 transition-all"
                            onClick={() => setNewOrderQty((q) => Math.max(1, q - 1))}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-10 text-center text-base font-bold text-zinc-900">{newOrderQty}</span>
                          <button
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-white hover:text-zinc-900 transition-all"
                            onClick={() => setNewOrderQty((q) => q + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      {unitPrice > 0 && (
                        <div>
                          <p className="text-xs text-zinc-400 mb-0.5">
                            LKR {unitPrice.toLocaleString()} × {newOrderQty}
                          </p>
                          <p className="text-2xl font-bold text-zinc-900">
                            LKR {(unitPrice * newOrderQty).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={handleConfirmOrder}
                        disabled={confirming}
                        className="h-11 px-7 rounded-xl text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-60 transition-opacity"
                        style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" }}
                      >
                        {confirming ? (
                          <><Loader2 className="h-4 w-4 animate-spin" />Placing Order…</>
                        ) : (
                          <><ShoppingCart className="h-4 w-4" />Confirm Order</>
                        )}
                      </button>
                      <Link href="/">
                        <button className="h-11 px-5 rounded-xl text-sm font-semibold border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition-colors">
                          Continue Shopping
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-10 text-center text-red-500">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="font-medium text-sm">Item not found</p>
              <Link href="/" className="text-xs mt-1 inline-block hover:underline" style={{ color: "#7c3aed" }}>← Back to shop</Link>
            </div>
          )}
        </div>
      )}

      {/* ── Order History ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "#f5f3ff" }}>
            <Calendar className="h-3.5 w-3.5" style={{ color: "#7c3aed" }} />
          </div>
          <h2 className="text-base font-bold text-zinc-800">Order History</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center bg-white">
            <div className="h-14 w-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-7 w-7 text-zinc-300" />
            </div>
            <p className="text-zinc-600 font-semibold">No orders yet</p>
            <p className="text-sm text-zinc-400 mt-1">Items you order will appear here</p>
            <Link href="/">
              <button
                className="mt-5 h-10 px-6 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" }}
              >
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const prog = findProgram(order.itemId);
              const qty = getQty(order.id ?? 0);
              const price = prog?.price ?? 0;
              const status = getStatus(order.id ?? 0);
              return (
                <div
                  key={order.id}
                  className="rounded-2xl bg-white border border-zinc-100 p-4 sm:p-5 hover:shadow-sm transition-shadow"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail */}
                    <div
                      className="h-16 w-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                      style={{ background: "#f5f3ff", border: "1px solid #ede9fe" }}
                    >
                      {prog?.images?.[0] ? (
                        <img src={prog.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="h-7 w-7" style={{ color: "#c4b5fd" }} />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-zinc-900 text-sm">
                            {prog?.name || prog?.description || order.itemId}
                          </p>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5">#{order.id} · {order.itemId}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={status} />
                          {(status === "completed" || status === "cancelled") && (
                            <button
                              className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              onClick={() => handleDeleteOrder(order.id)}
                              title="Remove order"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2.5 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />{order.date}
                        </span>
                        <span>Qty: <strong className="text-zinc-700">{qty}</strong></span>
                        {price > 0 && (
                          <span className="font-bold text-zinc-900">
                            LKR {(price * qty).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" style={{ color: "#7c3aed" }} />
        <p className="text-sm text-zinc-400 mt-3">Loading your orders…</p>
      </div>
    }>
      <MyOrdersContent />
    </Suspense>
  );
}