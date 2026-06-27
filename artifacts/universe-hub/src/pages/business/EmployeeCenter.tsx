import { useQuery } from "@tanstack/react-query";
import { Users, Search, DollarSign, Loader2, Briefcase, Mail } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";
import { useState } from "react";

export default function EmployeeCenter() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["business-employees", search],
    queryFn:  () => fetch(`/api/business/employees?search=${search}&limit=100`).then(r => r.json()),
  });
  const employees: Record<string, unknown>[] = data?.data ?? [];

  const roleColors: Record<string, string> = {
    OWNER: "bg-purple-500/20 text-purple-300",
    CEO: "bg-indigo-500/20 text-indigo-300",
    MANAGER: "bg-blue-500/20 text-blue-300",
    SUPERVISOR: "bg-cyan-500/20 text-cyan-300",
    EMPLOYEE: "bg-green-500/20 text-green-300",
    INTERN: "bg-yellow-500/20 text-yellow-300",
    CONTRACTOR: "bg-orange-500/20 text-orange-300",
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Nhân viên" subtitle="Quản lý toàn bộ nhân sự Universe Business" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500"
              placeholder="Tìm kiếm nhân viên..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            Tổng cộng: {employees.length} nhân viên
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {employees.map(e => (
                <div key={e["id"] as string} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-blue-500/30 transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{e["firstName"] as string} {e["lastName"] as string}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[e["role"] as string] ?? "bg-gray-500/20 text-gray-300"}`}>
                        {e["role"] as string}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {e["email"] && (
                      <p className="flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3" /> {e["email"] as string}
                      </p>
                    )}
                    <p className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> ${(e["salary"] as number).toLocaleString()} / {e["salaryPeriod"] as string}
                    </p>
                    <p className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      <span className={`px-1.5 py-0.5 rounded-full ${e["employmentStatus"] === "ACTIVE" ? "text-green-400" : "text-red-400"}`}>
                        {e["employmentStatus"] as string}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
              {employees.length === 0 && (
                <div className="col-span-4 text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Chưa có nhân viên nào</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
