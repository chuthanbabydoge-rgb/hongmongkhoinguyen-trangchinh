import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Loader2, Rocket } from "lucide-react";

interface Teleport {
  id: string; name: string; type: string; destinationX: number;
  destinationY: number; cooldown: number; usageCount: number;
  cost: number; isActive: boolean; parcelId?: string;
}

const TYPE_COLORS: Record<string, string> = {
  PUBLIC: "bg-emerald-900/50 text-emerald-300",
  PRIVATE: "bg-blue-900/50 text-blue-300",
  GUILD: "bg-violet-900/50 text-violet-300",
  WORLD: "bg-amber-900/50 text-amber-300",
  PREMIUM: "bg-rose-900/50 text-rose-300",
  EMERGENCY: "bg-red-900/50 text-red-300",
};
const TYPE_ICONS: Record<string, string> = {
  PUBLIC: "🌀", PRIVATE: "🔮", GUILD: "⚔️", WORLD: "🌍", PREMIUM: "💎", EMERGENCY: "🚨",
};

export default function TeleportCenter() {
  const qc = useQueryClient();
  const [using, setUsing] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ success: boolean; data: Teleport[] }>({
    queryKey: ["land", "teleports"],
    queryFn: async () => (await fetch("/api/land/teleports")).json() as Promise<{ success: boolean; data: Teleport[] }>,
  });
  const teleports = data?.data ?? [];

  async function useTeleport(id: string) {
    setUsing(id);
    await fetch(`/api/land/teleports/${id}/use`, { method: "POST" });
    void qc.invalidateQueries({ queryKey: ["land", "teleports"] });
    setUsing(null);
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">🌀 Cổng Dịch chuyển</h1>
            <p className="text-muted-foreground mt-1">Mạng lưới teleport trong Universe Land</p>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
          ) : teleports.length === 0 ? (
            <div className="text-center py-12">
              <Rocket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Không có cổng dịch chuyển</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teleports.map((tp) => (
                <div key={tp.id} className="bg-card border border-white/10 rounded-xl p-5 hover:border-violet-500/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{TYPE_ICONS[tp.type] ?? "🌀"}</span>
                      <div>
                        <h3 className="text-white font-semibold">{tp.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[tp.type] ?? "bg-white/10 text-muted-foreground"}`}>
                          {tp.type}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs ${tp.isActive ? "text-emerald-400" : "text-rose-400"}`}>
                      {tp.isActive ? "✅" : "❌"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-white text-xs font-bold">{tp.usageCount.toLocaleString()}</div>
                      <div className="text-muted-foreground text-xs">Lượt dùng</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-white text-xs font-bold">{Math.floor(tp.cooldown / 60)} phút</div>
                      <div className="text-muted-foreground text-xs">Cooldown</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-emerald-400 text-xs font-bold">{tp.cost > 0 ? tp.cost : "Miễn phí"}</div>
                      <div className="text-muted-foreground text-xs">Chi phí</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    Đích: ({tp.destinationX.toFixed(1)}, {tp.destinationY.toFixed(1)})
                  </div>
                  <button
                    onClick={() => void useTeleport(tp.id)}
                    disabled={!tp.isActive || using === tp.id}
                    className={`w-full text-xs rounded-lg py-2 font-medium transition-colors ${tp.isActive ? "bg-violet-600 hover:bg-violet-700 text-white" : "bg-white/5 text-muted-foreground cursor-not-allowed"}`}
                  >
                    {using === tp.id ? "Đang dịch chuyển..." : "🌀 Dịch chuyển"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
