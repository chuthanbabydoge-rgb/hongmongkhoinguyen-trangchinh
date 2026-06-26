import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Palette, Plus, Search, Eye, Star, GitFork, Trash2, Loader2, Filter } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string; name: string; description?: string; type: string; status: string;
  viewCount: number; forkCount: number; likeCount: number; isPublic: boolean;
  createdAt: string; updatedAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  WORLD: "🌍", NPC: "🤖", QUEST: "📜", BUSINESS: "🏪", STORY: "📖",
  EVENT: "🎪", TOURNAMENT: "🏆", SHOP: "🛒", GUILD: "⚔️", DUNGEON: "🏰",
};
const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-yellow-500/20 text-yellow-400", PRIVATE: "bg-gray-500/20 text-gray-400",
  PUBLIC: "bg-blue-500/20 text-blue-400", PUBLISHED: "bg-green-500/20 text-green-400",
  ARCHIVED: "bg-red-500/20 text-red-400",
};

export default function CreatorProjects() {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery<{ ok: boolean; data: Project[] }>({
    queryKey: ["creator", "projects", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/creator/projects?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json() as Promise<{ ok: boolean; data: Project[] }>;
    },
    enabled: !!accessToken,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/creator/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["creator"] });
      toast({ title: "Đã xóa project" });
    },
    onError: () => toast({ title: "Lỗi khi xóa project", variant: "destructive" }),
  });

  const projects = data?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Palette className="w-6 h-6 text-primary" />Projects của tôi
              </h1>
              <Link href="/creator/studio">
                <Button className="gap-2"><Plus className="w-4 h-4" />Tạo mới</Button>
              </Link>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9 bg-white/5 border-white/10" placeholder="Tìm kiếm project..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="">Tất cả</option>
                {["DRAFT","PRIVATE","PUBLIC","PUBLISHED","ARCHIVED"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : projects.length === 0 ? (
              <div className="text-center py-16">
                <Palette className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Không có project nào</p>
                <Link href="/creator/studio">
                  <Button variant="outline" size="sm" className="mt-4">
                    <Plus className="w-4 h-4 mr-1" />Tạo Project đầu tiên
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map(p => (
                  <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{TYPE_ICONS[p.type] ?? "🎨"}</span>
                        <div>
                          <Link href={`/creator/projects/${p.id}`}>
                            <p className="font-semibold text-white hover:text-primary cursor-pointer">{p.name}</p>
                          </Link>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] ?? ""}`}>{p.status}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 h-8 w-8"
                        onClick={() => {
                          if (confirm(`Xóa "${p.name}"?`)) deleteMutation.mutate(p.id);
                        }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {p.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{p.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{p.viewCount}</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" />{p.likeCount}</span>
                      <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{p.forkCount}</span>
                      <span className="ml-auto">{p.type}</span>
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
