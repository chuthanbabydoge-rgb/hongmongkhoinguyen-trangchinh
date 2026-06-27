import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Globe, ArrowRight, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface Sport { id: string; name: string; slug: string; icon: string; type: string; description?: string; isActive: boolean; }

const TYPE_COLOR: Record<string, string> = {
  FOOTBALL: "border-green-500/30 hover:border-green-500/60",
  BASEBALL: "border-red-500/30 hover:border-red-500/60",
  BASKETBALL: "border-orange-500/30 hover:border-orange-500/60",
  VOLLEYBALL: "border-blue-500/30 hover:border-blue-500/60",
  MARTIAL_ARTS: "border-purple-500/30 hover:border-purple-500/60",
  TENNIS: "border-yellow-500/30 hover:border-yellow-500/60",
  ESPORTS: "border-pink-500/30 hover:border-pink-500/60",
};

export default function SportsDirectory() {
  const { data, isLoading } = useQuery<{ ok: boolean; data: Sport[] }>({
    queryKey: ["sports", "list"],
    queryFn: async () => (await fetch("/api/sports")).json() as Promise<{ ok: boolean; data: Sport[] }>,
  });

  const sports = data?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Globe className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-2xl font-bold text-white">Môn thể thao</h1>
              <p className="text-muted-foreground text-sm">Khám phá tất cả các bộ môn thể thao trong Universe</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {sports.map((sport) => (
                <Link key={sport.id} href={`/sports/leagues?sportId=${sport.id}`}>
                  <div className={`relative bg-white/5 border ${TYPE_COLOR[sport.type] ?? "border-white/10"} rounded-2xl p-6 cursor-pointer group transition-all hover:bg-white/8`}>
                    <div className="text-5xl mb-4">{sport.icon}</div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{sport.name}</h3>
                    {sport.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{sport.description}</p>}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground/60 uppercase tracking-wider">{sport.type}</span>
                      <div className={`w-2 h-2 rounded-full ${sport.isActive ? "bg-green-400" : "bg-white/20"}`} />
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-indigo-400" />
                    </div>
                  </div>
                </Link>
              ))}
              {sports.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-20">Chưa có môn thể thao nào</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
