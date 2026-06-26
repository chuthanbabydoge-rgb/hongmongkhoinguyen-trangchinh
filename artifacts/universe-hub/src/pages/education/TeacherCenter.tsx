import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { GraduationCap, Plus, BookOpen, Users, Star, Loader2, Edit, Eye, CheckCircle } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string; title: string; description?: string; teacherId: string; status: string;
  level: string; price: number; students: number; rating: number;
}
interface TeacherProfile {
  id: string; userId: string; bio?: string; expertise?: string;
  rating: number; totalCourses: number; totalStudents: number; isVerified: boolean;
}

const LEVEL_OPTIONS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "MASTER"];
const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Cơ bản", INTERMEDIATE: "Trung cấp", ADVANCED: "Nâng cao", MASTER: "Bậc thầy",
};
const STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-yellow-400", PUBLISHED: "text-green-400", ARCHIVED: "text-red-400",
};

export default function TeacherCenter() {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", level: "BEGINNER", price: "0", duration: "60" });

  const { data: profileData } = useQuery<{ ok: boolean; data: TeacherProfile | null }>({
    queryKey: ["education", "teacher-profile", "me"],
    queryFn: async () => {
      const res = await fetch("/api/education/teachers/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json() as Promise<{ ok: boolean; data: TeacherProfile | null }>;
    },
    enabled: !!accessToken,
  });

  const { data: coursesData, isLoading } = useQuery<{ ok: boolean; data: Course[] }>({
    queryKey: ["education", "my-teacher-courses"],
    queryFn: async () => {
      const res = await fetch("/api/education/courses?status=DRAFT&limit=50", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json() as Promise<{ ok: boolean; data: Course[] }>;
    },
    enabled: !!accessToken,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/education/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ ...form, price: Number(form.price), duration: Number(form.duration) }),
      });
      return res.json() as Promise<{ ok: boolean }>;
    },
    onSuccess: () => {
      toast({ title: "Tạo khoá học thành công!" });
      setShowCreate(false);
      setForm({ title: "", description: "", level: "BEGINNER", price: "0", duration: "60" });
      void qc.invalidateQueries({ queryKey: ["education", "my-teacher-courses"] });
    },
    onError: () => toast({ title: "Tạo thất bại", variant: "destructive" }),
  });

  const publishMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch(`/api/education/courses/${courseId}/publish`, {
        method: "POST", headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json() as Promise<{ ok: boolean }>;
    },
    onSuccess: () => {
      toast({ title: "Publish thành công!" });
      void qc.invalidateQueries({ queryKey: ["education", "my-teacher-courses"] });
    },
  });

  const profile = profileData?.data;
  const courses = coursesData?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-primary" /> Teacher Center
            </h1>
            <Button className="bg-primary" onClick={() => setShowCreate(!showCreate)}>
              <Plus className="w-4 h-4 mr-2" /> Tạo khoá học mới
            </Button>
          </div>

          {profile && (
            <div className="glass-panel rounded-xl border border-white/10 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">Giáo viên</h3>
                  {profile.isVerified && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">✓ Đã xác thực</span>}
                </div>
                <p className="text-xs text-muted-foreground">{profile.expertise}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: "Khoá học", value: profile.totalCourses },
                  { label: "Học viên", value: profile.totalStudents },
                  { label: "Rating", value: profile.rating.toFixed(1) },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-lg font-bold text-white">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showCreate && (
            <div className="glass-panel rounded-xl border border-primary/20 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Tạo khoá học mới</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Tên khoá học *</label>
                  <Input placeholder="VD: React 19 Toàn Tập" className="bg-white/5 border-white/10"
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Mô tả</label>
                  <Input placeholder="Mô tả khoá học..." className="bg-white/5 border-white/10"
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Cấp độ</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white"
                    value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                    {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Giá (VNĐ, 0 = miễn phí)</label>
                  <Input type="number" min="0" className="bg-white/5 border-white/10"
                    value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Thời lượng (phút)</label>
                  <Input type="number" min="1" className="bg-white/5 border-white/10"
                    value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="bg-primary" onClick={() => createMutation.mutate()} disabled={!form.title || createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Tạo khoá học
                </Button>
                <Button variant="outline" onClick={() => setShowCreate(false)}>Huỷ</Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Khoá học của tôi ({courses.length})</h2>
              {courses.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Chưa có khoá học nào. Tạo khoá học đầu tiên!</p>
                </div>
              ) : (
                courses.map(c => (
                  <div key={c.id} className="glass-panel rounded-xl border border-white/10 p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{c.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className={STATUS_COLORS[c.status] ?? "text-white"}>{c.status}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.students}</span>
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />{c.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/education/courses/${c.id}`}>
                        <Button size="sm" variant="outline"><Eye className="w-3 h-3 mr-1" />Xem</Button>
                      </Link>
                      {c.status === "DRAFT" && (
                        <Button size="sm" className="bg-green-500/20 text-green-400 border border-green-500/30"
                          onClick={() => publishMutation.mutate(c.id)} disabled={publishMutation.isPending}>
                          <CheckCircle className="w-3 h-3 mr-1" />Publish
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
