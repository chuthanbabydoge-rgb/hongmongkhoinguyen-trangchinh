// ─────────────────────────────────────────────────────────────────────────────
// ActivityFeed (V2.9)
//
// Real-time marketplace activity feed powered by the /ws/marketplace WebSocket.
// Supports: live stream · pause/resume · clear · filter tabs · max 500 posts
// ─────────────────────────────────────────────────────────────────────────────

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";
import { useMarketplaceFeed, type FeedFilter } from "@/hooks/useMarketplaceFeed";
import { type FeedPost, type MarketplaceEventType } from "@/services/realtimeService";
import { cn } from "@/lib/utils";
import {
  Pause, Play, Trash2, Wifi, WifiOff, RefreshCw,
  ShoppingBag, Gavel, TrendingDown, Bell, Shield, Star,
  Radio,
} from "lucide-react";

// ─── Event display config ─────────────────────────────────────────────────────

interface EventMeta {
  emoji:       string;
  label:       string;
  colorClass:  string;
  bgClass:     string;
  borderClass: string;
}

const EVENT_META: Record<MarketplaceEventType, EventMeta> = {
  LISTING_CREATED:      { emoji: "🟢", label: "Đăng bán mới",     colorClass: "text-emerald-400", bgClass: "bg-emerald-400/10", borderClass: "border-emerald-400/25" },
  LISTING_REMOVED:      { emoji: "🔴", label: "Gỡ niêm yết",      colorClass: "text-red-400",     bgClass: "bg-red-400/10",     borderClass: "border-red-400/25"     },
  LISTING_SOLD:         { emoji: "💰", label: "Đã bán",            colorClass: "text-amber-400",   bgClass: "bg-amber-400/10",   borderClass: "border-amber-400/25"   },
  AUCTION_CREATED:      { emoji: "🔨", label: "Phiên đấu giá mới", colorClass: "text-amber-400",   bgClass: "bg-amber-400/10",   borderClass: "border-amber-400/25"   },
  AUCTION_CANCELLED:    { emoji: "⚪", label: "Đấu giá hủy",       colorClass: "text-slate-400",   bgClass: "bg-slate-400/10",   borderClass: "border-slate-400/25"   },
  AUCTION_COMPLETED:    { emoji: "🏆", label: "Đấu giá kết thúc",  colorClass: "text-yellow-400",  bgClass: "bg-yellow-400/10",  borderClass: "border-yellow-400/25"  },
  BID_PLACED:           { emoji: "⚡", label: "Đặt giá",           colorClass: "text-cyan-400",    bgClass: "bg-cyan-400/10",    borderClass: "border-cyan-400/25"    },
  PRICE_DROP:           { emoji: "📉", label: "Giảm giá",          colorClass: "text-emerald-400", bgClass: "bg-emerald-400/10", borderClass: "border-emerald-400/25" },
  NOTIFICATION_CREATED: { emoji: "🔔", label: "Thông báo",         colorClass: "text-blue-400",    bgClass: "bg-blue-400/10",    borderClass: "border-blue-400/25"    },
  SELLER_LEVEL_UP:      { emoji: "⬆️", label: "Lên cấp uy tín",   colorClass: "text-purple-400",  bgClass: "bg-purple-400/10",  borderClass: "border-purple-400/25"  },
  SELLER_SUSPENDED:     { emoji: "⛔", label: "Tạm đình chỉ",      colorClass: "text-orange-400",  bgClass: "bg-orange-400/10",  borderClass: "border-orange-400/25"  },
  SELLER_BANNED:        { emoji: "🚫", label: "Cấm vĩnh viễn",     colorClass: "text-red-400",     bgClass: "bg-red-400/10",     borderClass: "border-red-400/25"     },
};

// ─── Filter tabs config ───────────────────────────────────────────────────────

interface TabDef {
  key:   FeedFilter;
  label: string;
  icon:  React.ElementType;
}

const FILTER_TABS: TabDef[] = [
  { key: "all",           label: "Tất cả",     icon: Radio        },
  { key: "listings",      label: "Danh sách",  icon: ShoppingBag  },
  { key: "auctions",      label: "Đấu giá",    icon: Gavel        },
  { key: "pricing",       label: "Giá cả",     icon: TrendingDown },
  { key: "notifications", label: "Thông báo",  icon: Bell         },
  { key: "moderation",    label: "Kiểm duyệt", icon: Shield       },
  { key: "reputation",    label: "Uy tín",     icon: Star         },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 5)    return "vừa xong";
  if (diff < 60)   return `${diff}s trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)}ph trước`;
  return `${Math.floor(diff / 3600)}g trước`;
}

