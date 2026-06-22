import { useMemo } from "react";
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
  Package, ArrowRight, Coins, CalendarDays, Gem,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

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

const fmtK = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` :
  v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v);

const CATEGORY_CARDS = [
  { icon: PawPrint, label: "Tổng thú cưng",          path: "/inventory/pets",         count: PETS.length,             color: "text-purple-400",  bg: "bg-purple-400/10",  border: "border-purple-400/20" },
  { icon: Trophy,   label: "Tổng cầu thủ bóng đá",  path: "/inventory/football",     count: FOOTBALL_PLAYERS.length, color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20" },
  { icon: Globe,    label: "Tổng tài sản thế giới",  path: "/inventory/world-assets", count: WORLD_ASSETS.length,     color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  { icon: Ticket,   label: "Tổng số vé",              path: "/inventory/tickets",      count: TICKETS.length,          color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20" },
  { icon: Box,      label: "Tổng vật phẩm",           path: "/inventory/items",        count: ITEMS.length,            color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/20" },
];

export default function InventoryDashboard() {
  const totalAssets = CATEGORY_CARDS.reduce((s, c) => s + c.count, 0);

  const recentItems = useMemo(() => {
    const all = [
      ...PETS.map(p => ({ id: p.id, image: p.image, name: p.name, rarity: p.rarity, type: "Thú cưng",          createdAt: p.createdAt })),
      ...FOOTBALL_PLAYERS.map(p => ({ id: p.id, image: p.image, name: p.name, rarity: p.rarity, type: "Cầu thủ bóng đá",  createdAt: p.createdAt })),
      ...WORLD_ASSETS.map(a => ({ id: a.id, image: a.image, name: a.name, rarity: a.rarity, type: "Tài sản thế giới", createdAt: a.createdAt })),
      ...TICKETS.map(t => ({ id: t.id, image: t.image, name: t.name, rarity: t.rarity, type: "Vé",                createdAt: t.createdAt })),
      ...ITEMS.map(i => ({ id: i.id, image: i.image, name: i.name, rarity: i.rarity, type: "Vật phẩm",         createdAt: i.createdAt })),
    ];
    return all
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, []);

  const rarityLegendTotal = RARITY_BREAKDOWN.reduce((s, r) => s + r.count, 0);

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <BG />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <Header />
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">

          {/* ── Page heading ── */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
              <span className="w-2 h-6 bg-purple-400 rounded-sm shadow-[0_0_10px_rgba(192,132,252,0.6)]" />
              Bảng điều khiển Kho đồ
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground/30 mt-1 tracking-wider">
              {totalAssets} VẬT PHẨM · {INVENTORY_STATS.mythicCount} THẦN THOẠI · {INVENTORY_STATS.legendaryCount} HUYỀN THOẠI
            </p>
          </motion.div>

          {/* ── KPI strip ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Tổng tài sản",    value: String(totalAssets),                                     icon: Package,   color: "text-purple-400",  border: "border-purple-400/20" },
              { label: "Tổng giá trị",    value: `${fmtK(INVENTORY_STATS.totalValue)} CR`,                 icon: Coins,     color: "text-emerald-400", border: "border-emerald-400/20" },
              { label: "Thần & Huyền",    value: `${INVENTORY_STATS.mythicCount + INVENTORY_STATS.legendaryCount}`,  icon: Gem,       color: "text-amber-400",   border: "border-amber-400/20" },
              { label: "Thu nhập / tuần", value: `+${fmtK(INVENTORY_STATS.weeklyIncome)} CR`,              icon: TrendingUp, color: "text-blue-400",   border: "border-blue-400/20" },
            ].map((kpi, i) => (
              <motion.div key={kpi.label}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className={cn("glass-panel rounded-2xl border p-4", kpi.border)}>
                <kpi.icon className={cn("w-5 h-5 mb-2", kpi.color)} />
                <p className={cn("text-2xl font-bold font-mono", kpi.color)}>{kpi.value}</p>
                <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest mt-1">{kpi.label}</p>
              </motion.div>
            ))}
          </div>

          {/* ── 5 Category summary cards ── */}
          <div>
            <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest mb-3">Tóm tắt danh mục</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
              {CATEGORY_CARDS.map((s, i) => (
                <motion.div key={s.path}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }}>
                  <Link href={s.path}>
                    <div className={cn("glass-panel rounded-2xl border p-4 cursor-pointer group hover:-translate-y-1 transition-all duration-300 h-full", s.border)}>
                      <div className="flex items-center justify-between mb-3">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border", s.bg, s.border)}>
                          <s.icon style={{ width: 18, height: 18 }} className={s.color} />
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground/40 mb-1 leading-tight">{s.label}</p>
                      <p className={cn("text-3xl font-bold font-mono", s.color)}>{s.count}</p>
                      <p className="text-[9px] font-mono text-muted-foreground/25 mt-1">vật phẩm</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Charts row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Rarity pie */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="lg:col-span-2 glass-panel rounded-2xl border border-white/5 p-5">
              <p className="text-sm font-bold text-white uppercase tracking-wider mb-0.5">Phân bố độ hiếm</p>
              <p className="text-[10px] font-mono text-muted-foreground/40 mb-4">Toàn bộ {totalAssets} vật phẩm</p>
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={RARITY_BREAKDOWN} cx="50%" cy="50%"
                      innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="count">
                      {RARITY_BREAKDOWN.map((r, i) => <Cell key={i} fill={r.color} stroke="transparent" />)}
                    </Pie>
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v} vật phẩm`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2 w-full">
                  {RARITY_BREAKDOWN.map(r => {
                    const pct = ((r.count / rarityLegendTotal) * 100).toFixed(0);
                    return (
                      <div key={r.name} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                          <span className="text-[10px] font-mono text-muted-foreground/50 flex-1">{r.name}</span>
                          <span className="text-[10px] font-mono text-white/60 tabular-nums">{r.count}</span>
                          <span className="text-[9px] font-mono text-muted-foreground/30 w-6 text-right">{pct}%</span>
                        </div>
                        <div className="h-0.5 bg-black/40 rounded-full overflow-hidden ml-4">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: r.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Category value bar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="lg:col-span-3 glass-panel rounded-2xl border border-white/5 p-5">
              <p className="text-sm font-bold text-white uppercase tracking-wider mb-0.5">Giá trị theo danh mục</p>
              <p className="text-[10px] font-mono text-muted-foreground/40 mb-4">Tổng CR theo từng danh mục</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={CATEGORY_BREAKDOWN} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 10, fontFamily: "monospace" }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 10, fontFamily: "monospace" }}
                    tickLine={false} axisLine={false} width={44}
                    tickFormatter={v => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}K`}
                  />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [v.toLocaleString("vi-VN") + " CR", "Giá trị"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {CATEGORY_BREAKDOWN.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* ── Recent items ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-purple-400" />
                <p className="text-sm font-bold text-white uppercase tracking-wider">Mới nhận gần đây</p>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/30">{recentItems.length} VẬT PHẨM</span>
            </div>
            <div className="divide-y divide-white/5">
              {recentItems.map((item, i) => {
                const rm = RARITY_META[item.rarity as Rarity];
                return (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.04 }}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center text-lg flex-shrink-0", rm.bg, rm.border)}>
                      {item.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white/80 truncate">{item.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground/40">
                        {item.type} · {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className={cn("text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex-shrink-0", rm.color, rm.bg, rm.border)}>
                      {rm.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

        </main>
      </div>
    </div>
  );
}
