import { useAccount } from "@/hooks/useAccount";
import { Progress } from "@/components/ui/progress";
import { Shield, Star, Zap, AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-white/10 ${className ?? ""}`} />
  );
}

export function UserProfile() {
  const { profile, avatar, level, reputation, loading, error } = useAccount();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!level) return;
    const timer = setTimeout(() => {
      setProgress(level.progressPercent);
    }, 500);
    return () => clearTimeout(timer);
  }, [level]);

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />

      {/* ── Error state ── */}
      {error && (
        <div className="flex items-center gap-3 text-red-400 text-sm font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && !error && (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-white/10 p-1">
              <div className="w-full h-full rounded-full bg-white/10 animate-pulse" />
            </div>
            <SkeletonPulse className="absolute -bottom-2 -right-2 w-14 h-6 rounded-md" />
          </div>
          <div className="flex-1 space-y-4 w-full">
            <div className="space-y-2">
              <SkeletonPulse className="h-9 w-64" />
              <SkeletonPulse className="h-4 w-48" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <SkeletonPulse className="h-3 w-24" />
                <SkeletonPulse className="h-3 w-32" />
              </div>
              <SkeletonPulse className="h-3 w-full rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* ── Loaded state ── */}
      {!loading && !error && profile && level && (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-primary/40 p-1">
              {avatar?.imageUrl ? (
                <img
                  src={avatar.imageUrl}
                  alt={profile.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full rounded-full bg-gradient-to-br from-primary/80 to-purple-600/80 flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
                  style={avatar?.frameColor ? { boxShadow: `0 0 30px ${avatar.frameColor}4d` } : undefined}
                >
                  {avatar?.initials ?? profile.username.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-black border border-primary/50 px-2 py-1 rounded-md text-xs font-bold text-primary neon-glow-accent">
              LVL {level.current}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-wider neon-text mb-1">
                {profile.username}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium tracking-widest text-muted-foreground uppercase">
                <span className="text-primary flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  {profile.title}
                </span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="flex items-center gap-1.5 text-blue-400">
                  <Star className="w-4 h-4" />
                  {level.rank}
                </span>
                {reputation && (
                  <>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span className="flex items-center gap-1.5 text-amber-400 text-xs">
                      Danh tiếng {reputation.score}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* XP bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1 text-primary/80">
                  <Zap className="w-3 h-3" /> KINH NGHIỆM
                </span>
                <span className="text-white">
                  {level.xp.toLocaleString()} / {level.maxXp.toLocaleString()} XP
                </span>
              </div>
              <div className="h-3 bg-black/60 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-primary/50 to-primary transition-all duration-1000 ease-out shadow-[0_0_10px_hsl(var(--primary))]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
