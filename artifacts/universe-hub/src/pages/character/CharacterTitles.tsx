import { Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCharacterTitles, useSelectTitle } from "@/hooks/useCharacter";
import { useToast } from "@/hooks/use-toast";

export default function CharacterTitles() {
  const { data: titles = [], isLoading } = useCharacterTitles();
  const selectTitle = useSelectTitle();
  const { toast } = useToast();

  const list = titles as Record<string, unknown>[];

  const handleSelect = (titleKey: string) => {
    selectTitle.mutate(titleKey, {
      onSuccess: () => toast({ title: "👑 Đã chọn danh hiệu!" }),
    });
  };

  if (isLoading) return <div className="p-8 text-muted-foreground">Đang tải danh hiệu...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Crown className="text-primary" /> Danh hiệu</h1>

      {list.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
            <Crown className="mx-auto mb-3 opacity-30" size={40} />
            <p>Chưa có danh hiệu nào. Hoàn thành nhiệm vụ và thành tích để mở khóa danh hiệu!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(title => (
            <Card key={title.id as string} className={`border-border/50 ${title.isSelected ? "border-yellow-400/60 bg-yellow-400/5" : ""}`}>
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-sm">{title.titleName as string}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{title.titleDesc as string}</div>
                  </div>
                  {title.isSelected && <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/40">✓ Đang dùng</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">
                  Mở khóa: {new Date(title.unlockedAt as string).toLocaleDateString("vi-VN")}
                </div>
                <Button size="sm" variant={title.isSelected ? "outline" : "default"} className="w-full"
                  disabled={title.isSelected as boolean || selectTitle.isPending}
                  onClick={() => handleSelect(title.titleKey as string)}>
                  {title.isSelected ? "✓ Đang sử dụng" : "👑 Dùng danh hiệu này"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-sm">💡 Cách mở khóa danh hiệu</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>• Hoàn thành nhiệm vụ (Quest) đặc biệt</p>
          <p>• Đạt thành tích (Achievement) xuất sắc</p>
          <p>• Lên cấp đặc biệt (10, 20, 30...)</p>
          <p>• Chiến thắng sự kiện theo mùa</p>
        </CardContent>
      </Card>
    </div>
  );
}
