import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Lightbulb, Trash2, Zap, ArrowLeft, ExternalLink } from "lucide-react";
import { aiService } from "@/services/aiService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

const ICONS: Record<string, string> = { QUEST:"⚔️", MARKETPLACE:"🛒", WALLET:"💰", GUILD:"🏰", SOCIAL:"👥", WORLD:"🌍", INVENTORY:"🎒", GENERAL:"💡" };
const COLORS: Record<string, string> = {
  QUEST:"bg-orange-500/20 text-orange-400 border-orange-500/30", MARKETPLACE:"bg-green-500/20 text-green-400 border-green-500/30",
  WALLET:"bg-yellow-500/20 text-yellow-400 border-yellow-500/30", GUILD:"bg-purple-500/20 text-purple-400 border-purple-500/30",
  SOCIAL:"bg-blue-500/20 text-blue-400 border-blue-500/30", WORLD:"bg-teal-500/20 text-teal-400 border-teal-500/30",
  INVENTORY:"bg-pink-500/20 text-pink-400 border-pink-500/30", GENERAL:"bg-gray-500/20 text-gray-400 border-gray-500/30",
};
const LABELS: Record<string, string> = { QUEST:"Quest", MARKETPLACE:"Marketplace", WALLET:"Wallet", GUILD:"Guild", SOCIAL:"Social", WORLD:"World", INVENTORY:"Inventory", GENERAL:"Chung" };

export default function AiSuggestions() {
  const qc    = useQueryClient();
  const { toast } = useToast();

  const { data: sugs = [], isLoading } = useQuery({ queryKey: ["ai-suggestions"], queryFn: () => aiService.listSuggestions() });

  const dismissMut = useMutation({
    mutationFn: (id: string) => aiService.dismissSuggestion(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ai-suggestions"] }); toast({ title: "Đã bỏ qua gợi ý" }); },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  const generateMut = useMutation({
    mutationFn: () => aiService.generateSuggestions(),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["ai-suggestions"] });
      toast({ title: created.length > 0 ? `Đã tạo ${created.length} gợi ý mới!` : "Nova không có gợi ý mới lúc này." });
    },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <Link href="/ai"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Quay lại</Button></Link>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Lightbulb className="w-6 h-6 text-primary" />Gợi ý của Nova</h1>
              <Button size="sm" onClick={() => generateMut.mutate()} disabled={generateMut.isPending} className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30">
                <Zap className="w-4 h-4 mr-1" />{generateMut.isPending ? "Đang phân tích..." : "Tạo gợi ý mới"}
              </Button>
            </div>
            {isLoading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />)}</div>
            ) : sugs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground bg-white/5 rounded-2xl border border-white/10">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="mb-4">Chưa có gợi ý nào. Nova sẽ phân tích dữ liệu Hub của bạn!</p>
                <Button onClick={() => generateMut.mutate()} disabled={generateMut.isPending} size="sm"><Zap className="w-4 h-4 mr-1" />Tạo gợi ý ngay</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {sugs.map(s => (
                  <div key={s.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-primary/20 transition-colors group">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl flex-shrink-0">{ICONS[s.type]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{s.title}</h3>
                          <Badge className={`text-xs border ${COLORS[s.type]}`}>{LABELS[s.type]}</Badge>
                          {s.priority >= 8 && <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">Quan trọng</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{s.body}</p>
                        {s.expiresAt && <div className="text-xs text-muted-foreground/60 mt-1">Hết hạn: {new Date(s.expiresAt).toLocaleDateString("vi-VN")}</div>}
                        {s.actionUrl && (
                          <Link href={s.actionUrl}><Button size="sm" className="mt-3 h-7 text-xs bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30"><ExternalLink className="w-3 h-3 mr-1" />Thực hiện ngay</Button></Link>
                        )}
                      </div>
                      <button onClick={() => dismissMut.mutate(s.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-400 transition-all rounded-lg hover:bg-red-400/10"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
