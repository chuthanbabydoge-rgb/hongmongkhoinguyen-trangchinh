import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Sword, Shield, Skull, Zap, Heart, Users, Play, Trophy, RotateCcw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export default function DungeonRoom() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, navigate] = useLocation();

  const { data: res, isLoading } = useQuery({
    queryKey: ["dungeon-instance", id],
    queryFn: () => fetch(`/api/dungeons/${id}`).then(r => r.json()),
    refetchInterval: 5000,
  });

  const inst = res?.data;

  const authHeaders = { Authorization: `Bearer ${accessToken}` };

  const startMutation = useMutation({
    mutationFn: () => fetch(`/api/dungeons/${id}/start`, { method: "POST", headers: authHeaders }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.ok) { qc.invalidateQueries({ queryKey: ["dungeon-instance", id] }); toast({ title: "Dungeon đã bắt đầu!" }); }
      else toast({ title: d.error as string, variant: "destructive" });
    },
  });

  const spawnBossMutation = useMutation({
    mutationFn: () => fetch(`/api/dungeons/${id}/spawn-boss`, { method: "POST", headers: authHeaders }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.ok) { qc.invalidateQueries({ queryKey: ["dungeon-instance", id] }); toast({ title: `Boss "${(d.data as { name: string }).name}" xuất hiện!` }); }
      else toast({ title: d.error as string, variant: "destructive" });
    },
  });

  const killBossMutation = useMutation({
    mutationFn: () => fetch(`/api/dungeons/${id}/kill-boss`, { method: "POST", headers: authHeaders }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.ok) { qc.invalidateQueries({ queryKey: ["dungeon-instance", id] }); toast({ title: "Boss đã bị tiêu diệt!" }); }
      else toast({ title: d.error as string, variant: "destructive" });
    },
  });

  const finishMutation = useMutation({
    mutationFn: (success: boolean) => fetch(`/api/dungeons/${id}/finish`, {
      method: "POST", headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ success }),
    }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.ok) {
        qc.invalidateQueries({ queryKey: ["dungeon-instance", id] });
        toast({ title: d.data?.instance?.status === "COMPLETED" ? "Dungeon hoàn thành! 🎉" : "Dungeon thất bại!" });
        setTimeout(() => navigate("/dungeons/history"), 2000);
      } else toast({ title: d.error as string, variant: "destructive" });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => fetch(`/api/dungeons/${id}/leave`, { method: "POST", headers: authHeaders }).then(r => r.json()),
    onSuccess: () => navigate("/dungeons"),
  });

  if (isLoading) return <div className="p-6 text-gray-400">Đang tải...</div>;
  if (!inst) return <div className="p-6 text-gray-400">Không tìm thấy dungeon</div>;

  const STATUS_LABELS: Record<string, string> = { WAITING: "Đang chờ", ACTIVE: "Đang chiến đấu", COMPLETED: "Hoàn thành", FAILED: "Thất bại", EXPIRED: "Hết hạn" };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{inst.dungeon?.icon ?? "⚔️"}</span>
          <div>
            <h1 className="text-xl font-bold text-white">{inst.dungeon?.name ?? "Dungeon"}</h1>
            <p className="text-sm text-gray-400">{STATUS_LABELS[inst.status as string] ?? inst.status} • {inst.difficulty}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="gap-2 text-gray-400" onClick={() => leaveMutation.mutate()}>
          <LogOut className="w-4 h-4" />Rời phòng
        </Button>
      </div>

      {/* Dungeon Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Users className="w-4 h-4 text-blue-400" />, label: "Thành viên", value: `${inst.memberCount ?? 1}/${inst.dungeon?.maxPlayers ?? 5}` },
          { icon: <Shield className="w-4 h-4 text-green-400" />, label: "Độ khó", value: inst.difficulty },
          { icon: <Trophy className="w-4 h-4 text-yellow-400" />, label: "Credits", value: inst.dungeon?.rewardCredits ?? 0 },
          { icon: <Zap className="w-4 h-4 text-purple-400" />, label: "XP", value: inst.dungeon?.rewardXp ?? 0 },
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

      {/* Action Buttons */}
      {inst.status === "WAITING" && (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4 space-y-2">
            <p className="text-gray-300 text-sm">Phòng đang chờ thành viên. Leader có thể bắt đầu.</p>
            <Button className="w-full gap-2 bg-green-600 hover:bg-green-500" onClick={() => startMutation.mutate()} disabled={startMutation.isPending}>
              <Play className="w-4 h-4" />Bắt đầu Dungeon
            </Button>
          </CardContent>
        </Card>
      )}

      {inst.status === "ACTIVE" && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader><CardTitle className="text-sm text-yellow-400">⚔️ Chiến đấu</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="gap-2" onClick={() => spawnBossMutation.mutate()} disabled={spawnBossMutation.isPending}>
                <Skull className="w-4 h-4 text-red-400" />Triệu hồi Boss
              </Button>
              <Button variant="outline" className="gap-2 border-red-500/50 text-red-400" onClick={() => killBossMutation.mutate()} disabled={killBossMutation.isPending}>
                <Sword className="w-4 h-4" />Tiêu diệt Boss
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700">
              <Button className="gap-2 bg-green-600 hover:bg-green-500" onClick={() => finishMutation.mutate(true)} disabled={finishMutation.isPending}>
                <Trophy className="w-4 h-4" />Hoàn thành
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => finishMutation.mutate(false)} disabled={finishMutation.isPending}>
                <RotateCcw className="w-4 h-4" />Thất bại
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(inst.status === "COMPLETED" || inst.status === "FAILED") && (
        <Card className={`border ${inst.status === "COMPLETED" ? "bg-green-900/20 border-green-500/30" : "bg-red-900/20 border-red-500/30"}`}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl mb-2">{inst.status === "COMPLETED" ? "🎉" : "💀"}</p>
            <p className="text-white font-semibold">{inst.status === "COMPLETED" ? "Dungeon hoàn thành!" : "Dungeon thất bại!"}</p>
            <Button className="mt-3 gap-2" onClick={() => navigate("/dungeons")}>
              <Sword className="w-4 h-4" />Quay lại
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
