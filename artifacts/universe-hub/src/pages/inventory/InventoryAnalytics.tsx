import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  PETS, FOOTBALL_PLAYERS, WORLD_ASSETS, TICKETS, ITEMS,
  RARITY_BREAKDOWN, CATEGORY_BREAKDOWN, INVENTORY_VALUE_TREND, INVENTORY_STATS,
} from "@/lib/inventoryMockData";
import { cn } from "@/lib/utils";
import { Package, Star, TrendingUp, Coins, PawPrint, Trophy, Globe, Ticket, Box } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px]" />
  </div>
);

const TS = {
  contentStyle: { background: "rgba(0,0,0,0.88)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11, fontFamily: "monospace" },
  labelStyle: { color: "#fff", fontWeight: "bold" },
  itemStyle: { color: "#9ca3af" },
};
const AS = { tick: { fill: "rgba(255,255,255,0.28)", fontSize: 10, fontFamily: "monospace" }, tickLine: false, axisLine: false };
const fmtK = (v: number) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v);

function ChartCard({ title, subtitle, children, delay = 0 }: { title: string; subtitle: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      className="glass-panel rounded-2xl border border-white/5 p-5">
      <p className="text-sm font-bold text-white uppercase tracking-wider mb-0.5">{title}</p>
      <p className="text-[10px] font-mono text-muted-foreground/40 mb-4">{subtitle}</p>
      {children}
    </motion.div>
  );
}

const RADAR_DATA = [
  { subject: "Thú cưng",    A: 75 },
  { subject: "Cầu thủ",    A: 88 },
  { subject: "Tài sản TG", A: 95 },
  { subject: "Vé",         A: 60 },
  { subject: "Vật phẩm",  A: 72 },
];

const LEGENDARIES_PER_CAT = [
  { name: "Thú cưng",    count: PETS.filter(p => p.rarity === "legendary").length,             color: "#c084fc" },
  { name: "Cầu thủ",    count: FOOTBALL_PLAYERS.filter(p => p.rarity === "legendary").length, color: "#60a5fa" },
  { name: "Tài sản",   count: WORLD_ASSETS.filter(a => a.rarity === "legendary").length,      color: "#34d399" },
  { name: "Vé",         count: TICKETS.filter(t => t.rarity === "legendary").length,           color: "#fbbf24" },
  { name: "Vật phẩm",  count: ITEMS.filter(i => i.rarity === "legendary").length,             color: "#f87171" },
];

