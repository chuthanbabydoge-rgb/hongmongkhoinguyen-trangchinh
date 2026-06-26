import { TrendingUp, TrendingDown } from "lucide-react";
import { Sidebar }  from "@/components/layout/Sidebar";
import { Header }   from "@/components/layout/Header";
import { Button }   from "@/components/ui/button";
import { usePrices, useFluctuatePrices } from "@/hooks/useEconomy";

const RESOURCE_ICONS: Record<string, string> = {
  WOOD: "🪵", STONE: "🪨", IRON: "⚙️", GOLD: "🥇",
  CRYSTAL: "💎", MAGIC: "✨", FOOD: "🌾", HERB: "🌿",
};

export default function MarketPrices() {
  const { data: prices = [], isLoading } = usePrices();
  const fluctuate = useFluctuatePrices();

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📈</div>
              <div>
                <h1 className="text-xl font-bold text-white">Giá thị trường</h1>
                <p className="text-sm text-muted-foreground">Cập nhật tự động mỗi 10 giây</p>
              </div>
            </div>
            <Button size="sm" className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30"
              disabled={fluctuate.isPending}
              onClick={() => fluctuate.mutate()}>
              🔄 Biến động
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground py-12">Đang tải...</div>
          ) : (
            <div className="space-y-2">
              {(prices as any[]).map(p => (
                <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                  <span className="text-2xl w-8 text-center">{RESOURCE_ICONS[p.resourceType] ?? "📦"}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{p.resourceType}</div>
                    <div className="text-xs text-muted-foreground">Cập nhật: {new Date(p.updatedAt).toLocaleTimeString("vi-VN")}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{p.price} 💰</div>
                    <div className={`text-xs flex items-center gap-1 justify-end ${p.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {p.change >= 0 ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                      {p.change >= 0 ? "+" : ""}{p.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
