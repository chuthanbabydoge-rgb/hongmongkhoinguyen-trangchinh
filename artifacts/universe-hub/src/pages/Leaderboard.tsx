import { Crown, Star, TrendingUp, Zap, Medal } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useLeaderboard, useMyReputation } from "@/hooks/useReputation";
import { cn } from "@/lib/utils";

const LEVEL_COLOR: Record<string, string> = {
  Citizen:  "text-slate-400",
  Explorer: "text-blue-400",
  Merchant: "text-emerald-400",
  Elite:    "text-violet-400",
  Legend:   "text-amber-400",
};

const LEVEL_ICON: Record<string, typeof Star> = {
  Citizen:  Star,
  Explorer: TrendingUp,
  Merchant: Zap,
  Elite:    Crown,
  Legend:   Crown,
};

const RANK_STYLES: Record<number, { badge: string; row: string }> = {
  1: { badge: "bg-amber-400/20 text-amber-400 border-amber-400/40",  row: "border-amber-400/20 bg-amber-400/5"  },
  2: { badge: "bg-slate-300/20 text-slate-300 border-slate-300/40",  row: "border-slate-300/10 bg-slate-300/3"  },
  3: { badge: "bg-orange-600/20 text-orange-500 border-orange-600/40", row: "border-orange-600/10 bg-orange-600/3" },
};

export default function Leaderboard() {
  const { data: entries = [], isLoading } = useLeaderboard(50);
  const { data: myRep } = useMyReputation();

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col relative z-10 max-w-full overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white neon-text mb-1">Bảng xếp hạng</h1>
              <p className="text-sm text-muted-foreground">Top người dùng danh tiếng cao nhất trong Universe Ecosystem</p>
            </div>

            {myRep && (
              <div className="glass-panel rounded-xl p-4 border border-primary/20 bg-primary/5">
                <p className="text-[11px] font-mono text-muted-foreground/60 uppercase tracking-widest mb-1">Thứ hạng của bạn</p>
                <div className="flex items-center gap-3">
                  <span className={cn("text-sm font-semibold", LEVEL_COLOR[myRep.level] ?? "text-white")}>
                    {myRep.level}
                  </span>
                  <span className="text-white font-mono font-bold">{myRep.totalPoints.toLocaleString()} điểm</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
                ))
              ) : entries.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <Medal className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Chưa có dữ liệu xếp hạng.</p>
                </div>
              ) : (
                entries.map((entry) => {
                  const rankStyle = RANK_STYLES[entry.rank];
                  const LevelIcon = LEVEL_ICON[entry.level] ?? Star;
                  const levelColor = LEVEL_COLOR[entry.level] ?? "text-white";

                  return (
                    <div
                      key={entry.userId}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border transition-all",
                        rankStyle ? rankStyle.row : "border-white/5 glass-panel",
                        entry.userId === myRep?.userId && "ring-1 ring-primary/30",
                      )}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-mono border shrink-0",
                        rankStyle ? rankStyle.badge : "bg-white/5 text-muted-foreground border-white/10",
                      )}>
                        {entry.rank <= 3 ? ["🥇","🥈","🥉"][entry.rank - 1] : `#${entry.rank}`}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white/80 truncate font-mono">
                            {entry.userId.slice(0, 8)}…
                          </span>
                          {entry.userId === myRep?.userId && (
                            <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 rounded px-1 py-0.5 font-mono">Bạn</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <LevelIcon className={cn("w-3 h-3", levelColor)} />
                          <span className={cn("text-[11px] font-mono", levelColor)}>{entry.level}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold font-mono text-white">
                          {entry.totalPoints.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-muted-foreground/60 font-mono">điểm</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
