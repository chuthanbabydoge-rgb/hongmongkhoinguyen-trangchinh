import { UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFollowing, useUnfollowUser } from "@/hooks/useSocial";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

function Avatar({ displayName }: { displayName: string }) {
  const initials = displayName.slice(0, 2).toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-bold text-emerald-400">{initials}</span>
    </div>
  );
}

export default function SocialFollowing() {
  const { data: following = [], isLoading } = useFollowing();
  const unfollow = useUnfollowUser();

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-mono text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
        <UserPlus className="w-4 h-4" />
        Bạn đang theo dõi ({following.length})
      </h2>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-panel rounded-xl p-4 border border-white/5 animate-pulse h-16" />
          ))}
        </div>
      )}

      {!isLoading && following.length === 0 && (
        <div className="glass-panel rounded-xl p-10 border border-white/5 text-center">
          <UserPlus className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Bạn chưa theo dõi ai.</p>
        </div>
      )}

      <div className="space-y-2">
        {following.map(rel => (
          <div
            key={rel.targetId}
            className={cn(
              "glass-panel rounded-xl p-4 border border-white/5 flex items-center gap-4",
            )}
          >
            <Link href={`/social/profile/${rel.targetId}`} className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
              <Avatar displayName={rel.targetId} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{rel.targetId}</p>
                <p className="text-xs text-muted-foreground">
                  Theo dõi từ {new Date(rel.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-rose-400"
              onClick={() => unfollow.mutate(rel.targetId)}
              disabled={unfollow.isPending}
            >
              <UserMinus className="w-3.5 h-3.5 mr-1" /> Bỏ theo dõi
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
