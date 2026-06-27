import { useQuery } from "@tanstack/react-query";
import { Trophy, Loader2, Medal } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface Award { id: string; name: string; awardType: string; description?: string; winnerId?: string; winnerName?: string; winnerType?: string; grantedAt: string; }

const TYPE_ICON: Record<string, string> = { INDIVIDUAL: "👤", TEAM: "👥", SEASON: "📅", TOURNAMENT: "🏆", CAREER: "⭐" };
const TYPE_COLOR: Record<string, string> = { INDIVIDUAL: "bg-purple-500/20 text-purple-400", TEAM: "bg-blue-500/20 text-blue-400", SEASON: "bg-yellow-500/20 text-yellow-400", TOURNAMENT: "bg-orange-500/20 text-orange-400", CAREER: "bg-pink-500/20 text-pink-400" };

export default function AwardsList() {
  const { data, isLoading } = useQuery<{ ok: boolean; data: Award[] }>({
    queryKey: ["sports", "awards"],
    queryFn: async () => (await fetch("/api/sports/awards")).json() as Promise<{ ok: boolean; data: Award[] }>,
  });

  const awards = data?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center"><Trophy className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-2xl font-bold text-white">Giải thưởng</h1>
              <p className="text-muted-foreground text-sm">{awards.length} giải thưởng</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {awards.map((award) => (
                <div key={award.id} className="bg-white/5 border border-white/10 hover:border-yellow-500/40 rounded-2xl p-5 group transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{TYPE_ICON[award.awardType] ?? "🏅"}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLOR[award.awardType] ?? "bg-white/10 text-muted-foreground"}`}>{award.awardType}</span>
                  </div>
                  <h3 className="font-bold text-white group-hover:text-yellow-300 transition-colors">{award.name}</h3>
                  {award.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{award.description}</p>}
                  {award.winnerName && (
                    <div className="mt-3 flex items-center gap-2">
                      <Medal className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-sm text-yellow-400 font-medium">{award.winnerName}</span>
                    </div>
                  )}
                  <div className="mt-3 text-xs text-muted-foreground">{new Date(award.grantedAt).toLocaleDateString("vi-VN")}</div>
                </div>
              ))}
              {awards.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-20">Chưa có giải thưởng nào</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
