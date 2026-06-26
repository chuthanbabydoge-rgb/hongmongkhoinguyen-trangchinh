import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useCombat } from "@/hooks/useCombat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Sword, Loader2 } from "lucide-react";

type ArenaRank = { id: string; userId: string; rating: number; wins: number; losses: number; winStreak: number; rank: string };
type ArenaData = { rank: ArenaRank | null; leaderboard: ArenaRank[] };

const RANK_COLORS: Record<string, string> = {
  GRANDMASTER: "text-red-400", MASTER: "text-purple-400", DIAMOND: "text-cyan-400",
  PLATINUM: "text-teal-400", GOLD: "text-yellow-400", SILVER: "text-gray-300", BRONZE: "text-amber-600",
};

export default function ArenaRanking() {
  const [, navigate] = useLocation();
  const { getArena, joinArenaQueue, loading } = useCombat();
  const [data, setData] = useState<ArenaData | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => { getArena().then(d => setData(d as ArenaData)); }, []);

  async function handleJoinQueue() {
    setJoining(true);
    const result = await joinArenaQueue();
    setJoining(false);
    if (result) {
      const r = result as Record<string, unknown>;
      if (r["battleId"]) navigate(`/combat/room/${r["battleId"] as string}`);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-400" />Arena PVP</h1>
          <p className="text-muted-foreground">Đấu xếp hạng — Season 1</p>
        </div>
        <Button onClick={handleJoinQueue} disabled={joining || loading} className="bg-yellow-600 hover:bg-yellow-700">
          {joining ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang tìm...</> : <><Sword className="w-4 h-4 mr-2" />Vào Arena</>}
        </Button>
      </div>

      {data?.rank && (
        <Card className="border-yellow-500/50">
          <CardHeader><CardTitle>Xếp hạng của bạn</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div><div className={`text-2xl font-bold ${RANK_COLORS[data.rank.rank] ?? ""}`}>{data.rank.rank}</div><div className="text-xs text-muted-foreground">Hạng</div></div>
              <div><div className="text-2xl font-bold">{data.rank.rating}</div><div className="text-xs text-muted-foreground">Rating</div></div>
              <div><div className="text-2xl font-bold text-green-400">{data.rank.wins}</div><div className="text-xs text-muted-foreground">Thắng</div></div>
              <div><div className="text-2xl font-bold text-red-400">{data.rank.losses}</div><div className="text-xs text-muted-foreground">Thua</div></div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Bảng xếp hạng</CardTitle></CardHeader>
        <CardContent>
          {loading && !data ? <p className="text-muted-foreground">Đang tải...</p> :
            (data?.leaderboard ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm">Chưa có xếp hạng. Hãy là người đầu tiên!</p>
            ) : (
              <div className="space-y-2">
                {(data?.leaderboard ?? []).map((r, i) => (
                  <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>
                      <div>
                        <span className="text-sm font-mono">{r.userId.slice(0, 14)}...</span>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline" className={`text-xs ${RANK_COLORS[r.rank] ?? ""}`}>{r.rank}</Badge>
                          {r.winStreak >= 3 && <Badge className="text-xs bg-orange-600">🔥 {r.winStreak} streak</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-bold">{r.rating} pt</div>
                      <div className="text-xs text-muted-foreground">{r.wins}W / {r.losses}L</div>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </CardContent>
      </Card>
    </div>
  );
}
