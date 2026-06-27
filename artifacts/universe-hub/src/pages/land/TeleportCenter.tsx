import { createSignal, createResource, For, Show } from "solid-js";

interface Teleport {
  id: string; name: string; type: string; destinationX: number;
  destinationY: number; cooldown: number; usageCount: number;
  cost: number; isActive: boolean; parcelId?: string;
}

async function fetchTeleports(): Promise<Teleport[]> {
  const res = await fetch("/api/land/teleports");
  const json = await res.json();
  return json.data ?? [];
}

const TYPE_COLORS: Record<string, string> = {
  PUBLIC: "bg-emerald-900 text-emerald-300",
  PRIVATE: "bg-blue-900 text-blue-300",
  GUILD: "bg-violet-900 text-violet-300",
  WORLD: "bg-amber-900 text-amber-300",
  PREMIUM: "bg-rose-900 text-rose-300",
  EMERGENCY: "bg-red-900 text-red-300",
};

const TYPE_ICONS: Record<string, string> = {
  PUBLIC: "🌀", PRIVATE: "🔮", GUILD: "⚔️",
  WORLD: "🌍", PREMIUM: "💎", EMERGENCY: "🚨",
};

export default function TeleportCenter() {
  const [teleports, { refetch }] = createResource(fetchTeleports);
  const [using, setUsing] = createSignal<string | null>(null);

  async function useTeleport(id: string) {
    setUsing(id);
    await fetch(`/api/land/teleports/${id}/use`, { method: "POST" });
    await refetch();
    setUsing(null);
  }

  return (
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-white">🌀 Cổng Dịch chuyển</h1>
        <p class="text-slate-400 mt-1">Mạng lưới teleport trong Universe Land</p>
      </div>

      <Show when={teleports()} fallback={<div class="text-slate-400">Đang tải...</div>}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <For each={teleports()}>{(tp) => (
            <div class="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-violet-500 transition-colors">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">{TYPE_ICONS[tp.type] ?? "🌀"}</span>
                  <div>
                    <h3 class="text-white font-semibold">{tp.name}</h3>
                    <span class={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[tp.type] ?? "bg-slate-700 text-slate-300"}`}>
                      {tp.type}
                    </span>
                  </div>
                </div>
                <span class={`text-xs ${tp.isActive ? "text-emerald-400" : "text-red-400"}`}>
                  {tp.isActive ? "✅" : "❌"}
                </span>
              </div>

              <div class="grid grid-cols-3 gap-2 text-center mb-4">
                <div class="bg-slate-700 rounded-lg p-2">
                  <div class="text-white text-xs font-bold">{tp.usageCount.toLocaleString()}</div>
                  <div class="text-slate-500 text-xs">Lượt dùng</div>
                </div>
                <div class="bg-slate-700 rounded-lg p-2">
                  <div class="text-white text-xs font-bold">{Math.floor(tp.cooldown / 60)} phút</div>
                  <div class="text-slate-500 text-xs">Cooldown</div>
                </div>
                <div class="bg-slate-700 rounded-lg p-2">
                  <div class="text-emerald-400 text-xs font-bold">{tp.cost > 0 ? tp.cost : "Miễn phí"}</div>
                  <div class="text-slate-500 text-xs">Chi phí</div>
                </div>
              </div>

              <div class="text-xs text-slate-400 mb-3">
                Đích: ({tp.destinationX.toFixed(1)}, {tp.destinationY.toFixed(1)})
              </div>

              <button
                onClick={() => useTeleport(tp.id)}
                disabled={!tp.isActive || using() === tp.id}
                class={`w-full text-xs rounded-lg py-2 font-medium transition-colors ${tp.isActive ? "bg-violet-600 hover:bg-violet-700 text-white" : "bg-slate-700 text-slate-500 cursor-not-allowed"}`}
              >
                {using() === tp.id ? "Đang dịch chuyển..." : "🌀 Dịch chuyển"}
              </button>
            </div>
          )}</For>
        </div>
        {(teleports()?.length ?? 0) === 0 && (
          <div class="text-center py-12 text-slate-400">Không có cổng dịch chuyển</div>
        )}
      </Show>
    </div>
  );
}
