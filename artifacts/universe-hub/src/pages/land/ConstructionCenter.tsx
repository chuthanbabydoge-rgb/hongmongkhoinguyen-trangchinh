import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Hammer, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";

interface Project {
  id: string; name: string; parcelId: string; ownerId: string;
  type: string; status: string; progress: number; totalSteps: number;
  cost: number; workers: number; startAt?: string; endAt?: string;
}

const STATUS_COLORS: Record<string, string> = {
  QUEUED: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-blue-900/60 text-blue-300",
  PAUSED: "bg-amber-900/60 text-amber-300",
  COMPLETED: "bg-emerald-900/60 text-emerald-300",
  CANCELLED: "bg-red-900/60 text-red-300",
  FAILED: "bg-rose-900/60 text-rose-300",
};

const FILTERS = ["ALL", "QUEUED", "IN_PROGRESS", "PAUSED", "COMPLETED", "CANCELLED"];

export default function ConstructionCenter() {
  const [filter, setFilter] = useState("ALL");
  const { accessToken } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ success: boolean; data: Project[] }>({
    queryKey: ["land", "construction"],
    queryFn: async () => (await fetch("/api/land/construction?limit=50")).json() as Promise<{ success: boolean; data: Project[] }>,
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/land/construction/${id}/complete`, {
        method: "POST",
        headers: { Authorization: accessToken ?? "" },
      });
      return res.json();
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["land", "construction"] }); },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/land/construction/${id}/cancel`, {
        method: "POST",
        headers: { Authorization: accessToken ?? "" },
      });
      return res.json();
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["land", "construction"] }); },
  });

  const projects = data?.data ?? [];
  const filtered = projects.filter(p => filter === "ALL" || p.status === filter);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Hammer className="w-6 h-6 text-blue-400" />Trung tâm Xây dựng</h1>
              <p className="text-muted-foreground mt-1">Quản lý dự án xây dựng và hàng đợi</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${filter === s ? "bg-blue-600 text-white" : "bg-muted/40 text-muted-foreground hover:bg-muted/60"}`}
                >{s}</button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
          ) : (
            <>
              <div className="space-y-3">
                {filtered.map((project) => (
                  <div key={project.id} className="bg-card border border-white/10 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-semibold">{project.name}</h3>
                        <p className="text-muted-foreground text-xs mt-0.5">{project.type} — {project.workers} công nhân</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[project.status] ?? "bg-muted text-muted-foreground"}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Tiến độ</span>
                        <span>{project.progress}/{project.totalSteps} ({project.totalSteps > 0 ? Math.floor((project.progress / project.totalSteps) * 100) : 0}%)</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${project.totalSteps > 0 ? (project.progress / project.totalSteps) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Chi phí: <span className="text-emerald-400">{project.cost.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2">
                        {project.status === "IN_PROGRESS" && (
                          <button
                            onClick={() => completeMutation.mutate(project.id)}
                            disabled={completeMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg px-3 py-1 transition-colors disabled:opacity-50"
                          >
                            Hoàn thành
                          </button>
                        )}
                        {(project.status === "QUEUED" || project.status === "IN_PROGRESS") && (
                          <button
                            onClick={() => cancelMutation.mutate(project.id)}
                            disabled={cancelMutation.isPending}
                            className="bg-red-900/40 hover:bg-red-900/60 text-red-300 text-xs rounded-lg px-3 py-1 transition-colors disabled:opacity-50"
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">Không có dự án nào</div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
