import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Swords, Heart, Zap, Trophy, RotateCcw, Play, LogOut, Shield, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function RaidBattle() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const [damageInput, setDamageInput] = useState("1000");

  const { data: res, isLoading } = useQuery({
    queryKey: ["raid-instance", id],
    queryFn: () => fetch(`/api/raids/${id}`).then(r => r.json()),
    refetchInterval: 5000,
  });

  const raid = res?.data;
  const boss = raid?.boss;
  const authH = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

  const startMutation = useMutation({
    mutationFn: () => fetch(`/api/raids/${id}/start`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.ok) { qc.invalidateQueries({ queryKey: ["raid-instance", id] }); toast({ title: "Raid đã bắt đầu!" }); }
      else toast({ title: d.error as string, variant: "destructive" });
    },
  });

  const damageMutation = useMutation({
    mutationFn: () => fetch(`/api/raids/${id}/damage`, {
      method: "POST", headers: authH, body: JSON.stringify({ damage: parseInt(damageInput) || 1000, skill: "Tấn công" }),
    }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.ok) {
        qc.invalidateQueries({ queryKey: ["raid-instance", id] });
        const data = d.data as { bossHpRemaining: number; phaseAdvanced: boolean };
        toast({ title: `Gây ${damageInput} sát thương! Boss còn ${data.bossHpRemaining.toLocaleString()} HP` });
        if (data.phaseAdvanced) toast({ title: "⚡ Boss chuyển giai đoạn mới!", variant: "default" });
      } else toast({ title: d.error as string, variant: "destructive" });
    },
  });

  const finishMutation = useMutation({
    mutationFn: (success: boolean) => fetch(`/api/raids/${id}/finish`, {
      method: "POST", headers: authH, body: JSON.stringify({ success }),
    }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.ok) {
        qc.invalidateQueries({ queryKey: ["raid-instance", id] });
        toast({ title: d.data?.status === "COMPLETED" ? "Raid thành công! 🎉" : "Raid thất bại!" });
        setTimeout(() => navigate("/raids/history"), 2000);
      } else toast({ title: d.error as string, variant: "destructive" });
    },
  });

  if (isLoading) return <div className="p-6 text-gray-400">Đang tải...</div>;
  if (!raid) return <div className="p-6 text-gray-400">Không tìm thấy raid</div>;

  const hpPercent = boss ? Math.max(0, (raid.bossHpRemaining / boss.maxHp) * 100) : 0;
  const phasePercent = boss ? (100 - (raid.currentPhase - 1) * (100 / (boss.phases || 1))) : 100;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{boss?.icon ?? "👹"}</span>
          <div>
            <h1 className="text-xl font-bold text-white">{boss?.name ?? "Raid Boss"}</h1>
            <p className="text-sm text-gray-400">{raid.status} • {raid.difficulty} • Giai đoạn {raid.currentPhase}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="gap-2 text-gray-400" onClick={() => navigate("/raids")}>
          <LogOut className="w-4 h-4" />Rời raid
        </Button>
      </div>

      {/* Boss HP */}
      {boss && (
        <Card className="bg-gray-900 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-red-400 font-semibold">{boss.name} — Giai đoạn {raid.currentPhase}/{boss.phases}</span>
              <span className="text-white">{raid.bossHpRemaining.toLocaleString()} / {boss.maxHp.toLocaleString()} HP</span>
            </div>
            <Progress value={hpPercent} className="h-3 bg-gray-700" />
            <p className="text-xs text-gray-400 mt-1">{hpPercent.toFixed(1)}% HP còn lại</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {raid.status === "WAITING" && (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4 space-y-2">
            <p className="text-gray-300 text-sm">Raid đang chờ thành viên. Leader có thể bắt đầu.</p>
            <Button className="w-full gap-2 bg-red-600 hover:bg-red-500" onClick={() => startMutation.mutate()} disabled={startMutation.isPending}>
              <Play className="w-4 h-4" />Bắt đầu Raid
            </Button>
          </CardContent>
        </Card>
      )}

      {raid.status === "ACTIVE" && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader><CardTitle className="text-sm text-red-400">⚔️ Chiến đấu</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                value={damageInput}
                onChange={e => setDamageInput(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                placeholder="Damage..."
              />
              <Button className="gap-2 bg-red-600 hover:bg-red-500" onClick={() => damageMutation.mutate()} disabled={damageMutation.isPending}>
                <Zap className="w-4 h-4" />Tấn công
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700">
              <Button className="gap-2 bg-green-600 hover:bg-green-500" onClick={() => finishMutation.mutate(true)} disabled={finishMutation.isPending}>
                <Trophy className="w-4 h-4" />Chiến thắng
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => finishMutation.mutate(false)} disabled={finishMutation.isPending}>
                <RotateCcw className="w-4 h-4" />Thất bại
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(raid.status === "COMPLETED" || raid.status === "FAILED") && (
        <Card className={`border ${raid.status === "COMPLETED" ? "bg-green-900/20 border-green-500/30" : "bg-red-900/20 border-red-500/30"}`}>
          <CardContent className="p-4 text-center">
            <p className="text-3xl mb-2">{raid.status === "COMPLETED" ? "🏆" : "💀"}</p>
            <p className="text-white font-semibold text-lg">{raid.status === "COMPLETED" ? "Raid thành công!" : "Raid thất bại!"}</p>
            <Button className="mt-3" onClick={() => navigate("/raids")}>
              <Swords className="w-4 h-4 mr-2" />Quay lại
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Skull className="w-4 h-4 text-red-400" />, label: "HP Boss", value: `${hpPercent.toFixed(0)}%` },
          { icon: <Zap className="w-4 h-4 text-yellow-400" />, label: "Giai đoạn", value: `${raid.currentPhase}/${boss?.phases ?? 1}` },
          { icon: <Shield className="w-4 h-4 text-blue-400" />, label: "Độ khó", value: raid.difficulty },
        ].map((s, i) => (
          <Card key={i} className="bg-gray-900 border-gray-700">
            <CardContent className="p-3 flex items-center gap-2">
              {s.icon}
              <div>
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="text-white text-sm font-semibold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
