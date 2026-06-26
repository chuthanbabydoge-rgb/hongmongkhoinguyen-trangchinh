import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Clock, Globe, ArrowLeft, Timer } from "lucide-react";
import { worldService } from "@/services/worldService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const TYPE_COLORS: Record<string, string> = {
  PUBLIC: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PRIVATE: "bg-red-500/20 text-red-400 border-red-500/30",
  CREATOR: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  OFFICIAL: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  EVENT: "bg-green-500/20 text-green-400 border-green-500/30",
  GUILD: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  PARTY: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  TRAINING: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};
const TYPE_LABELS: Record<string, string> = {
  PUBLIC: "Công cộng", PRIVATE: "Riêng tư", CREATOR: "Sáng tạo", OFFICIAL: "Chính thức",
  EVENT: "Sự kiện", GUILD: "Guild", PARTY: "Nhóm", TRAINING: "Huấn luyện",
};

function formatDuration(secs: number | null): string {
  if (!secs) return "—";
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
}

export default function WorldTravelHistory() {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["world-travel-history"],
    queryFn: () => worldService.travelHistory(50),
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <Link href="/worlds"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Quay lại</Button></Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" /> Lịch Sử Du Hành
            </h1>
            {isLoading ? (
              <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}</div>
            ) : history.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Chưa có lịch sử du hành.</p>
                <Link href="/worlds/explorer"><Button className="mt-4" size="sm">Khám phá Worlds</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map(h => (
                  <Link key={h.id} href={`/worlds/${h.world.id}`}>
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-primary/30 transition-all cursor-pointer group">
                      <Globe className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white group-hover:text-primary transition-colors">{h.world.name}</div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge className={`text-xs border ${TYPE_COLORS[h.world.type]}`}>{TYPE_LABELS[h.world.type]}</Badge>
                          <span className="text-xs text-muted-foreground">{new Date(h.enteredAt).toLocaleString("vi-VN")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                        <Timer className="w-3 h-3" />
                        {formatDuration(h.durationSecs)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
