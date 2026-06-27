import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Building2, Plus, Search, Users, TrendingUp, Loader2, Star, Globe } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";
import { useState } from "react";

export default function CompanyCenter() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["business-companies", search],
    queryFn:  () => fetch(`/api/business/companies?search=${search}&limit=50`).then(r => r.json()),
  });

  const companies: Record<string, unknown>[] = data?.data ?? [];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Công ty" subtitle="Quản lý tất cả công ty trong Universe" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500"
                placeholder="Tìm kiếm công ty..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Link href="/business/companies/new">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> Thành lập công ty
              </button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map(c => (
                <Link key={c["id"] as string} href={`/business/companies/${c["id"]}`}>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-indigo-500/40 hover:bg-white/8 transition-all cursor-pointer group">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="text-3xl">{(c["logo"] as string) ?? "🏢"}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">{c["name"] as string}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{c["businessType"] as string} · {c["type"] as string}</p>
                      </div>
                      {c["isVerified"] && <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{(c["description"] as string) ?? "Không có mô tả"}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c["employeeCount"] as number} NV</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Lv.{c["level"] as number}</span>
                      <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {c["country"] as string}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-xs">
                      <span className="text-green-400">+${((c["totalRevenue"] as number ?? 0) / 1000).toFixed(0)}K doanh thu</span>
                      <span className={`px-2 py-0.5 rounded-full ${c["status"] === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                        {c["status"] as string}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              {companies.length === 0 && (
                <div className="col-span-3 text-center py-12 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Chưa có công ty nào. Hãy thành lập công ty đầu tiên!</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
