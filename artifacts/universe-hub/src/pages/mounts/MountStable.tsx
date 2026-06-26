import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useMounts, useMountTypes, useCreateMount, useTrainMount } from "@/hooks/useMounts";

const TYPE_ICONS: Record<string, string> = {
  HORSE: "🐴", WOLF: "🐺", DRAGON: "🐉", PHOENIX: "🦅", TIGER: "🐯", MECH: "🤖",
};
const RARITY_COLORS: Record<string, string> = {
  COMMON: "text-gray-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
  EPIC: "text-purple-400", LEGENDARY: "text-orange-400", MYTHIC: "text-rose-400",
};
const STATUS_ICONS: Record<string, string> = {
  ACTIVE: "⚡", RESTING: "💤", TRAINING: "🏋️", TRAVELING: "🗺️",
};

function AcquireModal({ onClose }: { onClose: () => void }) {
  const { data: types = [] } = useMountTypes();
  const createMount = useCreateMount();
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");
  const typeList = types as Record<string, unknown>[];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg border-primary/30">
        <CardHeader><CardTitle>🐴 Mua Mount mới</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Đặt tên cho mount..." value={name} onChange={e => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {typeList.map(t => (
              <button key={t.id as string} onClick={() => setSelected(t.id as string)}
                className={`p-3 rounded border text-left transition-colors ${selected === t.id ? "border-primary bg-primary/20" : "border-border hover:border-primary/50"}`}>
                <div className="text-2xl">{(t.icon as string) ?? TYPE_ICONS[t.type as string]}</div>
                <div className="font-medium text-sm mt-1">{t.name as string}</div>
                <div className={`text-xs font-semibold ${RARITY_COLORS[t.rarity as string]}`}>{t.rarity as string}</div>
                <div className="text-xs text-muted-foreground">Speed {t.baseSpeed as number} · Stamina {t.baseStamina as number}</div>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Hủy</Button>
            <Button className="flex-1"
              disabled={!selected || !name || createMount.isPending}
              onClick={() => createMount.mutate({ typeId: selected!, name }, { onSuccess: onClose })}>
              {createMount.isPending ? "Đang mua..." : "🐴 Mua Mount"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MountStable() {
  const { data: mounts = [], isLoading } = useMounts();
  const trainMount = useTrainMount();
  const [showAcquire, setShowAcquire] = useState(false);
  const [training, setTraining] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const mountList = mounts as Record<string, unknown>[];

  const handleTrain = (mountId: string, type: string) => {
    setTraining(mountId);
    trainMount.mutate({ mountId, trainingType: type }, {
      onSuccess: (data) => {
        const d = data as { ok: boolean; data: { leveled?: boolean; newLevel?: number } };
        setLastResult(d.ok ? `✅ Huấn luyện xong!${d.data?.leveled ? ` 🎉 Level Up → Lv.${d.data.newLevel}` : ""}` : "❌ Thất bại");
        setTraining(null);
      },
    });
  };

  if (isLoading) return <div className="p-8 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="p-6 space-y-6">
      {showAcquire && <AcquireModal onClose={() => setShowAcquire(false)} />}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🐴 Chuồng Ngựa</h1>
        <Button onClick={() => setShowAcquire(true)}>🐴 Mua Mount</Button>
      </div>

      {lastResult && (
        <Card className="border-green-500/30 bg-green-500/10">
          <CardContent className="pt-3 pb-3 text-sm">{lastResult}</CardContent>
        </Card>
      )}

      {mountList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center space-y-4">
            <div className="text-6xl">🐴</div>
            <div className="text-muted-foreground">Chuồng ngựa trống. Mua mount đầu tiên!</div>
            <Button onClick={() => setShowAcquire(true)}>🐴 Mua Mount</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mountList.map(mount => {
            const xpNeeded = Math.floor(80 * Math.pow((mount.level as number) + 1, 1.5));
            const xpPct    = Math.min(100, Math.round(((mount.experience as number) / xpNeeded) * 100));
            const staminaPct = Math.round(((mount.stamina as number) / (mount.maxStamina as number)) * 100);
            const isTrain   = training === mount.id;

            return (
              <Card key={mount.id as string} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="pt-4 pb-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-3xl flex-shrink-0">
                      {TYPE_ICONS[mount.type as string] ?? "🐴"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold truncate">{mount.name as string}</span>
                        <Badge variant="outline" className={`text-xs ${RARITY_COLORS[mount.rarity as string]}`}>
                          {mount.rarity as string}
                        </Badge>
                        <span className="text-xs">{STATUS_ICONS[mount.status as string]} {mount.status as string}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{mount.type as string} · Lv.{mount.level as number}</div>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>XP</span><span>{xpPct}%</span>
                        </div>
                        <Progress value={xpPct} className="h-1.5" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Stamina</span><span>{mount.stamina as number}/{mount.maxStamina as number}</span>
                        </div>
                        <Progress value={staminaPct} className="h-1.5" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 text-center text-xs divide-x divide-border/30">
                    <div><div className="font-semibold">{mount.speed as number}</div><div className="text-muted-foreground">Speed</div></div>
                    <div><div className="font-semibold">{mount.stamina as number}</div><div className="text-muted-foreground">Stamina</div></div>
                    <div><div className="font-semibold">{mount.level as number}</div><div className="text-muted-foreground">Level</div></div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1"
                      disabled={isTrain || mount.status === "TRAVELING"}
                      onClick={() => handleTrain(mount.id as string, "speed")}>
                      {isTrain ? "..." : "⚡ Train Speed"}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1"
                      disabled={isTrain || mount.status === "TRAVELING"}
                      onClick={() => handleTrain(mount.id as string, "stamina")}>
                      {isTrain ? "..." : "💪 Train Stamina"}
                    </Button>
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
