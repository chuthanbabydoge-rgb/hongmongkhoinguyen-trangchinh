import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Package, Plus, Trash2, Download, Globe } from "lucide-react";
import { useState } from "react";

export default function PackageManager() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState(""); const [desc, setDesc] = useState(""); const [version, setVersion] = useState("1.0.0");

  const { data: myData, isLoading } = useQuery({
    queryKey: ["studio-packages"],
    queryFn: async () => {
      const r = await fetch("/api/studio/packages", { headers: { Authorization: `Bearer ${accessToken}` } });
      return r.json();
    },
    enabled: !!accessToken,
  });

  const { data: pubData } = useQuery({
    queryKey: ["studio-packages-public"],
    queryFn: async () => {
      const r = await fetch("/api/studio/packages/public");
      return r.json();
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      await fetch("/api/studio/packages", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ name, version, description: desc }) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["studio-packages"] }); setName(""); },
  });

  const install = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/studio/packages/${id}/install`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-packages-public"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/studio/packages/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-packages"] }),
  });

  const myPkgs = (myData?.data ?? []) as { id: string; name: string; version: string; description?: string; downloadCount: number; isPublic: boolean }[];
  const pubPkgs = (pubData?.data ?? []) as { id: string; name: string; version: string; description?: string; downloadCount: number }[];

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-3"><Package className="w-6 h-6 text-primary" /><h1 className="text-2xl font-bold text-white">Package Manager</h1></div>

      <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3">
        <p className="text-sm font-medium text-white">Tạo Package</p>
        <div className="flex gap-2 flex-wrap">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Tên package..." className="flex-1 min-w-[140px] bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none" />
          <input value={version} onChange={e => setVersion(e.target.value)} placeholder="1.0.0" className="w-20 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none" />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Mô tả..." className="flex-1 min-w-[140px] bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none" />
          <button onClick={() => add.mutate()} disabled={!name} className="px-4 py-2 bg-primary/20 border border-primary/30 rounded text-primary text-sm flex items-center gap-2 disabled:opacity-50">
            <Plus className="w-4 h-4" /> Tạo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Package className="w-4 h-4 text-primary"/> My Packages</p>
          {isLoading ? <div className="space-y-2">{Array.from({length:3}).map((_,i)=><div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse"/>)}</div> :
            myPkgs.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có package</p> :
            <div className="space-y-2">
              {myPkgs.map(p => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground/50">v{p.version} · {p.downloadCount} downloads</p>
                  </div>
                  <button onClick={() => del.mutate(p.id)} className="text-rose-400/60 hover:text-rose-400 p-1"><Trash2 className="w-4 h-4"/></button>
                </div>
              ))}
            </div>
          }
        </div>

        <div>
          <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-cyan-400"/> Public Packages</p>
          {pubPkgs.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có package công khai</p> :
            <div className="space-y-2">
              {pubPkgs.map(p => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground/50">v{p.version} · {p.downloadCount} downloads</p>
                  </div>
                  <button onClick={() => install.mutate(p.id)} className="text-green-400 text-xs flex items-center gap-1 border border-green-500/30 bg-green-500/10 rounded px-2 py-1">
                    <Download className="w-3 h-3"/> Cài
                  </button>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
}
