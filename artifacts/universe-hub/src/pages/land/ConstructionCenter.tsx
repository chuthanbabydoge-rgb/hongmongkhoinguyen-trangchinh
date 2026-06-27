import { createSignal, createResource, For, Show } from "solid-js";

interface Project {
  id: string; name: string; parcelId: string; ownerId: string;
  type: string; status: string; progress: number; totalSteps: number;
  cost: number; workers: number; startAt?: string; endAt?: string;
}

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/land/construction?limit=50");
  const json = await res.json();
  return json.data ?? [];
}

const STATUS_COLORS: Record<string, string> = {
  QUEUED: "bg-slate-700 text-slate-300",
  IN_PROGRESS: "bg-blue-900 text-blue-300",
  PAUSED: "bg-amber-900 text-amber-300",
  COMPLETED: "bg-emerald-900 text-emerald-300",
  CANCELLED: "bg-red-900 text-red-300",
  FAILED: "bg-rose-900 text-rose-300",
};

export default function ConstructionCenter() {
  const [filter, setFilter] = createSignal("ALL");
  const [projects, { refetch }] = createResource(fetchProjects);

  const filtered = () => (projects() ?? []).filter(p =>
    filter() === "ALL" || p.status === filter()
  );

  async function completeProject(id: string) {
    await fetch(`/api/land/construction/${id}/complete`, { method: "POST" });
    refetch();
  }

  async function cancelProject(id: string) {
    await fetch(`/api/land/construction/${id}/cancel`, { method: "POST" });
    refetch();
  }

  return (
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">🔨 Trung tâm Xây dựng</h1>
          <p class="text-slate-400 mt-1">Quản lý dự án xây dựng và hàng đợi</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          {["ALL", "QUEUED", "IN_PROGRESS", "PAUSED", "COMPLETED", "CANCELLED"].map(s => (
            <button
              onClick={() => setFilter(s)}
              class={`text-xs px-3 py-1.5 rounded-full transition-colors ${filter() === s ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
            >{s}</button>
          ))}
        </div>
      </div>

      <Show when={projects()} fallback={<div class="text-slate-400">Đang tải...</div>}>
        <div class="space-y-3">
          <For each={filtered()}>{(project) => (
            <div class="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="text-white font-semibold">{project.name}</h3>
                  <p class="text-slate-400 text-xs mt-0.5">{project.type} — {project.workers} công nhân</p>
                </div>
                <span class={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[project.status] ?? "bg-slate-700 text-slate-300"}`}>
                  {project.status}
                </span>
              </div>
              <div class="mb-3">
                <div class="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Tiến độ</span>
                  <span>{project.progress}/{project.totalSteps} ({Math.floor((project.progress / project.totalSteps) * 100)}%)</span>
                </div>
                <div class="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(project.progress / project.totalSteps) * 100}%` }}
                  />
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="text-xs text-slate-400">
                  Chi phí: <span class="text-emerald-400">{project.cost.toLocaleString()}</span>
                </div>
                <div class="flex gap-2">
                  {project.status === "IN_PROGRESS" && (
                    <button onClick={() => completeProject(project.id)} class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg px-3 py-1 transition-colors">
                      Hoàn thành
                    </button>
                  )}
                  {(project.status === "QUEUED" || project.status === "IN_PROGRESS") && (
                    <button onClick={() => cancelProject(project.id)} class="bg-red-900 hover:bg-red-800 text-red-300 text-xs rounded-lg px-3 py-1 transition-colors">
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}</For>
        </div>
        {filtered().length === 0 && (
          <div class="text-center py-12 text-slate-400">Không có dự án nào</div>
        )}
      </Show>
    </div>
  );
}
