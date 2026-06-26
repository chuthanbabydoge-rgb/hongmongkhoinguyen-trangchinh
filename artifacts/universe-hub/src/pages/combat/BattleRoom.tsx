import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useCombat } from "@/hooks/useCombat";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Swords, Zap, Shield, SkipForward, Flag, RefreshCw } from "lucide-react";

type Participant = { id: string; userId: string; team: number; status: string; currentHp: number; maxHp: number; currentMp: number; maxMp: number; isNpc: boolean; npcName: string | null };
type Skill = { id: string; name: string; icon: string | null; mpCost: number; cooldown: number; baseDamage: number };
type Turn = { id: string; turnNumber: number; actorId: string; targetId: string | null; actionType: string; damage: number | null; isCritical: boolean; isMiss: boolean; isDodge: boolean };
type BattleFull = { id: string; type: string; status: string; currentTurn: number; maxTurns: number; participants: Participant[]; turns: Turn[]; winnerId: string | null };

export default function BattleRoom() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { getBattle, attack, castSkill, surrender, startBattle, getSkills, loading } = useCombat();

  const [battle, setBattle] = useState<BattleFull | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [targeting, setTargeting] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const data = await getBattle(id);
    if (data) setBattle(data as BattleFull);
  }, [id, getBattle]);

  useEffect(() => {
    refresh();
    getSkills().then(d => setSkills((d as Skill[]) ?? []));
    const iv = setInterval(refresh, 5000);
    return () => clearInterval(iv);
  }, [refresh, getSkills]);

  const me = battle?.participants.find(p => p.userId === user?.id);
  const enemies = battle?.participants.filter(p => p.team !== me?.team && !p.isNpc && p.status === "ALIVE") ?? [];
  const allEnemies = battle?.participants.filter(p => p.team !== me?.team) ?? [];
  const npcEnemy = allEnemies.find(p => p.isNpc || p.userId?.startsWith("npc") || p.userId?.startsWith("boss"));
  const target = targeting ? battle?.participants.find(p => p.userId === targeting) : (enemies[0] ?? npcEnemy ?? allEnemies[0]);

  const addLog = (msg: string) => setLog(prev => [`[Lượt ${battle?.currentTurn ?? 0}] ${msg}`, ...prev].slice(0, 20));

  async function doAttack() {
    if (!target) return;
    const result = await attack(id, target.userId);
    if (result) {
      const r = result as Record<string, unknown>;
      if (r["isMiss"]) addLog("❌ Đòn đánh trượt!");
      else if (r["isDodge"]) addLog("💨 Mục tiêu né tránh!");
      else if (r["isCritical"]) addLog(`🔥 CRITICAL! -${(r["damageLog"] as Record<string, number>)?.["netDamage"]} HP`);
      else addLog(`⚔️ Tấn công! -${(r["damageLog"] as Record<string, number>)?.["netDamage"]} HP`);
      if ((r as Record<string, boolean>)["battleFinished"]) addLog("🏁 Trận chiến kết thúc!");
      await refresh();
    }
  }

  async function doSkill(skillId: string) {
    if (!target) return;
    const result = await castSkill(id, target.userId, skillId);
    if (result) {
      addLog(`✨ Sử dụng kỹ năng!`);
      await refresh();
    }
  }

  async function doSurrender() {
    if (!confirm("Bạn có chắc muốn đầu hàng?")) return;
    await surrender(id);
    navigate("/combat");
  }

  async function doStart() {
    await startBattle(id);
    await refresh();
  }

  if (!battle) return <div className="p-6 text-muted-foreground">{loading ? "Đang tải..." : "Không tìm thấy trận chiến."}</div>;

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Swords className="w-5 h-5 text-red-400" />Battle Room</h1>
          <p className="text-xs text-muted-foreground font-mono">{battle.id.slice(0, 16)}... · Lượt {battle.currentTurn}/{battle.maxTurns}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={battle.status === "ACTIVE" ? "default" : battle.status === "FINISHED" ? "secondary" : "outline"}>
            {battle.status}
          </Badge>
          <Badge variant="outline">{battle.type}</Badge>
        </div>
      </div>

      {/* Participants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {battle.participants.map(p => (
          <Card key={p.id} className={`${p.status === "DEAD" ? "opacity-50" : ""} ${p.userId === me?.userId ? "border-blue-500" : "border-red-500"}`}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{p.isNpc ? (p.npcName ?? "NPC") : p.userId.slice(0, 12)}</span>
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-xs">Team {p.team}</Badge>
                  <Badge variant={p.status === "ALIVE" ? "default" : "destructive"} className="text-xs">{p.status}</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs"><span>❤️ HP</span><span>{p.currentHp}/{p.maxHp}</span></div>
                <Progress value={(p.currentHp / p.maxHp) * 100} className="h-2" />
                <div className="flex justify-between text-xs"><span>💙 MP</span><span>{p.currentMp}/{p.maxMp}</span></div>
                <Progress value={(p.currentMp / p.maxMp) * 100} className="h-2 [&>div]:bg-blue-500" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      {battle.status === "WAITING" && (
        <Card>
          <CardContent className="p-4">
            <Button onClick={doStart} className="w-full bg-green-600 hover:bg-green-700"><SkipForward className="w-4 h-4 mr-2" />Bắt đầu trận chiến</Button>
          </CardContent>
        </Card>
      )}

      {battle.status === "ACTIVE" && me?.status === "ALIVE" && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Hành động</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {target && (
              <p className="text-xs text-muted-foreground">Mục tiêu: <span className="font-medium text-foreground">{target.isNpc ? (target.npcName ?? "NPC") : target.userId.slice(0, 12)}</span></p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button onClick={doAttack} disabled={loading} className="bg-red-600 hover:bg-red-700">
                <Swords className="w-4 h-4 mr-2" />Tấn công thường
              </Button>
              <Button onClick={doSurrender} disabled={loading} variant="outline" className="text-red-400">
                <Flag className="w-4 h-4 mr-2" />Đầu hàng
              </Button>
              <Button onClick={refresh} disabled={loading} variant="ghost" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            {skills.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Kỹ năng:</p>
                <div className="flex flex-wrap gap-2">
                  {skills.slice(0, 6).map(sk => (
                    <Button key={sk.id} onClick={() => doSkill(sk.id)} disabled={loading || (me.currentMp < sk.mpCost)} variant="outline" size="sm">
                      {sk.icon ?? "✨"} {sk.name} <span className="ml-1 text-xs text-muted-foreground">({sk.mpCost} MP)</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {battle.status === "FINISHED" && (
        <Card className="border-yellow-500">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-2">{battle.winnerId ? "🏆" : "⚔️"}</div>
            <div className="text-xl font-bold mb-2">{battle.winnerId ? "Trận chiến kết thúc!" : "Hòa!"}</div>
            <Button onClick={() => navigate("/combat")} variant="outline">Quay lại Combat</Button>
          </CardContent>
        </Card>
      )}

      {/* Battle log */}
      {log.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4" />Nhật ký chiến đấu</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {log.map((entry, i) => (
                <p key={i} className="text-xs font-mono text-muted-foreground">{entry}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Turn history */}
      {battle.turns.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Lịch sử lượt đi</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {[...battle.turns].reverse().slice(0, 10).map(t => (
                <div key={t.id} className="text-xs flex gap-2 items-center">
                  <span className="text-muted-foreground">#{t.turnNumber}</span>
                  <span>{t.actionType === "skill" ? "✨" : "⚔️"}</span>
                  {t.isMiss && <Badge variant="outline" className="text-xs">Miss</Badge>}
                  {t.isDodge && <Badge variant="outline" className="text-xs">Dodge</Badge>}
                  {t.isCritical && <Badge className="text-xs bg-red-600">CRIT!</Badge>}
                  {t.damage !== null && !t.isMiss && !t.isDodge && <span>-{t.damage} HP</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
