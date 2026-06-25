import { Users, UserPlus, UserCheck, Wifi } from "lucide-react";
import { useSocialCounts } from "@/hooks/useSocial";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export function SocialOverviewCard() {
  const { data: counts, isLoading } = useSocialCounts();

  if (isLoading) {
    return (
      <div className="glass-panel rounded-xl p-5 border border-white/5 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-32 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label:  "Bạn bè",
      value:  counts?.friends ?? 0,
      icon:   UserCheck,
      color:  "text-blue-400",
      glow:   "border-blue-400/20 bg-blue-400/5",
      path:   "/social/friends",
    },
    {
      label:  "Người theo dõi",
      value:  counts?.followers ?? 0,
      icon:   Users,
      color:  "text-violet-400",
      glow:   "border-violet-400/20 bg-violet-400/5",
      path:   "/social/followers",
    },
    {
      label:  "Đang theo dõi",
      value:  counts?.following ?? 0,
      icon:   UserPlus,
      color:  "text-emerald-400",
      glow:   "border-emerald-400/20 bg-emerald-400/5",
      path:   "/social/following",
    },
    {
      label:  "Bạn online",
      value:  counts?.onlineFriends ?? 0,
      icon:   Wifi,
      color:  "text-cyan-400",
      glow:   "border-cyan-400/20 bg-cyan-400/5",
      path:   "/social/friends",
    },
  ];

  return (
    <div className="glass-panel rounded-xl p-5 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-mono text-muted-foreground/60 uppercase tracking-widest">
          Mạng xã hội
        </p>
        <Link href="/social">
          <span className="text-[11px] font-mono text-primary/60 hover:text-primary transition-colors cursor-pointer">
            Xem tất cả →
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color, glow, path }) => (
          <Link key={label} href={path}>
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer",
                "hover:border-white/10 hover:bg-white/5",
                glow,
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", color)} />
              <div className="min-w-0">
                <p className="text-xl font-bold font-mono text-white leading-none">{value}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">{label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
