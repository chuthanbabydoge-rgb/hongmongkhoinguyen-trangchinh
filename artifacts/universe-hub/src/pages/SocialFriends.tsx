import { UserCheck, Clock, Send, CheckCircle, XCircle, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMyFriends, usePendingRequests, useSentRequests, useAcceptFriendRequest, useDeclineFriendRequest } from "@/hooks/useSocial";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

function Avatar({ displayName }: { displayName: string }) {
  const initials = displayName.slice(0, 2).toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-bold text-primary">{initials}</span>
    </div>
  );
}

export default function SocialFriends() {
  const { data: friends = [],  isLoading: loadingFriends  } = useMyFriends();
  const { data: pending = [],  isLoading: loadingPending  } = usePendingRequests();
  const { data: sent    = [],  isLoading: loadingSent     } = useSentRequests();
  const accept  = useAcceptFriendRequest();
  const decline = useDeclineFriendRequest();

  return (
    <div className="space-y-8">
      {/* Incoming requests */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-sm font-mono text-muted-foreground/60 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Lời mời đến
            <Badge className="bg-rose-400/10 text-rose-400 border-rose-400/20">{pending.length}</Badge>
          </h2>
          <div className="space-y-2">
            {pending.map(req => (
              <div key={req.id} className="glass-panel rounded-xl p-4 border border-white/5 flex items-center gap-4">
                <Avatar displayName={req.fromUserId} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{req.fromUserId}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                    onClick={() => accept.mutate(req.id)}
                    disabled={accept.isPending}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Chấp nhận
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-rose-400"
                    onClick={() => decline.mutate(req.id)}
                    disabled={decline.isPending}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Từ chối
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sent requests */}
      {sent.length > 0 && (
        <section>
          <h2 className="text-sm font-mono text-muted-foreground/60 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Send className="w-4 h-4" />
            Lời mời đã gửi
          </h2>
          <div className="space-y-2">
            {sent.map(req => (
              <div key={req.id} className="glass-panel rounded-xl p-4 border border-white/5 flex items-center gap-4">
                <Avatar displayName={req.toUserId} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{req.toUserId}</p>
                  <p className="text-xs text-muted-foreground">
                    Đã gửi {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20">Đang chờ</Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Friends list */}
      <section>
        <h2 className="text-sm font-mono text-muted-foreground/60 uppercase tracking-widest mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4" />
          Bạn bè ({friends.length})
        </h2>

        {loadingFriends && (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-panel rounded-xl p-4 border border-white/5 animate-pulse h-16" />
            ))}
          </div>
        )}

        {!loadingFriends && friends.length === 0 && (
          <div className="glass-panel rounded-xl p-10 border border-white/5 text-center">
            <UserX className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Bạn chưa có bạn bè nào.</p>
            <Link href="/social/search">
              <Button size="sm" className="mt-4">Tìm kiếm người dùng</Button>
            </Link>
          </div>
        )}

        <div className="space-y-2">
          {friends.map(rel => (
            <Link key={rel.targetId} href={`/social/profile/${rel.targetId}`}>
              <div className={cn(
                "glass-panel rounded-xl p-4 border border-white/5 flex items-center gap-4",
                "hover:border-white/10 hover:bg-white/5 transition-all cursor-pointer",
              )}>
                <Avatar displayName={rel.targetId} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{rel.targetId}</p>
                  <p className="text-xs text-muted-foreground">
                    Kết bạn từ {new Date(rel.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground/40 font-mono">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
