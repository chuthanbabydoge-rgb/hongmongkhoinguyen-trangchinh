import { useQuery } from "@tanstack/react-query";
import { DollarSign, Users, CheckCircle, Clock, XCircle, Loader2, CreditCard } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";
import { useQuery as useGlobalQuery } from "@tanstack/react-query";

function PayrollList({ companyId }: { companyId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["business-payrolls", companyId],
    queryFn:  () => fetch(`/api/business/companies/${companyId}/payroll`).then(r => r.json()),
  });
  const payrolls: Record<string, unknown>[] = data?.data ?? [];

  const statusIcon = (s: string) => {
    if (s === "COMPLETED") return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (s === "PENDING")   return <Clock className="w-4 h-4 text-yellow-400" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  return (
    <div className="space-y-2">
      {payrolls.map(p => (
        <div key={p["id"] as string} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg hover:border-indigo-500/30 transition-all">
          <CreditCard className="w-8 h-8 text-indigo-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white">{p["name"] as string}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(p["periodStart"] as string).toLocaleDateString("vi-VN")} — {new Date(p["periodEnd"] as string).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-white">${((p["totalAmount"] as number ?? 0)).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <Users className="w-3 h-3" /> {p["employeeCount"] as number} NV
            </p>
          </div>
          <div className="flex items-center gap-1">
            {statusIcon(p["status"] as string)}
            <span className="text-xs text-muted-foreground">{p["status"] as string}</span>
          </div>
        </div>
      ))}
      {payrolls.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Chưa có bảng lương nào</p>
      )}
    </div>
  );
}

export default function PayrollCenter() {
  const { data: companiesData } = useGlobalQuery({
    queryKey: ["business-companies-list"],
    queryFn:  () => fetch("/api/business/companies?limit=20").then(r => r.json()),
  });
  const companies: Record<string, unknown>[] = companiesData?.data ?? [];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Bảng lương" subtitle="Quản lý lương và payroll tất cả công ty" />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          {companies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có công ty nào</p>
            </div>
          ) : (
            companies.map(company => (
              <div key={company["id"] as string} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{(company["logo"] as string) ?? "🏢"}</span>
                  <h3 className="font-semibold text-white">{company["name"] as string}</h3>
                </div>
                <PayrollList companyId={company["id"] as string} />
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
