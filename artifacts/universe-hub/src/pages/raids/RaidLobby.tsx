import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Swords, Users, Plus, LogIn, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const RAID_ROLES = ["TANK", "HEALER", "DPS", "SUPPORT"];
const DIFFICULTIES = ["NORMAL", "HEROIC", "MYTHIC", "NIGHTMARE"];

export default function RaidLobby() {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const preselectedBossId = params.get("bossId") ?? "";
  const [selectedBossId, setSelectedBossId] = useState(preselectedBossId);
  const [difficulty, setDifficulty] = useState("NORMAL");
  const [role, setRole] = useState("DPS");

  const { data: bossesRes } = useQuery({
    queryKey: ["raid-bosses"],
    queryFn: () => fetch("/api/raids/bosses").then(r => r.json()),
  });

  const { data: raidsRes } = useQuery({
    queryKey: ["raids-waiting"],
    queryFn: () => fetch("/api/raids?status=WAITING").then(r => r.json()),
    refetchInterval: 5000,
  });

  const bosses = bossesRes?.data ?? [];
  const raids = (raidsRes?.data ?? []).filter((r: { raidBossId: string }) =>
    !selectedBossId || r.raidBossId === selectedBossId
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/raids", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ raidBossId: selectedBossId, difficulty }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.ok) {
        qc.invalidateQueries({ queryKey: ["raids-waiting"] });
        toast({ title: "Đã tạo raid!" });
        navigate(`/raids/${data.data.id as string}`);
      } else toast({ title: data.error as string, variant: "destructive" });
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (raidId: string) => {
      const res = await fetch(`/api/raids/${raidId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ role }),
      });
      return res.json();
    },
    onSuccess: (data, raidId) => {
      if (data.ok) navigate(`/raids/${raidId}`);
      else toast({ title: data.error as string, variant: "destructive" });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Swords className="w-5 h-5 text-red-400" />
        <h1 className="text-xl font-bold text-white">Tìm Raid</h1>
      </div>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader><CardTitle className="text-sm text-gray-300">Tạo raid mới</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Select value={selectedBossId} onValueChange={setSelectedBossId}>
            <SelectTrigger className="bg-gray-800 border-gray-600">
              <SelectValue placeholder="Chọn raid boss..." />
            </SelectTrigger>
            <SelectContent>
              {bosses.map((b: { id: string; name: string; icon: string | null }) => (
                <SelectItem key={b.id} value={b.id}>{b.icon} {b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="bg-gray-800 border-gray-600"><SelectValue /></SelectTrigger>
            <SelectContent>{DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
          <Button
            className="w-full gap-2 bg-red-600 hover:bg-red-500"
            disabled={!selectedBossId || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            <Plus className="w-4 h-4" />Tạo Raid
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-green-400" />Raid đang chờ ({raids.length})
        </h2>
        {raids.length === 0
          ? <p className="text-gray-400 text-sm text-center py-8">Chưa có raid nào. Hãy tạo raid mới!</p>
          : raids.map((raid: { id: string; raidBossId: string; difficulty: string; boss?: { name: string; icon: string | null; maxPlayers: number } }) => (
            <Card key={raid.id} className="bg-gray-900 border-gray-700 mb-2">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{raid.boss?.icon ?? "👹"}</span>
                  <div>
                    <p className="text-white text-sm font-medium">{raid.boss?.name ?? "Raid Boss"}</p>
                    <span className="text-xs text-gray-400">{raid.difficulty}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 h-8 text-xs w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>{RAID_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button size="sm" className="gap-1" onClick={() => joinMutation.mutate(raid.id)} disabled={joinMutation.isPending}>
                    <LogIn className="w-3 h-3" />Vào
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
