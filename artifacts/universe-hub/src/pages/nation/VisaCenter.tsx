import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Plus, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function VisaCenter() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ visaTypeId: "", purpose: "" });
  const [applied, setApplied] = useState(false);

  const { data: visaTypes = [] } = useQuery({
    queryKey: ["visa-types"],
    queryFn: () => fetch("/api/nation/visa-types").then(r => r.json()).then(r => r.data ?? []),
  });

  const { data: myVisa } = useQuery({
    queryKey: ["my-visa"],
    queryFn: () => fetch("/api/nation/visa").then(r => r.json()).then(r => r.data),
  });

  const apply = useMutation({
    mutationFn: (body: typeof form) => fetch("/api/nation/visa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: (d) => { if (d.ok) { qc.invalidateQueries({ queryKey: ["my-visa"] }); setApplied(true); } },
  });

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Globe className="w-7 h-7 text-cyan-400" />
        <h1 className="text-2xl font-bold text-white">Trung tâm Visa</h1>
      </div>

      {myVisa && (
        <div className="bg-green-900/20 border border-green-500/20 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Visa hiện tại</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-muted-foreground">Số visa</p><p className="text-sm font-mono text-white">{myVisa.visaNumber}</p></div>
            <div><p className="text-xs text-muted-foreground">Trạng thái</p><span className={`text-xs px-2 py-0.5 rounded-full ${myVisa.status === "APPROVED" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>{myVisa.status}</span></div>
            <div><p className="text-xs text-muted-foreground">Mục đích</p><p className="text-sm text-white">{myVisa.purpose}</p></div>
            <div><p className="text-xs text-muted-foreground">Hết hạn</p><p className="text-sm text-white">{myVisa.expiresAt ? new Date(myVisa.expiresAt).toLocaleDateString("vi-VN") : "N/A"}</p></div>
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
        <h3 className="font-semibold text-white">Xin Visa mới</h3>
        <div>
          <label className="text-sm text-muted-foreground block mb-2">Loại Visa</label>
          <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white" value={form.visaTypeId} onChange={e => setForm(f => ({ ...f, visaTypeId: e.target.value }))}>
            <option value="">-- Chọn loại visa --</option>
            {(visaTypes as Record<string, string>[]).map(v => (
              <option key={v.id} value={v.id}>{v.name} — {v.durationDays} ngày — {Number(v.fee ?? 0).toLocaleString()} UNI</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-2">Mục đích</label>
          <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white" rows={3} value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="Du lịch, kinh doanh, học tập..." />
        </div>
        <button onClick={() => apply.mutate(form)} disabled={!form.visaTypeId || apply.isPending} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-semibold disabled:opacity-50 transition-colors">
          {apply.isPending ? "Đang xử lý..." : "Nộp đơn xin Visa"}
        </button>
        {applied && <p className="text-green-400 text-sm text-center">Visa đã được phê duyệt thành công!</p>}
        {(apply.data as Record<string, unknown>)?.ok === false && <p className="text-red-400 text-sm text-center">{(apply.data as Record<string, string>)?.error}</p>}
      </div>

      {/* Visa Types */}
      <div>
        <h3 className="font-semibold text-white mb-3">Các loại Visa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(visaTypes as Record<string, string>[]).map(v => (
            <div key={v.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="font-semibold text-white">{v.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{v.description}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-xs text-cyan-400">⏳ {v.durationDays} ngày</span>
                <span className="text-xs text-amber-400">💰 {Number(v.fee ?? 0).toLocaleString()} UNI</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
