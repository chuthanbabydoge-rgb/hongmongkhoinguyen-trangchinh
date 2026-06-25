import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Calendar, Plus, Users, Star } from "lucide-react";
import { guildService } from "@/services/guildService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

interface Props { params: { id: string } }

const STATUS_LABEL: Record<string, string> = { UPCOMING: "Sắp diễn ra", ONGOING: "Đang diễn ra", ENDED: "Đã kết thúc", CANCELLED: "Đã hủy" };
const STATUS_COLOR: Record<string, string> = { UPCOMING: "text-blue-400 border-blue-400/30", ONGOING: "text-green-400 border-green-400/30", ENDED: "text-muted-foreground border-white/10", CANCELLED: "text-red-400 border-red-400/30" };

export default function GuildEvents({ params }: Props) {
  const { id } = params;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", startAt: "", endAt: "", maxParticipants: "", rewardPoints: "30" });

  const { data: guild } = useQuery({ queryKey: ["guild", id], queryFn: () => guildService.getGuild(id) });
  const { data: events = [], isLoading } = useQuery({ queryKey: ["guild-events", id], queryFn: () => guildService.getEvents(id) });
  const { data: myGuild } = useQuery({ queryKey: ["guild-me"], queryFn: () => guildService.getMyGuild() });

  const canCreate = myGuild?.guild?.id === id && ["OWNER","LEADER","OFFICER"].includes(myGuild.member.role);

  const createMutation = useMutation({
    mutationFn: () => guildService.createEvent(id, {
      title: form.title, description: form.description || null,
      startAt: new Date(form.startAt).toISOString(),
      endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
      maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
      rewardPoints: Number(form.rewardPoints), status: "UPCOMING",
    }),
    onSuccess: () => { toast({ title: "Sự kiện đã tạo!" }); qc.invalidateQueries({ queryKey: ["guild-events", id] }); setShowCreate(false); },
    onError: (err: Error) => toast({ title: "Lỗi", description: err.message, variant: "destructive" }),
  });

  const joinMutation = useMutation({
    mutationFn: (eventId: string) => guildService.joinEvent(id, eventId),
    onSuccess: () => { toast({ title: "Đã đăng ký tham gia sự kiện!" }); qc.invalidateQueries({ queryKey: ["guild-events", id] }); },
    onError: (err: Error) => toast({ title: "Lỗi", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <button onClick={() => navigate(`/guild/${id}`)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> {guild?.name ?? "Guild"}
            </button>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Sự kiện</h1>
              {canCreate && <Button size="sm" className="gap-1" onClick={() => setShowCreate(s => !s)}><Plus className="w-4 h-4" /> Tạo sự kiện</Button>}
            </div>

            {showCreate && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <h2 className="font-medium text-white">Tạo sự kiện mới</h2>
                <div><Label className="text-xs">Tiêu đề *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1 bg-white/5 border-white/10 h-8 text-sm" /></div>
                <div><Label className="text-xs">Mô tả</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1 bg-white/5 border-white/10 text-sm resize-none" rows={2} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Bắt đầu *</Label><Input type="datetime-local" value={form.startAt} onChange={e => setForm(f => ({ ...f, startAt: e.target.value }))} className="mt-1 bg-white/5 border-white/10 h-8 text-sm" /></div>
                  <div><Label className="text-xs">Kết thúc</Label><Input type="datetime-local" value={form.endAt} onChange={e => setForm(f => ({ ...f, endAt: e.target.value }))} className="mt-1 bg-white/5 border-white/10 h-8 text-sm" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Max người tham gia</Label><Input type="number" value={form.maxParticipants} onChange={e => setForm(f => ({ ...f, maxParticipants: e.target.value }))} className="mt-1 bg-white/5 border-white/10 h-8 text-sm" placeholder="Không giới hạn" /></div>
                  <div><Label className="text-xs">Điểm thưởng</Label><Input type="number" value={form.rewardPoints} onChange={e => setForm(f => ({ ...f, rewardPoints: e.target.value }))} className="mt-1 bg-white/5 border-white/10 h-8 text-sm" /></div>
                </div>
                <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.title || !form.startAt}>Tạo sự kiện</Button>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}</div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>Chưa có sự kiện nào.</p></div>
            ) : (
              <div className="space-y-3">
                {events.map(e => (
                  <div key={e.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-white">{e.title}</span>
                          <Badge variant="outline" className={`text-[10px] ${STATUS_COLOR[e.status]}`}>{STATUS_LABEL[e.status]}</Badge>
                        </div>
                        {e.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{e.description}</p>}
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(e.startAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          {e.maxParticipants && <span className="flex items-center gap-1"><Users className="w-3 h-3" />Max {e.maxParticipants}</span>}
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />{e.rewardPoints} điểm</span>
                        </div>
                      </div>
                      {(e.status === "UPCOMING" || e.status === "ONGOING") && myGuild?.guild?.id === id && (
                        <Button size="sm" variant="outline" onClick={() => joinMutation.mutate(e.id)} disabled={joinMutation.isPending}>Tham gia</Button>
                      )}
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
