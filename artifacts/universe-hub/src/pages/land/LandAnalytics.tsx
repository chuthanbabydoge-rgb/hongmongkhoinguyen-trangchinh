import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Loader2 } from "lucide-react";

interface Analytics {
  totalParcels: number;
  ownedParcels: number;
  availableParcels: number;
  totalBuildings: number;
  activeListings: number;
  totalListingValue: number;
  avgListingValue: number;
}

export default function LandAnalytics() {
  const { data, isLoading } = useQuery<{ success: boolean; data: Analytics }>({
    queryKey: ["land", "analytics"],
    queryFn: async () => (await fetch("/api/land/analytics")).json() as Promise<{ success: boolean; data: Analytics }>,
  });
  const a = data?.data;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">📊 Phân tích Đất đai</h1>
            <p className="text-muted-foreground mt-1">Tổng quan thị trường bất động sản Universe</p>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
          ) : a ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Tổng ô đất", value: a.totalParcels, icon: "📦", color: "from-violet-600 to-violet-800" },
                  { label: "Đang có chủ", value: a.ownedParcels, icon: "🏠", color: "from-blue-600 to-blue-800" },
                  { label: "Còn trống", value: a.availableParcels, icon: "📭", color: "from-emerald-600 to-emerald-800" },
                  { label: "Công trình", value: a.totalBuildings, icon: "🏗️", color: "from-amber-600 to-amber-800" },
                ].map((s) => (
                  <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-xl p-4 text-white`}>
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <div className="text-2xl font-bold">{s.value.toLocaleString()}</div>
                    <div className="text-sm opacity-80">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-white/10 rounded-xl p-5">
                  <h3 className="text-muted-foreground text-sm mb-2">Đang rao bán</h3>
                  <div className="text-3xl font-bold text-rose-400">{a.activeListings.toLocaleString()}</div>
                  <div className="text-muted-foreground text-xs mt-1">listing hoạt động</div>
                </div>
                <div className="bg-card border border-white/10 rounded-xl p-5">
                  <h3 className="text-muted-foreground text-sm mb-2">Tổng giá trị thị trường</h3>
                  <div className="text-3xl font-bold text-emerald-400">{a.totalListingValue.toLocaleString()}</div>
                  <div className="text-muted-foreground text-xs mt-1">Credits</div>
                </div>
                <div className="bg-card border border-white/10 rounded-xl p-5">
                  <h3 className="text-muted-foreground text-sm mb-2">Giá trung bình</h3>
                  <div className="text-3xl font-bold text-blue-400">{Math.floor(a.avgListingValue).toLocaleString()}</div>
                  <div className="text-muted-foreground text-xs mt-1">Credits/ô đất</div>
                </div>
              </div>

              <div className="bg-card border border-white/10 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-4">📈 Tỷ lệ chiếm dụng</h3>
                <div className="space-y-3">
                  {[
                    { label: "Đất đã có chủ", pct: a.totalParcels > 0 ? (a.ownedParcels / a.totalParcels) * 100 : 0, color: "bg-blue-500", textColor: "text-blue-400" },
                    { label: "Đất trống", pct: a.totalParcels > 0 ? (a.availableParcels / a.totalParcels) * 100 : 0, color: "bg-emerald-500", textColor: "text-emerald-400" },
                  ].map(bar => (
                    <div key={bar.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{bar.label}</span>
                        <span className={bar.textColor}>{bar.pct.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${bar.color} rounded-full`} style={{ width: `${bar.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
