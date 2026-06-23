import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  AUCTIONS, RARITY_COLORS, RARITY_LABELS, CATEGORY_META_MARKET,
  type Auction, type MarketRarity, type ListingCategory,
} from "@/lib/marketplaceMockData";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/hooks/useWatchlist";
import {
  Gavel, Clock, Flame, Eye, Users, X, AlertTriangle,
  ShoppingBag, Search, SlidersHorizontal, ChevronDown, ChevronUp,
  TrendingUp, CheckCircle2, ArrowUpDown, ArrowDown, ArrowUp,
  Trophy, Zap, Activity, Heart,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab     = "all" | "ending" | "highest";
type SortKey = "endTime" | "currentBid_desc" | "currentBid_asc" | "bids" | "watchers";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtCR = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M CR`
  : v >= 1_000   ? `${(v / 1_000).toFixed(0)}K CR`
  : `${v.toLocaleString("vi-VN")} CR`;

const RARITY_BAR_COLOR: Record<MarketRarity, string> = {
  common: "#9ca3af", rare: "#60a5fa", epic: "#c084fc", legendary: "#fbbf24", mythic: "#fb7185",
};

// ─── Live countdown hook ──────────────────────────────────────────────────────

function useCountdown(endTime: string) {
  const [state, setState] = useState({ label: "", urgent: false, critical: false, pct: 100 });
  useEffect(() => {
    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setState({ label: "Đã kết thúc", urgent: false, critical: false, pct: 0 }); return; }
      const totalDur = new Date(endTime).getTime() - Date.now() + diff; // rough
      const h  = Math.floor(diff / 3_600_000);
      const m  = Math.floor((diff % 3_600_000) / 60_000);
      const s  = Math.floor((diff % 60_000) / 1_000);
      const urgent   = diff < 6 * 3_600_000;
      const critical = diff < 1 * 3_600_000;
      const maxRange = 4 * 24 * 3_600_000;
      const pct = Math.max(0, Math.min(100, (diff / maxRange) * 100));
      let label: string;
      if (h >= 24) label = `${Math.floor(h / 24)}n ${h % 24}g`;
      else if (h > 0) label = `${h}g ${m}p ${s}s`;
      else label = `${m}p ${s}s`;
      setState({ label, urgent, critical, pct });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return state;
}

// ─── Background ───────────────────────────────────────────────────────────────

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/8 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.022]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[130px]" />
    <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-orange-500/4 rounded-full blur-[100px]" />
  </div>
);

// ─── Bid Modal ────────────────────────────────────────────────────────────────

interface BidModalProps {
  auction: Auction;
  onClose: () => void;
  onBidPlaced: (id: string, amount: number) => void;
}

function BidModal({ auction, onClose, onBidPlaced }: BidModalProps) {
  const rc = RARITY_COLORS[auction.rarity];
  const cm = CATEGORY_META_MARKET[auction.category];
  const { label: timeLeft, urgent, critical } = useCountdown(auction.endTime);
  const minBid = auction.currentBid + auction.minIncrement;
  const [bidAmount, setBidAmount] = useState(minBid);
  const [phase, setPhase] = useState<"input" | "confirm" | "placing" | "done">("input");

  const QUICK_BIDS = [minBid, minBid + auction.minIncrement * 2, minBid + auction.minIncrement * 5];

  const handlePlace = () => {
    if (bidAmount < minBid) return;
    setPhase("confirm");
  };

  const handleConfirm = () => {
    setPhase("placing");
    setTimeout(() => {
      setPhase("done");
      onBidPlaced(auction.id, bidAmount);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget && phase !== "placing") onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.93, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className={cn("glass-panel rounded-2xl border w-full max-w-lg overflow-hidden", rc.border, rc.glow)}
      >
        {/* Modal header */}
        <div className={cn("p-5 border-b border-white/5 relative", rc.bg)}>
          {phase !== "placing" && (
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg border border-white/10 hover:border-white/30 text-muted-foreground/40 hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-start gap-4 pr-8">
            <div className={cn("w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl flex-shrink-0", rc.bg, rc.border)}>
              {auction.image}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border", rc.text, rc.bg, rc.border)}>
                  {RARITY_LABELS[auction.rarity]}
                </span>
                <span className={cn("text-[9px] font-mono", cm.color)}>{cm.icon} {cm.label}</span>
                {auction.isHot && (
                  <span className="flex items-center gap-1 text-[9px] font-mono text-orange-400 bg-orange-400/10 border border-orange-400/20 px-1.5 py-0.5 rounded-full">
                    <Flame className="w-2.5 h-2.5" />HOT
                  </span>
                )}
              </div>
              <h2 className="text-sm font-bold text-white line-clamp-1">{auction.name}</h2>
              <p className="text-[9px] font-mono text-muted-foreground/35 mt-0.5">{auction.id} · {auction.seller}</p>
            </div>
          </div>
        </div>

        {/* Timer bar */}
        <div className={cn("h-1 w-full", critical ? "bg-red-400/20" : urgent ? "bg-orange-400/20" : "bg-white/5")}>
          <motion.div
            initial={{ width: "100%" }} animate={{ width: "60%" }} transition={{ duration: 2 }}
            className={cn("h-full", critical ? "bg-red-400" : urgent ? "bg-orange-400" : "bg-amber-400/60")}
          />
        </div>

        {/* Phase content */}
        <AnimatePresence mode="wait">

          {/* ── Input phase ── */}
          {phase === "input" && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5 space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/4 border border-white/5 rounded-xl p-3 text-center">
                  <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1.5">Bid hiện tại</p>
                  <p className={cn("text-sm font-bold font-mono", rc.text)}>{fmtCR(auction.currentBid)}</p>
                  <p className="text-[8px] font-mono text-muted-foreground/25 mt-0.5">Min: {fmtCR(auction.minimumBid)}</p>
                </div>
                <div className={cn("rounded-xl p-3 text-center border", critical ? "bg-red-400/10 border-red-400/20" : urgent ? "bg-orange-400/10 border-orange-400/20" : "bg-white/4 border-white/5")}>
                  <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1.5">Còn lại</p>
                  <p className={cn("text-xs font-bold font-mono", critical ? "text-red-400" : urgent ? "text-orange-400" : "text-white")}>
                    {timeLeft}
                  </p>
                  {critical && <p className="text-[8px] font-mono text-red-400/60 mt-0.5">⚠ Sắp hết!</p>}
                </div>
                <div className="bg-white/4 border border-white/5 rounded-xl p-3 text-center">
                  <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1.5">Lượt đặt</p>
                  <p className="text-sm font-bold font-mono text-white">{auction.bids.length}</p>
                  <p className="text-[8px] font-mono text-muted-foreground/25 mt-0.5">{auction.watchers} xem</p>
                </div>
              </div>

              {/* Quick bid amounts */}
              <div>
                <p className="text-[9px] font-mono text-muted-foreground/35 mb-2 uppercase tracking-widest">Chọn nhanh</p>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_BIDS.map((v, i) => (
                    <button key={v} onClick={() => setBidAmount(v)}
                      className={cn("py-2 rounded-xl text-[10px] font-mono font-bold border transition-all",
                        bidAmount === v
                          ? cn(rc.border, rc.bg, rc.text)
                          : "border-white/8 text-muted-foreground/50 hover:text-white hover:border-white/18",
                      )}>
                      {i === 0 ? "Tối thiểu" : i === 1 ? "+2× step" : "+5× step"}
                      <br />
                      <span className="text-[9px] font-mono opacity-80">{fmtCR(v)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom amount input */}
              <div>
                <p className="text-[9px] font-mono text-muted-foreground/35 mb-1.5 uppercase tracking-widest">Hoặc nhập số tiền tuỳ chỉnh</p>
                <div className="relative">
                  <input
                    type="number" value={bidAmount} min={minBid}
                    onChange={e => setBidAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white/4 border border-white/10 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-amber-400/40 text-sm transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground/35">CR</span>
                </div>
                {bidAmount < minBid && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-[9px] font-mono text-orange-400 mt-1.5">
                    <AlertTriangle className="w-3 h-3" />Tối thiểu {fmtCR(minBid)} (tăng {fmtCR(auction.minIncrement)}/lượt)
                  </motion.p>
                )}
              </div>

              {/* Buy now */}
              {auction.buyNowPrice && (
                <div className="flex items-center justify-between px-4 py-3 bg-emerald-400/5 border border-emerald-400/20 rounded-xl">
                  <div>
                    <p className="text-[9px] font-mono text-emerald-400/60">Mua ngay – bỏ qua đấu giá</p>
                    <p className="text-sm font-bold font-mono text-emerald-400">{fmtCR(auction.buyNowPrice)}</p>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-emerald-400/15 border border-emerald-400/30 text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-400/25 transition-all flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />Mua ngay
                  </button>
                </div>
              )}

              {/* Place bid button */}
              <button
                onClick={handlePlace} disabled={bidAmount < minBid}
                className={cn(
                  "w-full py-3 rounded-xl font-bold text-sm font-mono uppercase tracking-widest transition-all border flex items-center justify-center gap-2",
                  bidAmount >= minBid
                    ? cn(rc.border, rc.bg, rc.text, "hover:brightness-120 active:scale-[0.98]")
                    : "opacity-35 cursor-not-allowed border-white/10 text-muted-foreground/40",
                )}
              >
                <Gavel className="w-4 h-4" />
                Đặt giá {bidAmount >= minBid ? fmtCR(bidAmount) : ""}
              </button>

              {/* Bid history */}
              {auction.bids.length > 0 && (
                <div>
                  <p className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest mb-2">Lịch sử đặt giá</p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {auction.bids.map((bid, i) => (
                      <div key={i} className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg border",
                        i === 0 ? "bg-amber-400/10 border-amber-400/20" : "bg-white/3 border-white/5",
                      )}>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-mono font-bold", i === 0 ? "bg-amber-400/20 text-amber-400" : "bg-white/10 text-muted-foreground/50")}>
                            {bid.avatar}
                          </div>
                          <span className={cn("text-[10px] font-mono font-bold", i === 0 ? "text-amber-400" : "text-muted-foreground/55")}>{bid.bidder}</span>
                          {i === 0 && <span className="text-[7px] font-mono bg-amber-400/15 text-amber-400 border border-amber-400/25 px-1 py-0.5 rounded uppercase tracking-widest">Top</span>}
                        </div>
                        <span className={cn("text-[10px] font-mono font-bold", i === 0 ? "text-amber-400" : "text-white/50")}>{fmtCR(bid.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Confirm phase ── */}
          {phase === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-5 space-y-4">
              <div className="glass-panel rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
                <p className="text-xs font-bold text-amber-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Gavel className="w-3.5 h-3.5" /> Xác nhận đặt giá
                </p>
                <div className="space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between text-muted-foreground/55">
                    <span>Vật phẩm</span>
                    <span className="text-white font-bold truncate max-w-[160px] text-right">{auction.name}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground/55">
                    <span>Bid hiện tại</span>
                    <span className={cn("font-bold", rc.text)}>{fmtCR(auction.currentBid)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground/55">
                    <span>Bid của bạn</span>
                    <span className="text-white font-bold">{fmtCR(bidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground/55">
                    <span>Tăng so với hiện tại</span>
                    <span className="text-emerald-400 font-bold">+{fmtCR(bidAmount - auction.currentBid)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between">
                    <span className="text-white font-bold">Số dư sẽ bị giữ</span>
                    <span className="text-amber-400 font-bold">{fmtCR(bidAmount)}</span>
                  </div>
                </div>
              </div>
              <p className="text-[9px] font-mono text-muted-foreground/30 text-center">Đây là giao dịch mô phỏng – không có tiền thật được sử dụng.</p>
              <div className="flex gap-2">
                <button onClick={() => setPhase("input")} className="flex-1 py-2.5 rounded-xl border border-white/10 text-muted-foreground/50 hover:text-white text-xs font-mono uppercase font-bold tracking-wider transition-all">
                  Quay lại
                </button>
                <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-xl border border-amber-400/40 bg-amber-400/15 text-amber-400 hover:bg-amber-400/25 text-xs font-mono uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2">
                  <Gavel className="w-3.5 h-3.5" /> Xác nhận
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Placing phase ── */}
          {phase === "placing" && (
            <motion.div key="placing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-full border-2 border-amber-400/20 border-t-amber-400"
              />
              <p className="text-xs font-mono text-muted-foreground/45 uppercase tracking-widest">Đang đặt giá...</p>
            </motion.div>
          )}

          {/* ── Done phase ── */}
          {phase === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 flex flex-col items-center gap-4">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="w-16 h-16 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center"
              >
                <Trophy className="w-8 h-8 text-amber-400" />
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">Đặt giá thành công!</p>
                <p className="text-xs font-mono text-amber-400 font-bold mt-0.5">{fmtCR(bidAmount)}</p>
                <p className="text-[10px] font-mono text-muted-foreground/40 mt-1">Bạn đang dẫn đầu. Chúc may mắn!</p>
              </div>
              <button onClick={onClose} className="px-6 py-2 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider hover:bg-amber-400/20 transition-all">
                Đóng
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Countdown display ────────────────────────────────────────────────────────

function Countdown({ endTime, compact = false }: { endTime: string; compact?: boolean }) {
  const { label, urgent, critical } = useCountdown(endTime);
  return (
    <span className={cn(
      "flex items-center gap-1 font-mono font-bold",
      compact ? "text-[9px]" : "text-[10px]",
      critical ? "text-red-400" : urgent ? "text-orange-400" : "text-muted-foreground/50",
    )}>
      <Clock className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
      {label}
    </span>
  );
}

// ─── Auction Card ─────────────────────────────────────────────────────────────

function AuctionCard({ auction, index, onBid, watched, onToggleWatch }: {
  auction: Auction;
  index: number;
  onBid: () => void;
  watched: boolean;
  onToggleWatch: (e: React.MouseEvent) => void;
}) {
  const rc = RARITY_COLORS[auction.rarity];
  const cm = CATEGORY_META_MARKET[auction.category];
  const { urgent, critical } = useCountdown(auction.endTime);
  const pctAboveStart = Math.round(((auction.currentBid - auction.startPrice) / auction.startPrice) * 100);
  const barWidth = Math.min(100, ((auction.currentBid - auction.startPrice) / (auction.startPrice * 0.5)) * 100);
  const barColor = RARITY_BAR_COLOR[auction.rarity];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 8) * 0.05 }}
      className={cn(
        "glass-panel rounded-2xl border p-5 flex flex-col gap-3.5 group cursor-pointer",
        "hover:-translate-y-1 transition-all duration-300 relative overflow-hidden",
        rc.border, rc.glow,
      )}
    >
      {/* Hover bg glow */}
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl", rc.bg)} />

      {/* Critical pulsing ring */}
      {critical && <div className="absolute inset-0 rounded-2xl border-2 border-red-400/40 animate-pulse pointer-events-none" />}

      <div className="relative z-10 flex flex-col gap-3.5 h-full">
        {/* Header: image + name + timer */}
        <div className="flex items-start gap-3">
          <div className={cn("w-13 h-13 rounded-xl border-2 flex items-center justify-center text-2xl flex-shrink-0 w-12 h-12", rc.bg, rc.border)}>
            {auction.image}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              {auction.isHot && <Flame className="w-3 h-3 text-orange-400 flex-shrink-0" />}
              <span className={cn("text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full border", rc.text, rc.bg, rc.border)}>
                {RARITY_LABELS[auction.rarity]}
              </span>
              <span className={cn("text-[8px] font-mono", cm.color)}>{cm.icon} {cm.label}</span>
            </div>
            <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight group-hover:text-amber-200 transition-colors">
              {auction.name}
            </p>
          </div>
          <Countdown endTime={auction.endTime} compact />
        </div>

        {/* Current bid + stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2 bg-white/4 border border-white/5 rounded-xl p-3">
            <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1">Bid hiện tại</p>
            <p className={cn("text-base font-bold font-mono leading-none", rc.text)}>{fmtCR(auction.currentBid)}</p>
            <p className="text-[8px] font-mono text-muted-foreground/25 mt-1">Bắt đầu: {fmtCR(auction.startPrice)}</p>
          </div>
          <div className="bg-white/4 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-1">
            <Users className="w-3.5 h-3.5 text-muted-foreground/35" />
            <p className="text-xs font-bold font-mono text-white">{auction.watchers}</p>
            <p className="text-[8px] font-mono text-muted-foreground/30">theo dõi</p>
          </div>
        </div>

        {/* Bid progress */}
        <div>
          <div className="flex justify-between text-[8px] font-mono text-muted-foreground/30 mb-1.5">
            <span>{auction.bids.length} lượt đặt</span>
            <span className="text-emerald-400/70">+{pctAboveStart}% so với khởi điểm</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${barWidth}%` }}
              transition={{ delay: Math.min(index, 8) * 0.05 + 0.3, duration: 0.7, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: barColor }}
            />
          </div>
        </div>

        {/* Description */}
        <p className="text-[9px] font-mono text-muted-foreground/40 line-clamp-2 flex-1">{auction.description}</p>

        {/* Buy now row */}
        {auction.buyNowPrice && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-400/5 border border-emerald-400/15">
            <p className="text-[9px] font-mono text-emerald-400/60">Mua ngay</p>
            <p className="text-[10px] font-bold font-mono text-emerald-400">{fmtCR(auction.buyNowPrice)}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={onBid}
            className={cn("flex-1 py-2.5 rounded-xl font-bold text-[11px] font-mono uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5", rc.border, rc.bg, rc.text, "hover:brightness-120 active:scale-[0.98]")}
          >
            <Gavel className="w-3.5 h-3.5" />Đặt giá
          </button>
          <button
            onClick={onToggleWatch}
            title={watched ? "Bỏ theo dõi" : "Theo dõi"}
            className={cn(
              "px-3 py-2.5 rounded-xl border text-[11px] font-mono font-bold transition-all flex items-center justify-center",
              watched
                ? "border-rose-400/40 bg-rose-400/15 text-rose-400"
                : "border-white/10 text-muted-foreground/30 hover:border-rose-400/30 hover:bg-rose-400/8 hover:text-rose-400",
            )}
          >
            <Heart className={cn("w-3.5 h-3.5", watched && "fill-rose-400")} />
          </button>
          {auction.buyNowPrice && (
            <button className="px-3 py-2.5 rounded-xl border border-emerald-400/20 bg-emerald-400/8 text-emerald-400 text-[9px] font-mono font-bold hover:bg-emerald-400/20 transition-all whitespace-nowrap">
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Top bidder */}
        {auction.bids.length > 0 && (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/3 border border-white/5">
            <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center text-[8px] font-mono font-bold text-amber-400">
              {auction.bids[0].avatar}
            </div>
            <span className="text-[9px] font-mono text-muted-foreground/45">
              Top bid: <span className="text-amber-400 font-bold">{auction.bids[0].bidder}</span>
            </span>
            <span className="ml-auto text-[9px] font-mono text-amber-400 font-bold">{fmtCR(auction.bids[0].amount)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all",
        active ? "bg-amber-400/15 border-amber-400/35 text-amber-400" : "border-white/8 text-muted-foreground/40 hover:text-white hover:border-white/18",
      )}
    >
      {label}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Auctions() {
  const [tab, setTab]         = useState<Tab>("all");
  const [search, setSearch]   = useState("");
  const [cat, setCat]         = useState<"all" | ListingCategory>("all");
  const [rarity, setRarity]   = useState<"all" | MarketRarity>("all");
  const [sort, setSort]       = useState<SortKey>("endTime");
  const [panelOpen, setPanelOpen] = useState(true);
  const [selected, setSelected]   = useState<Auction | null>(null);
  const [bids, setBids] = useState<Record<string, number>>({});

  const { isWatched, toggle } = useWatchlist();

  const handleWatchToggle = useCallback((auction: Auction, e: React.MouseEvent) => {
    e.stopPropagation();
    void toggle("auction", auction.id, {
      itemName: auction.name,
      price:    auction.currentBid,
      rarity:   auction.rarity,
      status:   auction.status,
    });
  }, [toggle]);

  // Merge mock bid amounts
  const auctions = useMemo(() =>
    AUCTIONS.map(a => bids[a.id] ? { ...a, currentBid: bids[a.id] } : a),
    [bids],
  );

  const handleBidPlaced = useCallback((id: string, amount: number) => {
    setBids(prev => ({ ...prev, [id]: amount }));
  }, []);

  // Derived stats (live-friendly)
  const totalBidValue = auctions.reduce((s, a) => s + a.currentBid, 0);
  const endingSoon    = auctions.filter(a => {
    const diff = new Date(a.endTime).getTime() - Date.now();
    return diff > 0 && diff < 6 * 3_600_000;
  });
  const totalWatchers = auctions.reduce((s, a) => s + a.watchers, 0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let items = auctions.filter(a => {
      // Tab filter
      if (tab === "ending") {
        const diff = new Date(a.endTime).getTime() - Date.now();
        if (diff > 6 * 3_600_000 || diff <= 0) return false;
      }
      if (tab === "highest") {/* sorted separately */}
      // Category
      if (cat !== "all" && a.category !== cat) return false;
      // Rarity
      if (rarity !== "all" && a.rarity !== rarity) return false;
      // Search
      if (q && !a.name.toLowerCase().includes(q) && !a.seller.toLowerCase().includes(q) && !a.description.toLowerCase().includes(q)) return false;
      return true;
    });
    // Sort
    items.sort((a, b) => {
      if (sort === "endTime")        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      if (sort === "currentBid_desc") return b.currentBid - a.currentBid;
      if (sort === "currentBid_asc") return a.currentBid - b.currentBid;
      if (sort === "bids")           return b.bids.length - a.bids.length;
      if (sort === "watchers")       return b.watchers - a.watchers;
      return 0;
    });
    // For "highest" tab, override sort
    if (tab === "highest") items.sort((a, b) => b.currentBid - a.currentBid);
    return items;
  }, [auctions, tab, cat, rarity, search, sort]);

  const activeFilters = (cat !== "all" ? 1 : 0) + (rarity !== "all" ? 1 : 0) + (search ? 1 : 0);

  const SORT_OPTS: [SortKey, string][] = [
    ["endTime",         "Sắp hết hạn"],
    ["currentBid_desc", "Bid cao nhất"],
    ["currentBid_asc",  "Bid thấp nhất"],
    ["bids",            "Nhiều lượt đặt"],
    ["watchers",        "Nhiều theo dõi"],
  ];

  const TABS: [Tab, string, React.ElementType][] = [
    ["all",     `Tất cả (${auctions.length})`,  Activity],
    ["ending",  `Sắp hết (${endingSoon.length})`, Zap],
    ["highest", "Bid cao nhất",                   Trophy],
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <BG />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">

          {/* ── Page header ─────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-2 h-6 bg-amber-400 rounded-sm shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
                Trung Tâm Đấu Giá
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">
                {filtered.length} / {auctions.length} PHIÊN · {auctions.filter(a => a.isHot).length} HOT · {endingSoon.length} SẮP HẾT
              </p>
            </div>
            <div className="flex items-center gap-1.5 glass-panel border border-amber-400/15 rounded-xl p-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-2" />
              <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-widest pr-2">LIVE</span>
            </div>
          </motion.div>

          {/* ── KPI cards ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Phiên đang mở",   value: String(auctions.length),             sub: `${auctions.filter(a=>a.isHot).length} phiên nóng`,         color: "text-amber-400",  border: "border-amber-400/20",  icon: Gavel },
              { label: "Tổng giá trị bid", value: totalBidValue >= 1_000_000 ? `${(totalBidValue/1_000_000).toFixed(1)}M CR` : `${(totalBidValue/1000).toFixed(0)}K CR`, sub: `${auctions.length} phiên tổng hợp`, color: "text-emerald-400", border: "border-emerald-400/20", icon: TrendingUp },
              { label: "Đang theo dõi",    value: totalWatchers.toLocaleString(),      sub: "tổng người theo dõi",                                      color: "text-purple-400", border: "border-purple-400/20", icon: Eye },
              { label: "Sắp kết thúc",    value: String(endingSoon.length),           sub: "trong vòng 6 giờ tới",                                     color: "text-orange-400", border: "border-orange-400/20", icon: Clock },
            ].map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className={cn("glass-panel rounded-2xl border p-4 flex items-start gap-3", k.border)}>
                <div className={cn("p-2.5 rounded-xl border flex-shrink-0", k.border, "bg-white/4")}>
                  <k.icon className={cn("w-4 h-4", k.color)} />
                </div>
                <div>
                  <p className={cn("text-xl font-bold font-mono leading-none", k.color)}>{k.value}</p>
                  <p className="text-[9px] font-mono text-muted-foreground/35 uppercase tracking-widest mt-1">{k.label}</p>
                  <p className="text-[9px] font-mono text-muted-foreground/25 mt-0.5">{k.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Tabs ────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-1 glass-panel border border-white/5 rounded-xl p-1 w-fit">
            {TABS.map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-mono font-bold uppercase tracking-widest transition-all",
                  tab === key
                    ? "bg-amber-400/20 border border-amber-400/30 text-amber-400"
                    : "text-muted-foreground/40 hover:text-white",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Filters ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPanelOpen(o => !o)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-mono font-bold uppercase transition-all",
                panelOpen ? "border-amber-400/30 bg-amber-400/10 text-amber-400" : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/18",
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Bộ lọc
              {activeFilters > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-black text-[8px] font-bold flex items-center justify-center">{activeFilters}</span>
              )}
              {panelOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {/* Inline sort for non-highest tabs */}
            {tab !== "highest" && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <ArrowUpDown className="w-3 h-3 text-muted-foreground/30" />
                {SORT_OPTS.map(([k, l]) => (
                  <button key={k} onClick={() => setSort(k)}
                    className={cn("px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all",
                      sort === k ? "bg-amber-400/15 border-amber-400/30 text-amber-400" : "border-white/8 text-muted-foreground/35 hover:text-white hover:border-white/15"
                    )}>
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          <AnimatePresence>
            {panelOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="glass-panel rounded-xl border border-white/5 p-4 space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Tìm theo tên, người bán, mô tả..."
                      className="w-full pl-9 pr-8 py-2.5 bg-white/4 border border-white/8 rounded-lg text-xs text-white placeholder:text-muted-foreground/25 focus:outline-none focus:border-amber-400/40 font-mono transition-colors"
                    />
                    {search && (
                      <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-white transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] font-mono text-muted-foreground/30 uppercase w-16 flex-shrink-0">Danh mục</span>
                      <Chip label="Tất cả" active={cat === "all"} onClick={() => setCat("all")} />
                      {(["pets","football","world-assets","tickets","items"] as ListingCategory[]).map(c => (
                        <Chip key={c} label={CATEGORY_META_MARKET[c].label} active={cat === c} onClick={() => setCat(c)} />
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] font-mono text-muted-foreground/30 uppercase w-16 flex-shrink-0">Độ hiếm</span>
                      <Chip label="Tất cả" active={rarity === "all"} onClick={() => setRarity("all")} />
                      {(["rare","epic","legendary","mythic"] as MarketRarity[]).map(r => (
                        <Chip key={r} label={RARITY_LABELS[r]} active={rarity === r} onClick={() => setRarity(r)} />
                      ))}
                    </div>
                  </div>

                  {activeFilters > 0 && (
                    <div className="pt-2 border-t border-white/5">
                      <button
                        onClick={() => { setSearch(""); setCat("all"); setRarity("all"); }}
                        className="text-[9px] font-mono text-muted-foreground/40 hover:text-red-400 border border-white/8 hover:border-red-400/30 px-2.5 py-1 rounded-lg transition-all uppercase tracking-wider"
                      >
                        Xóa tất cả bộ lọc
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Tab label ───────────────────────────────────────────────── */}
          {tab === "ending" && endingSoon.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 px-4 py-3 glass-panel rounded-xl border border-orange-400/20 bg-orange-400/5">
              <Zap className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <p className="text-xs font-mono text-orange-400 font-bold">{endingSoon.length} phiên sẽ kết thúc trong vòng 6 giờ tới — hành động ngay!</p>
            </motion.div>
          )}
          {tab === "highest" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 px-4 py-3 glass-panel rounded-xl border border-amber-400/20 bg-amber-400/5">
              <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-xs font-mono text-amber-400 font-bold">Xếp theo giá bid hiện tại — từ cao nhất đến thấp nhất</p>
            </motion.div>
          )}

          {/* ── Auction grid ─────────────────────────────────────────────── */}
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-xl border border-white/5 p-16 text-center">
              <Gavel className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-xs font-mono text-muted-foreground/30 tracking-widest uppercase">
                {tab === "ending" ? "Không có phiên nào sắp kết thúc" : "Không tìm thấy phiên đấu giá"}
              </p>
              <button onClick={() => { setSearch(""); setCat("all"); setRarity("all"); setTab("all"); }}
                className="mt-4 text-[10px] font-mono text-amber-400 hover:text-amber-300 border border-amber-400/20 hover:border-amber-400/40 px-4 py-1.5 rounded-lg transition-all uppercase tracking-wider">
                Xóa bộ lọc
              </button>
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence>
                {filtered.map((a, i) => (
                  <AuctionCard
                    key={a.id}
                    auction={a}
                    index={i}
                    onBid={() => setSelected(a)}
                    watched={isWatched("auction", a.id)}
                    onToggleWatch={(e) => handleWatchToggle(a, e)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

        </main>
      </div>

      {/* ── Bid Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <BidModal
            auction={auctions.find(a => a.id === selected.id) ?? selected}
            onClose={() => setSelected(null)}
            onBidPlaced={handleBidPlaced}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
