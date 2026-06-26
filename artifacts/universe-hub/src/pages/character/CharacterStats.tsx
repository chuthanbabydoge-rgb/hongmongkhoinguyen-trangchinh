import { BarChart2, Heart, Zap, Shield, Sword, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCharacter, useXPLogs } from "@/hooks/useCharacter";

export default function CharacterStats() {
  const { data: raw } = useCharacter();
  const { data: logs = [] } = useXPLogs();
  const char = raw as Record<string, unknown> | null | undefined;
  const stats = (char?.stats as Record<string, number>) ?? {};
  const level = (char?.level as number) ?? 1;
  const xp    = (char?.experience as number) ?? 0;
  const xpNeeded = Math.floor(100 * Math.pow(level + 1, 1.5));

  if (!char) return <div className="p-8 text-muted-foreground">Chưa có nhân vật.</div>;

  const statRows = [
    { icon: Heart,    label: "HP",          value: stats.hp ?? 100,    max: stats.maxHp ?? 100,   color: "text-green-400",  bar: true  },
    { icon: Zap,      label: "MP",          value: stats.mp ?? 50,     max: stats.maxMp ?? 50,    color: "text-blue-400",   bar: true  },
    { icon: Sword,    label: "Tấn công",    value: stats.attack ?? 10, max: 200,                  color: "text-red-400",    bar: false },
    { icon: Shield,   label: "Phòng thủ",   value: stats.defense ?? 5, max: 200,                  color: "text-cyan-400",   bar: false },
    { icon: Activity, label: "Tốc độ",      value: stats.speed ?? 10,  max: 100,                  color: "text-yellow-400", bar: false },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart2 className="text-primary" /> Chỉ số nhân vật</h1>

      {/* XP Bar */}
      <Card className="border-primary/30">
        <CardHeader><CardTitle className="text-sm">Kinh nghiệm (XP)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Cấp {level}</span>
            <span className="text-muted-foreground">{xp.toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
          </div>
          <Progress value={Math.min(100, Math.round((xp / xpNeeded) * 100))} className="h-3" />
          <div className="text-xs text-muted-foreground text-right">
            Cần {(xpNeeded - xp).toLocaleString()} XP để lên cấp {level + 1}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-sm">Combat Stats</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {statRows.map(({ icon: Icon, label, value, max, color, bar }) => (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={14} className={color} />
                  <span className="text-sm">{label}</span>
                </div>
                <span className="text-sm font-mono font-bold">{bar ? `${value} / ${max}` : value}</span>
              </div>
              {bar && <Progress value={Math.round((value / max) * 100)} className="h-1.5" />}
            </div>
          ))}
          <div className="pt-2 border-t border-border/30 flex justify-between text-sm">
            <span className="text-muted-foreground">Chí mạng</span>
            <span>{((stats.critRate ?? 0.05) * 100).toFixed(1)}%  ×{(stats.critDamage ?? 1.5).toFixed(1)}</span>
          </div>
        </CardContent>
      </Card>

      {/* XP Logs */}
      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-sm">Lịch sử XP gần đây</CardTitle></CardHeader>
        <CardContent>
          {(logs as Record<string, unknown>[]).length === 0
            ? <p className="text-muted-foreground text-sm">Chưa có lịch sử.</p>
            : (logs as Record<string, unknown>[]).slice(0, 10).map((log, i) => (
              <div key={i} className="flex justify-between py-1.5 border-b border-border/20 text-sm">
                <span className="text-muted-foreground">{log.source as string}</span>
                <span className="text-green-400 font-mono">+{log.amount as number} XP</span>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
