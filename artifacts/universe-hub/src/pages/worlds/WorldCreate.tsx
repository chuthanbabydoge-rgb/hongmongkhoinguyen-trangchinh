import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Globe, ArrowLeft } from "lucide-react";
import { worldService, type WorldType } from "@/services/worldService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

const WORLD_TYPES: { value: WorldType; label: string }[] = [
  { value: "PUBLIC",   label: "Công cộng — Ai cũng vào được" },
  { value: "PRIVATE",  label: "Riêng tư — Chỉ được mời" },
  { value: "CREATOR",  label: "Sáng tạo — Thế giới sáng tạo" },
  { value: "OFFICIAL", label: "Chính thức — World của Universe" },
  { value: "EVENT",    label: "Sự kiện — World sự kiện" },
  { value: "GUILD",    label: "Guild — World của guild" },
  { value: "PARTY",    label: "Nhóm — World nhóm nhỏ" },
  { value: "TRAINING", label: "Huấn luyện — World luyện tập" },
];

export default function WorldCreate() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name:        "",
    description: "",
    type:        "PUBLIC" as WorldType,
    capacity:    100,
    tags:        "",
  });

  const createMut = useMutation({
    mutationFn: () => worldService.create({
      name:        form.name,
      description: form.description || undefined,
      type:        form.type,
      capacity:    form.capacity,
      tags:        form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    }),
    onSuccess: (w) => {
      qc.invalidateQueries({ queryKey: ["worlds-explorer"] });
      toast({ title: "World đã được tạo!" });
      navigate(`/worlds/${w.id}`);
    },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-xl mx-auto space-y-6">
            <button onClick={() => navigate("/worlds")} className="flex items-center gap-1 text-muted-foreground hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>

            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-white">Tạo World Mới</h1>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Tên World *</label>
                <Input className="bg-white/5 border-white/10" placeholder="Tên world..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Mô tả</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none h-24 placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  placeholder="Mô tả về world của bạn..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Loại World</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as WorldType }))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                  {WORLD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Sức chứa (người)</label>
                <Input type="number" min={1} max={10000} className="bg-white/5 border-white/10" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Tags (phân cách bằng dấu phẩy)</label>
                <Input className="bg-white/5 border-white/10" placeholder="game, fantasy, pvp..." value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
              </div>

              <Button className="w-full" onClick={() => createMut.mutate()} disabled={!form.name.trim() || createMut.isPending}>
                {createMut.isPending ? "Đang tạo..." : "🌍 Tạo World"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
