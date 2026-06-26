import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Globe, Search, Users, TrendingUp, Clock, Filter } from "lucide-react";
import { worldService, type WorldType, type World } from "@/services/worldService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

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

const WORLD_TYPES: WorldType[] = ["PUBLIC", "PRIVATE", "CREATOR", "OFFICIAL", "EVENT", "GUILD", "PARTY", "TRAINING"];

function WorldCard({ world }: { world: World }) {
  return (
    <Link href={`/worlds/${world.id}`}>
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-primary/30 transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate group-hover:text-primary transition-colors">{world.name}</h3>
            <p className="text-sm text-muted-foreground truncate mt-0.5">{world.description ?? "Không có mô tả"}</p>
          </div>
          {world.isFeatured && <Badge className="text-xs border bg-yellow-500/20 text-yellow-400 border-yellow-500/30 ml-2 flex-shrink-0">⭐ Nổi bật</Badge>}
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Badge className={`text-xs border ${TYPE_COLORS[world.type]}`}>{TYPE_LABELS[world.type]}</Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{world.playerCount}/{world.capacity}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" />{world.visitCount} lượt</span>
        </div>
        {world.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {world.tags.slice(0, 3).map(tag => <span key={tag} className="text-[10px] text-muted-foreground/60 bg-white/5 rounded px-1.5 py-0.5">#{tag}</span>)}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function WorldExplorer() {
  const [search, setSearch]     = useState("");
  const [typeFilter, setType]   = useState<WorldType | "">("");
  const [sortBy, setSortBy]     = useState<"playerCount" | "visitCount" | "createdAt">("playerCount");

  const { data: worlds = [], isLoading } = useQuery({
    queryKey: ["worlds-explorer", search, typeFilter, sortBy],
    queryFn: () => worldService.list({ search: search || undefined, type: typeFilter || undefined, sortBy, sortDir: "desc", limit: 50 }),
    placeholderData: [],
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Globe className="w-6 h-6 text-primary" />Khám phá Worlds</h1>
              <Link href="/worlds/create"><Button size="sm">+ Tạo World</Button></Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9 bg-white/5 border-white/10" placeholder="Tìm kiếm world..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select value={typeFilter} onChange={e => setType(e.target.value as WorldType | "")} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="">Tất cả loại</option>
                {WORLD_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="playerCount">Phổ biến nhất</option>
                <option value="visitCount">Nhiều lượt ghé</option>
                <option value="createdAt">Mới nhất</option>
              </select>
            </div>

            {/* Quick Nav */}
            <div className="flex gap-2 flex-wrap">
              <Link href="/worlds/featured"><Button variant="outline" size="sm"><Filter className="w-3 h-3 mr-1" />Nổi bật</Button></Link>
              <Link href="/worlds/popular"><Button variant="outline" size="sm"><TrendingUp className="w-3 h-3 mr-1" />Phổ biến</Button></Link>
              <Link href="/worlds/history"><Button variant="outline" size="sm"><Clock className="w-3 h-3 mr-1" />Lịch sử</Button></Link>
              <Link href="/worlds/bookmarks"><Button variant="outline" size="sm">🔖 Đã đánh dấu</Button></Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />)}
              </div>
            ) : worlds.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Không tìm thấy world nào.</p>
                <Link href="/worlds/create"><Button className="mt-4" size="sm">Tạo World đầu tiên</Button></Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {worlds.map(w => <WorldCard key={w.id} world={w} />)}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
