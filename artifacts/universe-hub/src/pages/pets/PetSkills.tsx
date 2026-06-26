import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePets, usePetSkills, useLearnPetSkill } from "@/hooks/usePets";

const TYPE_ICONS: Record<string, string> = {
  BEAST: "🐾", DRAGON: "🐉", SPIRIT: "✨", MECHANICAL: "🤖", ELEMENTAL: "🔥", CELESTIAL: "🌟",
};

export default function PetSkills() {
  const { data: pets = [] } = usePets();
  const { data: skills = [] } = usePetSkills();
  const learnSkill = useLearnPetSkill();
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [lastMsg, setLastMsg] = useState<string | null>(null);

  const petList   = pets as Record<string, unknown>[];
  const skillList = skills as Record<string, unknown>[];

  const handleLearn = (skillId: string) => {
    if (!selectedPet) return;
    learnSkill.mutate({ petId: selectedPet, skillId }, {
      onSuccess: (data) => {
        const d = data as { ok: boolean; error?: string };
        setLastMsg(d.ok ? "✅ Đã học kỹ năng!" : `❌ ${d.error ?? "Thất bại"}`);
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">⚔️ Kỹ năng Pet</h1>

      {lastMsg && (
        <Card className="border-green-500/30 bg-green-500/10">
          <CardContent className="pt-3 pb-3 text-sm">{lastMsg}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pet Selector */}
        <div className="space-y-3">
          <h2 className="font-semibold">🐾 Chọn Pet</h2>
          {petList.map(pet => (
            <button key={pet.id as string}
              onClick={() => { setSelectedPet(pet.id as string); setLastMsg(null); }}
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

        {/* Skills List */}
        <div className="space-y-3">
          <h2 className="font-semibold">📚 Danh sách kỹ năng</h2>
          {skillList.map(skill => (
            <Card key={skill.id as string} className="border-border/50">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xl">{(skill.icon as string) ?? "⚡"}</span>
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{skill.name as string}</div>
                      <div className="text-xs text-muted-foreground truncate">{skill.description as string}</div>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">{skill.type as string}</Badge>
                        {(skill.baseDamage as number) > 0 && <span className="text-xs text-red-400">⚔️ {skill.baseDamage as number}</span>}
                        {(skill.baseHealing as number) > 0 && <span className="text-xs text-green-400">💚 {skill.baseHealing as number}</span>}
                        <span className="text-xs text-blue-400">💧 {skill.energyCost as number}</span>
                        {skill.petType && <Badge variant="secondary" className="text-xs">{skill.petType as string}</Badge>}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline"
                    disabled={!selectedPet || learnSkill.isPending}
                    onClick={() => handleLearn(skill.id as string)}>
                    Học
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {skillList.length === 0 && <div className="text-muted-foreground text-sm">Không có kỹ năng nào</div>}
        </div>
      </div>
    </div>
  );
}
