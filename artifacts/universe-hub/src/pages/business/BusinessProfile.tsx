import { useQuery } from "@tanstack/react-query";
import { Building2, Users, Star, Globe, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";
import { useState } from "react";

export default function BusinessProfile() {
  const { data: companiesData } = useQuery({
    queryKey: ["business-companies-profile"],
    queryFn:  () => fetch("/api/business/companies?limit=20").then(r => r.json()),
  });
  const companies: Record<string, unknown>[] = companiesData?.data ?? [];
  const [selectedId, setSelectedId] = useState<string>("");

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["business-profile", selectedId],
    queryFn:  () => fetch(`/api/business/companies/${selectedId}/profile`).then(r => r.json()),
    enabled:  !!selectedId,
  });
  const profile = profileData?.data as Record<string, unknown> | undefined;
  const company = companies.find(c => c["id"] === selectedId);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Hồ sơ công ty" subtitle="Thông tin chi tiết về doanh nghiệp" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <label className="text-sm text-muted-foreground block mb-2">Chọn công ty</label>
            <select
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
            >
              <option value="">-- Chọn công ty --</option>
              {companies.map(c => (
                <option key={c["id"] as string} value={c["id"] as string}>{c["name"] as string}</option>
              ))}
            </select>
          </div>

          {selectedId && company && (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <span className="text-5xl">{(company["logo"] as string) ?? "🏢"}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      {company["name"] as string}
                      {company["isVerified"] && <Star className="w-5 h-5 text-yellow-400" />}
                    </h2>
                    <p className="text-muted-foreground mt-1">{(company["description"] as string) ?? ""}</p>
                    <div className="flex gap-3 mt-3 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Globe className="w-3 h-3" /> {company["country"] as string}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" /> {company["employeeCount"] as number} nhân viên
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full">
                        Level {company["level"] as number}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
              ) : profile ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                  {[
                    { label: "Sứ mệnh", value: profile["mission"] },
                    { label: "Tầm nhìn", value: profile["vision"] },
                    { label: "Giá trị cốt lõi", value: profile["values"] },
                    { label: "Lịch sử", value: profile["history"] },
                    { label: "Văn hoá", value: profile["culture"] },
                  ].map(item => (
                    item.value ? (
                      <div key={item.label}>
                        <h4 className="text-sm font-medium text-white mb-1">{item.label}</h4>
                        <p className="text-sm text-muted-foreground">{item.value as string}</p>
                      </div>
                    ) : null
                  ))}
                  {!profile["mission"] && !profile["vision"] && (
                    <p className="text-xs text-muted-foreground">Hồ sơ chưa có thông tin chi tiết</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Chưa có hồ sơ công ty</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
