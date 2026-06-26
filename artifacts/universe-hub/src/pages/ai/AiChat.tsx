import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Bot, Send, Plus, Trash2, ArrowLeft, ThumbsUp, ThumbsDown, Copy, Check, Brain } from "lucide-react";
import { aiService, type AiMessage, type AiConversation } from "@/services/aiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm flex-shrink-0">🤖</div>
      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ msg, onFeedback, onCopy }: { msg: AiMessage; onFeedback: (id: string, type: "THUMBS_UP" | "THUMBS_DOWN") => void; onCopy: (text: string) => void }) {
  const isUser = msg.role === "USER";
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { onCopy(msg.content); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div className={cn("flex items-end gap-2 group", isUser && "flex-row-reverse")}>
      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0", isUser ? "bg-primary/30 border border-primary/40" : "bg-white/10 border border-white/20")}>
        {isUser ? "👤" : "🤖"}
      </div>
      <div className={cn("max-w-[75%] space-y-1")}>
        <div className={cn("px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap", isUser ? "bg-primary/20 border border-primary/30 text-white rounded-br-sm" : "bg-white/5 border border-white/10 text-white/90 rounded-bl-sm")}>
          {msg.content}
        </div>
        <div className={cn("flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", isUser && "justify-end")}>
          <span className="text-[10px] text-muted-foreground">{new Date(msg.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
          {!isUser && (
            <>
              <button onClick={handleCopy} className="p-1 hover:bg-white/10 rounded transition-colors text-muted-foreground hover:text-white">
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              </button>
              <button onClick={() => onFeedback(msg.id, "THUMBS_UP")} className="p-1 hover:bg-white/10 rounded transition-colors text-muted-foreground hover:text-green-400"><ThumbsUp className="w-3 h-3" /></button>
              <button onClick={() => onFeedback(msg.id, "THUMBS_DOWN")} className="p-1 hover:bg-white/10 rounded transition-colors text-muted-foreground hover:text-red-400"><ThumbsDown className="w-3 h-3" /></button>
            </>
          )}
          {msg.model && <span className="text-[10px] text-muted-foreground/40 font-mono">{msg.model.split("-").slice(0, 2).join("-")}</span>}
        </div>
      </div>
    </div>
  );
}

const QUICK_PROMPTS = [
  "Phân tích wallet của tôi 💰",
  "Gợi ý quest phù hợp ⚔️",
  "Tư vấn marketplace 🛒",
  "Kiểm tra inventory 🎒",
  "Xem trạng thái guild 🏰",
  "Khám phá world mới 🌍",
];

export default function AiChat() {
  const [, params]  = useRoute("/ai/chat/:id");
  const [, navigate] = useLocation();
  const convId      = params?.id;
  const qc          = useQueryClient();
  const { toast }   = useToast();
  const [input, setInput]     = useState("");
  const [isTyping, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: convs = [] } = useQuery({ queryKey: ["ai-conversations"], queryFn: () => aiService.listConversations(30) });
  const { data: messages = [], refetch: refetchMsgs } = useQuery({
    queryKey: ["ai-messages", convId],
    queryFn:  () => convId ? aiService.listMessages(convId) : Promise.resolve([]),
    enabled:  !!convId,
  });

  const chatMut = useMutation({
    mutationFn: ({ msg, cid }: { msg: string; cid?: string }) => aiService.chat(msg, cid),
    onMutate: () => setTyping(true),
    onSuccess: (data) => {
      setTyping(false);
      if (!convId) navigate(`/ai/chat/${data.conversation.id}`);
      qc.invalidateQueries({ queryKey: ["ai-messages", data.conversation.id] });
      qc.invalidateQueries({ queryKey: ["ai-conversations"] });
      refetchMsgs();
    },
    onError: (e: Error) => { setTyping(false); toast({ title: "Lỗi", description: e.message, variant: "destructive" }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => aiService.deleteConversation(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ai-conversations"] }); navigate("/ai/chat"); },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  const feedbackMut = useMutation({
    mutationFn: ({ id, type }: { id: string; type: "THUMBS_UP" | "THUMBS_DOWN" }) => aiService.feedback(id, type),
    onSuccess: () => toast({ title: "Cảm ơn phản hồi của bạn!" }),
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || chatMut.isPending) return;
    const msg = input.trim();
    setInput("");
    chatMut.mutate({ msg, cid: convId });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handleCopy = (text: string) => { navigator.clipboard.writeText(text).catch(() => {}); toast({ title: "Đã sao chép!" }); };

  const currentConv = convs.find(c => c.id === convId);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation Sidebar */}
          <div className="w-64 border-r border-white/10 flex flex-col bg-white/2 hidden md:flex">
            <div className="p-3 border-b border-white/10">
              <Button className="w-full bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 text-sm h-8" onClick={() => navigate("/ai/chat")} disabled={chatMut.isPending}>
                <Plus className="w-4 h-4 mr-1" />Hội thoại mới
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {convs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Chưa có hội thoại</div>
              ) : convs.map(c => (
                <div key={c.id} onClick={() => navigate(`/ai/chat/${c.id}`)} className={cn("flex items-center gap-2 p-2 rounded-lg cursor-pointer group hover:bg-white/10 transition-colors", c.id === convId && "bg-white/10 border border-white/20")}>
                  <Bot className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{c.title}</div>
                    <div className="text-[10px] text-muted-foreground">{c.messageCount} tin nhắn</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteMut.mutate(c.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-muted-foreground transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-white/10">
              <Link href="/ai/memory"><Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground"><Brain className="w-3 h-3 mr-1" />Ký ức AI</Button></Link>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat Header */}
            {currentConv ? (
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <Link href="/ai"><Button variant="ghost" size="sm" className="md:hidden"><ArrowLeft className="w-4 h-4" /></Button></Link>
                <Bot className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <div className="font-medium text-white">{currentConv.title}</div>
                  <div className="text-xs text-muted-foreground">{currentConv.messageCount} tin nhắn</div>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-400" onClick={() => deleteMut.mutate(currentConv.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <div className="text-xl">🤖</div>
                <div><div className="font-medium text-white">Nova AI</div><div className="text-xs text-muted-foreground">Hội thoại mới</div></div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && !isTyping && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🤖</div>
                  <h2 className="text-xl font-bold text-white mb-2">Xin chào! Tôi là Nova</h2>
                  <p className="text-muted-foreground mb-6">Trợ lý AI Universe Hub. Tôi có thể giúp bạn với Wallet, Quest, Marketplace, Guild, và nhiều hơn nữa!</p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                    {QUICK_PROMPTS.map(p => (
                      <button key={p} onClick={() => { setInput(p); }} className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-white/10 hover:text-white hover:border-primary/30 transition-all">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map(m => <ChatBubble key={m.id} msg={m} onFeedback={(id, type) => feedbackMut.mutate({ id, type })} onCopy={handleCopy} />)}
              {isTyping && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <Input
                    className="bg-white/5 border-white/10 pr-10 resize-none"
                    placeholder="Hỏi Nova bất cứ điều gì..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={chatMut.isPending}
                  />
                </div>
                <Button onClick={handleSend} disabled={!input.trim() || chatMut.isPending} className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 flex-shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-[10px] text-muted-foreground/40 text-center mt-2">Enter để gửi · Shift+Enter xuống dòng</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
