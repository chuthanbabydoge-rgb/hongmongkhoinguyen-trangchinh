import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Plus, Pin, Trash2 } from "lucide-react";
import { useState } from "react";

const priorityConfig: Record<string, { label: string; color: string }> = {
  URGENT: { label: "Khẩn cấp", color: "bg-red-500/20 text-red-400 border-red-500/20" },
  HIGH:   { label: "Cao",      color: "bg-amber-500/20 text-amber-400 border-amber-500/20" },
  MEDIUM: { label: "Trung bình", color: "bg-blue-500/20 text-blue-400 border-blue-500/20" },
  LOW:    { label: "Thấp",    color: "bg-gray-500/20 text-gray-400 border-gray-500/20" },
};

export default function Announcements() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", priority: "MEDIUM", isPinned: false });

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => fetch("/api/nation/announcements").then(r => r.json()).then(r => r.data ?? []),
  });

  const create = useMutation({
    mutationFn: (body: typeof form) => fetch("/api/nation/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["announcements"] }); setShowForm(false); setForm({ title: "", content: "", priority: "MEDIUM", isPinned: false }); },
  });

  const del = useMutation({
    mutationFn: (id: string) => fetch(`/api/nation/announcements/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;

  const pinned = (announcements as Record<string, string | boolean>[]).filter(a => a.isPinned);
  const rest   = (announcements as Record<string, string | boolean>[]).filter(a => !a.isPinned);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Megaphone className="w-7 h-7 text-amber-400" />
          <h1 className="text-2xl font-bold text-white">Thông báo Chính phủ</h1>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white text-sm">
          <Plus className="w-4 h-4" /> Đăng thông báo
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white">Tạo thông báo mới</h3>
          <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Tiêu đề thông báo..." />
          <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Nội dung..." />
          <div className="flex gap-4">
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              {["LOW", "MEDIUM", "HIGH", "URGENT"].map(p => <option key={p} value={p}>{priorityConfig[p]!.label}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
              <input type="checkbox" checked={form.isPinned} onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))} className="rounded" />
              Ghim thông báo
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={() => create.mutate(form)} disabled={!form.title || create.isPending} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white text-sm disabled:opacity-50">
              {create.isPending ? "Đang đăng..." : "Đăng thông báo"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">Hủy</button>
          </div>
        </div>
      )}

      {/* Pinned */}
      {pinned.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3"><Pin className="w-3.5 h-3.5" /> Đã ghim</h2>
          <div className="space-y-3">
            {pinned.map(a => (
              <AnnouncementCard key={a.id as string} ann={a} onDelete={() => del.mutate(a.id as string)} />
            ))}
          </div>
        </div>
      )}

      {/* All */}
      <div className="space-y-3">
        {rest.map(a => <AnnouncementCard key={a.id as string} ann={a} onDelete={() => del.mutate(a.id as string)} />)}
      </div>
    </div>
  );
}

function AnnouncementCard({ ann, onDelete }: { ann: Record<string, string | boolean>; onDelete: () => void }) {
  const pc = priorityConfig[ann.priority as string] ?? priorityConfig["MEDIUM"]!;
  return (
    <div className={`bg-white/5 border rounded-xl p-5 ${ann.isPinned ? "border-amber-500/20" : "border-white/10"}`}>
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          {ann.isPinned && <Pin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
          <h3 className="font-semibold text-white">{ann.title as string}</h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${pc.color}`}>{pc.label}</span>
          <button onClick={onDelete} className="text-red-400/60 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{ann.content as string}</p>
      <p className="text-xs text-muted-foreground">{new Date(ann.createdAt as string).toLocaleDateString("vi-VN")}</p>
    </div>
  );
}
