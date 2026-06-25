import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Shield, Crown, Star } from "lucide-react";
import { useLocation } from "wouter";
import { guildService, type GuildRole } from "@/services/guildService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

const ROLE_COLORS: Record<GuildRole, string> = {
  OWNER:   "text-yellow-400",
  LEADER:  "text-orange-400",
  OFFICER: "text-blue-400",
  ELDER:   "text-purple-400",
  MEMBER:  "text-green-400",
  RECRUIT: "text-muted-foreground",
};

const ROLE_LABELS: Record<GuildRole, string> = {
  OWNER:   "Chủ sở hữu",
  LEADER:  "Thủ lĩnh",
  OFFICER: "Sĩ quan",
  ELDER:   "Trưởng lão",
  MEMBER:  "Thành viên",
  RECRUIT: "Tân binh",
};

interface Props { params: { id: string } }

export default function GuildMembers({ params }: Props) {
  const { id } = params;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: guild } = useQuery({ queryKey: ["guild", id], queryFn: () => guildService.getGuild(id) });
  const { data: members = [], isLoading } = useQuery({ queryKey: ["guild-members", id], queryFn: () => guildService.getMembers(id) });
  const { data: myGuild } = useQuery({ queryKey: ["guild-me"], queryFn: () => guildService.getMyGuild() });
  const myRole = myGuild?.guild?.id === id ? myGuild.member.role : null;

  const kickMutation = useMutation({
    mutationFn: (targetUserId: string) => guildService.kick(id, targetUserId),
    onSuccess: () => { toast({ title: "Đã kick thành viên." }); qc.invalidateQueries({ queryKey: ["guild-members", id] }); },
    onError: (err: Error) => toast({ title: "Lỗi", description: err.message, variant: "destructive" }),
  });

  const canKick = myRole && ["OWNER", "LEADER", "OFFICER"].includes(myRole);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-2xl mx-auto">
            <button onClick={() => navigate(`/guild/${id}`)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> {guild?.name ?? "Guild"}
            </button>
            <h1 className="text-xl font-bold text-white flex items-center gap-2 mb-6"><Shield className="w-5 h-5 text-primary" /> Thành viên</h1>

            {isLoading ? (
              <div className="space-y-2">{Array.from({length:5}).map((_,i) => <div key={i} className="h-14 rounded-lg bg-white/5 animate-pulse" />)}</div>
            ) : (
              <div className="space-y-2">
                {members.sort((a, b) => {
                  const ranks: Record<GuildRole, number> = { OWNER: 6, LEADER: 5, OFFICER: 4, ELDER: 3, MEMBER: 2, RECRUIT: 1 };
                  return (ranks[b.role] ?? 0) - (ranks[a.role] ?? 0);
                }).map(m => (
                  <div key={m.userId} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      {m.role === "OWNER" ? <Crown className="w-4 h-4 text-yellow-400" /> : m.role === "LEADER" ? <Star className="w-4 h-4 text-orange-400" /> : <Shield className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">{m.userId}</span>
                        <Badge variant="outline" className={`text-[10px] ${ROLE_COLORS[m.role]} border-current`}>{ROLE_LABELS[m.role]}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Đóng góp: {m.contribution.toLocaleString()} • Tham gia: {new Date(m.joinedAt).toLocaleDateString("vi-VN")}</p>
                    </div>
                    {canKick && m.role !== "OWNER" && m.userId !== myGuild?.member?.userId && (
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs"
                        onClick={() => kickMutation.mutate(m.userId)} disabled={kickMutation.isPending}>
                        Kick
                      </Button>
                    )}
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
