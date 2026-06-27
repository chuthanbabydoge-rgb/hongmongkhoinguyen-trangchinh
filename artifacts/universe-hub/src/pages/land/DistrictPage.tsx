import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface District {
  id: string; name: string; cityId: string; type: string;
  population: number; maxParcels: number; landValueBase: number;
  mapX: number; mapY: number; isActive: boolean;
}

const DTYPE_COLORS: Record<string, string> = {
  RESIDENTIAL: "bg-emerald-900/60 text-emerald-300",
  COMMERCIAL: "bg-blue-900/60 text-blue-300",
  INDUSTRIAL: "bg-orange-900/60 text-orange-300",
  EDUCATION: "bg-violet-900/60 text-violet-300",
  SPORTS: "bg-rose-900/60 text-rose-300",
  GOVERNMENT: "bg-amber-900/60 text-amber-300",
  MIXED: "bg-slate-600/60 text-slate-300",
  PARK: "bg-green-900/60 text-green-300",
  HARBOR: "bg-cyan-900/60 text-cyan-300",
  AIRPORT: "bg-sky-900/60 text-sky-300",
};

const DTYPES = ["ALL", "RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "EDUCATION", "SPORTS", "GOVERNMENT", "MIXED", "PARK", "HARBOR", "AIRPORT"];

export default function DistrictPage() {
  const [filter, setFilter] = useState("ALL");

  const { data, isLoading } = useQuery<{ success: boolean; data: District[] }>({
    queryKey: ["land", "districts"],
    queryFn: async () => (await fetch("/api/land/districts?limit=100")).json() as Promise<{ success: boolean; data: District[] }>,
  });

  const districts = data?.data ?? [];
  const filtered = districts.filter(d => filter === "ALL" || d.type === filter);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">🏘️ Quận / Huyện</h1>
              <p className="text-muted-foreground mt-1">Các khu vực phân chia trong thành phố</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {DTYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${filter === t ? "bg-violet-600 text-white" : "bg-muted/40 text-muted-foreground hover:bg-muted/60"}`}
                >{t}</button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((district) => (
                  <div key={district.id} className="bg-card border border-white/10 rounded-xl p-4 hover:border-violet-500/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-white font-semibold text-sm">{district.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${DTYPE_COLORS[district.type] ?? "bg-muted text-muted-foreground"}`}>
                        {district.type}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/40 rounded-lg p-2">
                        <div className="text-white text-xs font-bold">{district.population.toLocaleString()}</div>
                        <div className="text-muted-foreground text-xs">Dân số</div>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-2">
                        <div className="text-white text-xs font-bold">{district.maxParcels}</div>
                        <div className="text-muted-foreground text-xs">Max ô</div>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-2">
                        <div className="text-white text-xs font-bold">{district.landValueBase.toFixed(0)}</div>
                        <div className="text-muted-foreground text-xs">Giá cơ sở</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Map: ({district.mapX.toFixed(0)}, {district.mapY.toFixed(0)}) — {district.isActive ? "✅" : "❌"}
                    </div>
                  </div>
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">Không có quận/huyện nào</div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
