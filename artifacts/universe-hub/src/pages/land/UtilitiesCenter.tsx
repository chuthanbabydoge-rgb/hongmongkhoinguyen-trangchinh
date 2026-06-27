import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Loader2, Cpu } from "lucide-react";

interface Utility {
  id: string; name: string; type: string; capacity: number;
  usage: number; costPerUnit: number; isActive: boolean; districtId?: string;
}

const UTILITY_ICONS: Record<string, string> = {
  ELECTRICITY: "⚡", WATER: "💧", INTERNET: "🌐",
  GAS: "🔥", SEWER: "🚰", HEATING: "♨️", SOLAR: "☀️",
};
const UTILITY_COLORS: Record<string, string> = {
  ELECTRICITY: "from-amber-600 to-amber-800",
  WATER: "from-blue-600 to-blue-800",
  INTERNET: "from-violet-600 to-violet-800",
  GAS: "from-orange-600 to-orange-800",
  SEWER: "from-slate-600 to-slate-800",
  HEATING: "from-rose-600 to-rose-800",
  SOLAR: "from-yellow-600 to-yellow-800",
};

export default function UtilitiesCenter() {
  const { data, isLoading } = useQuery<{ success: boolean; data: Utility[] }>({
    queryKey: ["land", "utilities"],
    queryFn: async () => (await fetch("/api/land/utilities")).json() as Promise<{ success: boolean; data: Utility[] }>,
  });
  const utilities = data?.data ?? [];

  const grouped: Record<string, Utility[]> = {};
  for (const u of utilities) {
    if (!grouped[u.type]) grouped[u.type] = [];
    grouped[u.type].push(u);
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">⚡ Hạ tầng Tiện ích</h1>
            <p className="text-muted-foreground mt-1">Điện, nước, internet và các dịch vụ thiết yếu</p>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
          ) : utilities.length === 0 ? (
            <div className="text-center py-12">
              <Cpu className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Chưa có hệ thống tiện ích</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([type, items]) => (
                <div key={type}>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span>{UTILITY_ICONS[type] ?? "🔧"}</span>
                    <span>{type}</span>
                    <span className="text-muted-foreground text-sm font-normal">({items.length} hệ thống)</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(u => {
                      const usagePct = u.capacity > 0 ? (u.usage / u.capacity) * 100 : 0;
                      return (
                        <div key={u.id} className="bg-card border border-white/10 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className={`text-2xl w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br ${UTILITY_COLORS[u.type] ?? "from-slate-600 to-slate-800"}`}>
                              {UTILITY_ICONS[u.type] ?? "🔧"}
                            </div>
                            <div className="text-right">
                              <div className="text-white font-semibold text-sm">{u.name}</div>
                              <div className={`text-xs ${u.isActive ? "text-emerald-400" : "text-rose-400"}`}>
                                {u.isActive ? "Hoạt động" : "Ngừng"}
                              </div>
                            </div>
                          </div>
                          <div className="mb-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Tải: {u.usage.toFixed(0)} / {u.capacity.toFixed(0)}</span>
                              <span>{usagePct.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${usagePct > 80 ? "bg-rose-500" : usagePct > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                                style={{ width: `${Math.min(usagePct, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Chi phí: <span className="text-emerald-400">{u.costPerUnit}/đơn vị</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
