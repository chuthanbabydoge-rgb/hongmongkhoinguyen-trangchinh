import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skull, Filter, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const BOSS_TYPES = ["", "WORLD", "DUNGEON", "RAID", "SEASONAL", "LEGENDARY"];

export default function BossBrowser() {
  const [typeFilter, setTypeFilter] = useState("");

  const { data: bossesRes, isLoading } = useQuery({
    queryKey: ["world-bosses", typeFilter],
    queryFn: () => fetch(`/api/bosses${typeFilter ? `?type=${typeFilter}` : ""}`).then(r => r.json()),
    refetchInterval: 10000,
  });

  const bosses = bossesRes?.data ?? [];

  const STATE_COLOR: Record<string, string> = {
    IDLE: "text-gray-400", ACTIVE: "text-green-400", ENRAGED: "text-red-400", DEAD: "text-gray-600",
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skull className="w-5 h-5 text-red-400" />
          <h1 className="text-xl font-bold text-white">Tất cả Boss</h1>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="bg-gray-800 border-gray-600 w-40">
            <Filter className="w-3 h-3 mr-1" /><SelectValue placeholder="Tất cả loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tất cả loại</SelectItem>
            {BOSS_TYPES.filter(Boolean).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <p className="text-gray-400">Đang tải...</p>}

      <div className="space-y-2">
        {bosses.map((boss: { id: string; name: string; type: string; state: string; level: number; hp: number; maxHp: number; icon: string | null; region: string | null; rewardCredits: number; participantCount?: number }) => (
          <Card key={boss.id} className="bg-gray-900 border-gray-700 hover:border-red-500/40 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{boss.icon ?? "💀"}</span>
                <div>
                  <p className="text-white font-semibold">{boss.name}</p>
                  <div className="flex items-center gap-2 text-xs mt-0.5">
                    <span className="text-gray-400">{boss.type}</span>
                    <span className={STATE_COLOR[boss.state] ?? "text-gray-400"}>{boss.state}</span>
                    <span className="text-gray-500">Lv.{boss.level}</span>
                    {boss.region && <span className="text-gray-500">{boss.region}</span>}
                  </div>
                  {(boss.state === "ACTIVE" || boss.state === "ENRAGED") && (
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={(boss.hp / boss.maxHp) * 100} className="w-24 h-1 bg-gray-700" />
                      <span className="text-xs text-red-400">{Math.round((boss.hp / boss.maxHp) * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-yellow-400 text-sm font-semibold">{boss.rewardCredits.toLocaleString()} crd</p>
                  <p className="text-gray-400 text-xs">{boss.participantCount ?? 0} người</p>
                </div>
                <Link href={`/bosses/${boss.id}`}>
                  <Button size="sm" className="bg-red-600 hover:bg-red-500"><Skull className="w-3 h-3 mr-1" />Xem</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
