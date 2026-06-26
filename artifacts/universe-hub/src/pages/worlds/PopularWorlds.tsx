import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { TrendingUp, Globe, Users, ArrowLeft } from "lucide-react";
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

export default function PopularWorlds() {
  const { data: worlds = [], isLoading } = useQuery({
    queryKey: ["worlds-popular"],
    queryFn: () => worldService.popular(50),
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
              <TrendingUp className="w-6 h-6 text-primary" /> Worlds Phổ Biến
            </h1>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}
              </div>
            ) : worlds.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Chưa có world nào.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {worlds.map((w, idx) => (
                  <Link key={w.id} href={`/worlds/${w.id}`}>
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-primary/30 transition-all cursor-pointer group">
                      <div className="text-2xl font-mono font-bold text-muted-foreground/40 w-8 text-right flex-shrink-0">#{idx + 1}</div>
                      <Globe className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white group-hover:text-primary transition-colors">{w.name}</div>
                        <div className="text-sm text-muted-foreground truncate">{w.description ?? "Không có mô tả"}</div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge className={`text-xs border ${TYPE_COLORS[w.type]}`}>{TYPE_LABELS[w.type]}</Badge>
                        <span className="text-sm text-white font-semibold flex items-center gap-1"><Users className="w-4 h-4 text-primary" />{w.playerCount}</span>
                        <span className="text-xs text-muted-foreground">{w.visitCount} lượt</span>
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
