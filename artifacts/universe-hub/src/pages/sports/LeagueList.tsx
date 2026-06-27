import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { Trophy, Filter, Loader2, ArrowRight } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface League { id: string; sportId: string; name: string; slug: string; country?: string; leagueType: string; description?: string; logo?: string; isActive: boolean; }

const TYPE_LABEL: Record<string, string> = { DOMESTIC: "Nội địa", INTERNATIONAL: "Quốc tế", REGIONAL: "Khu vực", CUP: "Cúp" };
const TYPE_COLOR: Record<string, string> = { DOMESTIC: "bg-green-500/20 text-green-400", INTERNATIONAL: "bg-blue-500/20 text-blue-400", REGIONAL: "bg-yellow-500/20 text-yellow-400", CUP: "bg-purple-500/20 text-purple-400" };

export default function LeagueList() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sportId = params.get("sportId") ?? undefined;

  const { data, isLoading } = useQuery<{ ok: boolean; data: League[] }>({
    queryKey: ["sports", "leagues", sportId],
    queryFn: async () => {
      const url = sportId ? `/api/sports/leagues?sportId=${sportId}` : "/api/sports/leagues";
      return (await fetch(url)).json() as Promise<{ ok: boolean; data: League[] }>;
    },
  });

  const leagues = data?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center"><Trophy className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-2xl font-bold text-white">Giải đấu</h1>
              <p className="text-muted-foreground text-sm">{sportId ? "Giải đấu theo môn thể thao" : "Tất cả giải đấu trong Universe Sports"}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{leagues.length} giải đấu</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {leagues.map((league) => (
                <Link key={league.id} href={`/sports/leagues/${league.id}`}>
                  <div className="bg-white/5 border border-white/10 hover:border-yellow-500/40 rounded-2xl p-5 cursor-pointer group transition-all hover:bg-yellow-500/5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">{league.logo ? <img src={league.logo} alt="" className="w-12 h-12 rounded-full object-cover" /> : "🏆"}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLOR[league.leagueType] ?? "bg-white/10 text-muted-foreground"}`}>{TYPE_LABEL[league.leagueType] ?? league.leagueType}</span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-yellow-300 transition-colors mb-1">{league.name}</h3>
                    {league.country && <p className="text-sm text-muted-foreground">{league.country}</p>}
                    {league.description && <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2">{league.description}</p>}
                    <div className="mt-4 flex items-center justify-between">
                      <div className={`w-2 h-2 rounded-full ${league.isActive ? "bg-green-400" : "bg-white/20"}`} />
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-yellow-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
              {leagues.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-20">Chưa có giải đấu nào</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
