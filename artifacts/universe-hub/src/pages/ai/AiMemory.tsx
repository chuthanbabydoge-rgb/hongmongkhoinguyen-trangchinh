import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Brain, Trash2, Plus, ArrowLeft, Clock, Shield, Infinity } from "lucide-react";
import { aiService, type MemoryScope } from "@/services/aiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

const SCOPE_INFO: Record<MemoryScope, { label: string; icon: React.ElementType; color: string }> = {
  SHORT_TERM: { label: "Ngắn hạn", icon: Clock,    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  LONG_TERM:  { label: "Dài hạn",  icon: Brain,    color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  PERMANENT:  { label: "Vĩnh viễn", icon: Infinity, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

export default function AiMemory() {
  const qc    = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ key: "", value: "", scope: "LONG_TERM" as MemoryScope });
  const [showForm, setShowForm] = useState(false);

  const { data: memories = [], isLoading } = useQuery({ queryKey: ["ai-memory"], queryFn: () => aiService.listMemories() });

  const createMut = useMutation({
    mutationFn: () => aiService.createMemory(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ai-memory"] }); setForm({ key: "", value: "", scope: "LONG_TERM" }); setShowForm(false); toast({ title: "Đã lưu ký ức!" }); },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => aiService.deleteMemory(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ai-memory"] }); toast({ title: "Đã xóa ký ức" }); },
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
              <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Brain className="w-6 h-6 text-primary" />Ký ức AI</h1>
              <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30">
                <Plus className="w-4 h-4 mr-1" />Thêm ký ức
              </Button>
            </div>

            {showForm && (
              <div className="bg-white/5 border border-primary/20 rounded-xl p-5 space-y-4">
                <h3 className="font-medium text-white">Thêm ký ức mới</h3>
                <div><label className="text-sm text-muted-foreground mb-1 block">Key (tên ký ức)</label><Input className="bg-white/5 border-white/10" placeholder="vd: my_preference, favorite_world..." value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value }))} /></div>
                <div><label className="text-sm text-muted-foreground mb-1 block">Nội dung</label><textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none h-20 focus:outline-none focus:border-primary/50" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} /></div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Loại</label>
                  <select value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value as MemoryScope }))} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm w-full">
                    <option value="SHORT_TERM">Ngắn hạn</option>
                    <option value="LONG_TERM">Dài hạn</option>
                    <option value="PERMANENT">Vĩnh viễn</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => createMut.mutate()} disabled={!form.key.trim() || !form.value.trim() || createMut.isPending} className="flex-1">{createMut.isPending ? "Đang lưu..." : "💾 Lưu ký ức"}</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}</div>
            ) : memories.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nova chưa có ký ức nào. Chat với AI để bắt đầu!</p>
                <Link href="/ai/chat"><Button className="mt-4" size="sm">Chat với Nova</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {memories.map(mem => {
                  const info = SCOPE_INFO[mem.scope];
                  const Icon = info.icon;
                  return (
                    <div key={mem.id} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors group">
                      <Icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-primary/80">{mem.key}</span>
                          <Badge className={`text-[10px] border ${info.color}`}>{info.label}</Badge>
                        </div>
                        <div className="text-sm text-white/80">{mem.value}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">{new Date(mem.updatedAt).toLocaleString("vi-VN")}</div>
                      </div>
                      <button onClick={() => deleteMut.mutate(mem.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-400 transition-all rounded-lg hover:bg-red-400/10"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
