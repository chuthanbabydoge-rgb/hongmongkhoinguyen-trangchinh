import { createResource, Show } from "solid-js";

interface Analytics {
  totalParcels: number;
  ownedParcels: number;
  availableParcels: number;
  totalBuildings: number;
  activeListings: number;
  totalListingValue: number;
  avgListingValue: number;
}

async function fetchAnalytics(): Promise<Analytics> {
  const res = await fetch("/api/land/analytics");
  const json = await res.json();
  return json.data;
}

export default function LandAnalytics() {
  const [analytics] = createResource(fetchAnalytics);

  return (
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-white">📊 Phân tích Đất đai</h1>
        <p class="text-slate-400 mt-1">Tổng quan thị trường bất động sản Universe</p>
      </div>

      <Show when={analytics()} fallback={<div class="text-slate-400">Đang tải...</div>}>
        {(a) => (
          <>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Tổng ô đất", value: a().totalParcels, icon: "📦", color: "from-violet-600 to-violet-800" },
                { label: "Đang có chủ", value: a().ownedParcels, icon: "🏠", color: "from-blue-600 to-blue-800" },
                { label: "Còn trống", value: a().availableParcels, icon: "📭", color: "from-emerald-600 to-emerald-800" },
                { label: "Công trình", value: a().totalBuildings, icon: "🏗️", color: "from-amber-600 to-amber-800" },
              ].map((s) => (
                <div class={`bg-gradient-to-br ${s.color} rounded-xl p-4 text-white`}>
                  <div class="text-3xl mb-2">{s.icon}</div>
                  <div class="text-2xl font-bold">{s.value.toLocaleString()}</div>
                  <div class="text-sm opacity-80">{s.label}</div>
                </div>
              ))}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <h3 class="text-slate-400 text-sm mb-2">Đang rao bán</h3>
                <div class="text-3xl font-bold text-rose-400">{a().activeListings.toLocaleString()}</div>
                <div class="text-slate-500 text-xs mt-1">listing hoạt động</div>
              </div>
              <div class="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <h3 class="text-slate-400 text-sm mb-2">Tổng giá trị thị trường</h3>
                <div class="text-3xl font-bold text-emerald-400">{a().totalListingValue.toLocaleString()}</div>
                <div class="text-slate-500 text-xs mt-1">Credits</div>
              </div>
              <div class="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <h3 class="text-slate-400 text-sm mb-2">Giá trung bình</h3>
                <div class="text-3xl font-bold text-blue-400">{Math.floor(a().avgListingValue).toLocaleString()}</div>
                <div class="text-slate-500 text-xs mt-1">Credits/ô đất</div>
              </div>
            </div>

            <div class="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h3 class="text-white font-semibold mb-4">📈 Tỷ lệ chiếm dụng</h3>
              <div class="space-y-3">
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-slate-400">Đất đã có chủ</span>
                    <span class="text-blue-400">{a().totalParcels > 0 ? ((a().ownedParcels / a().totalParcels) * 100).toFixed(1) : 0}%</span>
                  </div>
                  <div class="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full" style={{ width: `${a().totalParcels > 0 ? (a().ownedParcels / a().totalParcels) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-slate-400">Đất trống</span>
                    <span class="text-emerald-400">{a().totalParcels > 0 ? ((a().availableParcels / a().totalParcels) * 100).toFixed(1) : 0}%</span>
                  </div>
                  <div class="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 rounded-full" style={{ width: `${a().totalParcels > 0 ? (a().availableParcels / a().totalParcels) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Show>
    </div>
  );
}
