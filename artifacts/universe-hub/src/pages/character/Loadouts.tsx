import { Save, BookOpen, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCharacterPresets, useSavePreset } from "@/hooks/useCharacter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Loadouts() {
  const { data: presets = [], isLoading } = useCharacterPresets();
  const save = useSavePreset();
  const { toast } = useToast();
  const [name, setName] = useState("");

  const list = presets as Record<string, unknown>[];

  const handleSave = () => {
    if (!name.trim()) return;
    save.mutate(name.trim(), {
      onSuccess: () => { toast({ title: "💾 Đã lưu loadout!" }); setName(""); },
    });
  };

  if (isLoading) return <div className="p-8 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Save className="text-primary" /> Loadout</h1>

      {/* Save new */}
      <Card className="border-primary/30">
        <CardHeader><CardTitle className="text-sm">💾 Lưu cấu hình hiện tại</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <input value={name} onChange={e => setName(e.target.value)}
            className="flex-1 bg-muted border border-border rounded px-3 py-2 text-sm"
            placeholder="Tên loadout (vd: PvP Build, PvE Tank...)" />
          <Button onClick={handleSave} disabled={!name.trim() || save.isPending}>
            <Save size={14} className="mr-1" /> Lưu
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      {list.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
            <BookOpen className="mx-auto mb-3 opacity-30" size={40} />
            <p>Chưa có loadout nào. Hãy lưu cấu hình trang bị và kỹ năng đầu tiên!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map(preset => (
            <Card key={preset.id as string} className={`border-border/50 ${preset.isDefault ? "border-primary/40" : ""}`}>
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{preset.name as string}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(preset.createdAt as string).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  {preset.isDefault && <Badge variant="outline" className="text-primary">Mặc định</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download size={12} className="mr-1" /> Tải loadout
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
