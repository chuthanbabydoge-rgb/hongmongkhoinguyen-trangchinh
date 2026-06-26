import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { usePets, usePetSpecies, useCreatePet, useSummonPet, useDismissPet } from "@/hooks/usePets";

const TYPE_ICONS: Record<string, string> = {
  BEAST: "🐾", DRAGON: "🐉", SPIRIT: "✨", MECHANICAL: "🤖", ELEMENTAL: "🔥", CELESTIAL: "🌟",
};
const RARITY_COLORS: Record<string, string> = {
  COMMON: "text-gray-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
  EPIC: "text-purple-400", LEGENDARY: "text-orange-400", MYTHIC: "text-rose-400",
};

function AcquireModal({ onClose }: { onClose: () => void }) {
  const { data: species = [] } = usePetSpecies();
  const createPet = useCreatePet();
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");
  const speciesList = species as Record<string, unknown>[];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg border-primary/30">
        <CardHeader>
          <CardTitle>🐾 Thu phục Pet mới</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Đặt tên cho pet..." value={name} onChange={e => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
            {speciesList.map(s => (
              <button key={s.id as string} onClick={() => setSelected(s.id as string)}
                className={`p-3 rounded border text-left transition-colors ${selected === s.id ? "border-primary bg-primary/20" : "border-border hover:border-primary/50"}`}>
                <div className="text-2xl">{(s.icon as string) ?? TYPE_ICONS[s.type as string]}</div>
                <div className="font-medium text-sm mt-1">{s.name as string}</div>
                <div className={`text-xs font-semibold ${RARITY_COLORS[s.rarity as string]}`}>{s.rarity as string}</div>
                <div className="text-xs text-muted-foreground">{s.type as string}</div>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Hủy</Button>
            <Button className="flex-1"
              disabled={!selected || !name || createPet.isPending}
              onClick={() => createPet.mutate({ speciesId: selected!, name }, { onSuccess: onClose })}>
              {createPet.isPending ? "Đang thu phục..." : "✨ Thu phục"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PetCollection() {
  const { data: pets = [], isLoading } = usePets();
  const summonPet  = useSummonPet();
  const dismissPet = useDismissPet();
  const [showAcquire, setShowAcquire] = useState(false);
  const [filter, setFilter] = useState("");
  const petList = (pets as Record<string, unknown>[]).filter(p =>
    !(filter) || (p.name as string).toLowerCase().includes(filter.toLowerCase()) || (p.type as string).toLowerCase().includes(filter.toLowerCase())
  );

  if (isLoading) return <div className="p-8 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="p-6 space-y-6">
      {showAcquire && <AcquireModal onClose={() => setShowAcquire(false)} />}

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">🐾 Bộ sưu tập Pet</h1>
        <Button onClick={() => setShowAcquire(true)}>✨ Thu phục Pet</Button>
      </div>

      <Input placeholder="Tìm kiếm pet..." value={filter} onChange={e => setFilter(e.target.value)} className="max-w-sm" />

      {petList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center space-y-4">
            <div className="text-6xl">🐾</div>
            <div className="text-muted-foreground">Chưa có pet nào. Thu phục ngay!</div>
            <Button onClick={() => setShowAcquire(true)}>✨ Thu phục Pet đầu tiên</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {petList.map(pet => {
            const xpNeeded = Math.floor(100 * Math.pow((pet.level as number) + 1, 1.5));
            const xpPct    = Math.min(100, Math.round(((pet.experience as number) / xpNeeded) * 100));
            return (
              <Card key={pet.id as string} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-3xl flex-shrink-0">
                      {TYPE_ICONS[pet.type as string] ?? "🐾"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold truncate">{pet.name as string}</span>
                        <Badge variant="outline" className={`text-xs ${RARITY_COLORS[pet.rarity as string]}`}>
                          {pet.rarity as string}
                        </Badge>
                        {pet.isSummoned && <Badge variant="default" className="text-xs">⚡ Triệu hồi</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">{pet.type as string} · Stage {pet.evolutionStage as number}</div>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Lv.{pet.level as number}</span>
                          <span>{pet.experience as number}/{xpNeeded} XP</span>
                        </div>
                        <Progress value={xpPct} className="h-1.5" />
                      </div>
                      <div className="flex gap-3 text-xs mt-2 text-muted-foreground">
                        <span>❤️ {pet.hp as number}/{pet.maxHp as number}</span>
                        <span>😊 {pet.happiness as number}</span>
                        <span>🍖 {pet.hunger as number}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link href={`/pets/${pet.id as string}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">Chi tiết</Button>
                    </Link>
                    {pet.isSummoned ? (
                      <Button size="sm" variant="secondary"
                        disabled={dismissPet.isPending}
                        onClick={() => dismissPet.mutate(pet.id as string)}>
                        Hủy triệu hồi
                      </Button>
                    ) : (
                      <Button size="sm"
                        disabled={summonPet.isPending}
                        onClick={() => summonPet.mutate(pet.id as string)}>
                        Triệu hồi
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
