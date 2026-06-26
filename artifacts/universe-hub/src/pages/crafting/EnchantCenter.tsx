import { useState } from "react";
import { Sparkles, Zap, Flame, Snowflake, Bolt, Leaf, Sun, Moon } from "lucide-react";
import { Sidebar }  from "@/components/layout/Sidebar";
import { Header }   from "@/components/layout/Header";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Badge }    from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { craftingService } from "@/services/craftingService";
import { useMutation } from "@tanstack/react-query";

const ENCHANT_TYPES = [
  { id: "FIRE",      label: "Lửa",       emoji: "🔥", color: "text-orange-400 border-orange-500/40 bg-orange-500/10" },
  { id: "ICE",       label: "Băng",       emoji: "❄️", color: "text-blue-300 border-blue-500/40 bg-blue-500/10" },
  { id: "LIGHTNING", label: "Sét",        emoji: "⚡", color: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10" },
  { id: "POISON",    label: "Độc",        emoji: "☠️", color: "text-green-400 border-green-500/40 bg-green-500/10" },
  { id: "HOLY",      label: "Thánh",      emoji: "✨", color: "text-amber-300 border-amber-500/40 bg-amber-500/10" },
  { id: "SHADOW",    label: "Bóng tối",   emoji: "🌑", color: "text-purple-400 border-purple-500/40 bg-purple-500/10" },
  { id: "WIND",      label: "Gió",        emoji: "🌪️", color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10" },
  { id: "EARTH",     label: "Đất",        emoji: "🌿", color: "text-lime-400 border-lime-500/40 bg-lime-500/10" },
];

const ENCHANT_TIERS = [
  { value: 5,  label: "+5", cost: 50,   chance: "95%" },
  { value: 10, label: "+10", cost: 100, chance: "80%" },
  { value: 20, label: "+20", cost: 250, chance: "60%" },
  { value: 35, label: "+35", cost: 500, chance: "40%" },
  { value: 50, label: "+50", cost: 1000, chance: "20%" },
];

export default function EnchantCenter() {
  const [itemId,      setItemId]      = useState("");
  const [enchantType, setEnchantType] = useState("FIRE");
  const [tier,        setTier]        = useState(ENCHANT_TIERS[1]!);
  const { toast } = useToast();

  const enchantMut = useMutation({
    mutationFn: () =>
      craftingService.enchantItem(itemId, enchantType, tier.value, tier.cost),
    onSuccess: () =>
      toast({ title: "✨ Phù chú thành công!", description: `+${tier.value} ${enchantType} đã được khắc vào vật phẩm.` }),
    onError: (e: Error) =>
      toast({ title: "Phù chú thất bại", description: e.message, variant: "destructive" }),
  });

  const selectedType = ENCHANT_TYPES.find(e => e.id === enchantType)!;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6 max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Trung tâm Phù chú</h1>
              <p className="text-sm text-muted-foreground">Khắc phù chú ma thuật lên vật phẩm của bạn</p>
            </div>
          </div>

          <div className="border border-border/50 rounded-xl p-6 bg-card/50 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">ID Vật phẩm</label>
              <Input
                value={itemId}
                onChange={e => setItemId(e.target.value)}
                placeholder="Nhập ID vật phẩm cần phù chú..."
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">Tìm ID vật phẩm trong kho đồ của bạn</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Loại phù chú</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ENCHANT_TYPES.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setEnchantType(e.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      enchantType === e.id
                        ? `${e.color} border-2`
                        : "border-border/30 hover:border-border bg-muted/20 hover:bg-muted/40"
                    }`}
                  >
                    <span className="text-2xl">{e.emoji}</span>
                    <span className="text-xs font-medium">{e.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Cấp độ phù chú</label>
              <div className="grid grid-cols-5 gap-2">
                {ENCHANT_TIERS.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTier(t)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      tier.value === t.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/30 hover:border-border bg-muted/20 text-muted-foreground"
                    }`}
                  >
                    <span className="text-sm font-bold">{t.label}</span>
                    <span className="text-xs">{t.cost}💎</span>
                    <span className="text-xs opacity-70">{t.chance}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-border/30 rounded-lg p-4 bg-muted/20 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Xác nhận phù chú</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Vật phẩm:</span>
                  <span className="text-foreground font-mono text-xs truncate max-w-[100px]">
                    {itemId || "—"}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Loại:</span>
                  <Badge className={`${selectedType.color} border text-xs`}>
                    {selectedType.emoji} {selectedType.label}
                  </Badge>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Giá trị:</span>
                  <span className="text-foreground font-medium">+{tier.value}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Chi phí:</span>
                  <span className="text-amber-400 font-medium">{tier.cost} Credits</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tỷ lệ thành công:</span>
                  <span className={`font-medium ${
                    parseInt(tier.chance) >= 80 ? "text-green-400" :
                    parseInt(tier.chance) >= 50 ? "text-yellow-400" : "text-red-400"
                  }`}>{tier.chance}</span>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              disabled={!itemId.trim() || enchantMut.isPending}
              onClick={() => enchantMut.mutate()}
            >
              {enchantMut.isPending ? (
                <><div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />Đang phù chú...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Phù chú ngay</>
              )}
            </Button>
          </div>

          <div className="border border-border/50 rounded-xl p-5 bg-card/30 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Lưu ý quan trọng
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>Phù chú thất bại sẽ không phá hủy vật phẩm nhưng mất phí.</li>
              <li>Cấp độ cao hơn có tỷ lệ thành công thấp hơn.</li>
              <li>Mỗi vật phẩm có thể có tối đa 3 phù chú.</li>
              <li>Phù chú cùng loại sẽ gộp thành 1 và tăng giá trị.</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
