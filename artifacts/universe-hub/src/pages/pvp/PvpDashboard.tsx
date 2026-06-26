import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Swords, Trophy, TrendingUp, Clock, Zap, Shield, Target, BarChart2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface PvpStats {
  totalMatches: number; totalWins: number; totalLosses: number;
  totalKills: number; totalDeaths: number; totalDamageDealt: number;
  peakMmr: number; peakTier: string; tournamentWins: number;
}
interface PvpRecentMatch {
  id: string; type: string; status: string; isRanked: boolean;
  finishedAt: string | null; durationSec: number | null;
}
interface PvpDashboardData {
  stats: PvpStats | null;
  inQueue: boolean;
  queueEntry: unknown;
  recentMatches: PvpRecentMatch[];
  rewards: unknown[];
}

const TIER_COLORS: Record<string, string> = {
  BRONZE: "text-amber-600", SILVER: "text-slate-400", GOLD: "text-yellow-400",
  PLATINUM: "text-cyan-400", DIAMOND: "text-blue-400", MASTER: "text-purple-400",
  GRANDMASTER: "text-orange-400", LEGEND: "text-red-400",
};

export default function PvpDashboard() {
  const { accessToken } = useAuth();
  const [data, setData] = useState<PvpDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetch("/api/pvp/dashboard", { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => r.json())
      .then((j) => { if (j.ok) setData(j.data); })
      .finally(() => setLoading(false));
  }, [accessToken]);

  const stats = data?.stats;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Swords className="w-6 h-6 text-blue-400" /> Universe PvP
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Đấu trường xếp hạng — MMR & Mùa giải</p>
        </div>
        <div className="flex gap-2">
          <Link href="/pvp/queue">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
              <Zap className="w-4 h-4" /> Tìm trận
            </button>
          </Link>
          <Link href="/tournaments">
            <button className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:bg-white/5 rounded-lg text-sm font-medium transition-colors">
              <Trophy className="w-4 h-4" /> Giải đấu
            </button>
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<TrendingUp className="w-5 h-5 text-green-400" />} label="Tỷ lệ thắng"
            value={stats ? `${stats.totalMatches ? Math.round((stats.totalWins / stats.totalMatches) * 100) : 0}%` : "—"}
            sub={`${stats?.totalWins ?? 0}W / ${stats?.totalLosses ?? 0}L`} />
          <StatCard icon={<Shield className="w-5 h-5 text-purple-400" />} label="Hạng cao nhất"
            value={<span className={TIER_COLORS[stats?.peakTier ?? "BRONZE"] ?? "text-white"}>{stats?.peakTier ?? "—"}</span>}
            sub={`Peak MMR: ${stats?.peakMmr ?? 1000}`} />
          <StatCard icon={<Target className="w-5 h-5 text-red-400" />} label="K/D Ratio"
            value={stats && stats.totalDeaths > 0 ? (stats.totalKills / stats.totalDeaths).toFixed(2) : (stats?.totalKills ?? 0).toString()}
            sub={`${stats?.totalKills ?? 0}K / ${stats?.totalDeaths ?? 0}D`} />
          <StatCard icon={<Trophy className="w-5 h-5 text-yellow-400" />} label="Vô địch giải"
            value={String(stats?.tournamentWins ?? 0)}
            sub="Tournament Wins" />
        </div>
      )}

      {/* Queue status */}
      {data?.inQueue && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Đang tìm trận...</span>
          </div>
          <button
            onClick={() => {
              if (!accessToken) return;
              fetch("/api/pvp/queue", { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } })
                .then(() => setData((d) => d ? { ...d, inQueue: false, queueEntry: null } : d));
            }}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Hủy tìm trận
          </button>
        </div>
      )}

      {/* Quick navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { href: "/pvp/queue", icon: <Zap className="w-5 h-5" />, label: "Xếp hàng PvP", desc: "Tìm trận theo MMR", color: "text-blue-400" },
          { href: "/pvp/leaderboard", icon: <BarChart2 className="w-5 h-5" />, label: "Bảng xếp hạng", desc: "Top 100 người chơi", color: "text-yellow-400" },
          { href: "/pvp/history", icon: <Clock className="w-5 h-5" />, label: "Lịch sử trận đấu", desc: "Xem các trận vừa rồi", color: "text-slate-400" },
          { href: "/pvp/season", icon: <Trophy className="w-5 h-5" />, label: "Phần thưởng mùa", desc: "Nhận thưởng cuối mùa", color: "text-orange-400" },
          { href: "/tournaments", icon: <Trophy className="w-5 h-5" />, label: "Giải đấu", desc: "Thi đấu loại trực tiếp", color: "text-purple-400" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="bg-white/3 border border-white/10 rounded-xl p-4 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer group">
              <div className={`${item.color} mb-2 group-hover:scale-110 transition-transform inline-block`}>{item.icon}</div>
              <div className="font-medium text-sm">{item.label}</div>
              <div className="text-muted-foreground text-xs mt-0.5">{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent matches */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Trận gần đây</h2>
        {!data?.recentMatches?.length ? (
          <div className="text-center py-8 text-muted-foreground text-sm bg-white/3 rounded-xl border border-white/5">
            Chưa có trận đấu nào. <Link href="/pvp/queue"><span className="text-blue-400 hover:underline cursor-pointer">Tìm trận ngay!</span></Link>
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentMatches.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center justify-between bg-white/3 border border-white/5 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground">{m.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${m.isRanked ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-muted-foreground"}`}>
                    {m.isRanked ? "Xếp hạng" : "Thường"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {m.durationSec && <span>{m.durationSec}s</span>}
                  {m.finishedAt && <span>{new Date(m.finishedAt).toLocaleDateString("vi-VN")}</span>}
                  <Link href={`/pvp/match/${m.id}`}>
                    <span className="text-blue-400 hover:underline cursor-pointer">Xem</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub: string }) {
  return (
    <div className="bg-white/3 border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-muted-foreground">{label}</span></div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}
