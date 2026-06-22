import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useWallet } from "@/context/WalletContext";
import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Wallet, ArrowDownLeft, ArrowUpRight,
  ArrowLeftRight, BarChart3, RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, Legend,
  LineChart, Line, ReferenceLine,
} from "recharts";

// ─── Styles ──────────────────────────────────────────────────────────────────

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "rgba(0,0,0,0.90)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    fontSize: 11,
    fontFamily: "monospace",
  },
  labelStyle:  { color: "#fff", fontWeight: "bold" },
  itemStyle:   { color: "#9ca3af" },
};

const AXIS_STYLE = {
  tick:     { fill: "rgba(255,255,255,0.28)", fontSize: 10, fontFamily: "monospace" },
  tickLine: false,
  axisLine: false,
};

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtK   = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v);
const fmtVND = (v: number) => v.toLocaleString("vi-VN");

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KpiProps {
  label: string;
  value: string;
  sub: string;
  change: number;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  delay?: number;
}

function KpiCard({ label, value, sub, change, icon: Icon, color, bg, border, delay = 0 }: KpiProps) {
  const isPos = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={cn("glass-panel rounded-2xl border p-5 relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300", border)}
    >
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl", bg)} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border", bg, border)}>
            <Icon className={cn("w-4.5 h-4.5", color)} style={{ width: 18, height: 18 }} />
          </div>
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-1 rounded-lg border",
            isPos
              ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
              : "text-red-400 bg-red-400/10 border-red-400/20"
          )}>
            {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPos ? "+" : ""}{change}%
          </div>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-1">{label}</p>
        <p className={cn("text-2xl font-bold tracking-tight", color)}>{value}</p>
        <p className="text-[10px] font-mono text-muted-foreground/30 mt-0.5">{sub}</p>
      </div>
    </motion.div>
  );
}

// ─── Chart panel ──────────────────────────────────────────────────────────────

function ChartPanel({
  title, subtitle, children, delay = 0, actions,
}: {
  title: string; subtitle: string; children: React.ReactNode; delay?: number; actions?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-panel rounded-2xl border border-white/5 p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
          <p className="text-[10px] font-mono text-muted-foreground/40 mt-0.5">{subtitle}</p>
        </div>
        {actions}
      </div>
      {children}
    </motion.div>
  );
}

