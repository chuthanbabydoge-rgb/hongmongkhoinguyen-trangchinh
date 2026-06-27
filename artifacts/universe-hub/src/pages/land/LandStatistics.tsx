import { createResource, Show, For } from "solid-js";

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

async function fetchStatistics(): Promise<StatData> {
  const res = await fetch("/api/land/statistics");
  const json = await res.json();
  return json.data;
}

export default function LandStatistics() {
  const [data] = createResource(fetchStatistics);

  return (
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-white">📈 Thống kê Đất đai</h1>
        <p class="text-slate-400 mt-1">Số liệu tổng thể hệ thống Universe Land</p>
      </div>

      <Show when={data()} fallback={<div class="text-slate-400">Đang tải...</div>}>
        {(d) => (
          <>
            <div class="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h3 class="text-white font-semibold mb-4">🗺️ Hạ tầng tổng thể</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  { label: "Vùng", value: d().counts.regions, icon: "🗺️", color: "text-violet-400" },
                  { label: "Thành phố", value: d().counts.cities, icon: "🏙️", color: "text-blue-400" },
                  { label: "Ô đất", value: d().counts.parcels, icon: "📦", color: "text-emerald-400" },
                  { label: "Công trình", value: d().counts.buildings, icon: "🏗️", color: "text-amber-400" },
                  { label: "Đường", value: d().counts.roads, icon: "🛣️", color: "text-orange-400" },
                  { label: "Tiện ích", value: d().counts.utilities, icon: "⚡", color: "text-yellow-400" },
                  { label: "Teleport", value: d().counts.teleports, icon: "🌀", color: "text-pink-400" },
                ].map((s) => (
                  <div class="bg-slate-700 rounded-xl p-4 text-center">
                    <div class="text-2xl mb-1">{s.icon}</div>
                    <div class={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</div>
                    <div class="text-slate-400 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <Show when={d().stats}>
              {(stats) => (
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-slate-800 rounded-xl p-5 border border-slate-700">
                    <h3 class="text-white font-semibold mb-4">💰 Giá trị thị trường</h3>
                    <div class="space-y-3">
                      {[
                        { label: "Tổng giá trị ô đất", value: stats().totalValue, color: "text-emerald-400" },
                        { label: "Giá trị TB/ô đất", value: stats().avgParcelValue, color: "text-blue-400" },
                        { label: "Doanh thu tích lũy", value: stats().totalRevenue, color: "text-violet-400" },
                      ].map(item => (
                        <div class="flex items-center justify-between bg-slate-700 rounded-lg px-4 py-3">
                          <span class="text-slate-400 text-sm">{item.label}</span>
                          <span class={`font-bold ${item.color}`}>{item.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div class="bg-slate-800 rounded-xl p-5 border border-slate-700">
                    <h3 class="text-white font-semibold mb-4">🏘️ Chiếm dụng</h3>
                    <div class="space-y-3">
                      {[
                        { label: "Tổng ô đất", value: stats().totalParcels, color: "text-slate-300" },
                        { label: "Đã có chủ", value: stats().ownedParcels, color: "text-blue-400" },
                        { label: "Tổng công trình", value: stats().totalBuildings, color: "text-amber-400" },
                        { label: "Tổng dân số", value: stats().totalPopulation, color: "text-emerald-400" },
                      ].map(item => (
                        <div class="flex items-center justify-between bg-slate-700 rounded-lg px-4 py-3">
                          <span class="text-slate-400 text-sm">{item.label}</span>
                          <span class={`font-bold ${item.color}`}>{item.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Show>
          </>
        )}
      </Show>
    </div>
  );
}
