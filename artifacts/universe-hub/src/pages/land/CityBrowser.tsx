import { createSignal, createResource, For, Show } from "solid-js";

interface City {
  id: string; name: string; slug: string; regionId: string;
  type: string; population: number; taxRate: number;
  mayorId?: string; maxDistricts: number; isActive: boolean;
}

async function fetchCities(): Promise<City[]> {
  const res = await fetch("/api/land/cities?limit=50");
  const json = await res.json();
  return json.data ?? [];
}

const TYPE_COLORS: Record<string, string> = {
  CAPITAL: "bg-amber-900 text-amber-300",
  METROPOLIS: "bg-violet-900 text-violet-300",
  CITY: "bg-blue-900 text-blue-300",
  TOWN: "bg-emerald-900 text-emerald-300",
  VILLAGE: "bg-green-900 text-green-300",
  OUTPOST: "bg-orange-900 text-orange-300",
  SPECIAL: "bg-pink-900 text-pink-300",
};

const TYPE_ICONS: Record<string, string> = {
  CAPITAL: "👑", METROPOLIS: "🏙️", CITY: "🌆", TOWN: "🏘️",
  VILLAGE: "🏡", OUTPOST: "⛺", SPECIAL: "✨",
};

export default function CityBrowser() {
  const [search, setSearch] = createSignal("");
  const [filter, setFilter] = createSignal("ALL");
  const [cities] = createResource(fetchCities);

  const filtered = () => (cities() ?? []).filter(c =>
    (filter() === "ALL" || c.type === filter()) &&
    c.name.toLowerCase().includes(search().toLowerCase())
  );

  return (
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-white">🏙️ Thành phố</h1>
          <p class="text-slate-400 mt-1">Các đô thị trong Universe</p>
        </div>
        <div class="flex gap-2">
          <input
            type="text"
            placeholder="Tìm thành phố..."
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
            class="bg-slate-700 text-white rounded-lg px-4 py-2 text-sm outline-none border border-slate-600 focus:border-blue-500"
          />
          <select
            value={filter()}
            onChange={(e) => setFilter(e.currentTarget.value)}
            class="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600"
          >
            {["ALL", "CAPITAL", "METROPOLIS", "CITY", "TOWN", "VILLAGE", "OUTPOST", "SPECIAL"].map(t => (
              <option value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <Show when={cities()} fallback={<div class="text-slate-400">Đang tải...</div>}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <For each={filtered()}>{(city) => (
            <div class="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-blue-500 transition-colors">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xl">{TYPE_ICONS[city.type] ?? "🏙️"}</span>
                    <h3 class="text-white font-semibold">{city.name}</h3>
                  </div>
                  <p class="text-slate-400 text-xs mt-0.5">{city.slug}</p>
                </div>
                <span class={`text-xs px-2 py-1 rounded-full ${TYPE_COLORS[city.type] ?? "bg-slate-700 text-slate-300"}`}>
                  {city.type}
                </span>
              </div>
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bg-slate-700 rounded-lg p-2">
                  <div class="text-white text-sm font-bold">{city.population.toLocaleString()}</div>
                  <div class="text-slate-400 text-xs">Dân số</div>
                </div>
                <div class="bg-slate-700 rounded-lg p-2">
                  <div class="text-white text-sm font-bold">{(city.taxRate * 100).toFixed(1)}%</div>
                  <div class="text-slate-400 text-xs">Thuế</div>
                </div>
                <div class="bg-slate-700 rounded-lg p-2">
                  <div class="text-white text-sm font-bold">{city.maxDistricts}</div>
                  <div class="text-slate-400 text-xs">Quận</div>
                </div>
              </div>
              {city.mayorId && (
                <div class="mt-3 text-xs text-slate-500">Thị trưởng: {city.mayorId}</div>
              )}
            </div>
          )}</For>
        </div>
        {filtered().length === 0 && (
          <div class="text-center py-12 text-slate-400">Không tìm thấy thành phố nào</div>
        )}
      </Show>
    </div>
  );
}
