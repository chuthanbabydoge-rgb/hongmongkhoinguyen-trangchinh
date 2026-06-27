import { useQuery } from "@tanstack/react-query";
import { BarChart2, Building2, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";

export default function StatisticsPage() {
  const { data: companiesData } = useQuery({
    queryKey: ["business-companies-stats"],
    queryFn:  () => fetch("/api/business/companies?limit=20").then(r => r.json()),
  });
  const companies: Record<string, unknown>[] = companiesData?.data ?? [];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Thống kê" subtitle="Thống kê chi tiết theo từng công ty" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {companies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có dữ liệu</p>
            </div>
          ) : (
            <div className="space-y-4">
              {companies.map(company => (
                <CompanyStats key={company["id"] as string} company={company} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function CompanyStats({ company }: { company: Record<string, unknown> }) {
  const { data, isLoading } = useQuery({
    queryKey: ["business-company-statistics", company["id"]],
    queryFn:  () => fetch(`/api/business/companies/${company["id"]}/statistics`).then(r => r.json()),
  });
  const s = data?.data as Record<string, unknown> | undefined;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{(company["logo"] as string) ?? "🏢"}</span>
        <h3 className="font-semibold text-white">{company["name"] as string}</h3>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
      ) : s ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "Nhân viên",    value: s["totalEmployees"] },
            { label: "Phòng ban",   value: s["totalDepartments"] },
            { label: "Cửa hàng",    value: s["totalStores"] },
            { label: "Kho hàng",    value: s["totalWarehouses"] },
            { label: "Nhà máy",     value: s["totalFactories"] },
            { label: "Sản phẩm",    value: s["totalProducts"] },
          ].map(item => (
            <div key={item.label} className="p-3 bg-white/5 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className="text-lg font-bold text-white">{item.value as number}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Chưa có dữ liệu thống kê</p>
      )}
    </div>
  );
}
