import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { Users, Loader2, ArrowRight, Shield } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface Team { id: string; clubId: string; name: string; shortName?: string; logo?: string; color?: string; }
interface Club { id: string; name: string; city?: string; country?: string; }

export default function TeamList() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const clubId = params.get("clubId") ?? undefined;

  const { data, isLoading } = useQuery<{ ok: boolean; data: Team[] }>({
    queryKey: ["sports", "teams", clubId],
    queryFn: async () => {
      const url = clubId ? `/api/sports/teams?clubId=${clubId}` : "/api/sports/teams";
      return (await fetch(url)).json() as Promise<{ ok: boolean; data: Team[] }>;
    },
  });

  const teams = data?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-2xl font-bold text-white">Đội bóng</h1>
              <p className="text-muted-foreground text-sm">{teams.length} đội trong hệ thống</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {teams.map((team) => (
                <Link key={team.id} href={`/sports/teams/${team.id}`}>
                  <div className="bg-white/5 border border-white/10 hover:border-blue-500/40 rounded-2xl p-5 cursor-pointer group transition-all hover:bg-blue-500/5">
                    <div className="flex items-center gap-3 mb-3">
                      {team.logo ? (
                        <img src={team.logo} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center border-2" style={{ borderColor: team.color ?? "#6366f1", backgroundColor: `${team.color ?? "#6366f1"}20` }}>
                          <Shield className="w-6 h-6" style={{ color: team.color ?? "#6366f1" }} />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">{team.name}</div>
                        {team.shortName && <div className="text-xs text-muted-foreground font-mono">{team.shortName}</div>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      {team.color && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }} />}
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-400 ml-auto transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
              {teams.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-20">Chưa có đội nào</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
