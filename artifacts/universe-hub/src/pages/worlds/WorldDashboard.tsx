import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Globe, Users, Bookmark, Clock, Compass, Star, TrendingUp, Zap, LogIn, LogOut } from "lucide-react";
import { worldService } from "@/services/worldService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

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

export default function WorldDashboard() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["world-dashboard"],
    queryFn: () => worldService.dashboard(),
  });

  const leaveMut = useMutation({
    mutationFn: (worldId: string) => worldService.leave(worldId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["world-dashboard"] }); toast({ title: "Đã rời world" }); },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" /> Universe Worlds
              </h1>
              <div className="flex gap-2">
                <Link href="/worlds/explorer"><Button variant="outline" size="sm"><Compass className="w-4 h-4 mr-1" />Khám phá</Button></Link>
                <Link href="/worlds/create"><Button size="sm" className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30">+ Tạo World</Button></Link>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />)}
              </div>
            ) : (
              <>
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm"><Users className="w-4 h-4" /> Đang online</div>
                    <div className="text-3xl font-bold text-white">{dashboard?.totalOnline ?? 0}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm"><Bookmark className="w-4 h-4" /> Đã đánh dấu</div>
                    <div className="text-3xl font-bold text-white">{dashboard?.bookmarks.length ?? 0}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm"><Clock className="w-4 h-4" /> Đã ghé thăm</div>
                    <div className="text-3xl font-bold text-white">{dashboard?.recentHistory.length ?? 0}</div>
                  </div>
                </div>

                {/* Current World */}
                {dashboard?.currentWorld ? (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-semibold text-primary flex items-center gap-2"><Zap className="w-4 h-4" /> World hiện tại</h2>
                      <Button size="sm" variant="outline" className="text-rose-400 border-rose-400/30 hover:bg-rose-400/10" onClick={() => leaveMut.mutate(dashboard.currentWorld!.id)}>
                        <LogOut className="w-4 h-4 mr-1" />Rời
                      </Button>
                    </div>
                    <Link href={`/worlds/${dashboard.currentWorld.id}`}>
                      <div className="cursor-pointer hover:opacity-80 transition-opacity">
                        <div className="text-xl font-bold text-white">{dashboard.currentWorld.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">{dashboard.currentWorld.description ?? "Không có mô tả"}</div>
                        <div className="flex items-center gap-3 mt-3">
                          <Badge className={`text-xs border ${TYPE_COLORS[dashboard.currentWorld.type]}`}>{TYPE_LABELS[dashboard.currentWorld.type]}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{dashboard.currentWorld.playerCount} người</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                    <Globe className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                    <p className="text-muted-foreground">Bạn chưa ở trong world nào.</p>
                    <Link href="/worlds/popular"><Button className="mt-3" size="sm">Khám phá worlds phổ biến</Button></Link>
                  </div>
                )}

                {/* Bookmarked Worlds */}
                {(dashboard?.bookmarks?.length ?? 0) > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-semibold text-white flex items-center gap-2"><Bookmark className="w-4 h-4 text-primary" /> Đã đánh dấu</h2>
                      <Link href="/worlds/bookmarks"><span className="text-xs text-primary hover:underline cursor-pointer">Xem tất cả</span></Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dashboard!.bookmarks.slice(0, 4).map(bm => (
                        <Link key={bm.id} href={`/worlds/${bm.world.id}`}>
                          <div className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="font-medium text-white">{bm.world.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-xs border ${TYPE_COLORS[bm.world.type]}`}>{TYPE_LABELS[bm.world.type]}</Badge>
                              <span className="text-xs text-muted-foreground"><Users className="inline w-3 h-3" /> {bm.world.playerCount}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recently Visited */}
                {(dashboard?.recentHistory?.length ?? 0) > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-semibold text-white flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Đã ghé thăm gần đây</h2>
                      <Link href="/worlds/history"><span className="text-xs text-primary hover:underline cursor-pointer">Xem tất cả</span></Link>
                    </div>
                    <div className="space-y-2">
                      {dashboard!.recentHistory.map(h => (
                        <Link key={h.id} href={`/worlds/${h.world.id}`}>
                          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer">
                            <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white truncate">{h.world.name}</div>
                              <div className="text-xs text-muted-foreground">{new Date(h.enteredAt).toLocaleString("vi-VN")}</div>
                            </div>
                            {h.durationSecs && <span className="text-xs text-muted-foreground">{Math.floor(h.durationSecs / 60)}m</span>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Worlds */}
                {(dashboard?.popularWorlds?.length ?? 0) > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-semibold text-white flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Phổ biến nhất</h2>
                      <Link href="/worlds/popular"><span className="text-xs text-primary hover:underline cursor-pointer">Xem tất cả</span></Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {dashboard!.popularWorlds.map(w => (
                        <Link key={w.id} href={`/worlds/${w.id}`}>
                          <div className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="font-medium text-white">{w.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-xs border ${TYPE_COLORS[w.type]}`}>{TYPE_LABELS[w.type]}</Badge>
                              <span className="text-xs text-muted-foreground"><Users className="inline w-3 h-3" /> {w.playerCount}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
