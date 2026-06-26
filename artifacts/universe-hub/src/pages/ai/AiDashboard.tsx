import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Bot, MessageSquare, Brain, Lightbulb, Plus, Trash2, ChevronRight, Zap, Activity } from "lucide-react";
import { aiService, type AiSuggestion } from "@/services/aiService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

const SUGGESTION_ICONS: Record<string, string> = {
  QUEST: "⚔️", MARKETPLACE: "🛒", WALLET: "💰", GUILD: "🏰",
  SOCIAL: "👥", WORLD: "🌍", INVENTORY: "🎒", GENERAL: "💡",
};
const TYPE_LABELS: Record<string, string> = {
  GENERAL: "Chung", QUEST_HELP: "Quest", MARKETPLACE_ADVICE: "Marketplace",
  WALLET_ADVICE: "Wallet", GUILD_ADVICE: "Guild", WORLD_GUIDE: "World",
  INVENTORY_HELP: "Inventory", SOCIAL_ASSIST: "Social",
};

function SuggestionCard({ sug, onDismiss }: { sug: AiSuggestion; onDismiss: (id: string) => void }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-primary/20 transition-colors">
      <div className="flex items-start gap-3">
        <div className="text-xl flex-shrink-0">{SUGGESTION_ICONS[sug.type]}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white">{sug.title}</div>
          <div className="text-sm text-muted-foreground mt-1">{sug.body}</div>
          {sug.actionUrl && (
            <Link href={sug.actionUrl}><Button size="sm" className="mt-2 text-xs h-7 bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30">Xem ngay →</Button></Link>
          )}
        </div>
        <button onClick={() => onDismiss(sug.id)} className="text-muted-foreground hover:text-white transition-colors flex-shrink-0 p-1"><Trash2 className="w-3 h-3" /></button>
      </div>
    </div>
  );
}

export default function AiDashboard() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: dashboard, isLoading } = useQuery({ queryKey: ["ai-dashboard"], queryFn: () => aiService.dashboard(), retry: false });
  const { data: convs = [] }            = useQuery({ queryKey: ["ai-conversations"], queryFn: () => aiService.listConversations(5) });

  const createConvMut = useMutation({
    mutationFn: () => aiService.createConversation({ title: "Hội thoại mới" }),
    onSuccess: (c) => { qc.invalidateQueries({ queryKey: ["ai-conversations"] }); navigate(`/ai/chat/${c.id}`); },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  const dismissMut = useMutation({
    mutationFn: (id: string) => aiService.dismissSuggestion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-dashboard"] }),
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  const generateMut = useMutation({
    mutationFn: () => aiService.generateSuggestions(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ai-dashboard"] }); toast({ title: "Đã tạo gợi ý mới!" }); },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent border border-primary/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl">🤖</div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">{dashboard?.personality.name ?? "Nova"}</h1>
                    <p className="text-muted-foreground">Universe AI Companion — {dashboard?.provider ?? "mock"} / {dashboard?.model ?? "..."}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-green-400 font-mono">ONLINE</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/ai/chat"><Button className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30"><MessageSquare className="w-4 h-4 mr-1" />Chat</Button></Link>
                  <Button variant="outline" size="sm" onClick={() => createConvMut.mutate()} disabled={createConvMut.isPending}><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{convs.length}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><MessageSquare className="w-3 h-3" />Hội thoại</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{dashboard?.memoryCount ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><Brain className="w-3 h-3" />Ký ức</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{dashboard?.suggestions.length ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><Lightbulb className="w-3 h-3" />Gợi ý</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">●</div>
                <div className="text-xs text-muted-foreground mt-1">Trạng thái</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: "💰", label: "Phân tích Wallet", href: "/ai/chat", prompt: "Phân tích wallet của tôi" },
                { icon: "⚔️", label: "Gợi ý Quest", href: "/ai/chat", prompt: "Gợi ý quest cho tôi" },
                { icon: "🛒", label: "Tư vấn Market", href: "/ai/chat", prompt: "Tư vấn marketplace" },
                { icon: "🌍", label: "Khám phá World", href: "/ai/chat", prompt: "Gợi ý world tốt nhất" },
              ].map(a => (
                <Link key={a.label} href={a.href}>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 hover:border-primary/20 transition-all cursor-pointer text-center">
                    <div className="text-2xl mb-1">{a.icon}</div>
                    <div className="text-sm text-muted-foreground">{a.label}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Recent Conversations */}
            {convs.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-white flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" />Hội thoại gần đây</h2>
                  <Link href="/ai/chat"><span className="text-xs text-primary hover:underline cursor-pointer">Xem tất cả</span></Link>
                </div>
                <div className="space-y-2">
                  {convs.map(c => (
                    <Link key={c.id} href={`/ai/chat/${c.id}`}>
                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer group">
                        <Bot className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{c.title}</div>
                          <div className="text-xs text-muted-foreground">{c.messageCount} tin nhắn · {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString("vi-VN") : "—"}</div>
                        </div>
                        <Badge className="text-xs">{TYPE_LABELS[c.type] ?? c.type}</Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-white flex items-center gap-2"><Lightbulb className="w-4 h-4 text-primary" />Gợi ý từ Nova</h2>
                <Button size="sm" variant="outline" onClick={() => generateMut.mutate()} disabled={generateMut.isPending} className="text-xs h-7">
                  <Zap className="w-3 h-3 mr-1" />{generateMut.isPending ? "Đang tạo..." : "Tạo gợi ý mới"}
                </Button>
              </div>
              {(dashboard?.suggestions.length ?? 0) === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-white/5 rounded-xl border border-white/10">
                  <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Chưa có gợi ý. Nhấn "Tạo gợi ý mới" để Nova phân tích dữ liệu của bạn!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dashboard!.suggestions.map(s => <SuggestionCard key={s.id} sug={s} onDismiss={(id) => dismissMut.mutate(id)} />)}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
