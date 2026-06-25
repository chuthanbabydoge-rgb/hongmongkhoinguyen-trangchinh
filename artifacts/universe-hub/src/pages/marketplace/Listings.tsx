import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  RARITY_COLORS, RARITY_LABELS, CATEGORY_META_MARKET,
  type Listing, type MarketRarity, type ListingCategory, type ListingStatus,
} from "@/lib/marketplaceMockData";
import { apiFetch } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/hooks/useWatchlist";
import {
  Search, SlidersHorizontal, LayoutGrid, List, X, Heart, Eye,
  ShoppingCart, TrendingDown, Clock, ChevronDown, ChevronUp,
  CheckCircle2, Package, ArrowUpDown, ArrowUp, ArrowDown,
  Coins, Star, Flame, Tag, Loader2, RefreshCw, Store, History,
} from "lucide-react";

// ─── API ↔ Listing adapter ────────────────────────────────────────────────────

interface ApiListing {
  id: string;
  sellerId: string;
  itemId: string;
  itemName: string;
  category: string;
  rarity: string;
  price: number;
  currency: string;
  status: string;
  createdAt: string;
  expiresAt?: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  pets: "🐾", football: "⚽", "world-assets": "🌍", tickets: "🎫", items: "⚔️",
  weapon: "🗡️", armor: "🛡️", consumable: "🧪", cosmetic: "✨", mount: "🐴",
};

function adaptApiListing(l: ApiListing): Listing {
  const cat = (["pets","football","world-assets","tickets","items"].includes(l.category) ? l.category : "items") as ListingCategory;
  const rar = (["common","rare","epic","legendary","mythic"].includes(l.rarity) ? l.rarity : "common") as MarketRarity;
  const stat = (["active","sold","expired","cancelled"].includes(l.status) ? l.status : "active") as ListingStatus;
  return {
    id: l.id, itemId: l.itemId, itemName: l.itemName, name: l.itemName,
    image: CATEGORY_EMOJI[l.category] ?? "📦",
    category: cat, rarity: rar, status: stat,
    seller: l.sellerId, sellerAvatar: l.sellerId.slice(0, 2).toUpperCase(),
    price: l.price, currency: (l.currency ?? "CR").toUpperCase() as any,
    originalValue: l.price,
    quantity: 1, description: `${l.itemName} — niêm yết bởi ${l.sellerId}`,
    listedAt: l.createdAt, createdAt: l.createdAt,
    views: 0, favorites: 0, tags: [],
  };
}

type PageTab = "browse" | "my-listings" | "history";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = "price_asc" | "price_desc" | "views" | "favorites" | "date" | "discount";
type ColKey  = "name" | "rarity" | "price" | "discount" | "views" | "favorites" | "status" | "date";

interface Filters {
  search:   string;
  cat:      "all" | ListingCategory;
  rarity:   "all" | MarketRarity;
  status:   "all" | ListingStatus;
  priceMin: number;
  priceMax: number;
}

const PRICE_PRESETS = [
  { label: "Tất cả",    min: 0,       max: Infinity },
  { label: "< 100K",   min: 0,       max: 100_000 },
  { label: "100K–500K",min: 100_000, max: 500_000 },
  { label: "500K–1M",  min: 500_000, max: 1_000_000 },
  { label: "> 1M",     min: 1_000_000, max: Infinity },
];

const MAX_PRICE = 10_000_000; // dynamic upper bound for price filter
const fmtCR = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M CR`
  : v >= 1_000   ? `${(v / 1_000).toFixed(0)}K CR`
  : `${v} CR`;
const fmtK  = (v: number) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v/1_000).toFixed(0)}K` : String(v);

// ─── Background ───────────────────────────────────────────────────────────────

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-900/8 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.022]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-emerald-500/4 rounded-full blur-[120px]" />
  </div>
);

// ─── Buy Modal ────────────────────────────────────────────────────────────────

