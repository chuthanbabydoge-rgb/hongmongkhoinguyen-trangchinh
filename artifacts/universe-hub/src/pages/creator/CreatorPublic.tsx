import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Loader2, Eye, Star, GitFork, Search } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string; name: string; description?: string; type: string; status: string;
  viewCount: number; forkCount: number; likeCount: number; ownerId: string;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  WORLD: "🌍", NPC: "🤖", QUEST: "📜", BUSINESS: "🏪", STORY: "📖",
  EVENT: "🎪", TOURNAMENT: "🏆", SHOP: "🛒", GUILD: "⚔️", DUNGEON: "🏰",
};

export default function CreatorPublic() {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<{ ok: boolean; data: Project[] }>({
    queryKey: ["creator", "public", search],
    queryFn: async () => {
      const params = search ? `?search=${encodeURIComponent(search)}&isPublic=true` : "";
      const res = await fetch(`/api/creator/projects/public${params}`);
      return res.json() as Promise<{ ok: boolean; data: Project[] }>;
    },
  });

  const forkMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/creator/projects/${id}/fork`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json() as Promise<{ ok: boolean; error?: string }>;
    },
    onSuccess: (data) => {
      if (data.ok) {
        qc.invalidateQueries({ queryKey: ["creator"] });
        toast({ title: "Fork thành công! Project đã thêm vào của bạn." });
      } else {
        toast({ title: data.error ?? "Lỗi fork", variant: "destructive" });
      }
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
              <Globe className="w-6 h-6 text-primary" />Explore Projects
            </h1>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9 bg-white/5 border-white/10" placeholder="Tìm kiếm projects công khai..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : projects.length === 0 ? (
              <div className="text-center py-16">
                <Globe className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Không có project công khai nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(p => (
                  <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{TYPE_ICONS[p.type] ?? "🎨"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.type}</p>
                      </div>
                    </div>
                    {p.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{p.viewCount}</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" />{p.likeCount}</span>
                      <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{p.forkCount}</span>
                    </div>
                    <Button size="sm" variant="outline" className="w-full gap-1"
                      onClick={() => forkMutation.mutate(p.id)}
                      disabled={forkMutation.isPending}>
                      <GitFork className="w-3 h-3" />Fork Project
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
