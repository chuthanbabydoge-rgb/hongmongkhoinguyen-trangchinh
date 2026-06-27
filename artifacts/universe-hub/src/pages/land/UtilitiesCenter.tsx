import { createSignal, createResource, For, Show } from "solid-js";

interface Utility {
  id: string; name: string; type: string; capacity: number;
  usage: number; costPerUnit: number; isActive: boolean; districtId?: string;
}

async function fetchUtilities(): Promise<Utility[]> {
  const res = await fetch("/api/land/utilities");
  const json = await res.json();
  return json.data ?? [];
}

const UTILITY_ICONS: Record<string, string> = {
  ELECTRICITY: "⚡", WATER: "💧", INTERNET: "🌐",
  GAS: "🔥", SEWER: "🚰", HEATING: "♨️", SOLAR: "☀️",
};

const UTILITY_COLORS: Record<string, string> = {
  ELECTRICITY: "from-amber-600 to-amber-800",
  WATER: "from-blue-600 to-blue-800",
  INTERNET: "from-violet-600 to-violet-800",
  GAS: "from-orange-600 to-orange-800",
  SEWER: "from-slate-600 to-slate-800",
  HEATING: "from-rose-600 to-rose-800",
  SOLAR: "from-yellow-600 to-yellow-800",
};

export default function UtilitiesCenter() {
  const [utilities] = createResource(fetchUtilities);

  const grouped = () => {
    const g: Record<string, Utility[]> = {};
    for (const u of (utilities() ?? [])) {
      if (!g[u.type]) g[u.type] = [];
      g[u.type].push(u);
    }
    return g;
  };

  return (
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-white">⚡ Hạ tầng Tiện ích</h1>
        <p class="text-slate-400 mt-1">Điện, nước, internet và các dịch vụ thiết yếu</p>
      </div>

      <Show when={utilities()} fallback={<div class="text-slate-400">Đang tải...</div>}>
        <div class="space-y-6">
          {Object.entries(grouped()).map(([type, items]) => (
            <div>
              <h3 class="text-white font-semibold mb-3 flex items-center gap-2">
                <span>{UTILITY_ICONS[type] ?? "🔧"}</span>
                <span>{type}</span>
                <span class="text-slate-400 text-sm font-normal">({items.length} hệ thống)</span>
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(u => {
                  const usagePct = (u.usage / u.capacity) * 100;
                  return (
                    <div class="bg-slate-800 rounded-xl p-4 border border-slate-700">
                      <div class="flex items-center justify-between mb-3">
                        <div class={`text-2xl w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br ${UTILITY_COLORS[u.type] ?? "from-slate-600 to-slate-800"}`}>
                          {UTILITY_ICONS[u.type] ?? "🔧"}
                        </div>
                        <div class="text-right">
                          <div class="text-white font-semibold text-sm">{u.name}</div>
                          <div class={`text-xs ${u.isActive ? "text-emerald-400" : "text-red-400"}`}>
                            {u.isActive ? "Hoạt động" : "Ngừng"}
                          </div>
                        </div>
                      </div>
                      <div class="mb-2">
                        <div class="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Tải: {u.usage.toFixed(0)} / {u.capacity.toFixed(0)}</span>
                          <span>{usagePct.toFixed(1)}%</span>
                        </div>
                        <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            class={`h-full rounded-full transition-all ${usagePct > 80 ? "bg-rose-500" : usagePct > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${Math.min(usagePct, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div class="text-xs text-slate-400">
                        Chi phí: <span class="text-emerald-400">{u.costPerUnit}/đơn vị</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {(utilities()?.length ?? 0) === 0 && (
          <div class="text-center py-12 text-slate-400">Chưa có hệ thống tiện ích</div>
        )}
      </Show>
    </div>
  );
}
