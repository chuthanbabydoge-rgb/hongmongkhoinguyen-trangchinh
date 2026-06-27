import { createSignal, createResource, For, Show } from "solid-js";

interface Road {
  id: string; name: string; type: string; length: number;
  speedLimit: number; lanes: number; isActive: boolean;
  fromX: number; fromY: number; toX: number; toY: number;
}

interface Bridge {
  id: string; name: string; length: number; isActive: boolean;
}

async function fetchRoads(): Promise<Road[]> {
  const res = await fetch("/api/land/roads?limit=100");
  const json = await res.json();
  return json.data ?? [];
}

const ROAD_TYPE_COLORS: Record<string, string> = {
  HIGHWAY: "bg-amber-900 text-amber-300",
  AVENUE: "bg-blue-900 text-blue-300",
  STREET: "bg-emerald-900 text-emerald-300",
  ALLEY: "bg-slate-700 text-slate-300",
  BRIDGE: "bg-violet-900 text-violet-300",
  TUNNEL: "bg-orange-900 text-orange-300",
  RAIL: "bg-rose-900 text-rose-300",
  SKY: "bg-cyan-900 text-cyan-300",
};

const ROAD_ICONS: Record<string, string> = {
  HIGHWAY: "🛣️", AVENUE: "🛤️", STREET: "🚶", ALLEY: "🚪",
  BRIDGE: "🌉", TUNNEL: "🕳️", RAIL: "🚆", SKY: "🌤️",
};

export default function RoadNetwork() {
  const [filter, setFilter] = createSignal("ALL");
  const [roads] = createResource(fetchRoads);

  const filtered = () => (roads() ?? []).filter(r =>
    filter() === "ALL" || r.type === filter()
  );

  const types = ["ALL", "HIGHWAY", "AVENUE", "STREET", "ALLEY", "BRIDGE", "TUNNEL", "RAIL", "SKY"];

  return (
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-white">🛣️ Mạng lưới Giao thông</h1>
          <p class="text-slate-400 mt-1">Đường, cầu và hệ thống kết nối</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          {types.map(t => (
            <button
              onClick={() => setFilter(t)}
              class={`text-xs px-3 py-1.5 rounded-full transition-colors ${filter() === t ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
            >{t}</button>
          ))}
        </div>
      </div>

      <Show when={roads()} fallback={<div class="text-slate-400">Đang tải...</div>}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <For each={filtered()}>{(road) => (
            <div class="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-amber-500 transition-colors">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="text-xl">{ROAD_ICONS[road.type] ?? "🛣️"}</span>
                  <div>
                    <h3 class="text-white font-semibold text-sm">{road.name}</h3>
                    <span class={`text-xs px-2 py-0.5 rounded-full ${ROAD_TYPE_COLORS[road.type] ?? "bg-slate-700 text-slate-300"}`}>
                      {road.type}
                    </span>
                  </div>
                </div>
                <span class={`text-xs ${road.isActive ? "text-emerald-400" : "text-red-400"}`}>
                  {road.isActive ? "✅" : "❌"}
                </span>
              </div>
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bg-slate-700 rounded-lg p-2">
                  <div class="text-white text-xs font-bold">{road.length.toFixed(0)}m</div>
                  <div class="text-slate-500 text-xs">Chiều dài</div>
                </div>
                <div class="bg-slate-700 rounded-lg p-2">
                  <div class="text-white text-xs font-bold">{road.speedLimit} km/h</div>
                  <div class="text-slate-500 text-xs">Tốc độ</div>
                </div>
                <div class="bg-slate-700 rounded-lg p-2">
                  <div class="text-white text-xs font-bold">{road.lanes}</div>
                  <div class="text-slate-500 text-xs">Làn xe</div>
                </div>
              </div>
            </div>
          )}</For>
        </div>
        {filtered().length === 0 && (
          <div class="text-center py-12 text-slate-400">Không có đường nào</div>
        )}
      </Show>
    </div>
  );
}
