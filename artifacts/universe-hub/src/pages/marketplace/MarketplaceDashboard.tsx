import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  LISTINGS, AUCTIONS, MARKET_TRANSACTIONS, MARKET_VOLUME_TREND,
  RARITY_COLORS, RARITY_LABELS, CATEGORY_META_MARKET, TX_TYPE_META,
  type Listing, type Auction,
} from "@/lib/marketplaceMockData";
import { cn } from "@/lib/utils";
import {
  ShoppingBag, Gavel, ArrowLeftRight, BarChart3,
  TrendingUp, Eye, Heart, Clock, Flame, ChevronRight, Tag,
  Coins, Package, Users, Zap,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-[130px]" />
    <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-amber-500/4 rounded-full blur-[100px]" />
  </div>
);

const TS = {
  contentStyle: { background: "rgba(0,0,0,0.90)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11, fontFamily: "monospace" },
  labelStyle: { color: "#fff", fontWeight: "bold" },
};
const AS = { tick: { fill: "rgba(255,255,255,0.28)", fontSize: 10, fontFamily: "monospace" }, tickLine: false as false, axisLine: false as false };
const fmtShort = (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v);
const fmtCR = (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M CR` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K CR` : `${v} CR`;

function timeLeft(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return "Đã kết thúc";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)}n ${h % 24}g`;
  if (h > 0) return `${h}g ${m}p`;
  return `${m}p`;
}

function ListingCard({ listing, index }: { listing: Listing; index: number }) {
  const rc = RARITY_COLORS[listing.rarity];
  const cm = CATEGORY_META_MARKET[listing.category];
  const discount = Math.round((1 - listing.price / listing.originalValue) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className={cn("glass-panel rounded-2xl border p-4 flex flex-col gap-3 group hover:-translate-y-1 transition-all duration-300 cursor-pointer", rc.border, rc.glow)}
    >
      <div className="flex items-start justify-between">
        <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center text-2xl", rc.bg, rc.border)}>{listing.image}</div>
        <div className="flex flex-col items-end gap-1">
          <span className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border", rc.text, rc.bg, rc.border)}>{RARITY_LABELS[listing.rarity]}</span>
          {discount > 0 && <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-400/15 border border-emerald-400/20 text-emerald-400">-{discount}%</span>}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-white line-clamp-2 leading-tight">{listing.name}</p>
        <p className={cn("text-[9px] font-mono mt-0.5", cm.color)}>{cm.icon} {cm.label}</p>
      </div>
      <div className="mt-auto">
        <p className={cn("text-base font-bold font-mono", rc.text)}>{fmtCR(listing.price)}</p>
        <p className="text-[9px] font-mono text-muted-foreground/30 line-through">{fmtCR(listing.originalValue)}</p>
      </div>
      <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground/40">
        <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" />{listing.views.toLocaleString()}</span>
        <span className="flex items-center gap-1"><Heart className="w-2.5 h-2.5" />{listing.favorites}</span>
        <span className={cn("text-white font-bold text-[10px]")}>{listing.seller}</span>
      </div>
    </motion.div>
  );
}

function AuctionCard({ auction, index }: { auction: Auction; index: number }) {
  const rc = RARITY_COLORS[auction.rarity];
  const tl = timeLeft(auction.endTime);
  const isEndingSoon = new Date(auction.endTime).getTime() - Date.now() < 3 * 3_600_000;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }}
      className={cn("glass-panel rounded-xl border p-3.5 flex items-center gap-3 hover:bg-white/3 transition-all cursor-pointer", rc.border)}
    >
      <div className={cn("w-10 h-10 rounded-lg border flex items-center justify-center text-xl flex-shrink-0", rc.bg, rc.border)}>{auction.image}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {auction.isHot && <Flame className="w-3 h-3 text-orange-400 flex-shrink-0" />}
          <p className="text-xs font-bold text-white truncate">{auction.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-muted-foreground/40">{auction.bids.length} lượt đặt</span>
          <span className="text-[9px] font-mono text-muted-foreground/20">·</span>
          <span className="text-[9px] font-mono text-muted-foreground/40">{auction.watchers} theo dõi</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={cn("text-xs font-bold font-mono", rc.text)}>{fmtCR(auction.currentBid)}</p>
        <div className={cn("flex items-center gap-1 text-[9px] font-mono", isEndingSoon ? "text-orange-400" : "text-muted-foreground/40")}>
          <Clock className="w-2.5 h-2.5" />{tl}
        </div>
      </div>
    </motion.div>
  );
}

export default function MarketplaceDashboard() {
  const activeListings = LISTINGS.filter(l => l.status === "active");
  const activeAuctions = AUCTIONS;
  const recentTx = MARKET_TRANSACTIONS.slice(0, 8);
  const totalVolume = MARKET_TRANSACTIONS.reduce((s, t) => s + t.price, 0);
  const totalFees = MARKET_TRANSACTIONS.reduce((s, t) => s + t.fee, 0);

  const NAV_CARDS = [
    { icon: ShoppingBag, label: "Danh sách", sub: `${activeListings.length} sản phẩm`, color: "text-emerald-400", border: "border-emerald-400/20", bg: "bg-emerald-400/5", to: "/marketplace/listings" },
    { icon: Gavel, label: "Đấu giá",   sub: `${activeAuctions.length} phiên`,    color: "text-amber-400",   border: "border-amber-400/20",  bg: "bg-amber-400/5",   to: "/marketplace/auctions" },
    { icon: ArrowLeftRight, label: "Giao dịch", sub: `${MARKET_TRANSACTIONS.length} giao dịch`, color: "text-blue-400", border: "border-blue-400/20", bg: "bg-blue-400/5", to: "/marketplace/transactions" },
    { icon: BarChart3, label: "Phân tích", sub: "Thống kê chi tiết", color: "text-purple-400", border: "border-purple-400/20", bg: "bg-purple-400/5", to: "/marketplace/analytics" },
  ];

  const KPIS = [
    { label: "Tổng khối lượng", value: fmtCR(totalVolume), icon: Coins,     color: "text-emerald-400", border: "border-emerald-400/20", delta: "+18.4%" },
    { label: "Niêm yết đang mở", value: String(activeListings.length), icon: Package,  color: "text-blue-400",    border: "border-blue-400/20",    delta: "+3" },
    { label: "Đấu giá diễn ra",  value: String(activeAuctions.length), icon: Gavel,    color: "text-amber-400",   border: "border-amber-400/20",   delta: "4 Hot" },
    { label: "Phí giao dịch",    value: fmtCR(totalFees),  icon: TrendingUp,  color: "text-purple-400",  border: "border-purple-400/20",  delta: "+18.4%" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <BG />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-2 h-6 bg-emerald-400 rounded-sm shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                Chợ trực tuyến
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">
                UNIVERSE HUB MARKETPLACE · {activeListings.length} NIÊM YẾT · {activeAuctions.length} ĐẤU GIÁ
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-panel border border-emerald-400/20 text-[10px] font-mono text-emerald-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ĐANG HOẠT ĐỘNG
              </div>
            </div>
          </div>

          {/* Nav quick-access */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {NAV_CARDS.map((card, i) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link href={card.to}>
                  <div className={cn("glass-panel rounded-2xl border p-4 flex items-center gap-3 hover:-translate-y-1 transition-all duration-300 cursor-pointer", card.border, card.bg)}>
                    <div className={cn("p-2.5 rounded-xl border", card.border, card.bg)}>
                      <card.icon className={cn("w-5 h-5", card.color)} />
                    </div>
                    <div>
                      <p className={cn("text-sm font-bold", card.color)}>{card.label}</p>
                      <p className="text-[9px] font-mono text-muted-foreground/40">{card.sub}</p>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 ml-auto", card.color, "opacity-40")} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {KPIS.map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.06 }}
                className={cn("glass-panel rounded-2xl border p-4", k.border)}>
                <div className="flex items-start justify-between mb-3">
                  <k.icon className={cn("w-4 h-4", k.color)} />
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-full">{k.delta}</span>
                </div>
                <p className={cn("text-xl font-bold font-mono", k.color)}>{k.value}</p>
                <p className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest mt-1">{k.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Volume chart + Hot auctions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="lg:col-span-2 glass-panel rounded-2xl border border-white/5 p-5">
              <p className="text-sm font-bold text-white uppercase tracking-wider mb-0.5">Khối lượng giao dịch</p>
              <p className="text-[10px] font-mono text-muted-foreground/40 mb-4">12 tháng gần nhất (CR)</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={MARKET_VOLUME_TREND} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mkt-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="label" {...AS} />
                  <YAxis {...AS} tickFormatter={fmtShort} width={40} />
                  <Tooltip {...TS} formatter={(v: number) => [fmtCR(v), "Khối lượng"]} />
                  <Area type="monotone" dataKey="volume" name="Khối lượng" stroke="#34d399" strokeWidth={2} fill="url(#mkt-grad)"
                    dot={false} activeDot={{ r: 5, fill: "#34d399" }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="glass-panel rounded-2xl border border-white/5 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-white uppercase tracking-wider">Đấu giá nóng</p>
                  <p className="text-[10px] font-mono text-muted-foreground/40">Sắp kết thúc</p>
                </div>
                <Link href="/marketplace/auctions">
                  <span className="text-[9px] font-mono text-emerald-400 hover:text-emerald-300 border border-emerald-400/20 px-2 py-1 rounded-lg cursor-pointer">Xem tất cả</span>
                </Link>
              </div>
              <div className="space-y-2 flex-1">
                {AUCTIONS.filter(a => a.isHot).map((a, i) => (
                  <AuctionCard key={a.id} auction={a} index={i} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Hot listings */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" /> Sản phẩm nổi bật
                </p>
                <p className="text-[10px] font-mono text-muted-foreground/40">Nhiều lượt xem nhất</p>
              </div>
              <Link href="/marketplace/listings">
                <span className="text-[9px] font-mono text-emerald-400 hover:text-emerald-300 border border-emerald-400/20 px-2 py-1 rounded-lg cursor-pointer">Xem tất cả →</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {activeListings.sort((a, b) => b.views - a.views).slice(0, 5).map((l, i) => (
                <ListingCard key={l.id} listing={l} index={i} />
              ))}
            </div>
          </motion.div>

          {/* Recent transactions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="glass-panel rounded-2xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-wider">Giao dịch gần đây</p>
                <p className="text-[10px] font-mono text-muted-foreground/40">Hoàn thành mới nhất</p>
              </div>
              <Link href="/marketplace/transactions">
                <span className="text-[9px] font-mono text-emerald-400 hover:text-emerald-300 border border-emerald-400/20 px-2 py-1 rounded-lg cursor-pointer">Xem tất cả</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Vật phẩm", "Loại", "Người mua", "Người bán", "Giá", "Phí", "Thời gian"].map(h => (
                      <th key={h} className="text-left text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest pb-2 pr-4 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentTx.map((tx, i) => {
                    const tm = TX_TYPE_META[tx.type];
                    const rc = RARITY_COLORS[tx.rarity];
                    return (
                      <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.03 }}
                        className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{tx.itemImage}</span>
                            <span className="text-xs text-white font-bold truncate max-w-[120px]">{tx.itemName}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className={cn("text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-white/10", tm.color, tm.bg)}>{tm.label}</span>
                        </td>
                        <td className="py-2.5 pr-4 text-[10px] font-mono text-muted-foreground/60">{tx.buyer}</td>
                        <td className="py-2.5 pr-4 text-[10px] font-mono text-muted-foreground/60">{tx.seller}</td>
                        <td className="py-2.5 pr-4">
                          <span className={cn("text-xs font-bold font-mono", rc.text)}>{fmtCR(tx.price)}</span>
                        </td>
                        <td className="py-2.5 pr-4 text-[10px] font-mono text-muted-foreground/40">{fmtCR(tx.fee)}</td>
                        <td className="py-2.5 text-[9px] font-mono text-muted-foreground/30">
                          {new Date(tx.date).toLocaleDateString("vi-VN")}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

        </main>
      </div>
    </div>
  );
}
