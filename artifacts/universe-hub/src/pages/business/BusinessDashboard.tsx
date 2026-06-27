import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Building2, Users, Store, Factory, Warehouse, Package, TrendingUp, DollarSign, ArrowRight, Loader2, BarChart2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function BusinessDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["business-dashboard"],
    queryFn: () => fetch("/api/business/dashboard").then(r => r.json()),
  });

  const stats = data?.data?.globalStats;
  const companies = data?.data?.companies ?? [];
  const stores    = data?.data?.stores    ?? [];
  const brands    = data?.data?.brands    ?? [];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Universe Business" subtitle="Trung tâm điều hành doanh nghiệp" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard icon={Building2} label="Công ty"      value={stats?.totalCompanies  ?? 0} color="bg-indigo-500/20" />
                <StatCard icon={Users}     label="Nhân viên"    value={stats?.totalEmployees  ?? 0} color="bg-blue-500/20" />
                <StatCard icon={DollarSign} label="Doanh thu"   value={`$${((stats?.totalRevenue ?? 0) / 1000).toFixed(0)}K`} color="bg-green-500/20" />
                <StatCard icon={Store}     label="Cửa hàng"     value={stats?.totalStores     ?? 0} color="bg-yellow-500/20" />
                <StatCard icon={Factory}   label="Nhà máy"      value={stats?.totalFactories  ?? 0} color="bg-orange-500/20" />
                <StatCard icon={Warehouse} label="Kho hàng"     value={stats?.totalWarehouses ?? 0} color="bg-red-500/20" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400" /> Công ty nổi bật
                    </h3>
                    <Link href="/business/companies" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      Tất cả <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {companies.map((c: Record<string, unknown>) => (
                      <Link key={c["id"] as string} href={`/business/companies/${c["id"]}`}>
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                          <span className="text-2xl">{(c["logo"] as string) ?? "🏢"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{c["name"] as string}</p>
                            <p className="text-xs text-muted-foreground">{c["businessType"] as string} · Lv.{c["level"] as number}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-green-400">${((c["totalRevenue"] as number ?? 0) / 1000).toFixed(0)}K</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Store className="w-4 h-4 text-yellow-400" /> Cửa hàng & Thương hiệu
                    </h3>
                    <Link href="/business/stores" className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
                      Tất cả <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="space-y-2 mb-4">
                    {stores.slice(0, 3).map((s: Record<string, unknown>) => (
                      <div key={s["id"] as string} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <span className="text-lg">{(s["logo"] as string) ?? "🏪"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{s["name"] as string}</p>
                          <p className="text-xs text-muted-foreground">⭐ {(s["rating"] as number)?.toFixed(1)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <p className="text-xs text-muted-foreground mb-2">Thương hiệu</p>
                    <div className="flex flex-wrap gap-2">
                      {brands.map((b: Record<string, unknown>) => (
                        <span key={b["id"] as string} className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full text-xs">
                          {(b["logo"] as string) ?? "🏷️"} {b["name"] as string}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { href: "/business/companies", icon: Building2, label: "Quản lý Công ty",  color: "text-indigo-400", bg: "bg-indigo-500/10 hover:bg-indigo-500/20" },
                  { href: "/business/employees", icon: Users,     label: "Nhân viên",         color: "text-blue-400",   bg: "bg-blue-500/10 hover:bg-blue-500/20" },
                  { href: "/business/stores",    icon: Store,     label: "Cửa hàng",          color: "text-yellow-400", bg: "bg-yellow-500/10 hover:bg-yellow-500/20" },
                  { href: "/business/analytics", icon: BarChart2, label: "Phân tích",         color: "text-green-400",  bg: "bg-green-500/10 hover:bg-green-500/20" },
                ].map(item => (
                  <Link key={item.href} href={item.href}>
                    <div className={`${item.bg} border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors`}>
                      <item.icon className={`w-8 h-8 ${item.color}`} />
                      <span className="text-sm font-medium text-white text-center">{item.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
