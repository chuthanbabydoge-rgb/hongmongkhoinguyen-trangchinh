import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Trophy, Users, Zap, Calendar, TrendingUp, Globe, Swords, Star, ArrowRight, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface DashboardData {
  stats: { totalSports: number; totalLeagues: number; totalTeams: number; totalPlayers: number; liveMatches: number; todayMatches: number; totalTournaments: number; totalMatches: number };
  recentMatches: Match[];
  liveMatches: Match[];
  sports: Sport[];
  leagues: League[];
}
interface Match { id: string; homeTeamId: string; awayTeamId: string; status: string; homeScore: number; awayScore: number; scheduledAt: string; }
interface Sport { id: string; name: string; slug: string; icon: string; type: string; description?: string; }
interface League { id: string; name: string; country?: string; leagueType: string; }

const SPORT_GRADIENT: Record<string, string> = {
  FOOTBALL: "from-green-500/20 to-emerald-600/10",
  BASEBALL: "from-red-500/20 to-rose-600/10",
  BASKETBALL: "from-orange-500/20 to-amber-600/10",
  VOLLEYBALL: "from-blue-500/20 to-cyan-600/10",
  MARTIAL_ARTS: "from-purple-500/20 to-violet-600/10",
  TENNIS: "from-yellow-500/20 to-lime-600/10",
  ESPORTS: "from-pink-500/20 to-fuchsia-600/10",
};

export default function SportsDashboard() {
  const { data, isLoading } = useQuery<{ ok: boolean; data: DashboardData }>({
    queryKey: ["sports", "dashboard"],
    queryFn: async () => (await fetch("/api/sports/dashboard")).json() as Promise<{ ok: boolean; data: DashboardData }>,
  });

  const dash = data?.data;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-8">
          {/* Hero */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-cyan-500/20 border border-white/10 p-8">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg">🏆</div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">Universe Sports</h1>
                <p className="text-muted-foreground mt-1">Nền tảng thể thao toàn diện — quản lý, theo dõi và trải nghiệm</p>
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { label: "Môn thể thao", value: dash?.stats.totalSports ?? 0, icon: Globe, color: "text-blue-400" },
                  { label: "Giải đấu", value: dash?.stats.totalLeagues ?? 0, icon: Trophy, color: "text-yellow-400" },
                  { label: "Đội bóng", value: dash?.stats.totalTeams ?? 0, icon: Users, color: "text-green-400" },
                  { label: "Cầu thủ", value: dash?.stats.totalPlayers ?? 0, icon: Star, color: "text-purple-400" },
                  { label: "Trận LIVE", value: dash?.stats.liveMatches ?? 0, icon: Zap, color: "text-red-400" },
                  { label: "Hôm nay", value: dash?.stats.todayMatches ?? 0, icon: Calendar, color: "text-orange-400" },
                  { label: "Giải vô địch", value: dash?.stats.totalTournaments ?? 0, icon: Swords, color: "text-cyan-400" },
                  { label: "Tổng trận", value: dash?.stats.totalMatches ?? 0, icon: TrendingUp, color: "text-pink-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                    <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
                    <div className="text-2xl font-bold text-white">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sports */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Globe className="w-5 h-5 text-blue-400" />Môn thể thao</h2>
                <Link href="/sports/directory" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Xem tất cả <ArrowRight className="w-3 h-3" /></Link>
              </div>
              <div className="space-y-3">
                {(dash?.sports ?? []).slice(0, 5).map((sport) => (
                  <Link key={sport.id} href={`/sports/leagues?sportId=${sport.id}`}>
                    <div className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${SPORT_GRADIENT[sport.type] ?? "from-white/5 to-white/5"} border border-white/10 hover:border-white/20 transition-all cursor-pointer group`}>
                      <span className="text-2xl">{sport.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{sport.name}</div>
                        <div className="text-xs text-muted-foreground">{sport.type}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Live & Recent Matches */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Zap className="w-5 h-5 text-red-400" />Trận đấu gần đây</h2>
                <Link href="/sports/matches" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Xem tất cả <ArrowRight className="w-3 h-3" /></Link>
              </div>
              <div className="space-y-3">
                {(dash?.recentMatches ?? []).slice(0, 5).map((m) => (
                  <Link key={m.id} href={`/sports/matches/${m.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer group">
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${m.status === "LIVE" ? "bg-red-500/20 text-red-400 animate-pulse" : m.status === "FINISHED" ? "bg-white/10 text-muted-foreground" : "bg-blue-500/20 text-blue-400"}`}>{m.status === "LIVE" ? "🔴 LIVE" : m.status === "FINISHED" ? "FT" : "SCH"}</div>
                      <div className="flex-1 text-center">
                        <span className="text-sm text-white font-mono">{m.homeScore} — {m.awayScore}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{new Date(m.scheduledAt).toLocaleDateString("vi-VN")}</div>
                    </div>
                  </Link>
                ))}
                {(dash?.recentMatches ?? []).length === 0 && (
                  <div className="text-center text-muted-foreground py-8 text-sm">Chưa có trận đấu nào</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { href: "/sports/directory", icon: "🌐", label: "Môn thể thao", desc: "Khám phá các bộ môn" },
              { href: "/sports/leagues",   icon: "🏆", label: "Giải đấu",     desc: "Xem tất cả giải" },
              { href: "/sports/matches",   icon: "⚽", label: "Lịch thi đấu", desc: "Trận đấu hôm nay" },
              { href: "/sports/tournaments", icon: "🥇", label: "Tournament", desc: "Giải vô địch" },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="bg-white/5 border border-white/10 hover:border-indigo-500/40 rounded-2xl p-5 cursor-pointer group transition-all hover:bg-indigo-500/5">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
