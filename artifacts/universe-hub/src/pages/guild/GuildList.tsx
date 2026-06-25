import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Shield, Search, Plus, Users, Star, Trophy } from "lucide-react";
import { guildService, type Guild } from "@/services/guildService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

function GuildCard({ guild }: { guild: Guild }) {
  return (
    <Link href={`/guild/${guild.id}`}>
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 hover:border-primary/30 transition-all cursor-pointer group">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-2xl">
            {guild.avatar ? (
              <img src={guild.avatar} alt={guild.name} className="w-full h-full rounded-xl object-cover" />
            ) : (
              <Shield className="w-7 h-7 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white group-hover:text-primary transition-colors truncate">{guild.name}</span>
              <Badge variant="outline" className="text-[10px] font-mono border-white/20 text-muted-foreground flex-shrink-0">[{guild.tag}]</Badge>
              <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground flex-shrink-0">
                {guild.visibility === "PUBLIC" ? "Công khai" : guild.visibility === "INVITE_ONLY" ? "Chỉ mời" : "Riêng tư"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{guild.description ?? "Không có mô tả."}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-500" /> Lv.{guild.level}</span>
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-blue-400" /> {guild.reputation} REP</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3 text-green-400" /> {guild.memberLimit} max</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function GuildList() {
  const [search, setSearch] = useState("");
  const { data: guilds = [], isLoading } = useQuery({
    queryKey: ["guilds", search],
    queryFn: () => guildService.listGuilds(search || undefined),
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Shield className="w-6 h-6 text-primary" /> Universe Guild
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Khám phá và tham gia các guild trong hệ sinh thái</p>
              </div>
              <Link href="/guild/create">
                <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Tạo Guild</Button>
              </Link>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm guild theo tên hoặc tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white/5 border-white/10"
              />
            </div>

            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />)}</div>
            ) : guilds.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Chưa có guild nào.</p>
              </div>
            ) : (
              <div className="space-y-3">{guilds.map(g => <GuildCard key={g.id} guild={g} />)}</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
