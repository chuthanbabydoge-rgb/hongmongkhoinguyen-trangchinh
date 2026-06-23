import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useWatchlist } from "@/hooks/useWatchlist";
import { cn } from "@/lib/utils";
import {
  Heart, Trash2, ShoppingBag, Gavel, ExternalLink,
  Clock, Tag, RefreshCw, AlertCircle, TrendingDown, Zap,
  ArrowRight,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RARITY_STYLE: Record<string, { text: string; bg: string; border: string }> = {
  common:    { text: "text-gray-400",   bg: "bg-gray-400/10",   border: "border-gray-400/30" },
  rare:      { text: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/30" },
  epic:      { text: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30" },
  legendary: { text: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/30" },
  mythic:    { text: "text-rose-400",   bg: "bg-rose-400/10",   border: "border-rose-400/30" },
};

const RARITY_LABEL: Record<string, string> = {
  common: "Phổ thông", rare: "Hiếm", epic: "Sử thi", legendary: "Huyền thoại", mythic: "Thần thoại",
};

function fmtCR(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M CR`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K CR`;
  return `${v.toLocaleString("vi-VN")} CR`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ─── Background ───────────────────────────────────────────────────────────────

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-900/8 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.022]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-rose-500/4 rounded-full blur-[120px]" />
    <div className="absolute bottom-1/3 left-1/4 w-60 h-60 bg-emerald-500/3 rounded-full blur-[100px]" />
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: string }) {
  if (filter === "price-drops") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-4 py-20 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
          <TrendingDown className="w-7 h-7 text-emerald-400/50" />
        </div>
        <p className="text-sm font-mono text-muted-foreground/50 max-w-xs">
          Chưa có mặt hàng nào giảm giá.<br />
          <span className="text-[10px]">Nhấn "Kiểm tra giá" trên từng mục để phát hiện giảm giá.</span>
        </p>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-4 py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-rose-400/10 border border-rose-400/20 flex items-center justify-center">
        <Heart className="w-7 h-7 text-rose-400/50" />
      </div>
      <p className="text-sm font-mono text-muted-foreground/50 max-w-xs">
        Chưa có mặt hàng nào trong danh sách theo dõi của bạn.
      </p>
      <div className="flex gap-3 mt-2">
        <Link href="/marketplace/listings">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-400/20 transition-all">
            <ShoppingBag className="w-3.5 h-3.5" /> Khám phá niêm yết
          </button>
        </Link>
        <Link href="/marketplace/auctions">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-400 text-xs font-mono font-bold hover:bg-amber-400/20 transition-all">
            <Gavel className="w-3.5 h-3.5" /> Xem đấu giá
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Watchlist Entry Card ─────────────────────────────────────────────────────

type EntryType = ReturnType<typeof useWatchlist>["watchlist"][number];

function WatchlistCard({
  entry,
  onRemove,
  onCheckPrice,
  removing,
  checking,
}: {
  entry:        EntryType;
  onRemove:     () => void;
  onCheckPrice: () => void;
  removing:     boolean;
  checking:     boolean;
}) {
  const isListing   = entry.targetType === "listing";
  const hasDrop     = entry.priceDropCount > 0;
  const rStyle      = entry.rarity ? (RARITY_STYLE[entry.rarity] ?? RARITY_STYLE["common"]) : RARITY_STYLE["common"];
  const rLabel      = entry.rarity ? (RARITY_LABEL[entry.rarity] ?? entry.rarity) : null;

  // Price drop calculations
  const watchPrice    = entry.watchPrice    ?? entry.price;
  const lastSeenPrice = entry.lastSeenPrice ?? entry.price;
  const dropPct = watchPrice && lastSeenPrice && lastSeenPrice < watchPrice
    ? Math.round(((watchPrice - lastSeenPrice) / watchPrice) * 10000) / 100
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: removing ? 0 : 1, x: removing ? 40 : 0 }}
      exit={{ opacity: 0, x: 40, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "glass-panel rounded-2xl border p-4 flex flex-col gap-3 group transition-all duration-300",
        hasDrop ? "border-emerald-400/30 shadow-[0_0_16px_rgba(52,211,153,0.08)]" : rStyle.border,
      )}
    >
      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center",
          hasDrop ? "bg-emerald-400/10 border-emerald-400/25" : cn(rStyle.bg, rStyle.border),
        )}>
          {isListing
            ? <ShoppingBag className={cn("w-4 h-4", hasDrop ? "text-emerald-400" : rStyle.text)} />
            : <Gavel       className={cn("w-4 h-4", hasDrop ? "text-emerald-400" : rStyle.text)} />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name + badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <p className="text-xs font-bold text-white truncate">{entry.itemName ?? "—"}</p>
            {rLabel && (
              <span className={cn("text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full border", rStyle.text, rStyle.bg, rStyle.border)}>
                {rLabel}
              </span>
            )}
            <span className={cn(
              "text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border",
              isListing
                ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                : "text-amber-400  bg-amber-400/10  border-amber-400/20",
            )}>
              {isListing ? "Niêm yết" : "Đấu giá"}
            </span>
            {hasDrop && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 text-[8px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-400"
              >
                <TrendingDown className="w-2.5 h-2.5" />
                Giảm giá
                {entry.priceDropCount > 1 && <span className="opacity-70">×{entry.priceDropCount}</span>}
              </motion.span>
            )}
          </div>

          {/* Price display */}
          <div className="flex items-center gap-2 flex-wrap">
            {hasDrop && watchPrice && lastSeenPrice ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-muted-foreground/40 line-through">{fmtCR(watchPrice)}</span>
                <ArrowRight className="w-2.5 h-2.5 text-emerald-400/60" />
                <span className="text-[11px] font-bold font-mono text-emerald-400">{fmtCR(lastSeenPrice)}</span>
                <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded">
                  ↓{dropPct}%
                </span>
              </div>
            ) : entry.price != null ? (
              <span className={cn("text-[10px] font-mono font-bold", rStyle.text)}>{fmtCR(entry.price)}</span>
            ) : null}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-[9px] font-mono text-muted-foreground/35 mt-1">
            {entry.status && (
              <span className="flex items-center gap-1"><Tag className="w-2.5 h-2.5" />{entry.status}</span>
            )}
            <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{fmtDate(entry.createdAt)}</span>
            {entry.lastPriceChangeAt && (
              <span className="flex items-center gap-1 text-emerald-400/60">
                <TrendingDown className="w-2.5 h-2.5" />
                Giảm {fmtDate(entry.lastPriceChangeAt)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {/* Simulate price drop button */}
          <button
            onClick={onCheckPrice}
            disabled={checking || removing}
            title="Giả lập giảm giá 15% để kiểm tra cảnh báo"
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-mono font-bold transition-all disabled:opacity-40",
              checking
                ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-400"
                : "border-white/10 hover:border-emerald-400/30 hover:bg-emerald-400/8 text-muted-foreground/40 hover:text-emerald-400",
            )}
          >
            {checking
              ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="w-3 h-3 border border-emerald-400/40 border-t-emerald-400 rounded-full" />
              : <Zap className="w-3 h-3" />
            }
            <span className="hidden sm:inline">{checking ? "Kiểm tra..." : "Kiểm tra giá"}</span>
          </button>

          <Link href={isListing ? "/marketplace/listings" : "/marketplace/auctions"}>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 hover:border-white/25 text-muted-foreground/40 hover:text-white text-[10px] font-mono font-bold transition-all">
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">Mở</span>
            </button>
          </Link>

          <button
            onClick={onRemove}
            disabled={removing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-400/20 hover:border-red-400/40 bg-red-400/5 hover:bg-red-400/15 text-red-400/60 hover:text-red-400 text-[10px] font-mono font-bold transition-all disabled:opacity-40"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Xóa</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type FilterType = "all" | "price-drops" | "listing" | "auction";

export default function WatchlistPage() {
  const { watchlist, count, priceDropCount, isLoading, error, toggle, checkPrice, refresh } = useWatchlist();
  const [filter,     setFilter]     = useState<FilterType>("all");
  const [removing,   setRemoving]   = useState<Set<string>>(new Set());
  const [checking,   setChecking]   = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [lastResult, setLastResult] = useState<{ name: string; dropped: boolean; dropPct: number } | null>(null);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleRemove = useCallback(async (
    targetType: "listing" | "auction",
    targetId: string,
    entryId: string,
  ) => {
    setRemoving(s => new Set(s).add(entryId));
    await toggle(targetType, targetId);
    setRemoving(s => { const n = new Set(s); n.delete(entryId); return n; });
    setLastResult(null);
  }, [toggle]);

  const handleCheckPrice = useCallback(async (entry: EntryType) => {
    setChecking(s => new Set(s).add(entry.id));
    // Simulate a 15% price drop from the current lastSeenPrice (or watchPrice)
    const baseline = entry.lastSeenPrice ?? entry.watchPrice ?? entry.price;
    if (baseline == null) {
      setChecking(s => { const n = new Set(s); n.delete(entry.id); return n; });
      return;
    }
    const simulatedPrice = Math.round(baseline * 0.85); // 15% drop
    const result = await checkPrice(entry.id, simulatedPrice);
    setChecking(s => { const n = new Set(s); n.delete(entry.id); return n; });
    if (result) {
      setLastResult({
        name:    entry.itemName ?? "Mặt hàng",
        dropped: result.dropped,
        dropPct: result.dropPct,
      });
      // Clear toast after 4s
      setTimeout(() => setLastResult(null), 4000);
    }
  }, [checkPrice]);

  const filtered = watchlist.filter(e => {
    if (filter === "all")         return true;
    if (filter === "price-drops") return e.priceDropCount > 0;
    return e.targetType === filter;
  });

  const listingCount = watchlist.filter(e => e.targetType === "listing").length;
  const auctionCount = watchlist.filter(e => e.targetType === "auction").length;

  const FILTER_TABS: { key: FilterType; label: string; count: number; accent: string }[] = [
    { key: "all",         label: "Tất cả",    count,          accent: "rose" },
    { key: "price-drops", label: "Giảm giá",  count: priceDropCount, accent: "emerald" },
    { key: "listing",     label: "Niêm yết",  count: listingCount, accent: "rose" },
    { key: "auction",     label: "Đấu giá",   count: auctionCount, accent: "rose" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <BG />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">

          {/* ── Page header ─────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-2 h-6 bg-rose-400 rounded-sm shadow-[0_0_10px_rgba(251,113,133,0.6)]" />
                Danh sách theo dõi
                {count > 0 && (
                  <span className="text-sm font-mono font-bold px-2 py-0.5 rounded-full bg-rose-400/15 border border-rose-400/25 text-rose-400">
                    {count}
                  </span>
                )}
                {priceDropCount > 0 && (
                  <motion.span
                    initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-sm font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-400"
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    {priceDropCount} giảm giá
                  </motion.span>
                )}
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">
                {count} MẶT HÀNG · TỰ ĐỘNG CẬP NHẬT · V2.1 CẢNH BÁO GIÁ
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 hover:border-white/20 text-muted-foreground/40 hover:text-white text-[10px] font-mono font-bold transition-all disabled:opacity-40"
            >
              <RefreshCw className={cn("w-3 h-3", refreshing && "animate-spin")} />
              Làm mới
            </button>
          </div>

          {/* ── Toast notification ───────────────────────────────────────── */}
          <AnimatePresence>
            {lastResult && (
              <motion.div
                initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-mono font-bold",
                  lastResult.dropped
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                    : "border-white/15 bg-white/5 text-muted-foreground/60",
                )}
              >
                {lastResult.dropped
                  ? <><TrendingDown className="w-4 h-4 flex-shrink-0" /> {lastResult.name} đã giảm ↓{lastResult.dropPct}% — thông báo đã tạo!</>
                  : <><RefreshCw className="w-4 h-4 flex-shrink-0" /> Giá {lastResult.name} không thay đổi so với lần trước.</>
                }
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Error banner ─────────────────────────────────────────────── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-red-400/20 bg-red-400/5 text-red-400 text-[10px] font-mono"
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Filter tabs ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 flex-wrap">
            {FILTER_TABS.map(tab => {
              const isDropTab = tab.key === "price-drops";
              const isActive  = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-mono font-bold uppercase tracking-wider transition-all",
                    isActive && isDropTab
                      ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-400"
                      : isActive
                        ? "border-rose-400/30 bg-rose-400/10 text-rose-400"
                        : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20",
                  )}
                >
                  {isDropTab && <TrendingDown className="w-3 h-3" />}
                  {tab.label}
                  <span className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                    isActive && isDropTab  ? "bg-emerald-400/20 text-emerald-300"
                    : isActive             ? "bg-rose-400/20 text-rose-300"
                    :                        "bg-white/8 text-muted-foreground/50",
                  )}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Info tip for price-drop filter ───────────────────────────── */}
          <AnimatePresence>
            {filter === "price-drops" && priceDropCount === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-emerald-400/15 bg-emerald-400/5 text-[10px] font-mono text-emerald-400/70"
              >
                <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                Nhấn "Kiểm tra giá" trên bất kỳ mục nào để giả lập giảm giá 15% và kích hoạt cảnh báo.
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Content ──────────────────────────────────────────────────── */}
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-panel rounded-2xl border border-white/5 p-4 h-24 animate-pulse bg-white/2" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <motion.div layout className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {filtered.map(entry => (
                  <WatchlistCard
                    key={entry.id}
                    entry={entry}
                    removing={removing.has(entry.id)}
                    checking={checking.has(entry.id)}
                    onRemove={() => handleRemove(entry.targetType, entry.targetId, entry.id)}
                    onCheckPrice={() => handleCheckPrice(entry)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Quick nav ────────────────────────────────────────────────── */}
          {!isLoading && count > 0 && (
            <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
              <p className="w-full text-[9px] font-mono text-muted-foreground/25 uppercase tracking-widest">Điều hướng nhanh</p>
              <Link href="/marketplace/listings">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-400/20 hover:border-emerald-400/40 text-emerald-400/60 hover:text-emerald-400 text-[10px] font-mono font-bold transition-all">
                  <ShoppingBag className="w-3 h-3" /> Tất cả niêm yết
                </button>
              </Link>
              <Link href="/marketplace/auctions">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-400/20 hover:border-amber-400/40 text-amber-400/60 hover:text-amber-400 text-[10px] font-mono font-bold transition-all">
                  <Gavel className="w-3 h-3" /> Tất cả đấu giá
                </button>
              </Link>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
