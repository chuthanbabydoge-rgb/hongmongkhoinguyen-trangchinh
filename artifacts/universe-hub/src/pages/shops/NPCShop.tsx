import { useState }  from "react";
import { Sidebar }   from "@/components/layout/Sidebar";
import { Header }    from "@/components/layout/Header";
import { Badge }     from "@/components/ui/badge";
import { Button }    from "@/components/ui/button";
import { useShops, useBuyItem, useSellItem } from "@/hooks/useNpcShop";
import type { NpcShop as Shop } from "@/services/craftingService";

const TYPE_ICONS: Record<string, string> = {
  WOOD: "🪵", STONE: "🪨", IRON: "⚙️", GOLD: "🥇",
  CRYSTAL: "💎", MAGIC: "✨", FOOD: "🌾", HERB: "🌿",
};

export default function NPCShop() {
  const { data: shops = [], isLoading } = useShops();
  const [selected, setSelected] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const buyItem  = useBuyItem();
  const sellItem = useSellItem();

  const shop = (shops as Shop[]).find(s => s.id === selected) ?? (shops as Shop[])[0] ?? null;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🏪</div>
            <div>
              <h1 className="text-xl font-bold text-white">Cửa hàng NPC</h1>
              <p className="text-sm text-muted-foreground">{(shops as Shop[]).length} cửa hàng</p>
            </div>
          </div>

          {(shops as Shop[]).length > 1 && (
            <div className="flex gap-2">
              {(shops as Shop[]).map(s => (
                <button key={s.id} onClick={() => setSelected(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${(selected ?? (shops as Shop[])[0]?.id) === s.id ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"}`}>
                  {s.name}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="text-center text-muted-foreground py-12">Đang tải...</div>
          ) : !shop ? (
            <div className="text-center text-muted-foreground py-12">Chưa có cửa hàng nào</div>
          ) : (
            <div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                <div className="font-semibold text-white">{shop.name}</div>
                {shop.description && <div className="text-sm text-muted-foreground">{shop.description}</div>}
                <div className="text-xs text-muted-foreground mt-1">Tiền tệ: {shop.currency}</div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-muted-foreground">Số lượng:</span>
                {[1,5,10].map(n => (
                  <button key={n} onClick={() => setQty(n)}
                    className={`px-2 py-0.5 text-xs rounded border ${qty === n ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/10 text-muted-foreground"}`}>
                    {n}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {shop.items.map(item => (
                  <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{TYPE_ICONS[item.resourceType ?? ""] ?? "📦"}</span>
                      <div>
                        <div className="font-medium text-white text-sm">{item.name}</div>
                        {!item.isInfinite && <div className="text-xs text-muted-foreground">Còn lại: {item.stock}</div>}
                        {item.isInfinite && <Badge className="text-xs bg-green-500/10 text-green-400 border-green-500/20">∞ Vô hạn</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 text-xs"
                        disabled={buyItem.isPending || (!item.isInfinite && item.stock < qty)}
                        onClick={() => buyItem.mutate({ shopId: shop.id, itemId: item.id, quantity: qty })}>
                        🛒 Mua {item.buyPrice * qty}💰
                      </Button>
                      <Button size="sm" className="flex-1 bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 text-xs"
                        disabled={sellItem.isPending}
                        onClick={() => sellItem.mutate({ shopId: shop.id, itemId: item.id, quantity: qty })}>
                        💰 Bán +{item.sellPrice * qty}
                      </Button>
                    </div>
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