// ─── Custom Pie label ─────────────────────────────────────────────────────────

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="rgba(255,255,255,0.8)" textAnchor="middle" dominantBaseline="central" fontSize={10} fontFamily="monospace" fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WalletAnalytics() {
  const { balances, transactions, monthlyFlow, distributionData } = useWallet();

  const [incomePeriod,  setIncomePeriod]  = useState<"monthly" | "weekly">("monthly");
  const [expensePeriod, setExpensePeriod] = useState<"monthly" | "weekly">("monthly");

  const rates: Record<string, number> = { credits: 1, coins: 0.5, tokens: 20, points: 0.1 };

  const totalAssets = useMemo(
    () => balances.reduce((s, b) => s + b.balance * (rates[b.id] ?? 1), 0),
    [balances]
  );

  const latestMonth   = monthlyFlow[monthlyFlow.length - 1];
  const prevMonth     = monthlyFlow[monthlyFlow.length - 2];

  const incomeChange  = prevMonth ? Math.round(((latestMonth.income  - prevMonth.income)  / prevMonth.income)  * 100) : 0;
  const expenseChange = prevMonth ? Math.round(((latestMonth.expense - prevMonth.expense) / prevMonth.expense) * 100) : 0;
  const txChange      = prevMonth ? Math.round(((latestMonth.txCount - prevMonth.txCount) / prevMonth.txCount) * 100) : 0;

  const totalTx = transactions.length;

  const KPIS: KpiProps[] = [
    {
      label:  "Tổng tài sản",
      value:  `${Math.round(totalAssets).toLocaleString("vi-VN")} CR`,
      sub:    "Quy đổi theo Tín dụng",
      change: 15.8,
      icon:   Wallet,
      color:  "text-primary",
      bg:     "bg-primary/10",
      border: "border-primary/20",
      delay:  0,
    },
    {
      label:  "Thu nhập tháng này",
      value:  `${fmtVND(latestMonth.income)} CR`,
      sub:    latestMonth.month,
      change: incomeChange,
      icon:   ArrowDownLeft,
      color:  "text-emerald-400",
      bg:     "bg-emerald-400/10",
      border: "border-emerald-400/20",
      delay:  0.07,
    },
    {
      label:  "Chi tiêu tháng này",
      value:  `${fmtVND(latestMonth.expense)} CR`,
      sub:    latestMonth.month,
      change: -expenseChange,
      icon:   ArrowUpRight,
      color:  "text-red-400",
      bg:     "bg-red-400/10",
      border: "border-red-400/20",
      delay:  0.14,
    },
    {
      label:  "Số giao dịch",
      value:  String(totalTx),
      sub:    `+${latestMonth.txCount} tháng này`,
      change: txChange,
      icon:   ArrowLeftRight,
      color:  "text-cyan-400",
      bg:     "bg-cyan-400/10",
      border: "border-cyan-400/20",
      delay:  0.21,
    },
  ];

  const incomeWeekly = useMemo(() => {
    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    return days.map((d, i) => ({
      label:   d,
      income:  6000 + Math.round(Math.random() * 4000 + i * 800),
      expense: 3500 + Math.round(Math.random() * 2500 + i * 300),
    }));
  }, []);

  const incomeData  = incomePeriod  === "monthly" ? monthlyFlow : incomeWeekly;
  const expenseData = expensePeriod === "monthly" ? monthlyFlow : incomeWeekly;

  const PeriodToggle = ({
    value, onChange,
  }: { value: "monthly" | "weekly"; onChange: (v: "monthly" | "weekly") => void }) => (
    <div className="flex gap-0.5 glass-panel rounded-lg border border-white/10 p-0.5 flex-shrink-0">
      {([["monthly", "6T"] as const, ["weekly", "7N"] as const]).map(([k, l]) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={cn(
            "px-3 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase transition-all",
            value === k ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground/40 hover:text-white"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      {/* BG */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-emerald-500/4 rounded-full blur-[100px]" />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col relative z-10">
        <Header />

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">

          {/* ── Header ────────────────────────────────────────── */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-2 h-6 bg-primary rounded-sm shadow-[0_0_10px_hsl(var(--primary))]" />
                Phân tích Ví
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/30 mt-1 tracking-wider">
                DASHBOARD · 4 TÀI SẢN · 6 THÁNG GẦN NHẤT
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/2">
              <RefreshCw className="w-3 h-3 text-muted-foreground/30" />
              <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">Cập nhật: vừa xong</span>
            </div>
          </div>

          {/* ── KPI cards ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {KPIS.map(kpi => <KpiCard key={kpi.label} {...kpi} />)}
          </div>

          {/* ── Row 1: Asset distribution + Net income bar ────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Pie — 2 cols */}
            <div className="lg:col-span-2">
              <ChartPanel title="Phân bổ Tài sản" subtitle="Tỷ lệ từng loại tiền trong ví" delay={0.1}>
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-5">
                  <div className="flex-shrink-0">
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={82}
                          paddingAngle={3}
                          dataKey="value"
                          labelLine={false}
                          label={PieLabel}
                        >
                          {distributionData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => fmtVND(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    {distributionData.map(d => {
                      const total = distributionData.reduce((s, x) => s + x.value, 0);
                      const pct   = ((d.value / total) * 100).toFixed(1);
                      return (
                        <div key={d.name} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-muted-foreground/60 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                              {d.name}
                            </span>
                            <span className="text-white/70 tabular-nums">{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ background: d.color }}
                            />
                          </div>
                          <p className="text-[10px] font-mono text-muted-foreground/30 tabular-nums text-right">
                            {fmtVND(d.value)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ChartPanel>
            </div>

            {/* Net income bar — 3 cols */}
            <div className="lg:col-span-3">
              <ChartPanel title="Thu nhập ròng hàng tháng" subtitle="Thu nhập − Chi tiêu theo từng tháng" delay={0.15}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyFlow} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="label" {...AXIS_STYLE} />
                    <YAxis {...AXIS_STYLE} tickFormatter={fmtK} width={40} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => fmtVND(v)} />
                    <Legend wrapperStyle={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.4)", paddingTop: 8 }} />
                    <Bar dataKey="income"  name="Thu nhập"  fill="rgba(52,211,153,0.6)"  stroke="#34d399" strokeWidth={1} radius={[3,3,0,0]} />
                    <Bar dataKey="expense" name="Chi tiêu"  fill="rgba(248,113,113,0.5)" stroke="#f87171" strokeWidth={1} radius={[3,3,0,0]} />
                    <Bar dataKey="net"     name="Ròng"      fill="rgba(96,165,250,0.7)"  stroke="#60a5fa" strokeWidth={1} radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartPanel>
            </div>
          </div>

          {/* ── Row 2: Income trend + Expense trend ───────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Income trend */}
            <ChartPanel
              title="Xu hướng Thu nhập"
              subtitle="Tổng thu nhập theo thời gian"
              delay={0.2}
              actions={<PeriodToggle value={incomePeriod} onChange={setIncomePeriod} />}
            >
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={incomeData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad-income" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" {...AXIS_STYLE} />
                  <YAxis {...AXIS_STYLE} tickFormatter={fmtK} width={42} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => fmtVND(v)} />
                  <Area
                    type="monotone" dataKey="income" name="Thu nhập"
                    stroke="#34d399" strokeWidth={2}
                    fill="url(#grad-income)" dot={{ fill: "#34d399", strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: "#34d399" }}
                  />
                </AreaChart>
              </ResponsiveContainer>

              {/* Mini stat row */}
              <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/5">
                {[
                  { label: "Cao nhất", value: Math.max(...monthlyFlow.map(m => m.income)), color: "text-emerald-400" },
                  { label: "Thấp nhất", value: Math.min(...monthlyFlow.map(m => m.income)), color: "text-emerald-300" },
                  { label: "Trung bình", value: Math.round(monthlyFlow.reduce((s, m) => s + m.income, 0) / monthlyFlow.length), color: "text-emerald-200" },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className={cn("text-sm font-bold font-mono tabular-nums", s.color)}>{fmtK(s.value)}</p>
                    <p className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </ChartPanel>

            {/* Expense trend */}
            <ChartPanel
              title="Xu hướng Chi tiêu"
              subtitle="Tổng chi tiêu theo thời gian"
              delay={0.25}
              actions={<PeriodToggle value={expensePeriod} onChange={setExpensePeriod} />}
            >
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={expenseData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad-expense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f87171" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" {...AXIS_STYLE} />
                  <YAxis {...AXIS_STYLE} tickFormatter={fmtK} width={42} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => fmtVND(v)} />
                  <Area
                    type="monotone" dataKey="expense" name="Chi tiêu"
                    stroke="#f87171" strokeWidth={2}
                    fill="url(#grad-expense)" dot={{ fill: "#f87171", strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: "#f87171" }}
                  />
                </AreaChart>
              </ResponsiveContainer>

              {/* Mini stat row */}
              <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/5">
                {[
                  { label: "Cao nhất",  value: Math.max(...monthlyFlow.map(m => m.expense)), color: "text-red-400" },
                  { label: "Thấp nhất", value: Math.min(...monthlyFlow.map(m => m.expense)), color: "text-red-300" },
                  { label: "Trung bình",value: Math.round(monthlyFlow.reduce((s, m) => s + m.expense, 0) / monthlyFlow.length), color: "text-red-200" },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className={cn("text-sm font-bold font-mono tabular-nums", s.color)}>{fmtK(s.value)}</p>
                    <p className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </ChartPanel>
          </div>

          {/* ── Row 3: Monthly summary table ──────────────────── */}
          <ChartPanel title="Tổng kết hàng tháng" subtitle="Chi tiết dòng tiền 6 tháng gần nhất" delay={0.3}>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-[10px] font-mono">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Tháng", "Thu nhập", "Chi tiêu", "Thu nhập ròng", "Tỷ lệ tiết kiệm", "Số GD"].map(h => (
                      <th key={h} className="text-left text-muted-foreground/40 uppercase tracking-widest pb-2 pr-6 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...monthlyFlow].reverse().map((m, i) => {
                    const savingRate = ((m.net / m.income) * 100).toFixed(1);
                    const isLatest   = i === 0;
                    return (
                      <motion.tr
                        key={m.label}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.04 }}
                        className={cn("border-b border-white/5 last:border-0", isLatest && "bg-primary/5")}
                      >
                        <td className="py-3 pr-6">
                          <span className={cn("font-bold", isLatest ? "text-primary" : "text-white/70")}>{m.month}</span>
                          {isLatest && <span className="ml-2 text-[9px] text-primary/60 border border-primary/30 rounded px-1 py-0.5">HIỆN TẠI</span>}
                        </td>
                        <td className="py-3 pr-6 text-emerald-400 font-bold tabular-nums">+{fmtVND(m.income)}</td>
                        <td className="py-3 pr-6 text-red-400 font-bold tabular-nums">−{fmtVND(m.expense)}</td>
                        <td className={cn("py-3 pr-6 font-bold tabular-nums", m.net >= 0 ? "text-blue-400" : "text-red-400")}>
                          {m.net >= 0 ? "+" : "−"}{fmtVND(Math.abs(m.net))}
                        </td>
                        <td className="py-3 pr-6">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden max-w-[60px]">
                              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${savingRate}%` }} />
                            </div>
                            <span className="text-emerald-400 font-bold">{savingRate}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-cyan-400 font-bold tabular-nums">{m.txCount}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {[...monthlyFlow].reverse().map((m, i) => {
                const savingRate = ((m.net / m.income) * 100).toFixed(1);
                const isLatest   = i === 0;
                return (
                  <div key={m.label} className={cn("rounded-xl border border-white/5 p-3 space-y-2", isLatest && "border-primary/30 bg-primary/5")}>
                    <div className="flex items-center justify-between">
                      <span className={cn("text-xs font-bold", isLatest ? "text-primary" : "text-white/70")}>{m.month}</span>
                      {isLatest && <span className="text-[9px] text-primary/60 border border-primary/30 rounded px-1 py-0.5 font-mono">HIỆN TẠI</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-[10px] font-mono text-emerald-400 font-bold">+{fmtK(m.income)}</p>
                        <p className="text-[9px] font-mono text-muted-foreground/30">Thu nhập</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-red-400 font-bold">−{fmtK(m.expense)}</p>
                        <p className="text-[9px] font-mono text-muted-foreground/30">Chi tiêu</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-blue-400 font-bold">+{fmtK(m.net)}</p>
                        <p className="text-[9px] font-mono text-muted-foreground/30">Ròng</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartPanel>

        </main>
      </div>
    </div>
  );
}
