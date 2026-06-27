import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Loader2 } from "lucide-react";

interface StatData {
  stats: {
    totalParcels: number; ownedParcels: number; totalBuildings: number;
    totalPopulation: number; totalValue: number; avgParcelValue: number;
    totalRevenue: number;
  } | null;
  counts: {
    regions: number; cities: number; parcels: number;
    buildings: number; roads: number; utilities: number; teleports: number;
  };
}

export default function LandStatistics() {
  const { data, isLoading } = useQuery<{ success: boolean; data: StatData }>({
    queryKey: ["land", "statistics"],
    queryFn: async () => (await fetch("/api/land/statistics")).json() as Promise<{ success: boolean; data: StatData }>,
  });
  const d = data?.data;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">📈 Thống kê Đất đai</h1>
            <p className="text-muted-foreground mt-1">Số liệu tổng thể hệ thống Universe Land</p>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
          ) : d ? (
            <>
              <div className="bg-card border border-white/10 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-4">🗺️ Hạ tầng tổng thể</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {[
                    { label: "Vùng", value: d.counts.regions, icon: "🗺️", color: "text-violet-400" },
                    { label: "Thành phố", value: d.counts.cities, icon: "🏙️", color: "text-blue-400" },
                    { label: "Ô đất", value: d.counts.parcels, icon: "📦", color: "text-emerald-400" },
                    { label: "Công trình", value: d.counts.buildings, icon: "🏗️", color: "text-amber-400" },
                    { label: "Đường", value: d.counts.roads, icon: "🛣️", color: "text-orange-400" },
                    { label: "Tiện ích", value: d.counts.utilities, icon: "⚡", color: "text-yellow-400" },
                    { label: "Teleport", value: d.counts.teleports, icon: "🌀", color: "text-pink-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</div>
                      <div className="text-muted-foreground text-xs">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {d.stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card border border-white/10 rounded-xl p-5">
                    <h3 className="text-white font-semibold mb-4">💰 Giá trị thị trường</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Tổng giá trị ô đất", value: d.stats.totalValue, color: "text-emerald-400" },
                        { label: "Giá trị TB/ô đất", value: d.stats.avgParcelValue, color: "text-blue-400" },
                        { label: "Doanh thu tích lũy", value: d.stats.totalRevenue, color: "text-violet-400" },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                          <span className="text-muted-foreground text-sm">{item.label}</span>
                          <span className={`font-bold ${item.color}`}>{item.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-card border border-white/10 rounded-xl p-5">
                    <h3 className="text-white font-semibold mb-4">🏘️ Chiếm dụng</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Tổng ô đất", value: d.stats.totalParcels, color: "text-foreground" },
                        { label: "Đã có chủ", value: d.stats.ownedParcels, color: "text-blue-400" },
                        { label: "Tổng công trình", value: d.stats.totalBuildings, color: "text-amber-400" },
                        { label: "Tổng dân số", value: d.stats.totalPopulation, color: "text-emerald-400" },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                          <span className="text-muted-foreground text-sm">{item.label}</span>
                          <span className={`font-bold ${item.color}`}>{item.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
