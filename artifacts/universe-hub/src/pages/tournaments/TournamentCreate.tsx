import { useState } from "react";
import { useLocation } from "wouter";
import { Trophy, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function TournamentCreate() {
  const { accessToken } = useAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    name: "", description: "",
    type: "SINGLE", matchType: "DUEL",
    maxParticipants: 8,
    entryFee: 0, prizePool: 0,
    minMmr: "", maxMmr: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setSaving(true); setError(null);
    try {
      const r = await fetch("/api/tournaments", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          minMmr: form.minMmr ? parseInt(form.minMmr) : undefined,
          maxMmr: form.maxMmr ? parseInt(form.maxMmr) : undefined,
        }),
      });
      const j = await r.json() as { ok: boolean; data: { id: string }; error?: string };
      if (!j.ok) { setError(j.error ?? "Lỗi tạo giải đấu"); return; }
      navigate(`/tournaments/${j.data.id}`);
    } catch { setError("Không thể kết nối server"); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate("/tournaments")} className="text-muted-foreground text-sm hover:text-white transition-colors mb-4">← Quay lại</button>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-400" /> Tạo giải đấu</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Tên giải đấu *">
          <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500/50"
            placeholder="VD: Grand Championship Season 1" />
        </Field>

        <Field label="Mô tả">
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500/50 resize-none h-20"
            placeholder="Mô tả giải đấu..." />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Thể thức">
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none">
              <option value="SINGLE">Loại đơn (Single Elimination)</option>
              <option value="DOUBLE">Loại kép (Double Elimination)</option>
              <option value="ROUND_ROBIN">Vòng tròn (Round Robin)</option>
            </select>
          </Field>
          <Field label="Chế độ thi đấu">
            <select value={form.matchType} onChange={(e) => setForm((f) => ({ ...f, matchType: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none">
              <option value="DUEL">Tay đôi 1v1</option>
              <option value="ARENA_2V2">Đội 2v2</option>
              <option value="ARENA_3V3">Đội 3v3</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Số người tối đa">
            <select value={form.maxParticipants} onChange={(e) => setForm((f) => ({ ...f, maxParticipants: parseInt(e.target.value) }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none">
              {[2,4,8,16,32].map((n) => <option key={n} value={n}>{n} người</option>)}
            </select>
          </Field>
          <Field label="Phí tham gia">
            <input type="number" min={0} value={form.entryFee} onChange={(e) => setForm((f) => ({ ...f, entryFee: parseInt(e.target.value) || 0 }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none" />
          </Field>
          <Field label="Giải thưởng (Credits)">
            <input type="number" min={0} value={form.prizePool} onChange={(e) => setForm((f) => ({ ...f, prizePool: parseInt(e.target.value) || 0 }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="MMR tối thiểu (tùy chọn)">
            <input type="number" value={form.minMmr} onChange={(e) => setForm((f) => ({ ...f, minMmr: e.target.value }))}
              placeholder="VD: 1000"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none" />
          </Field>
          <Field label="MMR tối đa (tùy chọn)">
            <input type="number" value={form.maxMmr} onChange={(e) => setForm((f) => ({ ...f, maxMmr: e.target.value }))}
              placeholder="VD: 2000"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none" />
          </Field>
        </div>

        {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</div>}

        <button type="submit" disabled={saving || !form.name}
          className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> {saving ? "Đang tạo..." : "Tạo giải đấu"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
