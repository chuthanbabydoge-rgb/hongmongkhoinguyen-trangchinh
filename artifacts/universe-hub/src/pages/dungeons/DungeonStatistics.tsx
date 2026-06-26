import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { BarChart3, Trophy, Skull, Sword, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DungeonStat {
  id: string; userId: string; dungeonId: string;
  completions: number; failures: number;
  totalKills: number; totalDeaths: number;
  bestTime: number | null; totalXpEarned: number;
}

export default function DungeonStatistics() {
  const { accessToken } = useAuth();

  const { data: res, isLoading } = useQuery({
    queryKey: ["dungeon-statistics"],
    queryFn: () => fetch("/api/dungeons/statistics", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(r => r.json()),
    enabled: !!accessToken,
  });

  const stats: DungeonStat[] = res?.data ?? [];

  const totals = stats.reduce((acc, s) => ({
    completions: acc.completions + s.completions,
    failures: acc.failures + s.failures,
    totalKills: acc.totalKills + s.totalKills,
    totalDeaths: acc.totalDeaths + s.totalDeaths,
    totalXpEarned: acc.totalXpEarned + s.totalXpEarned,
  }), { completions: 0, failures: 0, totalKills: 0, totalDeaths: 0, totalXpEarned: 0 });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        <h1 className="text-xl font-bold text-white">Thống kê Dungeon</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Trophy className="w-5 h-5 text-yellow-400" />, label: "Hoàn thành", value: totals.completions, color: "text-yellow-400" },
          { icon: <Skull className="w-5 h-5 text-red-400" />, label: "Thất bại", value: totals.failures, color: "text-red-400" },
          { icon: <Sword className="w-5 h-5 text-blue-400" />, label: "Quái vật đã giết", value: totals.totalKills, color: "text-blue-400" },
          { icon: <Zap className="w-5 h-5 text-purple-400" />, label: "XP kiếm được", value: totals.totalXpEarned.toLocaleString(), color: "text-purple-400" },
        ].map((s, i) => (
          <Card key={i} className="bg-gray-900 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">{s.icon}</div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && <p className="text-gray-400">Đang tải...</p>}

      {!isLoading && stats.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>Chưa có thống kê dungeon nào</p>
        </div>
      )}

      {stats.length > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader><CardTitle className="text-sm text-gray-300">Chi tiết theo Dungeon</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {stats.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">Dungeon #{s.dungeonId.slice(-6)}</p>
                  <p className="text-xs text-gray-400">Best time: {s.bestTime ? `${Math.floor(s.bestTime / 60)}m ${s.bestTime % 60}s` : "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 text-sm">{s.completions} lần</p>
                  <p className="text-xs text-gray-400">{s.totalXpEarned} XP</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
