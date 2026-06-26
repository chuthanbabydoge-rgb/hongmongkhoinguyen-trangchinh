import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Globe, Users, Bookmark, BookmarkCheck, LogIn, Calendar, TrendingUp, ArrowLeft, Edit } from "lucide-react";
import { worldService } from "@/services/worldService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

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

export default function WorldDetail() {
  const [, params] = useRoute("/worlds/:id");
  const worldId = params?.id ?? "";
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: world, isLoading } = useQuery({ queryKey: ["world", worldId], queryFn: () => worldService.get(worldId) });
  const { data: members = [] } = useQuery({ queryKey: ["world-members", worldId], queryFn: () => worldService.listMembers(worldId) });
  const { data: presence = [] } = useQuery({ queryKey: ["world-presence", worldId], queryFn: () => worldService.getPresence(worldId), refetchInterval: 10000 });
  const { data: events = [] } = useQuery({ queryKey: ["world-events", worldId], queryFn: () => worldService.listEvents(worldId) });
  const { data: bookmarks = [] } = useQuery({ queryKey: ["world-bookmarks"], queryFn: () => worldService.listBookmarks() });

  const isBookmarked = bookmarks.some(b => b.worldId === worldId);

  const joinMut = useMutation({
    mutationFn: () => worldService.travel(worldId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["world-dashboard"] }); toast({ title: "Đã tham gia world!" }); },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  const bookmarkMut = useMutation({
    mutationFn: () => isBookmarked ? worldService.removeBookmark(worldId) : worldService.addBookmark(worldId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["world-bookmarks"] }); toast({ title: isBookmarked ? "Đã bỏ đánh dấu" : "Đã đánh dấu" }); },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return (
    <div className="flex min-h-screen bg-background"><Sidebar /><div className="flex-1 flex flex-col"><Header /><main className="flex-1 p-8"><div className="max-w-3xl mx-auto h-64 rounded-xl bg-white/5 animate-pulse" /></main></div></div>
  );

  if (!world) return (
    <div className="flex min-h-screen bg-background"><Sidebar /><div className="flex-1 flex flex-col"><Header /><main className="flex-1 p-8 text-center text-muted-foreground">World không tồn tại.</main></div></div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <Link href="/worlds"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Quay lại</Button></Link>

            {/* World Header */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-6 h-6 text-primary" />
                    {world.isFeatured && <Badge className="text-xs border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">⭐ Nổi bật</Badge>}
                  </div>
                  <h1 className="text-2xl font-bold text-white">{world.name}</h1>
                  <p className="text-muted-foreground mt-2">{world.description ?? "Không có mô tả"}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <Badge className={`text-xs border ${TYPE_COLORS[world.type]}`}>{TYPE_LABELS[world.type]}</Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1"><Users className="w-4 h-4" />{world.playerCount}/{world.capacity}</span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1"><TrendingUp className="w-4 h-4" />{world.visitCount} lượt ghé</span>
                  </div>
                  {world.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {world.tags.map(tag => <span key={tag} className="text-xs text-muted-foreground/60 bg-white/5 rounded px-2 py-0.5">#{tag}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => joinMut.mutate()} disabled={joinMut.isPending} className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30">
                    <LogIn className="w-4 h-4 mr-1" />{joinMut.isPending ? "Đang vào..." : "Tham gia"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => bookmarkMut.mutate()} disabled={bookmarkMut.isPending}>
                    {isBookmarked ? <><BookmarkCheck className="w-4 h-4 mr-1 text-primary" />Đã đánh dấu</> : <><Bookmark className="w-4 h-4 mr-1" />Đánh dấu</>}
                  </Button>
                  <Link href={`/worlds/${worldId}/edit`}><Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" />Chỉnh sửa</Button></Link>
                </div>
              </div>
            </div>

            {/* Online Players */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Đang online ({presence.length})
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-1" />
              </h2>
              {presence.length === 0 ? <p className="text-sm text-muted-foreground">Không có ai online.</p> : (
                <div className="flex flex-wrap gap-2">
                  {presence.map(p => (
                    <div key={p.userId} className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1 text-sm">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-white/80 font-mono text-xs">{p.userId.slice(0, 8)}...</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Events */}
            {events.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h2 className="font-semibold text-white mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />Sự kiện ({events.length})</h2>
                <div className="space-y-2">
                  {events.map(ev => (
                    <div key={ev.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm">{ev.name}</div>
                        <div className="text-xs text-muted-foreground">{new Date(ev.startAt).toLocaleString("vi-VN")}</div>
                      </div>
                      <Badge className="text-xs">{ev.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h2 className="font-semibold text-white mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-primary" />Thành viên ({members.length})</h2>
              {members.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có thành viên.</p> : (
                <div className="space-y-2">
                  {members.slice(0, 10).map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                      <div className="flex-1">
                        <div className="font-mono text-white text-xs">{m.userId.slice(0, 12)}...</div>
                      </div>
                      <Badge className="text-xs capitalize">{m.role}</Badge>
                      <span className="text-xs text-muted-foreground">{m.visitCount} lượt</span>
                    </div>
                  ))}
                  {members.length > 10 && <p className="text-xs text-muted-foreground text-center">+{members.length - 10} thành viên khác</p>}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
