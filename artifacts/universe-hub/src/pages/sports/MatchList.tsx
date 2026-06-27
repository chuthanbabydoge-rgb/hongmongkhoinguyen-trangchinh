import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, Zap, Loader2, Filter, ArrowRight, Clock } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface Match { id: string; homeTeamId: string; awayTeamId: string; status: string; homeScore: number; awayScore: number; scheduledAt: string; stadiumId?: string; }

const STATUS_OPTS = ["ALL", "LIVE", "SCHEDULED", "FINISHED", "POSTPONED", "CANCELLED"];

export default function MatchList() {
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: liveData } = useQuery<{ ok: boolean; data: Match[] }>({
    queryKey: ["sports", "matches", "live"],
    queryFn: async () => (await fetch("/api/sports/matches/live")).json() as Promise<{ ok: boolean; data: Match[] }>,
    refetchInterval: 30000,
  });

  const { data, isLoading } = useQuery<{ ok: boolean; data: Match[] }>({
    queryKey: ["sports", "matches", statusFilter],
    queryFn: async () => {
      const url = statusFilter !== "ALL" ? `/api/sports/matches?status=${statusFilter}&limit=50` : "/api/sports/matches?limit=50";
      return (await fetch(url)).json() as Promise<{ ok: boolean; data: Match[] }>;
    },
  });

  const liveMatches = liveData?.data ?? [];
  const matches = data?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center"><Calendar className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-2xl font-bold text-white">Lịch thi đấu</h1>
              <p className="text-muted-foreground text-sm">{liveMatches.length} trận đang diễn ra</p>
            </div>
          </div>

          {/* Live Matches Banner */}
          {liveMatches.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-sm font-semibold text-red-400 uppercase tracking-wider">Đang diễn ra — {liveMatches.length} trận LIVE</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {liveMatches.map((m) => (
                  <Link key={m.id} href={`/sports/matches/${m.id}`}>
                    <div className="bg-white/5 border border-red-500/30 rounded-xl p-4 cursor-pointer hover:bg-red-500/10 transition-colors min-w-[160px]">
                      <div className="text-center">
                        <div className="text-xl font-mono font-bold text-white">{m.homeScore} — {m.awayScore}</div>
                        <div className="text-[10px] text-red-400 font-medium mt-1 animate-pulse">🔴 LIVE</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {STATUS_OPTS.map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-indigo-500 text-white" : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10"}`}>
                {s}
              </button>
            ))}
          </div>

          {/* Match List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-red-400" /></div>
          ) : (
            <div className="space-y-3">
              {matches.map((m) => (
                <Link key={m.id} href={`/sports/matches/${m.id}`}>
                  <div className="bg-white/5 border border-white/10 hover:border-white/20 rounded-xl p-4 cursor-pointer group transition-all flex items-center gap-4">
                    <div className={`w-16 text-center text-xs font-medium px-2 py-1 rounded ${m.status === "LIVE" ? "bg-red-500/20 text-red-400 animate-pulse" : m.status === "FINISHED" ? "bg-white/10 text-muted-foreground" : m.status === "SCHEDULED" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                      {m.status === "LIVE" ? "🔴 LIVE" : m.status === "FINISHED" ? "FT" : m.status === "SCHEDULED" ? "SCH" : m.status}
                    </div>
                    <div className="flex-1 text-center">
                      <div className="text-lg font-mono font-bold text-white">{m.homeScore} — {m.awayScore}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs">{new Date(m.scheduledAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                  </div>
                </Link>
              ))}
              {matches.length === 0 && (
                <div className="text-center text-muted-foreground py-20">Không có trận đấu nào</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
