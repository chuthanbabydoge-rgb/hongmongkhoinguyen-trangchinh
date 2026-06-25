import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  RARITY_COLORS, RARITY_LABELS,
  CATEGORY_META_MARKET, TX_TYPE_META,
  type MarketRarity,
} from "@/lib/marketplaceMockData";
import { useMarketplace } from "@/context/MarketplaceContext";
import { cn } from "@/lib/utils";
import { TrendingUp, Coins, BarChart3, Users, Star, ArrowUp, Gavel } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend, ComposedChart, Line,
} from "recharts";

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-900/10 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px]" />
  </div>
);

const TS = {
  contentStyle: { background: "rgba(0,0,0,0.90)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11, fontFamily: "monospace" },
  labelStyle: { color: "#fff", fontWeight: "bold" },
};
const AS = { tick: { fill: "rgba(255,255,255,0.28)", fontSize: 10, fontFamily: "monospace" }, tickLine: false as false, axisLine: false as false };
const fmtShort = (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v);
const fmtCR = (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M CR` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K CR` : `${v} CR`;

function ChartCard({ title, subtitle, children, delay = 0, className }: { title: string; subtitle: string; children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      className={cn("glass-panel rounded-2xl border border-white/5 p-5", className)}>
      <p className="text-sm font-bold text-white uppercase tracking-wider mb-0.5">{title}</p>
      <p className="text-[10px] font-mono text-muted-foreground/40 mb-4">{subtitle}</p>
      {children}
    </motion.div>
  );
}

export default function MarketplaceAnalytics() {
  const { transactions, listings, auctions, stats } = useMarketplace();

  const totalVolume = transactions.reduce((s, t) => s + t.price, 0);
  const totalFees   = transactions.reduce((s, t) => s + t.fee, 0);
  const avgPrice    = transactions.length > 0 ? Math.round(totalVolume / transactions.length) : 0;
  const auctionWins = transactions.filter(t => t.type === "auction_win").length;

  // Rarity volume breakdown
  const rarities = ["mythic","legendary","epic","rare","common"] as MarketRarity[];
  const rarityVolume = rarities.map(r => ({
    name: RARITY_LABELS[r],
    value: transactions.filter(t => t.rarity === r).reduce((s, t) => s + t.price, 0),
    count: transactions.filter(t => t.rarity === r).length,
    color: r === "mythic" ? "#fb7185" : r === "legendary" ? "#fbbf24" : r === "epic" ? "#c084fc" : r === "rare" ? "#60a5fa" : "#9ca3af",
  })).filter(r => r.value > 0);

  // Tx type breakdown
  const txByType = Object.entries(TX_TYPE_META).map(([key, meta]) => ({
    name: meta.label,
    count: transactions.filter(t => t.type === key).length,
    volume: transactions.filter(t => t.type === key).reduce((s, t) => s + t.price, 0),
    color: meta.color.replace("text-", "#").replace("-400", ""),
  })).filter(t => t.count > 0);

  const KPIS = [
    { label: "Tổng khối lượng", value: fmtCR(totalVolume),          icon: Coins,      color: "text-emerald-400", border: "border-emerald-400/20", delta: "+18.4%" },
    { label: "Số giao dịch",    value: String(transactions.length),  icon: BarChart3,  color: "text-blue-400",    border: "border-blue-400/20",    delta: "+12" },
    { label: "Giá trị TB",      value: fmtCR(avgPrice),              icon: TrendingUp, color: "text-purple-400",  border: "border-purple-400/20",  delta: "+8.2%" },
    { label: "Phí thu",         value: fmtCR(totalFees),              icon: Star,       color: "text-amber-400",   border: "border-amber-400/20",   delta: "+18.4%" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <BG />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">

          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
              <span className="w-2 h-6 bg-purple-400 rounded-sm shadow-[0_0_10px_rgba(192,132,252,0.6)]" />
              Phân tích Chợ trực tuyến
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">
              {transactions.length} GIAO DỊCH · {listings.filter(l => l.status === "active").length} NIÊM YẾT · {auctions.length} ĐẤU GIÁ
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {KPIS.map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className={cn("glass-panel rounded-2xl border p-4", k.border)}>
                <div className="flex items-start justify-between mb-3">
                  <k.icon className={cn("w-4 h-4", k.color)} />
                  <span className="flex items-center gap-0.5 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-full">
                    <ArrowUp className="w-2 h-2" />{k.delta}
                  </span>
                </div>
                <p className={cn("text-xl font-bold font-mono", k.color)}>{k.value}</p>
                <p className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest mt-1">{k.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Row 1: Volume trend + Category pie */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <ChartCard title="Khối lượng giao dịch" subtitle="12 tháng gần nhất (CR + số lượt)" delay={0.1} className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={stats.volumeTrend} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mkt-vol-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="label" {...AS} />
                  <YAxis yAxisId="vol" {...AS} tickFormatter={fmtShort} width={44} />
                  <YAxis yAxisId="cnt" orientation="right" {...AS} width={28} />
                  <Tooltip {...TS} formatter={(v: number, name: string) => name === "Số lượt" ? [v, name] : [fmtCR(v), name]} />
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.5)" }} />
                  <Area yAxisId="vol" type="monotone" dataKey="volume" name="Khối lượng" stroke="#34d399" strokeWidth={2} fill="url(#mkt-vol-grad)" dot={false} />
                  <Line yAxisId="cnt" type="monotone" dataKey="txCount" name="Số lượt" stroke="#a78bfa" strokeWidth={2} dot={{ fill: "#a78bfa", r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Khối lượng theo danh mục" subtitle="Phân bổ tổng giá trị" delay={0.15}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={stats.categoryVolume} cx="50%" cy="50%" innerRadius={44} outerRadius={70} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                    {stats.categoryVolume.map((c, i) => <Cell key={i} fill={c.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip {...TS} formatter={(v: number) => [fmtCR(v), "Khối lượng"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {stats.categoryVolume.map(c => {
                  const total = stats.categoryVolume.reduce((s, x) => s + x.value, 0);
                  return (
                    <div key={c.name} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                      <span className="text-[9px] font-mono text-muted-foreground/50 flex-1">{c.name}</span>
                      <span className="text-[9px] font-mono text-white/60">{c.txCount} GD</span>
                      <div className="w-12 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(c.value / total) * 100}%`, background: c.color }} />
                      </div>
                      <span className="text-[8px] font-mono text-muted-foreground/30 w-7 text-right">{((c.value / total) * 100).toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </div>

          {/* Row 2: Rarity volume bar + Tx type + Auction stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ChartCard title="Khối lượng theo độ hiếm" subtitle="Tổng giá trị giao dịch mỗi cấp" delay={0.2}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={rarityVolume} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <XAxis type="number" {...AS} tickFormatter={fmtShort} />
                  <YAxis type="category" dataKey="name" {...AS} width={72} />
                  <Tooltip {...TS} formatter={(v: number) => [fmtCR(v), "Khối lượng"]} />
                  <Bar dataKey="value" name="Khối lượng" radius={[0, 4, 4, 0]}>
                    {rarityVolume.map((r, i) => <Cell key={i} fill={r.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Phân bổ loại giao dịch" subtitle="Số lượng mỗi loại" delay={0.25}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={txByType} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" {...AS} tick={{ ...AS.tick, fontSize: 8 }} />
                  <YAxis {...AS} width={24} />
                  <Tooltip {...TS} />
                  <Bar dataKey="count" name="Số lượt" radius={[4, 4, 0, 0]}>
                    {txByType.map((t, i) => <Cell key={i} fill={["#34d399","#fbbf24","#60a5fa"][i % 3]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Thống kê đấu giá" subtitle="So sánh với giao dịch thông thường" delay={0.3}>
              <div className="space-y-4 mt-2">
                {[
                  { label: "Tỉ lệ thắng đấu giá", value: `${transactions.length > 0 ? Math.round((auctionWins / transactions.length) * 100) : 0}%`, color: "text-amber-400", pct: transactions.length > 0 ? (auctionWins / transactions.length) * 100 : 0, barColor: "#fbbf24" },
                  { label: "Phiên đấu giá đang mở", value: String(auctions.length), color: "text-purple-400", pct: (auctions.length / Math.max(auctions.length, 20)) * 100, barColor: "#c084fc" },
                  { label: "Phiên đấu giá HOT", value: String(auctions.filter(a => a.isHot).length), color: "text-orange-400", pct: auctions.length > 0 ? (auctions.filter(a => a.isHot).length / auctions.length) * 100 : 0, barColor: "#fb923c" },
                  { label: "Có giá mua ngay", value: String(auctions.filter(a => a.buyNowPrice).length), color: "text-emerald-400", pct: auctions.length > 0 ? (auctions.filter(a => a.buyNowPrice).length / auctions.length) * 100 : 0, barColor: "#34d399" },
                  { label: "Tổng người theo dõi", value: auctions.reduce((s, a) => s + a.watchers, 0).toLocaleString(), color: "text-blue-400", pct: 80, barColor: "#60a5fa" },
                ].map(row => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between text-[9px] font-mono mb-1.5">
                      <span className="text-muted-foreground/50">{row.label}</span>
                      <span className={cn("font-bold", row.color)}>{row.value}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${row.pct}%` }} transition={{ delay: 0.35, duration: 0.8 }}
                        className="h-full rounded-full" style={{ background: row.barColor }} />
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Row 3: Top sellers + Top items + Category count */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title="Top người bán" subtitle="Xếp hạng theo doanh thu" delay={0.35}>
              <div className="space-y-3 mt-1">
                {stats.topSellers.map((seller, i) => (
                  <motion.div key={seller.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.07 }}
                    className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-muted-foreground/30 w-4 flex-shrink-0">#{i + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-white flex-shrink-0">{seller.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{seller.name}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">{fmtCR(seller.volume)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${stats.topSellers.length > 0 ? (seller.volume / stats.topSellers[0].volume) * 100 : 0}%` }} transition={{ delay: 0.5 + i * 0.07, duration: 0.8 }}
                            className="h-full rounded-full bg-emerald-400" />
                        </div>
                        <span className="text-[9px] font-mono text-muted-foreground/40">{seller.sales} GD</span>
                        <div className="flex items-center gap-0.5 text-[9px] font-mono text-amber-400">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />{seller.rating}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Thống kê theo danh mục" subtitle="Số lượng niêm yết + giao dịch" delay={0.4}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.categoryVolume} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" {...AS} tick={{ ...AS.tick, fontSize: 8 }} />
                  <YAxis {...AS} width={24} />
                  <Tooltip {...TS} />
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.5)" }} />
                  <Bar dataKey="txCount" name="Giao dịch" radius={[4, 4, 0, 0]}>
                    {stats.categoryVolume.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1">
                {stats.categoryVolume.map(c => (
                  <div key={c.name} className="flex items-center gap-2">
                    <span className="text-[9px] font-mono" style={{ color: c.color }}>{CATEGORY_META_MARKET[c.name === "Tài sản TG" ? "world-assets" : c.name === "Cầu thủ" ? "football" : c.name === "Thú cưng" ? "pets" : c.name === "Vật phẩm" ? "items" : "tickets"]?.icon ?? "•"}</span>
                    <span className="text-[9px] font-mono text-muted-foreground/40 flex-1">{c.name}</span>
                    <span className="text-[9px] font-mono text-muted-foreground/30">{c.txCount} giao dịch</span>
                    <span className="text-[9px] font-mono font-bold" style={{ color: c.color }}>{fmtCR(c.value)}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

        </main>
      </div>
    </div>
  );
}
