import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Activity, Skull, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function BossHistory() {
  const { accessToken } = useAuth();
  const { data: res, isLoading } = useQuery({
    queryKey: ["boss-history"],
    queryFn: () => fetch("/api/bosses/history", { headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json()),
    enabled: !!accessToken,
  });
  const history = res?.data ?? [];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-red-400" />
        <h1 className="text-xl font-bold text-white">Lịch sử Boss</h1>
      </div>
      {isLoading && <p className="text-gray-400">Đang tải...</p>}
      {!isLoading && history.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Skull className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>Chưa có lịch sử boss nào</p>
        </div>
      )}
      <div className="space-y-2">
        {history.map((entry: { id: string; bossId: string; damage: number; healing: number; phase: number; skillName: string | null; isCrit: boolean; loggedAt: string }) => (
          <Card key={entry.id} className="bg-gray-900 border-gray-700">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skull className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-white text-sm font-medium">Boss #{entry.bossId.slice(-6)}{entry.skillName ? ` — ${entry.skillName}` : ""}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(entry.loggedAt).toLocaleString("vi-VN")} • Giai đoạn {entry.phase}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-red-400 text-sm font-semibold flex items-center gap-1"><Zap className="w-3 h-3" />{entry.damage.toLocaleString()} dmg{entry.isCrit ? " 💥" : ""}</p>
                {entry.healing > 0 && <p className="text-green-400 text-xs">+{entry.healing.toLocaleString()} heal</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
