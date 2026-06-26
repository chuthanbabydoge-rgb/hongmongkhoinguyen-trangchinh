import { Link } from "wouter";
import { User, Sword, Star, Zap, Shield, TrendingUp, Award, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCharacter, useCreateCharacter } from "@/hooks/useCharacter";
import { useState } from "react";

const CLASS_COLORS: Record<string, string> = {
  WARRIOR: "text-red-400", MAGE: "text-blue-400", ARCHER: "text-green-400",
  ASSASSIN: "text-purple-400", ENGINEER: "text-yellow-400", SUMMONER: "text-pink-400",
};
const CLASS_ICONS: Record<string, string> = {
  WARRIOR: "⚔️", MAGE: "🔮", ARCHER: "🏹", ASSASSIN: "🗡️", ENGINEER: "🔧", SUMMONER: "🐉",
};
const RACE_ICONS: Record<string, string> = {
  HUMAN: "👤", ELF: "🧝", DWARF: "⛏️", DEMON: "😈", ANGEL: "😇", BEAST: "🐺",
};

function CreateCharacterForm({ onCreate }: { onCreate: () => void }) {
  const create = useCreateCharacter();
  const [form, setForm] = useState({ name: "", class: "WARRIOR", race: "HUMAN" });

  const classes = ["WARRIOR", "MAGE", "ARCHER", "ASSASSIN", "ENGINEER", "SUMMONER"];
  const races   = ["HUMAN", "ELF", "DWARF", "DEMON", "ANGEL", "BEAST"];

  return (
    <div className="max-w-md mx-auto mt-20 space-y-6">
      <Card className="border-primary/30">
        <CardHeader><CardTitle className="text-center">✨ Tạo nhân vật mới</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Tên nhân vật</label>
            <input
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full mt-1 bg-muted border border-border rounded px-3 py-2 text-sm"
              placeholder="Nhập tên..."
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Lớp nhân vật</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {classes.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, class: c }))}
                  className={`p-2 rounded border text-xs font-medium transition-colors ${form.class === c ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                  {CLASS_ICONS[c]} {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Chủng tộc</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {races.map(r => (
                <button key={r} onClick={() => setForm(f => ({ ...f, race: r }))}
                  className={`p-2 rounded border text-xs font-medium transition-colors ${form.race === r ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                  {RACE_ICONS[r]} {r}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full" disabled={!form.name || create.isPending}
            onClick={() => create.mutate(form as never, { onSuccess: onCreate })}>
            {create.isPending ? "Đang tạo..." : "🚀 Tạo nhân vật"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CharacterDashboard() {
  const { data: character, isLoading, refetch } = useCharacter();
  const char = character as Record<string, unknown> | null | undefined;

  if (isLoading) return <div className="p-8 text-muted-foreground">Đang tải nhân vật...</div>;
  if (!char) return <CreateCharacterForm onCreate={() => refetch()} />;

  const level    = (char.level as number) ?? 1;
  const xp       = (char.experience as number) ?? 0;
  const xpNeeded = Math.floor(100 * Math.pow(level + 1, 1.5));
  const pct      = Math.min(100, Math.round((xp / xpNeeded) * 100));
  const stats    = (char.stats as Record<string, number>) ?? {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><User className="text-primary" /> Universe Character</h1>
        <Link href="/character/appearance">
          <Button variant="outline" size="sm">✏️ Ngoại hình</Button>
        </Link>
      </div>

      {/* Hero Card */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-4xl">
              {CLASS_ICONS[char.class as string] ?? "🧙"}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">{char.name as string}</h2>
                {char.title && <Badge variant="secondary">{char.title as string}</Badge>}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className={`font-semibold ${CLASS_COLORS[char.class as string]}`}>
                  {CLASS_ICONS[char.class as string]} {char.class as string}
                </span>
                <span className="text-muted-foreground">•</span>
                <span>{RACE_ICONS[char.race as string]} {char.race as string}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{char.faction as string}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Cấp {level}</span>
                  <span>{xp.toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-yellow-400 font-bold">⚡ Power: {char.powerScore as number}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Sword,    label: "ATK",     value: stats.attack  ?? 10,  color: "text-red-400" },
          { icon: Shield,   label: "DEF",     value: stats.defense ?? 5,   color: "text-blue-400" },
          { icon: Zap,      label: "SPD",     value: stats.speed   ?? 10,  color: "text-yellow-400" },
          { icon: TrendingUp,label:"HP",      value: stats.maxHp   ?? 100, color: "text-green-400" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="border-border/50">
            <CardContent className="pt-4 pb-4 text-center">
              <Icon className={`mx-auto mb-1 ${color}`} size={20} />
              <div className="text-lg font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { icon: "🎯", label: "Kỹ năng", desc: "Cây kỹ năng & Skill tree", path: "/character/skills" },
          { icon: "⚔️", label: "Trang bị", desc: "Equipment & Loadout", path: "/character/equipment" },
          { icon: "👑", label: "Danh hiệu", desc: "Bộ sưu tập danh hiệu", path: "/character/titles" },
          { icon: "📊", label: "Chỉ số", desc: "Stats & Attributes", path: "/character/stats" },
          { icon: "🎨", label: "Ngoại hình", desc: "Customization", path: "/character/appearance" },
          { icon: "💾", label: "Loadout", desc: "Lưu cấu hình", path: "/character/loadouts" },
        ].map(({ icon, label, desc, path }) => (
          <Link key={path} href={path}>
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

      {/* Quick Actions */}
      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Award size={16}/> Hành động nhanh</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/character/skills"><Button variant="outline" size="sm">🎯 Học kỹ năng</Button></Link>
          <Link href="/character/equipment"><Button variant="outline" size="sm">⚔️ Trang bị</Button></Link>
          <Link href="/character/titles"><Button variant="outline" size="sm">👑 Chọn danh hiệu</Button></Link>
          <Link href="/character/loadouts"><Button variant="outline" size="sm">💾 Lưu loadout</Button></Link>
        </CardContent>
      </Card>
    </div>
  );
}
