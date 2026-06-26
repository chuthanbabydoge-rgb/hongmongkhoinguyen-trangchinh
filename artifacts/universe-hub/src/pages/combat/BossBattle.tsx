import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useCombat } from "@/hooks/useCombat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skull, Swords, Star } from "lucide-react";

type Boss = { id: string; name: string; description: string | null; icon: string | null; level: number; hp: number; attack: number; defense: number; xpReward: number; goldReward: number; isWorldBoss: boolean };

export default function BossBattle() {
  const [, navigate] = useLocation();
  const { listBosses, startBossBattle, loading } = useCombat();
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => { listBosses().then(d => setBosses((d as Boss[]) ?? [])); }, []);

  async function handleStart(bossId: string) {
    setStarting(bossId);
    const battle = await startBossBattle(bossId);
    setStarting(null);
    if (battle) {
      const b = battle as Record<string, string>;
      navigate(`/combat/room/${b["id"]}`);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Skull className="w-6 h-6 text-red-500" />Boss Battle</h1>
        <p className="text-muted-foreground">Thách đấu các Boss mạnh mẽ để nhận phần thưởng cao</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && bosses.length === 0 ? <p className="text-muted-foreground">Đang tải...</p> :
          bosses.map(boss => (
            <Card key={boss.id} className={boss.isWorldBoss ? "border-red-500 bg-red-950/20" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{boss.icon ?? "👹"}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      {boss.name}
                      {boss.isWorldBoss && <Badge className="bg-red-600 text-xs">WORLD BOSS</Badge>}
                    </div>
                    <p className="text-xs font-normal text-muted-foreground">Cấp {boss.level}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {boss.description && <p className="text-sm text-muted-foreground">{boss.description}</p>}
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="p-2 bg-secondary rounded"><div className="font-bold text-red-400">{boss.hp.toLocaleString()}</div><div className="text-xs text-muted-foreground">HP</div></div>
                  <div className="p-2 bg-secondary rounded"><div className="font-bold text-orange-400">{boss.attack}</div><div className="text-xs text-muted-foreground">ATK</div></div>
                  <div className="p-2 bg-secondary rounded"><div className="font-bold text-blue-400">{boss.defense}</div><div className="text-xs text-muted-foreground">DEF</div></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-sm">
                    <span className="text-green-400 flex items-center gap-1"><Star className="w-3 h-3" />{boss.xpReward} XP</span>
                    <span className="text-yellow-400">{boss.goldReward} G</span>
                  </div>
                  <Button onClick={() => handleStart(boss.id)} disabled={starting === boss.id || loading} className="bg-red-600 hover:bg-red-700">
                    <Swords className="w-4 h-4 mr-2" />{starting === boss.id ? "Đang tạo..." : "Thách đấu"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  );
}
