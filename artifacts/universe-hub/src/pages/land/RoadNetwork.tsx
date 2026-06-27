import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface Road {
  id: string; name: string; type: string; length: number;
  speedLimit: number; lanes: number; isActive: boolean;
  fromX: number; fromY: number; toX: number; toY: number;
}

const ROAD_TYPE_COLORS: Record<string, string> = {
  HIGHWAY: "bg-amber-900/60 text-amber-300",
  AVENUE: "bg-blue-900/60 text-blue-300",
  STREET: "bg-emerald-900/60 text-emerald-300",
  ALLEY: "bg-muted text-muted-foreground",
  BRIDGE: "bg-violet-900/60 text-violet-300",
  TUNNEL: "bg-orange-900/60 text-orange-300",
  RAIL: "bg-rose-900/60 text-rose-300",
  SKY: "bg-cyan-900/60 text-cyan-300",
};

const ROAD_ICONS: Record<string, string> = {
  HIGHWAY: "🛣️", AVENUE: "🛤️", STREET: "🚶", ALLEY: "🚪",
  BRIDGE: "🌉", TUNNEL: "🕳️", RAIL: "🚆", SKY: "🌤️",
};

const TYPES = ["ALL", "HIGHWAY", "AVENUE", "STREET", "ALLEY", "BRIDGE", "TUNNEL", "RAIL", "SKY"];

export default function RoadNetwork() {
  const [filter, setFilter] = useState("ALL");

  const { data, isLoading } = useQuery<{ success: boolean; data: Road[] }>({
    queryKey: ["land", "roads"],
    queryFn: async () => (await fetch("/api/land/roads?limit=100")).json() as Promise<{ success: boolean; data: Road[] }>,
  });

  const roads = data?.data ?? [];
  const filtered = roads.filter(r => filter === "ALL" || r.type === filter);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">🛣️ Mạng lưới Giao thông</h1>
              <p className="text-muted-foreground mt-1">Đường, cầu và hệ thống kết nối</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${filter === t ? "bg-amber-600 text-white" : "bg-muted/40 text-muted-foreground hover:bg-muted/60"}`}
                >{t}</button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((road) => (
                  <div key={road.id} className="bg-card border border-white/10 rounded-xl p-4 hover:border-amber-500/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{ROAD_ICONS[road.type] ?? "🛣️"}</span>
                        <div>
                          <h3 className="text-white font-semibold text-sm">{road.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${ROAD_TYPE_COLORS[road.type] ?? "bg-muted text-muted-foreground"}`}>
                            {road.type}
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs ${road.isActive ? "text-emerald-400" : "text-red-400"}`}>
                        {road.isActive ? "✅" : "❌"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/40 rounded-lg p-2">
                        <div className="text-white text-xs font-bold">{road.length.toFixed(0)}m</div>
                        <div className="text-muted-foreground text-xs">Chiều dài</div>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-2">
                        <div className="text-white text-xs font-bold">{road.speedLimit} km/h</div>
                        <div className="text-muted-foreground text-xs">Tốc độ</div>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-2">
                        <div className="text-white text-xs font-bold">{road.lanes}</div>
                        <div className="text-muted-foreground text-xs">Làn xe</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">Không có đường nào</div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
