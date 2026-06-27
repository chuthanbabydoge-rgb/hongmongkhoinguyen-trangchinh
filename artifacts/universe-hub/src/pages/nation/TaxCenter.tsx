import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, CreditCard, Plus } from "lucide-react";
import { useState } from "react";

export default function TaxCenter() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ taxRuleId: "", amount: 0, period: `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}` });

  const { data: rules = [] } = useQuery({
    queryKey: ["tax-rules"],
    queryFn: () => fetch("/api/nation/tax/rules").then(r => r.json()).then(r => r.data ?? []),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["my-tax-payments"],
    queryFn: () => fetch("/api/nation/tax/payments?mine=true").then(r => r.json()).then(r => r.data ?? []),
  });

  const pay = useMutation({
    mutationFn: (body: typeof form) => fetch("/api/nation/tax/pay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-tax-payments"] }); setForm(f => ({ ...f, taxRuleId: "", amount: 0 })); },
  });

  const taxTypeColor: Record<string, string> = {
    INCOME: "text-blue-400",
    TRADE: "text-green-400",
    PROPERTY: "text-purple-400",
    WEALTH: "text-amber-400",
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <FileText className="w-7 h-7 text-amber-400" />
        <h1 className="text-2xl font-bold text-white">Trung tâm Thuế</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pay Tax */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2"><CreditCard className="w-4 h-4 text-amber-400" /> Nộp thuế</h3>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Loại thuế</label>
            <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.taxRuleId} onChange={e => setForm(f => ({ ...f, taxRuleId: e.target.value }))}>
              <option value="">-- Chọn loại thuế --</option>
              {(rules as Record<string, string | number>[]).map(r => <option key={r.id as string} value={r.id as string}>{r.name as string} ({(Number(r.rate ?? 0) * 100).toFixed(0)}%)</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Số tiền (UNI)</label>
            <input type="number" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Kỳ thuế</label>
            <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} placeholder="2025-Q1" />
          </div>
          <button onClick={() => pay.mutate(form)} disabled={!form.taxRuleId || form.amount <= 0 || pay.isPending} className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-lg text-white font-semibold disabled:opacity-50 transition-colors">
            {pay.isPending ? "Đang xử lý..." : "Nộp thuế"}
          </button>
          {pay.isSuccess && <p className="text-green-400 text-sm text-center">Nộp thuế thành công!</p>}
        </div>

        {/* Tax Rules */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Quy tắc thuế</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {(rules as Record<string, string | number>[]).map(r => (
              <div key={r.id as string} className="flex items-center justify-between p-3 bg-white/3 rounded-lg">
                <div>
                  <p className="text-sm text-white">{r.name as string}</p>
                  <p className="text-xs text-muted-foreground">{r.taxType as string}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${taxTypeColor[r.taxType as string] ?? "text-white"}`}>{(Number(r.rate ?? 0) * 100).toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Tối thiểu {Number(r.minAmount ?? 0).toLocaleString()} UNI</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Lịch sử nộp thuế</h3>
        <div className="space-y-2">
          {(payments as Record<string, string | number>[]).map(p => (
            <div key={p.id as string} className="flex items-center justify-between p-3 bg-white/3 rounded-lg">
              <div>
                <p className="text-sm text-white">Kỳ: {p.period as string}</p>
                <p className="text-xs text-muted-foreground">{new Date(p.paidAt as string).toLocaleDateString("vi-VN")}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-amber-400">{Number(p.amount ?? 0).toLocaleString()} UNI</p>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">{p.status as string}</span>
              </div>
            </div>
          ))}
          {payments.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">Chưa có lịch sử nộp thuế</p>}
        </div>
      </div>
    </div>
  );
}
