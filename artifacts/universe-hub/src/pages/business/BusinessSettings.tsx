import { useQuery } from "@tanstack/react-query";
import { Settings, Building2, Loader2, Save } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";
import { useState } from "react";

export default function BusinessSettings() {
  const { data: companiesData } = useQuery({
    queryKey: ["business-companies-settings"],
    queryFn:  () => fetch("/api/business/companies?limit=20").then(r => r.json()),
  });
  const companies: Record<string, unknown>[] = companiesData?.data ?? [];
  const [selectedId, setSelectedId] = useState<string>("");

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["business-settings", selectedId],
    queryFn:  () => fetch(`/api/business/companies/${selectedId}/settings`).then(r => r.json()),
    enabled:  !!selectedId,
  });
  const settings = settingsData?.data as Record<string, unknown> | undefined;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Cài đặt doanh nghiệp" subtitle="Cấu hình thông số cho từng công ty" />
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

          {selectedId && (
            isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
            ) : settings ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-400" /> Cài đặt công ty
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "currency", label: "Tiền tệ", value: settings["currency"] as string },
                    { key: "timezone", label: "Múi giờ", value: settings["timezone"] as string },
                  ].map(item => (
                    <div key={item.key}>
                      <label className="text-xs text-muted-foreground block mb-1">{item.label}</label>
                      <input
                        readOnly
                        className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                        value={item.value}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: "allowPublicReviews",   label: "Cho phép đánh giá công khai" },
                    { key: "allowPublicEmployees", label: "Hiển thị nhân viên công khai" },
                    { key: "autoPayroll",           label: "Tự động xử lý bảng lương" },
                    { key: "notifyOnHire",          label: "Thông báo khi tuyển dụng" },
                    { key: "notifyOnFire",          label: "Thông báo khi sa thải" },
                    { key: "notifyOnPayroll",       label: "Thông báo khi trả lương" },
                  ].map(item => (
                    <div key={item.key} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center ${settings[item.key] ? "bg-green-500" : "bg-gray-500"}`}>
                        {settings[item.key] && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Chưa có cài đặt cho công ty này</p>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}
