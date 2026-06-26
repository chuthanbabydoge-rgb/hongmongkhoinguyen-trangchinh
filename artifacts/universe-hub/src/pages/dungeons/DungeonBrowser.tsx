import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Sword, Users, Plus, LogIn, Play, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const DIFFICULTY_OPTIONS = ["NORMAL", "HARD", "ELITE", "LEGENDARY", "MYTHIC"];

export default function DungeonBrowser() {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const preselectedDungeonId = params.get("dungeonId") ?? "";
  const [selectedDungeonId, setSelectedDungeonId] = useState(preselectedDungeonId);
  const [difficulty, setDifficulty] = useState("NORMAL");

  const { data: dungeonsRes } = useQuery({
    queryKey: ["dungeons"],
    queryFn: () => fetch("/api/dungeons").then(r => r.json()),
  });

  const { data: instancesRes } = useQuery({
    queryKey: ["dungeon-instances-waiting"],
    queryFn: () => fetch("/api/dungeons/instances?status=WAITING").then(r => r.json()),
    refetchInterval: 5000,
  });

  const dungeons = dungeonsRes?.data ?? [];
  const instances = (instancesRes?.data ?? []).filter((i: { dungeonId: string }) =>
    !selectedDungeonId || i.dungeonId === selectedDungeonId
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/dungeons", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ dungeonId: selectedDungeonId, difficulty }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.ok) {
        qc.invalidateQueries({ queryKey: ["dungeon-instances-waiting"] });
        toast({ title: "Đã tạo phòng dungeon!" });
        navigate(`/dungeons/room/${data.data.id as string}`);
      } else toast({ title: data.error as string, variant: "destructive" });
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (instanceId: string) => {
      const res = await fetch(`/api/dungeons/${instanceId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json();
    },
    onSuccess: (data, instanceId) => {
      if (data.ok) navigate(`/dungeons/room/${instanceId}`);
      else toast({ title: data.error as string, variant: "destructive" });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Sword className="w-5 h-5 text-blue-400" />
        <h1 className="text-xl font-bold text-white">Tìm Dungeon</h1>
      </div>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader><CardTitle className="text-sm text-gray-300">Tạo phòng mới</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Select value={selectedDungeonId} onValueChange={setSelectedDungeonId}>
            <SelectTrigger className="bg-gray-800 border-gray-600">
              <SelectValue placeholder="Chọn dungeon..." />
            </SelectTrigger>
            <SelectContent>
              {dungeons.map((d: { id: string; name: string; icon: string | null }) => (
                <SelectItem key={d.id} value={d.id}>{d.icon} {d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            className="w-full gap-2 bg-blue-600 hover:bg-blue-500"
            disabled={!selectedDungeonId || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            <Plus className="w-4 h-4" />Tạo phòng
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-green-400" />Phòng đang chờ ({instances.length})
        </h2>
        {instances.length === 0
          ? <p className="text-gray-400 text-sm text-center py-8">Chưa có phòng nào. Hãy tạo phòng mới!</p>
          : instances.map((inst: { id: string; dungeonId: string; difficulty: string; memberCount?: number; dungeon?: { name: string; icon: string | null; maxPlayers: number } }) => (
            <Card key={inst.id} className="bg-gray-900 border-gray-700 mb-2">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{inst.dungeon?.icon ?? "⚔️"}</span>
                  <div>
                    <p className="text-white text-sm font-medium">{inst.dungeon?.name ?? "Dungeon"}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <Shield className="w-3 h-3" />{inst.difficulty}
                      <Users className="w-3 h-3" />{inst.memberCount ?? 1}/{inst.dungeon?.maxPlayers ?? 5}
                    </div>
                  </div>
                </div>
                <Button size="sm" className="gap-1" onClick={() => joinMutation.mutate(inst.id)} disabled={joinMutation.isPending}>
                  <LogIn className="w-3 h-3" />Vào
                </Button>
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  );
}
