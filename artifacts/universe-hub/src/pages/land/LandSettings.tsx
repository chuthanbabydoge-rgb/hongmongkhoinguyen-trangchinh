import { createSignal } from "solid-js";

export default function LandSettings() {
  const [saved, setSaved] = createSignal(false);

  function handleSave(e: Event) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div class="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 class="text-2xl font-bold text-white">⚙️ Cài đặt Universe Land</h1>
        <p class="text-slate-400 mt-1">Cấu hình hệ thống đất đai</p>
      </div>

      <form onSubmit={handleSave} class="space-y-4">
        <div class="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-4">
          <h3 class="text-white font-semibold">🌐 Cài đặt chung</h3>
          {[
            { label: "Giá đất cơ bản (Credits)", id: "base_land_price", default: "1000", type: "number" },
            { label: "Thuế giao dịch (%)", id: "transaction_tax", default: "2.5", type: "number" },
            { label: "Thời gian cooldown teleport (giây)", id: "teleport_cooldown", default: "300", type: "number" },
            { label: "Số ô đất tối đa mỗi user", id: "max_parcels_per_user", default: "10", type: "number" },
          ].map(f => (
            <div>
              <label class="block text-slate-400 text-sm mb-1">{f.label}</label>
              <input
                id={f.id}
                type={f.type}
                defaultValue={f.default}
                class="w-full bg-slate-700 text-white rounded-lg px-4 py-2 text-sm outline-none border border-slate-600 focus:border-violet-500"
              />
            </div>
          ))}
        </div>

        <div class="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-4">
          <h3 class="text-white font-semibold">🏗️ Cài đặt Xây dựng</h3>
          {[
            { label: "Chi phí xây dựng tối thiểu", id: "min_build_cost", default: "100", type: "number" },
            { label: "Số công nhân tối đa/dự án", id: "max_workers", default: "10", type: "number" },
            { label: "Bonus tốc độ xây theo worker (%)", id: "worker_speed_bonus", default: "10", type: "number" },
          ].map(f => (
            <div>
              <label class="block text-slate-400 text-sm mb-1">{f.label}</label>
              <input
                id={f.id}
                type={f.type}
                defaultValue={f.default}
                class="w-full bg-slate-700 text-white rounded-lg px-4 py-2 text-sm outline-none border border-slate-600 focus:border-violet-500"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          class={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${saved() ? "bg-emerald-600 text-white" : "bg-violet-600 hover:bg-violet-700 text-white"}`}
        >
          {saved() ? "✅ Đã lưu!" : "💾 Lưu cài đặt"}
        </button>
      </form>
    </div>
  );
}
