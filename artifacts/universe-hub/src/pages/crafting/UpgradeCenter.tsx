import { useState } from "react";
import { Sidebar }  from "@/components/layout/Sidebar";
import { Header }   from "@/components/layout/Header";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { craftingService } from "@/services/craftingService";
import { useMutation } from "@tanstack/react-query";

const UPGRADE_TYPES = ["LEVEL", "RARITY", "ENCHANT", "SOCKET"];
const ENCHANT_TYPES = ["FIRE", "ICE", "LIGHTNING", "POISON", "HOLY", "SHADOW"];

export default function UpgradeCenter() {
  const [itemId, setItemId]         = useState("");
  const [upgradeType, setUpgradeType] = useState("LEVEL");
  const [enchantType, setEnchantType] = useState("FIRE");
  const [tab, setTab]               = useState<"upgrade" | "enchant">("upgrade");
  const { toast } = useToast();

  const upgradeMut = useMutation({
    mutationFn: () => craftingService.upgradeItem(itemId, upgradeType as any, 50),
    onSuccess: (r: any) => toast({ title: "⬆️ Nâng cấp thành công!", description: `Đạt cấp ${r.level}` }),
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  const enchantMut = useMutation({
    mutationFn: () => craftingService.enchantItem(itemId, enchantType, 10, 100),
    onSuccess: () => toast({ title: "✨ Phù chú thành công!" }),
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⬆️</div>
            <div>
              <h1 className="text-xl font-bold text-white">Trung tâm nâng cấp</h1>
              <p className="text-sm text-muted-foreground">Nâng cấp và phù chú vật phẩm</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {(["upgrade", "enchant"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${tab === t ? "bg-orange-500/20 border-orange-500/40 text-orange-300" : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"}`}>
                {t === "upgrade" ? "⬆️ Nâng cấp" : "✨ Phù chú"}
              </button>
            ))}
          </div>

          <div className="max-w-md bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">ID Vật phẩm</label>
              <Input placeholder="Nhập ID vật phẩm..." className="bg-white/5 border-white/10"
                value={itemId} onChange={e => setItemId(e.target.value)}/>
            </div>

            {tab === "upgrade" ? (
              <>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Loại nâng cấp</label>
                  <div className="flex flex-wrap gap-2">
                    {UPGRADE_TYPES.map(u => (
                      <button key={u} onClick={() => setUpgradeType(u)}
                        className={`px-3 py-1 rounded-lg text-xs border transition-colors ${upgradeType === u ? "bg-orange-500/20 border-orange-500/40 text-orange-300" : "bg-white/5 border-white/10 text-muted-foreground"}`}>
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-sm text-muted-foreground">
                  Chi phí: <span className="text-white font-medium">50 Credits</span>
                </div>
                <Button className="w-full bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30"
                  disabled={!itemId || upgradeMut.isPending}
                  onClick={() => upgradeMut.mutate()}>
                  ⬆️ Nâng cấp vật phẩm
                </Button>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Loại phù chú</label>
                  <div className="flex flex-wrap gap-2">
                    {ENCHANT_TYPES.map(e => (
                      <button key={e} onClick={() => setEnchantType(e)}
                        className={`px-3 py-1 rounded-lg text-xs border transition-colors ${enchantType === e ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "bg-white/5 border-white/10 text-muted-foreground"}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-sm text-muted-foreground">
                  Chi phí: <span className="text-white font-medium">100 Credits</span> · Tỷ lệ thành công: <span className="text-green-400">80%</span>
                </div>
                <Button className="w-full bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
                  disabled={!itemId || enchantMut.isPending}
                  onClick={() => enchantMut.mutate()}>
                  ✨ Phù chú vật phẩm
                </Button>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
