import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { REWARDS, type Reward } from "@/lib/walletMockData";
import { cn } from "@/lib/utils";
import { Gift, CheckCircle2, Clock, Star, Trophy, Zap, Calendar } from "lucide-react";

const CAT_META: Record<Reward["category"], { label: string; color: string; bg: string; border: string; Icon: typeof Gift }> = {
  daily:       { label: "Hàng ngày",  color: "text-cyan-400",    bg: "bg-cyan-400/10",    border: "border-cyan-400/20",    Icon: Calendar },
  weekly:      { label: "Hàng tuần",  color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20",    Icon: Star },
  achievement: { label: "Thành tích", color: "text-purple-400",  bg: "bg-purple-400/10",  border: "border-purple-400/20",  Icon: Trophy },
  milestone:   { label: "Cột mốc",   color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20",   Icon: Zap },
};

const SUMMARY_STATS = [
  { label: "Tổng phần thưởng", value: REWARDS.length,                                   color: "text-white",       Icon: Gift },
  { label: "Đã hoàn thành",    value: REWARDS.filter(r => r.claimed).length,            color: "text-emerald-400", Icon: CheckCircle2 },
  { label: "Đang thực hiện",   value: REWARDS.filter(r => !r.claimed).length,           color: "text-blue-400",    Icon: Clock },
  { label: "Điểm sắp nhận",    value: REWARDS.filter(r => !r.claimed).reduce((s, r) => s + (r.maxPoints - r.points), 0), color: "text-amber-400", Icon: Star },
];

function RewardCard({ reward, index }: { reward: Reward; index: number }) {
  const cat = CAT_META[reward.category];
  const pct = Math.round((reward.points / reward.maxPoints) * 100);
  const remaining = reward.maxPoints - reward.points;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className={cn(
        "glass-panel rounded-2xl border p-5 relative overflow-hidden group transition-all duration-300",
        reward.claimed
          ? "border-white/5 opacity-70"
          : cn("hover:-translate-y-1", cat.border, "hover:shadow-lg")
      )}
    >
      {/* Claimed overlay */}
      {reward.claimed && (
        <div className="absolute inset-0 bg-emerald-400/5 pointer-events-none rounded-2xl" />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border", cat.bg, cat.border)}>
            {reward.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-white">{reward.title}</p>
              {reward.claimed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : reward.expiresAt ? (
                <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400/80 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {reward.expiresAt}
                </div>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground/60 mt-0.5">{reward.description}</p>
          </div>
        </div>

        {/* Category badge */}
        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold tracking-widest mb-4", cat.color, cat.bg, cat.border)}>
          <cat.Icon className="w-3 h-3" />
          {cat.label}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground/40">
            <span>{reward.points.toLocaleString("vi-VN")} / {reward.maxPoints.toLocaleString("vi-VN")}</span>
            <span className={cn(reward.claimed ? "text-emerald-400" : cat.color)}>{pct}%</span>
          </div>
          <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: index * 0.06 + 0.3, duration: 0.8, ease: "easeOut" }}
              className={cn("h-full rounded-full", reward.claimed ? "bg-gradient-to-r from-emerald-500/60 to-emerald-400" : `bg-gradient-to-r from-${cat.color.replace("text-", "")}/50 to-${cat.color.replace("text-", "")}`,)}
              style={{ background: reward.claimed ? "linear-gradient(to right, rgba(52,211,153,0.6), rgb(52,211,153))" : undefined }}
            />
          </div>
          {!reward.claimed && remaining > 0 && (
            <p className={cn("text-[10px] font-mono", cat.color)}>
              Còn {remaining.toLocaleString("vi-VN")} điểm nữa để hoàn thành
            </p>
          )}
          {reward.claimed && (
            <p className="text-[10px] font-mono text-emerald-400">✓ Đã hoàn thành & nhận thưởng</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Rewards() {
  const [filter, setFilter] = useState<"all" | "active" | "claimed" | Reward["category"]>("all");

  const filtered = REWARDS.filter(r => {
    if (filter === "active")  return !r.claimed;
    if (filter === "claimed") return r.claimed;
    if (filter === "all")     return true;
    return r.category === filter;
  });

  const totalPoints = REWARDS.filter(r => r.claimed).reduce((s, r) => s + r.maxPoints, 0);

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/8 via-background to-background" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px]" />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col relative z-10">
        <Header />

        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-2 h-6 bg-primary rounded-sm shadow-[0_0_10px_hsl(var(--primary))]" />
                Phần thưởng
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/30 mt-1 tracking-wider">
                {REWARDS.length} PHẦN THƯỞNG · {totalPoints.toLocaleString("vi-VN")} ĐIỂM ĐÃ TÍCH LŨY
              </p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SUMMARY_STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass-panel rounded-xl border border-white/5 p-4 flex items-center gap-3"
              >
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center bg-white/5")}>
                  <s.Icon className={cn("w-4 h-4", s.color)} />
                </div>
                <div>
                  <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                  <p className="text-[10px] font-mono text-muted-foreground/40">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Level progress banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-2xl border border-amber-500/20 p-5 shadow-[0_0_30px_rgba(251,191,36,0.06)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none rounded-2xl" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-2xl flex-shrink-0">🏆</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Tổng điểm tích lũy: <span className="text-amber-400">{totalPoints.toLocaleString("vi-VN")} RP</span></p>
                <p className="text-xs text-muted-foreground/50 mt-0.5">Hoàn thành thêm nhiệm vụ để đổi lấy vật phẩm đặc biệt và mở khóa tính năng cao cấp</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-400 text-[10px] font-mono font-bold tracking-widest uppercase hover:bg-amber-400/30 transition-all flex-shrink-0">
                Đổi điểm →
              </button>
            </div>
          </motion.div>

          {/* Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">Lọc:</span>
            {([
              { k: "all", l: "Tất cả" },
              { k: "active", l: "Đang thực hiện" },
              { k: "claimed", l: "Đã hoàn thành" },
              { k: "daily", l: "Hàng ngày" },
              { k: "weekly", l: "Hàng tuần" },
              { k: "achievement", l: "Thành tích" },
              { k: "milestone", l: "Cột mốc" },
            ] as { k: typeof filter; l: string }[]).map(({ k, l }) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={cn(
                  "px-3 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all",
                  filter === k ? "bg-primary/20 border-primary/50 text-primary" : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20"
                )}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Rewards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((r, i) => <RewardCard key={r.id} reward={r} index={i} />)}
            {filtered.length === 0 && (
              <div className="col-span-full glass-panel rounded-xl border border-white/5 p-12 text-center text-muted-foreground/30 text-xs font-mono tracking-widest">
                KHÔNG TÌM THẤY PHẦN THƯỞNG PHÙ HỢP
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
