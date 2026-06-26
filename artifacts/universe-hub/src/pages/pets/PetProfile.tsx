import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePet, usePetBond, usePetLogs, useFeedPet, useSummonPet, useDismissPet, useEvolvePet } from "@/hooks/usePets";
import { ArrowLeft, Heart, Shield, Zap, Star } from "lucide-react";

const TYPE_ICONS: Record<string, string> = {
  BEAST: "🐾", DRAGON: "🐉", SPIRIT: "✨", MECHANICAL: "🤖", ELEMENTAL: "🔥", CELESTIAL: "🌟",
};
const RARITY_COLORS: Record<string, string> = {
  COMMON: "text-gray-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
  EPIC: "text-purple-400", LEGENDARY: "text-orange-400", MYTHIC: "text-rose-400",
};

export default function PetProfile() {
  const [, params] = useRoute("/pets/:id");
  const petId = params?.id ?? null;
  const { data, isLoading } = usePet(petId);
  const { data: bond }      = usePetBond(petId);
  const { data: logs = [] } = usePetLogs(petId);
  const feedPet    = useFeedPet();
  const summonPet  = useSummonPet();
  const dismissPet = useDismissPet();
  const evolvePet  = useEvolvePet();

  const pet  = data as Record<string, unknown> | null | undefined;
  const b    = bond as Record<string, unknown> | null | undefined;
  const logList = logs as Record<string, unknown>[];

  if (isLoading) return <div className="p-8 text-muted-foreground">Đang tải...</div>;
  if (!pet) return <div className="p-8 text-muted-foreground">Không tìm thấy pet.</div>;

  const xpNeeded = Math.floor(100 * Math.pow((pet.level as number) + 1, 1.5));
  const xpPct    = Math.min(100, Math.round(((pet.experience as number) / xpNeeded) * 100));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pets/collection"><Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button></Link>
        <h1 className="text-2xl font-bold">🐾 {pet.name as string}</h1>
      </div>

      {/* Hero Card */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-5xl">
              {TYPE_ICONS[pet.type as string] ?? "🐾"}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold">{pet.name as string}</h2>
                {pet.nickname && <span className="text-muted-foreground">"{pet.nickname as string}"</span>}
                <Badge className={`${RARITY_COLORS[pet.rarity as string]}`} variant="outline">{pet.rarity as string}</Badge>
                {pet.isSummoned && <Badge variant="default">⚡ Triệu hồi</Badge>}
              </div>
              <div className="text-sm text-muted-foreground">{pet.type as string} · Stage {pet.evolutionStage as number}</div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Level {pet.level as number}</span>
                  <span>{pet.experience as number}/{xpNeeded} XP</span>
                </div>
                <Progress value={xpPct} className="h-2" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs bg-muted px-2 py-1 rounded">❤️ HP: {pet.hp as number}/{pet.maxHp as number}</span>
                <span className="text-xs bg-muted px-2 py-1 rounded">😊 {pet.happiness as number}/100</span>
                <span className="text-xs bg-muted px-2 py-1 rounded">🍖 {pet.hunger as number}/100</span>
                <span className="text-xs bg-muted px-2 py-1 rounded">💝 Loyalty: {pet.loyalty as number}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Zap,    label: "ATK",    value: pet.attack  as number, color: "text-red-400" },
          { icon: Shield, label: "DEF",    value: pet.defense as number, color: "text-blue-400" },
          { icon: Star,   label: "SPD",    value: pet.speed   as number, color: "text-yellow-400" },
          { icon: Heart,  label: "MAX HP", value: pet.maxHp   as number, color: "text-green-400" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="border-border/50">
            <CardContent className="pt-4 pb-4 text-center">
              <Icon className={`mx-auto mb-1 ${color}`} size={18} />
              <div className="text-xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bond */}
      {b && (
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2">💝 Bond Level</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-pink-400">Lv.{b.bondLevel as number}</div>
              <div className="flex-1">
                <Progress value={Math.min(100, ((b.bondPoints as number) % 100))} className="h-2" />
              </div>
              <div className="text-xs text-muted-foreground">{b.bondPoints as number} pts</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-sm">⚡ Hành động nhanh</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline"
            disabled={feedPet.isPending}
            onClick={() => feedPet.mutate({ petId: petId! })}>
            🍖 Cho ăn
          </Button>
          {pet.isSummoned ? (
            <Button size="sm" variant="secondary"
              disabled={dismissPet.isPending}
              onClick={() => dismissPet.mutate(petId!)}>
              ❌ Hủy triệu hồi
            </Button>
          ) : (
            <Button size="sm"
              disabled={summonPet.isPending}
              onClick={() => summonPet.mutate(petId!)}>
              ⚡ Triệu hồi
            </Button>
          )}
          <Button size="sm" variant="outline"
            disabled={evolvePet.isPending}
            onClick={() => evolvePet.mutate(petId!)}>
            ✨ Tiến hóa
          </Button>
          <Link href={`/pets/training`}><Button size="sm" variant="outline">🏋️ Huấn luyện</Button></Link>
          <Link href={`/pets/skills`}><Button size="sm" variant="outline">⚔️ Kỹ năng</Button></Link>
          <Link href={`/pets/equipment`}><Button size="sm" variant="outline">🛡️ Trang bị</Button></Link>
        </CardContent>
      </Card>

      {/* Logs */}
      {logList.length > 0 && (
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-sm">📋 Hoạt động gần đây</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {logList.slice(0, 8).map(log => (
              <div key={log.id as string} className="flex items-center justify-between text-sm py-1 border-b border-border/30 last:border-0">
                <span>{log.action as string}{log.detail ? ` — ${log.detail as string}` : ""}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.createdAt as string).toLocaleDateString("vi-VN")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
