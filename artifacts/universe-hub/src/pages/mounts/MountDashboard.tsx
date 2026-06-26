import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMounts, useMountStatistics } from "@/hooks/useMounts";
import { Zap, Star, TrendingUp, Globe } from "lucide-react";

const TYPE_ICONS: Record<string, string> = {
  HORSE: "🐴", WOLF: "🐺", DRAGON: "🐉", PHOENIX: "🦅", TIGER: "🐯", MECH: "🤖",
};
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "text-green-400", RESTING: "text-blue-400", TRAINING: "text-yellow-400", TRAVELING: "text-purple-400",
};
const STATUS_ICONS: Record<string, string> = {
  ACTIVE: "⚡", RESTING: "💤", TRAINING: "🏋️", TRAVELING: "🗺️",
};

export default function MountDashboard() {
  const { data: mounts = [] } = useMounts();
  const { data: stats }       = useMountStatistics();
  const mountList = mounts as Record<string, unknown>[];
  const s         = stats as Record<string, unknown> | null | undefined;

  const totalMounts  = mountList.length;
  const avgLevel     = totalMounts ? Math.round(mountList.reduce((a, m) => a + ((m.level as number) ?? 1), 0) / totalMounts) : 0;
  const traveling    = mountList.filter(m => m.status === "TRAVELING").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">🐴 Universe Mounts</h1>
        <Link href="/mounts/stable">
          <Button size="sm">🐴 Chuồng ngựa</Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Star,       label: "Tổng Mount",   value: totalMounts,                         color: "text-primary" },
          { icon: TrendingUp, label: "Level TB",      value: avgLevel,                            color: "text-yellow-400" },
          { icon: Globe,      label: "Đang du hành", value: traveling,                            color: "text-purple-400" },
          { icon: Zap,        label: "Tổng quãng đường", value: (s?.totalDistance as number) ?? 0, color: "text-blue-400" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="border-border/50">
            <CardContent className="pt-4 pb-4 text-center">
              <Icon className={`mx-auto mb-1 ${color}`} size={20} />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { icon: "🐴", label: "Chuồng ngựa",  desc: "Quản lý mounts",        path: "/mounts/stable" },
          { icon: "🗺️", label: "Du hành",      desc: "Khởi hành & tuyến đường",path: "/mounts/travel" },
          { icon: "🎨", label: "Tùy chỉnh",    desc: "Thay màu & trang trí",   path: "/mounts/customize" },
          { icon: "📊", label: "Thống kê",     desc: "Lịch sử & stats",        path: "/mounts/statistics" },
          { icon: "🏋️", label: "Huấn luyện",  desc: "Tăng speed & stamina",   path: "/mounts/stable" },
          { icon: "⚡", label: "Chiến kỵ",     desc: "Mount đang hoạt động",   path: "/mounts/stable" },
        ].map(({ icon, label, desc, path }) => (
          <Link key={path + label} href={path}>
            <Card className="cursor-pointer border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="pt-4 pb-4">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Mount List */}
      {mountList.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">🐴 Mounts của bạn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mountList.slice(0, 5).map(mount => {
              const xpNeeded = Math.floor(80 * Math.pow((mount.level as number) + 1, 1.5));
              const xpPct    = Math.min(100, Math.round(((mount.experience as number) / xpNeeded) * 100));
              return (
                <Link key={mount.id as string} href={`/mounts/stable`}>
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">
                      {TYPE_ICONS[mount.type as string] ?? "🐴"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{mount.name as string}</span>
                        <span className={`text-xs ${STATUS_COLORS[mount.status as string]}`}>
                          {STATUS_ICONS[mount.status as string]} {mount.status as string}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Lv.{mount.level as number}</span>
                        <Progress value={xpPct} className="h-1 flex-1" />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ⚡ {mount.speed as number} · 💪 {mount.stamina as number}/{mount.maxStamina as number}
                    </div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {mountList.length === 0 && (
        <Card className="border-dashed border-border/50">
          <CardContent className="pt-10 pb-10 text-center space-y-4">
            <div className="text-6xl">🐴</div>
            <div className="text-muted-foreground">Bạn chưa có mount nào</div>
            <Link href="/mounts/stable">
              <Button>🐴 Mua Mount đầu tiên</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
