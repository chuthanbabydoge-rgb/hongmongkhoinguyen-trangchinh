import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  LISTINGS, AUCTIONS, TRADES, MARKET_TRANSACTIONS,
  MARKET_VOLUME_TREND, MARKET_CATEGORY_VOLUME, TOP_SELLERS,
  RARITY_COLORS, RARITY_LABELS, CATEGORY_META_MARKET, TX_TYPE_META,
  type Listing, type Auction,
} from "@/lib/marketplaceMockData";
import { cn } from "@/lib/utils";
import {
  ShoppingBag, Gavel, CheckCircle2, TrendingUp, ChevronRight,
  Flame, Eye, Heart, Clock, ArrowRight, Activity, Users,
  Tag, Coins, ArrowLeftRight, BarChart3, Star,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

// ─── Utilities ────────────────────────────────────────────────────────────────

const fmtCR  = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M CR`
  : v >= 1_000   ? `${(v / 1_000).toFixed(0)}K CR`
  : `${v} CR`;

const fmtShort = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
  : v >= 1_000   ? `${(v / 1_000).toFixed(0)}K`
  : String(v);

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d} ngày trước`;
  if (h > 0) return `${h}g trước`;
  if (m > 0) return `${m}p trước`;
  return "Vừa xong";
}

function timeLeft(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return "Đã kết thúc";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)}n`;
  if (h > 0) return `${h}g ${m}p`;
  return `${m}p`;
}

// ─── Background ───────────────────────────────────────────────────────────────

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.022]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-emerald-500/4 rounded-full blur-[130px]" />
    <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-amber-500/4 rounded-full blur-[110px]" />
  </div>
);

// ─── Chart styles ─────────────────────────────────────────────────────────────

const TS = {
  contentStyle: { background: "rgba(0,0,0,0.92)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11, fontFamily: "monospace" },
  labelStyle:   { color: "#fff", fontWeight: "bold" },
};
const AS = { tick: { fill: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "monospace" }, tickLine: false as false, axisLine: false as false };

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  delta: string;
  deltaPositive?: boolean;
  color: string;
  border: string;
  bg: string;
  glow: string;
  delay: number;
}

function StatCard({ icon: Icon, label, value, sub, delta, deltaPositive = true, color, border, bg, glow, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className={cn("glass-panel rounded-2xl border p-5 flex flex-col gap-3 relative overflow-hidden", border, glow)}
    >
      <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-20 blur-2xl", bg.replace("/10", ""))} />
      <div className="flex items-start justify-between relative">
        <div className={cn("p-2.5 rounded-xl border", border, bg)}>
          <Icon className={cn("w-5 h-5", color)} />
        </div>
        <span className={cn(
          "text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border",
          deltaPositive ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/25" : "text-rose-400 bg-rose-400/10 border-rose-400/25",
        )}>{delta}</span>
      </div>
      <div className="relative">
        <p className={cn("text-2xl font-bold font-mono leading-none", color)}>{value}</p>
        <p className="text-[9px] font-mono text-muted-foreground/35 uppercase tracking-widest mt-1.5">{label}</p>
        <p className="text-[10px] font-mono text-muted-foreground/50 mt-0.5">{sub}</p>
      </div>
    </motion.div>
  );
}

// ─── Listing mini-card ────────────────────────────────────────────────────────

function RecentListingCard({ listing, index }: { listing: Listing; index: number }) {
  const rc = RARITY_COLORS[listing.rarity];
  const cm = CATEGORY_META_MARKET[listing.category];
  const discount = Math.round((1 - listing.price / listing.originalValue) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + index * 0.06 }}
      className={cn(
        "glass-panel rounded-xl border p-3.5 flex flex-col gap-2.5 group cursor-pointer",
        "hover:-translate-y-1 hover:shadow-lg transition-all duration-300",
        rc.border, rc.glow,
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-lg border flex items-center justify-center text-xl", rc.bg, rc.border)}>
          {listing.image}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={cn("text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full border", rc.text, rc.bg, rc.border)}>
            {RARITY_LABELS[listing.rarity]}
          </span>
          {discount > 0 && (
            <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-400/15 border border-emerald-400/20 text-emerald-400">
              -{discount}%
            </span>
          )}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight">{listing.name}</p>
        <p className={cn("text-[9px] font-mono mt-0.5", cm.color)}>{cm.icon} {cm.label}</p>
      </div>
      <div className="mt-auto space-y-0.5">
        <p className={cn("text-sm font-bold font-mono", rc.text)}>{fmtCR(listing.price)}</p>
        <p className="text-[8px] font-mono text-muted-foreground/25 line-through">{fmtCR(listing.originalValue)}</p>
      </div>
      <div className="flex items-center justify-between text-[8px] font-mono text-muted-foreground/35 border-t border-white/5 pt-2">
        <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" />{listing.views.toLocaleString()}</span>
        <span className="flex items-center gap-1"><Heart className="w-2.5 h-2.5" />{listing.favorites}</span>
        <span className="font-bold text-white/60 truncate ml-1">{listing.seller}</span>
      </div>
    </motion.div>
  );
}

// ─── Auction row ──────────────────────────────────────────────────────────────

function HotAuctionRow({ auction, index }: { auction: Auction; index: number }) {
  const rc = RARITY_COLORS[auction.rarity];
  const tl = timeLeft(auction.endTime);
  const urgent = new Date(auction.endTime).getTime() - Date.now() < 3 * 3_600_000;
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + index * 0.07 }}
      className={cn("flex items-center gap-3 p-3 rounded-xl border hover:bg-white/3 transition-all cursor-pointer", rc.border)}
    >
      <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center text-lg flex-shrink-0", rc.bg, rc.border)}>
        {auction.image}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          {auction.isHot && <Flame className="w-2.5 h-2.5 text-orange-400 flex-shrink-0" />}
          <p className="text-[11px] font-bold text-white truncate">{auction.name}</p>
        </div>
        <p className="text-[9px] font-mono text-muted-foreground/40">{auction.bids.length} lượt · {auction.watchers} theo dõi</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={cn("text-xs font-bold font-mono", rc.text)}>{fmtCR(auction.currentBid)}</p>
        <p className={cn("text-[9px] font-mono flex items-center gap-0.5 justify-end", urgent ? "text-orange-400" : "text-muted-foreground/35")}>
          <Clock className="w-2.5 h-2.5" />{tl}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Activity feed item ───────────────────────────────────────────────────────

function ActivityItem({ tx, index }: { tx: (typeof MARKET_TRANSACTIONS)[0]; index: number }) {
  const tm = TX_TYPE_META[tx.type];
  const rc = RARITY_COLORS[tx.rarity];
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + index * 0.04 }}
      className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors px-1 rounded-lg"
    >
      <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center text-base flex-shrink-0", rc.bg, rc.border)}>
        {tx.itemImage}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-white truncate max-w-[140px]">{tx.itemName}</span>
          <span className={cn("text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-white/8", tm.color, tm.bg)}>
            {tm.label}
          </span>
        </div>
        <p className="text-[9px] font-mono text-muted-foreground/40 mt-0.5 truncate">
          <span className="text-white/50">{tx.buyer}</span>
          <span className="text-muted-foreground/30 mx-1">←</span>
          <span className="text-muted-foreground/40">{tx.seller}</span>
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={cn("text-xs font-bold font-mono", rc.text)}>{fmtCR(tx.price)}</p>
        <p className="text-[9px] font-mono text-muted-foreground/30">{timeAgo(tx.date)}</p>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MarketplaceDashboard() {
  const activeListings   = useMemo(() => LISTINGS.filter(l => l.status === "active"), []);
  const completedSales   = useMemo(() => MARKET_TRANSACTIONS.filter(t => t.type === "purchase" || t.type === "auction_win"), []);
  const totalVolume      = useMemo(() => MARKET_TRANSACTIONS.reduce((s, t) => s + t.price, 0), []);
  const recentListings   = useMemo(() => activeListings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6), [activeListings]);
  const hotAuctions      = useMemo(() => AUCTIONS.filter(a => a.isHot), []);
  const activityFeed     = useMemo(() => MARKET_TRANSACTIONS.slice(0, 12), []);
  const maxCatVol        = useMemo(() => Math.max(...MARKET_CATEGORY_VOLUME.map(c => c.value)), []);

  const pendingTrades = TRADES.filter(t => t.status === "pending").length;

  const STAT_CARDS: StatCardProps[] = [
    {
      icon: ShoppingBag, label: "Niêm yết đang mở",
      value: String(activeListings.length),
      sub: `${LISTINGS.filter(l => l.status === "sold").length} đã bán · ${LISTINGS.filter(l => l.status === "expired").length} hết hạn`,
      delta: "+3 hôm nay", deltaPositive: true,
      color: "text-emerald-400", border: "border-emerald-400/20", bg: "bg-emerald-400/10",
      glow: "shadow-[0_0_24px_rgba(52,211,153,0.06)]", delay: 0.1,
    },
    {
      icon: Gavel, label: "Đấu giá đang diễn ra",
      value: String(AUCTIONS.length),
      sub: `${hotAuctions.length} phiên nóng · ${AUCTIONS.filter(a => new Date(a.endTime).getTime() - Date.now() < 3 * 3_600_000).length} sắp kết thúc`,
      delta: `${hotAuctions.length} Hot`, deltaPositive: true,
      color: "text-amber-400", border: "border-amber-400/20", bg: "bg-amber-400/10",
      glow: "shadow-[0_0_24px_rgba(251,191,36,0.06)]", delay: 0.16,
    },
    {
      icon: CheckCircle2, label: "Giao dịch hoàn thành",
      value: String(completedSales.length),
      sub: `${pendingTrades} trao đổi đang chờ · ${TRADES.filter(t => t.status === "accepted").length} đã chốt`,
      delta: "+5 tuần này", deltaPositive: true,
      color: "text-blue-400", border: "border-blue-400/20", bg: "bg-blue-400/10",
      glow: "shadow-[0_0_24px_rgba(96,165,250,0.06)]", delay: 0.22,
    },
    {
      icon: Coins, label: "Tổng khối lượng giao dịch",
      value: fmtCR(totalVolume),
      sub: `Phí: ${fmtCR(MARKET_TRANSACTIONS.reduce((s, t) => s + t.fee, 0))} · ${MARKET_TRANSACTIONS.length} tx`,
      delta: "+18.4% tháng", deltaPositive: true,
      color: "text-purple-400", border: "border-purple-400/20", bg: "bg-purple-400/10",
      glow: "shadow-[0_0_24px_rgba(192,132,252,0.06)]", delay: 0.28,
    },
  ];

  const NAV_LINKS = [
    { icon: ShoppingBag,    label: "Niêm yết",  to: "/marketplace/listings",     color: "text-emerald-400" },
    { icon: Gavel,          label: "Đấu giá",   to: "/marketplace/auctions",     color: "text-amber-400" },
    { icon: ArrowLeftRight, label: "Giao dịch", to: "/marketplace/transactions", color: "text-blue-400" },
    { icon: BarChart3,      label: "Phân tích", to: "/marketplace/analytics",    color: "text-purple-400" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <BG />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">

          {/* ── Page header ───────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-2 h-6 bg-emerald-400 rounded-sm shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                Bảng điều khiển chợ
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">
                UNIVERSE HUB MARKETPLACE · {activeListings.length} NIÊM YẾT · {AUCTIONS.length} ĐẤU GIÁ · {MARKET_TRANSACTIONS.length} GIAO DỊCH
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-panel border border-emerald-400/20 text-[10px] font-mono text-emerald-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ĐANG HOẠT ĐỘNG
              </div>
              {NAV_LINKS.map(n => (
                <Link key={n.to} href={n.to}>
                  <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-panel border border-white/8 text-[10px] font-mono hover:border-white/15 transition-colors cursor-pointer", n.color)}>
                    <n.icon className="w-3 h-3" />{n.label}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* ── Stat cards ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {STAT_CARDS.map(c => <StatCard key={c.label} {...c} />)}
          </div>

          {/* ── Volume chart + Top categories ─────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Volume trend */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="lg:col-span-2 glass-panel rounded-2xl border border-white/5 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Khối lượng giao dịch
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground/35 mt-0.5">12 tháng gần nhất (CR)</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold font-mono text-emerald-400">{fmtCR(MARKET_VOLUME_TREND[MARKET_VOLUME_TREND.length - 1].volume)}</p>
                  <p className="text-[9px] font-mono text-emerald-400/60">tháng này</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={MARKET_VOLUME_TREND} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mkt-vol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#34d399" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" {...AS} />
                  <YAxis {...AS} tickFormatter={fmtShort} width={38} />
                  <Tooltip {...TS} formatter={(v: number) => [fmtCR(v), "Khối lượng"]} />
                  <Area type="monotone" dataKey="volume" stroke="#34d399" strokeWidth={2}
                    fill="url(#mkt-vol)" dot={false} activeDot={{ r: 4, fill: "#34d399" }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Top categories */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="glass-panel rounded-2xl border border-white/5 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-4 h-4 text-purple-400" /> Danh mục hàng đầu
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground/35 mt-0.5">Theo khối lượng giao dịch</p>
                </div>
              </div>
              <div className="space-y-3 flex-1">
                {MARKET_CATEGORY_VOLUME.map((cat, i) => {
                  const pct = Math.round((cat.value / maxCatVol) * 100);
                  const cm = CATEGORY_META_MARKET[cat.name === "Tài sản TG" ? "world-assets" : cat.name === "Cầu thủ" ? "football" : cat.name === "Thú cưng" ? "pets" : cat.name === "Vật phẩm" ? "items" : "tickets"];
                  return (
                    <motion.div key={cat.name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.42 + i * 0.06 }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cm.icon}</span>
                          <span className="text-[11px] font-bold text-white">{cat.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold font-mono" style={{ color: cat.color }}>{fmtShort(cat.value)} CR</span>
                          <span className="text-[9px] font-mono text-muted-foreground/35 ml-1.5">({cat.txCount} tx)</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.5 + i * 0.07, duration: 0.6, ease: "easeOut" }}
                          className="h-full rounded-full" style={{ background: cat.color }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-2">
                <div className="glass-panel rounded-xl border border-white/8 p-2.5 text-center">
                  <p className="text-sm font-bold font-mono text-white">{MARKET_CATEGORY_VOLUME.reduce((s, c) => s + c.txCount, 0)}</p>
                  <p className="text-[9px] font-mono text-muted-foreground/35">Tổng giao dịch</p>
                </div>
                <div className="glass-panel rounded-xl border border-white/8 p-2.5 text-center">
                  <p className="text-sm font-bold font-mono text-emerald-400">{fmtShort(totalVolume)} CR</p>
                  <p className="text-[9px] font-mono text-muted-foreground/35">Tổng khối lượng</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Recent Listings ───────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" /> Niêm yết gần đây
                </p>
                <p className="text-[10px] font-mono text-muted-foreground/35 mt-0.5">Sản phẩm mới nhất đang bán</p>
              </div>
              <Link href="/marketplace/listings">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 hover:text-emerald-300 border border-emerald-400/20 hover:border-emerald-400/40 px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                  Xem tất cả {activeListings.length} <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {recentListings.map((l, i) => (
                <RecentListingCard key={l.id} listing={l} index={i} />
              ))}
            </div>
          </motion.div>

          {/* ── Activity feed + Hot auctions ──────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Activity feed */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="lg:col-span-2 glass-panel rounded-2xl border border-white/5 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" /> Hoạt động marketplace
                    <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />LIVE
                    </span>
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground/35 mt-0.5">Giao dịch hoàn thành gần nhất</p>
                </div>
                <Link href="/marketplace/transactions">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-blue-400 hover:text-blue-300 border border-blue-400/20 px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                    Xem tất cả <ChevronRight className="w-3 h-3" />
                  </div>
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[380px] pr-1 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10">
                {activityFeed.map((tx, i) => (
                  <ActivityItem key={tx.id} tx={tx} index={i} />
                ))}
              </div>
            </motion.div>

            {/* Hot auctions + Top sellers */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              className="flex flex-col gap-4">

              {/* Hot auctions */}
              <div className="glass-panel rounded-2xl border border-white/5 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-400" /> Đấu giá nóng
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground/35">Sắp kết thúc</p>
                  </div>
                  <Link href="/marketplace/auctions">
                    <span className="text-[9px] font-mono text-amber-400 border border-amber-400/20 px-2 py-1 rounded-lg cursor-pointer hover:bg-amber-400/5 transition-colors">
                      Xem tất cả
                    </span>
                  </Link>
                </div>
                <div className="space-y-1.5">
                  {hotAuctions.slice(0, 4).map((a, i) => (
                    <HotAuctionRow key={a.id} auction={a} index={i} />
                  ))}
                </div>
              </div>

              {/* Top sellers */}
              <div className="glass-panel rounded-2xl border border-white/5 p-4 flex flex-col flex-1">
                <p className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-amber-400" /> Người bán hàng đầu
                </p>
                <div className="space-y-2">
                  {TOP_SELLERS.map((s, i) => (
                    <motion.div key={s.name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.06 }}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/5 hover:bg-white/3 transition-colors">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-500/10 border border-amber-400/20 flex items-center justify-center text-[11px] font-bold text-amber-400">
                          {s.avatar}
                        </div>
                        {i === 0 && <span className="absolute -top-1 -right-1 text-[9px]">👑</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white truncate">{s.name}</p>
                        <p className="text-[9px] font-mono text-muted-foreground/40">{s.sales} bán · {fmtShort(s.volume)} CR</p>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400 flex-shrink-0">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span className="text-[10px] font-bold font-mono">{s.rating}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

        </main>
      </div>
    </div>
  );
}
