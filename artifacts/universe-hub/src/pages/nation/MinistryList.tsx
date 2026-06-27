import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Trash2, Edit } from "lucide-react";
import { useState } from "react";

export default function MinistryList() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", shortName: "", description: "", icon: "🏛️", budget: 0 });

  const { data: ministries = [], isLoading } = useQuery({
    queryKey: ["nation-ministries"],
    queryFn: () => fetch("/api/nation/ministries").then(r => r.json()).then(r => r.data ?? []),
  });

  const create = useMutation({
    mutationFn: (body: typeof form) => fetch("/api/nation/ministries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["nation-ministries"] }); setShowForm(false); setForm({ name: "", shortName: "", description: "", icon: "🏛️", budget: 0 }); },
  });

  const del = useMutation({
    mutationFn: (id: string) => fetch(`/api/nation/ministries/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nation-ministries"] }),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-7 h-7 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Quản lý Bộ ngành</h1>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm transition-colors">
          <Plus className="w-4 h-4" /> Thêm Bộ
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white">Tạo Bộ mới</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Tên Bộ</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Bộ Tài chính" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Tên viết tắt</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.shortName} onChange={e => setForm(f => ({ ...f, shortName: e.target.value }))} placeholder="MOF" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Icon (emoji)</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🏛️" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Ngân sách (UNI)</label>
              <input type="number" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: Number(e.target.value) }))} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Mô tả</label>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Bộ phụ trách..." />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => create.mutate(form)} disabled={!form.name || create.isPending} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm disabled:opacity-50">
              {create.isPending ? "Đang tạo..." : "Tạo Bộ"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-white text-sm">Hủy</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(ministries as Record<string, string>[]).map(m => (
          <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-start gap-4">
            <div className="text-3xl">{m.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-white">{m.name}</p>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">{m.shortName}</span>
              </div>
              <p className="text-xs text-muted-foreground">{m.description}</p>
              <p className="text-xs text-amber-400 mt-2">Ngân sách: {Number(m.budget ?? 0).toLocaleString()} UNI</p>
            </div>
            <button onClick={() => del.mutate(m.id)} className="text-red-400/60 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
