import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Swords, Users, Trophy, Star, ChevronRight, Plus, History, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RaidBoss {
  id: string; name: string; description: string | null;
  difficulty: string; hp: number; maxHp: number;
  minPlayers: number; maxPlayers: number; icon: string | null; phases: number;
}

interface RaidInstance {
  id: string; raidBossId: string; status: string; difficulty: string;
  createdAt: string; boss?: RaidBoss;
}

const DIFF_COLORS: Record<string, string> = {
  NORMAL: "text-green-400 border-green-500/30 bg-green-500/10",
  HEROIC: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  MYTHIC: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  NIGHTMARE: "text-red-400 border-red-500/30 bg-red-500/10",
};

function DiffBadge({ d }: { d: string }) {
  return <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${DIFF_COLORS[d] ?? "text-gray-400"}`}>{d}</span>;
}

export default function RaidDashboard() {
  const { data: bossesRes } = useQuery({
    queryKey: ["raid-bosses"],
    queryFn: () => fetch("/api/raids/bosses").then(r => r.json()),
  });

  const { data: raidsRes } = useQuery({
    queryKey: ["raids-waiting"],
    queryFn: () => fetch("/api/raids?status=WAITING").then(r => r.json()),
    refetchInterval: 10000,
  });

  const bosses: RaidBoss[] = bossesRes?.data ?? [];
  const openRaids: RaidInstance[] = raidsRes?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Swords className="w-6 h-6 text-red-400" />Universe Raid
          </h1>
          <p className="text-gray-400 text-sm mt-1">Chiến đấu cùng nhóm lớn chống lại raid boss khổng lồ</p>
        </div>
        <div className="flex gap-2">
          <Link href="/raids/history">
            <Button variant="outline" size="sm" className="gap-2"><History className="w-4 h-4" />Lịch sử</Button>
          </Link>
          <Link href="/raids/leaderboard">
            <Button variant="outline" size="sm" className="gap-2"><Medal className="w-4 h-4" />Bảng xếp hạng</Button>
          </Link>
        </div>
      </div>

      {/* Open Raids */}
      {openRaids.length > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-yellow-400 flex items-center gap-2">
              <Users className="w-4 h-4" />Raid đang chờ ({openRaids.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {openRaids.map(raid => (
              <Link key={raid.id} href={`/raids/${raid.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-750 cursor-pointer border border-gray-700 hover:border-red-500/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{raid.boss?.icon ?? "⚔️"}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{raid.boss?.name ?? "Raid Boss"}</p>
                      <DiffBadge d={raid.difficulty} />
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Boss List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-red-400" />Raid Bosses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bosses.map(boss => (
            <Card key={boss.id} className="bg-gray-900 border-gray-700 hover:border-red-500/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{boss.icon ?? "👹"}</span>
                  <DiffBadge d={boss.difficulty} />
                </div>
                <h3 className="text-white font-semibold mb-1">{boss.name}</h3>
                <p className="text-gray-400 text-xs mb-3 line-clamp-2">{boss.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{boss.minPlayers}–{boss.maxPlayers} người</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-red-400" />{boss.phases} giai đoạn</span>
                  <span className="flex items-center gap-1 col-span-2">HP: {boss.maxHp.toLocaleString()}</span>
                </div>
                <Link href={`/raids/lobby?bossId=${boss.id}`}>
                  <Button size="sm" className="w-full gap-2 bg-red-600 hover:bg-red-500">
                    <Plus className="w-3 h-3" />Tạo Raid
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
