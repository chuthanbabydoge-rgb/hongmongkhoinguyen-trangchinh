import { useQuery } from "@tanstack/react-query";
import { BarChart2, TrendingUp, TrendingDown, DollarSign, Building2, Users, Store, Factory, Warehouse, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";

function MetricCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function AnalyticsCenter() {
  const { data, isLoading } = useQuery({
    queryKey: ["business-global-stats"],
    queryFn:  () => fetch("/api/business/stats").then(r => r.json()),
  });
  const { data: dashData } = useQuery({
    queryKey: ["business-dashboard-analytics"],
    queryFn:  () => fetch("/api/business/dashboard").then(r => r.json()),
  });

  const stats = data?.data as Record<string, unknown> | undefined;
  const companies: Record<string, unknown>[] = dashData?.data?.companies ?? [];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Phân tích kinh doanh" subtitle="Tổng quan hệ sinh thái Business" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <MetricCard icon={Building2} label="Tổng công ty"   value={stats?.totalCompanies ?? 0}  color="text-indigo-400" />
                <MetricCard icon={Users}     label="Tổng nhân viên" value={stats?.totalEmployees ?? 0}  color="text-blue-400" />
                <MetricCard icon={DollarSign} label="Tổng doanh thu" value={`$${((stats?.totalRevenue as number ?? 0) / 1000).toFixed(0)}K`} color="text-green-400" />
                <MetricCard icon={Store}     label="Cửa hàng"       value={stats?.totalStores ?? 0}     color="text-yellow-400" />
                <MetricCard icon={Factory}   label="Nhà máy"        value={stats?.totalFactories ?? 0}  color="text-orange-400" />
                <MetricCard icon={Warehouse} label="Kho hàng"       value={stats?.totalWarehouses ?? 0} color="text-red-400" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-indigo-400" /> Top công ty theo doanh thu
                  </h3>
                  <div className="space-y-3">
                    {companies
                      .sort((a, b) => (b["totalRevenue"] as number) - (a["totalRevenue"] as number))
                      .map((c, i) => {
                        const maxRev = Math.max(...companies.map(x => x["totalRevenue"] as number));
                        const pct = maxRev > 0 ? Math.round(((c["totalRevenue"] as number) / maxRev) * 100) : 0;
                        return (
                          <div key={c["id"] as string} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <span className="text-muted-foreground w-4">#{i + 1}</span>
                                <span>{(c["logo"] as string) ?? "🏢"}</span>
                                <span className="text-white truncate max-w-32">{c["name"] as string}</span>
                              </span>
                              <span className="text-green-400 font-medium">${((c["totalRevenue"] as number) / 1000).toFixed(0)}K</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" /> Chỉ số tài chính
                  </h3>
                  <div className="space-y-4">
                    {companies.map(c => (
                      <div key={c["id"] as string} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span>{(c["logo"] as string) ?? "🏢"}</span>
                          <span className="text-sm font-medium text-white truncate">{c["name"] as string}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Doanh thu</p>
                            <p className="text-green-400 font-medium">${((c["totalRevenue"] as number) / 1000).toFixed(0)}K</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Chi phí</p>
                            <p className="text-red-400 font-medium">${((c["totalExpenses"] as number) / 1000).toFixed(0)}K</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Lợi nhuận</p>
                            <p className={`font-medium ${(c["totalProfit"] as number) >= 0 ? "text-indigo-400" : "text-red-400"}`}>
                              ${((c["totalProfit"] as number) / 1000).toFixed(0)}K
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
