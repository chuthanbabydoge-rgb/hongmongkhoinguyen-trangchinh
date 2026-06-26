import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMounts, useMountStatistics, useMountTravelLogs } from "@/hooks/useMounts";
import { TrendingUp, Globe, Zap, Star } from "lucide-react";

const TYPE_ICONS: Record<string, string> = {
  HORSE: "🐴", WOLF: "🐺", DRAGON: "🐉", PHOENIX: "🦅", TIGER: "🐯", MECH: "🤖",
};
const STATUS_ICONS: Record<string, string> = {
  ACTIVE: "⚡", RESTING: "💤", TRAINING: "🏋️", TRAVELING: "🗺️",
};

export default function MountStatistics() {
  const { data: mounts = [] }    = useMounts();
  const { data: stats }          = useMountStatistics();
  const { data: travelLogs = [] }= useMountTravelLogs();

  const mountList = mounts as Record<string, unknown>[];
  const s         = stats as Record<string, unknown> | null | undefined;
  const logList   = travelLogs as Record<string, unknown>[];

  const bestMount = mountList.sort((a, b) => (b.level as number) - (a.level as number))[0];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📊 Thống kê Mount</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Star,       label: "Tổng Mount",   value: (s?.totalMounts as number) ?? mountList.length, color: "text-primary" },
          { icon: Globe,      label: "Tổng du hành", value: (s?.totalTravels as number) ?? 0,   color: "text-purple-400" },
          { icon: TrendingUp, label: "Tổng quãng đường", value: `${(s?.totalDistance as number) ?? 0} km`, color: "text-blue-400" },
          { icon: Zap,        label: "Tổng XP kiếm được", value: (s?.totalXpEarned as number) ?? 0,  color: "text-yellow-400" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="border-border/50">
            <CardContent className="pt-4 pb-4 text-center">
              <Icon className={`mx-auto mb-1 ${color}`} size={20} />
              <div className="text-xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Best Mount */}
      {bestMount && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
          <CardHeader><CardTitle className="text-sm">🏆 Mount tốt nhất</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-3xl">
                {TYPE_ICONS[bestMount.type as string] ?? "🐴"}
              </div>
              <div>
                <div className="font-bold text-lg">{bestMount.name as string}</div>
                <div className="text-muted-foreground text-sm">{bestMount.type as string} · Lv.{bestMount.level as number}</div>
                <div className="flex gap-3 mt-1 text-sm">
                  <span className="text-yellow-400">⚡ Speed: {bestMount.speed as number}</span>
                  <span className="text-blue-400">💪 Stamina: {bestMount.stamina as number}/{bestMount.maxStamina as number}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Mounts Summary */}
      {mountList.length > 0 && (
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-sm">🐴 Tất cả Mounts</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {mountList.map(mount => (
              <div key={mount.id as string} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{TYPE_ICONS[mount.type as string] ?? "🐴"}</span>
                  <div>
                    <div className="font-medium text-sm">{mount.name as string}</div>
                    <div className="text-xs text-muted-foreground">Lv.{mount.level as number} · {STATUS_ICONS[mount.status as string]} {mount.status as string}</div>
                  </div>
                </div>
                <div className="text-xs text-right text-muted-foreground">
                  <div>⚡ {mount.speed as number}</div>
                  <div>💪 {mount.stamina as number}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Travel History */}
      {logList.length > 0 && (
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-sm">📋 Lịch sử du hành gần đây</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {logList.slice(0, 10).map(log => (
              <div key={log.id as string} className="flex items-center justify-between text-sm py-1.5 border-b border-border/30 last:border-0">
                <div>
                  <span>{log.origin as string} → {log.destination as string}</span>
                  <div className="text-xs text-muted-foreground">{log.distance as number} km · {Math.floor((log.duration as number) / 60)} phút</div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">{log.status as string}</Badge>
                  <div className="text-xs text-yellow-400 mt-0.5">+{log.xpGained as number} XP</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {mountList.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-10 pb-10 text-center text-muted-foreground">
            Chưa có dữ liệu thống kê
          </CardContent>
        </Card>
      )}
    </div>
  );
}
