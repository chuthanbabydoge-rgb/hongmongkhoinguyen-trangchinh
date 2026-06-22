import { motion } from "framer-motion";
import { Link } from "wouter";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  PETS, FOOTBALL_PLAYERS, WORLD_ASSETS, TICKETS, ITEMS,
  RARITY_META, CATEGORY_BREAKDOWN, RARITY_BREAKDOWN, INVENTORY_STATS,
  type Rarity,
} from "@/lib/inventoryMockData";
import { cn } from "@/lib/utils";
import {
  PawPrint, Trophy, Globe, Ticket, Box, TrendingUp, Star,
  Gem, Package, ArrowRight, Coins,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px]" />
    <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px]" />
  </div>
);

const TOOLTIP_STYLE = {
  contentStyle: { background: "rgba(0,0,0,0.88)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11, fontFamily: "monospace" },
  labelStyle: { color: "#fff", fontWeight: "bold" },
  itemStyle: { color: "#9ca3af" },
};

const SECTIONS = [
  { icon: PawPrint,  label: "Thú cưng",          path: "/inventory/pets",         count: PETS.length,             color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", value: "680,000 CR" },
  { icon: Trophy,    label: "Cầu thủ bóng đá",   path: "/inventory/football",     count: FOOTBALL_PLAYERS.length, color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20",   value: "960,000 CR" },
  { icon: Globe,     label: "Tài sản Thế giới",  path: "/inventory/world-assets", count: WORLD_ASSETS.length,     color: "text-emerald-400",bg: "bg-emerald-400/10",border: "border-emerald-400/20", value: "3,204,000 CR" },
  { icon: Ticket,    label: "Vé",                 path: "/inventory/tickets",      count: TICKETS.length,          color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/20",  value: "243,000 CR" },
  { icon: Box,       label: "Vật phẩm",           path: "/inventory/items",        count: ITEMS.length,            color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20",    value: "420,000 CR" },
];

const RECENT_ITEMS = [
  ...PETS.slice(0, 2).map(p  => ({ id: p.id,   icon: p.icon,   name: p.name,    rarity: p.rarity, type: "Thú cưng",   date: p.acquiredAt })),
  ...FOOTBALL_PLAYERS.slice(0, 2).map(p => ({ id: p.id, icon: p.icon, name: p.name, rarity: p.rarity, type: "Cầu thủ", date: p.acquiredAt })),
  ...WORLD_ASSETS.slice(0, 1).map(a  => ({ id: a.id,  icon: a.icon,   name: a.name,    rarity: a.rarity, type: "Tài sản",  date: a.acquiredAt })),
  ...TICKETS.slice(0, 1).map(t      => ({ id: t.id,   icon: t.icon,   name: t.name,    rarity: t.rarity, type: "Vé",       date: t.date })),
].slice(0, 6);

export default function InventoryDashboard() {
  const fmtK = (v: number) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v);

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <BG />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <Header />
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
              <span className="w-2 h-6 bg-purple-400 rounded-sm shadow-[0_0_10px_rgba(192,132,252,0.6)]" />
              Tổng quan Kho đồ
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground/30 mt-1 tracking-wider">
              {INVENTORY_STATS.totalItems} VẬT PHẨM · {INVENTORY_STATS.legendaryCount} HUYỀN THOẠI · COMMANDER ZARA
            </p>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Tổng vật phẩm",   value: String(INVENTORY_STATS.totalItems),       icon: Package,  color: "text-purple-400",  border: "border-purple-400/20" },
              { label: "Tổng giá trị",    value: `${fmtK(5_507_000)} CR`,                  icon: Coins,    color: "text-emerald-400", border: "border-emerald-400/20" },
              { label: "Huyền thoại",     value: String(INVENTORY_STATS.legendaryCount),    icon: Star,     color: "text-amber-400",   border: "border-amber-400/20" },
              { label: "Thu nhập / tuần", value: `+${INVENTORY_STATS.weeklyIncome.toLocaleString("vi-VN")} CR`, icon: TrendingUp, color: "text-blue-400", border: "border-blue-400/20" },
            ].map((kpi, i) => (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className={cn("glass-panel rounded-2xl border p-4", kpi.border)}>
                <kpi.icon className={cn("w-5 h-5 mb-2", kpi.color)} />
                <p className={cn("text-2xl font-bold font-mono", kpi.color)}>{kpi.value}</p>
                <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest mt-1">{kpi.label}</p>
              </motion.div>
            ))}
          </div>

          {/* 5 Category cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
            {SECTIONS.map((s, i) => (
              <motion.div key={s.path} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}>
                <Link href={s.path}>
                  <div className={cn("glass-panel rounded-2xl border p-4 cursor-pointer group hover:-translate-y-1 transition-all duration-300", s.border)}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border", s.bg, s.border)}>
                        <s.icon className={cn("w-4.5 h-4.5", s.color)} style={{ width: 18, height: 18 }} />
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-xs font-medium text-white/70 mb-1">{s.label}</p>
                    <p className={cn("text-2xl font-bold", s.color)}>{s.count}</p>
                    <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">{s.value}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Rarity pie */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="lg:col-span-2 glass-panel rounded-2xl border border-white/5 p-5">
              <p className="text-sm font-bold text-white uppercase tracking-wider mb-1">Phân bổ độ hiếm</p>
              <p className="text-[10px] font-mono text-muted-foreground/40 mb-4">Toàn bộ kho đồ</p>
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={RARITY_BREAKDOWN} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="count">
                      {RARITY_BREAKDOWN.map((r, i) => <Cell key={i} fill={r.color} stroke="transparent" />)}
                    </Pie>
                    <Tooltip {...TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2 w-full">
                  {RARITY_BREAKDOWN.map(r => {
                    const total = RARITY_BREAKDOWN.reduce((s, x) => s + x.count, 0);
                    const pct = ((r.count / total) * 100).toFixed(0);
                    return (
                      <div key={r.name} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                        <span className="text-[10px] font-mono text-muted-foreground/50 flex-1">{r.name}</span>
                        <span className="text-[10px] font-mono text-white/60 tabular-nums">{r.count}</span>
                        <div className="w-12 h-1 bg-black/40 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: r.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Category bar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="lg:col-span-3 glass-panel rounded-2xl border border-white/5 p-5">
              <p className="text-sm font-bold text-white uppercase tracking-wider mb-1">Giá trị theo danh mục</p>
              <p className="text-[10px] font-mono text-muted-foreground/40 mb-4">Phân bổ tổng giá trị</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={CATEGORY_BREAKDOWN} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 10, fontFamily: "monospace" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 10, fontFamily: "monospace" }} tickLine={false} axisLine={false}
                    tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${(v/1000).toFixed(0)}K`} width={42} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => v.toLocaleString("vi-VN") + " CR"} />
                  <Bar dataKey="value" name="Giá trị" radius={[4,4,0,0]}>
                    {CATEGORY_BREAKDOWN.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Recent items */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <p className="text-sm font-bold text-white uppercase tracking-wider">Mới nhận gần đây</p>
              <span className="text-[10px] font-mono text-muted-foreground/30">{RECENT_ITEMS.length} VẬT PHẨM</span>
            </div>
            <div className="divide-y divide-white/5">
              {RECENT_ITEMS.map((item, i) => {
                const rm = RARITY_META[item.rarity as Rarity];
                return (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/2 transition-colors">
                    <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center text-lg flex-shrink-0", rm.bg, rm.border)}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white/80 truncate">{item.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground/40">{item.type} · {item.date}</p>
                    </div>
                    <div className={cn("text-[10px] font-mono font-bold px-2 py-0.5 rounded border", rm.color, rm.bg, rm.border)}>
                      {rm.label}
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
