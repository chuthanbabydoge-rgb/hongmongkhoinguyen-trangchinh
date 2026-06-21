import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { TRANSACTIONS, type Transaction } from "@/lib/walletMockData";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight, ArrowDownLeft, Gift, ArrowLeftRight,
  Search, ChevronUp, ChevronDown, SlidersHorizontal,
} from "lucide-react";

const TX_TYPE_ICON: Record<string, typeof ArrowUpRight> = {
  receive: ArrowDownLeft,
  send: ArrowUpRight,
  purchase: ArrowUpRight,
  reward: Gift,
  convert: ArrowLeftRight,
};

const TX_TYPE_COLOR: Record<string, string> = {
  receive: "text-emerald-400 bg-emerald-400/10",
  send: "text-red-400 bg-red-400/10",
  purchase: "text-red-400 bg-red-400/10",
  reward: "text-amber-400 bg-amber-400/10",
  convert: "text-blue-400 bg-blue-400/10",
};

const STATUS_META = {
  completed: { label: "Hoàn thành", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", dot: "bg-emerald-400" },
  pending:   { label: "Đang xử lý", color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20",   dot: "bg-amber-400 animate-pulse" },
  failed:    { label: "Thất bại",   color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/20",     dot: "bg-red-400" },
};

const CURRENCY_META: Record<string, { color: string; label: string }> = {
  credits: { color: "text-blue-400",   label: "Tín dụng" },
  coins:   { color: "text-cyan-400",   label: "Xu" },
  tokens:  { color: "text-purple-400", label: "Token" },
  points:  { color: "text-amber-400",  label: "Điểm thưởng" },
};

type SortKey = "date" | "amount" | "currency" | "type" | "status";

const SUMMARY = [
  { label: "Tổng GD", value: TRANSACTIONS.length, color: "text-white" },
  { label: "Hoàn thành", value: TRANSACTIONS.filter(t => t.status === "completed").length, color: "text-emerald-400" },
  { label: "Đang xử lý", value: TRANSACTIONS.filter(t => t.status === "pending").length,   color: "text-amber-400" },
  { label: "Thất bại",   value: TRANSACTIONS.filter(t => t.status === "failed").length,    color: "text-red-400" },
];

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [filterCurrency, setFilterCurrency] = useState<"all" | Transaction["currency"]>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | Transaction["status"]>("all");
  const [filterType, setFilterType] = useState<"all" | Transaction["type"]>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc(v => !v);
    else { setSortKey(k); setSortAsc(false); }
  };

  const filtered = useMemo(() => {
    return TRANSACTIONS.filter(tx => {
      if (filterCurrency !== "all" && tx.currency !== filterCurrency) return false;
      if (filterStatus !== "all" && tx.status !== filterStatus) return false;
      if (filterType !== "all" && tx.type !== filterType) return false;
      if (search && !tx.note.toLowerCase().includes(search.toLowerCase()) && !tx.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date")     cmp = a.date.localeCompare(b.date);
      if (sortKey === "amount")   cmp = Math.abs(a.amount) - Math.abs(b.amount);
      if (sortKey === "currency") cmp = a.currency.localeCompare(b.currency);
      if (sortKey === "type")     cmp = a.type.localeCompare(b.type);
      if (sortKey === "status")   cmp = a.status.localeCompare(b.status);
      return sortAsc ? cmp : -cmp;
    });
  }, [search, filterCurrency, filterStatus, filterType, sortKey, sortAsc]);

  const SortBtn = ({ label, k }: { label: string; k: SortKey }) => (
    <button onClick={() => handleSort(k)} className={cn("flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase transition-colors", sortKey === k ? "text-primary" : "text-muted-foreground/30 hover:text-white")}>
      {label}
      {sortKey === k && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
    </button>
  );

  const FilterBtn = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={cn("px-3 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all", active ? "bg-primary/20 border-primary/50 text-primary" : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20")}>
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col relative z-10">
        <Header />

        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
              <span className="w-2 h-6 bg-primary rounded-sm shadow-[0_0_10px_hsl(var(--primary))]" />
              Lịch sử Giao dịch
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground/30 mt-1 tracking-wider">
              {TRANSACTIONS.length} GIAO DỊCH · VÍ COMMANDER ZARA
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SUMMARY.map(s => (
              <div key={s.label} className="glass-panel rounded-xl border border-white/5 p-4 text-center">
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="glass-panel rounded-xl border border-white/5 p-4 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm theo ghi chú hoặc mã giao dịch..."
                className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 font-mono"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
              <span className="text-[10px] font-mono text-muted-foreground/30 uppercase">Loại tiền:</span>
              {(["all", "credits", "coins", "tokens", "points"] as const).map(c => (
                <FilterBtn key={c} label={c === "all" ? "Tất cả" : c === "credits" ? "Tín dụng" : c === "coins" ? "Xu" : c === "tokens" ? "Token" : "Điểm"} active={filterCurrency === c} onClick={() => setFilterCurrency(c)} />
              ))}
              <span className="text-[10px] font-mono text-muted-foreground/30 uppercase ml-2">Trạng thái:</span>
              {(["all", "completed", "pending", "failed"] as const).map(s => (
                <FilterBtn key={s} label={s === "all" ? "Tất cả" : STATUS_META[s].label} active={filterStatus === s} onClick={() => setFilterStatus(s)} />
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[80px_auto_120px_110px_90px_100px] gap-3 px-5 py-3 border-b border-white/5 bg-white/2">
              <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">Mã GD</span>
              <SortBtn label="Ghi chú" k="date" />
              <SortBtn label="Loại" k="type" />
              <SortBtn label="Tài sản" k="currency" />
              <SortBtn label="Số tiền" k="amount" />
              <SortBtn label="Trạng thái" k="status" />
            </div>

            {filtered.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground/30 text-xs font-mono tracking-widest">
                KHÔNG TÌM THẤY GIAO DỊCH PHÙ HỢP
              </div>
            ) : (
              filtered.map((tx, i) => {
                const TxIcon = TX_TYPE_ICON[tx.type] ?? ArrowUpRight;
                const sm = STATUS_META[tx.status];
                const cm = CURRENCY_META[tx.currency];
                const isPositive = tx.amount > 0;
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-[80px_auto_120px_110px_90px_100px] gap-3 px-5 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors items-center"
                  >
                    <span className="text-[10px] font-mono text-muted-foreground/40">{tx.id}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", TX_TYPE_COLOR[tx.type].split(" ")[1])}>
                        <TxIcon className={cn("w-3.5 h-3.5", TX_TYPE_COLOR[tx.type].split(" ")[0])} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-white/80 truncate">{tx.note}</p>
                        <p className="text-[10px] font-mono text-muted-foreground/40">{tx.date}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">{tx.typeLabel}</span>
                    <span className={cn("text-[10px] font-mono font-bold", cm.color)}>{cm.label}</span>
                    <span className={cn("text-sm font-bold font-mono tabular-nums", isPositive ? "text-emerald-400" : "text-red-400")}>
                      {isPositive ? "+" : ""}{tx.amount.toLocaleString("vi-VN")}
                    </span>
                    <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold tracking-widest", sm.color, sm.bg, sm.border)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", sm.dot)} />
                      {sm.label}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <p className="text-[10px] font-mono text-muted-foreground/30 text-right tracking-widest">
            HIỂN THỊ {filtered.length} TRONG {TRANSACTIONS.length} GIAO DỊCH
          </p>
        </main>
      </div>
    </div>
  );
}
