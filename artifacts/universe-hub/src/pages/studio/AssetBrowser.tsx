import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Image, Music, Video, File, Plus, Trash2, Package } from "lucide-react";
import { useState } from "react";

const TYPE_ICONS: Record<string, typeof Image> = { IMAGE: Image, AUDIO: Music, VIDEO: Video, OTHER: File };

export default function AssetBrowser() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState(""); const [type, setType] = useState("IMAGE"); const [url, setUrl] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["studio-assets"],
    queryFn: async () => {
      const r = await fetch("/api/studio/assets", { headers: { Authorization: `Bearer ${accessToken}` } });
      return r.json();
    },
    enabled: !!accessToken,
  });

  const add = useMutation({
    mutationFn: async () => {
      await fetch("/api/studio/assets", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ name, type, url }) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["studio-assets"] }); setName(""); setUrl(""); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/studio/assets/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-assets"] }),
  });

  const assets = (data?.data ?? []) as { id: string; name: string; type: string; url: string; size: number }[];

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-3"><Package className="w-6 h-6 text-primary" /><h1 className="text-2xl font-bold text-white">Asset Browser</h1></div>

      <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3">
        <p className="text-sm font-medium text-white">Thêm Asset</p>
        <div className="flex gap-2 flex-wrap">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Tên asset..." className="flex-1 min-w-[140px] bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none" />
          <select value={type} onChange={e => setType(e.target.value)} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none">
            {["IMAGE","AUDIO","VIDEO","MODEL_3D","SCRIPT","DATA","OTHER"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL..." className="flex-1 min-w-[160px] bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none" />
          <button onClick={() => add.mutate()} disabled={!name || !url} className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded text-primary text-sm flex items-center gap-2 disabled:opacity-50">
            <Plus className="w-4 h-4" /> Thêm
          </button>
        </div>
      </div>

      {isLoading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({length:8}).map((_,i)=><div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse"/>)}</div> :
        assets.length === 0 ? <div className="text-center py-16 text-muted-foreground"><Package className="w-12 h-12 mx-auto mb-3 opacity-30"/><p>Chưa có asset nào</p></div> :
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map(a => {
            const Icon = TYPE_ICONS[a.type] ?? File;
            return (
              <div key={a.id} className="rounded-xl border border-white/10 bg-white/3 p-4 group relative">
                <div className="flex items-center gap-2 mb-2"><Icon className="w-8 h-8 text-primary/60"/></div>
                <p className="text-sm font-medium text-white truncate">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.type}</p>
                <button onClick={() => del.mutate(a.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-rose-400 p-1"><Trash2 className="w-4 h-4"/></button>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}
