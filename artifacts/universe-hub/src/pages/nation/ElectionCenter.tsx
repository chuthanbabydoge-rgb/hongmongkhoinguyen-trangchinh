import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Vote, Plus, CalendarDays } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const statusColor: Record<string, string> = {
  ACTIVE:    "bg-green-500/20 text-green-400",
  UPCOMING:  "bg-blue-500/20 text-blue-400",
  ENDED:     "bg-gray-500/20 text-gray-400",
  CANCELLED: "bg-red-500/20 text-red-400",
};

export default function ElectionCenter() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", electionType: "PARLIAMENTARY", startDate: "", endDate: "" });

  const { data: elections = [], isLoading } = useQuery({
    queryKey: ["nation-elections"],
    queryFn: () => fetch("/api/nation/elections").then(r => r.json()).then(r => r.data ?? []),
  });

  const create = useMutation({
    mutationFn: (body: typeof form) => fetch("/api/nation/elections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["nation-elections"] }); setShowForm(false); },
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Vote className="w-7 h-7 text-green-400" />
          <h1 className="text-2xl font-bold text-white">Trung tâm Bầu cử</h1>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white text-sm">
          <Plus className="w-4 h-4" /> Tổ chức Bầu cử
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white">Tạo cuộc Bầu cử mới</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Tiêu đề</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Bầu cử Tổng thống..." />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Loại</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.electionType} onChange={e => setForm(f => ({ ...f, electionType: e.target.value }))}>
                {["PRESIDENTIAL", "PARLIAMENTARY", "MINISTERIAL", "REFERENDUM", "MUNICIPAL"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Bắt đầu</label>
              <input type="datetime-local" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Kết thúc</label>
              <input type="datetime-local" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Mô tả</label>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => create.mutate(form)} disabled={!form.title || create.isPending} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white text-sm disabled:opacity-50">
              {create.isPending ? "Đang tạo..." : "Tạo Bầu cử"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">Hủy</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(elections as Record<string, string>[]).map(e => (
          <Link key={e.id} href={`/nation/elections/${e.id}`} className="block bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-colors">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-semibold text-white">{e.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor[e.status] ?? "bg-gray-500/20 text-gray-400"}`}>{e.status}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{e.electionType}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{new Date(e.startDate).toLocaleDateString("vi-VN")}</span>
              <span>→ {new Date(e.endDate).toLocaleDateString("vi-VN")}</span>
              <span className="ml-auto text-white font-semibold">{e.totalVotes} phiếu</span>
            </div>
          </Link>
        ))}
        {elections.length === 0 && <div className="col-span-2 text-center py-8 text-muted-foreground">Chưa có cuộc bầu cử nào</div>}
      </div>
    </div>
  );
}
