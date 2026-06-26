import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { History, Globe, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WorldEventHistory() {
  const { accessToken } = useAuth();
  const { data: res, isLoading } = useQuery({
    queryKey: ["world-events-history"],
    queryFn: () => fetch("/api/world-events/history", { headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json()),
    enabled: !!accessToken,
  });
  const history = res?.data ?? [];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-blue-400" /><h1 className="text-xl font-bold text-white">Lịch sử Sự Kiện</h1>
      </div>
      {isLoading && <p className="text-gray-400">Đang tải...</p>}
      {!isLoading && history.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Globe className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>Chưa có lịch sử sự kiện</p>
        </div>
      )}
      <div className="space-y-2">
        {history.map((event: { id: string; name: string; type: string; status: string; icon: string | null; rewardCredits: number; createdAt: string }) => (
          <Card key={event.id} className="bg-gray-900 border-gray-700">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{event.icon ?? "🌍"}</span>
                <div>
                  <p className="text-white text-sm font-medium">{event.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                    <span>{event.type}</span>
                    <span>{new Date(event.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-sm">{event.rewardCredits} crd</span>
                <Badge variant={event.status === "COMPLETED" ? "default" : event.status === "ACTIVE" ? "secondary" : "destructive"} className="text-xs">
                  {event.status === "COMPLETED" ? <><Trophy className="w-3 h-3 mr-1" />Hoàn thành</> : event.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
