import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Palette, Save, ArrowLeft, Wand2 } from "lucide-react";
import { Link } from "wouter";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const PROJECT_TYPES = [
  { value: "WORLD", label: "Thế giới", icon: "🌍" },
  { value: "QUEST", label: "Nhiệm vụ", icon: "📜" },
  { value: "NPC", label: "Nhân vật NPC", icon: "🤖" },
  { value: "BUSINESS", label: "Kinh doanh", icon: "🏪" },
  { value: "STORY", label: "Cốt truyện", icon: "📖" },
  { value: "EVENT", label: "Sự kiện", icon: "🎪" },
  { value: "TOURNAMENT", label: "Giải đấu", icon: "🏆" },
  { value: "SHOP", label: "Cửa hàng", icon: "🛒" },
  { value: "GUILD", label: "Guild", icon: "⚔️" },
  { value: "DUNGEON", label: "Hang ngục", icon: "🏰" },
];

export default function CreatorStudio() {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, navigate] = useLocation();

  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "WORLD",
    tags: "",
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/creator/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          name:        form.name,
          description: form.description,
          type:        form.type,
          tags:        form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
          content:     {},
        }),
      });
      return res.json() as Promise<{ ok: boolean; data: { id: string }; error?: string }>;
    },
    onSuccess: (data) => {
      if (data.ok) {
        qc.invalidateQueries({ queryKey: ["creator"] });
        toast({ title: "Project đã được tạo!" });
        navigate(`/creator/projects/${data.data.id}`);
      } else {
        toast({ title: data.error ?? "Lỗi tạo project", variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Lỗi kết nối", variant: "destructive" }),
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <Link href="/creator">
                <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Quay lại</Button>
              </Link>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />Creator Studio
              </h1>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Tên project *</label>
                <Input className="bg-white/5 border-white/10" placeholder="Ví dụ: Thế giới Dragon Kingdom"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Mô tả</label>
                <textarea rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white resize-none"
                  placeholder="Mô tả ngắn về project..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-3 block">Loại project *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PROJECT_TYPES.map(t => (
                    <button key={t.value} type="button"
                      onClick={() => setForm(f => ({ ...f, type: t.value }))}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${
                        form.type === t.value
                          ? "border-primary bg-primary/10 text-white"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20"
                      }`}>
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Tags (phân cách bằng dấu phẩy)</label>
                <Input className="bg-white/5 border-white/10" placeholder="rpg, adventure, fantasy"
                  value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
              </div>

              <Button className="w-full gap-2" disabled={!form.name || createMutation.isPending}
                onClick={() => createMutation.mutate()}>
                {createMutation.isPending ? (
                  <><Palette className="w-4 h-4 animate-spin" />Đang tạo...</>
                ) : (
                  <><Save className="w-4 h-4" />Tạo Project</>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
