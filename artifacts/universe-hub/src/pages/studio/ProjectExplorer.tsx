import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { FolderOpen, Plus, Trash2, Edit2, Clock } from "lucide-react";
import { useState } from "react";

export default function ProjectExplorer() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["studio-editors"],
    queryFn: async () => {
      const r = await fetch("/api/studio/editors", { headers: { Authorization: `Bearer ${accessToken}` } });
      return r.json();
    },
    enabled: !!accessToken,
  });

  const create = useMutation({
    mutationFn: async () => {
      await fetch("/api/studio/editors", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ name, description: desc }),
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["studio-editors"] }); setName(""); setDesc(""); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/studio/editors/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-editors"] }),
  });

  const editors = (data?.data ?? []) as { id: string; name: string; description?: string; updatedAt: string }[];

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FolderOpen className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-white">Project Explorer</h1>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/3 p-5 space-y-3">
        <p className="text-sm font-medium text-white">Tạo Editor mới</p>
        <div className="flex gap-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Tên editor..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Mô tả..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
          <button onClick={() => create.mutate()} disabled={!name}
            className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg text-primary text-sm flex items-center gap-2 disabled:opacity-50">
            <Plus className="w-4 h-4" /> Tạo
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}</div>
      ) : editors.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có editor nào. Tạo editor đầu tiên!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {editors.map((e) => (
            <div key={e.id} className="rounded-xl border border-white/10 bg-white/3 p-4 flex items-start justify-between hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-3">
                <Edit2 className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-white">{e.name}</p>
                  {e.description && <p className="text-xs text-muted-foreground mt-0.5">{e.description}</p>}
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(e.updatedAt).toLocaleDateString("vi")}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => del.mutate(e.id)} className="text-rose-400/60 hover:text-rose-400 p-1 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
