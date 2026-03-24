"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft, Package, Tag, Sparkles, CheckCircle2, XCircle,
  ArrowLeft, ChevronRight, Star, Share2, Loader2
} from "lucide-react";
import { itemApi } from "@/lib/api";
import type { Item } from "@/types";
import { getSession } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function ItemDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [authModal, setAuthModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await itemApi.getById(params.id);
        setItem(data);
      } catch {
        toast.error("Item not found");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleOrder = () => {
    const session = getSession();
    if (!session) {
      setAuthModal(true);
    } else {
      router.push(`/my-orders?action=new&itemId=${params.id}`);
    }
  };

  if (loading) return <ItemDetailSkeleton />;
  if (!item)
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="h-20 w-20 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
          <Package className="h-10 w-10 text-zinc-300" />
        </div>
        <h2 className="text-xl font-bold text-zinc-700 mb-2">Item not found</h2>
        <Link href="/">
          <button className="mt-2 h-10 px-5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">
            ← Back to Shop
          </button>
        </Link>
      </div>
    );

  const displayName = item.name || item.description;
  const imgs = item.images && item.images.length > 0 ? item.images : [];
  const inStock = (item.stock ?? 1) > 0;

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(160deg, #faf9ff 0%, #f5f3ff 30%, #f8f8ff 100%)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-7">
          <Link href="/" className="hover:text-violet-600 transition-colors font-medium">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/#shop" className="hover:text-violet-600 transition-colors font-medium">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-zinc-700 font-semibold truncate max-w-[200px]">{displayName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ── Image Gallery ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div
              className="rounded-2xl overflow-hidden bg-white aspect-square relative"
              style={{ boxShadow: "0 4px 6px -1px rgba(109,40,217,0.06), 0 20px 50px -10px rgba(109,40,217,0.08)", border: "1px solid #ede9fe" }}
            >
              {imgs.length > 0 ? (
                <img
                  src={imgs[activeImg]}
                  alt={displayName}
                  className="w-full h-full object-cover transition-all duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: "#f5f3ff" }}>
                  <Package className="h-24 w-24" style={{ color: "#ddd6fe" }} />
                </div>
              )}
              {imgs.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => (i - 1 + imgs.length) % imgs.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-white/90 backdrop-blur shadow-sm flex items-center justify-center hover:bg-white transition-all"
                    style={{ border: "1px solid #ede9fe" }}
                  >
                    <ChevronLeft className="h-4 w-4 text-zinc-600" />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => (i + 1) % imgs.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-white/90 backdrop-blur shadow-sm flex items-center justify-center hover:bg-white transition-all"
                    style={{ border: "1px solid #ede9fe" }}
                  >
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {imgs.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {imgs.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="shrink-0 h-16 w-16 rounded-xl overflow-hidden transition-all"
                    style={{
                      border: i === activeImg ? "2px solid #7c3aed" : "2px solid #ede9fe",
                      opacity: i === activeImg ? 1 : 0.65,
                    }}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Item Info ── */}
          <div className="space-y-5">
            {/* Category + ID + rating */}
            <div className="flex items-center gap-2 flex-wrap">
              {item.category && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "#eef2ff", color: "#4f46e5" }}
                >
                  <Tag className="h-3 w-3" />{item.category}
                </span>
              )}
              <span
                className="text-xs font-bold font-mono px-2 py-1 rounded-lg"
                style={{ background: "#f5f3ff", color: "#7c3aed" }}
              >
                {item.itemId}
              </span>
              <div className="ml-auto flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />)}
                <span className="text-xs text-zinc-400 ml-1">(4.9)</span>
              </div>
            </div>

            {/* Name */}
            <h1 className="text-3xl font-extrabold text-zinc-900 leading-tight tracking-tight">{displayName}</h1>

            {/* Short description */}
            {item.shortDescription && (
              <p className="text-zinc-500 text-sm leading-relaxed">{item.shortDescription}</p>
            )}

            {/* Price */}
            <div className="flex items-end gap-3">
              {item.price != null ? (
                <>
                  <span className="text-4xl font-extrabold text-zinc-900">
                    LKR {Number(item.price).toLocaleString()}
                  </span>
                  <span className="text-zinc-400 text-sm pb-1">incl. taxes</span>
                </>
              ) : (
                <span className="text-xl text-zinc-400 italic">Price on request</span>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2">
              {inStock ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-emerald-600 font-semibold text-sm">
                    In Stock {item.stock != null && `(${item.stock} available)`}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-400" />
                  <span className="text-red-500 font-semibold text-sm">Out of Stock</span>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-zinc-100" />

            {/* Description */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#7c3aed" }}>Description</p>
              <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-line">{item.description}</p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-1">
              <button
                disabled={!inStock}
                onClick={handleOrder}
                className="flex-1 h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity shadow-md"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" }}
              >
                <Sparkles className="h-4 w-4" />
                {inStock ? "Place Order" : "Out of Stock"}
              </button>
              <button
                className="h-12 w-12 rounded-xl flex items-center justify-center border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors text-zinc-500"
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => router.back()}
              className="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Shop
            </button>
          </div>
        </div>
      </div>

      {/* ── Auth Modal ── */}
      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setAuthModal(false)}
          />
          <div
            className="relative bg-white rounded-2xl p-7 w-full max-w-sm text-center"
            style={{ boxShadow: "0 20px 60px rgba(109,40,217,0.2)" }}
          >
            {/* Modal accent bar */}
            <div
              className="h-1 w-full rounded-full mb-6 mx-auto"
              style={{ background: "linear-gradient(90deg, #7c3aed, #4f46e5)", width: "60px" }}
            />
            <div
              className="h-14 w-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
            >
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Sign in to Order</h3>
            <p className="text-zinc-500 text-sm mb-6">
              You need an account to place an order for <strong className="text-zinc-800">{displayName}</strong>.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 h-10 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
                onClick={() => setAuthModal(false)}
              >
                Cancel
              </button>
              <Link href={`/login?from=/shop/${params.id}`} className="flex-1">
                <button
                  className="w-full h-10 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" }}
                >
                  Sign In
                </button>
              </Link>
            </div>
            <p className="mt-3 text-xs text-zinc-400">
              No account?{" "}
              <Link href="/register" className="font-semibold hover:underline" style={{ color: "#7c3aed" }}>
                Register free
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Skeleton className="h-4 w-48 mb-7 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Skeleton className="aspect-square rounded-2xl w-full" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-1/3 rounded-lg" />
          <Skeleton className="h-9 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-12 w-1/2 rounded-lg" />
          <Skeleton className="h-4 w-1/3 rounded-lg" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}