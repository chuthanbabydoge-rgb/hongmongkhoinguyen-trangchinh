import { Link } from "wouter";
import { PawPrint, Sparkles, Shield, Zap, Heart, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePets, useSummonedPet } from "@/hooks/usePets";

const RARITY_COLORS: Record<string, string> = {
  COMMON: "text-gray-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
  EPIC: "text-purple-400", LEGENDARY: "text-orange-400", MYTHIC: "text-rose-400",
};
const TYPE_ICONS: Record<string, string> = {
  BEAST: "🐾", DRAGON: "🐉", SPIRIT: "✨", MECHANICAL: "🤖", ELEMENTAL: "🔥", CELESTIAL: "🌟",
};
const RARITY_BADGE: Record<string, string> = {
  COMMON: "secondary", UNCOMMON: "outline", RARE: "default",
  EPIC: "secondary", LEGENDARY: "default", MYTHIC: "destructive",
};

export default function PetDashboard() {
  const { data: pets = [] } = usePets();
  const { data: summoned }  = useSummonedPet();
  const petList = pets as Record<string, unknown>[];
  const summonedPet = summoned as Record<string, unknown> | null | undefined;

  const totalPets = petList.length;
  const avgLevel  = totalPets ? Math.round(petList.reduce((a, p) => a + ((p.level as number) ?? 1), 0) / totalPets) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PawPrint className="text-primary" /> Universe Pets
        </h1>
        <Link href="/pets/collection">
          <Button size="sm">🐾 Xem tất cả</Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: PawPrint, label: "Tổng Pet",    value: totalPets, color: "text-primary" },
          { icon: Star,     label: "Level TB",    value: avgLevel,  color: "text-yellow-400" },
          { icon: Heart,    label: "Đang triệu hồi", value: summonedPet ? 1 : 0, color: "text-pink-400" },
          { icon: Sparkles, label: "Tiến hóa",   value: petList.filter(p => (p.evolutionStage as number) > 1).length, color: "text-purple-400" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="border-border/50">
            <CardContent className="pt-4 pb-4 text-center">
              <Icon className={`mx-auto mb-1 ${color}`} size={20} />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summoned Pet */}
      {summonedPet && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" /> Pet đang triệu hồi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-3xl">
                {TYPE_ICONS[summonedPet.type as string] ?? "🐾"}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{summonedPet.name as string}</span>
                  <Badge variant={RARITY_BADGE[summonedPet.rarity as string] as never}>{summonedPet.rarity as string}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Level {summonedPet.level as number} · {summonedPet.type as string}
                </div>
                <Progress value={Math.min(100, ((summonedPet.happiness as number) ?? 100))} className="h-1.5" />
                <div className="text-xs text-muted-foreground">
                  Happiness: {summonedPet.happiness as number}/100
                </div>
              </div>
              <Link href={`/pets/${summonedPet.id as string}`}>
                <Button variant="outline" size="sm">Chi tiết</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Nav */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { icon: "🐾", label: "Bộ sưu tập",  desc: "Tất cả pet của bạn",        path: "/pets/collection" },
          { icon: "🏋️", label: "Huấn luyện",  desc: "Train & nâng cấp pet",      path: "/pets/training" },
          { icon: "✨", label: "Tiến hóa",     desc: "Evolve pet lên giai đoạn mới", path: "/pets/evolution" },
          { icon: "⚔️", label: "Kỹ năng",     desc: "Skill tree của pet",         path: "/pets/skills" },
          { icon: "🛡️", label: "Trang bị",    desc: "Equipment & gear cho pet",   path: "/pets/equipment" },
          { icon: "📊", label: "Hồ sơ Pet",   desc: "Profile & chi tiết pet",     path: "/pets/collection" },
        ].map(({ icon, label, desc, path }) => (
          <Link key={path + label} href={path}>
            <Card className="cursor-pointer border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="pt-4 pb-4">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Pets */}
      {petList.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <PawPrint size={16} /> Pet gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {petList.slice(0, 4).map((pet) => {
              const xpPct = Math.min(100, Math.round(((pet.experience as number) / Math.floor(100 * Math.pow((pet.level as number) + 1, 1.5))) * 100));
              return (
                <Link key={pet.id as string} href={`/pets/${pet.id as string}`}>
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">
                      {TYPE_ICONS[pet.type as string] ?? "🐾"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{pet.name as string}</span>
                        <span className={`text-xs font-semibold ${RARITY_COLORS[pet.rarity as string]}`}>
                          {pet.rarity as string}
                        </span>
                        {pet.isSummoned && <Badge variant="outline" className="text-[10px]">Triệu hồi</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Lv.{pet.level as number}</span>
                        <Progress value={xpPct} className="h-1 flex-1" />
                        <span className="text-xs text-muted-foreground">{xpPct}%</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ❤️ {pet.hp as number}/{pet.maxHp as number}
                    </div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {petList.length === 0 && (
        <Card className="border-dashed border-border/50">
          <CardContent className="pt-10 pb-10 text-center space-y-4">
            <div className="text-6xl">🐾</div>
            <div className="text-muted-foreground">Bạn chưa có pet nào</div>
            <Link href="/pets/collection">
              <Button>✨ Thu phục Pet đầu tiên</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
