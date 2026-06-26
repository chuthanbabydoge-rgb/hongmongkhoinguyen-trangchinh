import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Globe, Users, Bookmark, Clock, TrendingUp } from "lucide-react";
import { worldService } from "@/services/worldService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TYPE_LABELS: Record<string, string> = {
  PUBLIC: "Công cộng", PRIVATE: "Riêng tư", CREATOR: "Sáng tạo", OFFICIAL: "Chính thức",
  EVENT: "Sự kiện", GUILD: "Guild", PARTY: "Nhóm", TRAINING: "Huấn luyện",
};
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

export function WorldWidget() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["world-dashboard"],
    queryFn: () => worldService.dashboard(),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <span className="font-semibold text-white">Universe Worlds</span>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-8 rounded bg-white/5 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <span className="font-semibold text-white">Universe Worlds</span>
        </div>
        <Link href="/worlds"><span className="text-xs text-primary hover:underline cursor-pointer">Xem tất cả →</span></Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-white">{dashboard?.totalOnline ?? 0}</div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5"><Users className="w-2.5 h-2.5" />Online</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-white">{dashboard?.bookmarks.length ?? 0}</div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5"><Bookmark className="w-2.5 h-2.5" />Đánh dấu</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-white">{dashboard?.recentHistory.length ?? 0}</div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5"><Clock className="w-2.5 h-2.5" />Ghé thăm</div>
        </div>
      </div>

      {/* Current World */}
      {dashboard?.currentWorld ? (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="text-[10px] text-primary font-mono uppercase mb-1">World hiện tại</div>
          <Link href={`/worlds/${dashboard.currentWorld.id}`}>
            <div className="font-semibold text-white hover:text-primary transition-colors cursor-pointer">{dashboard.currentWorld.name}</div>
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={`text-[10px] border ${TYPE_COLORS[dashboard.currentWorld.type]}`}>{TYPE_LABELS[dashboard.currentWorld.type]}</Badge>
            <span className="text-[10px] text-muted-foreground"><Users className="inline w-2.5 h-2.5" /> {dashboard.currentWorld.playerCount}</span>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-2">Chưa ở trong world nào</div>
      )}

      {/* Bookmarked */}
      {(dashboard?.bookmarks.length ?? 0) > 0 && (
        <div>
          <div className="text-[10px] text-muted-foreground/60 uppercase font-mono mb-2">Đã đánh dấu</div>
          <div className="space-y-1">
            {dashboard!.bookmarks.slice(0, 3).map(bm => (
              <Link key={bm.id} href={`/worlds/${bm.world.id}`}>
                <div className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 transition-colors cursor-pointer">
                  <Globe className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-white/80 truncate flex-1">{bm.world.name}</span>
                  <span className="text-[10px] text-muted-foreground"><Users className="inline w-2.5 h-2.5" /> {bm.world.playerCount}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Link href="/worlds/explorer" className="flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs"><TrendingUp className="w-3 h-3 mr-1" />Khám phá</Button>
        </Link>
        <Link href="/worlds/create" className="flex-1">
          <Button size="sm" className="w-full text-xs bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30">+ Tạo</Button>
        </Link>
      </div>
    </div>
  );
}
