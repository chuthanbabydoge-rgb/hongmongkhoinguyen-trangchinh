import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingDown, Loader2, ArrowDownRight } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";

function CompanyExpenses({ company }: { company: Record<string, unknown> }) {
  const { data, isLoading } = useQuery({
    queryKey: ["business-transactions-expenses", company["id"]],
    queryFn:  () => fetch(`/api/business/companies/${company["id"]}/transactions?type=EXPENSE&limit=10`).then(r => r.json()),
  });
  const txs: Record<string, unknown>[] = data?.data ?? [];

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{(company["logo"] as string) ?? "🏢"}</span>
          <h3 className="font-semibold text-white">{company["name"] as string}</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Tổng chi phí</p>
          <p className="text-lg font-bold text-red-400">${((company["totalExpenses"] as number ?? 0) / 1000).toFixed(0)}K</p>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-red-400" /></div>
      ) : (
        <div className="space-y-2">
          {txs.map(tx => (
            <div key={tx["id"] as string} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{tx["description"] as string}</p>
                <p className="text-xs text-muted-foreground">{new Date(tx["createdAt"] as string).toLocaleDateString("vi-VN")}</p>
              </div>
              <span className="text-sm font-semibold text-red-400">-${(tx["amount"] as number).toLocaleString()}</span>
            </div>
          ))}
          {txs.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Không có giao dịch chi phí</p>}
        </div>
      )}
    </div>
  );
}

export default function ExpensePage() {
  const { data: companiesData } = useQuery({
    queryKey: ["business-companies-expenses"],
    queryFn:  () => fetch("/api/business/companies?limit=20").then(r => r.json()),
  });
  const companies: Record<string, unknown>[] = companiesData?.data ?? [];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Chi phí" subtitle="Theo dõi chi phí từng công ty" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {companies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có dữ liệu chi phí</p>
            </div>
          ) : (
            <div className="space-y-6">
              {companies.map(c => <CompanyExpenses key={c["id"] as string} company={c} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
