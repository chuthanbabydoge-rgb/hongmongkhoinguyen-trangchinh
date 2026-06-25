import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Settings } from "lucide-react";
import { guildService } from "@/services/guildService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

interface Props { params: { id: string } }

export default function GuildSettings({ params }: Props) {
  const { id } = params;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", description: "", visibility: "PUBLIC", memberLimit: 50, avatar: "", banner: "" });

  const { data: guild, isLoading } = useQuery({ queryKey: ["guild", id], queryFn: () => guildService.getGuild(id) });
  const { data: myGuild } = useQuery({ queryKey: ["guild-me"], queryFn: () => guildService.getMyGuild() });

  useEffect(() => {
    if (guild) {
      setForm({ name: guild.name, description: guild.description ?? "", visibility: guild.visibility, memberLimit: guild.memberLimit, avatar: guild.avatar ?? "", banner: guild.banner ?? "" });
    }
  }, [guild]);

  const canEdit = myGuild?.guild?.id === id && ["OWNER", "LEADER"].includes(myGuild.member.role);

  const updateMutation = useMutation({
    mutationFn: () => guildService.updateGuild(id, { name: form.name, description: form.description || undefined, visibility: form.visibility as any, memberLimit: form.memberLimit, avatar: form.avatar || undefined, banner: form.banner || undefined }),
    onSuccess: () => { toast({ title: "Đã cập nhật guild!" }); qc.invalidateQueries({ queryKey: ["guild", id] }); },
    onError: (err: Error) => toast({ title: "Lỗi", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => guildService.deleteGuild(id),
    onSuccess: () => { toast({ title: "Đã xóa guild." }); navigate("/guild"); },
    onError: (err: Error) => toast({ title: "Lỗi", description: err.message, variant: "destructive" }),
  });

  if (isLoading) return null;
  if (!canEdit) return (
    <div className="flex min-h-screen bg-background text-foreground"><Sidebar /><div className="flex-1 flex flex-col"><Header /><div className="flex-1 flex items-center justify-center text-muted-foreground">Không có quyền.</div></div></div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-xl mx-auto space-y-6">
            <button onClick={() => navigate(`/guild/${id}`)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> {guild?.name}
            </button>
            <h1 className="text-xl font-bold text-white flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Cài đặt Guild</h1>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
              <div><Label>Tên Guild</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1.5 bg-white/5 border-white/10" /></div>
              <div><Label>Mô tả</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1.5 bg-white/5 border-white/10 resize-none" rows={3} /></div>
              <div>
                <Label>Chế độ tham gia</Label>
                <Select value={form.visibility} onValueChange={v => setForm(f => ({ ...f, visibility: v }))}>
                  <SelectTrigger className="mt-1.5 bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Công khai</SelectItem>
                    <SelectItem value="INVITE_ONLY">Chỉ qua lời mời</SelectItem>
                    <SelectItem value="PRIVATE">Riêng tư</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Giới hạn thành viên</Label><Input type="number" value={form.memberLimit} onChange={e => setForm(f => ({ ...f, memberLimit: Number(e.target.value) }))} className="mt-1.5 bg-white/5 border-white/10" /></div>
              <div><Label>Avatar URL</Label><Input value={form.avatar} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))} className="mt-1.5 bg-white/5 border-white/10" placeholder="https://..." /></div>
              <div><Label>Banner URL</Label><Input value={form.banner} onChange={e => setForm(f => ({ ...f, banner: e.target.value }))} className="mt-1.5 bg-white/5 border-white/10" placeholder="https://..." /></div>
              <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="w-full">
                {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>

            {myGuild?.member?.role === "OWNER" && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
                <h3 className="font-semibold text-red-400 mb-2">Vùng nguy hiểm</h3>
                <p className="text-sm text-muted-foreground mb-4">Xóa guild sẽ không thể khôi phục.</p>
                <Button variant="destructive" onClick={() => { if (confirm("Xác nhận xóa guild này?")) deleteMutation.mutate(); }} disabled={deleteMutation.isPending}>Xóa Guild</Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
