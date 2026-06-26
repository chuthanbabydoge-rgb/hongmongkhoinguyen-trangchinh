import { useState } from "react";
import { Search, Filter, Clock, Coins } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";
import { Badge }   from "@/components/ui/badge";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { useRecipes, useStartCraft } from "@/hooks/useCrafting";
import type { Recipe } from "@/services/craftingService";

const CATS = ["ALL", "METAL", "WOOD", "FOOD", "MAGIC", "JEWELRY", "ALCHEMY"];

export default function RecipeBrowser() {
  const [cat, setCat]       = useState("ALL");
  const [search, setSearch] = useState("");
  const { data: recipes = [], isLoading } = useRecipes(cat === "ALL" ? undefined : cat);
  const startCraft = useStartCraft();

  const filtered = (recipes as Recipe[]).filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📖</div>
            <div>
              <h1 className="text-xl font-bold text-white">Công thức chế tạo</h1>
              <p className="text-sm text-muted-foreground">{filtered.length} công thức khả dụng</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
              <Input placeholder="Tìm công thức..." className="pl-9 bg-white/5 border-white/10" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${cat === c ? "bg-orange-500/20 border-orange-500/40 text-orange-300" : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"}`}>
                {c}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground py-12">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">Không tìm thấy công thức nào</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(r => (
                <div key={r.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-orange-500/30 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="font-medium text-white">{r.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{r.description}</div>
                    </div>
                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 shrink-0">{r.category}</Badge>
                  </div>

                  <div className="flex gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{r.craftingTime}s</span>
                    <span className="flex items-center gap-1">💰{r.craftingCost} Credits</span>
                    <span>Lv.{r.requiredLevel}</span>
                  </div>

                  <div className="mb-3">
                    <div className="text-xs text-muted-foreground mb-1">Nguyên liệu:</div>
                    <div className="flex flex-wrap gap-1">
                      {r.ingredients.map((ing, i) => (
                        <span key={i} className="text-xs bg-white/5 border border-white/10 rounded px-2 py-0.5 text-white">
                          {ing.quantity}x {ing.resourceType ?? ing.itemType}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-muted-foreground mb-1">Sản phẩm:</div>
                    <div className="flex flex-wrap gap-1">
                      {r.outputs.map((out, i) => (
                        <span key={i} className="text-xs bg-orange-500/10 border border-orange-500/20 rounded px-2 py-0.5 text-orange-300">
                          {out.quantity}x {out.itemType ?? out.resourceType} {out.chance < 100 ? `(${out.chance}%)` : ""}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button size="sm" className="w-full bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30"
                    disabled={startCraft.isPending}
                    onClick={() => startCraft.mutate(r.id)}>
                    ⚒️ Chế tạo ngay
                  </Button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
