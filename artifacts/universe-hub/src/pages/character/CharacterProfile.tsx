import { User, Edit2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCharacter } from "@/hooks/useCharacter";
import { useState } from "react";

export default function CharacterProfile() {
  const { data: raw, isLoading } = useCharacter();
  const char = raw as Record<string, unknown> | null | undefined;
  const [editing, setEditing] = useState(false);

  if (isLoading) return <div className="p-8 text-muted-foreground">Đang tải...</div>;
  if (!char) return <div className="p-8 text-muted-foreground">Chưa có nhân vật. <a href="/character" className="text-primary">Tạo ngay</a></div>;

  const attrs = (char.attributes as Record<string, number>) ?? {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><User className="text-primary" /> Hồ sơ nhân vật</h1>
        <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
          {editing ? <Save size={14} /> : <Edit2 size={14} />}
          {editing ? " Lưu" : " Chỉnh sửa"}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-sm">Thông tin cơ bản</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Tên",        value: char.name as string },
              { label: "Lớp",        value: char.class as string },
              { label: "Chủng tộc",  value: char.race as string },
              { label: "Phe phái",   value: char.faction as string ?? "NEUTRAL" },
              { label: "Cấp độ",     value: `${char.level as number}` },
              { label: "Power Score",value: `⚡ ${char.powerScore as number}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-1 border-b border-border/30">
                <span className="text-muted-foreground text-sm">{label}</span>
                <Badge variant="outline">{value}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-sm">Thuộc tính (Attributes)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { key: "strength",     label: "💪 Sức mạnh",   color: "text-red-400" },
              { key: "agility",      label: "⚡ Nhanh nhẹn", color: "text-yellow-400" },
              { key: "intelligence", label: "🧠 Trí tuệ",    color: "text-blue-400" },
              { key: "vitality",     label: "❤️ Sinh lực",   color: "text-green-400" },
              { key: "wisdom",       label: "🌙 Khôn ngoan", color: "text-purple-400" },
              { key: "luck",         label: "🍀 May mắn",    color: "text-teal-400" },
            ].map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-3">
                <span className={`text-xs w-28 ${color}`}>{label}</span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((attrs[key] ?? 10) / 50) * 100)}%` }} />
                </div>
                <span className="text-xs font-mono w-8 text-right">{attrs[key] ?? 10}</span>
              </div>
            ))}
            {attrs.freePoints > 0 && (
              <div className="mt-2 text-xs text-yellow-400 font-medium">
                ✨ {attrs.freePoints} điểm thuộc tính chưa phân bổ
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
