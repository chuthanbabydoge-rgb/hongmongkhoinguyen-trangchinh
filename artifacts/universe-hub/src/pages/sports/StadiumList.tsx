import { useQuery } from "@tanstack/react-query";
import { MapPin, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface Stadium { id: string; name: string; city?: string; country?: string; capacity?: number; venueType: string; photo?: string; }

const VENUE_ICON: Record<string, string> = { STADIUM: "🏟️", ARENA: "🎪", FIELD: "🌿", COURT: "🏀", RING: "🥊", ONLINE: "💻" };

export default function StadiumList() {
  const { data, isLoading } = useQuery<{ ok: boolean; data: Stadium[] }>({
    queryKey: ["sports", "stadiums"],
    queryFn: async () => (await fetch("/api/sports/stadiums")).json() as Promise<{ ok: boolean; data: Stadium[] }>,
  });

  const stadiums = data?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><MapPin className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-2xl font-bold text-white">Sân vận động</h1>
              <p className="text-muted-foreground text-sm">{stadiums.length} địa điểm thi đấu</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {stadiums.map((stadium) => (
                <div key={stadium.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-emerald-500/40 transition-all hover:bg-emerald-500/5">
                  <div className="h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center">
                    <span className="text-5xl">{VENUE_ICON[stadium.venueType] ?? "🏟️"}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white group-hover:text-emerald-300 transition-colors">{stadium.name}</h3>
                    {(stadium.city || stadium.country) && (
                      <div className="flex items-center gap-1.5 mt-1 text-muted-foreground text-sm">
                        <MapPin className="w-3 h-3" />
                        <span>{[stadium.city, stadium.country].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs bg-white/10 text-muted-foreground px-2 py-0.5 rounded-full">{stadium.venueType}</span>
                      {stadium.capacity && (
                        <span className="text-xs text-muted-foreground">👥 {stadium.capacity.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {stadiums.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-20">Chưa có sân vận động</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
