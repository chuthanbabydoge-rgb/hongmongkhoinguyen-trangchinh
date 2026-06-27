import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Star, Loader2, ArrowRight } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface Player { id: string; name: string; slug: string; position?: string; nationality?: string; number?: number; isActive: boolean; }

export default function PlayerList() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<{ ok: boolean; data: Player[] }>({
    queryKey: ["sports", "players", search],
    queryFn: async () => {
      const url = search ? `/api/sports/players?search=${encodeURIComponent(search)}&limit=60` : "/api/sports/players?limit=60";
      return (await fetch(url)).json() as Promise<{ ok: boolean; data: Player[] }>;
    },
  });

  const players = data?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center"><Star className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-2xl font-bold text-white">Cầu thủ</h1>
              <p className="text-muted-foreground text-sm">{players.length} cầu thủ</p>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 transition-colors"
              placeholder="Tìm kiếm cầu thủ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {players.map((player) => (
                <Link key={player.id} href={`/sports/players/${player.id}`}>
                  <div className="bg-white/5 border border-white/10 hover:border-purple-500/40 rounded-xl p-4 cursor-pointer group transition-all hover:bg-purple-500/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-400">
                        {player.number ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors truncate">{player.name}</div>
                        <div className="text-xs text-muted-foreground">{player.position} · {player.nationality}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-purple-400 transition-colors" />
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${player.isActive ? "bg-green-400" : "bg-white/20"}`} />
                      <span className="text-[10px] text-muted-foreground">{player.isActive ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                </Link>
              ))}
              {players.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-20">Không tìm thấy cầu thủ</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
