import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Building2, Users, Package, Store, Warehouse, Factory, DollarSign, Star, Settings, ArrowLeft, Loader2, TrendingUp } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["business-company", id],
    queryFn:  () => fetch(`/api/business/companies/${id}`).then(r => r.json()),
    enabled:  !!id,
  });
  const { data: stats } = useQuery({
    queryKey: ["business-company-stats", id],
    queryFn:  () => fetch(`/api/business/companies/${id}/statistics`).then(r => r.json()),
    enabled:  !!id,
  });

  const company = data?.data as Record<string, unknown> | undefined;
  const s = stats?.data as Record<string, unknown> | undefined;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={company ? (company["name"] as string) : "Chi tiết công ty"} subtitle="Thông tin tổng quan công ty" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <Link href="/business/companies">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
          </Link>

          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : company ? (
            <>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <span className="text-5xl">{(company["logo"] as string) ?? "🏢"}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-white">{company["name"] as string}</h2>
                      {company["isVerified"] && <Star className="w-5 h-5 text-yellow-400" />}
                    </div>
                    <p className="text-muted-foreground mt-1">{(company["description"] as string) ?? "Không có mô tả"}</p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs">{company["businessType"] as string}</span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">{company["type"] as string}</span>
                      <span className={`px-3 py-1 rounded-full text-xs ${company["status"] === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                        {company["status"] as string}
                      </span>
                    </div>
                  </div>
                  <Link href={`/business/companies/${id}/settings`}>
                    <button className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                      <Settings className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
              </div>

              {s && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: DollarSign, label: "Doanh thu",  value: `$${((s["totalRevenue"] as number ?? 0) / 1000).toFixed(0)}K`, color: "text-green-400" },
                    { icon: DollarSign, label: "Chi phí",    value: `$${((s["totalExpenses"] as number ?? 0) / 1000).toFixed(0)}K`, color: "text-red-400" },
                    { icon: TrendingUp, label: "Lợi nhuận",  value: `$${((s["totalProfit"] as number ?? 0) / 1000).toFixed(0)}K`, color: "text-indigo-400" },
                    { icon: Users,      label: "Nhân viên",  value: s["totalEmployees"] as number ?? 0, color: "text-blue-400" },
                  ].map(item => (
                    <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <item.icon className={`w-5 h-5 ${item.color} mb-2`} />
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-xl font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { href: `/business/companies/${id}/departments`, icon: Building2, label: "Phòng ban" },
                  { href: `/business/companies/${id}/employees`,   icon: Users,     label: "Nhân viên" },
                  { href: `/business/companies/${id}/stores`,      icon: Store,     label: "Cửa hàng" },
                  { href: `/business/companies/${id}/warehouses`,  icon: Warehouse, label: "Kho hàng" },
                  { href: `/business/companies/${id}/factories`,   icon: Factory,   label: "Nhà máy" },
                  { href: `/business/companies/${id}/products`,    icon: Package,   label: "Sản phẩm" },
                ].map(item => (
                  <Link key={item.href} href={item.href}>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-indigo-500/40 hover:bg-white/8 transition-all cursor-pointer">
                      <item.icon className="w-6 h-6 text-indigo-400" />
                      <span className="text-xs font-medium text-white">{item.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-center py-12">Không tìm thấy công ty</p>
          )}
        </main>
      </div>
    </div>
  );
}
