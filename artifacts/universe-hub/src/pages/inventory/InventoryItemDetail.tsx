import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { apiFetch, ApiError } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Package, Loader2, AlertTriangle,
  Calendar, Hash, Layers, Tag,
  ShoppingBag, X, CheckCircle2, Coins, ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Rarity     = "common" | "rare" | "epic" | "legendary" | "mythic";
type ItemStatus = "active" | "inactive" | "locked" | "trading" | "equipped" | "used" | "expired";

interface InventoryItem {
  id:          string;
  category:    string;
  name:        string;
  description: string | null;
  rarity:      Rarity;
  status:      ItemStatus;
  quantity:    number;
  image:       string | null;
  metadata:    Record<string, unknown> | null;
  acquiredAt:  string;
}

// ─── Rarity meta ─────────────────────────────────────────────────────────────

const RARITY_META: Record<Rarity, { label: string; color: string; bg: string; border: string; glow: string }> = {
  common:    { label: "Phổ thông",    color: "text-gray-400",   bg: "bg-gray-400/10",   border: "border-gray-400/20",   glow: "" },
  rare:      { label: "Hiếm",         color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20",   glow: "shadow-[0_0_20px_rgba(96,165,250,0.15)]" },
  epic:      { label: "Sử thi",       color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", glow: "shadow-[0_0_20px_rgba(192,132,252,0.2)]" },
  legendary: { label: "Huyền thoại",  color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/20",  glow: "shadow-[0_0_20px_rgba(251,191,36,0.2)]" },
  mythic:    { label: "Thần thoại",   color: "text-rose-400",   bg: "bg-rose-400/10",   border: "border-rose-400/20",   glow: "shadow-[0_0_24px_rgba(251,113,133,0.25)]" },
};

const STATUS_META: Record<ItemStatus, { label: string; color: string; dot: string }> = {
  active:   { label: "Hoạt động",       color: "text-emerald-400", dot: "bg-emerald-400" },
  equipped: { label: "Đang trang bị",   color: "text-blue-400",    dot: "bg-blue-400"    },
  inactive: { label: "Không hoạt động", color: "text-gray-400",    dot: "bg-gray-400"    },
  locked:   { label: "Bị khóa",         color: "text-red-400",     dot: "bg-red-400"     },
  trading:  { label: "Đang giao dịch",  color: "text-amber-400",   dot: "bg-amber-400"   },
  used:     { label: "Đã dùng",         color: "text-gray-500",    dot: "bg-gray-500"    },
  expired:  { label: "Hết hạn",         color: "text-red-600",     dot: "bg-red-600"     },
};

const CATEGORY_LABEL: Record<string, string> = {
  pets:           "Thú cưng",
  football:       "Cầu thủ bóng đá",
  "world-assets": "Tài sản thế giới",
  tickets:        "Vé",
  items:          "Vật phẩm",
};

const CURRENCIES = [
  { value: "credits", label: "Credits (CR)" },
  { value: "stars",   label: "Stars (⭐)" },
];

// ─── Background ───────────────────────────────────────────────────────────────

function BG() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-background to-background" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px]" />
    </div>
  );
}

// ─── Detail field row ─────────────────────────────────────────────────────────

function DetailRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon: React.ElementType }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-muted-foreground/50" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-0.5">{label}</p>
        <div className="text-sm text-white/80">{value}</div>
      </div>
    </div>
  );
}

// ─── List on Marketplace Modal ────────────────────────────────────────────────

