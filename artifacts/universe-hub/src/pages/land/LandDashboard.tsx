import { createSignal, createResource, For, Show } from "solid-js";

interface DashboardData {
  regions: { id: string; name: string; biome: string; population: number }[];
  cities: { id: string; name: string; type: string; population: number }[];
  parcels: { id: string; name: string; status: string; currentValue: number }[];
  buildings: { id: string; name: string; type: string; level: number }[];
  listings: { id: string; price: number; listingType: string }[];
  totals: { regions: number; cities: number; parcels: number; buildings: number; listings: number };
}

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch("/api/land/dashboard");
  const json = await res.json();
  return json.data;
}

export default function LandDashboard() {
  const [data] = createResource(fetchDashboard);

  return (
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-white">🏞️ Universe Land — Dashboard</h1>
        <p class="text-slate-400 mt-1">Hạ tầng đất đai và bất động sản Universe</p>
      </div>

      <Show when={data()} fallback={<div class="text-slate-400">Đang tải...</div>}>
        {(d) => (
          <>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Vùng", value: d().totals?.regions ?? 0, color: "from-violet-600 to-violet-800", icon: "🗺️" },
                { label: "Thành phố", value: d().totals?.cities ?? 0, color: "from-blue-600 to-blue-800", icon: "🏙️" },
                { label: "Ô đất", value: d().totals?.parcels ?? 0, color: "from-emerald-600 to-emerald-800", icon: "📦" },
                { label: "Công trình", value: d().totals?.buildings ?? 0, color: "from-amber-600 to-amber-800", icon: "🏗️" },
                { label: "Đang bán", value: d().totals?.listings ?? 0, color: "from-rose-600 to-rose-800", icon: "🏷️" },
              ].map((s) => (
                <div class={`bg-gradient-to-br ${s.color} rounded-xl p-4 text-white`}>
                  <div class="text-3xl mb-2">{s.icon}</div>
                  <div class="text-2xl font-bold">{s.value.toLocaleString()}</div>
                  <div class="text-sm opacity-80">{s.label}</div>
                </div>
              ))}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="bg-slate-800 rounded-xl p-4">
                <h3 class="text-white font-semibold mb-3">🗺️ Vùng nổi bật</h3>
                <div class="space-y-2">
                  <For each={d().regions ?? []}>{(r) => (
                    <div class="flex items-center justify-between bg-slate-700 rounded-lg px-3 py-2">
                      <span class="text-white text-sm">{r.name}</span>
                      <span class="text-slate-400 text-xs">{r.biome}</span>
                    </div>
                  )}</For>
                </div>
              </div>

              <div class="bg-slate-800 rounded-xl p-4">
                <h3 class="text-white font-semibold mb-3">🏙️ Thành phố</h3>
                <div class="space-y-2">
                  <For each={d().cities ?? []}>{(c) => (
                    <div class="flex items-center justify-between bg-slate-700 rounded-lg px-3 py-2">
                      <span class="text-white text-sm">{c.name}</span>
                      <span class="text-slate-400 text-xs">{c.type}</span>
                    </div>
                  )}</For>
                </div>
              </div>

              <div class="bg-slate-800 rounded-xl p-4">
                <h3 class="text-white font-semibold mb-3">📦 Ô đất</h3>
                <div class="space-y-2">
                  <For each={d().parcels ?? []}>{(p) => (
                    <div class="flex items-center justify-between bg-slate-700 rounded-lg px-3 py-2">
                      <span class="text-white text-sm">{p.name}</span>
                      <span class={`text-xs px-2 py-0.5 rounded-full ${p.status === "AVAILABLE" ? "bg-emerald-900 text-emerald-300" : "bg-blue-900 text-blue-300"}`}>
                        {p.status}
                      </span>
                    </div>
                  )}</For>
                </div>
              </div>
            </div>
          </>
        )}
      </Show>
    </div>
  );
}
