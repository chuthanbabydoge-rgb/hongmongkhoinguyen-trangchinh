import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Palette, Plus, Eye, Star, Package, Globe, ArrowRight, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface CreatorDashboard {
  projects: Project[];
  published: number;
  assets: number;
  favorites: number;
  totalViews: number;
  recentActivity: Project[];
}

interface Project {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  thumbnail?: string;
  viewCount: number;
  forkCount: number;
  likeCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  WORLD: "🌍", NPC: "🤖", QUEST: "📜", BUSINESS: "🏪", STORY: "📖",
  EVENT: "🎪", TOURNAMENT: "🏆", SHOP: "🛒", GUILD: "⚔️", DUNGEON: "🏰",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-yellow-400", PRIVATE: "text-gray-400", PUBLIC: "text-blue-400",
  PUBLISHED: "text-green-400", ARCHIVED: "text-red-400",
};

export default function CreatorDashboard() {
  const { accessToken } = useAuth();

  const { data: dashData, isLoading } = useQuery<{ ok: boolean; data: CreatorDashboard }>({
    queryKey: ["creator", "dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/creator/dashboard", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json() as Promise<{ ok: boolean; data: CreatorDashboard }>;
    },
    enabled: !!accessToken,
  });

  const dash = dashData?.data;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Universe Creator</h1>
                  <p className="text-sm text-muted-foreground">Tạo và quản lý dự án sáng tạo</p>
                </div>
              </div>
              <Link href="/creator/studio">
                <Button className="gap-2"><Plus className="w-4 h-4" />Tạo Project</Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Projects", value: dash?.projects.length ?? 0, icon: Palette, color: "text-blue-400" },
                    { label: "Published", value: dash?.published ?? 0, icon: Globe, color: "text-green-400" },
                    { label: "Assets", value: dash?.assets ?? 0, icon: Package, color: "text-purple-400" },
                    { label: "Favorites", value: dash?.favorites ?? 0, icon: Star, color: "text-yellow-400" },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-white flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" />
                      Projects gần đây
                    </h2>
                    <Link href="/creator/projects">
                      <span className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">
                        Xem tất cả <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  </div>
                  {!dash?.projects.length ? (
                    <div className="text-center py-10">
                      <Palette className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">Chưa có project nào. Hãy tạo project đầu tiên!</p>
                      <Link href="/creator/studio">
                        <Button variant="outline" size="sm" className="mt-4">
                          <Plus className="w-4 h-4 mr-1" />Tạo Project
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dash.projects.slice(0, 5).map(p => (
                        <Link key={p.id} href={`/creator/projects/${p.id}`}>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                            <span className="text-xl">{TYPE_ICONS[p.type] ?? "🎨"}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.type}</p>
                            </div>
                            <span className={`text-xs font-mono ${STATUS_COLORS[p.status] ?? "text-muted-foreground"}`}>
                              {p.status}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Eye className="w-3 h-3" />{p.viewCount}
                              <Star className="w-3 h-3" />{p.likeCount}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Studio", desc: "Tạo project mới", icon: "🎨", href: "/creator/studio" },
                    { label: "Explore", desc: "Khám phá projects công khai", icon: "🌐", href: "/creator/explore" },
                    { label: "Templates", desc: "Bắt đầu từ mẫu", icon: "📋", href: "/creator/templates" },
                  ].map(action => (
                    <Link key={action.label} href={action.href}>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-4">
                        <span className="text-3xl">{action.icon}</span>
                        <div>
                          <p className="font-medium text-white">{action.label}</p>
                          <p className="text-xs text-muted-foreground">{action.desc}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
