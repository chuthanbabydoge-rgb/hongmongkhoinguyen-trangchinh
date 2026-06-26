import { Palette, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCharacter, useUpdateAppearance } from "@/hooks/useCharacter";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const SKIN_TONES  = ["light", "fair", "medium", "tan", "dark", "deep"];
const HAIR_STYLES = ["default", "short", "long", "curly", "braided", "bald"];
const HAIR_COLORS = ["#4a3728", "#2c2c2c", "#c8a96e", "#b5451b", "#6b3fa0", "#1a8cff", "#e0e0e0"];
const EYE_COLORS  = ["#3b5998", "#2d8a4e", "#8b5e3c", "#4a4a4a", "#9b4dca", "#cc0000"];
const FACE_STYLES = ["default", "round", "angular", "soft", "sharp"];
const BODY_TYPES  = ["slim", "medium", "athletic", "heavy"];

export default function Appearance() {
  const { data: raw } = useCharacter();
  const char = raw as Record<string, unknown> | null | undefined;
  const customization = (char?.customization as Record<string, unknown>) ?? {};
  const updateApp = useUpdateAppearance();
  const { toast } = useToast();

  const [form, setForm] = useState({
    skinTone:  "medium", hairStyle: "default", hairColor: "#4a3728",
    eyeColor:  "#3b5998", faceStyle: "default", bodyType: "medium",
  });

  useEffect(() => {
    if (customization.skinTone) {
      setForm({
        skinTone:  (customization.skinTone as string)  ?? "medium",
        hairStyle: (customization.hairStyle as string) ?? "default",
        hairColor: (customization.hairColor as string) ?? "#4a3728",
        eyeColor:  (customization.eyeColor as string)  ?? "#3b5998",
        faceStyle: (customization.faceStyle as string) ?? "default",
        bodyType:  (customization.bodyType as string)  ?? "medium",
      });
    }
  }, [char]);

  const handleSave = () => {
    updateApp.mutate(form, {
      onSuccess: () => toast({ title: "✅ Đã lưu ngoại hình!" }),
    });
  };

  if (!char) return <div className="p-8 text-muted-foreground">Chưa có nhân vật.</div>;

  const f = (v: string) => setForm(p => ({ ...p, ...JSON.parse(v) }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Palette className="text-primary" /> Ngoại hình</h1>
        <Button onClick={handleSave} disabled={updateApp.isPending}>
          <Save size={14} className="mr-1" /> {updateApp.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>

      {/* Preview */}
      <Card className="border-primary/30">
        <CardContent className="pt-6 pb-6 flex items-center justify-center">
          <div className="text-8xl filter drop-shadow-lg">🧙</div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-sm">Màu da & Tóc</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Section label="Màu da">
              {SKIN_TONES.map(tone => (
                <button key={tone} onClick={() => f(JSON.stringify({ skinTone: tone }))}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${form.skinTone === tone ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground"}`}>
                  {tone}
                </button>
              ))}
            </Section>
            <Section label="Kiểu tóc">
              {HAIR_STYLES.map(style => (
                <button key={style} onClick={() => f(JSON.stringify({ hairStyle: style }))}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${form.hairStyle === style ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground"}`}>
                  {style}
                </button>
              ))}
            </Section>
            <div>
              <div className="text-xs text-muted-foreground mb-2">Màu tóc</div>
              <div className="flex gap-2 flex-wrap">
                {HAIR_COLORS.map(c => (
                  <button key={c} onClick={() => f(JSON.stringify({ hairColor: c }))}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${form.hairColor === c ? "border-white scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-sm">Mắt & Vóc dáng</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-2">Màu mắt</div>
              <div className="flex gap-2 flex-wrap">
                {EYE_COLORS.map(c => (
                  <button key={c} onClick={() => f(JSON.stringify({ eyeColor: c }))}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${form.eyeColor === c ? "border-white scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <Section label="Kiểu mặt">
              {FACE_STYLES.map(style => (
                <button key={style} onClick={() => f(JSON.stringify({ faceStyle: style }))}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${form.faceStyle === style ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground"}`}>
                  {style}
                </button>
              ))}
            </Section>
            <Section label="Vóc dáng">
              {BODY_TYPES.map(type => (
                <button key={type} onClick={() => f(JSON.stringify({ bodyType: type }))}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${form.bodyType === type ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground"}`}>
                  {type}
                </button>
              ))}
            </Section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-2">{label}</div>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}
