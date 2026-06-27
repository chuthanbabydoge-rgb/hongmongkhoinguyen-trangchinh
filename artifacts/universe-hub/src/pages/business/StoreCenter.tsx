import { useQuery } from "@tanstack/react-query";
import { Store, Search, Star, DollarSign, Package, Loader2, Globe } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";
import { useState } from "react";

export default function StoreCenter() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["business-stores", search],
    queryFn:  () => fetch(`/api/business/stores?search=${search}&limit=50`).then(r => r.json()),
  });
  const stores: Record<string, unknown>[] = data?.data ?? [];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Cửa hàng" subtitle="Quản lý tất cả cửa hàng Universe" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-yellow-500"
              placeholder="Tìm kiếm cửa hàng..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map(s => (
                <div key={s["id"] as string} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-yellow-500/30 transition-all">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-3xl">{(s["logo"] as string) ?? "🏪"}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{s["name"] as string}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">{(s["rating"] as number)?.toFixed(1)}</span>
                        {s["isOnline"] && <span className="ml-2 px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">Online</span>}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{(s["description"] as string) ?? ""}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> ${((s["totalSales"] as number ?? 0) / 1000).toFixed(0)}K doanh số</span>
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {s["productCount"] as number} sản phẩm</span>
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {s["city"] ?? s["country"] as string}</span>
                    <span className={`px-2 py-0.5 rounded-full text-center ${s["isActive"] ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                      {s["isActive"] ? "Hoạt động" : "Đóng cửa"}
                    </span>
                  </div>
                </div>
              ))}
              {stores.length === 0 && (
                <div className="col-span-3 text-center py-12 text-muted-foreground">
                  <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Chưa có cửa hàng nào</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
