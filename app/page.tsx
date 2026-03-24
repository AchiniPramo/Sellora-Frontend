"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles, ChevronLeft, ChevronRight, Star, Tag, Package,
  TrendingUp, Zap, Search, ArrowRight, ShoppingBag, Users, Award,
} from "lucide-react";
import { itemApi } from "@/lib/api";
import type { Item } from "@/types";
import { getSession } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

// ── Hero Slides ───────────────────────────────────────────────────────────────
const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1800&q=85",
    tag: "New Arrivals",
    heading: "Discover the Latest\nProducts & Deals",
    sub: "Curated items at unbeatable prices, delivered to your door.",
    cta: "Browse Items",
    href: "#shop",
    icon: Zap,
    accent: "#a78bfa",
  },
  {
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1800&q=85",
    tag: "Top Picks",
    heading: "Quality Products\nHandpicked for You",
    sub: "Our best sellers — loved by thousands of happy customers.",
    cta: "Shop Now",
    href: "#shop",
    icon: Star,
    accent: "#c4b5fd",
  },
  {
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1800&q=85",
    tag: "Best Value",
    heading: "Unbeatable Prices\nEvery Single Day",
    sub: "Save more on every order. Sellora — your trusted marketplace.",
    cta: "View Offers",
    href: "#shop",
    icon: TrendingUp,
    accent: "#ddd6fe",
  },
];

const CATEGORIES = ["All", "Electronics", "Food & Beverage", "Clothing", "Health", "Home", "Books", "Other"];

// ── Orb (reused from login/register) ─────────────────────────────────────────
function Orb({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        background: "radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)",
        ...style,
      }}
    />
  );
}

