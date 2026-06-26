import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { usePets, useEvolvePet, usePetSpecies } from "@/hooks/usePets";
import { Sparkles } from "lucide-react";

const TYPE_ICONS: Record<string, string> = {
  BEAST: "🐾", DRAGON: "🐉", SPIRIT: "✨", MECHANICAL: "🤖", ELEMENTAL: "🔥", CELESTIAL: "🌟",
};
const RARITY_COLORS: Record<string, string> = {
  COMMON: "text-gray-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
  EPIC: "text-purple-400", LEGENDARY: "text-orange-400", MYTHIC: "text-rose-400",
};

export default function PetEvolution() {
  const { data: pets = [] } = usePets();
  const { data: species = [] } = usePetSpecies();
  const evolvePet = useEvolvePet();
  const [lastResult, setLastResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const petList    = pets as Record<string, unknown>[];
  const speciesList= species as Record<string, unknown>[];

  const getSpecies = (id: string) => speciesList.find(s => s.id === id);

  const handleEvolve = (petId: string) => {
    setError(null); setLastResult(null);
    evolvePet.mutate(petId, {
      onSuccess: (data) => {
        const d = data as { ok: boolean; data: Record<string, unknown>; error?: string };
        if (d.ok) setLastResult(d.data);
        else setError(d.error ?? "Tiến hóa thất bại");
      },
      onError: () => setError("Có lỗi xảy ra khi tiến hóa"),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="text-primary" />
        <h1 className="text-2xl font-bold">✨ Tiến hóa Pet</h1>
      </div>

      {lastResult && (
        <Card className="border-purple-500/30 bg-purple-500/10">
          <CardContent className="pt-4 pb-4">
            <div className="font-semibold text-purple-400">🌟 Tiến hóa thành công!</div>
            <div className="text-sm text-muted-foreground mt-1">
              Stage {(lastResult.evolution as Record<string, unknown>)?.fromStage as number} → Stage {(lastResult.evolution as Record<string, unknown>)?.toStage as number}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="pt-4 pb-4">
            <div className="text-red-400 text-sm">{error}</div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {petList.map(pet => {
          const sp = getSpecies(pet.speciesId as string);
          const evolutionLevel = (sp?.evolutionLevel as number) ?? 20;
          const canEvolve = (pet.level as number) >= evolutionLevel;
          const xpNeeded  = Math.floor(100 * Math.pow((pet.level as number) + 1, 1.5));
          const xpPct     = Math.min(100, Math.round(((pet.experience as number) / xpNeeded) * 100));

          return (
            <Card key={pet.id as string} className={`border-border/50 transition-colors ${canEvolve ? "hover:border-purple-500/50" : ""}`}>
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-2xl">
                    {TYPE_ICONS[pet.type as string] ?? "🐾"}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{pet.name as string}</div>
                    <div className="text-xs text-muted-foreground">{pet.type as string}</div>
                    <Badge variant="outline" className={`text-xs mt-0.5 ${RARITY_COLORS[pet.rarity as string]}`}>
                      {pet.rarity as string}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Level {pet.level as number}</span>
                    <span className="text-muted-foreground">{xpPct}% XP</span>
                  </div>
                  <Progress value={xpPct} className="h-1.5" />
                </div>

                <div className="grid grid-cols-2 text-xs gap-1 text-muted-foreground">
                  <span>Stage: {pet.evolutionStage as number}</span>
                  <span>Cần Lv.{evolutionLevel} để tiến hóa</span>
                  <span>ATK: {pet.attack as number}</span>
                  <span>DEF: {pet.defense as number}</span>
                </div>

                {canEvolve ? (
                  <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={evolvePet.isPending}
                    onClick={() => handleEvolve(pet.id as string)}>
                    {evolvePet.isPending ? "Đang tiến hóa..." : "✨ Tiến hóa ngay"}
                  </Button>
                ) : (
                  <div className="text-center py-1">
                    <div className="text-xs text-muted-foreground">
                      Cần level {evolutionLevel} (còn {evolutionLevel - (pet.level as number)} level)
                    </div>
                    <Progress value={Math.round(((pet.level as number) / evolutionLevel) * 100)} className="h-1 mt-1" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {petList.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-10 pb-10 text-center text-muted-foreground">
            Chưa có pet nào để tiến hóa
          </CardContent>
        </Card>
      )}
    </div>
  );
}
