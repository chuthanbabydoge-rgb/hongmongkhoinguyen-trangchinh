import { useEffect, useState } from "react";
import { useCombat } from "@/hooks/useCombat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Swords, Trophy, Skull, Zap, Heart, Target } from "lucide-react";

type Stats = {
  totalBattles: number; totalWins: number; totalLosses: number;
  totalKills: number; totalDamage: number; totalHealing: number;
  criticalHits: number; bossesDefeated: number; arenaWins: number;
  longestWinStreak: number; favoriteSkill: string | null;
};

export default function CombatStatistics() {
  const { getStatistics, loading } = useCombat();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => { getStatistics().then(d => setStats(d as Stats)); }, []);

  const winRate = stats && stats.totalBattles > 0 ? Math.round((stats.totalWins / stats.totalBattles) * 100) : 0;

  const items = stats ? [
    { icon: Swords,  label: "Tổng trận",       value: stats.totalBattles.toLocaleString(), color: "text-blue-400" },
    { icon: Trophy,  label: "Chiến thắng",      value: stats.totalWins.toLocaleString(),    color: "text-yellow-400" },
    { icon: Skull,   label: "Thất bại",         value: stats.totalLosses.toLocaleString(),  color: "text-red-400" },
    { icon: Target,  label: "Tỉ lệ thắng",      value: `${winRate}%`,                       color: "text-green-400" },
    { icon: Zap,     label: "Tổng sát thương",  value: stats.totalDamage.toLocaleString(),  color: "text-orange-400" },
    { icon: Heart,   label: "Tổng hồi phục",    value: stats.totalHealing.toLocaleString(), color: "text-pink-400" },
    { icon: Zap,     label: "Crit hits",         value: stats.criticalHits.toLocaleString(), color: "text-red-300" },
    { icon: Skull,   label: "Boss hạ gục",       value: stats.bossesDefeated.toLocaleString(), color: "text-purple-400" },
    { icon: Trophy,  label: "Chiến thắng Arena", value: stats.arenaWins.toLocaleString(),   color: "text-cyan-400" },
    { icon: Swords,  label: "Chuỗi thắng dài",  value: stats.longestWinStreak.toLocaleString(), color: "text-amber-400" },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart2 className="w-6 h-6" />Thống kê chiến đấu</h1>
        <p className="text-muted-foreground">Toàn bộ chiến tích của bạn</p>
      </div>
      {loading && !stats ? <p className="text-muted-foreground">Đang tải...</p> :
        !stats ? <p className="text-muted-foreground">Chưa có thống kê. Hãy tham gia trận đầu tiên!</p> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
              <Card key={item.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                  <div>
                    <div className="text-xl font-bold">{item.value}</div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {stats.favoriteSkill && (
              <Card className="col-span-2">
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-3xl">✨</span>
                  <div>
                    <div className="text-lg font-bold">Kỹ năng ưa thích</div>
                    <div className="text-sm text-muted-foreground">{stats.favoriteSkill}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )
      }
    </div>
  );
}