export default function InventoryAnalytics() {
  const totalValue = 5_507_000;

  const KPIS = [
    { label: "Tổng vật phẩm",   value: String(INVENTORY_STATS.totalItems),  icon: Package,   color: "text-purple-400", border: "border-purple-400/20" },
    { label: "Tổng giá trị",    value: `${fmtK(totalValue)} CR`,             icon: Coins,     color: "text-emerald-400",border: "border-emerald-400/20" },
    { label: "Huyền thoại",     value: String(INVENTORY_STATS.legendaryCount),icon: Star,    color: "text-amber-400",  border: "border-amber-400/20" },
    { label: "Thu nhập / tuần", value: `${fmtK(INVENTORY_STATS.weeklyIncome)} CR`, icon: TrendingUp, color: "text-cyan-400", border: "border-cyan-400/20" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <BG />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <Header />
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">

          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
              <span className="w-2 h-6 bg-cyan-400 rounded-sm shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
              Phân tích Kho đồ
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">TỔNG QUAN · 5 DANH MỤC · COMMANDER ZARA</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {KPIS.map((kpi, i) => (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className={cn("glass-panel rounded-2xl border p-4", kpi.border)}>
                <kpi.icon className={cn("w-5 h-5 mb-2", kpi.color)} />
                <p className={cn("text-2xl font-bold font-mono", kpi.color)}>{kpi.value}</p>
                <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest mt-1">{kpi.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Row 1: Value trend + Rarity pie */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <ChartCard title="Xu hướng giá trị Kho đồ" subtitle="Tổng giá trị ước tính 6 tháng gần nhất" delay={0.1}>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={INVENTORY_VALUE_TREND} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="inv-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="label" {...AS} />
                    <YAxis {...AS} tickFormatter={fmtK} width={44} />
                    <Tooltip {...TS} formatter={(v: number) => v.toLocaleString("vi-VN") + " CR"} />
                    <Area type="monotone" dataKey="value" name="Giá trị" stroke="#c084fc" strokeWidth={2} fill="url(#inv-grad)"
                      dot={{ fill: "#c084fc", strokeWidth: 0, r: 3 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <ChartCard title="Phân bổ độ hiếm" subtitle="Tất cả danh mục" delay={0.15}>
              <div className="flex flex-col items-center gap-3">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={RARITY_BREAKDOWN} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="count">
                      {RARITY_BREAKDOWN.map((r, i) => <Cell key={i} fill={r.color} stroke="transparent" />)}
                    </Pie>
                    <Tooltip {...TS} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full space-y-1.5">
                  {RARITY_BREAKDOWN.map(r => {
                    const total = RARITY_BREAKDOWN.reduce((s, x) => s + x.count, 0);
                    return (
                      <div key={r.name} className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                        <span className="text-muted-foreground/50 flex-1">{r.name}</span>
                        <span className="text-white/60 tabular-nums">{r.count}</span>
                        <span className="text-muted-foreground/30">({((r.count/total)*100).toFixed(0)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Row 2: Category value bar + Legendary breakdown + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <ChartCard title="Giá trị theo danh mục" subtitle="Phân bổ tổng giá trị kho" delay={0.2}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={CATEGORY_BREAKDOWN} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <XAxis type="number" {...AS} tickFormatter={fmtK} />
                  <YAxis type="category" dataKey="name" {...AS} width={72} />
                  <Tooltip {...TS} formatter={(v: number) => v.toLocaleString("vi-VN") + " CR"} />
                  <Bar dataKey="value" name="Giá trị" radius={[0,4,4,0]}>
                    {CATEGORY_BREAKDOWN.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Vật phẩm Huyền thoại" subtitle="Phân bổ huyền thoại theo danh mục" delay={0.25}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={LEGENDARIES_PER_CAT} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" {...AS} />
                  <YAxis {...AS} width={24} />
                  <Tooltip {...TS} />
                  <Bar dataKey="count" name="Huyền thoại" radius={[4,4,0,0]}>
                    {LEGENDARIES_PER_CAT.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Chỉ số Kho đồ" subtitle="Đánh giá tổng quan theo danh mục" delay={0.3}>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={RADAR_DATA}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9, fontFamily: "monospace" }} />
                  <Radar name="Điểm" dataKey="A" stroke="#c084fc" fill="#c084fc" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip {...TS} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Row 3: Per-category count table */}
          <ChartCard title="Tổng kết theo danh mục" subtitle="Số lượng và giá trị chi tiết" delay={0.35}>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-[10px] font-mono">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Danh mục", "Icon", "Số lượng", "Huyền thoại", "Sử thi", "Tổng giá trị"].map(h => (
                      <th key={h} className="text-left text-muted-foreground/40 uppercase tracking-widest pb-2 pr-6 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Thú cưng",         Icon: PawPrint,  count: PETS.length,             legendary: PETS.filter(p => p.rarity === "legendary").length,             epic: PETS.filter(p => p.rarity === "epic").length,             value: 680000,   color: "text-purple-400" },
                    { label: "Cầu thủ bóng đá",  Icon: Trophy,    count: FOOTBALL_PLAYERS.length, legendary: FOOTBALL_PLAYERS.filter(p => p.rarity === "legendary").length, epic: FOOTBALL_PLAYERS.filter(p => p.rarity === "epic").length, value: 960000,   color: "text-blue-400" },
                    { label: "Tài sản Thế giới", Icon: Globe,     count: WORLD_ASSETS.length,     legendary: WORLD_ASSETS.filter(a => a.rarity === "legendary").length,     epic: WORLD_ASSETS.filter(a => a.rarity === "epic").length,     value: 3204000,  color: "text-emerald-400" },
                    { label: "Vé",               Icon: Ticket,    count: TICKETS.length,           legendary: TICKETS.filter(t => t.rarity === "legendary").length,           epic: TICKETS.filter(t => t.rarity === "epic").length,           value: 243000,   color: "text-amber-400" },
                    { label: "Vật phẩm",        Icon: Box,       count: ITEMS.length,             legendary: ITEMS.filter(i => i.rarity === "legendary").length,             epic: ITEMS.filter(i => i.rarity === "epic").length,             value: 420000,   color: "text-red-400" },
                  ].map((row, i) => (
                    <motion.tr key={row.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }}
                      className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                      <td className="py-3 pr-6">
                        <span className={cn("font-bold", row.color)}>{row.label}</span>
                      </td>
                      <td className="py-3 pr-6">
                        <row.Icon className={cn("w-4 h-4", row.color)} />
                      </td>
                      <td className="py-3 pr-6 text-white/70 font-bold tabular-nums">{row.count}</td>
                      <td className="py-3 pr-6 text-amber-400 font-bold tabular-nums">{row.legendary}</td>
                      <td className="py-3 pr-6 text-purple-400 font-bold tabular-nums">{row.epic}</td>
                      <td className="py-3 text-emerald-400 font-bold tabular-nums">{(row.value/1000).toFixed(0)}K CR</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile version */}
            <div className="sm:hidden space-y-2">
              {CATEGORY_BREAKDOWN.map((cat, i) => (
                <div key={cat.name} className="rounded-xl border border-white/5 p-3 flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: cat.color }}>{cat.name}</span>
                  <div className="text-right">
                    <p className="text-xs font-bold font-mono text-white">{cat.count} vật phẩm</p>
                    <p className="text-[10px] font-mono text-emerald-400">{(cat.value/1000).toFixed(0)}K CR</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

        </main>
      </div>
    </div>
  );
}
