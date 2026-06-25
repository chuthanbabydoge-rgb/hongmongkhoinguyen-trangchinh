import { useQuery } from "@tanstack/react-query";
import { Shield, Trophy, Star, Coins, Users } from "lucide-react";
import { guildService } from "@/services/guildService";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Link } from "wouter";

const RANK_STYLE = [
  "text-yellow-400 border-yellow-400/30",
  "text-gray-300 border-gray-300/20",
  "text-orange-400 border-orange-400/30",
];

export default function GuildRankings() {
  const { data: guilds = [], isLoading } = useQuery({ queryKey: ["guild-leaderboard"], queryFn: () => guildService.leaderboard(30) });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-6"><Trophy className="w-6 h-6 text-yellow-400" /> Bảng Xếp Hạng Guild</h1>
            {isLoading ? (
              <div className="space-y-2">{Array.from({length:10}).map((_,i) => <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />)}</div>
            ) : guilds.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground"><Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Chưa có guild nào.</p></div>
            ) : (
              <div className="space-y-2">
                {guilds.map((guild, i) => (
                  <Link key={guild.id} href={`/guild/${guild.id}`}>
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-lg px-4 py-3 hover:bg-white/8 hover:border-primary/20 transition-all cursor-pointer">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm flex-shrink-0 ${i < 3 ? RANK_STYLE[i] : "text-muted-foreground border-white/10"}`}>
                        {i < 3 ? ["🥇","🥈","🥉"][i] : i + 1}
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        {guild.avatar ? <img src={guild.avatar} alt="" className="w-full h-full rounded-lg object-cover" /> : <Shield className="w-5 h-5 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white truncate">{guild.name}</span>
                          <Badge variant="outline" className="font-mono text-[10px] border-white/20">[{guild.tag}]</Badge>
                        </div>
                        <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-400" />Lv.{guild.level}</span>
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-blue-400" />{guild.reputation} REP</span>
                          <span className="flex items-center gap-1"><Coins className="w-3 h-3 text-orange-400" />{guild.xp.toLocaleString()} XP</span>
                        </div>
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
