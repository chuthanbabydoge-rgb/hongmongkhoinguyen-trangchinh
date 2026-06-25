import { Trophy, Lock, Calendar } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useMyAchievements, useAllAchievements } from "@/hooks/useReputation";
import { cn } from "@/lib/utils";

export default function AchievementsPage() {
  const { data: userAchs = [], isLoading: loadingUser } = useMyAchievements();
  const { data: allAchs  = [], isLoading: loadingAll  } = useAllAchievements();

  const unlockedKeys = new Set(userAchs.map(ua => ua.achievementKey));

  const unlocked = allAchs.filter(a => unlockedKeys.has(a.key));
  const locked   = allAchs.filter(a => !unlockedKeys.has(a.key));

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
      </div>
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 max-w-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-white neon-text mb-1">Thành tựu</h1>
              <p className="text-sm text-muted-foreground">
                {unlocked.length}/{allAchs.length} thành tựu đã mở khóa
              </p>
            </div>

            {unlocked.length > 0 && (
              <section>
                <p className="text-[11px] font-mono text-amber-400/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Trophy className="w-3 h-3" /> Đã mở khóa
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {unlocked.map(ach => {
                    const ua = userAchs.find(u => u.achievementKey === ach.key);
                    return (
                      <div key={ach.key} className="glass-panel rounded-xl p-4 border border-amber-400/20 bg-amber-400/5">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{ach.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white">{ach.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{ach.description}</p>
                            {ua && (
                              <div className="flex items-center gap-1 mt-2">
                                <Calendar className="w-3 h-3 text-amber-400/60" />
                                <span className="text-[10px] font-mono text-amber-400/60">
                                  {new Date(ua.unlockedAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-amber-400 text-lg">✓</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {locked.length > 0 && (
              <section>
                <p className="text-[11px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Chưa mở khóa
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {locked.map(ach => (
                    <div key={ach.key} className="glass-panel rounded-xl p-4 border border-white/5 opacity-50">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl grayscale">{ach.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white/60">{ach.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{ach.description}</p>
                        </div>
                        <Lock className="w-4 h-4 text-muted-foreground/30 mt-0.5 shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {loadingUser || loadingAll ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
