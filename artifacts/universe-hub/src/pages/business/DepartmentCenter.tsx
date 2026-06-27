import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Building2, Plus, Users, DollarSign, ArrowLeft, Loader2, Layers } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";

export default function DepartmentCenter() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["business-departments", id],
    queryFn:  () => fetch(`/api/business/companies/${id}/departments`).then(r => r.json()),
    enabled:  !!id,
  });
  const departments: Record<string, unknown>[] = data?.data ?? [];

  const deptColors: Record<string, string> = {
    EXECUTIVE: "bg-purple-500/20 text-purple-300",
    OPERATIONS: "bg-blue-500/20 text-blue-300",
    FINANCE: "bg-green-500/20 text-green-300",
    MARKETING: "bg-pink-500/20 text-pink-300",
    SALES: "bg-orange-500/20 text-orange-300",
    HR: "bg-yellow-500/20 text-yellow-300",
    TECH: "bg-cyan-500/20 text-cyan-300",
    PRODUCTION: "bg-red-500/20 text-red-300",
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Phòng ban" subtitle="Quản lý phòng ban của công ty" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Link href={id ? `/business/companies/${id}` : "/business/companies"}>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map(d => (
                <div key={d["id"] as string} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-indigo-500/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{d["name"] as string}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${deptColors[d["type"] as string] ?? "bg-gray-500/20 text-gray-300"}`}>
                        {d["type"] as string}
                      </span>
                    </div>
                    <Layers className="w-5 h-5 text-indigo-400" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{(d["description"] as string) ?? "Không có mô tả"}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {d["headCount"] as number} thành viên</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> ${((d["budget"] as number ?? 0) / 1000).toFixed(0)}K ngân sách</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${d["isActive"] ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                      {d["isActive"] ? "Hoạt động" : "Tạm dừng"}
                    </span>
                  </div>
                </div>
              ))}
              {departments.length === 0 && (
                <div className="col-span-3 text-center py-12 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Chưa có phòng ban nào</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
