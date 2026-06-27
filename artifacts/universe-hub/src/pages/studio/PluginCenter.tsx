import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Puzzle, Plus, Trash2, Power, PowerOff, Code } from "lucide-react";
import { useState } from "react";

export default function PluginCenter() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState(""); const [desc, setDesc] = useState(""); const [code, setCode] = useState("// Plugin code here");

  const { data, isLoading } = useQuery({
    queryKey: ["studio-plugins"],
    queryFn: async () => {
      const r = await fetch("/api/studio/plugins", { headers: { Authorization: `Bearer ${accessToken}` } });
      return r.json();
    },
    enabled: !!accessToken,
  });

  const add = useMutation({
    mutationFn: async () => {
      await fetch("/api/studio/plugins", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ name, description: desc, code }) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["studio-plugins"] }); setName(""); setDesc(""); },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const endpoint = status === "ACTIVE" ? "disable" : "enable";
      await fetch(`/api/studio/plugins/${id}/${endpoint}`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-plugins"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/studio/plugins/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-plugins"] }),
  });

  const plugins = (data?.data ?? []) as { id: string; name: string; description?: string; version: string; status: string; code?: string }[];

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-3"><Puzzle className="w-6 h-6 text-primary" /><h1 className="text-2xl font-bold text-white">Plugin Center</h1></div>

      <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3">
        <p className="text-sm font-medium text-white">Thêm Plugin</p>
        <div className="flex gap-2 flex-wrap">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Tên plugin..." className="flex-1 min-w-[140px] bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none" />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Mô tả..." className="flex-1 min-w-[140px] bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none" />
          <button onClick={() => add.mutate()} disabled={!name} className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded text-primary text-sm flex items-center gap-2 disabled:opacity-50">
            <Plus className="w-4 h-4" /> Thêm
          </button>
        </div>
        <textarea value={code} onChange={e => setCode(e.target.value)} rows={3}
          className="w-full bg-[#0d0d16] border border-white/10 rounded px-3 py-2 text-sm text-green-300 font-mono focus:outline-none resize-none" />
      </div>

      {isLoading ? <div className="space-y-3">{Array.from({length:4}).map((_,i)=><div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse"/>)}</div> :
        plugins.length === 0 ? <div className="text-center py-16 text-muted-foreground"><Puzzle className="w-12 h-12 mx-auto mb-3 opacity-30"/><p>Chưa có plugin nào</p></div> :
        <div className="space-y-3">
          {plugins.map(p => (
            <div key={p.id} className="rounded-xl border border-white/10 bg-white/3 p-4 flex items-center gap-4">
              <Code className="w-5 h-5 text-primary/60 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white">{p.name}</p>
                {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${p.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-muted-foreground"}`}>{p.status}</span>
              </div>
              <button onClick={() => toggle.mutate({ id: p.id, status: p.status })}
                className={`p-1.5 rounded ${p.status === "ACTIVE" ? "text-yellow-400 hover:bg-yellow-400/10" : "text-green-400 hover:bg-green-400/10"}`}>
                {p.status === "ACTIVE" ? <PowerOff className="w-4 h-4"/> : <Power className="w-4 h-4"/>}
              </button>
              <button onClick={() => del.mutate(p.id)} className="text-rose-400 hover:bg-rose-400/10 p-1.5 rounded"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
        </div>
      }
    </div>
  );
}
