import { Star, TrendingUp, Zap, Crown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useMyReputation } from "@/hooks/useReputation";
import { cn } from "@/lib/utils";

const LEVEL_CONFIG: Record<string, { color: string; icon: typeof Star; glow: string }> = {
  Citizen:  { color: "text-slate-400",   icon: Star,    glow: "border-slate-400/20"  },
  Explorer: { color: "text-blue-400",    icon: TrendingUp, glow: "border-blue-400/20" },
  Merchant: { color: "text-emerald-400", icon: Zap,     glow: "border-emerald-400/20" },
  Elite:    { color: "text-violet-400",  icon: Crown,   glow: "border-violet-400/20" },
  Legend:   { color: "text-amber-400",   icon: Crown,   glow: "border-amber-400/20"  },
};

export function ReputationCard() {
  const { data: rep, isLoading } = useMyReputation();

  if (isLoading) {
    return (
      <div className="glass-panel rounded-xl p-5 border border-white/5 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-32 mb-3" />
        <div className="h-8 bg-white/5 rounded w-20 mb-4" />
        <div className="h-2 bg-white/5 rounded w-full" />
      </div>
    );
  }

  if (!rep) return null;

  const cfg = LEVEL_CONFIG[rep.level] ?? LEVEL_CONFIG["Citizen"]!;
  const Icon = cfg.icon;

  return (
    <div className={cn("glass-panel rounded-xl p-5 border", cfg.glow)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] font-mono text-muted-foreground/60 uppercase tracking-widest mb-1">
            Danh tiếng
          </p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold font-mono text-white">
              {rep.totalPoints.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">điểm</span>
          </div>
        </div>
        <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-black/20", cfg.glow)}>
          <Icon className={cn("w-4 h-4", cfg.color)} />
          <span className={cn("text-sm font-semibold", cfg.color)}>{rep.level}</span>
        </div>
      </div>

      {rep.nextLevel && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono text-muted-foreground/60">
            <span>{rep.level}</span>
            <span>{rep.nextLevel} ({rep.pointsToNext} điểm nữa)</span>
          </div>
          <Progress value={rep.progressPercent} className="h-1.5" />
        </div>
      )}

      {!rep.nextLevel && (
        <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20 text-[11px]">
          ✨ Cấp độ tối đa — Legend
        </Badge>
      )}
    </div>
  );
}
