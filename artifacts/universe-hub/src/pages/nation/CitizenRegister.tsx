import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function CitizenRegister() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [form, setForm] = useState({ occupation: "", address: "" });
  const [done, setDone] = useState(false);

  const register = useMutation({
    mutationFn: (body: typeof form) => fetch("/api/nation/citizens/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["citizen-me", "nation-dashboard"] }); setDone(true); },
  });

  if (done) return (
    <div className="p-6 max-w-md mx-auto mt-12 text-center">
      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Đăng ký thành công!</h2>
      <p className="text-muted-foreground mb-6">Chào mừng bạn đến với Universe Prime</p>
      <button onClick={() => navigate("/nation/citizens/me")} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors">Xem hồ sơ công dân</button>
    </div>
  );

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-7 h-7 text-blue-400" />
        <h1 className="text-2xl font-bold text-white">Đăng ký Công dân</h1>
      </div>

      <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-300">Bằng cách đăng ký, bạn sẽ trở thành công dân chính thức của Universe Prime và được hưởng đầy đủ quyền công dân.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
        <div>
          <label className="text-sm text-muted-foreground block mb-2">Nghề nghiệp *</label>
          <input className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white" value={form.occupation} onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))} placeholder="Kỹ sư phần mềm, Thương nhân..." />
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-2">Địa chỉ *</label>
          <input className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Khu vực Nova Capital..." />
        </div>
        <button onClick={() => register.mutate(form)} disabled={!form.occupation || !form.address || register.isPending} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold disabled:opacity-50 transition-colors">
          {register.isPending ? "Đang đăng ký..." : "Đăng ký Công dân"}
        </button>
        {register.error && <p className="text-red-400 text-sm text-center">{String(register.error)}</p>}
        {(register.data as Record<string, unknown>)?.ok === false && <p className="text-red-400 text-sm text-center">{(register.data as Record<string, string>)?.error}</p>}
      </div>
    </div>
  );
}
