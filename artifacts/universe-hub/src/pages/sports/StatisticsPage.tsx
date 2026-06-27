import { useQuery } from "@tanstack/react-query";
import { BarChart2, Loader2, Star, TrendingUp } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface PlayerStatistic { id: string; playerId: string; goals: number; assists: number; matchesPlayed: number; rating: number; yellowCards: number; redCards: number; minutesPlayed: number; }

export default function StatisticsPage() {
  const { data: scorersData, isLoading } = useQuery<{ ok: boolean; data: PlayerStatistic[] }>({
    queryKey: ["sports", "top-scorers"],
    queryFn: async () => (await fetch("/api/sports/statistics/top-scorers?limit=20")).json() as Promise<{ ok: boolean; data: PlayerStatistic[] }>,
  });

  const scorers = scorersData?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><BarChart2 className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-2xl font-bold text-white">Thống kê</h1>
              <p className="text-muted-foreground text-sm">Vua phá lưới &amp; Bảng thống kê</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-400" />Vua phá lưới</h2>
            {isLoading ? (
              <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-violet-400" /></div>
            ) : (
              <div className="space-y-3">
                {scorers.slice(0, 10).map((s, i) => (
                  <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${i === 0 ? "bg-yellow-500/20 text-yellow-400" : i === 1 ? "bg-white/10 text-muted-foreground" : i === 2 ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-muted-foreground"}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{s.playerId.substring(0, 16)}</div>
                      <div className="text-xs text-muted-foreground">{s.matchesPlayed} trận · {s.minutesPlayed} phút</div>
                    </div>
                    <div className="flex items-center gap-4 text-sm flex-shrink-0">
                      <div className="text-center">
                        <div className="font-bold text-green-400">{s.goals}</div>
                        <div className="text-[10px] text-muted-foreground">BT</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-400">{s.assists}</div>
                        <div className="text-[10px] text-muted-foreground">KT</div>
                      </div>
                      <div className="text-center flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="font-bold text-yellow-400 text-sm">{s.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {scorers.length === 0 && (
                  <div className="text-center text-muted-foreground py-12 text-sm">Chưa có dữ liệu thống kê</div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