function ListOnMarketplaceModal({ item, onClose, rm }: {
  item: InventoryItem;
  onClose: () => void;
  rm: { label: string; color: string; bg: string; border: string; glow: string };
}) {
  const [price,    setPrice]    = useState("");
  const [currency, setCurrency] = useState("credits");
  const [showCurr, setShowCurr] = useState(false);
  const [phase,    setPhase]    = useState<"form" | "submitting" | "done" | "error">("form");
  const [errMsg,   setErrMsg]   = useState("");

  const priceNum = parseFloat(price.replace(/,/g, "")) || 0;
  const isValid  = priceNum > 0;

  const handleSubmit = useCallback(async () => {
    if (!isValid) return;
    setPhase("submitting");
    try {
      await apiFetch("/marketplace/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryItemId: item.id, price: priceNum, currency }),
      });
      setPhase("done");
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Niêm yết thất bại.");
      setPhase("error");
    }
  }, [item.id, priceNum, currency, isValid]);

  const selectedCurr = CURRENCIES.find(c => c.value === currency) ?? CURRENCIES[0];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget && phase !== "submitting") onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.93, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className={cn("glass-panel rounded-2xl border w-full max-w-md overflow-hidden", rm.border, rm.glow)}
      >
        {/* Header */}
        <div className={cn("p-5 border-b border-white/5 relative flex items-center gap-4", rm.bg)}>
          {phase !== "submitting" && (
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg border border-white/10 hover:border-white/30 text-muted-foreground/40 hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          )}
          <div className={cn("w-14 h-14 rounded-xl border-2 flex items-center justify-center flex-shrink-0", rm.bg, rm.border)}>
            <Package className={cn("w-8 h-8", rm.color)} />
          </div>
          <div className="min-w-0">
            <div className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border w-fit mb-1.5", rm.color, rm.bg, rm.border)}>
              {rm.label}
            </div>
            <h2 className="text-sm font-bold text-white leading-tight line-clamp-2 pr-8">{item.name}</h2>
            <p className="text-[9px] font-mono text-muted-foreground/35 mt-0.5">{item.id}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === "form" && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5 space-y-4">
              <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5" /> Niêm yết lên Marketplace
              </p>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">Giá bán</label>
                <div className="flex gap-2">
                  <input
                    type="number" min="1" step="1"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="0"
                    className="flex-1 px-3 py-2.5 bg-white/4 border border-white/8 rounded-xl text-sm font-mono text-white placeholder:text-muted-foreground/25 focus:outline-none focus:border-emerald-400/40 transition-colors"
                  />
                  {/* Currency selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowCurr(s => !s)}
                      className="flex items-center gap-1.5 px-3 py-2.5 bg-white/4 border border-white/8 rounded-xl text-[11px] font-mono text-white hover:border-white/20 transition-all min-w-[90px]"
                    >
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      {selectedCurr!.value.toUpperCase()}
                      <ChevronDown className="w-3 h-3 text-muted-foreground/40 ml-auto" />
                    </button>
                    {showCurr && (
                      <div className="absolute right-0 top-full mt-1 w-40 glass-panel rounded-xl border border-white/10 overflow-hidden z-10">
                        {CURRENCIES.map(c => (
                          <button key={c.value} onClick={() => { setCurrency(c.value); setShowCurr(false); }}
                            className={cn("w-full px-3 py-2.5 text-left text-[11px] font-mono hover:bg-white/5 transition-colors",
                              currency === c.value ? "text-emerald-400" : "text-white/70"
                            )}>
                            {c.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              {priceNum > 0 && (
                <div className="glass-panel rounded-xl border border-white/5 p-3 space-y-1.5 text-[10px] font-mono">
                  <div className="flex justify-between text-muted-foreground/50">
                    <span>Giá niêm yết</span>
                    <span className="text-white">{priceNum.toLocaleString("vi-VN")} {selectedCurr!.value.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground/50">
                    <span>Phí sàn (1%)</span>
                    <span className="text-muted-foreground/40">−{Math.round(priceNum * 0.01).toLocaleString("vi-VN")}</span>
                  </div>
                  <div className="border-t border-white/8 pt-1.5 flex justify-between text-white">
                    <span className="font-bold">Bạn nhận được</span>
                    <span className={cn("font-bold", rm.color)}>≈ {Math.round(priceNum * 0.99).toLocaleString("vi-VN")} {selectedCurr!.value.toUpperCase()}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-muted-foreground/50 hover:text-white text-xs font-mono uppercase font-bold tracking-wider transition-all">
                  Hủy
                </button>
                <button
                  onClick={() => void handleSubmit()} disabled={!isValid}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl border text-xs font-mono uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2",
                    isValid
                      ? cn(rm.border, rm.bg, rm.color, "hover:brightness-125 active:scale-[0.98]")
                      : "border-white/10 text-muted-foreground/30 cursor-not-allowed",
                  )}
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Niêm yết
                </button>
              </div>
            </motion.div>
          )}

          {phase === "submitting" && (
            <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-full border-2 border-emerald-400/20 border-t-emerald-400"
              />
              <p className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest">Đang đăng niêm yết...</p>
            </motion.div>
          )}

          {phase === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-10 flex flex-col items-center gap-4">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-16 h-16 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">Niêm yết thành công!</p>
                <p className="text-[10px] font-mono text-muted-foreground/40 mt-1">{item.name} đã được đăng lên Marketplace.</p>
              </div>
              <button onClick={onClose} className="px-6 py-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider hover:bg-emerald-400/20 transition-all">
                Đóng
              </button>
            </motion.div>
          )}

          {phase === "error" && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-10 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-400/15 border border-red-400/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">Niêm yết thất bại</p>
                <p className="text-[10px] font-mono text-muted-foreground/40 mt-1">{errMsg}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPhase("form")} className="px-5 py-2 rounded-xl border border-white/10 text-muted-foreground/50 text-xs font-mono font-bold uppercase tracking-wider hover:text-white transition-all">
                  Thử lại
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function InventoryItemDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [item,      setItem]      = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [showList,  setShowList]  = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    apiFetch<InventoryItem>(`/inventory/items/${id}`)
      .then(data => setItem(data))
      .catch(err => {
        if (err instanceof ApiError && err.status === 404) {
          setError("Vật phẩm không tồn tại hoặc không thuộc về bạn.");
        } else if (err instanceof ApiError && err.status === 401) {
          setError("Vui lòng đăng nhập để xem vật phẩm.");
        } else {
          setError(err instanceof Error ? err.message : "Không thể tải vật phẩm.");
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const rm = item ? (RARITY_META[item.rarity] ?? RARITY_META.common) : null;
  const sm = item ? (STATUS_META[item.status] ?? STATUS_META.inactive) : null;

  const canList = item?.status === "active" || item?.status === "inactive";

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <BG />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <Header />
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* ── Back button ── */}
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate("/inventory")}
              className="flex items-center gap-2 text-muted-foreground/60 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại Kho đồ
            </motion.button>

            {/* ── Loading state ── */}
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}

            {/* ── Error state ── */}
            {!isLoading && error && (
              <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <div className="w-16 h-16 rounded-full border border-rose-500/25 bg-rose-500/5 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-rose-400" />
                </div>
                <p className="text-sm text-muted-foreground/70">{error}</p>
              </div>
            )}

            {/* ── Item detail ── */}
            {!isLoading && item && rm && sm && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-5"
              >

                {/* Header card */}
                <div className={cn(
                  "glass-panel rounded-2xl border p-6 flex items-start gap-5",
                  rm.border, rm.glow,
                )}>
                  <div className={cn(
                    "w-20 h-20 rounded-2xl border flex items-center justify-center flex-shrink-0",
                    rm.bg, rm.border,
                  )}>
                    <Package className={cn("w-10 h-10", rm.color)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={cn(
                        "text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                        rm.color, rm.bg, rm.border,
                      )}>
                        {rm.label}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-mono">
                        <span className={cn("w-1.5 h-1.5 rounded-full", sm.dot)} />
                        <span className={sm.color}>{sm.label}</span>
                      </span>
                    </div>

                    <h1 className="text-xl font-bold text-white mb-1">{item.name}</h1>
                    <p className="text-xs font-mono text-muted-foreground/40 uppercase tracking-widest">
                      {CATEGORY_LABEL[item.category] ?? item.category} · #{item.id}
                    </p>
                  </div>
                </div>

                {/* Action bar */}
                <div className="glass-panel rounded-xl border border-white/5 p-4 flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-muted-foreground/30" />
                  <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest flex-1">
                    Hành động
                  </span>
                  <button
                    onClick={() => setShowList(true)}
                    disabled={!canList}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl border text-[11px] font-mono font-bold uppercase tracking-wider transition-all",
                      canList
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 active:scale-[0.98]"
                        : "border-white/8 text-muted-foreground/30 cursor-not-allowed",
                    )}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Niêm yết Marketplace
                  </button>
                </div>

                {/* Details panel */}
                <div className="glass-panel rounded-2xl border border-white/5 p-5 space-y-0">
                  <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest mb-3">
                    Chi tiết vật phẩm
                  </p>

                  {item.description && (
                    <DetailRow
                      label="Mô tả"
                      icon={Tag}
                      value={<span className="text-white/70 leading-relaxed">{item.description}</span>}
                    />
                  )}

                  <DetailRow
                    label="Độ hiếm"
                    icon={Layers}
                    value={<span className={cn("font-semibold", rm.color)}>{rm.label}</span>}
                  />

                  <DetailRow
                    label="Số lượng"
                    icon={Hash}
                    value={<span className="font-mono font-bold text-white">{item.quantity.toLocaleString("vi-VN")}</span>}
                  />

                  <DetailRow
                    label="Ngày nhận"
                    icon={Calendar}
                    value={
                      <span className="text-white/70">
                        {new Date(item.acquiredAt).toLocaleDateString("vi-VN", {
                          year: "numeric", month: "long", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    }
                  />
                </div>

                {/* Metadata panel */}
                {item.metadata && Object.keys(item.metadata).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="glass-panel rounded-2xl border border-white/5 p-5"
                  >
                    <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest mb-3">
                      Siêu dữ liệu
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(item.metadata).map(([key, val]) => (
                        <div
                          key={key}
                          className="bg-black/30 border border-white/5 rounded-xl p-3"
                        >
                          <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-1">
                            {key}
                          </p>
                          <p className="text-sm font-mono text-white/80 truncate">
                            {typeof val === "object" ? JSON.stringify(val) : String(val)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </motion.div>
            )}

          </div>
        </main>
      </div>

      {/* ── List on Marketplace Modal ── */}
      <AnimatePresence>
        {showList && item && rm && (
          <ListOnMarketplaceModal item={item} rm={rm} onClose={() => setShowList(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
