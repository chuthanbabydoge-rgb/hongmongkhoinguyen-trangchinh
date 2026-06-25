import { Trophy, Lock } from "lucide-react";
import { useMyAchievements, useAllAchievements } from "@/hooks/useReputation";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export function AchievementShowcase() {
  const { data: userAchs = [], isLoading: loadingUser } = useMyAchievements();
  const { data: allAchs  = [], isLoading: loadingAll  } = useAllAchievements();

  const unlockedKeys = new Set(userAchs.map(ua => ua.achievementKey));
  const recentUnlocks = [...userAchs]
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, 4);

  if (loadingUser || loadingAll) {
    return (
      <div className="glass-panel rounded-xl p-5 border border-white/5 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-36 mb-4" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-5 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <p className="text-[11px] font-mono text-muted-foreground/60 uppercase tracking-widest">
            Thành tựu
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-mono text-amber-400">{unlockedKeys.size}</span>
          <span className="text-sm text-muted-foreground">/ {allAchs.length}</span>
          <Link href="/achievements">
            <span className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground ml-2 cursor-pointer">xem tất cả →</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-9">
        {allAchs.map((ach) => {
          const unlocked = unlockedKeys.has(ach.key);
          const userAch  = userAchs.find(ua => ua.achievementKey === ach.key);
          return (
            <div
              key={ach.key}
              title={unlocked ? `${ach.title}: ${ach.description}` : `${ach.title} (chưa mở khóa)`}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200 group cursor-default",
                unlocked
                  ? "border-amber-400/30 bg-amber-400/5 hover:bg-amber-400/10"
                  : "border-white/5 bg-white/2 opacity-40 hover:opacity-60",
              )}
            >
              <span className={cn("text-2xl mb-1", !unlocked && "grayscale")}>{ach.icon}</span>
              <span className={cn("text-[9px] font-mono text-center leading-tight", unlocked ? "text-amber-400/80" : "text-muted-foreground/40")}>
                {ach.title}
              </span>
              {unlocked && userAch && (
                <span className="text-[8px] text-muted-foreground/40 mt-0.5 font-mono">
                  {new Date(userAch.unlockedAt).toLocaleDateString("vi-VN")}
                </span>
              )}
              {!unlocked && <Lock className="w-2.5 h-2.5 text-muted-foreground/30 mt-0.5" />}
            </div>
          );
        })}
      </div>

      {recentUnlocks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-2">Mở khóa gần đây</p>
          <div className="space-y-1.5">
            {recentUnlocks.slice(0, 3).map(ua => (
              <div key={ua.id} className="flex items-center gap-2 text-sm">
                <span className="text-base">{ua.achievement?.icon ?? "🏆"}</span>
                <span className="text-white/80 text-xs">{ua.achievement?.title}</span>
                <span className="ml-auto text-[10px] text-muted-foreground/40 font-mono">
                  {new Date(ua.unlockedAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
