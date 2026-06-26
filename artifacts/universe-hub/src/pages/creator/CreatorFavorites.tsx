import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Loader2, Eye, GitFork, StarOff } from "lucide-react";
import { Link } from "wouter";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string; name: string; description?: string; type: string;
  viewCount: number; forkCount: number; likeCount: number; createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  WORLD: "🌍", NPC: "🤖", QUEST: "📜", BUSINESS: "🏪", STORY: "📖",
  EVENT: "🎪", TOURNAMENT: "🏆", SHOP: "🛒", GUILD: "⚔️", DUNGEON: "🏰",
};

export default function CreatorFavorites() {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ ok: boolean; data: Project[] }>({
    queryKey: ["creator", "favorites"],
    queryFn: async () => {
      const res = await fetch("/api/creator/projects/favorites", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json() as Promise<{ ok: boolean; data: Project[] }>;
    },
    enabled: !!accessToken,
  });

  const unfavoriteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/creator/projects/${id}/favorite`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["creator", "favorites"] });
      toast({ title: "Đã bỏ yêu thích" });
    },
  });

  const projects = data?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />Yêu thích
            </h1>

            {isLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : projects.length === 0 ? (
              <div className="text-center py-16">
                <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Chưa có project yêu thích nào</p>
                <Link href="/creator/explore">
                  <Button variant="outline" size="sm" className="mt-4">Khám phá Projects</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(p => (
                  <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{TYPE_ICONS[p.type] ?? "🎨"}</span>
                      <div className="flex-1 min-w-0">
                        <Link href={`/creator/projects/${p.id}`}>
                          <p className="font-semibold text-white hover:text-primary cursor-pointer truncate">{p.name}</p>
                        </Link>
                        <p className="text-xs text-muted-foreground">{p.type}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-yellow-400 hover:text-yellow-300"
                        onClick={() => unfavoriteMutation.mutate(p.id)}>
                        <StarOff className="w-4 h-4" />
                      </Button>
                    </div>
                    {p.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{p.viewCount}</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" />{p.likeCount}</span>
                      <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{p.forkCount}</span>
                    </div>
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
