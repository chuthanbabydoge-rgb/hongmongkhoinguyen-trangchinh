import { useState } from "react";
import { Search, UserPlus, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSocialSearch, useSendFriendRequest, useFollowUser } from "@/hooks/useSocial";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function PresenceDot({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block w-2 h-2 rounded-full",
        status === "ONLINE" ? "bg-emerald-400" :
        status === "AWAY"   ? "bg-amber-400"   :
                              "bg-muted-foreground/30",
      )}
    />
  );
}

export default function SocialSearch() {
  const [q, setQ] = useState("");
  const { data: results = [], isLoading } = useSocialSearch(q);
  const sendRequest = useSendFriendRequest();
  const follow      = useFollowUser();
  const { toast }   = useToast();

  function handleSendRequest(userId: string) {
    sendRequest.mutate(userId, {
      onSuccess: () => toast({ title: "Đã gửi lời mời kết bạn!" }),
      onError:   (e) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
    });
  }

  function handleFollow(userId: string) {
    follow.mutate(userId, {
      onSuccess: () => toast({ title: "Đã theo dõi!" }),
      onError:   (e) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
    });
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Tìm theo tên hiển thị..."
          className="pl-10 bg-white/5 border-white/10"
        />
      </div>

      {q.length > 0 && q.length < 2 && (
        <p className="text-sm text-muted-foreground text-center">Nhập ít nhất 2 ký tự để tìm kiếm.</p>
      )}

      {isLoading && q.length >= 2 && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-panel rounded-xl p-4 border border-white/5 animate-pulse h-18" />
          ))}
        </div>
      )}

      {!isLoading && q.length >= 2 && results.length === 0 && (
        <div className="text-center py-10 text-muted-foreground text-sm">
          Không tìm thấy người dùng nào với từ khoá "{q}".
        </div>
      )}

      <div className="space-y-2">
        {results.map(profile => (
          <div
            key={profile.userId}
            className="glass-panel rounded-xl p-4 border border-white/5 flex items-center gap-4"
          >
            <Link href={`/social/profile/${profile.userId}`}>
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 cursor-pointer">
                <span className="text-sm font-bold text-primary">
                  {profile.displayName.slice(0, 2).toUpperCase()}
                </span>
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link href={`/social/profile/${profile.userId}`}>
                  <p className="text-sm font-medium text-white truncate cursor-pointer hover:text-primary transition-colors">
                    {profile.displayName}
                  </p>
                </Link>
                <PresenceDot status={profile.presence} />
              </div>
              <p className="text-xs text-muted-foreground">
                {profile.friends} bạn · {profile.followers} người theo dõi
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20"
                onClick={() => handleSendRequest(profile.userId)}
                disabled={sendRequest.isPending}
              >
                <UserCheck className="w-3.5 h-3.5 mr-1" /> Kết bạn
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-emerald-400"
                onClick={() => handleFollow(profile.userId)}
                disabled={follow.isPending}
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" /> Theo dõi
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
