import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Skull, Zap, Shield, Heart, Trophy, Play, LogOut, Swords, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function BossBattle() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const [damageInput, setDamageInput] = useState("5000");
  const [selectedSkill, setSelectedSkill] = useState("");

  const { data: bossRes, isLoading } = useQuery({
    queryKey: ["boss", id],
    queryFn: () => fetch(`/api/bosses/${id}`).then(r => r.json()),
    refetchInterval: 3000,
  });

  const { data: skillsRes } = useQuery({
    queryKey: ["boss-skills", id],
    queryFn: () => fetch(`/api/bosses/${id}/skills`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: participantsRes } = useQuery({
    queryKey: ["boss-participants", id],
    queryFn: () => fetch(`/api/bosses/${id}/participants`).then(r => r.json()),
    refetchInterval: 5000,
  });

  const boss = bossRes?.data;
  const skills = skillsRes?.data ?? [];
  const participants = participantsRes?.data ?? [];
  const authH = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

  const joinMutation = useMutation({
    mutationFn: () => fetch(`/api/bosses/${id}/join`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.ok) { qc.invalidateQueries({ queryKey: ["boss", id] }); toast({ title: "Đã tham chiến!" }); }
      else toast({ title: d.error as string, variant: "destructive" });
    },
  });

  const spawnMutation = useMutation({
    mutationFn: () => fetch(`/api/bosses/${id}/spawn`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.ok) { qc.invalidateQueries({ queryKey: ["boss", id] }); toast({ title: `Boss "${d.data?.name}" đã xuất hiện!` }); }
      else toast({ title: d.error as string, variant: "destructive" });
    },
  });

  const attackMutation = useMutation({
    mutationFn: () => fetch(`/api/bosses/${id}/attack`, {
      method: "POST", headers: authH,
      body: JSON.stringify({ damage: parseInt(damageInput) || 5000, skillName: selectedSkill || undefined }),
    }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.ok) {
        qc.invalidateQueries({ queryKey: ["boss", id] });
        const r = d.data as { boss: { hp: number }; phaseChanged: boolean; enraged: boolean; defeated: boolean; isCrit?: boolean };
        if (r.defeated) toast({ title: "🏆 Boss đã bị đánh bại!" });
        else if (r.enraged) toast({ title: "⚠️ Boss điên cuồng!", description: "Cẩn thận - sát thương tăng mạnh!", variant: "destructive" });
        else if (r.phaseChanged) toast({ title: `Boss chuyển giai đoạn mới!` });
        else toast({ title: `Gây ${damageInput} sát thương!${(d.data as { isCrit?: boolean }).isCrit ? " 💥 CRIT!" : ""}` });
      } else toast({ title: d.error as string, variant: "destructive" });
    },
  });

  const skillMutation = useMutation({
    mutationFn: (skillId: string) => fetch(`/api/bosses/${id}/skill`, {
      method: "POST", headers: authH, body: JSON.stringify({ skillId }),
    }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.ok) {
        qc.invalidateQueries({ queryKey: ["boss", id] });
        const r = d.data as { skillName: string; damage: number };
        toast({ title: `Boss dùng "${r.skillName}"! Gây ${r.damage} sát thương` });
      } else toast({ title: d.error as string, variant: "destructive" });
    },
  });

  if (isLoading) return <div className="p-6 text-gray-400">Đang tải...</div>;
  if (!boss) return <div className="p-6 text-gray-400">Không tìm thấy boss</div>;

  const hpPercent = Math.max(0, (boss.hp / boss.maxHp) * 100);
  const STATE_LABELS: Record<string, string> = { IDLE: "Ngủ yên", SPAWNING: "Xuất hiện", ACTIVE: "Đang hoạt động", ENRAGED: "Điên cuồng", DEAD: "Đã chết" };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{boss.icon ?? "💀"}</span>
          <div>
            <h1 className="text-xl font-bold text-white">{boss.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">{STATE_LABELS[boss.state as string] ?? boss.state} • Lv.{boss.level} • {boss.region}</span>
              {boss.isEnraged && <Badge variant="destructive">😡 Điên cuồng</Badge>}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-400" onClick={() => navigate("/bosses")}><LogOut className="w-4 h-4 mr-1" />Rời</Button>
      </div>

      {/* Boss HP */}
      <Card className={`border ${boss.isEnraged ? "bg-red-900/20 border-red-500/40" : "bg-gray-900 border-gray-700"}`}>
        <CardContent className="p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white font-semibold">{boss.name} — Giai đoạn {boss.currentPhase}/{boss.totalPhases}</span>
            <span className={boss.isEnraged ? "text-red-300" : "text-gray-300"}>{boss.hp.toLocaleString()} / {boss.maxHp.toLocaleString()} HP</span>
          </div>
          <Progress value={hpPercent} className="h-4 bg-gray-700" />
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>{hpPercent.toFixed(1)}% HP còn lại</span>
            <span>{participants.length} người tham chiến</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Zap className="w-4 h-4 text-red-400" />, label: "Tấn công", value: boss.attack?.toLocaleString() ?? "—" },
          { icon: <Shield className="w-4 h-4 text-blue-400" />, label: "Phòng thủ", value: boss.defense?.toLocaleString() ?? "—" },
          { icon: <Trophy className="w-4 h-4 text-yellow-400" />, label: "Credits", value: boss.rewardCredits?.toLocaleString() ?? "—" },
        ].map((s, i) => (
          <Card key={i} className="bg-gray-900 border-gray-700">
            <CardContent className="p-3 flex items-center gap-2">
              {s.icon}
              <div><p className="text-xs text-gray-400">{s.label}</p><p className="text-white text-sm font-semibold">{s.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      {boss.state === "IDLE" && (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4 space-y-2">
            <p className="text-gray-300 text-sm">Boss đang ngủ. Hãy triệu hồi!</p>
            <Button className="w-full gap-2 bg-orange-600 hover:bg-orange-500" onClick={() => spawnMutation.mutate()} disabled={spawnMutation.isPending}>
              <Skull className="w-4 h-4" />Triệu hồi Boss
            </Button>
          </CardContent>
        </Card>
      )}

      {(boss.state === "ACTIVE" || boss.state === "ENRAGED") && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader><CardTitle className="text-sm text-red-400 flex items-center gap-2"><Swords className="w-4 h-4" />Tấn công Boss</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <input type="number" value={damageInput} onChange={e => setDamageInput(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm" placeholder="Damage..." />
              <Button className="gap-2 bg-red-600 hover:bg-red-500" onClick={() => attackMutation.mutate()} disabled={attackMutation.isPending}>
                <Zap className="w-4 h-4" />Tấn công
              </Button>
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending}>
              <Play className="w-4 h-4" />Tham chiến
            </Button>
            {skills.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Kích hoạt skill boss (simulate):</p>
                <div className="grid grid-cols-2 gap-2">
                  {skills.slice(0, 4).map((s: { id: string; name: string; icon: string | null; damage: number }) => (
                    <Button key={s.id} variant="outline" size="sm" className="gap-1 text-xs" onClick={() => skillMutation.mutate(s.id)} disabled={skillMutation.isPending}>
                      {s.icon} {s.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {boss.state === "DEAD" && (
        <Card className="bg-gray-800/50 border-gray-600">
          <CardContent className="p-4 text-center">
            <p className="text-4xl mb-2">💀</p>
            <p className="text-white font-semibold">Boss đã bị đánh bại!</p>
            <p className="text-gray-400 text-sm mt-1">Hồi sinh lúc: {boss.nextSpawnAt ? new Date(boss.nextSpawnAt).toLocaleString("vi-VN") : "—"}</p>
            <Button className="mt-3" onClick={() => navigate("/bosses")}>Quay lại</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
