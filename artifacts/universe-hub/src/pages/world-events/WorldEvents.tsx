import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Globe, Users, Star, ChevronRight, Zap, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface WorldEvent {
  id: string; name: string; description: string | null; type: string; status: string;
  region: string | null; maxParticipants: number; rewardCredits: number; rewardXp: number;
  icon: string | null; participantCount?: number;
  objectives?: { id: string; name: string; target: number; current: number; isComplete: boolean }[];
}

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
  COMPLETED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  FAILED: "bg-red-500/20 text-red-400 border-red-500/30",
};
const TYPE_ICONS: Record<string, string> = {
  INVASION: "⚔️", DEFENSE: "🛡️", ESCORT: "🚢", TREASURE: "💎", WORLD_BOSS: "👹", SEASONAL: "🌟",
};

export default function WorldEvents() {
  const { data: eventsRes } = useQuery({
    queryKey: ["world-events"],
    queryFn: () => fetch("/api/world-events").then(r => r.json()),
    refetchInterval: 10000,
  });
  const { data: weatherRes } = useQuery({
    queryKey: ["weather"],
    queryFn: () => fetch("/api/weather").then(r => r.json()),
  });

  const events: WorldEvent[] = eventsRes?.data ?? [];
  const weather = weatherRes?.data;
  const activeEvents = events.filter(e => e.status === "ACTIVE");
  const upcomingEvents = events.filter(e => e.status === "UPCOMING");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-400" />Universe World Events
          </h1>
          <p className="text-gray-400 text-sm mt-1">Sự kiện thế giới — cùng nhau chiến đấu vì cộng đồng</p>
        </div>
        <div className="flex gap-2">
          <Link href="/world-events/weather"><Button variant="outline" size="sm" className="gap-2"><Cloud className="w-4 h-4" />Thời tiết</Button></Link>
          <Link href="/world-events/history"><Button variant="outline" size="sm" className="gap-2"><Star className="w-4 h-4" />Lịch sử</Button></Link>
        </div>
      </div>

      {/* Weather widget */}
      {weather && (
        <Card className="bg-blue-900/10 border-blue-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <Cloud className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-white text-sm font-medium">Thời tiết toàn cầu: <span className="text-blue-400">{weather.weather}</span></p>
              <p className="text-gray-400 text-xs">{weather.region} — Cường độ {weather.intensity}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Events */}
      {activeEvents.length > 0 && (
        <div>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-400" />Đang diễn ra ({activeEvents.length})
          </h2>
          <div className="space-y-3">
            {activeEvents.map(event => (
              <Card key={event.id} className="bg-green-900/10 border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{event.icon ?? TYPE_ICONS[event.type] ?? "🌍"}</span>
                      <div>
                        <p className="text-white font-semibold">{event.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <span>{event.type}</span>
                          {event.region && <span>• {event.region}</span>}
                          <span>• {event.participantCount ?? 0}/{event.maxParticipants} người</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/world-events/${event.id}`}>
                      <Button size="sm" className="bg-green-600 hover:bg-green-500">Tham gia</Button>
                    </Link>
                  </div>
                  {event.objectives && event.objectives.length > 0 && (
                    <div className="space-y-2">
                      {event.objectives.slice(0, 3).map(obj => (
                        <div key={obj.id}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">{obj.name}</span>
                            <span className={obj.isComplete ? "text-green-400" : "text-gray-400"}>{obj.current}/{obj.target}{obj.isComplete ? " ✅" : ""}</span>
                          </div>
                          <Progress value={(obj.current / obj.target) * 100} className="h-1.5 bg-gray-700" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div>
        <h2 className="text-white font-semibold mb-3">Sắp diễn ra ({upcomingEvents.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingEvents.map(event => (
            <Card key={event.id} className="bg-gray-900 border-gray-700 hover:border-blue-500/40 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{event.icon ?? TYPE_ICONS[event.type] ?? "🌍"}</span>
                  <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[event.status] ?? ""}`}>{event.status}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">{event.name}</h3>
                <p className="text-gray-400 text-xs mb-3 line-clamp-2">{event.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.maxParticipants} người</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />{event.rewardCredits} crd</span>
                </div>
                <Link href={`/world-events/${event.id}`}>
                  <Button size="sm" className="w-full" variant="outline">Xem chi tiết <ChevronRight className="w-3 h-3 ml-1" /></Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
