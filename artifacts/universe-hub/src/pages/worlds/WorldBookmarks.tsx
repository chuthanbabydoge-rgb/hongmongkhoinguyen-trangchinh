import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Bookmark, Globe, Users, Trash2, ArrowLeft } from "lucide-react";
import { worldService } from "@/services/worldService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

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

export default function WorldBookmarks() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ["world-bookmarks"],
    queryFn: () => worldService.listBookmarks(),
  });

  const removeMut = useMutation({
    mutationFn: (worldId: string) => worldService.removeBookmark(worldId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["world-bookmarks"] }); toast({ title: "Đã bỏ đánh dấu" }); },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
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
              <Bookmark className="w-6 h-6 text-primary" /> Worlds Đã Đánh Dấu
            </h1>
            {isLoading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}</div>
            ) : bookmarks.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Chưa có world nào được đánh dấu.</p>
                <Link href="/worlds/explorer"><Button className="mt-4" size="sm">Khám phá Worlds</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarks.map(bm => (
                  <div key={bm.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                    <Globe className="w-5 h-5 text-primary flex-shrink-0" />
                    <Link href={`/worlds/${bm.world.id}`} className="flex-1 min-w-0 cursor-pointer">
                      <div className="font-semibold text-white hover:text-primary transition-colors">{bm.world.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs border ${TYPE_COLORS[bm.world.type]}`}>{TYPE_LABELS[bm.world.type]}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{bm.world.playerCount}</span>
                      </div>
                    </Link>
                    <Button variant="ghost" size="sm" className="text-rose-400 hover:bg-rose-400/10 flex-shrink-0" onClick={() => removeMut.mutate(bm.worldId)} disabled={removeMut.isPending}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
