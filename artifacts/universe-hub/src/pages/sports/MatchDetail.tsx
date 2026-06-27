import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { ArrowLeft, Loader2, Zap, BarChart2, Clock } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface Match { id: string; homeTeamId: string; awayTeamId: string; status: string; homeScore: number; awayScore: number; scheduledAt: string; minute?: number; }
interface MatchEvent { id: string; teamId: string; playerId?: string; eventType: string; minute: number; description?: string; }
interface MatchStatistic { teamId: string; possession: number; shots: number; shotsOnTarget: number; corners: number; fouls: number; yellowCards: number; redCards: number; }

const EVENT_ICON: Record<string, string> = { GOAL: "⚽", YELLOW_CARD: "🟨", RED_CARD: "🟥", SUBSTITUTION: "🔄", POINT: "🏀", PENALTY: "❗" };

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: matchData, isLoading } = useQuery<{ ok: boolean; data: Match }>({
    queryKey: ["sports", "match", id],
    queryFn: async () => (await fetch(`/api/sports/matches/${id}`)).json() as Promise<{ ok: boolean; data: Match }>,
    refetchInterval: (data) => data?.data?.status === "LIVE" ? 15000 : false,
  });

  const { data: eventsData } = useQuery<{ ok: boolean; data: MatchEvent[] }>({
    queryKey: ["sports", "match-events", id],
    queryFn: async () => (await fetch(`/api/sports/matches/${id}/events`)).json() as Promise<{ ok: boolean; data: MatchEvent[] }>,
    refetchInterval: matchData?.data?.status === "LIVE" ? 15000 : false,
  });

  const { data: statsData } = useQuery<{ ok: boolean; data: MatchStatistic[] }>({
    queryKey: ["sports", "match-stats", id],
    queryFn: async () => (await fetch(`/api/sports/matches/${id}/statistics`)).json() as Promise<{ ok: boolean; data: MatchStatistic[] }>,
  });

  const match = matchData?.data;
  const events = eventsData?.data ?? [];
  const stats = statsData?.data ?? [];

  if (isLoading) return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-400" /></div>
    </div>
  );

  const isLive = match?.status === "LIVE";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <Link href="/sports/matches" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />Lịch thi đấu
          </Link>

          {/* Scoreboard */}
          <div className={`rounded-2xl p-8 text-center border ${isLive ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/10"}`}>
            {isLive && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-red-400 font-bold uppercase tracking-wider text-sm">{match?.minute ? `${match.minute}'` : "LIVE"}</span>
              </div>
            )}
            <div className="flex items-center justify-center gap-8 mb-4">
              <div className="text-right flex-1">
                <div className="text-base text-muted-foreground mb-1">Chủ nhà</div>
                <div className="text-sm font-mono text-white">{match?.homeTeamId.substring(0, 10)}</div>
              </div>
              <div className="text-5xl font-mono font-bold text-white">{match?.homeScore ?? 0} — {match?.awayScore ?? 0}</div>
              <div className="text-left flex-1">
                <div className="text-base text-muted-foreground mb-1">Khách</div>
                <div className="text-sm font-mono text-white">{match?.awayTeamId.substring(0, 10)}</div>
              </div>
            </div>
            <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${isLive ? "bg-red-500/20 text-red-400" : match?.status === "FINISHED" ? "bg-white/10 text-muted-foreground" : "bg-blue-500/20 text-blue-400"}`}>
              {isLive ? "🔴 Đang diễn ra" : match?.status === "FINISHED" ? "✅ Kết thúc" : `📅 ${match?.scheduledAt ? new Date(match.scheduledAt).toLocaleString("vi-VN") : ""}`}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Events Timeline */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-orange-400" />Diễn biến trận đấu</h2>
              {events.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {events.map((e) => (
                    <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5">
                      <span className="text-lg">{EVENT_ICON[e.eventType] ?? "⚡"}</span>
                      <div className="w-8 text-center text-xs font-mono text-muted-foreground">{e.minute}'</div>
                      <div className="flex-1">
                        <div className="text-sm text-white">{e.eventType.replace(/_/g, " ")}</div>
                        {e.description && <div className="text-xs text-muted-foreground">{e.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12 text-sm">Chưa có sự kiện nào</div>
              )}
            </div>

            {/* Statistics */}
            {stats.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-purple-400" />Thống kê</h2>
                <div className="space-y-3">
                  {[
                    { label: "Kiểm soát bóng", key: "possession", suffix: "%" },
                    { label: "Cú sút", key: "shots" },
                    { label: "Sút trúng đích", key: "shotsOnTarget" },
                    { label: "Phạt góc", key: "corners" },
                    { label: "Phạm lỗi", key: "fouls" },
                    { label: "Thẻ vàng", key: "yellowCards" },
                  ].map((stat) => {
                    const home = (stats[0] as Record<string, number> | undefined)?.[stat.key] ?? 0;
                    const away = (stats[1] as Record<string, number> | undefined)?.[stat.key] ?? 0;
                    const total = home + away || 1;
                    return (
                      <div key={stat.label}>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span className="font-medium text-white">{home}{stat.suffix ?? ""}</span>
                          <span className="text-muted-foreground">{stat.label}</span>
                          <span className="font-medium text-white">{away}{stat.suffix ?? ""}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                          <div className="bg-blue-500 transition-all" style={{ width: `${(home / total) * 100}%` }} />
                          <div className="bg-red-500 transition-all flex-1" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
