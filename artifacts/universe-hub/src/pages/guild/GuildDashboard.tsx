import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Shield, Users, Trophy, Star, Coins, Zap, Calendar, Bell, Plus } from "lucide-react";
import { guildService } from "@/services/guildService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Chủ sở hữu", LEADER: "Thủ lĩnh", OFFICER: "Sĩ quan",
  ELDER: "Trưởng lão", MEMBER: "Thành viên", RECRUIT: "Tân binh",
};

export default function GuildDashboard() {
  const { data: myGuild, isLoading } = useQuery({ queryKey: ["guild-me"], queryFn: () => guildService.getMyGuild() });

  const guildId = myGuild?.guild?.id;
  const { data: announcements = [] } = useQuery({
    queryKey: ["guild-announcements", guildId],
    queryFn: () => guildService.getAnnouncements(guildId!),
    enabled: !!guildId,
  });
  const { data: events = [] } = useQuery({
    queryKey: ["guild-events", guildId],
    queryFn: () => guildService.getEvents(guildId!),
    enabled: !!guildId,
  });
  const { data: contributions = [] } = useQuery({
    queryKey: ["guild-contributions", guildId],
    queryFn: () => guildService.getContributions(guildId!),
    enabled: !!guildId,
  });
  const { data: members = [] } = useQuery({
    queryKey: ["guild-members", guildId],
    queryFn: () => guildService.getMembers(guildId!),
    enabled: !!guildId,
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" /> Guild Dashboard
              </h1>
              <div className="flex gap-2">
                <Link href="/guild"><Button variant="outline" size="sm">Danh sách guild</Button></Link>
                <Link href="/guild/rankings"><Button variant="outline" size="sm">Bảng xếp hạng</Button></Link>
              </div>
            </div>

            {isLoading ? (
              <div className="h-48 rounded-xl bg-white/5 animate-pulse" />
            ) : !myGuild ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
                <h2 className="text-lg font-semibold text-white mb-2">Bạn chưa tham gia guild nào</h2>
                <p className="text-sm text-muted-foreground mb-6">Tham gia hoặc tạo guild để bắt đầu hành trình cùng đồng đội.</p>
                <div className="flex gap-3 justify-center">
                  <Link href="/guild"><Button>Tìm Guild</Button></Link>
                  <Link href="/guild/create"><Button variant="outline" className="gap-2"><Plus className="w-4 h-4" />Tạo Guild</Button></Link>
                </div>
              </div>
            ) : (
              <>
                {/* Guild Card */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                      {myGuild.guild.avatar
                        ? <img src={myGuild.guild.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
                        : <Shield className="w-8 h-8 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold text-white">{myGuild.guild.name}</h2>
                        <Badge variant="outline" className="font-mono text-xs">[{myGuild.guild.tag}]</Badge>
                        <Badge variant="outline" className="text-xs text-primary border-primary/30">
                          {ROLE_LABELS[myGuild.member.role] ?? myGuild.member.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{myGuild.guild.description ?? "Không có mô tả."}</p>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm">
                        <span className="flex items-center gap-1.5 text-yellow-500"><Trophy className="w-4 h-4" />Lv.{myGuild.guild.level}</span>
                        <span className="flex items-center gap-1.5 text-blue-400"><Star className="w-4 h-4" />{myGuild.guild.reputation} REP</span>
                        <span className="flex items-center gap-1.5 text-green-400"><Users className="w-4 h-4" />{members.length}/{myGuild.guild.memberLimit}</span>
                        <span className="flex items-center gap-1.5 text-orange-400"><Coins className="w-4 h-4" />{myGuild.guild.treasuryCredits.toLocaleString()} Credits</span>
                        <span className="flex items-center gap-1.5 text-purple-400"><Zap className="w-4 h-4" />{myGuild.guild.treasuryCoins.toLocaleString()} Coins</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Đóng góp của bạn: <span className="text-white font-semibold">{myGuild.member.contribution.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {[
                      { label: "Chi tiết", href: `/guild/${myGuild.guild.id}` },
                      { label: "Thành viên", href: `/guild/${myGuild.guild.id}/members` },
                      { label: "Kho bạc", href: `/guild/${myGuild.guild.id}/bank` },
                      { label: "Sự kiện", href: `/guild/${myGuild.guild.id}/events` },
                      { label: "Nhật ký", href: `/guild/${myGuild.guild.id}/logs` },
                      { label: "Cài đặt", href: `/guild/${myGuild.guild.id}/settings` },
                    ].map(({ label, href }) => (
                      <Link key={href} href={href}><Button variant="outline" size="sm">{label}</Button></Link>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Announcements */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h3 className="font-semibold text-white flex items-center gap-2 mb-3"><Bell className="w-4 h-4 text-yellow-400" />Thông báo gần đây</h3>
                    {announcements.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Chưa có thông báo.</p>
                    ) : announcements.slice(0, 3).map(a => (
                      <div key={a.id} className="border-b border-white/5 last:border-0 py-2">
                        <p className="text-sm font-medium text-white line-clamp-1">{a.isPinned && "📌 "}{a.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{a.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Upcoming Events */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h3 className="font-semibold text-white flex items-center gap-2 mb-3"><Calendar className="w-4 h-4 text-blue-400" />Sự kiện sắp tới</h3>
                    {events.filter(e => e.status === "UPCOMING").length === 0 ? (
                      <p className="text-sm text-muted-foreground">Chưa có sự kiện.</p>
                    ) : events.filter(e => e.status === "UPCOMING").slice(0, 3).map(e => (
                      <div key={e.id} className="border-b border-white/5 last:border-0 py-2">
                        <p className="text-sm font-medium text-white">{e.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(e.startAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })} · {e.rewardPoints} điểm</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Contributions */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3">Hoạt động đóng góp gần đây</h3>
                  {contributions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có đóng góp.</p>
                  ) : (
                    <div className="space-y-1">
                      {contributions.slice(0, 5).map(c => (
                        <div key={c.id} className="flex items-center justify-between text-sm border-b border-white/5 last:border-0 py-1.5">
                          <span className="text-white font-mono text-xs truncate">{c.userId.slice(0, 8)}…</span>
                          <span className={c.type === "CREDITS" ? "text-orange-400" : c.type === "COINS" ? "text-purple-400" : "text-blue-400"}>
                            +{c.amount} {c.type}
                          </span>
                          <span className="text-muted-foreground text-xs">{new Date(c.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