function BuyModal({ listing, onClose, onPurchased }: { listing: Listing; onClose: () => void; onPurchased?: (id: string) => void }) {
  const rc = RARITY_COLORS[listing.rarity];
  const cm = CATEGORY_META_MARKET[listing.category];
  const discount = Math.round((1 - listing.price / listing.originalValue) * 100);
  const [phase, setPhase] = useState<"detail" | "confirm" | "buying" | "done" | "error">("detail");
  const [errMsg, setErrMsg] = useState("");

  const handleBuy = useCallback(() => {
    setPhase("confirm");
  }, []);

  const handleConfirm = useCallback(async () => {
    setPhase("buying");
    try {
      await apiFetch(`/marketplace/listings/${listing.id}/buy`, { method: "POST" });
      setPhase("done");
      onPurchased?.(listing.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Giao dịch thất bại.";
      setErrMsg(msg);
      setPhase("error");
    }
  }, [listing.id, onPurchased]);

  const isActive = listing.status === "active";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget && phase !== "buying") onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.93, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className={cn("glass-panel rounded-2xl border w-full max-w-md overflow-hidden relative", rc.border, rc.glow)}
      >
        {/* Header */}
        <div className={cn("p-5 border-b border-white/5 relative", rc.bg)}>
          {phase !== "buying" && (
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg border border-white/10 hover:border-white/30 text-muted-foreground/40 hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-start gap-4 pr-8">
            <div className={cn("w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl flex-shrink-0", rc.bg, rc.border)}>
              {listing.image}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border", rc.text, rc.bg, rc.border)}>
                  {RARITY_LABELS[listing.rarity]}
                </span>
                <span className={cn("text-[9px] font-mono", cm.color)}>{cm.icon} {cm.label}</span>
                {discount > 0 && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-400/15 border border-emerald-400/20 text-emerald-400">
                    -{discount}%
                  </span>
                )}
              </div>
              <h2 className="text-sm font-bold text-white leading-tight line-clamp-2">{listing.name}</h2>
              <p className="text-[9px] font-mono text-muted-foreground/35 mt-1">{listing.id} · {listing.seller}</p>
            </div>
          </div>
        </div>

        {/* Body — phases */}
        <AnimatePresence mode="wait">
          {phase === "detail" && (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5 space-y-4">
              <p className="text-[10px] font-mono text-muted-foreground/55 italic leading-relaxed">{listing.description}</p>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Giá bán",    value: fmtCR(listing.price),         color: rc.text },
                  { label: "Giá gốc",   value: fmtCR(listing.originalValue),  color: "text-muted-foreground/50" },
                  { label: "Giảm giá",  value: discount > 0 ? `-${discount}%` : "–", color: "text-emerald-400" },
                  { label: "Số lượng",  value: `×${listing.quantity}`,         color: "text-white" },
                  { label: "Lượt xem",  value: listing.views.toLocaleString(), color: "text-muted-foreground/55" },
                  { label: "Yêu thích", value: String(listing.favorites),      color: "text-rose-400" },
                ].map(row => (
                  <div key={row.label} className="bg-white/4 border border-white/5 rounded-xl p-2.5">
                    <p className="text-[8px] font-mono text-muted-foreground/30 uppercase tracking-widest mb-1">{row.label}</p>
                    <p className={cn("text-[11px] font-mono font-bold", row.color)}>{row.value}</p>
                  </div>
                ))}
              </div>

              {listing.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {listing.tags.map(t => (
                    <span key={t} className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground/45">
                      <Tag className="w-2 h-2" />{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <p className={cn("text-lg font-bold font-mono", rc.text)}>{fmtCR(listing.price)}</p>
                {discount > 0 && <p className="text-xs font-mono text-muted-foreground/30 line-through">{fmtCR(listing.originalValue)}</p>}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleBuy} disabled={!isActive}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl font-bold text-xs font-mono uppercase tracking-wider transition-all border flex items-center justify-center gap-2",
                    isActive
                      ? cn(rc.border, rc.bg, rc.text, "hover:brightness-125 active:scale-[0.98]")
                      : "border-white/10 text-muted-foreground/30 cursor-not-allowed",
                  )}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {isActive ? "Mua ngay" : listing.status === "sold" ? "Đã bán" : "Hết hạn"}
                </button>
                <button className="px-3 py-2.5 rounded-xl border border-white/10 hover:border-rose-400/30 text-muted-foreground/40 hover:text-rose-400 transition-all">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {phase === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-5 space-y-4">
              <div className="glass-panel rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
                <p className="text-xs font-bold text-amber-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Coins className="w-3.5 h-3.5" /> Xác nhận thanh toán
                </p>
                <div className="space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between text-muted-foreground/60">
                    <span>Sản phẩm</span>
                    <span className="text-white font-bold truncate max-w-[160px] text-right">{listing.name}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground/60">
                    <span>Giá bán</span>
                    <span className={cn("font-bold", rc.text)}>{fmtCR(listing.price)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground/60">
                    <span>Phí giao dịch (1%)</span>
                    <span className="text-muted-foreground/50">{fmtCR(Math.round(listing.price * 0.01))}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between text-white">
                    <span className="font-bold">Tổng cộng</span>
                    <span className={cn("font-bold", rc.text)}>{fmtCR(Math.round(listing.price * 1.01))}</span>
                  </div>
                </div>
              </div>
              <p className="text-[9px] font-mono text-muted-foreground/35 text-center">Đây là giao dịch mô phỏng – không có tiền thật được dùng.</p>
              <div className="flex gap-2">
                <button onClick={() => setPhase("detail")} className="flex-1 py-2.5 rounded-xl border border-white/10 text-muted-foreground/50 hover:text-white text-xs font-mono uppercase font-bold tracking-wider transition-all">
                  Quay lại
                </button>
                <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-xl border border-emerald-400/40 bg-emerald-400/15 text-emerald-400 hover:bg-emerald-400/25 text-xs font-mono uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Xác nhận mua
                </button>
              </div>
            </motion.div>
          )}

          {phase === "buying" && (
            <motion.div key="buying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-full border-2 border-emerald-400/20 border-t-emerald-400"
              />
              <p className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest">Đang xử lý giao dịch...</p>
            </motion.div>
          )}

          {phase === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 flex flex-col items-center gap-4">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-16 h-16 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">Mua thành công!</p>
                <p className="text-[10px] font-mono text-muted-foreground/40 mt-1">{listing.name} đã được thêm vào kho đồ của bạn.</p>
              </div>
              <button onClick={onClose} className="px-6 py-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider hover:bg-emerald-400/20 transition-all">
                Đóng
              </button>
            </motion.div>
          )}

          {phase === "error" && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-400/15 border border-red-400/30 flex items-center justify-center">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">Giao dịch thất bại</p>
                <p className="text-[10px] font-mono text-muted-foreground/40 mt-1">{errMsg}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPhase("detail")} className="px-5 py-2 rounded-xl border border-white/10 text-muted-foreground/50 text-xs font-mono font-bold uppercase tracking-wider hover:text-white transition-all">
                  Quay lại
                </button>
                <button onClick={onClose} className="px-5 py-2 rounded-xl border border-red-400/30 bg-red-400/10 text-red-400 text-xs font-mono font-bold uppercase tracking-wider hover:bg-red-400/20 transition-all">
                  Đóng
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────

function GridCard({ listing, onSelect, watched, onToggleWatch }: {
  listing: Listing;
  onSelect: () => void;
  watched: boolean;
  onToggleWatch: (e: React.MouseEvent) => void;
}) {
  const rc = RARITY_COLORS[listing.rarity];
  const cm = CATEGORY_META_MARKET[listing.category];
  const discount = Math.round((1 - listing.price / listing.originalValue) * 100);
  const isActive = listing.status === "active";
  const statusLabel: Record<ListingStatus, string> = { active: "Đang bán", sold: "Đã bán", expired: "Hết hạn", cancelled: "Đã huỷ" };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      onClick={onSelect}
      className={cn(
        "glass-panel rounded-2xl border p-4 flex flex-col gap-3 group cursor-pointer relative overflow-hidden transition-all duration-300",
        "hover:-translate-y-1",
        rc.border,
        isActive ? rc.glow : "opacity-55",
      )}
    >
      {/* Inactive overlay */}
      {!isActive && (
        <div className="absolute inset-0 bg-black/50 z-20 rounded-2xl flex items-center justify-center">
          <span className={cn("text-[10px] font-mono font-bold px-3 py-1.5 rounded-full bg-black/70 border",
            listing.status === "sold" ? "text-gray-400 border-gray-400/30" : "text-red-400 border-red-400/30"
          )}>
            {statusLabel[listing.status]}
          </span>
        </div>
      )}
      {/* Hover glow bg */}
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none", rc.bg)} />

      <div className="relative z-10 flex flex-col gap-3 h-full">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div className={cn("w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl shadow-lg", rc.bg, rc.border)}>
            {listing.image}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={cn("text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border", rc.text, rc.bg, rc.border)}>
              {RARITY_LABELS[listing.rarity]}
            </span>
            {discount > 0 && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-400/15 border border-emerald-400/20 text-emerald-400 flex items-center gap-0.5">
                <TrendingDown className="w-2 h-2" />-{discount}%
              </span>
            )}
          </div>
        </div>

        {/* Name + category */}
        <div className="flex-1">
          <p className="text-xs font-bold text-white line-clamp-2 leading-tight group-hover:text-emerald-200 transition-colors">{listing.name}</p>
          <p className={cn("text-[9px] font-mono mt-0.5", cm.color)}>{cm.icon} {cm.label}</p>
        </div>

        {/* Price */}
        <div>
          <p className={cn("text-sm font-bold font-mono", rc.text)}>{fmtCR(listing.price)}</p>
          {discount > 0 && <p className="text-[9px] font-mono text-muted-foreground/25 line-through">{fmtCR(listing.originalValue)}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
          <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground/35">
            <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{fmtK(listing.views)}</span>
            <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" />{listing.favorites}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleWatch}
              title={watched ? "Bỏ theo dõi" : "Theo dõi"}
              className={cn(
                "p-1.5 rounded-lg border transition-all",
                watched
                  ? "border-rose-400/40 bg-rose-400/15 text-rose-400"
                  : "border-white/10 text-muted-foreground/30 hover:border-rose-400/30 hover:text-rose-400 opacity-0 group-hover:opacity-100",
              )}
            >
              <Heart className={cn("w-3 h-3", watched && "fill-rose-400")} />
            </button>
            {isActive && (
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <ShoppingCart className="w-2.5 h-2.5" /> Mua
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────

function TableRow({ listing, onSelect }: { listing: Listing; onSelect: () => void }) {
  const rc = RARITY_COLORS[listing.rarity];
  const cm = CATEGORY_META_MARKET[listing.category];
  const discount = Math.round((1 - listing.price / listing.originalValue) * 100);
  const STATUS_STYLE: Record<ListingStatus, string> = {
    active: "text-emerald-400", sold: "text-muted-foreground/40",
    expired: "text-red-400/70", cancelled: "text-red-500/70",
  };
  const STATUS_LABEL: Record<ListingStatus, string> = {
    active: "Đang bán", sold: "Đã bán", expired: "Hết hạn", cancelled: "Đã huỷ",
  };

  return (
    <motion.tr
      layout
      onClick={onSelect}
      className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors cursor-pointer group"
    >
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center text-xl flex-shrink-0", rc.bg, rc.border)}>{listing.image}</div>
          <div>
            <p className="text-[11px] font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1 max-w-[180px]">{listing.name}</p>
            <p className={cn("text-[9px] font-mono", cm.color)}>{cm.icon} {cm.label}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-3">
        <span className={cn("text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border", rc.text, rc.bg, rc.border)}>
          {RARITY_LABELS[listing.rarity]}
        </span>
      </td>
      <td className="py-3 px-3 text-right">
        <span className={cn("text-[11px] font-bold font-mono", rc.text)}>{fmtCR(listing.price)}</span>
      </td>
      <td className="py-3 px-3 text-center">
        {discount > 0
          ? <span className="text-[9px] font-mono font-bold text-emerald-400">-{discount}%</span>
          : <span className="text-muted-foreground/20">–</span>
        }
      </td>
      <td className="py-3 px-3 text-center">
        <span className="flex items-center justify-center gap-1 text-[9px] font-mono text-muted-foreground/40">
          <Eye className="w-2.5 h-2.5" />{fmtK(listing.views)}
        </span>
      </td>
      <td className="py-3 px-3 text-center">
        <span className="flex items-center justify-center gap-1 text-[9px] font-mono text-muted-foreground/40">
          <Heart className="w-2.5 h-2.5" />{listing.favorites}
        </span>
      </td>
      <td className="py-3 px-3 text-[9px] font-mono text-muted-foreground/35">
        {new Date(listing.createdAt).toLocaleDateString("vi-VN")}
      </td>
      <td className="py-3 px-3">
        <span className={cn("text-[9px] font-mono font-bold", STATUS_STYLE[listing.status])}>{STATUS_LABEL[listing.status]}</span>
      </td>
      <td className="py-3 px-3 pr-4">
        <span className="text-[9px] font-mono text-muted-foreground/35 truncate max-w-[80px] block">{listing.seller}</span>
      </td>
    </motion.tr>
  );
}

// ─── Sortable table header ────────────────────────────────────────────────────

function ThSort({ col, label, sortKey, onSort }: { col: ColKey; label: string; sortKey: SortKey; onSort: (c: ColKey) => void }) {
  const COL_TO_SORT: Partial<Record<ColKey, string>> = {
    price: "price", views: "views", date: "date", discount: "discount", favorites: "favorites",
  };
  const prefix = COL_TO_SORT[col] ?? "__none__";
  const active = sortKey.startsWith(prefix);
  const desc   = !sortKey.endsWith("_asc");
  return (
    <th
      onClick={() => onSort(col)}
      className="py-3 px-3 text-left text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest font-normal cursor-pointer hover:text-white transition-colors select-none"
    >
      <span className="flex items-center gap-1">
        {label}
        {active
          ? (desc ? <ArrowDown className="w-2.5 h-2.5 text-emerald-400" /> : <ArrowUp className="w-2.5 h-2.5 text-emerald-400" />)
          : <ArrowUpDown className="w-2.5 h-2.5 opacity-20" />}
      </span>
    </th>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label, active, onClick, color = "emerald" }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all",
        active
          ? `bg-${color}-400/15 border-${color}-400/35 text-${color}-400`
          : "border-white/8 text-muted-foreground/40 hover:text-white hover:border-white/18",
      )}
    >
      {label}
    </button>
  );
}

// ─── Active filter badge ──────────────────────────────────────────────────────

function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/25 text-emerald-400 text-[9px] font-mono font-bold">
      {label}
      <button onClick={onRemove} className="hover:text-white transition-colors"><X className="w-2.5 h-2.5" /></button>
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const EMPTY_FILTERS: Filters = {
  search: "", cat: "all", rarity: "all", status: "all", priceMin: 0, priceMax: Infinity,
};

interface ApiTx {
  id: string; itemId?: string; itemName?: string; buyerId?: string;
  sellerId?: string; amount?: number; price?: number; currency?: string;
  status?: string; createdAt?: string; updatedAt?: string;
}

function PurchaseHistory({ userId }: { userId?: string }) {
  const [txs, setTxs]       = useState<ApiTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]    = useState("");

  useEffect(() => {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    apiFetch<{ items?: ApiTx[]; data?: ApiTx[] } | ApiTx[]>(`/marketplace/transactions${q}`)
      .then(d => {
        const arr = Array.isArray(d) ? d : (d as any).items ?? (d as any).data ?? [];
        setTxs(arr);
      })
      .catch(e => setError(e instanceof Error ? e.message : "Không tải được lịch sử."))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="glass-panel rounded-xl border border-white/5 p-12 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>;
  if (error)   return <div className="glass-panel rounded-xl border border-red-400/20 p-12 text-center text-xs font-mono text-red-400">{error}</div>;
  if (!txs.length) return (
    <div className="glass-panel rounded-xl border border-white/5 p-12 text-center">
      <History className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
      <p className="text-xs font-mono text-muted-foreground/30 tracking-widest">CHƯA CÓ GIAO DỊCH NÀO</p>
    </div>
  );
  return (
    <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8 bg-white/3">
              {["Vật phẩm","Số tiền","Đối tác","Trạng thái","Ngày"].map(h => (
                <th key={h} className="py-3 px-4 text-left text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {txs.map(tx => (
              <tr key={tx.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                <td className="py-3 px-4">
                  <p className="text-[11px] font-bold text-white">{tx.itemName ?? tx.itemId ?? "—"}</p>
                  <p className="text-[9px] font-mono text-muted-foreground/30">{tx.id}</p>
                </td>
                <td className="py-3 px-4">
                  <span className="text-[11px] font-bold font-mono text-emerald-400">
                    {(tx.amount ?? tx.price ?? 0).toLocaleString()} {(tx.currency ?? "CR").toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-[10px] font-mono text-muted-foreground/40">
                    {tx.buyerId === userId ? tx.sellerId : tx.buyerId}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={cn("text-[9px] font-mono font-bold",
                    tx.status === "completed" ? "text-emerald-400" : tx.status === "failed" ? "text-red-400" : "text-amber-400"
                  )}>
                    {tx.status ?? "completed"}
                  </span>
                </td>
                <td className="py-3 px-4 text-[9px] font-mono text-muted-foreground/35">
                  {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("vi-VN") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Listings() {
  const { user }                  = useAuth();
  const [tab, setTab]             = useState<PageTab>("browse");
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [apiLoading, setApiLoading]   = useState(true);
  const [apiError, setApiError]       = useState("");
  const [filters, setFilters]     = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort]           = useState<SortKey>("date");
  const [view, setView]           = useState<"grid" | "table">("grid");
  const [selected, setSelected]   = useState<Listing | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [pricePreset, setPricePreset] = useState(0);

  const { isWatched, toggle } = useWatchlist();

  // Fetch listings from API
  const fetchListings = useCallback(async () => {
    setApiLoading(true);
    setApiError("");
    try {
      const params = tab === "my-listings" && user?.id
        ? `?sellerId=${encodeURIComponent(user.id)}`
        : "";
      const res = await apiFetch<{ items?: ApiListing[]; data?: ApiListing[] } | ApiListing[]>(`/marketplace/listings${params}`);
      const arr: ApiListing[] = Array.isArray(res) ? res : (res as any).items ?? (res as any).data ?? [];
      setAllListings(arr.map(adaptApiListing));
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Không tải được danh sách niêm yết.");
    } finally {
      setApiLoading(false);
    }
  }, [tab, user?.id]);

  useEffect(() => {
    if (tab !== "history") void fetchListings();
  }, [tab, fetchListings]);

  const handlePurchased = useCallback((listingId: string) => {
    setAllListings(prev => prev.map(l => l.id === listingId ? { ...l, status: "sold" as ListingStatus } : l));
  }, []);

  const handleWatchToggle = useCallback((listing: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    void toggle("listing", listing.id, {
      itemName: listing.name,
      price:    listing.price,
      rarity:   listing.rarity,
      status:   listing.status,
    });
  }, [toggle]);

  const set = useCallback(<K extends keyof Filters>(k: K, v: Filters[K]) => setFilters(f => ({ ...f, [k]: v })), []);

  const handlePricePreset = (i: number) => {
    const p = PRICE_PRESETS[i];
    setPricePreset(i);
    set("priceMin", p.min);
    set("priceMax", p.max);
  };

  const handleColumnSort = useCallback((col: ColKey) => {
    if (col === "price") setSort(s => s === "price_desc" ? "price_asc" : "price_desc");
    else if (col === "views")    setSort("views");
    else if (col === "date")     setSort("date");
    else if (col === "discount") setSort("discount");
    else if (col === "favorites") setSort("favorites");
  }, []);

  const clearAll = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPricePreset(0);
    setSort("views");
  }, []);

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    let items = allListings.filter(l => {
      if (filters.cat !== "all" && l.category !== filters.cat) return false;
      if (filters.rarity !== "all" && l.rarity !== filters.rarity) return false;
      if (filters.status !== "all" && l.status !== filters.status) return false;
      if (l.price < filters.priceMin) return false;
      if (filters.priceMax !== Infinity && l.price > filters.priceMax) return false;
      if (q && !l.name.toLowerCase().includes(q) && !l.seller.toLowerCase().includes(q) && !l.description.toLowerCase().includes(q) && !l.tags.some(t => t.toLowerCase().includes(q))) return false;
      return true;
    });
    items.sort((a, b) => {
      if (sort === "price_asc")  return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "views")      return b.views - a.views;
      if (sort === "favorites")  return b.favorites - a.favorites;
      if (sort === "date")       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "discount")   return (b.originalValue - b.price) / b.originalValue - (a.originalValue - a.price) / a.originalValue;
      return 0;
    });
    return items;
  }, [filters, sort]);

  // Active filter badges
  const activeBadges = useMemo(() => {
    const badges: { label: string; clear: () => void }[] = [];
    if (filters.cat !== "all") badges.push({ label: CATEGORY_META_MARKET[filters.cat].label, clear: () => set("cat", "all") });
    if (filters.rarity !== "all") badges.push({ label: RARITY_LABELS[filters.rarity], clear: () => set("rarity", "all") });
    if (filters.status !== "all") {
      const sl = { active: "Đang bán", sold: "Đã bán", expired: "Hết hạn", cancelled: "Đã huỷ" };
      badges.push({ label: sl[filters.status], clear: () => set("status", "all") });
    }
    if (pricePreset > 0) badges.push({ label: PRICE_PRESETS[pricePreset].label, clear: () => handlePricePreset(0) });
    return badges;
  }, [filters, pricePreset]);

  const SORT_OPTS: [SortKey, string][] = [
    ["views", "Lượt xem"], ["favorites", "Yêu thích"],
    ["price_desc", "Giá cao"], ["price_asc", "Giá thấp"],
    ["discount", "Giảm nhiều"], ["date", "Mới nhất"],
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <BG />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 space-y-4 overflow-auto">

          {/* ── Page header ─────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-2 h-6 bg-emerald-400 rounded-sm shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                Marketplace
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">
                {apiLoading ? "Đang tải..." : `${filtered.length} / ${allListings.length} SẢN PHẨM`}
                {activeBadges.length > 0 && " · BỘ LỌC ĐANG HOẠT ĐỘNG"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center gap-0.5 glass-panel border border-white/8 rounded-lg p-1">
                <button onClick={() => setView("grid")} className={cn("p-2 rounded-md transition-all", view === "grid" ? "bg-emerald-400/20 text-emerald-400" : "text-muted-foreground/35 hover:text-white")}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setView("table")} className={cn("p-2 rounded-md transition-all", view === "table" ? "bg-emerald-400/20 text-emerald-400" : "text-muted-foreground/35 hover:text-white")}>
                  <List className="w-4 h-4" />
                </button>
              </div>
              {/* Filter toggle */}
              {tab !== "history" && (
                <button onClick={() => setPanelOpen(o => !o)} className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-mono font-bold uppercase transition-all", panelOpen ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400" : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20")}>
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Bộ lọc
                  {activeBadges.length > 0 && <span className="w-4 h-4 rounded-full bg-emerald-400 text-black text-[8px] font-bold flex items-center justify-center">{activeBadges.length}</span>}
                  {panelOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
              {/* Refresh */}
              {tab !== "history" && (
                <button onClick={() => void fetchListings()} disabled={apiLoading} className="p-2 rounded-lg border border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20 transition-all disabled:opacity-30">
                  <RefreshCw className={cn("w-4 h-4", apiLoading && "animate-spin")} />
                </button>
              )}
            </div>
          </div>

          {/* ── Tabs ─────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-1 glass-panel border border-white/8 rounded-xl p-1 w-fit">
            {([
              { key: "browse",      label: "Khám phá",       icon: Store   },
              { key: "my-listings", label: "Niêm yết của tôi", icon: Package },
              { key: "history",     label: "Lịch sử giao dịch", icon: History },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all",
                  tab === t.key
                    ? "bg-emerald-400/15 border border-emerald-400/30 text-emerald-400"
                    : "text-muted-foreground/40 hover:text-white border border-transparent",
                )}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Filter panel ────────────────────────────────────────────── */}
          <AnimatePresence>
            {panelOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="glass-panel rounded-xl border border-white/5 p-4 space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
                    <input
                      value={filters.search}
                      onChange={e => set("search", e.target.value)}
                      placeholder="Tìm theo tên, người bán, mô tả, tags..."
                      className="w-full pl-9 pr-8 py-2.5 bg-white/4 border border-white/8 rounded-lg text-xs text-white placeholder:text-muted-foreground/25 focus:outline-none focus:border-emerald-400/40 font-mono transition-colors"
                    />
                    {filters.search && (
                      <button onClick={() => set("search", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-white transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Left col: Category, Rarity, Status */}
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] font-mono text-muted-foreground/30 uppercase w-16 flex-shrink-0">Danh mục</span>
                        <Chip label="Tất cả" active={filters.cat === "all"} onClick={() => set("cat", "all")} />
                        {(["pets","football","world-assets","tickets","items"] as ListingCategory[]).map(c => (
                          <Chip key={c} label={CATEGORY_META_MARKET[c].label} active={filters.cat === c} onClick={() => set("cat", c)} />
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] font-mono text-muted-foreground/30 uppercase w-16 flex-shrink-0">Độ hiếm</span>
                        <Chip label="Tất cả" active={filters.rarity === "all"} onClick={() => set("rarity", "all")} />
                        {(["common","rare","epic","legendary","mythic"] as MarketRarity[]).map(r => (
                          <Chip key={r} label={RARITY_LABELS[r]} active={filters.rarity === r} onClick={() => set("rarity", r)} />
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] font-mono text-muted-foreground/30 uppercase w-16 flex-shrink-0">Trạng thái</span>
                        {([["all","Tất cả"],["active","Đang bán"],["sold","Đã bán"],["expired","Hết hạn"]] as [string,string][]).map(([k,l]) => (
                          <Chip key={k} label={l} active={filters.status === k} onClick={() => set("status", k as any)} />
                        ))}
                      </div>
                    </div>

                    {/* Right col: Price Range + Sort */}
                    <div className="space-y-2.5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Coins className="w-3 h-3 text-muted-foreground/30" />
                          <span className="text-[9px] font-mono text-muted-foreground/30 uppercase">Khoảng giá (CR)</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {PRICE_PRESETS.map((p, i) => (
                            <button key={p.label} onClick={() => handlePricePreset(i)}
                              className={cn("px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all",
                                pricePreset === i ? "bg-amber-400/15 border-amber-400/35 text-amber-400" : "border-white/8 text-muted-foreground/40 hover:text-white hover:border-white/18"
                              )}>
                              {p.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground/30">Từ</span>
                            <input
                              type="number" min={0} max={MAX_PRICE}
                              value={filters.priceMin === 0 ? "" : filters.priceMin}
                              onChange={e => { setPricePreset(-1); set("priceMin", Number(e.target.value) || 0); }}
                              placeholder="0"
                              className="w-full pl-8 pr-2 py-1.5 bg-white/4 border border-white/8 rounded-lg text-[10px] text-white placeholder:text-muted-foreground/20 focus:outline-none focus:border-emerald-400/40 font-mono"
                            />
                          </div>
                          <span className="text-muted-foreground/20 font-mono text-xs">—</span>
                          <div className="flex-1 relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground/30">Đến</span>
                            <input
                              type="number" min={0} max={MAX_PRICE}
                              value={filters.priceMax === Infinity ? "" : filters.priceMax}
                              onChange={e => { setPricePreset(-1); set("priceMax", Number(e.target.value) || Infinity); }}
                              placeholder="∞"
                              className="w-full pl-8 pr-2 py-1.5 bg-white/4 border border-white/8 rounded-lg text-[10px] text-white placeholder:text-muted-foreground/20 focus:outline-none focus:border-emerald-400/40 font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <ArrowUpDown className="w-3 h-3 text-muted-foreground/30" />
                          <span className="text-[9px] font-mono text-muted-foreground/30 uppercase">Sắp xếp</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {SORT_OPTS.map(([k, l]) => (
                            <button key={k} onClick={() => setSort(k)}
                              className={cn("px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all",
                                sort === k ? "bg-emerald-400/15 border-emerald-400/35 text-emerald-400" : "border-white/8 text-muted-foreground/40 hover:text-white hover:border-white/18"
                              )}>
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active badges + clear */}
                  {activeBadges.length > 0 && (
                    <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-white/5">
                      <span className="text-[9px] font-mono text-muted-foreground/30 uppercase">Lọc đang dùng:</span>
                      {activeBadges.map(b => <FilterBadge key={b.label} label={b.label} onRemove={b.clear} />)}
                      <button onClick={clearAll} className="ml-auto text-[9px] font-mono text-muted-foreground/40 hover:text-red-400 border border-white/8 hover:border-red-400/30 px-2.5 py-1 rounded-lg transition-all uppercase tracking-wider">
                        Xóa tất cả
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Results ──────────────────────────────────────────────────── */}
          {tab === "history" ? (
            <PurchaseHistory userId={user?.id} />
          ) : apiLoading ? (
            <div className="glass-panel rounded-xl border border-white/5 p-16 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            </div>
          ) : apiError ? (
            <div className="glass-panel rounded-xl border border-red-400/20 p-12 text-center">
              <p className="text-xs font-mono text-red-400 mb-3">{apiError}</p>
              <button onClick={() => void fetchListings()} className="text-[10px] font-mono text-emerald-400 border border-emerald-400/20 px-4 py-1.5 rounded-lg hover:bg-emerald-400/10 transition-all uppercase tracking-wider">
                Thử lại
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-xl border border-white/5 p-16 text-center">
              <Package className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-xs font-mono text-muted-foreground/30 tracking-widest">
                {allListings.length === 0 ? "CHƯA CÓ NIÊM YẾT NÀO" : "KHÔNG TÌM THẤY SẢN PHẨM PHÙ HỢP"}
              </p>
              {allListings.length > 0 && (
                <button onClick={clearAll} className="mt-4 text-[10px] font-mono text-emerald-400 hover:text-emerald-300 border border-emerald-400/20 hover:border-emerald-400/40 px-4 py-1.5 rounded-lg transition-all uppercase tracking-wider">
                  Xóa bộ lọc
                </button>
              )}
            </motion.div>
          ) : view === "grid" ? (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              <AnimatePresence>
                {filtered.map((l) => (
                  <GridCard
                    key={l.id}
                    listing={l}
                    onSelect={() => setSelected(l)}
                    watched={isWatched("listing", l.id)}
                    onToggleWatch={(e) => handleWatchToggle(l, e)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/3">
                      <th className="py-3 pl-4 pr-3 text-left text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest font-normal">Sản phẩm</th>
                      <th className="py-3 px-3 text-left text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest font-normal">Độ hiếm</th>
                      <ThSort col="price"    label="Giá bán"  sortKey={sort} onSort={handleColumnSort} />
                      <ThSort col="discount" label="Giảm"     sortKey={sort} onSort={handleColumnSort} />
                      <ThSort col="views"    label="Xem"      sortKey={sort} onSort={handleColumnSort} />
                      <ThSort col="favorites" label="Thích"   sortKey={sort} onSort={handleColumnSort} />
                      <ThSort col="date"     label="Ngày"     sortKey={sort} onSort={handleColumnSort} />
                      <th className="py-3 px-3 text-left text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest font-normal">Trạng thái</th>
                      <th className="py-3 px-3 pr-4 text-left text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest font-normal">Người bán</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filtered.map(l => <TableRow key={l.id} listing={l} onSelect={() => setSelected(l)} />)}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* ── Detail / Buy Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <BuyModal
            listing={selected}
            onClose={() => setSelected(null)}
            onPurchased={handlePurchased}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
