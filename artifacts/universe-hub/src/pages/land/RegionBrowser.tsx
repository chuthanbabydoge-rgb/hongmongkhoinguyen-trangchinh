import { createSignal, createResource, For, Show } from "solid-js";

interface Region {
  id: string; name: string; slug: string; description?: string;
  biome: string; population: number; mapX: number; mapY: number;
  width: number; height: number; maxCities: number; isActive: boolean;
}

async function fetchRegions(): Promise<Region[]> {
  const res = await fetch("/api/land/regions?limit=50");
  const json = await res.json();
  return json.data ?? [];
}

const BIOME_COLORS: Record<string, string> = {
  TEMPERATE: "bg-emerald-900 text-emerald-300",
  ARCTIC: "bg-blue-900 text-blue-300",
  VOLCANIC: "bg-red-900 text-red-300",
  TROPICAL: "bg-cyan-900 text-cyan-300",
  HIGHLAND: "bg-amber-900 text-amber-300",
  DESERT: "bg-yellow-900 text-yellow-300",
};

export default function RegionBrowser() {
  const [search, setSearch] = createSignal("");
  const [regions] = createResource(fetchRegions);

  const filtered = () => (regions() ?? []).filter(r =>
    r.name.toLowerCase().includes(search().toLowerCase())
  );

  return (
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">🗺️ Vùng lãnh thổ</h1>
          <p class="text-slate-400 mt-1">Các vùng đất trong Universe</p>
        </div>
        <input
          type="text"
          placeholder="Tìm vùng..."
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
          class="bg-slate-700 text-white rounded-lg px-4 py-2 text-sm outline-none border border-slate-600 focus:border-violet-500"
        />
      </div>

      <Show when={regions()} fallback={<div class="text-slate-400">Đang tải...</div>}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <For each={filtered()}>{(region) => (
            <div class="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-violet-500 transition-colors">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="text-white font-semibold">{region.name}</h3>
                  <p class="text-slate-400 text-xs mt-0.5">{region.slug}</p>
                </div>
                <span class={`text-xs px-2 py-1 rounded-full ${BIOME_COLORS[region.biome] ?? "bg-slate-700 text-slate-300"}`}>
                  {region.biome}
                </span>
              </div>
              {region.description && (
                <p class="text-slate-400 text-sm mb-3">{region.description}</p>
              )}
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bg-slate-700 rounded-lg p-2">
                  <div class="text-white text-sm font-bold">{region.population.toLocaleString()}</div>
                  <div class="text-slate-400 text-xs">Dân số</div>
                </div>
                <div class="bg-slate-700 rounded-lg p-2">
                  <div class="text-white text-sm font-bold">{region.maxCities}</div>
                  <div class="text-slate-400 text-xs">Max Thành phố</div>
                </div>
                <div class="bg-slate-700 rounded-lg p-2">
                  <div class="text-white text-sm font-bold">{region.isActive ? "✅" : "❌"}</div>
                  <div class="text-slate-400 text-xs">Hoạt động</div>
                </div>
              </div>
              <div class="mt-3 text-xs text-slate-500">
                Map: ({region.mapX.toFixed(0)}, {region.mapY.toFixed(0)}) — {region.width}x{region.height}
              </div>
            </div>
          )}</For>
        </div>
        {filtered().length === 0 && (
          <div class="text-center py-12 text-slate-400">Không tìm thấy vùng nào</div>
        )}
      </Show>
    </div>
  );
}
