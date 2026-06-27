import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Save, CheckCircle } from "lucide-react";

const FIELDS = [
  { label: "Giá đất cơ bản (Credits)", id: "base_land_price", defaultValue: "1000", type: "number" },
  { label: "Thuế giao dịch (%)", id: "transaction_tax", defaultValue: "2.5", type: "number" },
  { label: "Thời gian cooldown teleport (giây)", id: "teleport_cooldown", defaultValue: "300", type: "number" },
  { label: "Số ô đất tối đa mỗi user", id: "max_parcels_per_user", defaultValue: "10", type: "number" },
];
const BUILD_FIELDS = [
  { label: "Chi phí xây dựng tối thiểu", id: "min_build_cost", defaultValue: "100", type: "number" },
  { label: "Số công nhân tối đa/dự án", id: "max_workers", defaultValue: "10", type: "number" },
  { label: "Bonus tốc độ xây theo worker (%)", id: "worker_speed_bonus", defaultValue: "10", type: "number" },
];

export default function LandSettings() {
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">⚙️ Cài đặt Universe Land</h1>
              <p className="text-muted-foreground mt-1">Cấu hình hệ thống đất đai</p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="bg-card border border-white/10 rounded-xl p-5 space-y-4">
                <h3 className="text-white font-semibold">🌐 Cài đặt chung</h3>
                {FIELDS.map(f => (
                  <div key={f.id}>
                    <label className="block text-muted-foreground text-sm mb-1">{f.label}</label>
                    <input
                      id={f.id}
                      type={f.type}
                      defaultValue={f.defaultValue}
                      className="w-full bg-white/5 text-white rounded-lg px-4 py-2 text-sm outline-none border border-white/10 focus:border-violet-500"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-card border border-white/10 rounded-xl p-5 space-y-4">
                <h3 className="text-white font-semibold">🏗️ Cài đặt Xây dựng</h3>
                {BUILD_FIELDS.map(f => (
                  <div key={f.id}>
                    <label className="block text-muted-foreground text-sm mb-1">{f.label}</label>
                    <input
                      id={f.id}
                      type={f.type}
                      defaultValue={f.defaultValue}
                      className="w-full bg-white/5 text-white rounded-lg px-4 py-2 text-sm outline-none border border-white/10 focus:border-violet-500"
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${saved ? "bg-emerald-600 text-white" : "bg-violet-600 hover:bg-violet-700 text-white"}`}
              >
                {saved ? <><CheckCircle className="w-4 h-4" />Đã lưu!</> : <><Save className="w-4 h-4" />Lưu cài đặt</>}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
