import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flag, Plus, CalendarDays, Star } from "lucide-react";
import { useState } from "react";

const eventTypeConfig: Record<string, { label: string; icon: string; color: string }> = {
  HOLIDAY:     { label: "Ngày lễ",      icon: "🎉", color: "text-amber-400" },
  CEREMONY:    { label: "Lễ nghi",      icon: "👑", color: "text-purple-400" },
  ELECTION:    { label: "Bầu cử",       icon: "🗳️", color: "text-green-400" },
  LEGISLATIVE: { label: "Lập pháp",     icon: "⚖️", color: "text-blue-400" },
  ECONOMIC:    { label: "Kinh tế",      icon: "📈", color: "text-emerald-400" },
  CULTURAL:    { label: "Văn hóa",      icon: "🎭", color: "text-pink-400" },
  MILITARY:    { label: "Quân sự",      icon: "⚔️", color: "text-red-400" },
  DIPLOMATIC:  { label: "Ngoại giao",   icon: "🌐", color: "text-cyan-400" },
  OTHER:       { label: "Khác",         icon: "📋", color: "text-gray-400" },
};

export default function NationalEvents() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", eventType: "OTHER", startDate: "", endDate: "", isPublicHoliday: false });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["national-events"],
    queryFn: () => fetch("/api/nation/events").then(r => r.json()).then(r => r.data ?? []),
  });

  const create = useMutation({
    mutationFn: (body: typeof form) => fetch("/api/nation/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["national-events"] }); setShowForm(false); },
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;

  const upcoming = (events as Record<string, string | boolean>[]).filter(e => new Date(e.startDate as string) > new Date());
  const past = (events as Record<string, string | boolean>[]).filter(e => new Date(e.startDate as string) <= new Date());

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flag className="w-7 h-7 text-rose-400" />
          <h1 className="text-2xl font-bold text-white">Sự kiện Quốc gia</h1>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-lg text-white text-sm">
          <Plus className="w-4 h-4" /> Tạo sự kiện
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white">Tạo sự kiện mới</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Tiêu đề</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Loại sự kiện</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.eventType} onChange={e => setForm(f => ({ ...f, eventType: e.target.value }))}>
                {Object.entries(eventTypeConfig).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Ngày bắt đầu</label>
              <input type="datetime-local" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Ngày kết thúc</label>
              <input type="datetime-local" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Mô tả</label>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input type="checkbox" checked={form.isPublicHoliday} onChange={e => setForm(f => ({ ...f, isPublicHoliday: e.target.checked }))} className="rounded" />
                Ngày nghỉ lễ toàn quốc
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => create.mutate(form)} disabled={!form.title || !form.startDate || create.isPending} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-lg text-white text-sm disabled:opacity-50">
              {create.isPending ? "Đang tạo..." : "Tạo sự kiện"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">Hủy</button>
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Sắp diễn ra</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcoming.map(e => <EventCard key={e.id as string} event={e} />)}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Đã qua</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {past.map(e => <EventCard key={e.id as string} event={e} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ event: e }: { event: Record<string, string | boolean> }) {
  const config = eventTypeConfig[e.eventType as string] ?? eventTypeConfig["OTHER"]!;
  const isPast = new Date(e.startDate as string) <= new Date();
  return (
    <div className={`bg-white/5 border border-white/10 rounded-xl p-4 ${isPast ? "opacity-70" : ""}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{config.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-white">{e.title as string}</p>
            {e.isPublicHoliday && <Star className="w-3 h-3 text-amber-400" />}
          </div>
          <p className={`text-xs ${config.color} mb-2`}>{config.label}</p>
          <p className="text-xs text-muted-foreground">{e.description as string}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <CalendarDays className="w-3 h-3" />
            <span>{new Date(e.startDate as string).toLocaleDateString("vi-VN")}</span>
            {e.endDate && <><span>→</span><span>{new Date(e.endDate as string).toLocaleDateString("vi-VN")}</span></>}
          </div>
        </div>
      </div>
    </div>
  );
}
