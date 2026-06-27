import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Globe, Loader2, Search } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface Region {
  id: string; name: string; slug: string; description?: string;
  biome: string; population: number; mapX: number; mapY: number;
  width: number; height: number; maxCities: number; isActive: boolean;
}

const BIOME_COLORS: Record<string, string> = {
  TEMPERATE: "bg-emerald-900/60 text-emerald-300",
  ARCTIC: "bg-blue-900/60 text-blue-300",
  VOLCANIC: "bg-red-900/60 text-red-300",
  TROPICAL: "bg-cyan-900/60 text-cyan-300",
  HIGHLAND: "bg-amber-900/60 text-amber-300",
  DESERT: "bg-yellow-900/60 text-yellow-300",
};

export default function RegionBrowser() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<{ success: boolean; data: Region[] }>({
    queryKey: ["land", "regions"],
    queryFn: async () => (await fetch("/api/land/regions?limit=50")).json() as Promise<{ success: boolean; data: Region[] }>,
  });

  const regions = data?.data ?? [];
  const filtered = regions.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Globe className="w-6 h-6 text-violet-400" />Vùng lãnh thổ</h1>
              <p className="text-muted-foreground mt-1">Các vùng đất trong Universe</p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm vùng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-muted/40 text-white rounded-lg pl-9 pr-4 py-2 text-sm outline-none border border-white/10 focus:border-violet-500"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((region) => (
                  <div key={region.id} className="bg-card border border-white/10 rounded-xl p-5 hover:border-violet-500/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-semibold">{region.name}</h3>
                        <p className="text-muted-foreground text-xs mt-0.5">{region.slug}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${BIOME_COLORS[region.biome] ?? "bg-muted text-muted-foreground"}`}>
                        {region.biome}
                      </span>
                    </div>
                    {region.description && (
                      <p className="text-muted-foreground text-sm mb-3">{region.description}</p>
                    )}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/40 rounded-lg p-2">
                        <div className="text-white text-sm font-bold">{region.population.toLocaleString()}</div>
                        <div className="text-muted-foreground text-xs">Dân số</div>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-2">
                        <div className="text-white text-sm font-bold">{region.maxCities}</div>
                        <div className="text-muted-foreground text-xs">Max TP</div>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-2">
                        <div className="text-white text-sm font-bold">{region.isActive ? "✅" : "❌"}</div>
                        <div className="text-muted-foreground text-xs">Active</div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Map: ({region.mapX.toFixed(0)}, {region.mapY.toFixed(0)}) — {region.width}×{region.height}
                    </div>
                  </div>
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">Không tìm thấy vùng nào</div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
