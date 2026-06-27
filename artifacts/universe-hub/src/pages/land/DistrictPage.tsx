import { createSignal, createResource, For, Show } from "solid-js";

interface District {
  id: string; name: string; cityId: string; type: string;
  population: number; maxParcels: number; landValueBase: number;
  mapX: number; mapY: number; isActive: boolean;
}

async function fetchDistricts(): Promise<District[]> {
  const res = await fetch("/api/land/districts?limit=100");
  const json = await res.json();
  return json.data ?? [];
}

const DTYPE_COLORS: Record<string, string> = {
  RESIDENTIAL: "bg-emerald-900 text-emerald-300",
  COMMERCIAL: "bg-blue-900 text-blue-300",
  INDUSTRIAL: "bg-orange-900 text-orange-300",
  EDUCATION: "bg-violet-900 text-violet-300",
  SPORTS: "bg-rose-900 text-rose-300",
  GOVERNMENT: "bg-amber-900 text-amber-300",
  MIXED: "bg-slate-700 text-slate-300",
  PARK: "bg-green-900 text-green-300",
  HARBOR: "bg-cyan-900 text-cyan-300",
  AIRPORT: "bg-sky-900 text-sky-300",
};

export default function DistrictPage() {
  const [filter, setFilter] = createSignal("ALL");
  const [districts] = createResource(fetchDistricts);

  const filtered = () => (districts() ?? []).filter(d =>
    filter() === "ALL" || d.type === filter()
  );

  const types = ["ALL", "RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "EDUCATION", "SPORTS", "GOVERNMENT", "MIXED", "PARK", "HARBOR", "AIRPORT"];

  return (
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-white">🏘️ Quận / Huyện</h1>
          <p class="text-slate-400 mt-1">Các khu vực phân chia trong thành phố</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          {types.map(t => (
            <button
              onClick={() => setFilter(t)}
              class={`text-xs px-3 py-1.5 rounded-full transition-colors ${filter() === t ? "bg-violet-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
            >{t}</button>
          ))}
        </div>
      </div>

      <Show when={districts()} fallback={<div class="text-slate-400">Đang tải...</div>}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <For each={filtered()}>{(district) => (
            <div class="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-violet-500 transition-colors">
              <div class="flex items-start justify-between mb-3">
                <h3 class="text-white font-semibold text-sm">{district.name}</h3>
                <span class={`text-xs px-2 py-0.5 rounded-full ${DTYPE_COLORS[district.type] ?? "bg-slate-700 text-slate-300"}`}>
                  {district.type}
                </span>
              </div>
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bg-slate-700 rounded-lg p-2">
                  <div class="text-white text-xs font-bold">{district.population.toLocaleString()}</div>
                  <div class="text-slate-500 text-xs">Dân số</div>
                </div>
                <div class="bg-slate-700 rounded-lg p-2">
                  <div class="text-white text-xs font-bold">{district.maxParcels}</div>
                  <div class="text-slate-500 text-xs">Max ô đất</div>
                </div>
                <div class="bg-slate-700 rounded-lg p-2">
                  <div class="text-white text-xs font-bold">{district.landValueBase.toFixed(0)}</div>
                  <div class="text-slate-500 text-xs">Giá cơ sở</div>
                </div>
              </div>
            </div>
          )}</For>
        </div>
        {filtered().length === 0 && (
          <div class="text-center py-12 text-slate-400">Không có quận/huyện nào</div>
        )}
      </Show>
    </div>
  );
}
