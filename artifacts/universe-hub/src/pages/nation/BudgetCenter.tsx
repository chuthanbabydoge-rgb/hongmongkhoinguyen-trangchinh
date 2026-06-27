import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TrendingUp, Plus, PieChart } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function BudgetCenter() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", fiscalYear: new Date().getFullYear(), totalAmount: 0, description: "" });

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["nation-budgets"],
    queryFn: () => fetch("/api/nation/budgets").then(r => r.json()).then(r => r.data ?? []),
  });

  const create = useMutation({
    mutationFn: (body: typeof form) => fetch("/api/nation/budgets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["nation-budgets"] }); setShowForm(false); },
  });

  const approve = useMutation({
    mutationFn: (id: string) => fetch(`/api/nation/budgets/${id}/approve`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nation-budgets"] }),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-amber-400" />
          <h1 className="text-2xl font-bold text-white">Trung tâm Ngân sách</h1>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white text-sm">
          <Plus className="w-4 h-4" /> Tạo Ngân sách
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white">Tạo Ngân sách mới</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Tên ngân sách</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ngân sách 2025" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Năm tài chính</label>
              <input type="number" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.fiscalYear} onChange={e => setForm(f => ({ ...f, fiscalYear: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Tổng ngân sách (UNI)</label>
              <input type="number" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.totalAmount} onChange={e => setForm(f => ({ ...f, totalAmount: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Mô tả</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => create.mutate(form)} disabled={!form.name || create.isPending} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white text-sm disabled:opacity-50">
              {create.isPending ? "Đang tạo..." : "Tạo Ngân sách"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">Hủy</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {(budgets as Record<string, string | number>[]).map(b => {
          const spent = Number(b.spentAmount ?? 0);
          const total = Number(b.totalAmount ?? 1);
          const spentPct = Math.round((spent / total) * 100);
          return (
            <div key={b.id as string} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{b.name as string}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === "ACTIVE" || b.status === "APPROVED" ? "bg-green-500/20 text-green-400" : b.status === "DRAFT" ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"}`}>{b.status as string}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Năm tài chính {b.fiscalYear as number}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Tổng ngân sách</p>
                  <p className="text-xl font-bold text-amber-400">{Number(b.totalAmount ?? 0).toLocaleString()} UNI</p>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Đã chi: {spent.toLocaleString()} UNI</span>
                  <span>{spentPct}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${spentPct > 80 ? "bg-red-500" : spentPct > 50 ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${spentPct}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <Link href={`/nation/budget/${b.id as string}`} className="text-xs text-amber-400 hover:text-amber-300">Chi tiết →</Link>
                {b.status === "DRAFT" && (
                  <button onClick={() => approve.mutate(b.id as string)} className="text-xs text-green-400 hover:text-green-300">Phê duyệt →</button>
                )}
              </div>
            </div>
          );
        })}
        {budgets.length === 0 && <div className="text-center py-8 text-muted-foreground">Chưa có ngân sách nào</div>}
      </div>
    </div>
  );
}
