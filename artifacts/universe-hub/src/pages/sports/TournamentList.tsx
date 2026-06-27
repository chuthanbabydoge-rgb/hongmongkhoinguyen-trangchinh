import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { Swords, Loader2, ArrowRight, Trophy } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface Tournament { id: string; sportId: string; name: string; slug: string; startDate: string; endDate: string; status: string; maxTeams: number; prizePool: number; format: string; description?: string; }

const STATUS_COLOR: Record<string, string> = { UPCOMING: "bg-blue-500/20 text-blue-400", ONGOING: "bg-green-500/20 text-green-400 animate-pulse", FINISHED: "bg-white/10 text-muted-foreground", CANCELLED: "bg-red-500/20 text-red-400" };
const STATUS_LABEL: Record<string, string> = { UPCOMING: "Sắp diễn ra", ONGOING: "🔥 Đang diễn ra", FINISHED: "Đã kết thúc", CANCELLED: "Đã hủy" };

export default function TournamentList() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sportId = params.get("sportId") ?? undefined;

  const { data, isLoading } = useQuery<{ ok: boolean; data: Tournament[] }>({
    queryKey: ["sports", "tournaments", sportId],
    queryFn: async () => {
      const url = sportId ? `/api/sports/tournaments?sportId=${sportId}` : "/api/sports/tournaments";
      return (await fetch(url)).json() as Promise<{ ok: boolean; data: Tournament[] }>;
    },
  });

  const tournaments = data?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center"><Swords className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-2xl font-bold text-white">Giải vô địch</h1>
              <p className="text-muted-foreground text-sm">{tournaments.length} giải đấu</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tournaments.map((t) => (
                <Link key={t.id} href={`/sports/tournaments/${t.id}`}>
                  <div className="bg-white/5 border border-white/10 hover:border-cyan-500/40 rounded-2xl p-5 cursor-pointer group transition-all hover:bg-cyan-500/5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl">🏆</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[t.status] ?? "bg-white/10 text-muted-foreground"}`}>{STATUS_LABEL[t.status] ?? t.status}</span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">{t.name}</h3>
                    {t.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{t.description}</p>}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Đội tham dự</span>
                        <span className="text-white">{t.maxTeams}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Giải thưởng</span>
                        <span className="text-yellow-400 font-medium">${(t.prizePool / 1000000).toFixed(0)}M</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Thể thức</span>
                        <span className="text-white">{t.format.replace(/_/g, " ")}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                      <span className="text-xs text-muted-foreground">{new Date(t.startDate).toLocaleDateString("vi-VN")} — {new Date(t.endDate).toLocaleDateString("vi-VN")}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
              {tournaments.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-20">Chưa có giải vô địch nào</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