// ── Item Card ─────────────────────────────────────────────────────────────────
function ItemCard({ item, onOrder }: { item: Item; onOrder: (item: Item) => void }) {
  const hasImage = item.images && item.images.length > 0;
  const displayName = item.name || item.description;
  const inStock = (item.stock ?? 1) > 0;

  return (
    <div
      className="group bg-white rounded-2xl border border-zinc-100 overflow-hidden flex flex-col"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "0 12px 40px rgba(109,40,217,0.13)";
        el.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Image */}
      <Link href={`/shop/${item.itemId}`} className="block relative overflow-hidden">
        <div className="aspect-[4/3] relative">
          {hasImage ? (
            <img
              src={item.images![0]}
              alt={displayName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: "#f5f3ff" }}>
              <Package className="h-14 w-14" style={{ color: "#ddd6fe" }} />
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
            {item.category && (
              <span className="bg-white/95 backdrop-blur-sm text-zinc-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-zinc-200 shadow-sm">
                {item.category}
              </span>
            )}
            {!inStock && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                Out of Stock
              </span>
            )}
          </div>
          {/* Gradient overlay at bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(to top, rgba(109,40,217,0.12), transparent)" }}
          />
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/shop/${item.itemId}`}>
          <h3
            className="font-bold text-zinc-900 leading-snug line-clamp-2 text-sm transition-colors"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#7c3aed"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = ""; }}
          >
            {displayName}
          </h3>
        </Link>
        {item.shortDescription && (
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{item.shortDescription}</p>
        )}

        <div className="mt-3 flex items-center justify-between">
          {item.price != null ? (
            <span className="text-base font-black text-zinc-900">
              LKR {Number(item.price).toLocaleString()}
            </span>
          ) : (
            <span className="text-sm text-zinc-400 italic">Price on request</span>
          )}
          {item.stock != null && item.stock > 0 && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#f0fdf4", color: "#16a34a" }}
            >
              {item.stock} left
            </span>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <Link href={`/shop/${item.itemId}`} className="flex-1">
            <button className="w-full h-9 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-colors">
              View Details
            </button>
          </Link>
          <button
            disabled={!inStock}
            onClick={() => onOrder(item)}
            className="flex-1 h-9 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" }}
          >
            <Sparkles className="h-3 w-3" />
            Order
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [slideIdx, setSlideIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [authModal, setAuthModal] = useState(false);
  const [targetItem, setTargetItem] = useState<Item | null>(null);
  const [heroMounted, setHeroMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setSlideIdx((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const data = await itemApi.getAll();
      setItems(data);
    } catch { /* services may not be running */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleOrder = (item: Item) => {
    const session = getSession();
    if (!session) { setTargetItem(item); setAuthModal(true); }
    else { router.push(`/my-orders?action=new&itemId=${item.itemId}`); }
  };

  const filtered = items.filter((it) => {
    const name = (it.name || it.description).toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || (it.category ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || it.category === activeCategory;
    return matchSearch && matchCat;
  });

  const slide = SLIDES[slideIdx];
  const SlideIcon = slide.icon;

  return (
    <div
      className="bg-zinc-50"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* ════════════════════════════════════════════════
          HERO — full-bleed image + right-anchored card
          (mirrors login/register layout)
      ════════════════════════════════════════════════ */}
      <section className="relative min-h-[620px] flex items-center overflow-hidden">

        {/* Background image */}
        <img
          src={slide.image}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ filter: "brightness(0.4)" }}
        />

        {/* Violet gradient wash — same formula as login */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(88,28,135,0.6) 0%, rgba(49,46,129,0.5) 50%, rgba(15,10,30,0.75) 100%)",
          }}
        />

        {/* Atmospheric orbs */}
        <Orb style={{ width: 500, height: 500, top: "-15%", left: "-8%", opacity: 0.55 }} />
        <Orb style={{ width: 300, height: 300, bottom: "0%", left: "35%", opacity: 0.35 }} />

        {/* ── Left hero copy ── */}
        <div
          className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full flex flex-col lg:flex-row items-center gap-10 py-20"
        >
          <div
            className="flex-1 text-white"
            style={{
              opacity: heroMounted ? 1 : 0,
              transform: heroMounted ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            {/* Slide tag pill */}
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full mb-5 backdrop-blur-sm border"
              style={{
                background: "rgba(167,139,250,0.18)",
                borderColor: "rgba(167,139,250,0.3)",
                color: slide.accent,
              }}
            >
              <SlideIcon className="h-3.5 w-3.5" />
              {slide.tag}
            </span>

            {/* Headline */}
            <h1
              className="text-5xl sm:text-6xl font-black leading-none whitespace-pre-line mb-5 drop-shadow-lg"
              style={{ letterSpacing: "-0.03em" }}
            >
              {slide.heading.split("\n")[0]}
              <br />
              <span style={{ color: slide.accent }}>
                {slide.heading.split("\n")[1]}
              </span>
            </h1>

            <p className="text-white/65 text-base max-w-md mb-8 leading-relaxed">
              {slide.sub}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <a
                href={slide.href}
                className="inline-flex items-center gap-2 bg-white font-black text-sm px-7 py-3.5 rounded-xl hover:bg-zinc-50 transition-all shadow-xl group"
                style={{ color: "#7c3aed" }}
              >
                {slide.cta}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <Link href="/register">
                <button
                  className="inline-flex items-center gap-2 font-bold text-sm px-7 py-3.5 rounded-xl transition-colors border backdrop-blur-sm"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    borderColor: "rgba(255,255,255,0.25)",
                    color: "white",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.2)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
                >
                  Join Free
                </button>
              </Link>
            </div>

            {/* Inline stats under CTAs */}
            <div className="flex gap-6 mt-10">
              {[
                { label: "Items", value: loading ? "—" : String(items.length) },
                { label: "Categories", value: loading ? "—" : String(new Set(items.map(i => i.category).filter(Boolean)).size || 0) },
                { label: "Rating", value: "4.9 ★" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p
                    className="text-2xl font-black leading-none"
                    style={{ color: slide.accent }}
                  >
                    {value}
                  </p>
                  <p className="text-xs text-white/50 mt-0.5 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right glass card (feature highlights) ── */}
          <div
            className="hidden lg:block w-72 shrink-0"
            style={{
              opacity: heroMounted ? 1 : 0,
              transform: heroMounted ? "translateX(0)" : "translateX(24px)",
              transition: "opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s",
            }}
          >
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 32px 64px rgba(0,0,0,0.3)",
              }}
            >
              {/* Card top accent */}
              <div
                className="h-1 w-full"
                style={{ background: "linear-gradient(90deg, #7c3aed, #818cf8, #4f46e5)" }}
              />
              <div className="p-6 space-y-4">
                <p
                  className="text-xs font-black uppercase tracking-widest"
                  style={{ color: "#c4b5fd" }}
                >
                  Why Sellora?
                </p>
                {[
                  { icon: ShoppingBag, title: "Curated Catalogue", desc: "Handpicked quality products across all categories." },
                  { icon: Award,       title: "Trusted Quality",   desc: "Every item vetted for quality and authenticity." },
                  { icon: Users,       title: "Happy Customers",   desc: "Thousands of satisfied buyers every month." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(124,58,237,0.35)" }}
                    >
                      <Icon className="h-4 w-4" style={{ color: "#c4b5fd" }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{title}</p>
                      <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Card footer */}
              <div
                className="px-6 py-3 flex items-center gap-2"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.1)" }}
              >
                <div
                  className="h-5 w-5 rounded-md flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                >
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs font-bold" style={{ color: "#a78bfa" }}>Sellora Marketplace</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slide dot controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === slideIdx ? "28px" : "8px",
                height: "8px",
                background: i === slideIdx ? "white" : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>

        {/* Prev / Next arrows */}
        {[
          { dir: "prev", pos: "left-4", action: () => setSlideIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length), icon: ChevronLeft },
          { dir: "next", pos: "right-4", action: () => setSlideIdx((i) => (i + 1) % SLIDES.length), icon: ChevronRight },
        ].map(({ dir, pos, action, icon: Icon }) => (
          <button
            key={dir}
            onClick={action}
            className={`absolute ${pos} top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-xl flex items-center justify-center text-white transition-colors backdrop-blur-sm`}
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.22)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </section>

      {/* ════════════════════════════════════════════════
          SHOP SECTION
      ════════════════════════════════════════════════ */}
      <section id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 py-14">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className="h-1 w-8 rounded-full"
                style={{ background: "linear-gradient(90deg, #7c3aed, #4f46e5)" }}
              />
              <span
                className="text-xs font-black uppercase tracking-widest"
                style={{ color: "#7c3aed" }}
              >
                Our Catalogue
              </span>
            </div>
            <h2
              className="text-3xl font-black text-zinc-900 tracking-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              All Items
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "item" : "items"} available`}
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              className="pl-9 h-11 bg-white rounded-xl border-zinc-200 text-sm focus-visible:ring-violet-400 focus-visible:border-violet-400 shadow-sm"
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 rounded-full text-sm font-bold transition-all"
              style={
                activeCategory === cat
                  ? {
                      background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                      color: "white",
                      boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
                    }
                  : {
                      background: "white",
                      color: "#52525b",
                      border: "1px solid #e4e4e7",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border bg-white shadow-sm">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-2.5">
                  <Skeleton className="h-4 w-3/4 rounded-lg" />
                  <Skeleton className="h-3 w-1/2 rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-xl mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div
              className="h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "#f5f3ff" }}
            >
              <Package className="h-10 w-10" style={{ color: "#c4b5fd" }} />
            </div>
            <p className="text-zinc-500 text-base font-semibold">
              {items.length === 0 ? "No items in store yet." : "No items match your search."}
            </p>
            {search && (
              <button
                className="mt-4 text-sm font-bold hover:underline"
                style={{ color: "#7c3aed" }}
                onClick={() => setSearch("")}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((item) => (
              <ItemCard key={item.itemId} item={item} onOrder={handleOrder} />
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════
          AUTH MODAL — same style as login/register
      ════════════════════════════════════════════════ */}
      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={() => setAuthModal(false)}
          />
          <div
            className="relative bg-white rounded-3xl w-full max-w-sm text-center overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(109,40,217,0.25)" }}
          >
            {/* Top accent bar */}
            <div
              className="h-1.5 w-full"
              style={{ background: "linear-gradient(90deg, #7c3aed, #818cf8, #4f46e5)" }}
            />
            <div className="p-8">
              <div
                className="h-14 w-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
              >
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3
                className="text-xl font-black text-zinc-900 mb-1.5"
                style={{ letterSpacing: "-0.02em" }}
              >
                Sign in to Order
              </h3>
              <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
                You need an account to place orders.
                {targetItem && (
                  <><br /><strong className="text-zinc-800">{targetItem.name || targetItem.description}</strong></>
                )}
              </p>
              <div className="flex gap-3">
                <button
                  className="flex-1 h-11 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
                  onClick={() => setAuthModal(false)}
                >
                  Cancel
                </button>
                <Link href={`/login?from=/shop/${targetItem?.itemId ?? ""}`} className="flex-1">
                  <button
                    className="w-full h-11 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity group"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                      boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
                    }}
                  >
                    Sign In
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </Link>
              </div>
              <p className="mt-4 text-xs text-zinc-400">
                No account?{" "}
                <Link href="/register" className="font-bold hover:underline" style={{ color: "#7c3aed" }}>
                  Register free
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}