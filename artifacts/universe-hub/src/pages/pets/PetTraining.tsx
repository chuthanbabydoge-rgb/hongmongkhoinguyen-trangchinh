import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { usePets, useTrainPet } from "@/hooks/usePets";

const TYPE_ICONS: Record<string, string> = {
  BEAST: "🐾", DRAGON: "🐉", SPIRIT: "✨", MECHANICAL: "🤖", ELEMENTAL: "🔥", CELESTIAL: "🌟",
};

const TRAINING_TYPES = [
  { key: "combat",  icon: "⚔️", label: "Chiến đấu",   desc: "Tăng Attack",  stat: "attack"  },
  { key: "defense", icon: "🛡️", label: "Phòng thủ",   desc: "Tăng Defense", stat: "defense" },
  { key: "speed",   icon: "💨", label: "Tốc độ",      desc: "Tăng Speed",   stat: "speed"   },
];

export default function PetTraining() {
  const { data: pets = [] } = usePets();
  const trainPet = useTrainPet();
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<Record<string, unknown> | null>(null);
  const petList = pets as Record<string, unknown>[];

  const handleTrain = (trainingType: string) => {
    if (!selectedPet) return;
    trainPet.mutate({ petId: selectedPet, trainingType }, {
      onSuccess: (data) => {
        const d = data as { ok: boolean; data: Record<string, unknown> };
        if (d.ok) setLastResult(d.data);
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🏋️ Huấn luyện Pet</h1>

      {lastResult && (
        <Card className="border-green-500/30 bg-green-500/10">
          <CardContent className="pt-4 pb-4">
            <div className="font-semibold text-green-400">✅ Huấn luyện thành công!</div>
            <div className="text-sm text-muted-foreground mt-1">
              XP +{(lastResult.training as Record<string, unknown>)?.xpGained as number}
              {(lastResult.leveled as boolean) && (
                <span className="text-yellow-400 ml-2">🎉 Level Up! → Lv.{(lastResult.newLevel as number)}</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pet Selector */}
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-sm">🐾 Chọn Pet để huấn luyện</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {petList.length === 0 && (
              <div className="text-muted-foreground text-sm py-4 text-center">Bạn chưa có pet nào</div>
            )}
            {petList.map(pet => {
              const xpNeeded = Math.floor(100 * Math.pow((pet.level as number) + 1, 1.5));
              const xpPct    = Math.min(100, Math.round(((pet.experience as number) / xpNeeded) * 100));
              return (
                <button key={pet.id as string}
                  onClick={() => { setSelectedPet(pet.id as string); setLastResult(null); }}
                  className={`w-full flex items-center gap-3 p-3 rounded border transition-colors text-left ${selectedPet === pet.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">
                    {TYPE_ICONS[pet.type as string] ?? "🐾"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{pet.name as string}</div>
                    <div className="text-xs text-muted-foreground">Lv.{pet.level as number} · {pet.type as string}</div>
                    <Progress value={xpPct} className="h-1 mt-1" />
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>ATK {pet.attack as number}</div>
                    <div>DEF {pet.defense as number}</div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Training Selector */}
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-sm">⚡ Chọn loại huấn luyện</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {TRAINING_TYPES.map(t => (
              <div key={t.key} className="flex items-center justify-between p-3 rounded border border-border/50 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.desc}</div>
                  </div>
                </div>
                <Button size="sm"
                  disabled={!selectedPet || trainPet.isPending}
                  onClick={() => handleTrain(t.key)}>
                  {trainPet.isPending ? "..." : "Train"}
                </Button>
              </div>
            ))}

            {!selectedPet && (
              <div className="text-center text-sm text-muted-foreground py-4">
                Chọn pet trước để bắt đầu huấn luyện
              </div>
            )}

            {selectedPet && (
              <div className="mt-4 p-3 bg-muted/30 rounded text-xs text-muted-foreground space-y-1">
                <div>💡 Mỗi lần huấn luyện tốn 50 Credits</div>
                <div>💡 XP nhận được dựa theo level pet hiện tại</div>
                <div>💡 Stat tăng lên theo loại huấn luyện</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
