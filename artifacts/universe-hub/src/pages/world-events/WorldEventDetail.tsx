import { useParams } from "wouter";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Globe, Users, Star, Play, CheckCircle2, Trophy, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function WorldEventDetail() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [contribution, setContribution] = useState("10");

  const { data: res, isLoading } = useQuery({
    queryKey: ["world-event", id],
    queryFn: () => fetch(`/api/world-events/${id}`).then(r => r.json()),
    refetchInterval: 5000,
  });

  const event = res?.data;
  const authH = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

  const joinMutation = useMutation({
    mutationFn: () => fetch(`/api/world-events/${id}/join`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.ok) { qc.invalidateQueries({ queryKey: ["world-event", id] }); toast({ title: "Đã tham gia sự kiện!" }); }
      else toast({ title: d.error as string, variant: "destructive" });
    },
  });

  const startMutation = useMutation({
    mutationFn: () => fetch(`/api/world-events/${id}/start`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.ok) { qc.invalidateQueries({ queryKey: ["world-event", id] }); toast({ title: "Sự kiện đã bắt đầu!" }); }
      else toast({ title: d.error as string, variant: "destructive" });
    },
  });

  const contributeMutation = useMutation({
    mutationFn: (objectiveId: string) => fetch(`/api/world-events/${id}/contribute`, {
      method: "POST", headers: authH, body: JSON.stringify({ objectiveId, amount: parseInt(contribution) || 10 }),
    }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.ok) { qc.invalidateQueries({ queryKey: ["world-event", id] }); toast({ title: "Đã đóng góp vào mục tiêu!" }); }
      else toast({ title: d.error as string, variant: "destructive" });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (success: boolean) => fetch(`/api/world-events/${id}/complete`, {
      method: "POST", headers: authH, body: JSON.stringify({ success }),
    }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.ok) { qc.invalidateQueries({ queryKey: ["world-event", id] }); toast({ title: d.data?.status === "COMPLETED" ? "Sự kiện hoàn thành! 🎉" : "Sự kiện thất bại" }); }
      else toast({ title: d.error as string, variant: "destructive" });
    },
  });

  if (isLoading) return <div className="p-6 text-gray-400">Đang tải...</div>;
  if (!event) return <div className="p-6 text-gray-400">Không tìm thấy sự kiện</div>;

  const STATUS_BADGE: Record<string, string> = { UPCOMING: "Sắp diễn ra", ACTIVE: "Đang diễn ra", COMPLETED: "Hoàn thành", FAILED: "Thất bại" };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{event.icon ?? "🌍"}</span>
        <div>
          <h1 className="text-xl font-bold text-white">{event.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={event.status === "ACTIVE" ? "default" : "secondary"}>{STATUS_BADGE[event.status as string] ?? event.status}</Badge>
            <span className="text-xs text-gray-400">{event.type} {event.region && `• ${event.region}`}</span>
          </div>
        </div>
      </div>

      <p className="text-gray-300 text-sm">{event.description}</p>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Users className="w-4 h-4 text-blue-400" />, label: "Người tham gia", value: `${event.participantCount ?? 0}/${event.maxParticipants}` },
          { icon: <Star className="w-4 h-4 text-yellow-400" />, label: "Credits", value: event.rewardCredits?.toLocaleString() },
          { icon: <Trophy className="w-4 h-4 text-purple-400" />, label: "XP", value: event.rewardXp?.toLocaleString() },
        ].map((s, i) => (
          <Card key={i} className="bg-gray-900 border-gray-700">
            <CardContent className="p-3 flex items-center gap-2">
              {s.icon}<div><p className="text-xs text-gray-400">{s.label}</p><p className="text-white text-sm font-semibold">{s.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Objectives */}
      {event.objectives && event.objectives.length > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader><CardTitle className="text-sm text-gray-300">Mục tiêu sự kiện</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {event.objectives.map((obj: { id: string; name: string; current: number; target: number; isComplete: boolean }) => (
              <div key={obj.id}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="flex items-center gap-2 text-white">
                    {obj.isComplete ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Globe className="w-4 h-4 text-gray-400" />}
                    {obj.name}
                  </span>
                  <span className={obj.isComplete ? "text-green-400" : "text-gray-400"}>{obj.current}/{obj.target}</span>
                </div>
                <Progress value={(obj.current / obj.target) * 100} className="h-2 bg-gray-700" />
                {event.status === "ACTIVE" && !obj.isComplete && (
                  <div className="flex items-center gap-2 mt-2">
                    <input type="number" value={contribution} onChange={e => setContribution(e.target.value)}
                      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs w-20" />
                    <Button size="sm" className="text-xs" onClick={() => contributeMutation.mutate(obj.id)} disabled={contributeMutation.isPending}>
                      Đóng góp
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {event.status !== "COMPLETED" && event.status !== "FAILED" && (
          <Button className="gap-2 bg-blue-600 hover:bg-blue-500" onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending}>
            <LogIn className="w-4 h-4" />Tham gia sự kiện
          </Button>
        )}
        {event.status === "UPCOMING" && (
          <Button variant="outline" className="gap-2" onClick={() => startMutation.mutate()} disabled={startMutation.isPending}>
            <Play className="w-4 h-4" />Bắt đầu sự kiện
          </Button>
        )}
        {event.status === "ACTIVE" && (
          <div className="grid grid-cols-2 gap-2">
            <Button className="gap-2 bg-green-600 hover:bg-green-500" onClick={() => completeMutation.mutate(true)} disabled={completeMutation.isPending}>
              <CheckCircle2 className="w-4 h-4" />Hoàn thành
            </Button>
            <Button variant="outline" onClick={() => completeMutation.mutate(false)} disabled={completeMutation.isPending}>Thất bại</Button>
          </div>
        )}
      </div>
    </div>
  );
}
