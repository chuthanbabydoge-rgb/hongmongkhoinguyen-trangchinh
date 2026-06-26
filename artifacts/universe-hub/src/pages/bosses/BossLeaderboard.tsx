import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Skull, Zap, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BossLeaderboard() {
  const [selectedBossId, setSelectedBossId] = useState("");

  const { data: bossesRes } = useQuery({
    queryKey: ["world-bosses"],
    queryFn: () => fetch("/api/bosses").then(r => r.json()),
  });
  const { data: rankRes } = useQuery({
    queryKey: ["boss-leaderboard", selectedBossId],
    queryFn: () => fetch(`/api/bosses/${selectedBossId}/leaderboard`).then(r => r.json()),
    enabled: !!selectedBossId,
  });

  const bosses = bossesRes?.data ?? [];
  const rankings = rankRes?.data ?? [];
  const MEDALS = ["🥇", "🥈", "🥉"];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h1 className="text-xl font-bold text-white">Bảng xếp hạng Boss</h1>
      </div>
      <Select value={selectedBossId} onValueChange={setSelectedBossId}>
        <SelectTrigger className="bg-gray-800 border-gray-600">
          <SelectValue placeholder="Chọn boss để xem xếp hạng..." />
        </SelectTrigger>
        <SelectContent>
          {bosses.map((b: { id: string; name: string; icon: string | null; type: string }) => (
            <SelectItem key={b.id} value={b.id}>{b.icon} {b.name} ({b.type})</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!selectedBossId ? (
        <div className="text-center py-12 text-gray-400">
          <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>Chọn boss để xem xếp hạng</p>
        </div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Skull className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>Chưa có dữ liệu xếp hạng</p>
        </div>
      ) : (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader><CardTitle className="text-sm text-yellow-400">Top Damage Dealers</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {rankings.map((r: { id: string; userId: string; totalDamage: number; totalHealing: number; kills: number }, i: number) => (
              <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg ${i < 3 ? "bg-yellow-500/5 border border-yellow-500/20" : "bg-gray-800"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl w-8 text-center">{MEDALS[i] ?? `#${i + 1}`}</span>
                  <p className="text-white text-sm font-medium">Player #{r.userId.slice(-6)}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-red-400"><Zap className="w-3 h-3" />{r.totalDamage.toLocaleString()}</span>
                  <span className="flex items-center gap-1 text-green-400"><Heart className="w-3 h-3" />{r.totalHealing.toLocaleString()}</span>
                  <span className="text-yellow-400">{r.kills} kill</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
