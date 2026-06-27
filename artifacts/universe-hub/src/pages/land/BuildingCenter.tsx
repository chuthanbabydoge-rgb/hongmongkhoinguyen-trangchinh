import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface Building {
  id: string; name: string; parcelId: string; ownerId: string;
  type: string; status: string; level: number; health: number;
  maxHealth: number; value: number; incomeRate: number;
}

interface Template {
  id: string; name: string; type: string; buildCost: number;
  buildTime: number; maxLevel: number; icon: string;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-900/60 text-emerald-300",
  UNDER_CONSTRUCTION: "bg-amber-900/60 text-amber-300",
  DAMAGED: "bg-orange-900/60 text-orange-300",
  ABANDONED: "bg-muted text-muted-foreground",
  DESTROYED: "bg-red-900/60 text-red-300",
};

type Tab = "buildings" | "templates";

export default function BuildingCenter() {
  const [tab, setTab] = useState<Tab>("buildings");

  const { data: buildData, isLoading: loadingBuildings } = useQuery<{ success: boolean; data: Building[] }>({
    queryKey: ["land", "buildings"],
    queryFn: async () => (await fetch("/api/land/buildings?limit=50")).json() as Promise<{ success: boolean; data: Building[] }>,
  });

  const { data: tmplData, isLoading: loadingTemplates } = useQuery<{ success: boolean; data: Template[] }>({
    queryKey: ["land", "templates"],
    queryFn: async () => (await fetch("/api/land/templates")).json() as Promise<{ success: boolean; data: Template[] }>,
  });

  const buildings = buildData?.data ?? [];
  const templates = tmplData?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Building2 className="w-6 h-6 text-amber-400" />Trung tâm Công trình</h1>
            <p className="text-muted-foreground mt-1">Quản lý công trình và mẫu thiết kế</p>
          </div>

          <div className="flex gap-2">
            {([["buildings", "Công trình"], ["templates", "Mẫu thiết kế"]] as [Tab, string][]).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === k ? "bg-amber-600 text-white" : "bg-muted/40 text-muted-foreground hover:bg-muted/60"}`}
              >{label}</button>
            ))}
          </div>

          {tab === "buildings" && (
            loadingBuildings ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {buildings.map((b) => (
                    <div key={b.id} className="bg-card border border-white/10 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-semibold">{b.name}</h3>
                          <p className="text-muted-foreground text-xs mt-0.5">{b.type}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[b.status] ?? "bg-muted text-muted-foreground"}`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>HP: {b.health}/{b.maxHealth}</span>
                          <span>Lv.{b.level}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${(b.health / b.maxHealth) * 100}%` }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-muted/40 rounded-lg p-2 text-center">
                          <div className="text-emerald-400 text-xs font-bold">{b.value.toLocaleString()}</div>
                          <div className="text-muted-foreground text-xs">Giá trị</div>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-2 text-center">
                          <div className="text-blue-400 text-xs font-bold">{b.incomeRate}/h</div>
                          <div className="text-muted-foreground text-xs">Thu nhập</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs rounded-lg py-1.5 transition-colors">Nâng cấp</button>
                        <button className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-300 text-xs rounded-lg py-1.5 transition-colors">Phá dỡ</button>
                      </div>
                    </div>
                  ))}
                </div>
                {buildings.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">Không có công trình nào</div>
                )}
              </>
            )
          )}

          {tab === "templates" && (
            loadingTemplates ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {templates.map((t) => (
                  <div key={t.id} className="bg-card border border-white/10 rounded-xl p-4 hover:border-amber-500/50 transition-colors text-center">
                    <div className="text-4xl mb-2">{t.icon}</div>
                    <h3 className="text-white font-semibold">{t.name}</h3>
                    <p className="text-muted-foreground text-xs mb-3">{t.type}</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>Phí xây: <span className="text-emerald-400">{t.buildCost.toLocaleString()}</span></div>
                      <div>Thời gian: <span className="text-blue-400">{Math.floor(t.buildTime / 60)} phút</span></div>
                      <div>Max Lv: <span className="text-amber-400">{t.maxLevel}</span></div>
                    </div>
                    <button className="mt-3 w-full bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-lg py-1.5 transition-colors">
                      Chọn mẫu này
                    </button>
                  </div>
                ))}
                {templates.length === 0 && (
                  <div className="col-span-4 text-center py-12 text-muted-foreground">Chưa có mẫu thiết kế</div>
                )}
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}
