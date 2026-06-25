import { Users } from "lucide-react";
import { useFollowers } from "@/hooks/useSocial";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

function Avatar({ displayName }: { displayName: string }) {
  const initials = displayName.slice(0, 2).toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-violet-400/20 border border-violet-400/30 flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-bold text-violet-400">{initials}</span>
    </div>
  );
}

export default function SocialFollowers() {
  const { data: followers = [], isLoading } = useFollowers();

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-mono text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
        <Users className="w-4 h-4" />
        Người theo dõi bạn ({followers.length})
      </h2>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-panel rounded-xl p-4 border border-white/5 animate-pulse h-16" />
          ))}
        </div>
      )}

      {!isLoading && followers.length === 0 && (
        <div className="glass-panel rounded-xl p-10 border border-white/5 text-center">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Chưa có ai theo dõi bạn.</p>
        </div>
      )}

      <div className="space-y-2">
        {followers.map(rel => (
          <Link key={rel.userId} href={`/social/profile/${rel.userId}`}>
            <div className={cn(
              "glass-panel rounded-xl p-4 border border-white/5 flex items-center gap-4",
              "hover:border-white/10 hover:bg-white/5 transition-all cursor-pointer",
            )}>
              <Avatar displayName={rel.userId} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{rel.userId}</p>
                <p className="text-xs text-muted-foreground">
                  Theo dõi từ {new Date(rel.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <span className="text-xs text-muted-foreground/40 font-mono">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
