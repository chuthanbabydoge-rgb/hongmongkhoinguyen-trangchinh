import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useRoute } from "wouter";
import { UserCheck, UserPlus, MessageSquare, Users, Wifi, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSocialProfile, useSendFriendRequest, useFollowUser, useUnfollowUser } from "@/hooks/useSocial";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function PresenceBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    ONLINE:  { label: "Online",  cls: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" },
    AWAY:    { label: "Away",    cls: "bg-amber-400/10   text-amber-400   border-amber-400/20"   },
    OFFLINE: { label: "Offline", cls: "bg-white/5        text-muted-foreground border-white/10"  },
  };
  const cfg = config[status] ?? config["OFFLINE"]!;
  return <Badge className={cfg.cls}>{cfg.label}</Badge>;
}

function StatBox({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof Users; color: string }) {
  return (
    <div className="glass-panel rounded-xl p-4 border border-white/5 text-center">
      <Icon className={cn("w-5 h-5 mx-auto mb-1", color)} />
      <p className="text-2xl font-bold font-mono text-white">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

export default function SocialProfile() {
  const [, params] = useRoute("/social/profile/:userId");
  const userId     = params?.userId;
  const { data: profile, isLoading } = useSocialProfile(userId);
  const sendRequest = useSendFriendRequest();
  const follow      = useFollowUser();
  const unfollow    = useUnfollowUser();
  const { toast }   = useToast();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-2xl mx-auto">
            <Link href="/social">
              <div className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-6 cursor-pointer w-fit">
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </div>
            </Link>

            {isLoading && (
              <div className="glass-panel rounded-xl p-8 border border-white/5 animate-pulse space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-full bg-white/5" />
                  <div className="space-y-2">
                    <div className="h-5 bg-white/5 rounded w-40" />
                    <div className="h-4 bg-white/5 rounded w-24" />
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !profile && (
              <div className="glass-panel rounded-xl p-10 border border-white/5 text-center">
                <p className="text-muted-foreground">Không tìm thấy hồ sơ người dùng.</p>
              </div>
            )}

            {profile && (
              <div className="space-y-6">
                {/* Header card */}
                <div className="glass-panel rounded-xl p-6 border border-white/5">
                  <div className="flex items-start gap-5">
                    <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-primary">
                          {profile.displayName.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h1 className="text-xl font-bold text-white">{profile.displayName}</h1>
                        <PresenceBadge status={profile.presence} />
                      </div>
                      <p className="text-sm text-muted-foreground font-mono truncate">{profile.userId}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-5 flex-wrap">
                    <Button
                      size="sm"
                      className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20"
                      onClick={() => sendRequest.mutate(profile.userId, {
                        onSuccess: () => toast({ title: "Đã gửi lời mời kết bạn!" }),
                        onError:   (e) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
                      })}
                      disabled={sendRequest.isPending}
                    >
                      <UserCheck className="w-4 h-4 mr-1.5" /> Kết bạn
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                      onClick={() => follow.mutate(profile.userId, {
                        onSuccess: () => toast({ title: "Đã theo dõi!" }),
                        onError:   (e) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
                      })}
                      disabled={follow.isPending}
                    >
                      <UserPlus className="w-4 h-4 mr-1.5" /> Theo dõi
                    </Button>
                    <Button size="sm" variant="ghost" className="text-muted-foreground" disabled title="Sắp ra mắt">
                      <MessageSquare className="w-4 h-4 mr-1.5" /> Nhắn tin
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatBox label="Bạn bè"         value={profile.friends}       icon={UserCheck} color="text-blue-400"    />
                  <StatBox label="Người theo dõi"  value={profile.followers}     icon={Users}     color="text-violet-400" />
                  <StatBox label="Đang theo dõi"   value={profile.following}     icon={UserPlus}  color="text-emerald-400"/>
                  <StatBox label="Bạn online"      value={profile.onlineFriends} icon={Wifi}      color="text-cyan-400"   />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
