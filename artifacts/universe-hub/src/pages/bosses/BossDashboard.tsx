import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skull, Zap, Users, Star, ChevronRight, Activity, Trophy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface WorldBoss {
  id: string; name: string; description: string | null; type: string; state: string;
  level: number; hp: number; maxHp: number; minPlayers: number; maxPlayers: number;
  rewardCredits: number; rewardXp: number; icon: string | null; region: string | null;
  currentPhase: number; totalPhases: number; isEnraged: boolean; participantCount?: number;
}

const STATE_COLORS: Record<string, string> = {
  IDLE: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  SPAWNING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
  ENRAGED: "bg-red-500/20 text-red-400 border-red-500/30",
  RETREAT: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  DEAD: "bg-gray-700/20 text-gray-500 border-gray-600/30",
};
const STATE_LABELS: Record<string, string> = {
  IDLE: "Ngủ yên", SPAWNING: "Xuất hiện", ACTIVE: "Đang hoạt động",
  ENRAGED: "Điên cuồng", RETREAT: "Rút lui", DEAD: "Đã chết",
};
const TYPE_COLORS: Record<string, string> = {
  WORLD: "text-blue-400", DUNGEON: "text-purple-400", RAID: "text-orange-400",
  SEASONAL: "text-green-400", LEGENDARY: "text-yellow-400",
};

export default function BossDashboard() {
  const { data: bossesRes } = useQuery({
    queryKey: ["world-bosses"],
    queryFn: () => fetch("/api/bosses").then(r => r.json()),
    refetchInterval: 10000,
  });
  const { data: activeRes } = useQuery({
    queryKey: ["active-bosses"],
    queryFn: () => fetch("/api/bosses/active").then(r => r.json()),
    refetchInterval: 5000,
  });

  const bosses: WorldBoss[] = bossesRes?.data ?? [];
  const activeBosses: WorldBoss[] = activeRes?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Skull className="w-6 h-6 text-red-400" />Universe Bosses
          </h1>
          <p className="text-gray-400 text-sm mt-1">Chiến đấu với boss thế giới — phần thưởng xứng đáng đang chờ bạn</p>
        </div>
        <div className="flex gap-2">
          <Link href="/bosses/history"><Button variant="outline" size="sm" className="gap-2"><Activity className="w-4 h-4" />Lịch sử</Button></Link>
          <Link href="/bosses/leaderboard"><Button variant="outline" size="sm" className="gap-2"><Trophy className="w-4 h-4" />Xếp hạng</Button></Link>
        </div>
      </div>

      {/* Active Boss Alert */}
      {activeBosses.length > 0 && (
        <Card className="bg-red-900/20 border-red-500/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />Boss đang hoạt động ({activeBosses.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeBosses.map(boss => (
              <Link key={boss.id} href={`/bosses/${boss.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-900/10 border border-red-500/20 hover:border-red-500/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{boss.icon ?? "💀"}</span>
                    <div>
                      <p className="text-white font-semibold">{boss.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={(boss.hp / boss.maxHp) * 100} className="w-24 h-1.5 bg-gray-700" />
                        <span className="text-xs text-red-300">{Math.round((boss.hp / boss.maxHp) * 100)}% HP</span>
                        {boss.isEnraged && <Badge variant="destructive" className="text-xs">😡 Điên cuồng</Badge>}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="bg-red-600 hover:bg-red-500">Tham chiến</Button>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Bosses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bosses.map(boss => (
          <Card key={boss.id} className="bg-gray-900 border-gray-700 hover:border-red-500/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{boss.icon ?? "💀"}</span>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded border ${STATE_COLORS[boss.state] ?? "text-gray-400"}`}>{STATE_LABELS[boss.state] ?? boss.state}</span>
                  <span className={`text-xs font-semibold ${TYPE_COLORS[boss.type] ?? "text-gray-400"}`}>{boss.type}</span>
                </div>
              </div>
              <h3 className="text-white font-semibold mb-1">{boss.name}</h3>
              <p className="text-gray-400 text-xs mb-3 line-clamp-2">{boss.description}</p>
              {boss.state === "ACTIVE" || boss.state === "ENRAGED" ? (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">HP Boss</span>
                    <span className="text-red-400">{boss.hp.toLocaleString()} / {boss.maxHp.toLocaleString()}</span>
                  </div>
                  <Progress value={(boss.hp / boss.maxHp) * 100} className="h-2 bg-gray-700" />
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{boss.minPlayers}–{boss.maxPlayers}</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />Lv.{boss.level}</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-purple-400" />{boss.rewardXp.toLocaleString()} XP</span>
                <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-400" />{boss.rewardCredits.toLocaleString()} crd</span>
              </div>
              <Link href={`/bosses/${boss.id}`}>
                <Button size="sm" className={`w-full gap-2 ${boss.state === "ACTIVE" || boss.state === "ENRAGED" ? "bg-red-600 hover:bg-red-500" : "bg-gray-700 hover:bg-gray-600"}`}>
                  <Skull className="w-3 h-3" />{boss.state === "ACTIVE" || boss.state === "ENRAGED" ? "Tham chiến" : "Xem Boss"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
