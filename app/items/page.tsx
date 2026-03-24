"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus, Search, Pencil, Trash2, Package, ExternalLink,
  Tag, LayoutGrid, LayoutList, ShoppingBag, TrendingUp, AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { itemApi } from "@/lib/api";
import type { Item } from "@/types";
import { ItemForm, type ItemFormValues } from "@/components/items/item-form";
import Link from "next/link";

// ── Stock helpers ─────────────────────────────────────────────────────────────
const stockBadge = (s?: number | null) => {
  if (s == null) return { bg: "#f4f4f5", color: "#a1a1aa", label: "—" };
  if (s === 0)   return { bg: "#fef2f2", color: "#ef4444", label: "Out of stock" };
  if (s <= 5)    return { bg: "#fffbeb", color: "#d97706", label: `${s} left` };
  return           { bg: "#f0fdf4", color: "#16a34a", label: `${s} in stock` };
};

// ── Grid Item Card ────────────────────────────────────────────────────────────
function ItemGridCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}) {
  const stock = stockBadge(item.stock);
  const displayName = item.name || item.description;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col group"
      style={{
        border: "1px solid #f4f4f5",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "0 8px 32px rgba(109,40,217,0.11)";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: "#f5f3ff" }}>
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12" style={{ color: "#ddd6fe" }} />
          </div>
        )}
        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {item.category && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.92)", color: "#4f46e5", border: "1px solid #e0e7ff" }}
            >
              {item.category}
            </span>
          )}
          {item.stock === 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
              Out of Stock
            </span>
          )}
        </div>
        {/* Action overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: "rgba(15,10,30,0.45)", backdropFilter: "blur(2px)" }}
        >
          <Link href={`/shop/${item.itemId}`} target="_blank">
            <button
              className="h-9 w-9 rounded-xl bg-white/90 flex items-center justify-center text-zinc-700 hover:bg-white transition-colors shadow-lg"
              title="View public page"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </Link>
          <button
            className="h-9 w-9 rounded-xl flex items-center justify-center text-white transition-colors shadow-lg hover:scale-105"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
            onClick={() => onEdit(item)}
            title="Edit item"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            className="h-9 w-9 rounded-xl bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors shadow-lg"
            onClick={() => onDelete(item)}
            title="Delete item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Code */}
        <span
          className="text-[10px] font-black font-mono px-2 py-0.5 rounded-md self-start mb-2"
          style={{ background: "#f5f3ff", color: "#7c3aed" }}
        >
          {item.itemId}
        </span>

        <h3 className="text-sm font-bold text-zinc-900 leading-snug line-clamp-2 mb-1">
          {displayName}
        </h3>
        {item.shortDescription && (
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
            {item.shortDescription}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3" style={{ borderTop: "1px solid #f4f4f5" }}>
          {item.price != null ? (
            <span className="text-base font-black text-zinc-900">
              LKR {Number(item.price).toLocaleString()}
            </span>
          ) : (
            <span className="text-xs text-zinc-400 italic">No price</span>
          )}
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: stock.bg, color: stock.color }}
          >
            {stock.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function ItemsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Item | undefined>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try { setItems((await itemApi.getAll()).reverse()); }
    catch { toast.error("Failed to load items"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setEditTarget(undefined);
      setFormOpen(true);
    }
  }, [searchParams]);

  const filtered = items.filter(
    (p) =>
      (p.name ?? p.description).toLowerCase().includes(search.toLowerCase()) ||
      p.itemId.toLowerCase().includes(search.toLowerCase()) ||
      (p.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // Derived stats
  const totalValue = items.reduce((acc, p) => acc + (p.price ?? 0), 0);
  const outOfStock = items.filter((p) => p.stock === 0).length;
  const lowStock   = items.filter((p) => p.stock != null && p.stock > 0 && p.stock <= 5).length;

  const openEdit = (p: Item) => { setEditTarget(p); setFormOpen(true); };
  const openDelete = (p: Item) => { setDeleteTarget(p); setDeleteOpen(true); };

  const handleFormSubmit = async (values: ItemFormValues) => {
    setSubmitting(true);
    try {
      if (editTarget) { await itemApi.update(editTarget.itemId, values); toast.success("Item updated"); }
      else            { await itemApi.create(values);                    toast.success("Item created"); }
      setFormOpen(false);
      router.replace("/items");
      fetchItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await itemApi.delete(deleteTarget.itemId);
      toast.success("Item deleted");
      setDeleteOpen(false);
      fetchItems();
    } catch { toast.error("Failed to delete item"); }
  };

  return (
    <>
      <div
        className="space-y-6"
        style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      >

        {/* ══════════════════════════════════════════
            PAGE HEADER
        ══════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-6 rounded-full" style={{ background: "linear-gradient(90deg,#7c3aed,#4f46e5)" }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#7c3aed" }}>
                Catalogue
              </span>
            </div>
            <h1 className="text-xl font-black text-zinc-900 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
              Items
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              {loading ? "Loading…" : `${filtered.length} of ${items.length} item${items.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => { setEditTarget(undefined); setFormOpen(true); }}
            className="h-10 px-5 rounded-xl text-white text-sm font-bold flex items-center gap-2 shrink-0 hover:opacity-90 transition-all hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
              boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
            }}
          >
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>

        {/* ══════════════════════════════════════════
            STAT STRIP
        ══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: ShoppingBag,
              label: "Total Items",
              value: loading ? "—" : String(items.length),
              iconBg: "#f5f3ff", iconColor: "#7c3aed",
            },
            {
              icon: TrendingUp,
              label: "Catalogue Value",
              value: loading ? "—" : `LKR ${totalValue.toLocaleString()}`,
              iconBg: "#eef2ff", iconColor: "#4f46e5",
            },
            {
              icon: AlertTriangle,
              label: "Stock Alerts",
              value: loading ? "—" : `${outOfStock} out · ${lowStock} low`,
              iconBg: outOfStock > 0 ? "#fef2f2" : "#f0fdf4",
              iconColor: outOfStock > 0 ? "#ef4444" : "#16a34a",
            },
          ].map(({ icon: Icon, label, value, iconBg, iconColor }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-4 flex items-center gap-4"
              style={{ border: "1px solid #f4f4f5", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: iconBg }}
              >
                <Icon className="h-5 w-5" style={{ color: iconColor }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{label}</p>
                <p className="text-base font-black text-zinc-900 mt-0.5 leading-tight">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════
            TOOLBAR — search + view toggle
        ══════════════════════════════════════════ */}
        <div
          className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-4 rounded-2xl bg-white"
          style={{ border: "1px solid #f4f4f5", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              className="pl-9 h-10 rounded-xl border-zinc-200 bg-zinc-50 text-sm focus-visible:bg-white focus-visible:ring-violet-400 focus-visible:border-violet-400 transition-colors"
              placeholder="Search by name, code or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* View toggle */}
          <div
            className="flex items-center rounded-xl p-1 shrink-0"
            style={{ background: "#f5f3ff", border: "1px solid #ede9fe" }}
          >
            {(["grid", "table"] as const).map((mode) => {
              const Icon = mode === "grid" ? LayoutGrid : LayoutList;
              const active = viewMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="h-8 w-10 rounded-lg flex items-center justify-center transition-all"
                  style={
                    active
                      ? { background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "white", boxShadow: "0 2px 8px rgba(124,58,237,0.3)" }
                      : { color: "#a78bfa" }
                  }
                  title={`${mode} view`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            GRID VIEW
        ══════════════════════════════════════════ */}
        {viewMode === "grid" && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border bg-white">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <div className="p-4 space-y-2.5">
                      <Skeleton className="h-3 w-20 rounded-md" />
                      <Skeleton className="h-4 w-3/4 rounded-lg" />
                      <Skeleton className="h-3 w-full rounded-lg" />
                      <Skeleton className="h-px w-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-24 rounded-lg" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <div className="h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ background: "#f5f3ff" }}>
                  <Package className="h-10 w-10" style={{ color: "#c4b5fd" }} />
                </div>
                <p className="text-zinc-600 font-bold text-base">
                  {search ? "No matching items" : "No items yet"}
                </p>
                <p className="text-zinc-400 text-sm mt-1">
                  {search ? "Try a different search term" : "Add your first item to get started"}
                </p>
                {!search && (
                  <button
                    onClick={() => { setEditTarget(undefined); setFormOpen(true); }}
                    className="mt-5 h-10 px-6 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                  >
                    Add First Item
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((p) => (
                  <ItemGridCard
                    key={p.itemId}
                    item={p}
                    onEdit={openEdit}
                    onDelete={openDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════
            TABLE VIEW
        ══════════════════════════════════════════ */}
        {viewMode === "table" && (
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: "1px solid #f4f4f5", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            <Table>
              <TableHeader>
                <TableRow style={{ background: "#faf9ff" }}>
                  <TableHead className="w-14 text-[10px] font-black uppercase tracking-wider text-zinc-400 pl-5">Img</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Item</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Code</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Category</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Price</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Stock</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-wider text-zinc-400 text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-zinc-50">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-5 w-full rounded-lg" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: "#f5f3ff" }}>
                          <Package className="h-6 w-6" style={{ color: "#c4b5fd" }} />
                        </div>
                        <p className="text-sm font-bold text-zinc-500">
                          {search ? "No matching items" : "No items yet. Add one!"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => {
                    const stock = stockBadge(p.stock);
                    return (
                      <TableRow
                        key={p.itemId}
                        className="border-zinc-50 transition-colors"
                        style={{ borderLeft: "3px solid transparent" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "#faf9ff";
                          (e.currentTarget as HTMLElement).style.borderLeftColor = "#7c3aed";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "";
                          (e.currentTarget as HTMLElement).style.borderLeftColor = "transparent";
                        }}
                      >
                        {/* Thumbnail */}
                        <TableCell className="pl-5">
                          <div
                            className="h-11 w-11 rounded-xl overflow-hidden flex items-center justify-center"
                            style={{ background: "#f5f3ff", border: "1px solid #ede9fe" }}
                          >
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="h-5 w-5" style={{ color: "#c4b5fd" }} />
                            )}
                          </div>
                        </TableCell>
                        {/* Name */}
                        <TableCell>
                          <p className="text-sm font-bold text-zinc-900">{p.name || p.description}</p>
                          {p.shortDescription && (
                            <p className="text-xs text-zinc-400 truncate max-w-[180px] mt-0.5">{p.shortDescription}</p>
                          )}
                        </TableCell>
                        {/* Code */}
                        <TableCell>
                          <span className="text-xs font-black font-mono px-2.5 py-1 rounded-lg" style={{ background: "#f5f3ff", color: "#7c3aed" }}>
                            {p.itemId}
                          </span>
                        </TableCell>
                        {/* Category */}
                        <TableCell>
                          {p.category ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#eef2ff", color: "#4f46e5" }}>
                              <Tag className="h-3 w-3" />{p.category}
                            </span>
                          ) : <span className="text-zinc-300 text-xs">—</span>}
                        </TableCell>
                        {/* Price */}
                        <TableCell>
                          {p.price != null ? (
                            <span className="text-sm font-black text-zinc-900">LKR {Number(p.price).toLocaleString()}</span>
                          ) : <span className="text-zinc-300 text-xs">—</span>}
                        </TableCell>
                        {/* Stock */}
                        <TableCell>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: stock.bg, color: stock.color }}>
                            {stock.label}
                          </span>
                        </TableCell>
                        {/* Actions */}
                        <TableCell className="text-right pr-5">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/shop/${p.itemId}`} target="_blank">
                              <button className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors" title="View public page">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </button>
                            </Link>
                            <button
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                              onClick={() => openEdit(p)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              onClick={() => openDelete(p)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
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
                  <strong className="text-zinc-700">{filtered.length}</strong> of{" "}
                  <strong className="text-zinc-700">{items.length}</strong> items
                </p>
                <span className="text-xs font-bold" style={{ color: "#7c3aed" }}>
                  Table view
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => !o && (setFormOpen(false), router.replace("/items"))}>
        <DialogContent className="max-w-xl rounded-2xl">
          <div className="h-1 w-full rounded-t-2xl -mt-1 mb-1" style={{ background: "linear-gradient(90deg, #7c3aed, #818cf8, #4f46e5)" }} />
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-zinc-900" style={{ letterSpacing: "-0.01em" }}>
              {editTarget ? "Edit Item" : "Add New Item"}
            </DialogTitle>
          </DialogHeader>
          <ItemForm
            item={editTarget}
            onSubmit={handleFormSubmit}
            onCancel={() => { setFormOpen(false); router.replace("/items"); }}
            loading={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={(o) => !o && setDeleteOpen(false)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-900 font-black">Delete Item</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              Delete <strong className="text-zinc-800">{deleteTarget?.name || deleteTarget?.itemId}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function ItemsPage() {
  return <Suspense><ItemsContent /></Suspense>;
}