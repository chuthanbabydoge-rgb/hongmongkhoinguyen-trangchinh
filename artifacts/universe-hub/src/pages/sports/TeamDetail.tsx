import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Users, ArrowLeft, Loader2, Shield, BarChart2, User } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface Team { id: string; clubId: string; name: string; shortName?: string; logo?: string; color?: string; }
interface Player { id: string; name: string; position?: string; nationality?: string; number?: number; isActive: boolean; }
interface Coach { id: string; name: string; role: string; nationality?: string; }
interface TeamStatistic { matchesPlayed: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number; points: number; cleanSheets: number; }

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: teamData, isLoading } = useQuery<{ ok: boolean; data: Team }>({
    queryKey: ["sports", "team", id],
    queryFn: async () => (await fetch(`/api/sports/teams/${id}`)).json() as Promise<{ ok: boolean; data: Team }>,
  });

  const { data: playersData } = useQuery<{ ok: boolean; data: Player[] }>({
    queryKey: ["sports", "players", id],
    queryFn: async () => (await fetch(`/api/sports/players?teamId=${id}`)).json() as Promise<{ ok: boolean; data: Player[] }>,
  });

  const { data: coachesData } = useQuery<{ ok: boolean; data: Coach[] }>({
    queryKey: ["sports", "coaches", id],
    queryFn: async () => (await fetch(`/api/sports/coaches?teamId=${id}`)).json() as Promise<{ ok: boolean; data: Coach[] }>,
  });

  const { data: statsData } = useQuery<{ ok: boolean; data: TeamStatistic }>({
    queryKey: ["sports", "team-stats", id],
    queryFn: async () => (await fetch(`/api/sports/teams/${id}/statistics`)).json() as Promise<{ ok: boolean; data: TeamStatistic }>,
  });

  const team = teamData?.data;
  const players = playersData?.data ?? [];
  const coaches = coachesData?.data ?? [];
  const stats = statsData?.data;

  if (isLoading) return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <Link href="/sports/teams" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />Danh sách đội
          </Link>

          {/* Header */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center border-2" style={{ borderColor: team?.color ?? "#6366f1", backgroundColor: `${team?.color ?? "#6366f1"}20` }}>
                <Shield className="w-10 h-10" style={{ color: team?.color ?? "#6366f1" }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{team?.name}</h1>
                {team?.shortName && <div className="text-sm font-mono text-muted-foreground">{team.shortName}</div>}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted-foreground">{players.length} cầu thủ</span>
                  <span className="text-xs text-muted-foreground">{coaches.length} HLV</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats */}
            {stats && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-purple-400" />Thống kê</h2>
                <div className="space-y-3">
                  {[
                    { label: "Trận đấu", value: stats.matchesPlayed },
                    { label: "Thắng", value: stats.wins, color: "text-green-400" },
                    { label: "Hòa", value: stats.draws, color: "text-yellow-400" },
                    { label: "Thua", value: stats.losses, color: "text-red-400" },
                    { label: "Bàn thắng", value: stats.goalsFor },
                    { label: "Điểm", value: stats.points, color: "text-indigo-400" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{s.label}</span>
                      <span className={`font-bold text-sm ${s.color ?? "text-white"}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Players */}
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" />Đội hình ({players.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                {players.map((player) => (
                  <Link key={player.id} href={`/sports/players/${player.id}`}>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">{player.number ?? "—"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{player.name}</div>
                        <div className="text-xs text-muted-foreground">{player.position} · {player.nationality}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Coaches */}
          {coaches.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2"><User className="w-4 h-4 text-orange-400" />Ban huấn luyện</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {coaches.map((coach) => (
                  <div key={coach.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="font-medium text-white text-sm">{coach.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{coach.role} · {coach.nationality}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
