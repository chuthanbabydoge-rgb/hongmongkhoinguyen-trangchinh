import { Sparkles, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCharacterSkills, useLearnSkill } from "@/hooks/useCharacter";
import { useToast } from "@/hooks/use-toast";

const TYPE_COLORS: Record<string, string> = {
  ACTIVE: "text-blue-400", PASSIVE: "text-green-400", ULTIMATE: "text-yellow-400", TOGGLE: "text-purple-400",
};
const TYPE_LABELS: Record<string, string> = {
  ACTIVE: "Chủ động", PASSIVE: "Bị động", ULTIMATE: "Tối thượng", TOGGLE: "Bật/Tắt",
};

export default function SkillTree() {
  const { data: skills = [], isLoading } = useCharacterSkills();
  const learn = useLearnSkill();
  const { toast } = useToast();

  const list = skills as Record<string, unknown>[];

  const handleLearn = (skillId: string, isLearned: boolean, currentLevel: number, maxLevel: number) => {
    if (isLearned && currentLevel >= maxLevel) {
      toast({ title: "Đã đạt cấp tối đa", variant: "destructive" });
      return;
    }
    learn.mutate(
      { skillId, upgrade: isLearned },
      { onSuccess: () => toast({ title: isLearned ? "✨ Nâng cấp thành công!" : "🎯 Đã học skill!", description: skillId }) }
    );
  };

  if (isLoading) return <div className="p-8 text-muted-foreground">Đang tải cây kỹ năng...</div>;

  const ultimates = list.filter(s => s.skillType === "ULTIMATE");
  const others    = list.filter(s => s.skillType !== "ULTIMATE");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="text-primary" /> Cây kỹ năng</h1>

      {list.length === 0 ? (
        <div className="text-muted-foreground text-sm">Chưa có dữ liệu kỹ năng. Hãy tạo nhân vật trước.</div>
      ) : (
        <>
          {ultimates.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-1">⭐ Tối thượng</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {ultimates.map(skill => <SkillCard key={skill.id as string} skill={skill} onAction={handleLearn} isLoading={learn.isPending} />)}
              </div>
            </div>
          )}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2"><BookOpen size={14}/> Kỹ năng</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {others.map(skill => <SkillCard key={skill.id as string} skill={skill} onAction={handleLearn} isLoading={learn.isPending} />)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SkillCard({ skill, onAction, isLoading }: {
  skill: Record<string, unknown>;
  onAction: (id: string, learned: boolean, level: number, max: number) => void;
  isLoading: boolean;
}) {
  const learned      = skill.learned as boolean;
  const learnedLevel = (skill.learnedLevel as number) ?? 0;
  const maxLevel     = (skill.maxLevel as number) ?? 10;
  const pct          = Math.round((learnedLevel / maxLevel) * 100);

  return (
    <Card className={`border-border/50 ${learned ? "border-primary/40 bg-primary/5" : ""}`}>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{skill.icon as string}</span>
            <div>
              <div className="font-medium text-sm">{skill.name as string}</div>
              <div className={`text-xs ${TYPE_COLORS[skill.skillType as string]}`}>
                {TYPE_LABELS[skill.skillType as string]}
              </div>
            </div>
          </div>
          {learned && (
            <Badge variant="outline" className="text-xs text-primary">
              Lv {learnedLevel}/{maxLevel}
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground">{skill.description as string}</p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>⚡ {skill.mpCost as number} MP</span>
          <span>•</span>
          <span>🕐 {skill.baseCooldown as number}s CD</span>
          {skill.baseDamage ? <><span>•</span><span>💥 {skill.baseDamage as number} DMG</span></> : null}
        </div>

        {learned && learnedLevel > 0 && (
          <div className="w-full bg-muted rounded-full h-1">
            <div className="bg-primary h-1 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        )}

        <Button size="sm" variant={learned ? "outline" : "default"} className="w-full"
          disabled={isLoading || (learned && learnedLevel >= maxLevel)}
          onClick={() => onAction(skill.id as string, learned, learnedLevel, maxLevel)}>
          {learned
            ? learnedLevel >= maxLevel ? "✅ Tối đa" : "⬆️ Nâng cấp"
            : "📖 Học ngay"}
        </Button>
      </CardContent>
    </Card>
  );
}
