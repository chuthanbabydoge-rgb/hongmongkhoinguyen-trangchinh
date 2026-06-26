import { useState } from "react";
import { Pickaxe, Trees, Fish, Gem, Wheat, Leaf, RefreshCw } from "lucide-react";
import { Sidebar }   from "@/components/layout/Sidebar";
import { Header }    from "@/components/layout/Header";
import { Button }    from "@/components/ui/button";
import { Badge }     from "@/components/ui/badge";
import { useToast }  from "@/hooks/use-toast";
import { useResourceNodes as useResources, useGather } from "@/hooks/useResources";

const RESOURCE_ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  WOOD:    { icon: <Trees className="w-5 h-5" />,   color: "text-lime-400",   bg: "bg-lime-500/10 border-lime-500/30" },
  STONE:   { icon: <Gem className="w-5 h-5" />,     color: "text-slate-400",  bg: "bg-slate-500/10 border-slate-500/30" },
  IRON:    { icon: <Pickaxe className="w-5 h-5" />, color: "text-gray-400",   bg: "bg-gray-500/10 border-gray-500/30" },
  GOLD:    { icon: <Gem className="w-5 h-5" />,     color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  CRYSTAL: { icon: <Gem className="w-5 h-5" />,     color: "text-cyan-400",   bg: "bg-cyan-500/10 border-cyan-500/30" },
  MAGIC:   { icon: <Gem className="w-5 h-5" />,     color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/30" },
  FOOD:    { icon: <Wheat className="w-5 h-5" />,   color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/30" },
  HERB:    { icon: <Leaf className="w-5 h-5" />,    color: "text-green-400",  bg: "bg-green-500/10 border-green-500/30" },
};

function respawnIn(nextSpawnAt: string | null) {
  if (!nextSpawnAt) return null;
  const diff = new Date(nextSpawnAt).getTime() - Date.now();
  if (diff <= 0) return "Sẵn sàng";
  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function Gathering() {
  const [gathering, setGathering] = useState<string | null>(null);
  const { data: nodes = [], isLoading, refetch } = useResources();
  const gatherMut = useGather();
  const { toast } = useToast();

  async function handleGather(nodeId: string) {
    setGathering(nodeId);
    try {
      const result = await gatherMut.mutateAsync({ nodeId, amount: 1 });
      const res = result as any;
      toast({
        title: "✅ Thu thập thành công!",
        description: `+${res.data?.quantity ?? 1} ${res.data?.resourceType ?? "tài nguyên"}`,
      });
      refetch();
    } catch (e: any) {
      toast({ title: "Thất bại", description: e.message, variant: "destructive" });
    } finally {
      setGathering(null);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime-500/20 flex items-center justify-center">
                <Pickaxe className="w-5 h-5 text-lime-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Thu thập Tài nguyên</h1>
                <p className="text-sm text-muted-foreground">Khai thác tài nguyên từ các điểm trên bản đồ</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />Làm mới
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mr-2" />
              Đang tải điểm khai thác...
            </div>
          ) : (nodes as any[]).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-muted-foreground space-y-3">
              <Pickaxe className="w-12 h-12 opacity-30" />
              <p className="text-lg font-medium">Không có điểm khai thác</p>
              <p className="text-sm">Các điểm khai thác sẽ xuất hiện tự động trên bản đồ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(nodes as any[]).map((node) => {
                const cfg = RESOURCE_ICONS[node.resourceType] ?? RESOURCE_ICONS["STONE"]!;
                const spawn = respawnIn(node.nextSpawnAt);
                const ready = !spawn || spawn === "Sẵn sàng";
                const isGathering = gathering === node.id;

                return (
                  <div
                    key={node.id}
                    className={`border rounded-xl p-5 bg-card/50 transition-all hover:bg-card/80 ${
                      ready ? "border-border/60" : "border-border/30 opacity-70"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${cfg.bg}`}>
                        <span className={cfg.color}>{cfg.icon}</span>
                      </div>
                      <Badge
                        className={`text-xs border ${ready ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-muted/40 text-muted-foreground border-border/30"}`}
                      >
                        {ready ? "Sẵn sàng" : spawn}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-foreground mb-1">{node.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {node.resourceType} • Sản lượng: {node.baseYield ?? 1}–{(node.baseYield ?? 1) * 3}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span>Cấp độ khai thác: {node.requiredLevel ?? 1}</span>
                      {node.worldId && <span className="truncate ml-2">🌍 {node.worldId.slice(0, 8)}</span>}
                    </div>

                    <Button
                      className="w-full"
                      size="sm"
                      variant={ready ? "default" : "outline"}
                      disabled={!ready || isGathering}
                      onClick={() => handleGather(node.id)}
                    >
                      {isGathering ? (
                        <><div className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full mr-2" />Đang khai thác...</>
                      ) : ready ? (
                        <><Pickaxe className="w-3.5 h-3.5 mr-2" />Khai thác</>
                      ) : (
                        "Hồi phục..."
                      )}
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
