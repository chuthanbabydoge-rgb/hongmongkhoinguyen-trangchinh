import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  AUCTIONS, RARITY_COLORS, RARITY_LABELS, CATEGORY_META_MARKET,
  type Auction,
} from "@/lib/marketplaceMockData";
import { cn } from "@/lib/utils";
import {
  Gavel, Clock, Flame, Eye, TrendingUp, X, Users,
  ChevronUp, AlertTriangle, Zap, ShoppingBag,
} from "lucide-react";

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/8 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-[120px]" />
  </div>
);

const fmtCR = (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M CR` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K CR` : `${v.toLocaleString("vi-VN")} CR`;

function useCountdown(endTime: string) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  useEffect(() => {
    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Đã kết thúc"); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setIsUrgent(diff < 3 * 3_600_000);
      if (h >= 24) setTimeLeft(`${Math.floor(h / 24)}n ${h % 24}g`);
      else if (h > 0) setTimeLeft(`${h}g ${m}p ${s}s`);
      else setTimeLeft(`${m}p ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return { timeLeft, isUrgent };
}

// ─── Bid Modal ────────────────────────────────────────────────────────────────
function BidModal({ auction, onClose }: { auction: Auction; onClose: () => void }) {
  const rc = RARITY_COLORS[auction.rarity];
  const { timeLeft, isUrgent } = useCountdown(auction.endTime);
  const [bidAmount, setBidAmount] = useState(auction.currentBid + auction.minIncrement);
  const minBid = auction.currentBid + auction.minIncrement;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className={cn("glass-panel rounded-2xl border w-full max-w-lg overflow-hidden", rc.border, rc.glow)}>
        {/* Header */}
        <div className={cn("p-5 border-b border-white/5 relative", rc.bg)}>
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg border border-white/10 hover:border-white/30 text-muted-foreground/50 hover:text-white transition-all"><X className="w-4 h-4" /></button>
          <div className="flex items-start gap-4 pr-8">
            <div className={cn("w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl flex-shrink-0", rc.bg, rc.border)}>{auction.image}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border", rc.text, rc.bg, rc.border)}>{RARITY_LABELS[auction.rarity]}</span>
                {auction.isHot && <span className="flex items-center gap-1 text-[9px] font-mono text-orange-400 bg-orange-400/10 border border-orange-400/20 px-1.5 py-0.5 rounded-full"><Flame className="w-2.5 h-2.5" />HOT</span>}
              </div>
              <h2 className="text-sm font-bold text-white">{auction.name}</h2>
              <p className="text-[9px] font-mono text-muted-foreground/40 mt-0.5">Người bán: {auction.seller}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Timer + current bid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
              <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1">Bid hiện tại</p>
              <p className={cn("text-sm font-bold font-mono", rc.text)}>{fmtCR(auction.currentBid)}</p>
            </div>
            <div className={cn("rounded-xl p-3 text-center border", isUrgent ? "bg-orange-400/10 border-orange-400/20" : "bg-white/5 border-white/5")}>
              <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1">Còn lại</p>
              <p className={cn("text-xs font-bold font-mono", isUrgent ? "text-orange-400" : "text-white")}>{timeLeft}</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
              <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1">Số lượt bid</p>
              <p className="text-sm font-bold font-mono text-white">{auction.bids.length}</p>
            </div>
          </div>

          {/* Bid input */}
          <div>
            <p className="text-[9px] font-mono text-muted-foreground/40 mb-2">Số tiền đặt giá (tối thiểu {fmtCR(minBid)})</p>
            <div className="relative">
              <input type="number" value={bidAmount} onChange={e => setBidAmount(Number(e.target.value))} min={minBid}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-amber-400/40 text-sm" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground/40">CR</span>
            </div>
            <div className="flex gap-2 mt-2">
              {[minBid, minBid + 10000, minBid + 50000].map(v => (
                <button key={v} onClick={() => setBidAmount(v)} className="flex-1 py-1.5 text-[9px] font-mono text-muted-foreground/50 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all">{fmtCR(v)}</button>
              ))}
            </div>
          </div>

          {/* Warning */}
          {bidAmount < minBid && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-orange-400 bg-orange-400/10 border border-orange-400/20 rounded-xl p-3">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />Số tiền đặt phải ít nhất {fmtCR(minBid)}
            </div>
          )}

          {/* Buy now */}
          {auction.buyNowPrice && (
            <div className="flex items-center justify-between px-4 py-3 bg-emerald-400/5 border border-emerald-400/20 rounded-xl">
              <div>
                <p className="text-[9px] font-mono text-emerald-400/70">Mua ngay không cần đấu giá</p>
                <p className="text-sm font-bold font-mono text-emerald-400">{fmtCR(auction.buyNowPrice)}</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-emerald-400/20 border border-emerald-400/30 text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-400/30 transition-all">
                <ShoppingBag className="w-3.5 h-3.5 inline mr-1" />Mua ngay
              </button>
            </div>
          )}

          <button disabled={bidAmount < minBid}
            className={cn("w-full py-3 rounded-xl font-bold text-sm font-mono uppercase tracking-widest transition-all border", rc.border, bidAmount >= minBid ? cn(rc.bg, rc.text, "hover:brightness-110") : "opacity-40 cursor-not-allowed border-white/10 text-muted-foreground/40")}>
            <Gavel className="w-4 h-4 inline mr-2" />Đặt giá {bidAmount >= minBid ? fmtCR(bidAmount) : ""}
          </button>

          {/* Bid history */}
          <div>
            <p className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest mb-2">Lịch sử đặt giá</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {auction.bids.map((bid, i) => (
                <div key={i} className={cn("flex items-center justify-between px-3 py-2 rounded-lg border", i === 0 ? "bg-amber-400/10 border-amber-400/20" : "bg-white/3 border-white/5")}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-mono font-bold text-white">{bid.avatar}</div>
                    <span className={cn("text-[10px] font-mono font-bold", i === 0 ? "text-amber-400" : "text-muted-foreground/60")}>{bid.bidder}</span>
                    {i === 0 && <span className="text-[8px] font-mono text-amber-400 bg-amber-400/10 px-1 rounded">TOP</span>}
                  </div>
                  <span className={cn("text-[10px] font-mono font-bold", i === 0 ? "text-amber-400" : "text-white/60")}>{fmtCR(bid.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Auction Card ─────────────────────────────────────────────────────────────
function AuctionCard({ auction, index, onBid }: { auction: Auction; index: number; onBid: () => void }) {
  const rc = RARITY_COLORS[auction.rarity];
  const cm = CATEGORY_META_MARKET[auction.category];
  const { timeLeft, isUrgent } = useCountdown(auction.endTime);
  const progress = Math.min(((auction.currentBid - auction.startPrice) / (auction.startPrice * 0.5)) * 100, 100);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
      className={cn("glass-panel rounded-2xl border p-5 flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden", rc.border, rc.glow)}>
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl", rc.bg)} />
      <div className="relative z-10 flex flex-col gap-4 h-full">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl", rc.bg, rc.border)}>{auction.image}</div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                {auction.isHot && <Flame className="w-3 h-3 text-orange-400" />}
                <span className={cn("text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border", rc.text, rc.bg, rc.border)}>{RARITY_LABELS[auction.rarity]}</span>
              </div>
              <p className="text-xs font-bold text-white line-clamp-2 leading-tight">{auction.name}</p>
              <p className={cn("text-[9px] font-mono mt-0.5", cm.color)}>{cm.icon} {cm.label}</p>
            </div>
          </div>
          <div className={cn("flex items-center gap-1 text-[9px] font-mono px-2 py-1 rounded-lg border", isUrgent ? "text-orange-400 bg-orange-400/10 border-orange-400/20" : "text-muted-foreground/40 bg-white/5 border-white/5")}>
            <Clock className="w-3 h-3" />{timeLeft}
          </div>
        </div>

        {/* Price */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2 bg-white/5 border border-white/5 rounded-xl p-3">
            <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1">Bid hiện tại</p>
            <p className={cn("text-lg font-bold font-mono", rc.text)}>{fmtCR(auction.currentBid)}</p>
            <p className="text-[8px] font-mono text-muted-foreground/30">Bắt đầu: {fmtCR(auction.startPrice)}</p>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center">
            <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1">Theo dõi</p>
            <Users className="w-3.5 h-3.5 text-muted-foreground/40 mb-0.5" />
            <p className="text-xs font-bold text-white">{auction.watchers}</p>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-[8px] font-mono text-muted-foreground/30 mb-1.5">
            <span>{auction.bids.length} lượt đặt</span>
            <span>+{Math.round(((auction.currentBid - auction.startPrice) / auction.startPrice) * 100)}% so với khởi điểm</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ delay: index * 0.07 + 0.3, duration: 0.8 }}
              className={cn("h-full rounded-full", rc.text.replace("text-", "bg-"))} style={{ background: rc.text.includes("amber") ? "#fbbf24" : rc.text.includes("rose") ? "#fb7185" : rc.text.includes("purple") ? "#c084fc" : rc.text.includes("blue") ? "#60a5fa" : "#9ca3af" }} />
          </div>
        </div>

        {/* Description */}
        <p className="text-[9px] font-mono text-muted-foreground/40 line-clamp-2">{auction.description}</p>

        {/* Buy now + bid */}
        <div className="flex gap-2 mt-auto">
          <button onClick={onBid} className={cn("flex-1 py-2.5 rounded-xl font-bold text-xs font-mono uppercase tracking-widest border transition-all", rc.border, rc.bg, rc.text, "hover:brightness-110")}>
            <Gavel className="w-3.5 h-3.5 inline mr-1.5" />Đặt giá
          </button>
          {auction.buyNowPrice && (
            <button className="px-3 py-2.5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 text-[10px] font-mono font-bold hover:bg-emerald-400/20 transition-all whitespace-nowrap">
              <ShoppingBag className="w-3.5 h-3.5 inline mr-1" />{fmtCR(auction.buyNowPrice)}
            </button>
          )}
        </div>

        {/* Top bidder */}
        {auction.bids.length > 0 && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/3 border border-white/5">
            <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center text-[8px] font-mono font-bold text-amber-400">{auction.bids[0].avatar}</div>
            <span className="text-[9px] font-mono text-muted-foreground/50">Top bid: <span className="text-amber-400 font-bold">{auction.bids[0].bidder}</span></span>
            <span className="ml-auto text-[9px] font-mono text-amber-400 font-bold">{fmtCR(auction.bids[0].amount)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Auctions() {
  const [filter, setFilter] = useState<"all" | "hot" | "ending">("all");
  const [selected, setSelected] = useState<Auction | null>(null);

  const filtered = AUCTIONS.filter(a => {
    if (filter === "hot") return a.isHot;
    if (filter === "ending") return new Date(a.endTime).getTime() - Date.now() < 6 * 3_600_000;
    return true;
  });

  const totalCurrentBids = AUCTIONS.reduce((s, a) => s + a.currentBid, 0);

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <BG />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-2 h-6 bg-amber-400 rounded-sm shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
                Đấu giá
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">{AUCTIONS.length} PHIÊN ĐANG MỞ · {AUCTIONS.filter(a => a.isHot).length} HOT</p>
            </div>
            <div className="flex items-center gap-2">
              {[["all","Tất cả"],["hot","🔥 Hot"],["ending","⏱ Sắp hết"]].map(([k,l]) => (
                <button key={k} onClick={() => setFilter(k as any)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all", filter === k ? "bg-amber-400/20 border-amber-400/40 text-amber-400" : "border-white/10 text-muted-foreground/40 hover:text-white")}>{l}</button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Phiên đang mở", value: String(AUCTIONS.length), color: "text-amber-400", border: "border-amber-400/20" },
              { label: "Tổng giá trị bid", value: totalCurrentBids >= 1_000_000 ? `${(totalCurrentBids/1_000_000).toFixed(1)}M CR` : `${(totalCurrentBids/1_000).toFixed(0)}K CR`, color: "text-emerald-400", border: "border-emerald-400/20" },
              { label: "Đang theo dõi", value: AUCTIONS.reduce((s,a)=>s+a.watchers,0).toLocaleString(), color: "text-purple-400", border: "border-purple-400/20" },
              { label: "Sắp kết thúc", value: String(AUCTIONS.filter(a => new Date(a.endTime).getTime() - Date.now() < 6*3_600_000).length), color: "text-orange-400", border: "border-orange-400/20" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className={cn("glass-panel rounded-2xl border p-4", s.border)}>
                <p className={cn("text-2xl font-bold font-mono", s.color)}>{s.value}</p>
                <p className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((a, i) => <AuctionCard key={a.id} auction={a} index={i} onBid={() => setSelected(a)} />)}
          </div>
        </main>
      </div>
      <AnimatePresence>{selected && <BidModal auction={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </div>
  );
}
