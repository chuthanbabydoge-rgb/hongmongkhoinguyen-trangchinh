import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePets, usePetEquipment } from "@/hooks/usePets";

const TYPE_ICONS: Record<string, string> = {
  BEAST: "🐾", DRAGON: "🐉", SPIRIT: "✨", MECHANICAL: "🤖", ELEMENTAL: "🔥", CELESTIAL: "🌟",
};
const SLOTS = ["armor", "weapon", "accessory", "helmet", "boots"];
const SLOT_ICONS: Record<string, string> = {
  armor: "🛡️", weapon: "⚔️", accessory: "💍", helmet: "⛑️", boots: "👢",
};

export default function PetEquipment() {
  const { data: pets = [] } = usePets();
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const { data: equipment = [] } = usePetEquipment(selectedPet);
  const petList  = pets as Record<string, unknown>[];
  const eqList   = equipment as Record<string, unknown>[];

  const getEquipped = (slot: string) => eqList.find(e => e.slot === slot);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🛡️ Trang bị Pet</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pet Selector */}
        <div className="space-y-3">
          <h2 className="font-semibold">🐾 Chọn Pet</h2>
          {petList.map(pet => (
            <button key={pet.id as string}
              onClick={() => setSelectedPet(pet.id as string)}
              className={`w-full flex items-center gap-3 p-3 rounded border text-left transition-colors ${selectedPet === pet.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
              <span className="text-2xl">{TYPE_ICONS[pet.type as string] ?? "🐾"}</span>
              <div>
                <div className="font-medium text-sm">{pet.name as string}</div>
                <div className="text-xs text-muted-foreground">Lv.{pet.level as number} · {pet.type as string}</div>
              </div>
            </button>
          ))}
          {petList.length === 0 && <div className="text-muted-foreground text-sm">Chưa có pet nào</div>}
        </div>

        {/* Equipment Slots */}
        <div className="space-y-3">
          <h2 className="font-semibold">🎽 Slot trang bị</h2>
          {selectedPet ? (
            SLOTS.map(slot => {
              const eq = getEquipped(slot);
              return (
                <Card key={slot} className="border-border/50">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{SLOT_ICONS[slot] ?? "📦"}</span>
                        <div>
                          <div className="font-medium text-sm capitalize">{slot}</div>
                          {eq?.itemName ? (
                            <div className="text-xs text-muted-foreground">{eq.itemName as string}</div>
                          ) : (
                            <div className="text-xs text-muted-foreground/50">Trống</div>
                          )}
                        </div>
                      </div>
                      {eq?.itemRarity && (
                        <Badge variant="outline" className="text-xs">{eq.itemRarity as string}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Chọn pet để xem trang bị
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
