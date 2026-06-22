import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  RICH_TRADES, RARITY_COLORS, RARITY_LABELS, CATEGORY_META_MARKET,
  CURRENT_USER, CURRENT_AVATAR,
  type RichTrade, type TradeItem, type MarketRarity, type ListingCategory,
} from "@/lib/marketplaceMockData";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight, Search, SlidersHorizontal, X, Plus,
  CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp,
  Send, Package, Eye, AlertTriangle, RotateCcw, Inbox,
  TrendingUp, Handshake, ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab        = "all" | "open" | "sent" | "completed";
type TradeStatus = RichTrade["status"];
type SortKey    = "date_desc" | "date_asc" | "value_desc" | "value_asc";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtCR  = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M CR`
  : v >= 1_000   ? `${(v / 1_000).toFixed(0)}K CR`
  : `${v} CR`;

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("vi-VN");

const STATUS_META: Record<TradeStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  pending:   { label: "Đang chờ",    color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/25",   icon: Clock },
  accepted:  { label: "Đã chấp nhận",color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/25", icon: CheckCircle2 },
  declined:  { label: "Đã từ chối",  color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/25",     icon: XCircle },
  cancelled: { label: "Đã huỷ",      color: "text-gray-400",    bg: "bg-gray-400/10",    border: "border-gray-400/10",    icon: RotateCcw },
  expired:   { label: "Hết hạn",     color: "text-orange-400",  bg: "bg-orange-400/10",  border: "border-orange-400/25",  icon: AlertTriangle },
};

// ─── Background ───────────────────────────────────────────────────────────────

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-900/7 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.022]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-[130px]" />
  </div>
);

// ─── Item Preview ─────────────────────────────────────────────────────────────

function ItemChip({ item, side }: { item: TradeItem; side: "offered" | "requested" }) {
  const rc = RARITY_COLORS[item.rarity];
  const cm = CATEGORY_META_MARKET[item.category];
  return (
    <div className={cn("flex flex-col gap-2 p-3 rounded-xl border flex-1 min-w-0", rc.bg, rc.border)}>
      <div className="flex items-center gap-2">
        <div className={cn("w-10 h-10 rounded-lg border flex items-center justify-center text-xl flex-shrink-0", rc.bg, rc.border)}>
          {item.image}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-white line-clamp-2 leading-tight">{item.name}</p>
          <p className={cn("text-[8px] font-mono mt-0.5", cm.color)}>{cm.icon} {cm.label}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={cn("text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full border", rc.text, rc.bg, rc.border)}>
          {RARITY_LABELS[item.rarity]}
        </span>
        <span className={cn("text-[9px] font-mono font-bold", rc.text)}>{fmtCR(item.value)}</span>
      </div>
    </div>
  );
}

// ─── Trade Card ───────────────────────────────────────────────────────────────

function TradeCard({ trade, onView, onAccept, onDecline }: {
  trade: RichTrade;
  onView: () => void;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const sm    = STATUS_META[trade.status];
  const isOpen = trade.status === "pending" && trade.to === CURRENT_USER;
  const iSent  = trade.status === "pending" && trade.from === CURRENT_USER;
  const valueDelta = trade.offered.value - trade.requested.value;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-panel rounded-2xl border p-4 flex flex-col gap-3 group hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden",
        isOpen ? "border-cyan-400/25 shadow-[0_0_16px_rgba(34,211,238,0.1)]" : "border-white/8",
      )}
    >
      {/* Glowing top edge for open trades */}
      {isOpen && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />}

      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-muted-foreground/35 font-bold">{trade.id}</span>
          {isOpen && (
            <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-cyan-400/15 border border-cyan-400/25 text-cyan-400 flex items-center gap-1">
              <Inbox className="w-2 h-2" />NHẬN ĐƯỢC
            </span>
          )}
          {iSent && (
            <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-blue-400/15 border border-blue-400/25 text-blue-400 flex items-center gap-1">
              <Send className="w-2 h-2" />ĐÃ GỬI
            </span>
          )}
        </div>
        <span className={cn("text-[8px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1", sm.color, sm.bg, sm.border)}>
          <sm.icon className="w-2.5 h-2.5" />{sm.label}
        </span>
      </div>

      {/* Items row */}
      <div className="flex items-stretch gap-2">
        <ItemChip item={trade.offered} side="offered" />
        <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
          <ArrowLeftRight className={cn("w-4 h-4", Math.abs(valueDelta) < 50000 ? "text-emerald-400" : "text-muted-foreground/30")} />
          {Math.abs(valueDelta) >= 50000 && (
            <span className={cn("text-[8px] font-mono font-bold", valueDelta > 0 ? "text-emerald-400" : "text-red-400/70")}>
              {valueDelta > 0 ? "+" : ""}{fmtCR(Math.abs(valueDelta))}
            </span>
          )}
        </div>
        <ItemChip item={trade.requested} side="requested" />
      </div>

      {/* Trader info */}
      <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground/35">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[7px] font-bold text-white">
            {trade.fromAvatar}
          </div>
          <span className={trade.from === CURRENT_USER ? "text-cyan-400 font-bold" : ""}>{trade.from}</span>
          <ArrowRight className="w-2.5 h-2.5" />
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[7px] font-bold text-white">
            {trade.toAvatar}
          </div>
          <span className={trade.to === CURRENT_USER ? "text-cyan-400 font-bold" : ""}>{trade.to}</span>
        </div>
        <span>{fmtDate(trade.createdAt)}</span>
      </div>

      {/* Message */}
      {trade.message && (
        <p className="text-[9px] font-mono text-muted-foreground/45 italic px-2 py-1.5 rounded-lg bg-white/3 border border-white/5 line-clamp-1">
          "{trade.message}"
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button onClick={onView} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 hover:border-white/25 text-muted-foreground/50 hover:text-white text-[10px] font-mono font-bold uppercase tracking-wider transition-all">
          <Eye className="w-3 h-3" />Chi tiết
        </button>
        {isOpen && (
          <>
            <button onClick={onAccept} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 text-[10px] font-mono font-bold uppercase tracking-wider transition-all">
              <CheckCircle2 className="w-3.5 h-3.5" />Chấp nhận
            </button>
            <button onClick={onDecline} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-400/25 bg-red-400/8 text-red-400/80 hover:bg-red-400/15 text-[10px] font-mono font-bold uppercase tracking-wider transition-all">
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </>
        )}
        {iSent && (
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-400/20 text-red-400/60 hover:text-red-400 hover:border-red-400/35 text-[10px] font-mono font-bold uppercase tracking-wider transition-all">
            <RotateCcw className="w-3 h-3" />Huỷ
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Trade Detail Modal ───────────────────────────────────────────────────────

function TradeDetailModal({ trade, onClose, onAccept, onDecline }: {
  trade: RichTrade;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const sm       = STATUS_META[trade.status];
  const isOpen   = trade.status === "pending" && trade.to === CURRENT_USER;
  const valueDiff = trade.offered.value - trade.requested.value;
  const expiresIn = new Date(trade.expiresAt).getTime() - Date.now();
  const daysLeft  = Math.max(0, Math.floor(expiresIn / 86_400_000));
  const hoursLeft = Math.max(0, Math.floor((expiresIn % 86_400_000) / 3_600_000));

  const SideItem = ({ item, label }: { item: TradeItem; label: string }) => {
    const rc = RARITY_COLORS[item.rarity];
    const cm = CATEGORY_META_MARKET[item.category];
    return (
      <div className={cn("flex-1 p-4 rounded-2xl border", rc.bg, rc.border, rc.glow)}>
        <p className="text-[8px] font-mono text-muted-foreground/30 uppercase tracking-widest mb-3">{label}</p>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className={cn("w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl", rc.bg, rc.border)}>
            {item.image}
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">{item.name}</p>
            <p className={cn("text-[9px] font-mono mt-1", cm.color)}>{cm.icon} {cm.label}</p>
          </div>
          <span className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border", rc.text, rc.bg, rc.border)}>
            {RARITY_LABELS[item.rarity]}
          </span>
          <p className={cn("text-base font-bold font-mono", rc.text)}>{fmtCR(item.value)}</p>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="glass-panel rounded-2xl border border-white/10 w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-cyan-400" />Chi tiết giao dịch trao đổi
            </h2>
            <p className="text-[9px] font-mono text-muted-foreground/35 mt-0.5">{trade.id} · {fmtDate(trade.createdAt)}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg border border-white/10 hover:border-white/30 text-muted-foreground/40 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Status bar */}
          <div className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border", sm.bg, sm.border)}>
            <sm.icon className={cn("w-4 h-4 flex-shrink-0", sm.color)} />
            <div className="flex-1">
              <p className={cn("text-xs font-bold font-mono", sm.color)}>{sm.label}</p>
              {trade.status === "pending" && expiresIn > 0 && (
                <p className="text-[9px] font-mono text-muted-foreground/40 mt-0.5">
                  Hết hạn sau: {daysLeft > 0 ? `${daysLeft} ngày ` : ""}{hoursLeft}g
                </p>
              )}
              {trade.status === "pending" && expiresIn <= 0 && (
                <p className="text-[9px] font-mono text-red-400/60 mt-0.5">Đã hết hạn</p>
              )}
            </div>
          </div>

          {/* Items side-by-side */}
          <div className="flex gap-3">
            <SideItem item={trade.offered} label={`${trade.from} đề nghị`} />
            <div className="flex flex-col items-center justify-center gap-2 flex-shrink-0">
              <ArrowLeftRight className="w-5 h-5 text-muted-foreground/30" />
              <span className={cn("text-[9px] font-mono font-bold",
                Math.abs(valueDiff) < 50000 ? "text-emerald-400" : valueDiff > 0 ? "text-emerald-400" : "text-red-400/70")}>
                {Math.abs(valueDiff) < 50000 ? "≈ Ngang giá" : valueDiff > 0 ? `+${fmtCR(valueDiff)}` : `-${fmtCR(Math.abs(valueDiff))}`}
              </span>
            </div>
            <SideItem item={trade.requested} label={`${trade.to} nhận được`} />
          </div>

          {/* Traders */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { role: "Người đề nghị", name: trade.from, avatar: trade.fromAvatar, isYou: trade.from === CURRENT_USER },
              { role: "Người nhận",    name: trade.to,   avatar: trade.toAvatar,   isYou: trade.to   === CURRENT_USER },
            ].map(p => (
              <div key={p.role} className="bg-white/4 border border-white/5 rounded-xl p-3 flex items-center gap-2.5">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0", p.isYou ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30" : "bg-white/10 text-white border border-white/10")}>
                  {p.avatar}
                </div>
                <div>
                  <p className="text-[8px] font-mono text-muted-foreground/30 uppercase">{p.role}</p>
                  <p className={cn("text-[11px] font-bold font-mono", p.isYou ? "text-cyan-400" : "text-white")}>
                    {p.isYou ? "Bạn" : p.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message */}
          {trade.message && (
            <div className="bg-white/4 border border-white/8 rounded-xl p-3">
              <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1.5">Tin nhắn đính kèm</p>
              <p className="text-[10px] font-mono text-muted-foreground/60 italic">"{trade.message}"</p>
            </div>
          )}

          {/* Value summary */}
          <div className="bg-white/4 border border-white/5 rounded-xl p-3">
            <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-2.5">So sánh giá trị</p>
            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="flex justify-between text-muted-foreground/55">
                <span>Giá trị bạn đề nghị</span>
                <span className="text-white font-bold">{fmtCR(trade.offered.value)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground/55">
                <span>Giá trị bạn nhận</span>
                <span className="text-white font-bold">{fmtCR(trade.requested.value)}</span>
              </div>
              <div className="border-t border-white/8 pt-1.5 flex justify-between">
                <span className="text-white font-bold">Chênh lệch</span>
                <span className={cn("font-bold", Math.abs(valueDiff) < 50000 ? "text-emerald-400" : valueDiff > 0 ? "text-emerald-400" : "text-red-400")}>
                  {valueDiff > 0 ? "+" : ""}{fmtCR(valueDiff)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isOpen && (
            <div className="flex gap-2 pt-1">
              <button onClick={onDecline} className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-400/25 text-red-400/80 hover:bg-red-400/10 hover:text-red-400 text-xs font-mono font-bold uppercase tracking-wider transition-all">
                <XCircle className="w-3.5 h-3.5" />Từ chối
              </button>
              <button onClick={onAccept} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-emerald-400/35 bg-emerald-400/15 text-emerald-400 hover:bg-emerald-400/25 text-xs font-mono font-bold uppercase tracking-wider transition-all">
                <CheckCircle2 className="w-3.5 h-3.5" />Chấp nhận giao dịch
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Accept / Decline confirmation modal ─────────────────────────────────────

function ActionModal({ trade, action, onClose, onConfirm }: {
  trade: RichTrade;
  action: "accept" | "decline";
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [phase, setPhase] = useState<"confirm" | "processing" | "done">("confirm");
  const isAccept = action === "accept";

  const handleConfirm = () => {
    setPhase("processing");
    setTimeout(() => { setPhase("done"); onConfirm(); }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget && phase !== "processing") onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className={cn("glass-panel rounded-2xl border w-full max-w-sm overflow-hidden", isAccept ? "border-emerald-400/25" : "border-red-400/20")}
      >
        <AnimatePresence mode="wait">
          {phase === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-4">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mx-auto", isAccept ? "bg-emerald-400/15 border border-emerald-400/25" : "bg-red-400/10 border border-red-400/20")}>
                {isAccept ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
              </div>
              <div className="text-center">
                <h3 className="text-sm font-bold text-white">{isAccept ? "Xác nhận chấp nhận?" : "Xác nhận từ chối?"}</h3>
                <p className="text-[10px] font-mono text-muted-foreground/45 mt-1 leading-relaxed">
                  {isAccept
                    ? `Bạn sẽ nhận "${trade.requested.name}" và trao đi "${trade.offered.name}".`
                    : `Đề nghị từ ${trade.from} sẽ bị từ chối và không thể hoàn tác.`}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-white/10 text-muted-foreground/50 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-all">
                  Huỷ
                </button>
                <button onClick={handleConfirm}
                  className={cn("flex-1 py-2 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                    isAccept ? "border-emerald-400/35 bg-emerald-400/15 text-emerald-400 hover:bg-emerald-400/25"
                             : "border-red-400/25 bg-red-400/10 text-red-400 hover:bg-red-400/20"
                  )}>
                  {isAccept ? <><CheckCircle2 className="w-3.5 h-3.5" />Chấp nhận</> : <><XCircle className="w-3.5 h-3.5" />Từ chối</>}
                </button>
              </div>
            </motion.div>
          )}
          {phase === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 flex flex-col items-center gap-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                className={cn("w-10 h-10 rounded-full border-2 border-t-current", isAccept ? "border-emerald-400/20 text-emerald-400" : "border-red-400/20 text-red-400")} />
              <p className="text-xs font-mono text-muted-foreground/40 uppercase tracking-widest">
                {isAccept ? "Đang xử lý giao dịch..." : "Đang từ chối..."}
              </p>
            </motion.div>
          )}
          {phase === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 flex flex-col items-center gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className={cn("w-14 h-14 rounded-full flex items-center justify-center border", isAccept ? "bg-emerald-400/15 border-emerald-400/30" : "bg-red-400/10 border-red-400/20")}>
                {isAccept ? <CheckCircle2 className="w-7 h-7 text-emerald-400" /> : <XCircle className="w-7 h-7 text-red-400" />}
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">{isAccept ? "Trao đổi thành công!" : "Đã từ chối đề nghị"}</p>
                <p className="text-[10px] font-mono text-muted-foreground/40 mt-1">
                  {isAccept ? `"${trade.requested.name}" đã vào kho đồ của bạn.` : `Đề nghị từ ${trade.from} đã bị từ chối.`}
                </p>
              </div>
              <button onClick={onClose} className={cn("px-5 py-1.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider transition-all",
                isAccept ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20" : "border-white/10 text-muted-foreground/50 hover:text-white")}>
                Đóng
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Create Trade Modal ───────────────────────────────────────────────────────

interface NewTrade {
  offeredName: string;
  offeredImage: string;
  offeredCategory: ListingCategory | "";
  offeredRarity: MarketRarity | "";
  offeredValue: string;
  requestedName: string;
  requestedImage: string;
  requestedCategory: ListingCategory | "";
  requestedRarity: MarketRarity | "";
  message: string;
  recipient: string;
}

const EMPTY_TRADE: NewTrade = {
  offeredName: "", offeredImage: "", offeredCategory: "", offeredRarity: "", offeredValue: "",
  requestedName: "", requestedImage: "", requestedCategory: "", requestedRarity: "",
  message: "", recipient: "",
};

const ITEM_EMOJIS = ["🐉","🧜","🐱","🐺","🦁","🦋","🦊","🐻","👑","⚽","🧤","🗡️","🛡️","💠","🗺️","🏆","🎫","🏟️","🌌","💍","⚗️","🔮","🏝️","⛩️","🗼","🌲","🌾"];

function CreateTradeModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [step, setStep] = useState<1 | 2 | "submitting" | "done">(1);
  const [form, setForm] = useState<NewTrade>(EMPTY_TRADE);

  const set = <K extends keyof NewTrade>(k: K, v: NewTrade[K]) => setForm(f => ({ ...f, [k]: v }));

  const step1Valid = form.offeredName && form.offeredCategory && form.offeredRarity;
  const step2Valid = form.requestedName && form.requestedCategory && form.requestedRarity && form.recipient;

  const handleSubmit = () => {
    setStep("submitting");
    setTimeout(() => { setStep("done"); onCreated(); }, 1300);
  };

  const CatSelect = ({ field, rarField }: { field: "offeredCategory" | "requestedCategory"; rarField: "offeredRarity" | "requestedRarity" }) => (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1.5">Danh mục</p>
        <div className="flex flex-wrap gap-1">
          {(["pets","football","world-assets","tickets","items"] as ListingCategory[]).map(c => (
            <button key={c} onClick={() => set(field, c)}
              className={cn("px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition-all",
                form[field] === c ? "bg-cyan-400/15 border-cyan-400/30 text-cyan-400" : "border-white/8 text-muted-foreground/40 hover:text-white"
              )}>
              {CATEGORY_META_MARKET[c].icon}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1.5">Độ hiếm</p>
        <div className="flex flex-wrap gap-1">
          {(["common","rare","epic","legendary","mythic"] as MarketRarity[]).map(r => {
            const rc = RARITY_COLORS[r];
            return (
              <button key={r} onClick={() => set(rarField, r)}
                className={cn("px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border transition-all",
                  form[rarField] === r ? cn(rc.bg, rc.border, rc.text) : "border-white/8 text-muted-foreground/40 hover:text-white"
                )}>
                {RARITY_LABELS[r].slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget && step !== "submitting") onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="glass-panel rounded-2xl border border-cyan-400/20 w-full max-w-md overflow-hidden"
      >
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />Tạo đề nghị trao đổi
            </h2>
            {(step === 1 || step === 2) && (
              <p className="text-[9px] font-mono text-muted-foreground/35 mt-0.5">Bước {step}/2</p>
            )}
          </div>
          {step !== "submitting" && (
            <button onClick={onClose} className="p-1.5 rounded-lg border border-white/10 hover:border-white/30 text-muted-foreground/40 hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Your item ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="p-5 space-y-3">
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Vật phẩm bạn đề nghị</p>

              <div>
                <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1.5">Tên vật phẩm *</p>
                <input value={form.offeredName} onChange={e => set("offeredName", e.target.value)}
                  placeholder="VD: Voltrix – Sói Sấm Huyền thoại"
                  className="w-full px-3 py-2 bg-white/4 border border-white/8 rounded-xl text-xs text-white placeholder:text-muted-foreground/20 focus:outline-none focus:border-cyan-400/40 font-mono transition-colors" />
              </div>

              <div>
                <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1.5">Biểu tượng</p>
                <div className="flex flex-wrap gap-1.5">
                  {ITEM_EMOJIS.map(e => (
                    <button key={e} onClick={() => set("offeredImage", e)}
                      className={cn("w-8 h-8 rounded-lg text-base border transition-all", form.offeredImage === e ? "border-cyan-400/40 bg-cyan-400/10" : "border-white/8 bg-white/3 hover:border-white/15")}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <CatSelect field="offeredCategory" rarField="offeredRarity" />

              <div>
                <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1.5">Giá trị ước tính (CR)</p>
                <input type="number" value={form.offeredValue} onChange={e => set("offeredValue", e.target.value)}
                  placeholder="VD: 500000"
                  className="w-full px-3 py-2 bg-white/4 border border-white/8 rounded-xl text-xs text-white placeholder:text-muted-foreground/20 focus:outline-none focus:border-cyan-400/40 font-mono transition-colors" />
              </div>

              <button onClick={() => setStep(2)} disabled={!step1Valid}
                className={cn("w-full py-2.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                  step1Valid ? "border-cyan-400/35 bg-cyan-400/15 text-cyan-400 hover:bg-cyan-400/25" : "border-white/8 text-muted-foreground/30 cursor-not-allowed")}>
                Tiếp theo <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {/* ── Step 2: Wanted item + recipient ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="p-5 space-y-3">
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Vật phẩm bạn muốn</p>

              <div>
                <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1.5">Tên vật phẩm *</p>
                <input value={form.requestedName} onChange={e => set("requestedName", e.target.value)}
                  placeholder="VD: Kiếm Thần Thoại Vũ Trụ"
                  className="w-full px-3 py-2 bg-white/4 border border-white/8 rounded-xl text-xs text-white placeholder:text-muted-foreground/20 focus:outline-none focus:border-cyan-400/40 font-mono transition-colors" />
              </div>

              <div>
                <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1.5">Biểu tượng</p>
                <div className="flex flex-wrap gap-1.5">
                  {ITEM_EMOJIS.map(e => (
                    <button key={e} onClick={() => set("requestedImage", e)}
                      className={cn("w-8 h-8 rounded-lg text-base border transition-all", form.requestedImage === e ? "border-cyan-400/40 bg-cyan-400/10" : "border-white/8 bg-white/3 hover:border-white/15")}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <CatSelect field="requestedCategory" rarField="requestedRarity" />

              <div>
                <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1.5">Gửi đến người dùng *</p>
                <input value={form.recipient} onChange={e => set("recipient", e.target.value)}
                  placeholder="VD: CosmicRich, NightHunter_K..."
                  className="w-full px-3 py-2 bg-white/4 border border-white/8 rounded-xl text-xs text-white placeholder:text-muted-foreground/20 focus:outline-none focus:border-cyan-400/40 font-mono transition-colors" />
              </div>

              <div>
                <p className="text-[8px] font-mono text-muted-foreground/30 uppercase mb-1.5">Tin nhắn (tuỳ chọn)</p>
                <textarea value={form.message} onChange={e => set("message", e.target.value)}
                  placeholder="Chia sẻ lý do đề nghị trao đổi..."
                  rows={2}
                  className="w-full px-3 py-2 bg-white/4 border border-white/8 rounded-xl text-xs text-white placeholder:text-muted-foreground/20 focus:outline-none focus:border-cyan-400/40 font-mono resize-none transition-colors" />
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="px-4 py-2.5 rounded-xl border border-white/10 text-muted-foreground/50 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-all">
                  Quay lại
                </button>
                <button onClick={handleSubmit} disabled={!step2Valid}
                  className={cn("flex-1 py-2.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                    step2Valid ? "border-cyan-400/35 bg-cyan-400/15 text-cyan-400 hover:bg-cyan-400/25" : "border-white/8 text-muted-foreground/30 cursor-not-allowed")}>
                  <Send className="w-3.5 h-3.5" />Gửi đề nghị
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Submitting ── */}
          {step === "submitting" && (
            <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 flex flex-col items-center gap-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
              <p className="text-xs font-mono text-muted-foreground/40 uppercase tracking-widest">Đang gửi đề nghị...</p>
            </motion.div>
          )}

          {/* ── Done ── */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 flex flex-col items-center gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="w-14 h-14 rounded-full bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center">
                <Send className="w-7 h-7 text-cyan-400" />
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">Đề nghị đã gửi!</p>
                <p className="text-[10px] font-mono text-muted-foreground/40 mt-1">
                  Đề nghị của bạn đã được gửi đến <span className="text-cyan-400">{form.recipient}</span>.<br />
                  Bạn sẽ nhận thông báo khi họ phản hồi.
                </p>
              </div>
              <button onClick={onClose} className="px-5 py-1.5 rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 text-xs font-mono font-bold uppercase tracking-wider transition-all">
                Xong
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={cn("px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all",
        active ? "bg-cyan-400/15 border-cyan-400/30 text-cyan-400" : "border-white/8 text-muted-foreground/40 hover:text-white hover:border-white/18"
      )}>
      {label}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Trades() {
  const [tab, setTab]           = useState<Tab>("all");
  const [search, setSearch]     = useState("");
  const [catFilter, setCatFilter] = useState<"all" | ListingCategory>("all");
  const [sort, setSort]         = useState<SortKey>("date_desc");
  const [panelOpen, setPanelOpen] = useState(true);
  const [detailTrade, setDetailTrade] = useState<RichTrade | null>(null);
  const [actionTrade, setActionTrade] = useState<{ trade: RichTrade; action: "accept" | "decline" } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Local status overrides from accept/decline actions
  const [overrides, setOverrides] = useState<Record<string, TradeStatus>>({});
  const handleConfirm = useCallback((id: string, status: TradeStatus) => {
    setOverrides(prev => ({ ...prev, [id]: status }));
  }, []);

  const trades = useMemo(() =>
    RICH_TRADES.map(t => overrides[t.id] ? { ...t, status: overrides[t.id] } : t),
    [overrides],
  );

  // Derived counts
  const openTrades      = trades.filter(t => t.status === "pending" && t.to === CURRENT_USER);
  const sentTrades      = trades.filter(t => t.status === "pending" && t.from === CURRENT_USER);
  const completedTrades = trades.filter(t => t.status !== "pending");
  const acceptedCount   = trades.filter(t => t.status === "accepted").length;
  const totalCompleted  = trades.filter(t => ["accepted","declined","cancelled","expired"].includes(t.status)).length;
  const successRate     = totalCompleted > 0 ? Math.round((acceptedCount / totalCompleted) * 100) : 0;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let items = trades.filter(t => {
      if (tab === "open")      return t.status === "pending" && t.to === CURRENT_USER;
      if (tab === "sent")      return t.status === "pending" && t.from === CURRENT_USER;
      if (tab === "completed") return t.status !== "pending";
      return true;
    }).filter(t => {
      if (catFilter !== "all" && t.offered.category !== catFilter && t.requested.category !== catFilter) return false;
      if (q && !t.offered.name.toLowerCase().includes(q) && !t.requested.name.toLowerCase().includes(q) && !t.from.toLowerCase().includes(q) && !t.to.toLowerCase().includes(q)) return false;
      return true;
    });
    items.sort((a, b) => {
      if (sort === "date_desc")  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "date_asc")   return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "value_desc") return (b.offered.value + b.requested.value) - (a.offered.value + a.requested.value);
      if (sort === "value_asc")  return (a.offered.value + a.requested.value) - (b.offered.value + b.requested.value);
      return 0;
    });
    return items;
  }, [trades, tab, catFilter, search, sort]);

  const TABS: [Tab, string, number][] = [
    ["all",       `Tất cả (${trades.length})`,           trades.length],
    ["open",      `Đang mở (${openTrades.length})`,      openTrades.length],
    ["sent",      `Đã gửi (${sentTrades.length})`,       sentTrades.length],
    ["completed", `Hoàn thành (${completedTrades.length})`, completedTrades.length],
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <BG />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-2 h-6 bg-cyan-400 rounded-sm shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
                Trung Tâm Trao Đổi
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">
                {filtered.length} / {trades.length} GIAO DỊCH · {openTrades.length} CHỜ PHẢN HỒI
              </p>
            </div>
            <button onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-400/35 bg-cyan-400/15 text-cyan-400 hover:bg-cyan-400/25 text-xs font-mono font-bold uppercase tracking-wider transition-all">
              <Plus className="w-4 h-4" />Tạo đề nghị
            </button>
          </div>

          {/* ── KPI cards ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Tổng giao dịch",  value: String(trades.length),          sub: "tất cả thời gian",        color: "text-cyan-400",    border: "border-cyan-400/20",    icon: ArrowLeftRight },
              { label: "Đang chờ",         value: String(openTrades.length),      sub: "cần phản hồi của bạn",    color: "text-amber-400",   border: "border-amber-400/20",   icon: Inbox },
              { label: "Đã hoàn thành",    value: String(completedTrades.length), sub: `${acceptedCount} thành công`,color: "text-emerald-400",border: "border-emerald-400/20",icon: Handshake },
              { label: "Tỷ lệ thành công", value: `${successRate}%`,             sub: "tỷ lệ chấp nhận",         color: "text-purple-400",  border: "border-purple-400/20",  icon: TrendingUp },
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

          {/* ── Open trades alert ────────────────────────────────────────── */}
          {openTrades.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-3 px-4 py-3 glass-panel rounded-xl border border-cyan-400/25 bg-cyan-400/5">
              <Inbox className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <p className="text-xs font-mono text-cyan-400 font-bold flex-1">
                Bạn có {openTrades.length} đề nghị trao đổi đang chờ phản hồi!
              </p>
              <button onClick={() => setTab("open")} className="text-[9px] font-mono text-cyan-400/70 hover:text-cyan-400 border border-cyan-400/20 hover:border-cyan-400/40 px-2.5 py-1 rounded-lg transition-all uppercase tracking-widest">
                Xem ngay
              </button>
            </motion.div>
          )}

          {/* ── Tabs ────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-1 glass-panel border border-white/5 rounded-xl p-1 w-fit overflow-x-auto">
            {TABS.map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                  tab === key ? "bg-cyan-400/20 border border-cyan-400/30 text-cyan-400" : "text-muted-foreground/40 hover:text-white",
                )}>
                {key === "open" && <Inbox className="w-3 h-3" />}
                {key === "sent" && <Send className="w-3 h-3" />}
                {key === "completed" && <CheckCircle2 className="w-3 h-3" />}
                {key === "all" && <ArrowLeftRight className="w-3 h-3" />}
                {label}
              </button>
            ))}
          </div>

          {/* ── Filters ─────────────────────────────────────────────────── */}
          <div className="flex items-center flex-wrap gap-2">
            <button onClick={() => setPanelOpen(o => !o)}
              className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-mono font-bold uppercase transition-all",
                panelOpen ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-400" : "border-white/10 text-muted-foreground/40 hover:text-white")}>
              <SlidersHorizontal className="w-3.5 h-3.5" />Bộ lọc
              {panelOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <div className="flex items-center gap-1.5 flex-wrap">
              {([["date_desc","Mới nhất"],["date_asc","Cũ nhất"],["value_desc","Giá trị cao"],["value_asc","Giá trị thấp"]] as [SortKey,string][]).map(([k,l]) => (
                <button key={k} onClick={() => setSort(k)}
                  className={cn("px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all",
                    sort === k ? "bg-cyan-400/15 border-cyan-400/30 text-cyan-400" : "border-white/8 text-muted-foreground/35 hover:text-white hover:border-white/15")}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {panelOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="glass-panel rounded-xl border border-white/5 p-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Tìm theo tên vật phẩm, người dùng..."
                      className="w-full pl-9 pr-8 py-2.5 bg-white/4 border border-white/8 rounded-lg text-xs text-white placeholder:text-muted-foreground/25 focus:outline-none focus:border-cyan-400/40 font-mono transition-colors" />
                    {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-white"><X className="w-3.5 h-3.5" /></button>}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] font-mono text-muted-foreground/30 uppercase w-16 flex-shrink-0">Danh mục</span>
                    <Chip label="Tất cả" active={catFilter === "all"} onClick={() => setCatFilter("all")} />
                    {(["pets","football","world-assets","tickets","items"] as ListingCategory[]).map(c => (
                      <Chip key={c} label={CATEGORY_META_MARKET[c].label} active={catFilter === c} onClick={() => setCatFilter(c)} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Trade grid ───────────────────────────────────────────────── */}
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-xl border border-white/5 p-16 text-center">
              <Package className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-xs font-mono text-muted-foreground/30 tracking-widest uppercase">
                {tab === "open" ? "Không có đề nghị nào đang chờ" : "Không tìm thấy giao dịch nào"}
              </p>
              <button onClick={() => { setSearch(""); setCatFilter("all"); setTab("all"); }}
                className="mt-4 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 border border-cyan-400/20 hover:border-cyan-400/40 px-4 py-1.5 rounded-lg transition-all uppercase tracking-wider">
                Xem tất cả
              </button>
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {filtered.map(trade => (
                  <TradeCard
                    key={trade.id} trade={trade}
                    onView={() => setDetailTrade(trade)}
                    onAccept={() => setActionTrade({ trade, action: "accept" })}
                    onDecline={() => setActionTrade({ trade, action: "decline" })}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

        </main>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {detailTrade && (
          <TradeDetailModal
            trade={trades.find(t => t.id === detailTrade.id) ?? detailTrade}
            onClose={() => setDetailTrade(null)}
            onAccept={() => { setDetailTrade(null); setActionTrade({ trade: detailTrade, action: "accept" }); }}
            onDecline={() => { setDetailTrade(null); setActionTrade({ trade: detailTrade, action: "decline" }); }}
          />
        )}
        {actionTrade && (
          <ActionModal
            trade={actionTrade.trade} action={actionTrade.action}
            onClose={() => setActionTrade(null)}
            onConfirm={() => handleConfirm(actionTrade.trade.id, actionTrade.action === "accept" ? "accepted" : "declined")}
          />
        )}
        {createOpen && (
          <CreateTradeModal
            onClose={() => setCreateOpen(false)}
            onCreated={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
