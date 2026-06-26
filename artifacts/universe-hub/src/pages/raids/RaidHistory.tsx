import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { History, Trophy, Swords } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RaidHistory() {
  const { accessToken } = useAuth();

  const { data: res, isLoading } = useQuery({
    queryKey: ["raid-history"],
    queryFn: () => fetch("/api/raids/history", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(r => r.json()),
    enabled: !!accessToken,
  });

  const history = res?.data ?? [];

  const STATUS_ICON: Record<string, string> = { COMPLETED: "✅", FAILED: "❌", ACTIVE: "⚔️", WAITING: "⏳", EXPIRED: "⌛" };
  const DIFF_COLOR: Record<string, string> = {
    NORMAL: "text-green-400", HEROIC: "text-blue-400",
    MYTHIC: "text-purple-400", NIGHTMARE: "text-red-400",
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-red-400" />
        <h1 className="text-xl font-bold text-white">Lịch sử Raid</h1>
      </div>

      {isLoading && <p className="text-gray-400">Đang tải...</p>}

      {!isLoading && history.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Swords className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>Chưa có lịch sử raid nào</p>
        </div>
      )}

      <div className="space-y-2">
        {history.map((entry: { id: string; instanceId: string; bossId: string; result: string; role: string; damage: number; healing: number; kills: number; duration: number; completedAt: string }) => (
          <Card key={entry.id} className="bg-gray-900 border-gray-700">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{entry.result === "COMPLETED" ? "🏆" : "💀"}</span>
                <div>
                  <p className="text-white text-sm font-medium">Boss #{entry.bossId.slice(-6)} — {entry.role}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    <span>Sát thương: {entry.damage.toLocaleString()}</span>
                    <span>{new Date(entry.completedAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              </div>
              <Badge variant={entry.result === "COMPLETED" ? "default" : "destructive"} className="text-xs">
                {entry.result === "COMPLETED" ? <><Trophy className="w-3 h-3 mr-1" />Thắng</> : "Thua"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
