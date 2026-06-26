import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useCombat } from "@/hooks/useCombat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, PlusCircle, Users, Loader2 } from "lucide-react";

type Battle = { id: string; type: string; status: string; currentTurn: number; maxTurns: number; creatorId: string; createdAt: string };

export default function BattleArena() {
  const [, navigate] = useLocation();
  const { listBattles, createBattle, loading } = useCombat();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [creating, setCreating] = useState(false);
  const [type, setType] = useState<"PVE" | "PVP" | "TRAINING">("PVE");

  const reload = () => {
    listBattles(undefined, undefined).then(d => setBattles((d as Battle[]) ?? []));
  };

  useEffect(() => { reload(); }, []);

  async function handleCreate() {
    setCreating(true);
    const battle = await createBattle(type);
    setCreating(false);
    if (battle) {
      const b = battle as Record<string, string>;
      navigate(`/combat/room/${b["id"]}`);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Swords className="w-6 h-6 text-blue-400" />Battle Arena</h1>
          <p className="text-muted-foreground">Tạo hoặc tham gia trận chiến</p>
        </div>
        <div className="flex gap-2">
          <select
            value={type}
            onChange={e => setType(e.target.value as "PVE" | "PVP" | "TRAINING")}
            className="border rounded px-2 py-1 text-sm bg-background"
          >
            <option value="PVE">PVE</option>
            <option value="PVP">PVP</option>
            <option value="TRAINING">Training</option>
          </select>
          <Button onClick={handleCreate} disabled={creating || loading} className="bg-blue-600 hover:bg-blue-700">
            {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />}
            Tạo trận
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="w-4 h-4" />Tất cả trận chiến</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && battles.length === 0 ? <p className="text-muted-foreground">Đang tải...</p> :
            battles.length === 0 ? (
              <p className="text-muted-foreground text-sm">Chưa có trận chiến nào. Hãy tạo một trận mới!</p>
            ) : (
              <div className="space-y-2">
                {battles.slice(0, 20).map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge variant={b.status === "ACTIVE" ? "default" : b.status === "WAITING" ? "secondary" : "outline"}>
                        {b.status}
                      </Badge>
                      <Badge variant="outline">{b.type}</Badge>
                      <span className="text-sm font-mono text-muted-foreground">{b.id.slice(0, 14)}...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Lượt {b.currentTurn}/{b.maxTurns}</span>
                      <Link href={`/combat/room/${b.id}`}>
                        <Button size="sm" variant="outline">Vào</Button>
                      </Link>
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
