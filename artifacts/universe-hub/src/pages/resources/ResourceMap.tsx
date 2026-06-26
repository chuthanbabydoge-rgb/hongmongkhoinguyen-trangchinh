import { Sidebar }       from "@/components/layout/Sidebar";
import { Header }        from "@/components/layout/Header";
import { Badge }         from "@/components/ui/badge";
import { Button }        from "@/components/ui/button";
import { useResourceNodes, useGather } from "@/hooks/useResources";
import type { ResourceNode } from "@/services/craftingService";

const TYPE_ICONS: Record<string, string> = {
  WOOD: "🪵", STONE: "🪨", IRON: "⚙️", GOLD: "🥇",
  CRYSTAL: "💎", MAGIC: "✨", FOOD: "🌾", HERB: "🌿",
};
const TYPE_COLORS: Record<string, string> = {
  WOOD:    "border-green-500/30 bg-green-500/5",
  STONE:   "border-gray-500/30 bg-gray-500/5",
  IRON:    "border-slate-500/30 bg-slate-500/5",
  GOLD:    "border-yellow-500/30 bg-yellow-500/5",
  CRYSTAL: "border-cyan-500/30 bg-cyan-500/5",
  MAGIC:   "border-purple-500/30 bg-purple-500/5",
  FOOD:    "border-amber-500/30 bg-amber-500/5",
  HERB:    "border-emerald-500/30 bg-emerald-500/5",
};

export default function ResourceMap() {
  const { data: nodes = [], isLoading } = useResourceNodes();
  const gather = useGather();

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🗺️</div>
            <div>
              <h1 className="text-xl font-bold text-white">Bản đồ tài nguyên</h1>
              <p className="text-sm text-muted-foreground">{(nodes as ResourceNode[]).length} điểm khai thác</p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground py-12">Đang tải...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(nodes as ResourceNode[]).map(node => {
                const pct = node.maxAmount > 0 ? (node.currentAmount / node.maxAmount) * 100 : 0;
                return (
                  <div key={node.id} className={`border rounded-xl p-4 ${TYPE_COLORS[node.resourceType] ?? "border-white/10 bg-white/5"}`}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{TYPE_ICONS[node.resourceType] ?? "📦"}</span>
                        <div>
                          <div className="font-medium text-white text-sm">{node.name}</div>
                          <div className="text-xs text-muted-foreground">{node.resourceType}</div>
                        </div>
                      </div>
                      <Badge className={pct > 50 ? "bg-green-500/20 text-green-400 border-green-500/30" : pct > 20 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                        {Math.round(pct)}%
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{node.currentAmount}/{node.maxAmount}</span>
                        <span>Hồi phục: {node.respawnTime}s</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-current rounded-full transition-all" style={{ width: `${pct}%`, color: pct > 50 ? "#4ade80" : pct > 20 ? "#facc15" : "#f87171" }}/>
                      </div>
                    </div>

                    <Button size="sm" className="w-full"
                      disabled={node.currentAmount === 0 || gather.isPending}
                      onClick={() => gather.mutate({ nodeId: node.id, amount: 1 })}>
                      ⛏️ Thu thập
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
