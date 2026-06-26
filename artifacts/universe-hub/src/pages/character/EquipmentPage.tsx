import { Package, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCharacterEquipment, useUnequipItem } from "@/hooks/useCharacter";
import { useToast } from "@/hooks/use-toast";

const SLOT_LABELS: Record<string, string> = {
  HEAD: "🪖 Mũ", CHEST: "🧥 Áo giáp", LEGS: "👖 Quần", BOOTS: "👢 Giày",
  GLOVES: "🧤 Găng tay", WEAPON: "⚔️ Vũ khí", OFFHAND: "🛡️ Phụ khí",
  RING: "💍 Nhẫn", NECKLACE: "📿 Vòng cổ", PET: "🐾 Thú cưng",
};

const RARITY_COLORS: Record<string, string> = {
  COMMON: "text-gray-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
  EPIC: "text-purple-400", LEGENDARY: "text-yellow-400",
};

const ALL_SLOTS = ["HEAD","CHEST","LEGS","BOOTS","GLOVES","WEAPON","OFFHAND","RING","NECKLACE","PET"];

export default function EquipmentPage() {
  const { data: equipment = [], isLoading } = useCharacterEquipment();
  const unequip = useUnequipItem();
  const { toast } = useToast();

  const equip = equipment as Record<string, unknown>[];
  const equippedMap = new Map(equip.filter(e => e.itemId).map(e => [e.slot as string, e]));

  const handleUnequip = (slot: string) => {
    unequip.mutate({ slot }, {
      onSuccess: () => toast({ title: "Đã tháo trang bị", description: `Slot ${SLOT_LABELS[slot]}` }),
    });
  };

  if (isLoading) return <div className="p-8 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="text-primary" /> Trang bị</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {ALL_SLOTS.map(slot => {
          const item = equippedMap.get(slot);
          return (
            <Card key={slot} className={`border-border/50 ${item ? "border-primary/30" : ""}`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-lg">
                      {item ? (item.itemIcon as string || "📦") : "—"}
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">{SLOT_LABELS[slot]}</div>
                      {item ? (
                        <>
                          <div className="text-sm font-medium">{item.itemName as string}</div>
                          <Badge variant="outline" className={`text-xs ${RARITY_COLORS[item.itemRarity as string] ?? ""}`}>
                            {item.itemRarity as string ?? "COMMON"}
                          </Badge>
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground italic">Trống</div>
                      )}
                    </div>
                  </div>
                  {item && (
                    <Button variant="ghost" size="sm" onClick={() => handleUnequip(slot)}>
                      <X size={14} />
                    </Button>
                  )}
                </div>
                {item?.statBonus && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(item.statBonus as Record<string, number>).map(([k, v]) => (
                      <span key={k} className="text-xs text-green-400">+{v} {k}</span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-sm">💡 Hướng dẫn</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Trang bị vũ khí và giáp từ Kho đồ (Inventory) của bạn. Mỗi slot có thể trang bị 1 món đồ.
            Chỉ số của đồ trang bị sẽ tự động cộng vào Power Score của nhân vật.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
