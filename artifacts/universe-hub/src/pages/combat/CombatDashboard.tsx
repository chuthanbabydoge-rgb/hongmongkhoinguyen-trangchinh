import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useCombat } from "@/hooks/useCombat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Trophy, Skull, Target, BarChart2, Clock, Star } from "lucide-react";

export default function CombatDashboard() {
  const { getStatistics, listBattles, loading } = useCombat();
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [activeBattles, setActiveBattles] = useState<unknown[]>([]);

  useEffect(() => {
    getStatistics().then(d => setStats(d as Record<string, number> | null));
    listBattles("ACTIVE").then(d => setActiveBattles((d as unknown[]) ?? []));
  }, []);

  const winRate = stats && stats["totalBattles"] > 0
    ? Math.round((stats["totalWins"] / stats["totalBattles"]) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Swords className="w-6 h-6 text-red-400" /> Universe Combat</h1>
          <p className="text-muted-foreground">Hệ thống chiến đấu — PVE, PVP, Boss, Arena</p>
        </div>
        <Link href="/combat/arena">
          <Button className="bg-red-600 hover:bg-red-700"><Trophy className="w-4 h-4 mr-2" />Vào Arena</Button>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tạo trận PVE",  href: "/combat/arena",   icon: Target,  color: "bg-blue-600" },
          { label: "Boss Battle",   href: "/combat/boss",    icon: Skull,   color: "bg-red-700" },
          { label: "Arena PVP",     href: "/combat/arena",   icon: Trophy,  color: "bg-yellow-600" },
          { label: "Lịch sử",       href: "/combat/history", icon: Clock,   color: "bg-gray-600" },
        ].map(item => (
          <Link key={item.label} href={item.href}>
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className={`p-3 rounded-full ${item.color}`}><item.icon className="w-5 h-5 text-white" /></div>
                <span className="text-sm font-medium">{item.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Tổng trận", value: stats["totalBattles"] ?? 0, icon: Swords },
            { label: "Chiến thắng", value: stats["totalWins"] ?? 0, icon: Trophy },
            { label: "Tỉ lệ thắng", value: `${winRate}%`, icon: Star },
            { label: "Boss hạ gục", value: stats["bossesDefeated"] ?? 0, icon: Skull },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className="w-8 h-8 text-muted-foreground" />
                <div>
                  <div className="text-xl font-bold">{String(s.value)}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Active battles */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart2 className="w-4 h-4" />Trận đang diễn ra</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-muted-foreground">Đang tải...</p> : activeBattles.length === 0 ? (
            <p className="text-muted-foreground text-sm">Không có trận đang diễn ra.</p>
          ) : (
            <div className="space-y-2">
              {activeBattles.slice(0, 5).map((b: unknown) => {
                const battle = b as Record<string, string>;
                return (
                  <div key={battle["id"]} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{battle["type"]}</Badge>
                      <span className="text-sm font-mono">{battle["id"]?.slice(0, 12)}...</span>
                    </div>
                    <Link href={`/combat/room/${battle["id"]}`}>
                      <Button size="sm" variant="outline">Xem</Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nav cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/combat/boss",       title: "Boss Battle",       desc: "Thách đấu các Boss mạnh mẽ",        icon: "🐉" },
          { href: "/combat/arena",      title: "Arena PVP",         desc: "Đấu xếp hạng với người chơi khác",  icon: "⚔️" },
          { href: "/combat/statistics", title: "Thống kê",          desc: "Xem chi tiết chiến tích của bạn",   icon: "📊" },
        ].map(n => (
          <Link key={n.href} href={n.href}>
            <Card className="cursor-pointer hover:bg-accent transition-colors h-full">
              <CardContent className="p-5 flex gap-4 items-start">
                <span className="text-3xl">{n.icon}</span>
                <div>
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-sm text-muted-foreground">{n.desc}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
