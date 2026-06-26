import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";
import { Badge }   from "@/components/ui/badge";
import { Button }  from "@/components/ui/button";
import { useBlueprints, useRecipes, useUnlockBlueprint, useStartCraft } from "@/hooks/useCrafting";

export default function Blueprints() {
  const { data: bps     = [] } = useBlueprints();
  const { data: recipes = [] } = useRecipes();
  const unlock     = useUnlockBlueprint();
  const startCraft = useStartCraft();

  const unlockedIds = new Set((bps as any[]).map(b => b.recipeId));
  const locked = (recipes as any[]).filter(r => !unlockedIds.has(r.id));
  const unlocked = (recipes as any[]).filter(r => unlockedIds.has(r.id));

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📖</div>
            <div>
              <h1 className="text-xl font-bold text-white">Bản thiết kế</h1>
              <p className="text-sm text-muted-foreground">{unlocked.length} đã mở khoá / {(recipes as any[]).length} tổng</p>
            </div>
          </div>

          {unlocked.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-green-400 mb-3">✅ Đã mở khoá ({unlocked.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {unlocked.map((r: any) => (
                  <div key={r.id} className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                    <div className="font-medium text-white mb-1">{r.name}</div>
                    <div className="text-xs text-muted-foreground mb-3">{r.category} · Lv.{r.requiredLevel}</div>
                    <Button size="sm" className="w-full bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30"
                      onClick={() => startCraft.mutate(r.id)}>
                      ⚒️ Chế tạo
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {locked.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">🔒 Chưa mở khoá ({locked.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {locked.map((r: any) => (
                  <div key={r.id} className="bg-white/3 border border-white/8 rounded-xl p-4 opacity-80">
                    <div className="font-medium text-white mb-1">{r.name}</div>
                    <div className="text-xs text-muted-foreground mb-3">{r.category} · Lv.{r.requiredLevel}</div>
                    <Button size="sm" className="w-full bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                      disabled={unlock.isPending}
                      onClick={() => unlock.mutate(r.id)}>
                      🔓 Mở khoá
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
