import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { History, Trophy, Sword } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DungeonHistory() {
  const { accessToken } = useAuth();

  const { data: res, isLoading } = useQuery({
    queryKey: ["dungeon-history"],
    queryFn: () => fetch("/api/dungeons/history", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(r => r.json()),
    enabled: !!accessToken,
  });

  const history = res?.data ?? [];

  const STATUS_ICON: Record<string, string> = { COMPLETED: "✅", FAILED: "❌", ACTIVE: "⚔️", WAITING: "⏳", EXPIRED: "⌛" };
  const DIFF_COLOR: Record<string, string> = {
    NORMAL: "text-green-400", HARD: "text-blue-400", ELITE: "text-purple-400",
    LEGENDARY: "text-orange-400", MYTHIC: "text-red-400",
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-blue-400" />
        <h1 className="text-xl font-bold text-white">Lịch sử Dungeon</h1>
      </div>

      {isLoading && <p className="text-gray-400">Đang tải...</p>}

      {!isLoading && history.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Sword className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>Chưa có lịch sử dungeon nào</p>
        </div>
      )}

      <div className="space-y-2">
        {history.map((inst: { id: string; status: string; difficulty: string; dungeonId: string; createdAt: string; completedAt?: string | null }) => (
          <Card key={inst.id} className="bg-gray-900 border-gray-700">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{STATUS_ICON[inst.status] ?? "⚔️"}</span>
                <div>
                  <p className="text-white text-sm font-medium">Dungeon Instance</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs">
                    <span className={DIFF_COLOR[inst.difficulty] ?? "text-gray-400"}>{inst.difficulty}</span>
                    <span className="text-gray-500">{new Date(inst.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              </div>
              <Badge variant={inst.status === "COMPLETED" ? "default" : "destructive"} className="text-xs">
                {inst.status === "COMPLETED" ? <><Trophy className="w-3 h-3 mr-1" />Thành công</> : inst.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
