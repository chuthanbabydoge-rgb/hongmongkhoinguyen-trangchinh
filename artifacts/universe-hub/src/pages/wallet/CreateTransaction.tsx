import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useWallet } from "@/context/WalletContext";
import { type Transaction } from "@/lib/walletMockData";
import { cn } from "@/lib/utils";
import {
  Plus, ArrowDownLeft, ArrowUpRight, Gift, ArrowLeftRight,
  Search, ChevronUp, ChevronDown, CheckCircle2, Clock, XCircle,
  CreditCard, Coins, Gem, Sparkles, SendHorizonal, X,
} from "lucide-react";

const TYPE_META = {
  receive:  { label: "Giao dịch đến", icon: ArrowDownLeft, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  send:     { label: "Giao dịch đi",  icon: ArrowUpRight,  color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/20" },
  purchase: { label: "Mua",           icon: ArrowUpRight,  color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/20" },
  reward:   { label: "Điểm thưởng",  icon: Gift,          color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20" },
  convert:  { label: "Chuyển đổi",   icon: ArrowLeftRight, color: "text-blue-400",   bg: "bg-blue-400/10",    border: "border-blue-400/20" },
};

const STATUS_META = {
  completed: { label: "Hoàn thành", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", dot: "bg-emerald-400" },
  pending:   { label: "Đang xử lý", icon: Clock,        color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20",   dot: "bg-amber-400 animate-pulse" },
  failed:    { label: "Thất bại",   icon: XCircle,      color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/20",     dot: "bg-red-400" },
};

const CURRENCY_META: Record<string, { label: string; color: string; Icon: typeof CreditCard }> = {
  credits: { label: "Tín dụng",    color: "text-blue-400",   Icon: CreditCard },
  coins:   { label: "Xu",          color: "text-cyan-400",   Icon: Coins },
  tokens:  { label: "Token",       color: "text-purple-400", Icon: Gem },
  points:  { label: "Điểm thưởng", color: "text-amber-400",  Icon: Sparkles },
};

type FilterKey = "all" | "incoming" | "outgoing" | "reward";
type SortKey   = "date" | "amount";

const CURRENCY_LABELS: Record<string, string> = {
  credits: "Tín dụng",
  coins:   "Xu",
  tokens:  "Token",
  points:  "Điểm thưởng",
};

const TYPE_LABELS: Record<string, string> = {
  receive:  "Nhận",
  send:     "Gửi",
  purchase: "Mua",
  reward:   "Phần thưởng",
  convert:  "Chuyển đổi",
};

const INITIAL_FORM = {
  type:     "receive" as Transaction["type"],
  currency: "credits" as Transaction["currency"],
  amount:   "",
  note:     "",
  from:     "",
  to:       "",
  status:   "completed" as Transaction["status"],
};

export default function CreateTransaction() {
  const { transactions, addTransaction } = useWallet();

  const [form, setForm] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const [search, setSearch]           = useState("");
  const [filter, setFilter]           = useState<FilterKey>("all");
  const [sortKey, setSortKey]         = useState<SortKey>("date");
  const [sortAsc, setSortAsc]         = useState(false);

  const isOutgoing = ["send", "purchase", "convert"].includes(form.type);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const rawAmount = parseFloat(form.amount);
    if (!form.amount || isNaN(rawAmount) || rawAmount <= 0) {
      setFormError("Vui lòng nhập số tiền hợp lệ (> 0)");
      return;
    }
    if (!form.note.trim()) {
      setFormError("Vui lòng nhập ghi chú cho giao dịch");
      return;
    }
    setFormError(null);

    const signedAmount = isOutgoing ? -Math.abs(rawAmount) : Math.abs(rawAmount);
    const newTx = {
      type:          form.type,
      typeLabel:     TYPE_LABELS[form.type],
      currency:      form.currency,
      currencyLabel: CURRENCY_LABELS[form.currency],
      amount:        signedAmount,
      note:          form.note.trim(),
      status:        form.status,
      ...(form.from.trim() ? { from: form.from.trim() } : {}),
      ...(form.to.trim()   ? { to:   form.to.trim() }   : {}),
    };
    addTransaction(newTx);
    setSuccessId(newTx.note.slice(0, 12));
    setForm(INITIAL_FORM);
    setTimeout(() => setSuccessId(null), 3000);
  }

  const filtered = useMemo(() => {
    return transactions
      .filter(tx => {
        if (filter === "incoming") return tx.type === "receive";
        if (filter === "outgoing") return ["send", "purchase", "convert"].includes(tx.type);
        if (filter === "reward")   return tx.type === "reward";
        return true;
      })
      .filter(tx => {
        if (!search) return true;
        const q = search.toLowerCase();
        return tx.note.toLowerCase().includes(q) || tx.id.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const cmp = sortKey === "date"
          ? a.date.localeCompare(b.date)
          : Math.abs(a.amount) - Math.abs(b.amount);
        return sortAsc ? cmp : -cmp;
      });
  }, [transactions, filter, search, sortKey, sortAsc]);

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc(v => !v);
    else { setSortKey(k); setSortAsc(false); }
  };

  const SortBtn = ({ label, k }: { label: string; k: SortKey }) => (
    <button
      onClick={() => handleSort(k)}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono tracking-widest uppercase border transition-all",
        sortKey === k
          ? "bg-primary/20 border-primary/40 text-primary"
          : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20"
      )}
    >
      {label}
      {sortKey === k
        ? (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
        : null}
    </button>
  );

  const FILTERS: { k: FilterKey; l: string }[] = [
    { k: "all",      l: "Tất cả" },
    { k: "incoming", l: "Giao dịch đến" },
    { k: "outgoing", l: "Giao dịch đi" },
    { k: "reward",   l: "Tích điểm thưởng" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col relative z-10">
        <Header />

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">

          {/* ── Page header ─────────────────────────────────────── */}
          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
              <span className="w-2 h-6 bg-primary rounded-sm shadow-[0_0_10px_hsl(var(--primary))]" />
              Tạo Giao Dịch
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground/30 mt-1 tracking-wider">
              TẠO GIAO DỊCH MỚI · XEM LỊCH SỬ · COMMANDER ZARA
            </p>
          </div>

          {/* ── Create form ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="glass-panel rounded-2xl border border-primary/20 p-5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Giao dịch mới</p>
                  <p className="text-[10px] font-mono text-muted-foreground/40">Điền thông tin bên dưới để tạo giao dịch</p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">

                  {/* Type */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">Loại giao dịch</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {(Object.keys(TYPE_META) as Transaction["type"][]).map(t => {
                        const m = TYPE_META[t];
                        const Icon = m.icon;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, type: t }))}
                            className={cn(
                              "flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[10px] font-mono font-bold tracking-widest transition-all",
                              form.type === t
                                ? cn(m.color, m.bg, m.border)
                                : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20"
                            )}
                            data-testid={`type-btn-${t}`}
                          >
                            <Icon className="w-3 h-3 flex-shrink-0" />
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Currency */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">Loại tiền</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(["credits", "coins", "tokens", "points"] as Transaction["currency"][]).map(c => {
                        const m = CURRENCY_META[c];
                        const Icon = m.Icon;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, currency: c }))}
                            className={cn(
                              "flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[10px] font-mono font-bold tracking-widest transition-all",
                              form.currency === c
                                ? cn(m.color, "bg-white/10 border-white/30")
                                : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20"
                            )}
                            data-testid={`currency-btn-${c}`}
                          >
                            <Icon className="w-3 h-3 flex-shrink-0" />
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">Trạng thái</label>
                    <div className="flex flex-col gap-1.5">
                      {(["completed", "pending", "failed"] as Transaction["status"][]).map(s => {
                        const m = STATUS_META[s];
                        const Icon = m.icon;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, status: s }))}
                            className={cn(
                              "flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[10px] font-mono font-bold tracking-widest transition-all",
                              form.status === s
                                ? cn(m.color, m.bg, m.border)
                                : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20"
                            )}
                            data-testid={`status-btn-${s}`}
                          >
                            <Icon className="w-3 h-3 flex-shrink-0" />
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Amount + Note */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">
                      Số tiền <span className={cn("ml-1", isOutgoing ? "text-red-400" : "text-emerald-400")}>{isOutgoing ? "(trừ)" : "(cộng)"}</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={form.amount}
                        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                        placeholder="Nhập số tiền..."
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 font-mono"
                        data-testid="input-amount"
                      />
                      <span className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold", CURRENCY_META[form.currency].color)}>
                        {form.currency === "credits" ? "CR" : form.currency === "coins" ? "CO" : form.currency === "tokens" ? "TK" : "RP"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">Ghi chú</label>
                    <input
                      type="text"
                      value={form.note}
                      onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                      placeholder="Mô tả giao dịch..."
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 font-mono"
                      data-testid="input-note"
                    />
                  </div>
                </div>

                {/* From / To */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">Từ (tùy chọn)</label>
                    <input
                      type="text"
                      value={form.from}
                      onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                      placeholder="Nguồn gửi..."
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">Đến (tùy chọn)</label>
                    <input
                      type="text"
                      value={form.to}
                      onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                      placeholder="Địa chỉ nhận..."
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 font-mono"
                    />
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-mono"
                    >
                      <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {formError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Success */}
                <AnimatePresence>
                  {successId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-mono"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      Giao dịch đã được tạo thành công!
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/20 border border-primary/40 text-primary text-[10px] font-mono font-bold tracking-widest uppercase hover:bg-primary/30 transition-all"
                    data-testid="button-submit-transaction"
                  >
                    <SendHorizonal className="w-3.5 h-3.5" />
                    Tạo giao dịch
                  </button>
                  <button
                    type="button"
                    onClick={() => { setForm(INITIAL_FORM); setFormError(null); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-muted-foreground/40 text-[10px] font-mono font-bold tracking-widest uppercase hover:text-white hover:border-white/20 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    Đặt lại
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* ── History ─────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* History header + controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">Lịch sử Giao dịch</h2>
                <p className="text-[10px] font-mono text-muted-foreground/30 mt-0.5">
                  {filtered.length} / {transactions.length} GIAO DỊCH
                </p>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground/30 uppercase">Sắp xếp:</span>
                <SortBtn label="Ngày" k="date" />
                <SortBtn label="Số tiền" k="amount" />
              </div>
            </div>

            {/* Search + Filters */}
            <div className="glass-panel rounded-xl border border-white/5 p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm theo ghi chú hoặc mã giao dịch..."
                  className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 font-mono"
                  data-testid="input-history-search"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map(({ k, l }) => (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    className={cn(
                      "px-3 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all",
                      filter === k
                        ? "bg-primary/20 border-primary/50 text-primary"
                        : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20"
                    )}
                    data-testid={`filter-${k}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Table — desktop */}
            <div className="glass-panel rounded-xl border border-white/5 overflow-hidden hidden md:block">
              <div className="grid grid-cols-[90px_auto_80px_110px_100px_130px] gap-3 px-5 py-3 border-b border-white/5 bg-white/2">
                <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">Mã GD</span>
                <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">Ghi chú</span>
                <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">Loại</span>
                <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">Số tiền</span>
                <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">Trạng thái</span>
                <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">Ngày</span>
              </div>

              {filtered.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground/30 text-xs font-mono tracking-widest">
                  KHÔNG TÌM THẤY GIAO DỊCH PHÙ HỢP
                </div>
              ) : (
                filtered.map((tx, i) => {
                  const tm = TYPE_META[tx.type];
                  const sm = STATUS_META[tx.status];
                  const cm = CURRENCY_META[tx.currency];
                  const TxIcon = tm.icon;
                  const CurrIcon = cm.Icon;
                  const isPositive = tx.amount > 0;
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.025, 0.3) }}
                      className="grid grid-cols-[90px_auto_80px_110px_100px_130px] gap-3 px-5 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors items-center"
                      data-testid={`row-tx-${tx.id}`}
                    >
                      <span className="text-[10px] font-mono text-muted-foreground/40 truncate">{tx.id}</span>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", tm.bg)}>
                          <TxIcon className={cn("w-3.5 h-3.5", tm.color)} />
                        </div>
                        <p className="text-xs text-white/80 truncate">{tx.note}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <CurrIcon className={cn("w-3 h-3", cm.color)} />
                        <span className={cn("text-[10px] font-mono font-bold", cm.color)}>{cm.label}</span>
                      </div>
                      <span className={cn("text-sm font-bold font-mono tabular-nums", isPositive ? "text-emerald-400" : "text-red-400")}>
                        {isPositive ? "+" : ""}{tx.amount.toLocaleString("vi-VN")}
                      </span>
                      <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold tracking-widest w-fit", sm.color, sm.bg, sm.border)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", sm.dot)} />
                        {sm.label}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground/40">{tx.date}</span>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Cards — mobile */}
            <div className="space-y-2 md:hidden">
              {filtered.length === 0 ? (
                <div className="glass-panel rounded-xl border border-white/5 p-8 text-center text-muted-foreground/30 text-xs font-mono tracking-widest">
                  KHÔNG TÌM THẤY GIAO DỊCH
                </div>
              ) : (
                filtered.map((tx, i) => {
                  const tm = TYPE_META[tx.type];
                  const sm = STATUS_META[tx.status];
                  const cm = CURRENCY_META[tx.currency];
                  const TxIcon = tm.icon;
                  const CurrIcon = cm.Icon;
                  const isPositive = tx.amount > 0;
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      className="glass-panel rounded-xl border border-white/5 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", tm.bg)}>
                            <TxIcon className={cn("w-4 h-4", tm.color)} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate">{tx.note}</p>
                            <p className="text-[10px] font-mono text-muted-foreground/40">{tx.id}</p>
                          </div>
                        </div>
                        <span className={cn("text-base font-bold font-mono tabular-nums flex-shrink-0", isPositive ? "text-emerald-400" : "text-red-400")}>
                          {isPositive ? "+" : ""}{tx.amount.toLocaleString("vi-VN")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CurrIcon className={cn("w-3 h-3", cm.color)} />
                          <span className={cn("text-[10px] font-mono font-bold", cm.color)}>{cm.label}</span>
                        </div>
                        <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold tracking-widest", sm.color, sm.bg, sm.border)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", sm.dot)} />
                          {sm.label}
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground/40">{tx.date}</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            <p className="text-[10px] font-mono text-muted-foreground/30 text-right tracking-widest">
              HIỂN THỊ {filtered.length} TRONG {transactions.length} GIAO DỊCH
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
