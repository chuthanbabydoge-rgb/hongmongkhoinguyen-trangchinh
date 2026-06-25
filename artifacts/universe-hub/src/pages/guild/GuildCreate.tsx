import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Shield, ArrowLeft } from "lucide-react";
import { guildService } from "@/services/guildService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

export default function GuildCreate() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", tag: "", description: "", visibility: "PUBLIC" as const, memberLimit: 50 });

  const mutation = useMutation({
    mutationFn: () => guildService.createGuild({ name: form.name, tag: form.tag, description: form.description, visibility: form.visibility as any, memberLimit: form.memberLimit }),
    onSuccess: (guild) => {
      toast({ title: "Guild đã được tạo!", description: `Guild "${guild.name}" tạo thành công.` });
      navigate(`/guild/${guild.id}`);
    },
    onError: (err: Error) => toast({ title: "Lỗi", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-xl mx-auto">
            <button onClick={() => navigate("/guild")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Quay lại danh sách guild
            </button>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h1 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-primary" /> Tạo Guild Mới
              </h1>
              <div className="space-y-4">
                <div>
                  <Label>Tên Guild *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1.5 bg-white/5 border-white/10" placeholder="Tên guild của bạn" />
                </div>
                <div>
                  <Label>Tag Guild * <span className="text-muted-foreground text-xs">(2-6 ký tự A-Z, 0-9)</span></Label>
                  <Input value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value.toUpperCase().slice(0, 6) }))} className="mt-1.5 bg-white/5 border-white/10 font-mono" placeholder="GUILD" />
                </div>
                <div>
                  <Label>Mô tả</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1.5 bg-white/5 border-white/10 resize-none" placeholder="Mô tả về guild của bạn..." rows={3} />
                </div>
                <div>
                  <Label>Chế độ tham gia</Label>
                  <Select value={form.visibility} onValueChange={v => setForm(f => ({ ...f, visibility: v as any }))}>
                    <SelectTrigger className="mt-1.5 bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Công khai (ai cũng có thể gửi yêu cầu)</SelectItem>
                      <SelectItem value="INVITE_ONLY">Chỉ qua lời mời</SelectItem>
                      <SelectItem value="PRIVATE">Riêng tư</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Giới hạn thành viên</Label>
                  <Input type="number" min={10} max={200} value={form.memberLimit} onChange={e => setForm(f => ({ ...f, memberLimit: Number(e.target.value) }))} className="mt-1.5 bg-white/5 border-white/10" />
                </div>
                <Button className="w-full" onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name || !form.tag}>
                  {mutation.isPending ? "Đang tạo..." : "Tạo Guild"}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
