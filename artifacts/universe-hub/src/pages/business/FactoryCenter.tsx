import { useQuery } from "@tanstack/react-query";
import { Factory, Cog, Users, TrendingUp, Loader2, Zap } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";

export default function FactoryCenter() {
  const { data, isLoading } = useQuery({
    queryKey: ["business-factories"],
    queryFn:  () => fetch("/api/business/factories").then(r => r.json()),
  });
  const factories: Record<string, unknown>[] = data?.data ?? [];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Nhà máy" subtitle="Quản lý sản xuất và nhà máy" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {factories.map(f => (
                <div key={f["id"] as string} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-orange-500/30 transition-all">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <Factory className="w-6 h-6 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{f["name"] as string}</h3>
                      <p className="text-xs text-muted-foreground">{f["type"] as string}</p>
                    </div>
                  </div>
                  {f["location"] && (
                    <p className="text-xs text-muted-foreground mb-3 truncate">📍 {f["location"] as string}</p>
                  )}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <Cog className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Năng suất</p>
                      <p className="text-sm font-semibold text-white">{f["capacity"] as number}</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Công nhân</p>
                      <p className="text-sm font-semibold text-white">{f["workerCount"] as number}</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Tốc độ</p>
                      <p className="text-sm font-semibold text-white">{f["productionRate"] as number}x</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Đã sản xuất: {(f["totalProduced"] as number).toLocaleString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full ${f["isActive"] ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                      {f["isActive"] ? "Đang hoạt động" : "Tạm dừng"}
                    </span>
                  </div>
                </div>
              ))}
              {factories.length === 0 && (
                <div className="col-span-3 text-center py-12 text-muted-foreground">
                  <Factory className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Chưa có nhà máy nào</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
