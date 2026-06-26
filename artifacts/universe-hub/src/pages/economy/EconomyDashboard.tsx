import { Link }    from "wouter";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Sidebar }  from "@/components/layout/Sidebar";
import { Header }   from "@/components/layout/Header";
import { Button }   from "@/components/ui/button";
import { useEconomy, useFluctuatePrices } from "@/hooks/useEconomy";

const RESOURCE_ICONS: Record<string, string> = {
  WOOD: "🪵", STONE: "🪨", IRON: "⚙️", GOLD: "🥇",
  CRYSTAL: "💎", MAGIC: "✨", FOOD: "🌾", HERB: "🌿",
};

export default function EconomyDashboard() {
  const { data, isLoading } = useEconomy();
  const fluctuate = useFluctuatePrices();
  const stats  = (data as any)?.stats;
  const prices = (data as any)?.prices ?? [];

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📊</div>
              <div>
                <h1 className="text-xl font-bold text-white">Universe Economy</h1>
                <p className="text-sm text-muted-foreground">Thống kê kinh tế hôm nay</p>
              </div>
            </div>
            <Button size="sm" className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30"
              disabled={fluctuate.isPending}
              onClick={() => fluctuate.mutate()}>
              📈 Biến động giá
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground py-12">Đang tải...</div>
          ) : (
            <>
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Đã chế tạo",     value: stats.totalCrafted,  icon: "⚒️" },
                    { label: "Thu thập",         value: stats.totalGathered, icon: "⛏️" },
                    { label: "Mua NPC",          value: stats.totalNpcBuys,  icon: "🛒" },
                    { label: "Bán NPC",          value: stats.totalNpcSells, icon: "💰" },
                    { label: "Credits chi",      value: stats.creditsSpent,  icon: "📉" },
                    { label: "Credits nhận",     value: stats.creditsEarned, icon: "📈" },
                    { label: "Giao dịch",        value: stats.totalTraded,   icon: "🔄" },
                  ].map(s => (
                    <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="text-xl mb-2">{s.icon}</div>
                      <div className="text-2xl font-bold text-white">{s.value.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Giá thị trường tài nguyên</h2>
                  <Link href="/economy/prices"><Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Xem chi tiết →</Button></Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {prices.map((p: any) => (
                    <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{RESOURCE_ICONS[p.resourceType] ?? "📦"}</span>
                        <span className="text-xs text-muted-foreground">{p.resourceType}</span>
                      </div>
                      <div className="text-xl font-bold text-white">{p.price} 💰</div>
                      <div className={`text-xs flex items-center gap-1 mt-1 ${p.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {p.change >= 0 ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                        {p.change >= 0 ? "+" : ""}{p.change.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
