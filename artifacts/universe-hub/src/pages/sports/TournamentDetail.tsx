import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { ArrowLeft, Loader2, Trophy, GitBranch, Users } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface Tournament { id: string; name: string; status: string; maxTeams: number; prizePool: number; format: string; description?: string; startDate: string; endDate: string; }
interface TournamentRound { id: string; roundNumber: number; name: string; startDate?: string; endDate?: string; }
interface Fixture { id: string; roundId: string; homeTeamId: string; awayTeamId: string; status: string; homeScore: number; awayScore: number; scheduledAt: string; }

const STATUS_COLOR: Record<string, string> = { UPCOMING: "bg-blue-500/20 text-blue-400", ONGOING: "bg-green-500/20 text-green-400", FINISHED: "bg-white/10 text-muted-foreground", CANCELLED: "bg-red-500/20 text-red-400" };

export default function TournamentDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: tournamentData, isLoading } = useQuery<{ ok: boolean; data: Tournament }>({
    queryKey: ["sports", "tournament", id],
    queryFn: async () => (await fetch(`/api/sports/tournaments/${id}`)).json() as Promise<{ ok: boolean; data: Tournament }>,
  });

  const { data: roundsData } = useQuery<{ ok: boolean; data: TournamentRound[] }>({
    queryKey: ["sports", "rounds", id],
    queryFn: async () => (await fetch(`/api/sports/tournaments/${id}/rounds`)).json() as Promise<{ ok: boolean; data: TournamentRound[] }>,
  });

  const tournament = tournamentData?.data;
  const rounds = roundsData?.data ?? [];

  if (isLoading) return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <Link href="/sports/tournaments" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />Giải vô địch
          </Link>

          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🏆</div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{tournament?.name}</h1>
                  {tournament?.description && <p className="text-sm text-muted-foreground mt-1">{tournament.description}</p>}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[tournament?.status ?? ""] ?? "bg-white/10 text-muted-foreground"}`}>{tournament?.status}</span>
                    <span className="text-xs text-muted-foreground">{tournament?.format.replace(/_/g, " ")}</span>
                    <span className="text-xs text-yellow-400 font-medium">💰 ${((tournament?.prizePool ?? 0) / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {[
                { label: "Số đội", value: tournament?.maxTeams ?? 0, icon: Users },
                { label: "Giải thưởng", value: `$${((tournament?.prizePool ?? 0) / 1000).toFixed(0)}K`, icon: Trophy },
                { label: "Bắt đầu", value: tournament?.startDate ? new Date(tournament.startDate).toLocaleDateString("vi-VN") : "—", icon: () => <span>📅</span> },
                { label: "Kết thúc", value: tournament?.endDate ? new Date(tournament.endDate).toLocaleDateString("vi-VN") : "—", icon: () => <span>🏁</span> },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-white">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Rounds / Bracket */}
          {rounds.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2"><GitBranch className="w-5 h-5 text-indigo-400" />Vòng đấu ({rounds.length})</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {rounds.map((round) => (
                  <div key={round.id} className="min-w-[180px] bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-xs text-muted-foreground font-mono mb-1">Vòng {round.roundNumber}</div>
                    <div className="font-semibold text-white text-sm">{round.name}</div>
                    {round.startDate && (
                      <div className="text-xs text-muted-foreground mt-2">{new Date(round.startDate).toLocaleDateString("vi-VN")}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {rounds.length === 0 && tournament?.status !== "FINISHED" && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <GitBranch className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <div className="text-muted-foreground text-sm">Bracket chưa được tạo</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
