import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sword, Shield, Clock, Users, Star, ChevronRight, Plus, BarChart3, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Dungeon {
  id: string; name: string; description: string | null;
  difficulty: string; minLevel: number; maxPlayers: number;
  timeLimit: number; rewardCredits: number; rewardXp: number; icon: string | null;
}

interface DungeonInstance {
  id: string; dungeonId: string; status: string; difficulty: string;
  leaderId: string; memberCount?: number; createdAt: string;
  dungeon?: Dungeon;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  NORMAL: "bg-green-500/20 text-green-400 border-green-500/30",
  HARD: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ELITE: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  LEGENDARY: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  MYTHIC: "bg-red-500/20 text-red-400 border-red-500/30",
};

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${DIFFICULTY_COLORS[difficulty] ?? "bg-gray-500/20 text-gray-400"}`}>
      {difficulty}
    </span>
  );
}

export default function DungeonDashboard() {
  const { data: dungeonsRes } = useQuery({
    queryKey: ["dungeons"],
    queryFn: () => fetch("/api/dungeons").then(r => r.json()),
  });

  const { data: instancesRes } = useQuery({
    queryKey: ["dungeon-instances-waiting"],
    queryFn: () => fetch("/api/dungeons/instances?status=WAITING").then(r => r.json()),
    refetchInterval: 10000,
  });

  const dungeons: Dungeon[] = dungeonsRes?.data ?? [];
  const openInstances: DungeonInstance[] = instancesRes?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sword className="w-6 h-6 text-blue-400" />
            Universe Dungeon
          </h1>
          <p className="text-gray-400 text-sm mt-1">Khám phá hang ngục và chiến đấu cùng đồng đội</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dungeons/history">
            <Button variant="outline" size="sm" className="gap-2">
              <History className="w-4 h-4" />Lịch sử
            </Button>
          </Link>
          <Link href="/dungeons/statistics">
            <Button variant="outline" size="sm" className="gap-2">
              <BarChart3 className="w-4 h-4" />Thống kê
            </Button>
          </Link>
        </div>
      </div>

      {/* Open Instances */}
      {openInstances.length > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-yellow-400 flex items-center gap-2">
              <Users className="w-4 h-4" />Phòng đang chờ ({openInstances.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {openInstances.slice(0, 5).map(inst => (
              <Link key={inst.id} href={`/dungeons/room/${inst.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-750 cursor-pointer border border-gray-700 hover:border-blue-500/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{inst.dungeon?.icon ?? "⚔️"}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{inst.dungeon?.name ?? "Dungeon"}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <DifficultyBadge difficulty={inst.difficulty} />
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <Users className="w-3 h-3" />{inst.memberCount ?? 1}/{inst.dungeon?.maxPlayers ?? 5}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Dungeon List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />Chọn Dungeon
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dungeons.map(d => (
            <Card key={d.id} className="bg-gray-900 border-gray-700 hover:border-blue-500/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{d.icon ?? "⚔️"}</span>
                  <DifficultyBadge difficulty={d.difficulty} />
                </div>
                <h3 className="text-white font-semibold mb-1">{d.name}</h3>
                <p className="text-gray-400 text-xs mb-3 line-clamp-2">{d.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />Tối đa {d.maxPlayers}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.floor(d.timeLimit / 60)} phút</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />{d.rewardCredits} credits</span>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-blue-400" />Lv.{d.minLevel}+</span>
                </div>
                <Link href={`/dungeons/browse?dungeonId=${d.id}`}>
                  <Button size="sm" className="w-full gap-2 bg-blue-600 hover:bg-blue-500">
                    <Plus className="w-3 h-3" />Vào Dungeon
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
