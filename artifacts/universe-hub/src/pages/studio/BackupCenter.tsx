import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { HardDrive, Plus, Trash2, RotateCcw } from "lucide-react";
import { useState } from "react";

export default function BackupCenter() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState(""); const [desc, setDesc] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["studio-backups"],
    queryFn: async () => {
      const r = await fetch("/api/studio/backups", { headers: { Authorization: `Bearer ${accessToken}` } });
      return r.json();
    },
    enabled: !!accessToken,
  });

  const add = useMutation({
    mutationFn: async () => {
      await fetch("/api/studio/backups", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ name, description: desc }) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["studio-backups"] }); setName(""); setDesc(""); },
  });

  const restore = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/studio/backups/${id}/restore`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } });
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/studio/backups/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-backups"] }),
  });

  const backups = (data?.data ?? []) as { id: string; name: string; description?: string; size: number; createdAt: string }[];

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-3"><HardDrive className="w-6 h-6 text-primary" /><h1 className="text-2xl font-bold text-white">Backup Center</h1></div>

      <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3">
        <p className="text-sm font-medium text-white">Tạo Backup mới</p>
        <div className="flex gap-2 flex-wrap">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Tên backup..." className="flex-1 min-w-[140px] bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none" />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ghi chú..." className="flex-1 min-w-[140px] bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none" />
          <button onClick={() => add.mutate()} disabled={!name} className="px-4 py-2 bg-primary/20 border border-primary/30 rounded text-primary text-sm flex items-center gap-2 disabled:opacity-50">
            <Plus className="w-4 h-4" /> Backup
          </button>
        </div>
      </div>

      {isLoading ? <div className="space-y-3">{Array.from({length:4}).map((_,i)=><div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse"/>)}</div> :
        backups.length === 0 ? <div className="text-center py-16 text-muted-foreground"><HardDrive className="w-12 h-12 mx-auto mb-3 opacity-30"/><p>Chưa có backup nào</p></div> :
        <div className="space-y-3">
          {backups.map(b => (
            <div key={b.id} className="rounded-xl border border-white/10 bg-white/3 p-4 flex items-center gap-4">
              <HardDrive className="w-5 h-5 text-primary/60 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white">{b.name}</p>
                {b.description && <p className="text-xs text-muted-foreground">{b.description}</p>}
                <p className="text-[10px] text-muted-foreground/40">{new Date(b.createdAt).toLocaleString("vi")} · {(b.size/1024).toFixed(1)} KB</p>
              </div>
              <button onClick={() => restore.mutate(b.id)} className="text-cyan-400 hover:bg-cyan-400/10 p-1.5 rounded"><RotateCcw className="w-4 h-4"/></button>
              <button onClick={() => del.mutate(b.id)} className="text-rose-400/60 hover:text-rose-400 p-1.5 rounded"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
        </div>
      }
    </div>
  );
}
