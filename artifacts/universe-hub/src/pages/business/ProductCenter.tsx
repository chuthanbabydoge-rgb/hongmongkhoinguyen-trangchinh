import { useQuery } from "@tanstack/react-query";
import { Package, Search, Star, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";
import { useState } from "react";

export default function ProductCenter() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["business-products", search],
    queryFn:  () => fetch(`/api/business/products?search=${search}&limit=60`).then(r => r.json()),
  });
  const products: Record<string, unknown>[] = data?.data ?? [];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Sản phẩm" subtitle="Danh mục sản phẩm toàn hệ thống" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-purple-500"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="text-xs text-muted-foreground">Tổng cộng: {products.length} sản phẩm</div>

          {isLoading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(p => (
                <div key={p["id"] as string} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Package className="w-5 h-5 text-purple-400" />
                    </div>
                    {p["isFeatured"] && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">Nổi bật</span>
                    )}
                  </div>
                  <h3 className="font-medium text-white text-sm mb-1 truncate">{p["name"] as string}</h3>
                  {p["sku"] && <p className="text-xs text-muted-foreground mb-2">SKU: {p["sku"] as string}</p>}
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Giá:</span>
                      <span className="text-white font-medium">${(p["price"] as number).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><Package className="w-3 h-3" /> Kho:</span>
                      <span className={p["stock"] as number > 0 ? "text-green-400" : "text-red-400"}>{p["stock"] as number}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> Đánh giá:</span>
                      <span>{(p["rating"] as number)?.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Đã bán:</span>
                      <span>{p["totalSold"] as number}</span>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="col-span-4 text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Chưa có sản phẩm nào</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
