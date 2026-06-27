import { createSignal, createResource, For, Show } from "solid-js";

interface Building {
  id: string; name: string; parcelId: string; ownerId: string;
  type: string; status: string; level: number; health: number;
  maxHealth: number; value: number; incomeRate: number;
}

interface Template {
  id: string; name: string; type: string; buildCost: number;
  buildTime: number; maxLevel: number; icon: string;
}

async function fetchBuildings(): Promise<Building[]> {
  const res = await fetch("/api/land/buildings?limit=50");
  const json = await res.json();
  return json.data ?? [];
}

async function fetchTemplates(): Promise<Template[]> {
  const res = await fetch("/api/land/templates");
  const json = await res.json();
  return json.data ?? [];
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-900 text-emerald-300",
  UNDER_CONSTRUCTION: "bg-amber-900 text-amber-300",
  DAMAGED: "bg-orange-900 text-orange-300",
  ABANDONED: "bg-slate-700 text-slate-300",
  DESTROYED: "bg-red-900 text-red-300",
};

export default function BuildingCenter() {
  const [tab, setTab] = createSignal<"buildings" | "templates">("buildings");
  const [buildings] = createResource(fetchBuildings);
  const [templates] = createResource(fetchTemplates);

  return (
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-white">🏗️ Trung tâm Công trình</h1>
        <p class="text-slate-400 mt-1">Quản lý công trình và mẫu thiết kế</p>
      </div>

      <div class="flex gap-2">
        {[["buildings", "Công trình"], ["templates", "Mẫu thiết kế"]] .map(([k, label]) => (
          <button
            onClick={() => setTab(k as "buildings" | "templates")}
            class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab() === k ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
          >{label as string}</button>
        ))}
      </div>

      <Show when={tab() === "buildings"}>
        <Show when={buildings()} fallback={<div class="text-slate-400">Đang tải...</div>}>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <For each={buildings()}>{(b) => (
              <div class="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h3 class="text-white font-semibold">{b.name}</h3>
                    <p class="text-slate-400 text-xs mt-0.5">{b.type}</p>
                  </div>
                  <span class={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[b.status] ?? "bg-slate-700 text-slate-300"}`}>
                    {b.status}
                  </span>
                </div>
                <div class="mb-3">
                  <div class="flex justify-between text-xs text-slate-400 mb-1">
                    <span>HP: {b.health}/{b.maxHealth}</span>
                    <span>Lv.{b.level}</span>
                  </div>
                  <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${(b.health / b.maxHealth) * 100}%` }} />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div class="bg-slate-700 rounded-lg p-2 text-center">
                    <div class="text-emerald-400 text-xs font-bold">{b.value.toLocaleString()}</div>
                    <div class="text-slate-500 text-xs">Giá trị</div>
                  </div>
                  <div class="bg-slate-700 rounded-lg p-2 text-center">
                    <div class="text-blue-400 text-xs font-bold">{b.incomeRate}/h</div>
                    <div class="text-slate-500 text-xs">Thu nhập</div>
                  </div>
                </div>
                <div class="flex gap-2 mt-3">
                  <button class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg py-1.5 transition-colors">Nâng cấp</button>
                  <button class="flex-1 bg-red-900 hover:bg-red-800 text-red-300 text-xs rounded-lg py-1.5 transition-colors">Phá dỡ</button>
                </div>
              </div>
            )}</For>
          </div>
          {(buildings()?.length ?? 0) === 0 && (
            <div class="text-center py-12 text-slate-400">Không có công trình nào</div>
          )}
        </Show>
      </Show>

      <Show when={tab() === "templates"}>
        <Show when={templates()} fallback={<div class="text-slate-400">Đang tải...</div>}>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <For each={templates()}>{(t) => (
              <div class="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-amber-500 transition-colors text-center">
                <div class="text-4xl mb-2">{t.icon}</div>
                <h3 class="text-white font-semibold">{t.name}</h3>
                <p class="text-slate-400 text-xs mb-3">{t.type}</p>
                <div class="space-y-1 text-xs text-slate-400">
                  <div>Phí xây: <span class="text-emerald-400">{t.buildCost.toLocaleString()}</span></div>
                  <div>Thời gian: <span class="text-blue-400">{Math.floor(t.buildTime / 60)} phút</span></div>
                  <div>Max Lv: <span class="text-amber-400">{t.maxLevel}</span></div>
                </div>
                <button class="mt-3 w-full bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-lg py-1.5 transition-colors">
                  Chọn mẫu này
                </button>
              </div>
            )}</For>
          </div>
        </Show>
      </Show>
    </div>
  );
}