function fmtPrice(val: unknown, currency?: unknown): string {
  if (typeof val !== "number") return "";
  const c = typeof currency === "string" ? currency : "credits";
  const label = c === "eth" ? " ETH" : c === "stars" ? " ⭐" : " CR";
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M${label}`;
  if (val >= 1_000)     return `${(val / 1_000).toFixed(0)}K${label}`;
  return `${val.toLocaleString("vi-VN")}${label}`;
}

// ─── Post card ────────────────────────────────────────────────────────────────

const FeedCard = memo(function FeedCard({ post }: { post: FeedPost }) {
  const meta      = EVENT_META[post.type];
  const { data }  = post;
  const itemName  = typeof data["itemName"]  === "string" ? data["itemName"]  : null;
  const price     = data["price"]     ?? data["currentPrice"] ?? data["newPrice"];
  const oldPrice  = data["oldPrice"]  ?? data["watchPrice"];
  const currency  = data["currency"];
  const dropPct   = typeof data["dropPct"]  === "number" ? data["dropPct"]  : null;
  const bidder    = data["bidderId"]  ?? data["userId"];
  const level     = data["level"];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1,  x: 0 }}
      exit={{    opacity: 0,  x: 12, height: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "glass-panel rounded-xl border px-4 py-3 flex items-start gap-3",
        meta.borderClass,
      )}
    >
      {/* Emoji icon */}
      <div className={cn(
        "flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center text-base",
        meta.bgClass, meta.borderClass,
      )}>
        <span role="img" aria-label={meta.label}>{meta.emoji}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={cn("text-[10px] font-mono font-bold uppercase tracking-wider", meta.colorClass)}>
            {meta.label}
          </span>
          {itemName && (
            <span className="text-xs font-semibold text-white truncate">{itemName}</span>
          )}
        </div>

        {/* Event-specific detail line */}
        <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono text-muted-foreground/50">
          {/* Price for listings / auctions */}
          {price != null && !oldPrice && (
            <span className={cn("font-bold", meta.colorClass)}>{fmtPrice(price, currency)}</span>
          )}

          {/* Price drop: old → new */}
          {oldPrice != null && price != null && (
            <span className="flex items-center gap-1">
              <span className="line-through text-muted-foreground/30">{fmtPrice(oldPrice, currency)}</span>
              <span>→</span>
              <span className="text-emerald-400 font-bold">{fmtPrice(price, currency)}</span>
              {dropPct != null && (
                <span className="text-emerald-400 font-bold bg-emerald-400/10 border border-emerald-400/20 px-1 rounded">
                  -{Math.abs(dropPct).toFixed(2)}%
                </span>
              )}
            </span>
          )}

          {/* Bidder */}
          {post.type === "BID_PLACED" && bidder && (
            <span className="text-cyan-400/70">Người dùng: {String(bidder).slice(0, 8)}…</span>
          )}

          {/* Seller level */}
          {level && (
            <span className="text-purple-400/80 font-bold">Cấp: {String(level)}</span>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <span className="flex-shrink-0 text-[9px] font-mono text-muted-foreground/30 mt-0.5 whitespace-nowrap">
        {timeAgo(post.timestamp)}
      </span>
    </motion.div>
  );
});

// ─── Background ───────────────────────────────────────────────────────────────

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/8 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px]" />
    <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-violet-500/3 rounded-full blur-[100px]" />
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyFeed({ connected }: { connected: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className={cn(
        "w-16 h-16 rounded-2xl border flex items-center justify-center",
        connected ? "bg-cyan-400/10 border-cyan-400/20" : "bg-slate-400/10 border-slate-400/20",
      )}>
        {connected
          ? <Radio className="w-7 h-7 text-cyan-400/50 animate-pulse" />
          : <WifiOff className="w-7 h-7 text-slate-400/50" />
        }
      </div>
      <p className="text-sm font-mono text-muted-foreground/40 max-w-xs">
        {connected
          ? "Đang chờ sự kiện từ chợ trực tuyến…\nHoạt động sẽ xuất hiện ở đây theo thời gian thực."
          : "Đang kết nối tới WebSocket…"}
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ActivityFeed() {
  const { posts, allPosts, stats, filter, setFilter, togglePause, clear } = useMarketplaceFeed();

  const isConnected = stats.connectionState === "connected";
  const isConnecting = stats.connectionState === "connecting";

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
                <span className="w-2 h-6 bg-cyan-400 rounded-sm shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
                Hoạt động Trực tuyến
                {allPosts.length > 0 && (
                  <span className="text-sm font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-400/15 border border-cyan-400/25 text-cyan-400">
                    {allPosts.length}
                  </span>
                )}
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">
                WEBSOCKET · /ws/marketplace · THỜI GIAN THỰC
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={togglePause}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-mono font-bold transition-all",
                  stats.isPaused
                    ? "border-amber-400/40 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20"
                    : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20",
                )}
              >
                {stats.isPaused ? <><Play className="w-3 h-3" /> Tiếp tục</> : <><Pause className="w-3 h-3" /> Tạm dừng</>}
              </button>
              <button
                onClick={clear}
                disabled={allPosts.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-muted-foreground/40 hover:text-red-400 hover:border-red-400/30 text-[10px] font-mono font-bold transition-all disabled:opacity-30"
              >
                <Trash2 className="w-3 h-3" /> Xóa
              </button>
            </div>
          </div>

          {/* ── Stats bar ───────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Connection status */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-mono font-bold",
              isConnected  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
              : isConnecting ? "border-amber-400/25 bg-amber-400/8 text-amber-400"
              :                "border-red-400/25   bg-red-400/8    text-red-400",
            )}>
              {isConnected ? (
                <><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Đã kết nối</>
              ) : isConnecting ? (
                <><RefreshCw className="w-3 h-3 animate-spin" /> Đang kết nối…</>
              ) : (
                <><WifiOff className="w-3 h-3" /> Mất kết nối</>
              )}
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/8 text-[10px] font-mono text-muted-foreground/40">
              <Wifi className="w-3 h-3" />
              <span>Kết nối lại: <span className="text-white/60">{stats.reconnectCount}</span></span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/8 text-[10px] font-mono text-muted-foreground/40">
              <Radio className="w-3 h-3" />
              <span>Tin nhắn: <span className="text-white/60">{stats.messageCount}</span></span>
            </div>

            {stats.isPaused && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-400/30 bg-amber-400/10 text-amber-400 text-[10px] font-mono font-bold"
              >
                <Pause className="w-3 h-3" /> Đang tạm dừng — sự kiện bị bỏ qua
              </motion.div>
            )}
          </div>

          {/* ── Filter tabs ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 flex-wrap">
            {FILTER_TABS.map(tab => {
              const isActive = filter === tab.key;
              const Icon     = tab.icon;
              const count    = tab.key === "all"
                ? allPosts.length
                : allPosts.filter(p => {
                    const map: Record<string, MarketplaceEventType[]> = {
                      listings:      ["LISTING_CREATED", "LISTING_REMOVED", "LISTING_SOLD"],
                      auctions:      ["AUCTION_CREATED", "AUCTION_CANCELLED", "AUCTION_COMPLETED", "BID_PLACED"],
                      pricing:       ["PRICE_DROP"],
                      notifications: ["NOTIFICATION_CREATED"],
                      moderation:    ["SELLER_SUSPENDED", "SELLER_BANNED"],
                      reputation:    ["SELLER_LEVEL_UP"],
                    };
                    return (map[tab.key] ?? []).includes(p.type);
                  }).length;

              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-mono font-bold uppercase tracking-wider transition-all",
                    isActive
                      ? "border-cyan-400/35 bg-cyan-400/12 text-cyan-400"
                      : "border-white/8 text-muted-foreground/40 hover:text-white hover:border-white/20",
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                  <span className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                    isActive ? "bg-cyan-400/20 text-cyan-300" : "bg-white/8 text-muted-foreground/50",
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Feed ─────────────────────────────────────────────────────── */}
          {posts.length === 0 ? (
            <EmptyFeed connected={isConnected || isConnecting} />
          ) : (
            <motion.div layout className="flex flex-col gap-2">
              <AnimatePresence mode="popLayout" initial={false}>
                {posts.map(post => (
                  <FeedCard key={post.id} post={post} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Footer note ──────────────────────────────────────────────── */}
          {allPosts.length >= 500 && (
            <p className="text-center text-[9px] font-mono text-muted-foreground/25">
              GIỚI HẠN 500 BÀI ĐĂNG — CÁC SỰ KIỆN CŨ NHẤT ĐÃ BỊ XÓA
            </p>
          )}

        </main>
      </div>
    </div>
  );
}
