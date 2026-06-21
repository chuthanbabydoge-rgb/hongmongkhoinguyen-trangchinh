import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useWallet } from "@/context/WalletContext";
import { type CurrencyBalance } from "@/lib/walletMockData";
import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, CreditCard, Coins, Gem, Sparkles,
  Clock, ArrowUpRight, ArrowDownLeft, RefreshCw, Gift, ArrowLeftRight,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, Tooltip as RTooltip,
} from "recharts";

const CURRENCY_ICONS = {
  credits: CreditCard,
  coins: Coins,
  tokens: Gem,
  points: Sparkles,
};

const TX_TYPE_ICON: Record<string, typeof ArrowUpRight> = {
  receive: ArrowDownLeft,
  send: ArrowUpRight,
  purchase: ArrowUpRight,
  reward: Gift,
  convert: ArrowLeftRight,
};

const TX_TYPE_COLOR: Record<string, string> = {
  receive: "text-emerald-400",
  send: "text-red-400",
  purchase: "text-red-400",
  reward: "text-amber-400",
  convert: "text-blue-400",
};

const STATUS_META = {
  completed: { label: "Hoàn thành", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  pending:   { label: "Đang xử lý", color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20" },
  failed:    { label: "Thất bại",   color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/20" },
};

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={52}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#sg-${color.replace("#", "")})`}
          dot={false}
          isAnimationActive
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function BalanceCard({ c, index }: { c: CurrencyBalance; index: number }) {
  const Icon = CURRENCY_ICONS[c.id as keyof typeof CURRENCY_ICONS] ?? CreditCard;
  const isPositive = c.growth >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={cn(
        "glass-panel rounded-2xl border p-5 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300",
        c.border, c.glow
      )}
    >
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl", c.bg)} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", c.bg, c.border, "border")}>
            <Icon className={cn("w-5 h-5", c.color)} />
          </div>
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-1 rounded-lg border",
            isPositive ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? "+" : ""}{c.growth}%
          </div>
        </div>

        <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest mb-1">{c.nameVi}</p>
        <p className={cn("text-3xl font-bold tracking-tight transition-colors", c.color)}>
          {c.balance.toLocaleString("vi-VN")}
        </p>
        <p className="text-[10px] font-mono text-muted-foreground/40 mt-0.5">{c.symbol}</p>

        <div className="mt-4 -mx-1">
          <MiniSparkline data={c.history} color={c.chartColor} />
        </div>

        <div className="flex items-center gap-1 mt-2">
          <Clock className="w-3 h-3 text-muted-foreground/30" />
          <span className="text-[10px] font-mono text-muted-foreground/30">Cập nhật: {c.lastUpdated}</span>
        </div>
      </div>
    </motion.div>
  );
}

function TotalPortfolio({ balances }: { balances: CurrencyBalance[] }) {
  const rates: Record<string, number> = { credits: 1, coins: 0.5, tokens: 20, points: 0.1 };
  const totalInCredits = balances.reduce((sum, c) => sum + c.balance * (rates[c.id] ?? 1), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="glass-panel rounded-2xl border border-primary/20 p-5 shadow-[0_0_40px_rgba(var(--primary)/0.08)] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-2xl" />
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-1">Tổng giá trị danh mục</p>
          <p className="text-4xl font-bold text-white neon-text tracking-tight">
            {Math.round(totalInCredits).toLocaleString("vi-VN")}
          </p>
          <p className="text-xs font-mono text-primary/60 mt-0.5">CR — Quy đổi theo Tín dụng</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <div>
            <p className="text-xs font-mono font-bold text-emerald-400">+15.8%</p>
            <p className="text-[10px] font-mono text-muted-foreground/40">Tuần này</p>
          </div>
        </div>
      </div>

      <div className="mt-4 h-1.5 rounded-full overflow-hidden flex gap-0.5 relative z-10">
        {balances.map((c) => {
          const pct = (c.balance * (rates[c.id] ?? 1) / totalInCredits) * 100;
          return <div key={c.id} style={{ width: `${pct}%`, background: c.chartColor }} className="rounded-full" />;
        })}
      </div>
      <div className="flex gap-4 mt-2 flex-wrap relative z-10">
        {balances.map((c) => (
          <div key={c.id} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: c.chartColor }} />
            <span className="text-[10px] font-mono text-muted-foreground/40">{c.nameVi}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function WalletDashboard() {
  const { balances, transactions, isLoading, refreshWallet } = useWallet();
  const recent = transactions.slice(0, 5);

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col relative z-10">
        <Header />

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-2 h-6 bg-primary rounded-sm shadow-[0_0_10px_hsl(var(--primary))]" />
                Tổng quan Ví
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/30 mt-1 tracking-wider">
                4 LOẠI TÀI SẢN · COMMANDER ZARA
              </p>
            </div>
            <button
              onClick={refreshWallet}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-[10px] font-mono text-muted-foreground/50 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest disabled:opacity-40"
              data-testid="button-refresh-wallet"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              {isLoading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>

          <TotalPortfolio balances={balances} />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {balances.map((c, i) => (
              <BalanceCard key={c.id} c={c} index={i} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel rounded-2xl border border-white/5 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Giao dịch gần đây</h3>
              <a href="/wallet/transactions" className="text-[10px] font-mono text-primary/60 hover:text-primary transition-colors tracking-widest uppercase">
                Xem tất cả →
              </a>
            </div>
            <div className="divide-y divide-white/5">
              {recent.map((tx) => {
                const TxIcon = TX_TYPE_ICON[tx.type] ?? ArrowUpRight;
                const sm = STATUS_META[tx.status];
                const isPositive = tx.amount > 0;
                return (
                  <div key={tx.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/2 transition-colors group">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", isPositive ? "bg-emerald-400/10" : "bg-red-400/10")}>
                      <TxIcon className={cn("w-4 h-4", TX_TYPE_COLOR[tx.type])} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white/80 truncate">{tx.note}</p>
                      <p className="text-[10px] font-mono text-muted-foreground/40">{tx.date}</p>
                    </div>
                    <div className={cn("text-[10px] font-mono font-bold px-2 py-0.5 rounded border hidden sm:block", sm.color, sm.bg, sm.border)}>
                      {sm.label}
                    </div>
                    <div className={cn("text-sm font-bold font-mono tabular-nums", isPositive ? "text-emerald-400" : "text-red-400")}>
                      {isPositive ? "+" : ""}{tx.amount.toLocaleString("vi-VN")}
                      <span className="text-[10px] ml-1 opacity-60">{tx.currencyLabel.slice(0, 2).toUpperCase()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
