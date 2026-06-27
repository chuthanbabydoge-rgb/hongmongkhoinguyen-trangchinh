import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Trophy, Calendar, ArrowLeft, Loader2, BarChart2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface League { id: string; name: string; country?: string; leagueType: string; description?: string; isActive: boolean; }
interface Season { id: string; name: string; status: string; startDate: string; endDate: string; }
interface Ranking { id: string; teamId: string; position: number; points: number; played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; goalDifference: number; }

export default function LeagueDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: leagueData, isLoading } = useQuery<{ ok: boolean; data: League }>({
    queryKey: ["sports", "league", id],
    queryFn: async () => (await fetch(`/api/sports/leagues/${id}`)).json() as Promise<{ ok: boolean; data: League }>,
  });

  const { data: seasonsData } = useQuery<{ ok: boolean; data: Season[] }>({
    queryKey: ["sports", "seasons", id],
    queryFn: async () => (await fetch(`/api/sports/seasons?leagueId=${id}`)).json() as Promise<{ ok: boolean; data: Season[] }>,
  });

  const league = leagueData?.data;
  const seasons = seasonsData?.data ?? [];
  const activeSeason = seasons.find((s) => s.status === "ACTIVE") ?? seasons[0];

  const { data: rankingsData } = useQuery<{ ok: boolean; data: Ranking[] }>({
    queryKey: ["sports", "rankings", activeSeason?.id],
    queryFn: async () => (await fetch(`/api/sports/rankings/${activeSeason!.id}`)).json() as Promise<{ ok: boolean; data: Ranking[] }>,
    enabled: !!activeSeason?.id,
  });

  const rankings = rankingsData?.data ?? [];

  if (isLoading) return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <Link href="/sports/leagues" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />Danh sách giải đấu
          </Link>

          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-3xl">🏆</div>
              <div>
                <h1 className="text-2xl font-bold text-white">{league?.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  {league?.country && <span className="text-sm text-muted-foreground">{league.country}</span>}
                  <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">{league?.leagueType}</span>
                  <div className={`w-2 h-2 rounded-full ${league?.isActive ? "bg-green-400" : "bg-white/20"}`} />
                </div>
                {league?.description && <p className="text-sm text-muted-foreground mt-2">{league.description}</p>}
              </div>
            </div>
          </div>

          {/* Seasons */}
          {seasons.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-400" />Mùa giải</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {seasons.map((s) => (
                  <div key={s.id} className={`p-4 rounded-xl border ${s.status === "ACTIVE" ? "bg-green-500/10 border-green-500/30" : "bg-white/5 border-white/10"}`}>
                    <div className="font-semibold text-white text-sm">{s.name}</div>
                    <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${s.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : s.status === "UPCOMING" ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-muted-foreground"}`}>{s.status}</div>
                    <div className="text-xs text-muted-foreground mt-2">{new Date(s.startDate).toLocaleDateString("vi-VN")} — {new Date(s.endDate).toLocaleDateString("vi-VN")}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rankings Table */}
          {rankings.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-purple-400" />Bảng xếp hạng</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground border-b border-white/10">
                      <th className="text-left pb-3 w-8">#</th>
                      <th className="text-left pb-3">Đội</th>
                      <th className="text-center pb-3">Trận</th>
                      <th className="text-center pb-3">Thắng</th>
                      <th className="text-center pb-3">Hòa</th>
                      <th className="text-center pb-3">Thua</th>
                      <th className="text-center pb-3">H/S</th>
                      <th className="text-center pb-3 font-bold text-white">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rankings.map((r) => (
                      <tr key={r.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 text-muted-foreground font-mono">{r.position}</td>
                        <td className="py-3 text-white">{r.teamId.substring(0, 8)}</td>
                        <td className="py-3 text-center text-muted-foreground">{r.played}</td>
                        <td className="py-3 text-center text-green-400">{r.won}</td>
                        <td className="py-3 text-center text-yellow-400">{r.drawn}</td>
                        <td className="py-3 text-center text-red-400">{r.lost}</td>
                        <td className="py-3 text-center text-muted-foreground">{r.goalDifference > 0 ? "+" : ""}{r.goalDifference}</td>
                        <td className="py-3 text-center font-bold text-white">{r.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
