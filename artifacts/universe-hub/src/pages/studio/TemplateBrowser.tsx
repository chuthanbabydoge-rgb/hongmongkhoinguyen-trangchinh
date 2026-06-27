import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { BookTemplate, Plus, Trash2, MousePointerClick } from "lucide-react";
import { useState } from "react";

const DOC_TYPES = ["WORLD","NPC","QUEST","BOSS","DUNGEON","ITEM","SKILL","PET","MOUNT","BUILDING","CITY","DIALOG"];

export default function TemplateBrowser() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState(""); const [docType, setDocType] = useState("WORLD"); const [desc, setDesc] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["studio-templates"],
    queryFn: async () => {
      const r = await fetch("/api/studio/templates", { headers: { Authorization: `Bearer ${accessToken}` } });
      return r.json();
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      await fetch("/api/studio/templates", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ name, docType, description: desc, data: {} }) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["studio-templates"] }); setName(""); setDesc(""); },
  });

  const use_ = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/studio/templates/${id}/use`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-templates"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/studio/templates/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-templates"] }),
  });

  const templates = (data?.data ?? []) as { id: string; name: string; docType: string; description?: string; useCount: number; isPublic: boolean }[];

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-3"><BookTemplate className="w-6 h-6 text-primary" /><h1 className="text-2xl font-bold text-white">Template Browser</h1></div>

      <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3">
        <p className="text-sm font-medium text-white">Tạo Template mới</p>
        <div className="flex gap-2 flex-wrap">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Tên template..." className="flex-1 min-w-[140px] bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none" />
          <select value={docType} onChange={e => setDocType(e.target.value)} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none">
            {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Mô tả..." className="flex-1 min-w-[140px] bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none" />
          <button onClick={() => add.mutate()} disabled={!name} className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded text-primary text-sm flex items-center gap-2 disabled:opacity-50">
            <Plus className="w-4 h-4" /> Tạo
          </button>
        </div>
      </div>

      {isLoading ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=><div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse"/>)}</div> :
        templates.length === 0 ? <div className="text-center py-16 text-muted-foreground"><BookTemplate className="w-12 h-12 mx-auto mb-3 opacity-30"/><p>Chưa có template nào</p></div> :
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t.id} className="rounded-xl border border-white/10 bg-white/3 p-4 group">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono">{t.docType}</span>
                </div>
                <button onClick={() => del.mutate(t.id)} className="opacity-0 group-hover:opacity-100 text-rose-400 p-1"><Trash2 className="w-4 h-4"/></button>
              </div>
              {t.description && <p className="text-xs text-muted-foreground mb-3">{t.description}</p>}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/50">{t.useCount} lần dùng</span>
                <button onClick={() => use_.mutate(t.id)} className="text-xs bg-blue-500/20 border border-blue-500/30 text-blue-400 px-2.5 py-1 rounded flex items-center gap-1">
                  <MousePointerClick className="w-3 h-3"/> Dùng
                </button>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}
