import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, LogIn, BookOpen, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Classroom {
  id: string; name: string; description?: string; teacherId: string;
  isPublic: boolean; maxMembers: number; code: string; members?: ClassroomMember[];
}
interface ClassroomMember { id: string; classroomId: string; userId: string; role: string; joinedAt: string; }

export default function ClassroomPage() {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [form, setForm] = useState({ name: "", description: "", maxMembers: "30" });

  const { data, isLoading } = useQuery<{ ok: boolean; data: Classroom[] }>({
    queryKey: ["education", "classrooms"],
    queryFn: async () => (await fetch("/api/education/classrooms")).json() as Promise<{ ok: boolean; data: Classroom[] }>,
  });
  const classrooms = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/education/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ ...form, maxMembers: Number(form.maxMembers), isPublic: true }),
      });
      return res.json() as Promise<{ ok: boolean }>;
    },
    onSuccess: () => {
      toast({ title: "Tạo lớp học thành công!" });
      setShowCreate(false);
      setForm({ name: "", description: "", maxMembers: "30" });
      void qc.invalidateQueries({ queryKey: ["education", "classrooms"] });
    },
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/education/classrooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ code: joinCode }),
      });
      return res.json() as Promise<{ ok: boolean; error?: string }>;
    },
    onSuccess: (data) => {
      if (data.ok) {
        toast({ title: "Tham gia lớp học thành công!" });
        setJoinCode("");
        void qc.invalidateQueries({ queryKey: ["education", "classrooms"] });
      } else toast({ title: data.error ?? "Mã không hợp lệ", variant: "destructive" });
    },
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" /> Lớp học trực tuyến
            </h1>
            <Button className="bg-primary" onClick={() => setShowCreate(!showCreate)}>
              <Plus className="w-4 h-4 mr-2" /> Tạo lớp học
            </Button>
          </div>

          <div className="glass-panel rounded-xl border border-white/10 p-4">
            <h2 className="text-sm font-semibold text-white mb-3">Tham gia bằng mã</h2>
            <div className="flex gap-2">
              <Input placeholder="Nhập mã lớp học (VD: CLASS-ABC12345)" className="bg-white/5 border-white/10 flex-1"
                value={joinCode} onChange={e => setJoinCode(e.target.value)} />
              <Button onClick={() => joinMutation.mutate()} disabled={!joinCode || joinMutation.isPending} className="bg-primary">
                <LogIn className="w-4 h-4 mr-1" />Tham gia
              </Button>
            </div>
          </div>

          {showCreate && (
            <div className="glass-panel rounded-xl border border-primary/20 p-4">
              <h2 className="font-semibold text-white mb-4">Tạo lớp học mới</h2>
              <div className="space-y-3">
                <Input placeholder="Tên lớp học *" className="bg-white/5 border-white/10"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <Input placeholder="Mô tả" className="bg-white/5 border-white/10"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                <Input type="number" placeholder="Số thành viên tối đa" className="bg-white/5 border-white/10"
                  value={form.maxMembers} onChange={e => setForm(f => ({ ...f, maxMembers: e.target.value }))} />
                <div className="flex gap-2">
                  <Button className="bg-primary" onClick={() => createMutation.mutate()} disabled={!form.name || createMutation.isPending}>
                    {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Tạo
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreate(false)}>Huỷ</Button>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : classrooms.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Chưa có lớp học nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classrooms.map(c => (
                <div key={c.id} className="glass-panel rounded-xl border border-white/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{c.name}</h3>
                      {c.description && <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.maxMembers} max</span>
                        <span className={c.isPublic ? "text-green-400" : "text-yellow-400"}>{c.isPublic ? "Công khai" : "Riêng tư"}</span>
                      </div>
                      <div className="mt-2 p-1.5 bg-white/5 rounded text-[10px] font-mono text-muted-foreground">
                        Mã: {c.code}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
