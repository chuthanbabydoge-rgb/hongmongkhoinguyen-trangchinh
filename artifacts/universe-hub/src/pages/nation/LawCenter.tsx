import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Scale, Plus, Filter, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const statusColor: Record<string, string> = {
  PASSED:   "bg-green-500/20 text-green-400",
  VOTING:   "bg-amber-500/20 text-amber-400",
  DRAFT:    "bg-blue-500/20 text-blue-400",
  REJECTED: "bg-red-500/20 text-red-400",
  REPEALED: "bg-gray-500/20 text-gray-400",
};

export default function LawCenter() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", summary: "", categoryId: "" });

  const { data: laws = [], isLoading } = useQuery({
    queryKey: ["nation-laws", statusFilter],
    queryFn: () => fetch(`/api/nation/laws${statusFilter ? `?status=${statusFilter}` : ""}`).then(r => r.json()).then(r => r.data ?? []),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["law-categories"],
    queryFn: () => fetch("/api/nation/law-categories").then(r => r.json()).then(r => r.data ?? []),
  });

  const create = useMutation({
    mutationFn: (body: typeof form) => fetch("/api/nation/laws", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["nation-laws"] }); setShowForm(false); setForm({ title: "", content: "", summary: "", categoryId: "" }); },
  });

  const filtered = (laws as Record<string, string>[]).filter(l => !search || l.title?.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale className="w-7 h-7 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Trung tâm Luật pháp</h1>
            <p className="text-sm text-muted-foreground">{laws.length} luật được đề xuất</p>
          </div>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm">
          <Plus className="w-4 h-4" /> Đề xuất Luật
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-white">Đề xuất Luật mới</h3>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Tiêu đề luật *</label>
            <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Tên luật..." />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Tóm tắt</label>
            <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Tóm tắt ngắn gọn..." />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Danh mục</label>
            <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
              <option value="">-- Không có --</option>
              {(categories as Record<string, string>[]).map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Nội dung đầy đủ</label>
            <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Nội dung chi tiết..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => create.mutate(form)} disabled={!form.title || create.isPending} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm disabled:opacity-50">
              {create.isPending ? "Đang gửi..." : "Gửi đề xuất"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">Hủy</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white text-sm" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {["", "PASSED", "VOTING", "DRAFT", "REJECTED"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${statusFilter === s ? "bg-purple-600 text-white" : "bg-white/5 text-muted-foreground hover:text-white"}`}>
            {s || "Tất cả"}
          </button>
        ))}
      </div>

      {/* Law List */}
      <div className="space-y-3">
        {filtered.map(l => (
          <Link key={l.id} href={`/nation/laws/${l.id}`} className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-white">{l.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{l.summary}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[l.status] ?? "bg-gray-500/20 text-gray-400"}`}>{l.status}</span>
              </div>
            </div>
            {l.status === "VOTING" && (
              <div className="mt-3 flex items-center gap-4 text-xs">
                <span className="text-green-400">✅ {l.votesFor} ủng hộ</span>
                <span className="text-red-400">❌ {l.votesAgainst} phản đối</span>
              </div>
            )}
          </Link>
        ))}
        {filtered.length === 0 && <div className="text-center py-8 text-muted-foreground">Không có luật nào</div>}
      </div>
    </div>
  );
}
