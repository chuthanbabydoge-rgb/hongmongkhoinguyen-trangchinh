import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMounts, useMountRoutes, useMountTravelLogs, useTravelMount } from "@/hooks/useMounts";
import { Globe, MapPin, Clock, Zap } from "lucide-react";

const TYPE_ICONS: Record<string, string> = {
  HORSE: "🐴", WOLF: "🐺", DRAGON: "🐉", PHOENIX: "🦅", TIGER: "🐯", MECH: "🤖",
};

export default function MountTravel() {
  const { data: mounts = [] }    = useMounts();
  const { data: routes = [] }    = useMountRoutes();
  const { data: travelLogs = [] }= useMountTravelLogs();
  const travelMount = useTravelMount();
  const [selectedMount, setSelectedMount] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mountList = mounts as Record<string, unknown>[];
  const routeList = routes as Record<string, unknown>[];
  const logList   = travelLogs as Record<string, unknown>[];

  const handleTravel = (routeId: string) => {
    if (!selectedMount) return;
    setError(null); setLastResult(null);
    travelMount.mutate({ mountId: selectedMount, routeId }, {
      onSuccess: (data) => {
        const d = data as { ok: boolean; data: Record<string, unknown>; error?: string };
        if (d.ok) {
          const log = d.data;
          setLastResult(`🗺️ Khởi hành đến ${log.destination as string}! (${Math.floor((log.duration as number) / 60)} phút)`);
        } else {
          setError(d.error ?? "Du hành thất bại");
        }
      },
    });
  };

  const activeMounts = mountList.filter(m => m.status !== "TRAVELING");
  const selectedMountData = mountList.find(m => m.id === selectedMount);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="text-primary" />
        <h1 className="text-2xl font-bold">🗺️ Du hành với Mount</h1>
      </div>

      {lastResult && (
        <Card className="border-purple-500/30 bg-purple-500/10">
          <CardContent className="pt-3 pb-3 text-sm text-purple-300">{lastResult}</CardContent>
        </Card>
      )}
      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="pt-3 pb-3 text-sm text-red-400">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mount Selector */}
        <div className="space-y-3">
          <h2 className="font-semibold">🐴 Chọn Mount</h2>
          {activeMounts.length === 0 && (
            <div className="text-muted-foreground text-sm p-4">
              Không có mount sẵn sàng. Mua mount trong Chuồng ngựa.
            </div>
          )}
          {activeMounts.map(mount => {
            const staminaPct = Math.round(((mount.stamina as number) / (mount.maxStamina as number)) * 100);
            return (
              <button key={mount.id as string}
                onClick={() => { setSelectedMount(mount.id as string); setLastResult(null); setError(null); }}
                className={`w-full flex items-center gap-3 p-3 rounded border text-left transition-colors ${selectedMount === mount.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                <span className="text-2xl">{TYPE_ICONS[mount.type as string] ?? "🐴"}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{mount.name as string}</div>
                  <div className="text-xs text-muted-foreground">Lv.{mount.level as number} · Speed {mount.speed as number}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-muted-foreground">Stamina</span>
                    <Progress value={staminaPct} className="h-1 flex-1" />
                    <span className="text-xs text-muted-foreground">{mount.stamina as number}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Routes */}
        <div className="space-y-3">
          <h2 className="font-semibold">🗺️ Tuyến đường</h2>
          {routeList.length === 0 && (
            <div className="text-muted-foreground text-sm">Chưa có tuyến đường nào</div>
          )}
          {routeList.map(route => {
            const durationMin = Math.floor((route.baseDuration as number) / 60);
            const actualMin   = selectedMountData
              ? Math.floor((route.baseDuration as number) / ((selectedMountData.speed as number) / 100))
              : durationMin;
            return (
              <Card key={route.id as string} className="border-border/50">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{route.name as string}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin size={10} /> {route.origin as string} → {route.destination as string}
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span>📏 {route.distance as number} km</span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {selectedMountData ? actualMin : durationMin} phút
                        </span>
                        <span className="text-yellow-400">✨ {route.xpReward as number} XP</span>
                      </div>
                    </div>
                    <Button size="sm"
                      disabled={!selectedMount || travelMount.isPending}
                      onClick={() => handleTravel(route.id as string)}>
                      {travelMount.isPending ? "..." : "Khởi hành"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Travel History */}
      {logList.length > 0 && (
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-sm">📋 Lịch sử du hành</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {logList.slice(0, 8).map(log => (
              <div key={log.id as string} className="flex items-center justify-between text-sm py-1.5 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2">
                  <span>{log.origin as string} → {log.destination as string}</span>
                  <Badge variant="outline" className="text-xs">{log.status as string}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>+{log.xpGained as number} XP</span>
                  <span>{new Date(log.createdAt as string).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
