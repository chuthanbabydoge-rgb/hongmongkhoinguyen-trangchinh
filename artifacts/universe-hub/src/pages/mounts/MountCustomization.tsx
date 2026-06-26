import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMounts, useMountCustomization, useUpdateMountCustomization } from "@/hooks/useMounts";

const TYPE_ICONS: Record<string, string> = {
  HORSE: "🐴", WOLF: "🐺", DRAGON: "🐉", PHOENIX: "🦅", TIGER: "🐯", MECH: "🤖",
};

const COLORS = ["#8B4513", "#C0C0C0", "#FFD700", "#1E90FF", "#DC143C", "#32CD32", "#9400D3", "#FF8C00", "#000000", "#FFFFFF"];
const PATTERNS = ["solid", "spotted", "striped", "gradient", "flame", "crystal"];
const SADDLES  = ["default", "royal", "battle", "racing", "ancient"];
const GLOWS    = [null, "blue", "red", "green", "gold", "purple", "white"];
const TRAILS   = [null, "fire", "stars", "sparkle", "leaves", "lightning"];

export default function MountCustomization() {
  const { data: mounts = [] } = useMounts();
  const [selectedMount, setSelectedMount] = useState<string | null>(null);
  const { data: customization } = useMountCustomization(selectedMount);
  const updateCustom = useUpdateMountCustomization();
  const [lastSaved, setLastSaved] = useState(false);

  const mountList = mounts as Record<string, unknown>[];
  const custom    = customization as Record<string, unknown> | null | undefined;

  const [form, setForm] = useState({
    color:       "#8B4513",
    pattern:     "solid",
    saddle:      "default",
    glowEffect:  null as string | null,
    trailEffect: null as string | null,
  });

  const handleSelect = (mountId: string) => {
    setSelectedMount(mountId);
    setLastSaved(false);
  };

  const handleSave = () => {
    if (!selectedMount) return;
    updateCustom.mutate({ mountId: selectedMount, ...form }, {
      onSuccess: () => setLastSaved(true),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🎨 Tùy chỉnh Mount</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mount Selector */}
        <div className="space-y-3">
          <h2 className="font-semibold">🐴 Chọn Mount</h2>
          {mountList.map(mount => (
            <button key={mount.id as string}
              onClick={() => handleSelect(mount.id as string)}
              className={`w-full flex items-center gap-3 p-3 rounded border text-left transition-colors ${selectedMount === mount.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
              <span className="text-2xl">{TYPE_ICONS[mount.type as string] ?? "🐴"}</span>
              <div>
                <div className="font-medium text-sm">{mount.name as string}</div>
                <div className="text-xs text-muted-foreground">Lv.{mount.level as number}</div>
              </div>
            </button>
          ))}
          {mountList.length === 0 && <div className="text-muted-foreground text-sm">Chưa có mount nào</div>}
        </div>

        {/* Customization Options */}
        {selectedMount ? (
          <div className="lg:col-span-2 space-y-4">
            {lastSaved && (
              <Card className="border-green-500/30 bg-green-500/10">
                <CardContent className="pt-3 pb-3 text-sm text-green-400">✅ Đã lưu tùy chỉnh!</CardContent>
              </Card>
            )}

            {/* Preview */}
            <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="text-7xl" style={{ filter: form.glowEffect ? `drop-shadow(0 0 10px ${form.glowEffect})` : undefined }}>
                  {TYPE_ICONS[mountList.find(m => m.id === selectedMount)?.type as string] ?? "🐴"}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {mountList.find(m => m.id === selectedMount)?.name as string}
                </div>
                <div className="flex justify-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline">{form.pattern}</Badge>
                  <Badge variant="outline">{form.saddle}</Badge>
                  {form.glowEffect && <Badge variant="secondary">✨ {form.glowEffect} glow</Badge>}
                  {form.trailEffect && <Badge variant="secondary">💫 {form.trailEffect} trail</Badge>}
                </div>
              </CardContent>
            </Card>

            {/* Color */}
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-sm">🎨 Màu sắc</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${form.color === c ? "border-white scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pattern */}
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-sm">🔶 Hoa văn</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {PATTERNS.map(p => (
                    <button key={p} onClick={() => setForm(f => ({ ...f, pattern: p }))}
                      className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors ${form.pattern === p ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Saddle */}
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-sm">🐎 Yên ngựa</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {SADDLES.map(s => (
                    <button key={s} onClick={() => setForm(f => ({ ...f, saddle: s }))}
                      className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors ${form.saddle === s ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Effects */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-sm">✨ Hiệu ứng Glow</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {GLOWS.map(g => (
                      <button key={g ?? "none"} onClick={() => setForm(f => ({ ...f, glowEffect: g }))}
                        className={`px-2 py-1 rounded border text-xs transition-colors ${form.glowEffect === g ? "border-primary bg-primary/20" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                        {g ?? "Không có"}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardHeader><CardTitle className="text-sm">💫 Trail Effect</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {TRAILS.map(t => (
                      <button key={t ?? "none"} onClick={() => setForm(f => ({ ...f, trailEffect: t }))}
                        className={`px-2 py-1 rounded border text-xs transition-colors ${form.trailEffect === t ? "border-primary bg-primary/20" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                        {t ?? "Không có"}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button className="w-full" disabled={updateCustom.isPending} onClick={handleSave}>
              {updateCustom.isPending ? "Đang lưu..." : "💾 Lưu tùy chỉnh"}
            </Button>
          </div>
        ) : (
          <div className="lg:col-span-2 text-center py-20 text-muted-foreground">
            Chọn mount để bắt đầu tùy chỉnh
          </div>
        )}
      </div>
    </div>
  );
}
