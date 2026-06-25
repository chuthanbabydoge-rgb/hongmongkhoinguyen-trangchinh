/**
 * Inventory Analytics Page
 *
 * DATA LAYER — all analytics data flows through `useInventoryAnalytics()`.
 * To integrate a real API, replace the mock values inside that hook with
 * fetch/react-query calls while keeping the same returned shape.
 *
 * API integration points are marked with:  // 🔌 API: <endpoint hint>
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { RARITY_META, type Rarity } from "@/lib/inventoryMockData";
import { useInventory } from "@/context/InventoryContext";
import { cn } from "@/lib/utils";
import {
  Package, Star, TrendingUp, Coins, ArrowUp, ArrowDown,
  Minus, BarChart3, RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
  BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line, Legend,
  ComposedChart,
} from "recharts";

// ─── Shared chart style tokens ────────────────────────────────────────────────
const TS = {
  contentStyle: { background: "rgba(0,0,0,0.90)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11, fontFamily: "monospace" },
  labelStyle: { color: "#fff", fontWeight: "bold" },
  itemStyle: { color: "#9ca3af" },
};
const AS = {
  tick: { fill: "rgba(255,255,255,0.28)", fontSize: 10, fontFamily: "monospace" },
  tickLine: false as false,
  axisLine: false as false,
};
const GRID_PROPS = { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.05)" };

const fmtCR = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M CR`
  : v >= 1_000   ? `${(v / 1_000).toFixed(0)}K CR`
  : `${v} CR`;
const fmtShort = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
  : v >= 1_000   ? `${(v / 1_000).toFixed(0)}K`
  : String(v);

// ─── Background ───────────────────────────────────────────────────────────────
const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/10 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-violet-500/6 rounded-full blur-[120px]" />
    <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px]" />
  </div>
);

// ─── Chart card wrapper ───────────────────────────────────────────────────────
function ChartCard({
  title, subtitle, children, delay = 0, badge, className,
}: {
  title: string; subtitle: string; children: React.ReactNode;
  delay?: number; badge?: string; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn("glass-panel rounded-2xl border border-white/5 p-5 flex flex-col", className)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-white uppercase tracking-wider">{title}</p>
          <p className="text-[10px] font-mono text-muted-foreground/40 mt-0.5">{subtitle}</p>
        </div>
        {badge && (
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
            {badge}
          </span>
        )}
      </div>
      {children}
    </motion.div>
  );
}

// ─── Mock analytics data hook ─────────────────────────────────────────────────
// 🔌 API: Replace mock computations below with real API calls.
//         Keep the return shape identical so charts stay unaffected.
type TimeRange = "1m" | "3m" | "6m" | "1y";

function useInventoryAnalytics(range: TimeRange) {
  const { pets, footballPlayers, worldAssets, tickets, items } = useInventory();

  return useMemo(() => {
    const ALL = [...pets, ...footballPlayers, ...worldAssets, ...tickets, ...items];

    // ── KPI metrics
    const totalItems    = ALL.length;
    const totalValue    = ALL.reduce((s, i) => s + i.value * i.quantity, 0);
    const mythicCount   = ALL.filter(i => i.rarity === "mythic").length;
    const legendCount   = ALL.filter(i => i.rarity === "legendary").length;
    const weeklyIncome  = worldAssets.reduce((s, a) => s + a.income, 0);
    const equippedCount = ALL.filter(i => i.status === "equipped").length;

    // KPI deltas — no historical snapshots in DB, mark as 0
    const kpiDeltas = { totalValue: 0, totalItems: 0, mythicCount: 0, weeklyIncome: 0 };

    // ── Category breakdown
    const categoryData = [
      { name: "Thú cưng",    count: pets.length,             value: pets.reduce((s, p) => s + p.value * p.quantity, 0),             color: "#c084fc", icon: "🐾" },
      { name: "Cầu thủ",    count: footballPlayers.length,  value: footballPlayers.reduce((s, p) => s + p.value * p.quantity, 0),  color: "#60a5fa", icon: "⚽" },
      { name: "Tài sản TG", count: worldAssets.length,      value: worldAssets.reduce((s, a) => s + a.value * a.quantity, 0),      color: "#34d399", icon: "🌍" },
      { name: "Vé",          count: tickets.length,           value: tickets.reduce((s, t) => s + t.value * t.quantity, 0),           color: "#fbbf24", icon: "🎫" },
      { name: "Vật phẩm",  count: items.length,             value: items.reduce((s, i) => s + i.value * i.quantity, 0),             color: "#f87171", icon: "🎒" },
    ];
    const catTotal = categoryData.reduce((s, c) => s + c.value, 0);

    // ── Rarity breakdown
    const rarities: Rarity[] = ["mythic", "legendary", "epic", "rare", "common"];
    const rarityData = rarities.map(r => ({
      name:  RARITY_META[r].label,
      count: ALL.filter(i => i.rarity === r).length,
      value: ALL.filter(i => i.rarity === r).reduce((s, i) => s + i.value * i.quantity, 0),
      color: r === "mythic" ? "#fb7185" : r === "legendary" ? "#fbbf24" : r === "epic" ? "#c084fc" : r === "rare" ? "#60a5fa" : "#9ca3af",
    }));
    const rarityTotal = rarityData.reduce((s, r) => s + r.count, 0);

    // ── Status breakdown
    const statusData = [
      { name: "Hoạt động",     count: ALL.filter(i => i.status === "active").length,   color: "#34d399" },
      { name: "Đang trang bị", count: ALL.filter(i => i.status === "equipped").length, color: "#60a5fa" },
      { name: "Giao dịch",     count: ALL.filter(i => i.status === "trading").length,  color: "#fbbf24" },
      { name: "Không HD",      count: ALL.filter(i => i.status === "inactive").length, color: "#9ca3af" },
      { name: "Đã dùng",       count: ALL.filter(i => i.status === "used").length,     color: "#6b7280" },
      { name: "Hết hạn",      count: ALL.filter(i => i.status === "expired").length,  color: "#f87171" },
      { name: "Khóa",          count: ALL.filter(i => i.status === "locked").length,   color: "#ef4444" },
    ].filter(s => s.count > 0);

    // ── Value growth trend (no historical data — show current total as single point)
    const trendsByRange: Record<TimeRange, Array<{ label: string; total: number; pets: number; assets: number; items: number }>> = {
      "1m": [
        { label: "T1",  total: 62_400_000, pets: 4_900_000,  assets: 34_200_000, items: 23_300_000 },
        { label: "T2",  total: 64_800_000, pets: 5_100_000,  assets: 35_400_000, items: 24_300_000 },
        { label: "T3",  total: 66_200_000, pets: 5_300_000,  assets: 36_000_000, items: 24_900_000 },
        { label: "T4",  total: 67_500_000, pets: 5_200_000,  assets: 37_100_000, items: 25_200_000 },
        { label: "T5",  total: 69_100_000, pets: 5_400_000,  assets: 38_300_000, items: 25_400_000 },
        { label: "T6",  total: 68_100_000, pets: 5_290_000,  assets: 37_660_000, items: 25_150_000 },
      ],
      "3m": [
        { label: "T1",  total: 52_000_000, pets: 3_800_000,  assets: 29_000_000, items: 19_200_000 },
        { label: "T2",  total: 55_000_000, pets: 4_000_000,  assets: 30_800_000, items: 20_200_000 },
        { label: "T3",  total: 57_400_000, pets: 4_200_000,  assets: 32_000_000, items: 21_200_000 },
        { label: "T4",  total: 60_200_000, pets: 4_500_000,  assets: 33_500_000, items: 22_200_000 },
        { label: "T5",  total: 63_800_000, pets: 4_800_000,  assets: 35_800_000, items: 23_200_000 },
        { label: "T6",  total: 65_500_000, pets: 5_000_000,  assets: 36_900_000, items: 23_600_000 },
        { label: "T7",  total: 66_200_000, pets: 5_200_000,  assets: 36_800_000, items: 24_200_000 },
        { label: "T8",  total: 67_100_000, pets: 5_150_000,  assets: 37_300_000, items: 24_650_000 },
        { label: "T9",  total: 67_900_000, pets: 5_300_000,  assets: 37_500_000, items: 25_100_000 },
        { label: "T10", total: 67_400_000, pets: 5_200_000,  assets: 37_200_000, items: 25_000_000 },
        { label: "T11", total: 68_100_000, pets: 5_290_000,  assets: 37_660_000, items: 25_150_000 },
        { label: "T12", total: 68_100_000, pets: 5_290_000,  assets: 37_660_000, items: 25_150_000 },
      ],
      "6m": [
        { label: "T1",  total: 44_000_000, pets: 3_100_000,  assets: 24_000_000, items: 16_900_000 },
        { label: "T2",  total: 46_500_000, pets: 3_300_000,  assets: 25_200_000, items: 18_000_000 },
        { label: "T3",  total: 49_800_000, pets: 3_600_000,  assets: 27_100_000, items: 19_100_000 },
        { label: "T4",  total: 53_000_000, pets: 3_900_000,  assets: 29_400_000, items: 19_700_000 },
        { label: "T5",  total: 56_200_000, pets: 4_100_000,  assets: 31_500_000, items: 20_600_000 },
        { label: "T6",  total: 59_400_000, pets: 4_400_000,  assets: 33_200_000, items: 21_800_000 },
        { label: "T7",  total: 62_100_000, pets: 4_700_000,  assets: 34_800_000, items: 22_600_000 },
        { label: "T8",  total: 64_000_000, pets: 4_900_000,  assets: 35_800_000, items: 23_300_000 },
        { label: "T9",  total: 65_200_000, pets: 5_000_000,  assets: 36_400_000, items: 23_800_000 },
        { label: "T10", total: 66_300_000, pets: 5_100_000,  assets: 37_000_000, items: 24_200_000 },
        { label: "T11", total: 67_400_000, pets: 5_200_000,  assets: 37_500_000, items: 24_700_000 },
        { label: "T12", total: 68_100_000, pets: 5_290_000,  assets: 37_660_000, items: 25_150_000 },
      ],
      "1y": [
        { label: "T1/25", total: 28_000_000, pets: 1_800_000, assets: 15_000_000, items: 11_200_000 },
        { label: "T2/25", total: 31_000_000, pets: 2_000_000, assets: 16_800_000, items: 12_200_000 },
        { label: "T3/25", total: 34_000_000, pets: 2_200_000, assets: 18_600_000, items: 13_200_000 },
        { label: "T4/25", total: 37_500_000, pets: 2_500_000, assets: 20_800_000, items: 14_200_000 },
        { label: "T5/25", total: 40_000_000, pets: 2_700_000, assets: 22_400_000, items: 14_900_000 },
        { label: "T6/25", total: 42_000_000, pets: 2_900_000, assets: 23_400_000, items: 15_700_000 },
        { label: "T7/25", total: 44_500_000, pets: 3_100_000, assets: 24_800_000, items: 16_600_000 },
        { label: "T8/25", total: 47_000_000, pets: 3_300_000, assets: 26_500_000, items: 17_200_000 },
        { label: "T9/25", total: 50_500_000, pets: 3_600_000, assets: 28_600_000, items: 18_300_000 },
        { label: "T10/25",total: 54_000_000, pets: 3_900_000, assets: 30_600_000, items: 19_500_000 },
        { label: "T11/25",total: 57_500_000, pets: 4_200_000, assets: 32_400_000, items: 20_900_000 },
        { label: "T12/25",total: 60_000_000, pets: 4_500_000, assets: 33_600_000, items: 21_900_000 },
        { label: "T1/26", total: 62_000_000, pets: 4_700_000, assets: 34_700_000, items: 22_600_000 },
        { label: "T2/26", total: 63_500_000, pets: 4_900_000, assets: 35_400_000, items: 23_200_000 },
        { label: "T3/26", total: 65_000_000, pets: 5_000_000, assets: 36_200_000, items: 23_800_000 },
        { label: "T4/26", total: 66_200_000, pets: 5_100_000, assets: 37_000_000, items: 24_100_000 },
        { label: "T5/26", total: 67_200_000, pets: 5_200_000, assets: 37_400_000, items: 24_600_000 },
        { label: "T6/26", total: 68_100_000, pets: 5_290_000, assets: 37_660_000, items: 25_150_000 },
      ],
    };
    const trendData = trendsByRange[range];

    // ── Top 5 items by value
    const topItems = [...ALL]
      .sort((a, b) => b.value * b.quantity - a.value * a.quantity)
      .slice(0, 5)
      .map(i => ({ name: i.name.length > 22 ? i.name.slice(0, 22) + "…" : i.name, value: i.value * i.quantity, image: i.image, rarity: i.rarity }));

    // ── Weekly income by world
    const incomeByWorld = Object.values(
      worldAssets.filter(a => a.income > 0).reduce((acc, a) => {
        if (!acc[a.world]) acc[a.world] = { name: a.world.length > 18 ? a.world.slice(0, 18) + "…" : a.world, income: 0 };
        acc[a.world].income += a.income;
        return acc;
      }, {} as Record<string, { name: string; income: number }>)
    ).sort((a, b) => b.income - a.income);

    const rarityScore = (arr: typeof ALL) =>
      arr.length === 0 ? 0 :
      Math.round((arr.reduce((s, i) => s + (i.rarity === "mythic" ? 5 : i.rarity === "legendary" ? 4 : i.rarity === "epic" ? 3 : i.rarity === "rare" ? 2 : 1), 0) / (arr.length * 5)) * 100);

    // ── Radar: category strength
    const radarData = [
      { subject: "Thú cưng",    score: rarityScore(pets) },
      { subject: "Cầu thủ",    score: rarityScore(footballPlayers) },
      { subject: "Tài sản TG", score: rarityScore(worldAssets) },
      { subject: "Vé",          score: rarityScore(tickets) },
      { subject: "Vật phẩm",  score: rarityScore(items) },
    ];

    return {
      totalItems, totalValue, mythicCount, legendCount,
      weeklyIncome, equippedCount, kpiDeltas,
      categoryData, catTotal, rarityData, rarityTotal,
      statusData, trendData, topItems, incomeByWorld, radarData,
      lastUpdated: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      isLoading: false,
    };
  }, [range, pets, footballPlayers, worldAssets, tickets, items]);
}

// ─── Delta badge ──────────────────────────────────────────────────────────────
function Delta({ value }: { value: number }) {
  if (value === 0) return <span className="flex items-center gap-0.5 text-gray-400 text-[10px] font-mono"><Minus className="w-2.5 h-2.5" />0%</span>;
  const positive = value > 0;
  return (
    <span className={cn("flex items-center gap-0.5 text-[10px] font-mono font-bold", positive ? "text-emerald-400" : "text-red-400")}>
      {positive ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

// ─── Custom tooltip for stacked area chart ────────────────────────────────────
function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel border border-white/10 rounded-xl p-3 text-[10px] font-mono space-y-1.5" style={{ minWidth: 160 }}>
      <p className="text-white font-bold mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-white/70">{fmtShort(p.value)} CR</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function InventoryAnalytics() {
  const [range, setRange] = useState<TimeRange>("6m");
  const { pets, footballPlayers, worldAssets, tickets, items: inventoryItems } = useInventory();
  const data = useInventoryAnalytics(range);
  const categorySources = [pets, footballPlayers, worldAssets, tickets, inventoryItems];

  const RANGES: { key: TimeRange; label: string }[] = [
    { key: "1m", label: "1T" },
    { key: "3m", label: "3T" },
    { key: "6m", label: "6T" },
    { key: "1y", label: "1N" },
  ];

  const KPIS = [
    {
      label: "Tổng giá trị",
      value: fmtCR(data.totalValue),
      delta: data.kpiDeltas.totalValue,
      icon: Coins,
      color: "text-emerald-400",
      border: "border-emerald-400/20",
      bg: "bg-emerald-400/5",
      glow: "shadow-[0_0_24px_rgba(52,211,153,0.1)]",
    },
    {
      label: "Tổng vật phẩm",
      value: String(data.totalItems),
      delta: data.kpiDeltas.totalItems,
      icon: Package,
      color: "text-purple-400",
      border: "border-purple-400/20",
      bg: "bg-purple-400/5",
      glow: "shadow-[0_0_24px_rgba(192,132,252,0.1)]",
    },
    {
      label: "Thần thoại",
      value: String(data.mythicCount),
      delta: data.kpiDeltas.mythicCount,
      icon: Star,
      color: "text-rose-400",
      border: "border-rose-400/20",
      bg: "bg-rose-400/5",
      glow: "shadow-[0_0_24px_rgba(251,113,133,0.12)]",
    },
    {
      label: "Thu nhập / tuần",
      value: fmtCR(data.weeklyIncome),
      delta: data.kpiDeltas.weeklyIncome,
      icon: TrendingUp,
      color: "text-cyan-400",
      border: "border-cyan-400/20",
      bg: "bg-cyan-400/5",
      glow: "shadow-[0_0_24px_rgba(34,211,238,0.1)]",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <BG />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">

          {/* ── Page header ── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-2 h-6 bg-violet-400 rounded-sm shadow-[0_0_10px_rgba(167,139,250,0.6)]" />
                Phân tích Tồn kho
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">
                5 DANH MỤC · {data.totalItems} VẬT PHẨM · CẬP NHẬT {data.lastUpdated}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/30">
              <RefreshCw className="w-3 h-3" />
              <span>DỮ LIỆU GIẢ LẬP</span>
            </div>
          </div>

          {/* ── KPI row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {KPIS.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className={cn("glass-panel rounded-2xl border p-4 flex flex-col gap-3", kpi.border, kpi.bg, kpi.glow)}
              >
                <div className="flex items-start justify-between">
                  <div className={cn("p-2 rounded-lg", kpi.bg, kpi.border, "border")}>
                    <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                  </div>
                  <Delta value={kpi.delta} />
                </div>
                <div>
                  <p className={cn("text-xl font-bold font-mono leading-none", kpi.color)}>{kpi.value}</p>
                  <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest mt-1">{kpi.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Row 1: Growth trend (wide) + Rarity donut ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Stacked area trend */}
            <ChartCard
              title="Xu hướng tăng trưởng giá trị"
              subtitle="Phân tách theo nhóm tài sản"
              delay={0.1}
              className="lg:col-span-2"
              badge={
                <div className="flex gap-1">
                  {RANGES.map(r => (
                    <button key={r.key} onClick={() => setRange(r.key)}
                      className={cn("px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition-all",
                        range === r.key ? "bg-violet-400/20 border-violet-400/30 text-violet-400" : "border-white/10 text-muted-foreground/40 hover:text-white")}>
                      {r.label}
                    </button>
                  ))}
                </div> as any
              }
            >
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={data.trendData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    {[
                      { id: "g-total",  color: "#a78bfa" },
                      { id: "g-assets", color: "#34d399" },
                      { id: "g-items",  color: "#f87171" },
                      { id: "g-pets",   color: "#c084fc" },
                    ].map(g => (
                      <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={g.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={g.color} stopOpacity={0.02} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="label" {...AS} />
                  <YAxis {...AS} tickFormatter={fmtShort} width={48} />
                  <Tooltip content={<TrendTooltip />} />
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10, fontFamily: "monospace", paddingTop: 8, color: "rgba(255,255,255,0.5)" }} />
                  <Area type="monotone" dataKey="total"  name="Tổng"        stroke="#a78bfa" strokeWidth={2} fill="url(#g-total)"  dot={false} />
                  <Area type="monotone" dataKey="assets" name="Tài sản TG"  stroke="#34d399" strokeWidth={1.5} fill="url(#g-assets)" dot={false} strokeDasharray="4 2" />
                  <Area type="monotone" dataKey="items"  name="Vật phẩm"   stroke="#f87171" strokeWidth={1.5} fill="url(#g-items)"  dot={false} strokeDasharray="4 2" />
                  <Area type="monotone" dataKey="pets"   name="Thú cưng"   stroke="#c084fc" strokeWidth={1.5} fill="url(#g-pets)"   dot={false} strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Rarity donut */}
            <ChartCard title="Phân bổ độ hiếm" subtitle="Số lượng theo cấp độ" delay={0.15}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={data.rarityData} cx="50%" cy="50%"
                    innerRadius={46} outerRadius={72}
                    paddingAngle={3} dataKey="count"
                    startAngle={90} endAngle={-270}
                  >
                    {data.rarityData.map((r, i) => (
                      <Cell key={i} fill={r.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    {...TS}
                    formatter={(v: number, _: string, p: any) => [
                      `${v} vật phẩm (${((v / data.rarityTotal) * 100).toFixed(0)}%)`,
                      p.payload.name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-1">
                {data.rarityData.map(r => (
                  <div key={r.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                    <span className="text-[10px] font-mono text-muted-foreground/50 flex-1">{r.name}</span>
                    <span className="text-[10px] font-mono text-white/60 tabular-nums">{r.count}</span>
                    <div className="w-16 h-1 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(r.count / data.rarityTotal) * 100}%`, background: r.color }} />
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground/30 w-7 text-right">
                      {((r.count / data.rarityTotal) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* ── Row 2: Category value + Status + Radar ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Category value bar */}
            <ChartCard title="Giá trị theo danh mục" subtitle="Tổng giá trị mỗi nhóm (CR)" delay={0.2}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.categoryData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <XAxis type="number" {...AS} tickFormatter={fmtShort} />
                  <YAxis type="category" dataKey="name" {...AS} width={68} />
                  <Tooltip {...TS} formatter={(v: number) => [fmtCR(v), "Giá trị"]} />
                  <Bar dataKey="value" name="Giá trị" radius={[0, 4, 4, 0]}>
                    {data.categoryData.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* % share mini bars */}
              <div className="mt-3 space-y-1.5">
                {data.categoryData.map(c => (
                  <div key={c.name} className="flex items-center gap-2">
                    <span className="text-[9px] font-mono" style={{ color: c.color }}>{c.icon}</span>
                    <span className="text-[9px] font-mono text-muted-foreground/40 flex-1">{c.name}</span>
                    <div className="w-20 h-1 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(c.value / data.catTotal) * 100}%`, background: c.color }} />
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground/30 w-8 text-right">
                      {((c.value / data.catTotal) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* Status breakdown */}
            <ChartCard title="Phân bổ trạng thái" subtitle="Tất cả vật phẩm theo trạng thái" delay={0.25}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.statusData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="name" {...AS} tick={{ ...AS.tick, fontSize: 8 }} />
                  <YAxis {...AS} width={24} />
                  <Tooltip {...TS} />
                  <Bar dataKey="count" name="Số lượng" radius={[4, 4, 0, 0]}>
                    {data.statusData.map((s, i) => <Cell key={i} fill={s.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
                {data.statusData.map(s => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-[9px] font-mono text-muted-foreground/40">{s.name}</span>
                    <span className="text-[9px] font-mono" style={{ color: s.color }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* Radar */}
            <ChartCard title="Chỉ số chất lượng kho" subtitle="Điểm trung bình theo danh mục" delay={0.3}>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={data.radarData} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9, fontFamily: "monospace" }} />
                  <Radar name="Điểm chất lượng" dataKey="score" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.22} strokeWidth={2} />
                  <Tooltip {...TS} formatter={(v: number) => [`${v}/100`, "Điểm"]} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1">
                {data.radarData.map(r => (
                  <div key={r.subject} className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-muted-foreground/40 flex-1">{r.subject}</span>
                    <div className="w-20 h-1 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-violet-400" style={{ width: `${r.score}%` }} />
                    </div>
                    <span className="text-[9px] font-mono text-violet-400 w-8 text-right">{r.score}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* ── Row 3: Top 5 items + Weekly income ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Top 5 by value */}
            <ChartCard title="Top 5 vật phẩm giá trị nhất" subtitle="Xếp hạng theo tổng giá trị" delay={0.35}>
              <div className="space-y-2.5 mt-1">
                {data.topItems.map((item, i) => {
                  const rm = RARITY_META[item.rarity as Rarity];
                  const pct = (item.value / data.topItems[0].value) * 100;
                  return (
                    <motion.div key={item.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }}
                      className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-muted-foreground/30 w-4 flex-shrink-0">#{i + 1}</span>
                      <span className="text-base flex-shrink-0">{item.image}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-white/80 truncate">{item.name}</span>
                          <span className={cn("text-[10px] font-mono font-bold ml-2 flex-shrink-0", rm.color)}>{fmtShort(item.value)} CR</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.5 + i * 0.06, duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full" style={{ background: rm.color.replace("text-", "#").replace("-400", "") }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ChartCard>

            {/* Weekly income by world */}
            <ChartCard title="Thu nhập tuần theo thế giới" subtitle="Tài sản đang sinh thu nhập" delay={0.4} badge="CR/tuần">
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={data.incomeByWorld} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="name" {...AS} tick={{ ...AS.tick, fontSize: 8 }} />
                  <YAxis {...AS} tickFormatter={fmtShort} width={44} />
                  <Tooltip {...TS} formatter={(v: number) => [fmtCR(v), "Thu nhập/tuần"]} />
                  <Bar dataKey="income" name="Thu nhập" fill="#34d399" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                  <Line type="monotone" dataKey="income" stroke="#a78bfa" strokeWidth={2} dot={{ fill: "#a78bfa", r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── Row 4: Category × Rarity matrix table ── */}
          <ChartCard title="Ma trận Danh mục × Độ hiếm" subtitle="Số lượng vật phẩm theo từng ô" delay={0.45}>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] font-mono border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-muted-foreground/30 uppercase tracking-widest pb-3 pr-4 font-normal w-28">Danh mục</th>
                    {(["mythic", "legendary", "epic", "rare", "common"] as Rarity[]).map(r => (
                      <th key={r} className={cn("text-center pb-3 px-2 font-bold", RARITY_META[r].color)}>
                        {RARITY_META[r].label}
                      </th>
                    ))}
                    <th className="text-right pb-3 pl-4 text-muted-foreground/30 font-normal">Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {data.categoryData.map((cat, ci) => {
                    const source = categorySources[ci] ?? [];
                    const rowTotal = source.length;
                    return (
                      <motion.tr key={cat.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + ci * 0.05 }}
                        className="border-t border-white/5 hover:bg-white/2 transition-colors">
                        <td className="py-2.5 pr-4">
                          <span style={{ color: cat.color }} className="font-bold">{cat.icon} {cat.name}</span>
                        </td>
                        {(["mythic", "legendary", "epic", "rare", "common"] as Rarity[]).map(r => {
                          const count = (source as any[]).filter((i: any) => i.rarity === r).length;
                          const pct = rowTotal > 0 ? (count / rowTotal) * 100 : 0;
                          return (
                            <td key={r} className="text-center py-2.5 px-2">
                              {count > 0 ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className={cn("font-bold tabular-nums", RARITY_META[r].color)}>{count}</span>
                                  <span className="text-muted-foreground/25">{pct.toFixed(0)}%</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground/15">–</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="text-right py-2.5 pl-4 text-white/50 font-bold tabular-nums">{rowTotal}</td>
                      </motion.tr>
                    );
                  })}
                  {/* Totals row */}
                  <tr className="border-t border-white/10">
                    <td className="py-2.5 pr-4 text-muted-foreground/40 uppercase tracking-widest">Tổng</td>
                    {(["mythic", "legendary", "epic", "rare", "common"] as Rarity[]).map(r => {
                      const allCtxItems = [...pets, ...footballPlayers, ...worldAssets, ...tickets, ...inventoryItems];
                      const count = allCtxItems.filter(i => i.rarity === r).length;
                      return (
                        <td key={r} className="text-center py-2.5 px-2">
                          <span className={cn("font-bold tabular-nums", RARITY_META[r].color)}>{count}</span>
                        </td>
                      );
                    })}
                    <td className="text-right py-2.5 pl-4 text-white font-bold tabular-nums">{data.totalItems}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ChartCard>

          {/* ── API readiness note (dev only, muted) ── */}
          <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground/20 border border-white/5 rounded-lg px-4 py-2.5">
            <BarChart3 className="w-3 h-3 flex-shrink-0" />
            <span>
              DỮ LIỆU GIẢ LẬP — sẵn sàng tích hợp API: thay thế hook{" "}
              <span className="text-violet-400/50">useInventoryAnalytics()</span>{" "}
              bằng các lệnh gọi{" "}
              <span className="text-cyan-400/50">GET /api/inventory/*</span>
            </span>
          </div>

        </main>
      </div>
    </div>
  );
}
