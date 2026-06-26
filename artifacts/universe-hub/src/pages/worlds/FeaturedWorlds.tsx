import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Star, Globe, Users, TrendingUp, ArrowLeft } from "lucide-react";
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

export default function FeaturedWorlds() {
  const { data: worlds = [], isLoading } = useQuery({
    queryKey: ["worlds-featured"],
    queryFn: () => worldService.featured(20),
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <Link href="/worlds"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Quay lại</Button></Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" /> Worlds Nổi Bật
            </h1>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="h-36 rounded-xl bg-white/5 animate-pulse" />)}
              </div>
            ) : worlds.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Chưa có world nổi bật.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {worlds.map(w => (
                  <Link key={w.id} href={`/worlds/${w.id}`}>
                    <div className="bg-gradient-to-br from-yellow-500/10 to-white/5 border border-yellow-500/20 rounded-xl p-4 hover:border-yellow-500/40 transition-all cursor-pointer group">
                      <div className="flex items-start gap-2 mb-2">
                        <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <h3 className="font-semibold text-white group-hover:text-yellow-400 transition-colors">{w.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-3">{w.description ?? "Không có mô tả"}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-xs border ${TYPE_COLORS[w.type]}`}>{TYPE_LABELS[w.type]}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{w.playerCount}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" />{w.visitCount}</span>
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
