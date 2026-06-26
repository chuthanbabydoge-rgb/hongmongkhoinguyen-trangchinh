import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Medal, Swords, Zap, Heart, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RaidBoss { id: string; name: string; icon: string | null; difficulty: string; }
interface RaidRanking { id: string; userId: string; bossId: string; totalDamage: number; totalHealing: number; role: string; kills: number; bestTime: number | null; }

const RANK_MEDALS = ["🥇", "🥈", "🥉"];
const ROLE_COLORS: Record<string, string> = {
  TANK: "text-blue-400", HEALER: "text-green-400", DPS: "text-red-400", SUPPORT: "text-yellow-400",
};

export default function RaidLeaderboard() {
  const [selectedBossId, setSelectedBossId] = useState("");

  const { data: bossesRes } = useQuery({
    queryKey: ["raid-bosses"],
    queryFn: () => fetch("/api/raids/bosses").then(r => r.json()),
  });

  const { data: rankingsRes } = useQuery({
    queryKey: ["raid-leaderboard", selectedBossId],
    queryFn: () => fetch(`/api/raids/leaderboard?bossId=${selectedBossId}`).then(r => r.json()),
    enabled: !!selectedBossId,
  });

  const bosses: RaidBoss[] = bossesRes?.data ?? [];
  const rankings: RaidRanking[] = rankingsRes?.data ?? [];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Medal className="w-5 h-5 text-yellow-400" />
        <h1 className="text-xl font-bold text-white">Bảng xếp hạng Raid</h1>
      </div>

      <Select value={selectedBossId} onValueChange={setSelectedBossId}>
        <SelectTrigger className="bg-gray-800 border-gray-600">
          <SelectValue placeholder="Chọn Raid Boss để xem bảng xếp hạng..." />
        </SelectTrigger>
        <SelectContent>
          {bosses.map(b => (
            <SelectItem key={b.id} value={b.id}>{b.icon} {b.name} ({b.difficulty})</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!selectedBossId && (
        <div className="text-center py-12 text-gray-400">
          <Medal className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>Chọn raid boss để xem bảng xếp hạng</p>
        </div>
      )}

      {selectedBossId && rankings.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Swords className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>Chưa có dữ liệu xếp hạng cho boss này</p>
        </div>
      )}

      {rankings.length > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-400 flex items-center gap-2">
              <Trophy className="w-4 h-4" />Top {rankings.length} người chơi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rankings.map((r, i) => (
              <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg ${i < 3 ? "bg-yellow-500/5 border border-yellow-500/20" : "bg-gray-800"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl w-8 text-center">{RANK_MEDALS[i] ?? `#${i + 1}`}</span>
                  <div>
                    <p className="text-white text-sm font-medium">Player #{r.userId.slice(-6)}</p>
                    <span className={`text-xs font-semibold ${ROLE_COLORS[r.role] ?? "text-gray-400"}`}>{r.role}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-red-400"><Zap className="w-3 h-3" />{r.totalDamage.toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-green-400"><Heart className="w-3 h-3" />{r.totalHealing.toLocaleString()}</span>
                  </div>
                  {r.bestTime && <p className="text-xs text-gray-400 mt-0.5">{Math.floor(r.bestTime / 60)}m {r.bestTime % 60}s</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
