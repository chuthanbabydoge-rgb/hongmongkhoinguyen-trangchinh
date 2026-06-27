import { useQuery } from "@tanstack/react-query";
import { Tag, Star, Package, Users, Search, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";
import { useState } from "react";

export default function BrandCenter() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["business-brands", search],
    queryFn:  () => fetch(`/api/business/brands?search=${search}&limit=50`).then(r => r.json()),
  });
  const brands: Record<string, unknown>[] = data?.data ?? [];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Thương hiệu" subtitle="Quản lý tất cả thương hiệu Universe" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-pink-500"
              placeholder="Tìm kiếm thương hiệu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-pink-400" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {brands.map(b => (
                <div key={b["id"] as string} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-pink-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{(b["logo"] as string) ?? "🏷️"}</span>
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="font-semibold text-white">{b["name"] as string}</h3>
                        {b["isVerified"] && <Star className="w-3 h-3 text-yellow-400" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{b["type"] as string}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{(b["description"] as string) ?? ""}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {(b["rating"] as number)?.toFixed(1)}</span>
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {b["productCount"] as number} SP</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {b["followerCount"] as number} theo dõi</span>
                    <span className={`px-2 py-0.5 rounded-full text-center ${b["isActive"] ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                      {b["isActive"] ? "Hoạt động" : "Tạm dừng"}
                    </span>
                  </div>
                </div>
              ))}
              {brands.length === 0 && (
                <div className="col-span-4 text-center py-12 text-muted-foreground">
                  <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Chưa có thương hiệu nào</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
