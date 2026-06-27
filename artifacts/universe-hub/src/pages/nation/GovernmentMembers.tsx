import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Crown, Plus } from "lucide-react";
import { useState } from "react";

const roleConfig: Record<string, { label: string; color: string }> = {
  PRESIDENT:       { label: "Tổng thống", color: "text-amber-400" },
  PRIME_MINISTER:  { label: "Thủ tướng",  color: "text-orange-400" },
  MINISTER:        { label: "Bộ trưởng",  color: "text-blue-400" },
  DEPUTY_MINISTER: { label: "Thứ trưởng", color: "text-cyan-400" },
  SECRETARY:       { label: "Thư ký",     color: "text-green-400" },
  ADVISOR:         { label: "Cố vấn",     color: "text-purple-400" },
};

export default function GovernmentMembers() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ targetUserId: "", role: "ADVISOR", title: "", bio: "" });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["nation-members"],
    queryFn: () => fetch("/api/nation/members").then(r => r.json()).then(r => r.data ?? []),
  });

  const appoint = useMutation({
    mutationFn: (body: typeof form) => fetch("/api/nation/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["nation-members"] }); setShowForm(false); },
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;

  const grouped = Object.fromEntries(Object.keys(roleConfig).map(role => [role, (members as Record<string, string>[]).filter(m => m.role === role)]));

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="w-7 h-7 text-amber-400" />
          <h1 className="text-2xl font-bold text-white">Thành viên Chính phủ</h1>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white text-sm">
          <Plus className="w-4 h-4" /> Bổ nhiệm
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white">Bổ nhiệm thành viên mới</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">User ID</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.targetUserId} onChange={e => setForm(f => ({ ...f, targetUserId: e.target.value }))} placeholder="user-123" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Chức vụ</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {Object.entries(roleConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Tiêu đề</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Tiểu sử</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => appoint.mutate(form)} disabled={!form.targetUserId || appoint.isPending} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white text-sm disabled:opacity-50">
              {appoint.isPending ? "Đang bổ nhiệm..." : "Bổ nhiệm"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">Hủy</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(roleConfig).map(([role, config]) => {
          const roleMembers = grouped[role] ?? [];
          if (roleMembers.length === 0) return null;
          return (
            <div key={role}>
              <h2 className={`text-sm font-semibold mb-3 ${config.color}`}>{config.label} ({roleMembers.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {roleMembers.map(m => (
                  <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold ${config.color}`}>
                      {m.role?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{m.title || config.label}</p>
                      <p className={`text-xs ${config.color}`}>{config.label}</p>
                      {m.bio && <p className="text-xs text-muted-foreground truncate mt-0.5">{m.bio}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {members.length === 0 && <div className="text-center py-8 text-muted-foreground">Chưa có thành viên chính phủ nào</div>}
      </div>
    </div>
  );
}
