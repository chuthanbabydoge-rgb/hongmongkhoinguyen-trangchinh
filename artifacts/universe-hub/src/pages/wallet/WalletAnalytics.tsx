import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useWallet } from "@/context/WalletContext";
import { cn } from "@/lib/utils";
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line,
} from "recharts";

const TOOLTIP_STYLE = {
  contentStyle: { background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11, fontFamily: "monospace" },
  labelStyle:   { color: "#fff", fontWeight: "bold" },
  itemStyle:    { color: "#9ca3af" },
};

function ChartPanel({ title, subtitle, children, delay = 0 }: { title: string; subtitle: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-panel rounded-2xl border border-white/5 p-5"
    >
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
        <p className="text-[10px] font-mono text-muted-foreground/40 mt-0.5">{subtitle}</p>
      </div>
      {children}
    </motion.div>
  );
}

const AXIS_STYLE = { tick: { fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" }, tickLine: false, axisLine: false };

export default function WalletAnalytics() {
  const { balances, analyticsWeekly, analyticsMonthly, distributionData } = useWallet();
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const data = period === "weekly" ? analyticsWeekly : analyticsMonthly;

  const totalPortfolio = balances.reduce((s, c) => {
    const rates: Record<string, number> = { credits: 1, coins: 0.5, tokens: 20, points: 0.1 };
    return s + c.balance * (rates[c.id] ?? 1);
  }, 0);

  const KPIS = [
    { label: "Tổng danh mục (CR)", value: Math.round(totalPortfolio).toLocaleString("vi-VN"), color: "text-primary",   change: "+15.8%" },
    { label: "Tăng trưởng Token",  value: "+24.1%",                                            color: "text-purple-400", change: "Tuần này" },
    { label: "Giao dịch / Ngày",   value: "5.2",                                               color: "text-cyan-400",   change: "+1.3" },
    { label: "Điểm thưởng / Ngày", value: "245",                                               color: "text-amber-400",  change: "+31.5%" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col relative z-10">
        <Header />

        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-2 h-6 bg-primary rounded-sm shadow-[0_0_10px_hsl(var(--primary))]" />
                Phân tích Ví
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/30 mt-1 tracking-wider">
                BIỂU ĐỒ THỜI GIAN THỰC · 4 LOẠI TÀI SẢN
              </p>
            </div>
            <div className="flex gap-1 glass-panel rounded-xl border border-white/10 p-1">
              {([["weekly", "7 ngày"], ["monthly", "6 tháng"]] as const).map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setPeriod(k)}
                  className={cn("px-4 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase transition-all", period === k ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground/40 hover:text-white")}
                  data-testid={`button-period-${k}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {KPIS.map((kpi, i) => (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="glass-panel rounded-xl border border-white/5 p-4">
                <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-1">{kpi.label}</p>
                <p className={cn("text-2xl font-bold font-mono", kpi.color)}>{kpi.value}</p>
                <p className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />{kpi.change}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartPanel title="Biến động số dư" subtitle="Tất cả tài sản theo thời gian (quy đổi CR)" delay={0.1}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    {[["credits","#60a5fa"],["coins","#22d3ee"],["tokens","#c084fc"],["points","#fbbf24"]].map(([k,c]) => (
                      <linearGradient key={k} id={`ag-${k}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={c} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={c} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" {...AXIS_STYLE} />
                  <YAxis {...AXIS_STYLE} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} width={40} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="credits" stroke="#60a5fa" strokeWidth={1.5} fill="url(#ag-credits)" name="Tín dụng" />
                  <Area type="monotone" dataKey="coins"   stroke="#22d3ee" strokeWidth={1.5} fill="url(#ag-coins)"   name="Xu" />
                  <Area type="monotone" dataKey="tokens"  stroke="#c084fc" strokeWidth={1.5} fill="url(#ag-tokens)"  name="Token" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="Khối lượng Giao dịch" subtitle="Tổng giá trị giao dịch theo kỳ" delay={0.15}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" {...AXIS_STYLE} />
                  <YAxis {...AXIS_STYLE} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} width={40} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="volume" fill="rgba(96,165,250,0.6)" stroke="#60a5fa" strokeWidth={1} radius={[4,4,0,0]} name="Khối lượng (CR)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartPanel title="Phân bổ Tài sản" subtitle="Tỷ lệ từng loại tiền trong ví" delay={0.2}>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={distributionData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                      {distributionData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip {...TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {distributionData.map(d => {
                    const total = distributionData.reduce((s, x) => s + x.value, 0);
                    const pct = ((d.value / total) * 100).toFixed(1);
                    return (
                      <div key={d.name} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-muted-foreground/60 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                            {d.name}
                          </span>
                          <span className="text-white/70">{pct}%</span>
                        </div>
                        <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ChartPanel>

            <ChartPanel title="Điểm thưởng tích lũy" subtitle="Xu hướng điểm thưởng theo thời gian" delay={0.25}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" {...AXIS_STYLE} />
                  <YAxis {...AXIS_STYLE} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} width={40} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="points" stroke="#fbbf24" strokeWidth={2} dot={{ fill: "#fbbf24", strokeWidth: 0, r: 3 }} activeDot={{ r: 5 }} name="Điểm thưởng" />
                </LineChart>
              </ResponsiveContainer>
            </ChartPanel>
          </div>
        </main>
      </div>
    </div>
  );
}
