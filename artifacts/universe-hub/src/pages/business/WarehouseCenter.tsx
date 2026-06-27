import { useQuery } from "@tanstack/react-query";
import { Warehouse, Package, AlertCircle, Loader2, TrendingUp } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";

export default function WarehouseCenter() {
  const { data, isLoading } = useQuery({
    queryKey: ["business-warehouses"],
    queryFn:  () => fetch("/api/business/warehouses").then(r => r.json()),
  });
  const warehouses: Record<string, unknown>[] = data?.data ?? [];

  const typeColors: Record<string, string> = {
    GENERAL: "bg-blue-500/20 text-blue-300",
    COLD_STORAGE: "bg-cyan-500/20 text-cyan-300",
    SECURE: "bg-purple-500/20 text-purple-300",
    VIRTUAL: "bg-indigo-500/20 text-indigo-300",
    DISTRIBUTION: "bg-orange-500/20 text-orange-300",
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Kho hàng" subtitle="Quản lý tất cả kho hàng trong hệ thống" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {warehouses.map(w => {
                const pct = Math.round(((w["usedCapacity"] as number) / (w["capacity"] as number)) * 100);
                return (
                  <div key={w["id"] as string} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-start gap-3 mb-4">
                      <Warehouse className="w-8 h-8 text-indigo-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{w["name"] as string}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[w["type"] as string] ?? "bg-gray-500/20 text-gray-300"}`}>
                          {w["type"] as string}
                        </span>
                      </div>
                    </div>
                    {w["location"] && (
                      <p className="text-xs text-muted-foreground mb-3 truncate">📍 {w["location"] as string}</p>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1"><Package className="w-3 h-3" /> Sức chứa</span>
                        <span className={`font-medium ${pct > 80 ? "text-red-400" : pct > 60 ? "text-yellow-400" : "text-green-400"}`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct > 80 ? "bg-red-400" : pct > 60 ? "bg-yellow-400" : "bg-green-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">
                        {(w["usedCapacity"] as number).toLocaleString()} / {(w["capacity"] as number).toLocaleString()} đơn vị
                      </p>
                    </div>
                    {pct > 80 && (
                      <div className="mt-3 flex items-center gap-1 text-xs text-red-400">
                        <AlertCircle className="w-3 h-3" /> Sắp đầy kho!
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${w["isActive"] ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                        {w["isActive"] ? "Hoạt động" : "Tạm dừng"}
                      </span>
                    </div>
                  </div>
                );
              })}
              {warehouses.length === 0 && (
                <div className="col-span-3 text-center py-12 text-muted-foreground">
                  <Warehouse className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Chưa có kho hàng nào</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
