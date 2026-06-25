import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Shield, Users, Trophy, Star, Coins, Zap, ArrowLeft, LogIn, Settings } from "lucide-react";
import { guildService } from "@/services/guildService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

interface Props { params: { id: string } }

export default function GuildDetail({ params }: Props) {
  const { id } = params;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: guild, isLoading } = useQuery({ queryKey: ["guild", id], queryFn: () => guildService.getGuild(id) });
  const { data: myGuild } = useQuery({ queryKey: ["guild-me"], queryFn: () => guildService.getMyGuild() });
  const { data: members = [] } = useQuery({ queryKey: ["guild-members", id], queryFn: () => guildService.getMembers(id) });
  const { data: announcements = [] } = useQuery({ queryKey: ["guild-announcements", id], queryFn: () => guildService.getAnnouncements(id) });
  const { data: events = [] } = useQuery({ queryKey: ["guild-events", id], queryFn: () => guildService.getEvents(id) });

  const isMember = myGuild?.guild?.id === id;

  const joinMutation = useMutation({
    mutationFn: () => guildService.join(id),
    onSuccess: () => { toast({ title: "Yêu cầu tham gia đã gửi!" }); qc.invalidateQueries({ queryKey: ["guild-me"] }); },
    onError: (err: Error) => toast({ title: "Lỗi", description: err.message, variant: "destructive" }),
  });

  const leaveMutation = useMutation({
    mutationFn: () => guildService.leave(id),
    onSuccess: () => { toast({ title: "Đã rời guild." }); qc.invalidateQueries({ queryKey: ["guild-me"] }); navigate("/guild"); },
    onError: (err: Error) => toast({ title: "Lỗi", description: err.message, variant: "destructive" }),
  });

  if (isLoading) return (
    <div className="flex min-h-screen bg-background text-foreground"><Sidebar /><div className="flex-1 flex flex-col"><Header /><div className="flex-1 flex items-center justify-center text-muted-foreground">Đang tải...</div></div></div>
  );
  if (!guild) return (
    <div className="flex min-h-screen bg-background text-foreground"><Sidebar /><div className="flex-1 flex flex-col"><Header /><div className="flex-1 flex items-center justify-center text-muted-foreground">Guild không tồn tại.</div></div></div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={() => navigate("/guild")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
            </button>

            {/* Guild Header */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {guild.banner && <img src={guild.banner} alt="banner" className="w-full h-32 object-cover" />}
              <div className="p-6">
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    {guild.avatar ? <img src={guild.avatar} alt={guild.name} className="w-full h-full rounded-xl object-cover" /> : <Shield className="w-8 h-8 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold text-white">{guild.name}</h1>
                      <Badge variant="outline" className="font-mono text-xs">[{guild.tag}]</Badge>
                      <Badge variant="outline" className="text-xs">{guild.visibility === "PUBLIC" ? "Công khai" : guild.visibility === "INVITE_ONLY" ? "Chỉ mời" : "Riêng tư"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{guild.description ?? "Không có mô tả."}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1.5 text-yellow-500"><Trophy className="w-4 h-4" /> Lv.{guild.level} ({guild.xp} XP)</span>
                      <span className="flex items-center gap-1.5 text-blue-400"><Star className="w-4 h-4" /> {guild.reputation} REP</span>
                      <span className="flex items-center gap-1.5 text-green-400"><Users className="w-4 h-4" /> {members.length}/{guild.memberLimit}</span>
                      <span className="flex items-center gap-1.5 text-orange-400"><Coins className="w-4 h-4" /> {guild.treasuryCredits.toLocaleString()} Credits</span>
                      <span className="flex items-center gap-1.5 text-purple-400"><Zap className="w-4 h-4" /> {guild.treasuryCoins.toLocaleString()} Coins</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isMember ? (
                      <>
                        <Link href={`/guild/${id}/settings`}><Button variant="outline" size="sm" className="gap-1"><Settings className="w-4 h-4" /> Cài đặt</Button></Link>
                        {myGuild?.member?.role !== "OWNER" && (
                          <Button variant="destructive" size="sm" onClick={() => leaveMutation.mutate()} disabled={leaveMutation.isPending}>Rời guild</Button>
                        )}
                      </>
                    ) : (
                      guild.visibility === "PUBLIC" && <Button size="sm" onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending} className="gap-1"><LogIn className="w-4 h-4" /> Tham gia</Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Announcements */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h2 className="font-semibold text-white mb-3">Thông báo</h2>
                {announcements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có thông báo.</p>
                ) : announcements.slice(0, 3).map(a => (
                  <div key={a.id} className="border-b border-white/5 last:border-0 py-2">
                    <p className="text-sm font-medium text-white">{a.isPinned && "📌 "}{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.content}</p>
                  </div>
                ))}
              </div>

              {/* Events */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h2 className="font-semibold text-white mb-3">Sự kiện sắp tới</h2>
                {events.filter(e => e.status === "UPCOMING").length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có sự kiện.</p>
                ) : events.filter(e => e.status === "UPCOMING").slice(0, 3).map(e => (
                  <div key={e.id} className="border-b border-white/5 last:border-0 py-2">
                    <p className="text-sm font-medium text-white">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(e.startAt).toLocaleDateString("vi-VN")} • {e.rewardPoints} điểm</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation links */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Thành viên", href: `/guild/${id}/members` },
                { label: "Kho bạc", href: `/guild/${id}/bank` },
                { label: "Sự kiện", href: `/guild/${id}/events` },
                { label: "Nhật ký", href: `/guild/${id}/logs` },
              ].map(({ label, href }) => (
                <Link key={href} href={href}><Button variant="outline" size="sm">{label}</Button></Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
