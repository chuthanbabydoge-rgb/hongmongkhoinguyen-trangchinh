import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Bot, MessageSquare, Lightbulb, Brain, ChevronRight } from "lucide-react";
import { aiService } from "@/services/aiService";
import { Button } from "@/components/ui/button";

export function AiWidget() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["ai-dashboard"],
    queryFn: () => aiService.dashboard(),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
        <div className="flex items-center gap-2"><Bot className="w-5 h-5 text-primary" /><span className="font-semibold text-white">Universe AI</span></div>
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-8 rounded bg-white/5 animate-pulse" />)}</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-sm">🤖</div>
          <div>
            <span className="font-semibold text-white">{dashboard?.personality.name ?? "Nova"}</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400 font-mono">ONLINE</span>
            </div>
          </div>
        </div>
        <Link href="/ai"><span className="text-xs text-primary hover:underline cursor-pointer">Mở AI →</span></Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <div className="text-base font-bold text-white">{dashboard?.conversations.length ?? 0}</div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5"><MessageSquare className="w-2.5 h-2.5" />Chat</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <div className="text-base font-bold text-white">{dashboard?.memoryCount ?? 0}</div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5"><Brain className="w-2.5 h-2.5" />Ký ức</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <div className="text-base font-bold text-white">{dashboard?.suggestions.length ?? 0}</div>
          <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5"><Lightbulb className="w-2.5 h-2.5" />Gợi ý</div>
        </div>
      </div>

      {/* Recent suggestion */}
      {(dashboard?.suggestions.length ?? 0) > 0 && (
        <div className="bg-primary/5 border border-primary/15 rounded-lg p-3">
          <div className="text-[10px] text-primary font-mono uppercase mb-1">💡 Nova gợi ý</div>
          <div className="text-sm text-white">{dashboard!.suggestions[0].title}</div>
          {dashboard!.suggestions[0].actionUrl && (
            <Link href={dashboard!.suggestions[0].actionUrl}>
              <div className="text-xs text-primary hover:underline cursor-pointer mt-1 flex items-center gap-0.5">Xem ngay <ChevronRight className="w-3 h-3" /></div>
            </Link>
          )}
        </div>
      )}

      {/* Recent conversation */}
      {(dashboard?.conversations.length ?? 0) > 0 && (
        <Link href={`/ai/chat/${dashboard!.conversations[0].id}`}>
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <Bot className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white/80 truncate">{dashboard!.conversations[0].title}</div>
              <div className="text-[10px] text-muted-foreground">{dashboard!.conversations[0].messageCount} tin nhắn</div>
            </div>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          </div>
        </Link>
      )}

      <div className="flex gap-2">
        <Link href="/ai/chat" className="flex-1">
          <Button size="sm" className="w-full text-xs bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30"><MessageSquare className="w-3 h-3 mr-1" />Chat</Button>
        </Link>
        <Link href="/ai/suggestions" className="flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs"><Lightbulb className="w-3 h-3 mr-1" />Gợi ý</Button>
        </Link>
      </div>
    </div>
  );
}
