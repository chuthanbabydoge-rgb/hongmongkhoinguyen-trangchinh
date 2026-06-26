import { useEffect, useState } from "react";
import { useCombat } from "@/hooks/useCombat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy, Skull } from "lucide-react";

type HistoryEntry = { id: string; battleId: string; type: string; result: string; xpGained: number; goldGained: number; turnsCount: number; createdAt: string };

export default function BattleHistory() {
  const { getHistory, loading } = useCombat();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => { getHistory(20).then(d => setHistory((d as HistoryEntry[]) ?? [])); }, []);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Clock className="w-6 h-6" />Lịch sử chiến đấu</h1>
        <p className="text-muted-foreground">Tất cả các trận đấu đã tham gia</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Lịch sử gần đây</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-muted-foreground">Đang tải...</p> : history.length === 0 ? (
            <p className="text-muted-foreground text-sm">Chưa có lịch sử chiến đấu.</p>
          ) : (
            <div className="space-y-3">
              {history.map(h => (
                <div key={h.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {h.result === "VICTORY" ? <Trophy className="w-5 h-5 text-yellow-500" /> : <Skull className="w-5 h-5 text-gray-400" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{h.type}</Badge>
                        <Badge variant={h.result === "VICTORY" ? "default" : "secondary"}>{h.result}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(h.createdAt).toLocaleString("vi-VN")} · {h.turnsCount} lượt</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-green-400">+{h.xpGained} XP</div>
                    <div className="text-yellow-400">+{h.goldGained} G</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
