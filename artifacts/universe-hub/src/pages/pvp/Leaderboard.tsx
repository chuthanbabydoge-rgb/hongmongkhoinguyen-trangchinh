import { useEffect, useState } from "react";
import { BarChart2, Crown, TrendingUp } from "lucide-react";

interface RankingEntry {
  userId: string; mmr: number; tier: string;
  wins: number; losses: number; draws: number;
  winStreak: number; placementDone: boolean;
}
interface Season { id: string; name: string; status: string; number: number; }

const TIER_COLORS: Record<string, string> = {
  BRONZE: "text-amber-600", SILVER: "text-slate-400", GOLD: "text-yellow-400",
  PLATINUM: "text-cyan-400", DIAMOND: "text-blue-400", MASTER: "text-purple-400",
  GRANDMASTER: "text-orange-400", LEGEND: "text-red-400",
};
const TIER_BG: Record<string, string> = {
  BRONZE: "bg-amber-600/10", SILVER: "bg-slate-400/10", GOLD: "bg-yellow-400/10",
  PLATINUM: "bg-cyan-400/10", DIAMOND: "bg-blue-400/10", MASTER: "bg-purple-400/10",
  GRANDMASTER: "bg-orange-400/10", LEGEND: "bg-red-400/10",
};

export default function PvpLeaderboard() {
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [season, setSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/pvp/leaderboard?limit=50").then((r) => r.json()),
      fetch("/api/seasons/current").then((r) => r.json()),
    ]).then(([lb, s]) => {
      if ((lb as { ok: boolean; data: RankingEntry[] }).ok) setEntries((lb as { ok: boolean; data: RankingEntry[] }).data);
      if ((s as { ok: boolean; data: Season }).ok) setSeason((s as { ok: boolean; data: Season }).data);
    }).finally(() => setLoading(false));
  }, []);

  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-yellow-400" /> Bảng xếp hạng
          </h1>
          {season && <p className="text-muted-foreground text-sm mt-1">Mùa {season.number} — {season.name}</p>}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BarChart2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Chưa có dữ liệu xếp hạng</p>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {topThree.length >= 3 && (
            <div className="grid grid-cols-3 gap-3">
              {[topThree[1], topThree[0], topThree[2]].map((entry, i) => entry && (
                <div key={entry.userId} className={`rounded-2xl border p-4 text-center ${TIER_BG[entry.tier] ?? ""} ${i === 1 ? "border-yellow-400/40 scale-105" : "border-white/10"}`}>
                  <div className="text-2xl mb-1">{i === 1 ? "🥇" : i === 0 ? "🥈" : "🥉"}</div>
                  <div className="text-xs font-mono text-muted-foreground">{entry.userId.slice(0, 8)}…</div>
                  <div className={`font-bold text-sm mt-1 ${TIER_COLORS[entry.tier] ?? ""}`}>{entry.tier}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{entry.mmr} MMR</div>
                </div>
              ))}
            </div>
          )}

          {/* Full table */}
          <div className="space-y-1">
            {entries.map((entry, i) => (
              <div key={entry.userId} className="flex items-center gap-4 px-4 py-3 bg-white/3 border border-white/5 hover:border-white/10 rounded-xl transition-colors">
                <span className="text-sm font-bold w-8 text-center text-muted-foreground">
                  {i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{entry.userId.slice(0, 12)}…</span>
                    {entry.winStreak >= 3 && <span className="text-xs text-orange-400">🔥 {entry.winStreak}W</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {entry.wins}W {entry.losses}L {entry.draws}D
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${TIER_COLORS[entry.tier] ?? ""}`}>{entry.tier}</div>
                  <div className="text-xs font-mono text-muted-foreground">{entry.mmr} MMR</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
