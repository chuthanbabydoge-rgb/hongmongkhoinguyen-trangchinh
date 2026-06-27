import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart2, Loader2, Star, TrendingUp } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface Season { id: string; name: string; status: string; }
interface Ranking { id: string; teamId: string; position: number; points: number; played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; goalDifference: number; }
interface PlayerStatistic { id: string; playerId: string; goals: number; assists: number; matchesPlayed: number; rating: number; }

export default function RankingsPage() {
  const [view, setView] = useState<"league" | "scorers">("league");

  const { data: seasonsData } = useQuery<{ ok: boolean; data: Season[] }>({
    queryKey: ["sports", "seasons"],
    queryFn: async () => (await fetch("/api/sports/seasons")).json() as Promise<{ ok: boolean; data: Season[] }>,
  });
  const seasons = seasonsData?.data ?? [];
  const activeSeason = seasons.find((s) => s.status === "ACTIVE") ?? seasons[0];

  const { data: rankingsData, isLoading } = useQuery<{ ok: boolean; data: Ranking[] }>({
    queryKey: ["sports", "rankings", activeSeason?.id],
    queryFn: async () => (await fetch(`/api/sports/rankings/${activeSeason!.id}`)).json() as Promise<{ ok: boolean; data: Ranking[] }>,
    enabled: !!activeSeason?.id && view === "league",
  });

  const { data: scorersData, isLoading: scorersLoading } = useQuery<{ ok: boolean; data: PlayerStatistic[] }>({
    queryKey: ["sports", "top-scorers"],
    queryFn: async () => (await fetch("/api/sports/statistics/top-scorers?limit=20")).json() as Promise<{ ok: boolean; data: PlayerStatistic[] }>,
    enabled: view === "scorers",
  });

  const rankings = rankingsData?.data ?? [];
  const scorers = scorersData?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center"><BarChart2 className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-2xl font-bold text-white">Bảng xếp hạng</h1>
              <p className="text-muted-foreground text-sm">{activeSeason?.name ?? "Mùa giải"}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {(["league", "scorers"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === v ? "bg-indigo-500 text-white" : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10"}`}>
                {v === "league" ? "🏆 Bảng đấu" : "⚽ Vua phá lưới"}
              </button>
            ))}
          </div>

          {/* League Table */}
          {view === "league" && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-orange-400" /></div>
              ) : rankings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr className="text-muted-foreground">
                        <th className="text-left px-4 py-3 w-10">#</th>
                        <th className="text-left px-4 py-3">Đội</th>
                        <th className="text-center px-3 py-3">Tr</th>
                        <th className="text-center px-3 py-3">T</th>
                        <th className="text-center px-3 py-3">H</th>
                        <th className="text-center px-3 py-3">Th</th>
                        <th className="text-center px-3 py-3">BT</th>
                        <th className="text-center px-3 py-3">BB</th>
                        <th className="text-center px-3 py-3">HS</th>
                        <th className="text-center px-4 py-3 font-bold text-white">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {rankings.map((r, i) => (
                        <tr key={r.id} className={`hover:bg-white/5 transition-colors ${i < 3 ? "border-l-2 border-l-yellow-500" : ""}`}>
                          <td className="px-4 py-3">
                            <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-500/20 text-yellow-400" : i === 1 ? "bg-white/10 text-muted-foreground" : i === 2 ? "bg-orange-500/20 text-orange-400" : "text-muted-foreground"}`}>{r.position}</span>
                          </td>
                          <td className="px-4 py-3 font-medium text-white">{r.teamId.substring(0, 12)}</td>
                          <td className="text-center px-3 py-3 text-muted-foreground">{r.played}</td>
                          <td className="text-center px-3 py-3 text-green-400">{r.won}</td>
                          <td className="text-center px-3 py-3 text-yellow-400">{r.drawn}</td>
                          <td className="text-center px-3 py-3 text-red-400">{r.lost}</td>
                          <td className="text-center px-3 py-3 text-white">{r.goalsFor}</td>
                          <td className="text-center px-3 py-3 text-white">{r.goalsAgainst}</td>
                          <td className="text-center px-3 py-3 text-muted-foreground">{r.goalDifference > 0 ? "+" : ""}{r.goalDifference}</td>
                          <td className="text-center px-4 py-3 font-bold text-white">{r.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-20">Chưa có dữ liệu xếp hạng</div>
              )}
            </div>
          )}

          {/* Top Scorers */}
          {view === "scorers" && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {scorersLoading ? (
                <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-orange-400" /></div>
              ) : scorers.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr className="text-muted-foreground">
                      <th className="text-left px-4 py-3 w-10">#</th>
                      <th className="text-left px-4 py-3">Cầu thủ</th>
                      <th className="text-center px-3 py-3 text-green-400">Bàn thắng</th>
                      <th className="text-center px-3 py-3 text-blue-400">Kiến tạo</th>
                      <th className="text-center px-3 py-3">Trận</th>
                      <th className="text-center px-4 py-3 text-yellow-400">Đánh giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {scorers.map((s, i) => (
                      <tr key={s.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3 text-white">{s.playerId.substring(0, 14)}</td>
                        <td className="text-center px-3 py-3 font-bold text-green-400">{s.goals}</td>
                        <td className="text-center px-3 py-3 text-blue-400">{s.assists}</td>
                        <td className="text-center px-3 py-3 text-muted-foreground">{s.matchesPlayed}</td>
                        <td className="text-center px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span className="text-yellow-400 font-medium">{s.rating.toFixed(1)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center text-muted-foreground py-20">Chưa có dữ liệu thống kê</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
