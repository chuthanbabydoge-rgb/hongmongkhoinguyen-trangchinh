import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { GraduationCap, Star, Users, Clock, BookOpen, Play, Lock, CheckCircle, Award, Loader2, ArrowLeft, Bookmark } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Lesson { id: string; title: string; type: string; duration: number; order: number; isFree: boolean; }
interface Module { id: string; title: string; order: number; }
interface Review { id: string; userId: string; rating: number; comment?: string; createdAt: string; }
interface Exam { id: string; title: string; duration: number; passingScore: number; }
interface CourseDetail {
  id: string; title: string; description?: string; teacherId: string; level: string;
  price: number; duration: number; rating: number; students: number; status: string;
  requirements?: string; objectives?: string;
  modules: Module[]; lessons: Lesson[]; reviews: Review[]; exams: Exam[];
}

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Cơ bản", INTERMEDIATE: "Trung cấp", ADVANCED: "Nâng cao", MASTER: "Bậc thầy",
};
const TYPE_ICONS: Record<string, React.ReactNode> = {
  VIDEO: <Play className="w-3 h-3" />, TEXT: <BookOpen className="w-3 h-3" />,
  QUIZ: <CheckCircle className="w-3 h-3" />, ASSIGNMENT: <Award className="w-3 h-3" />,
  PDF: <BookOpen className="w-3 h-3" />,
};

export default function CourseDetail() {
  const [, params] = useRoute("/education/courses/:id");
  const id = params?.id ?? "";
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ ok: boolean; data: CourseDetail }>({
    queryKey: ["education", "course", id],
    queryFn: async () => (await fetch(`/api/education/courses/${id}`)).json() as Promise<{ ok: boolean; data: CourseDetail }>,
    enabled: !!id,
  });
  const course = data?.data;

  const { data: enrollData } = useQuery<{ ok: boolean; data: { progress: number; completedAt?: string } | null }>({
    queryKey: ["education", "enrollment", id],
    queryFn: async () => {
      const res = await fetch(`/api/education/courses/${id}/enrollment`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json() as Promise<{ ok: boolean; data: { progress: number } | null }>;
    },
    enabled: !!accessToken && !!id,
  });
  const enrolled = enrollData?.data;

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/education/courses/${id}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ paidAmount: course?.price ?? 0 }),
      });
      return res.json() as Promise<{ ok: boolean }>;
    },
    onSuccess: () => {
      toast({ title: "Đăng ký thành công!", description: "Chúc bạn học tốt!" });
      void qc.invalidateQueries({ queryKey: ["education", "enrollment", id] });
    },
    onError: () => toast({ title: "Đăng ký thất bại", variant: "destructive" }),
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/education/courses/${id}/bookmark`, {
        method: "POST", headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json() as Promise<{ ok: boolean }>;
    },
    onSuccess: () => toast({ title: "Đã lưu khoá học" }),
  });

  if (isLoading) return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </div>
  );

  if (!course) return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar /><div className="flex-1 flex items-center justify-center text-muted-foreground">Khoá học không tồn tại</div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <Link href="/education/courses"><button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-white"><ArrowLeft className="w-4 h-4" /> Quay lại</button></Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel rounded-xl border border-white/10 p-6">
                <h1 className="text-2xl font-bold text-white mb-3">{course.title}</h1>
                <p className="text-muted-foreground mb-4">{course.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-yellow-400" />{course.rating.toFixed(1)}
                    <span className="text-muted-foreground">({course.reviews.length} đánh giá)</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground"><Users className="w-4 h-4" />{course.students.toLocaleString()} học viên</div>
                  <div className="flex items-center gap-1 text-muted-foreground"><Clock className="w-4 h-4" />{course.duration} phút</div>
                  <span className="text-blue-400">{LEVEL_LABELS[course.level] ?? course.level}</span>
                </div>
                {course.objectives && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h3 className="text-sm font-semibold text-green-400 mb-1">🎯 Mục tiêu khoá học</h3>
                    <p className="text-xs text-muted-foreground">{course.objectives}</p>
                  </div>
                )}
                {course.requirements && (
                  <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <h3 className="text-sm font-semibold text-yellow-400 mb-1">📋 Yêu cầu</h3>
                    <p className="text-xs text-muted-foreground">{course.requirements}</p>
                  </div>
                )}
              </div>

              <div className="glass-panel rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Nội dung khoá học ({course.lessons.length} bài học)</h2>
                <div className="space-y-2">
                  {course.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-muted-foreground">{TYPE_ICONS[lesson.type] ?? <BookOpen className="w-3 h-3" />}</span>
                      <span className="flex-1 text-sm text-white">{lesson.title}</span>
                      {lesson.isFree ? (
                        <span className="text-xs text-green-400">Miễn phí</span>
                      ) : enrolled ? (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      ) : (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">{lesson.duration}p</span>
                    </div>
                  ))}
                </div>
              </div>

              {course.reviews.length > 0 && (
                <div className="glass-panel rounded-xl border border-white/10 p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Đánh giá ({course.reviews.length})</h2>
                  <div className="space-y-3">
                    {course.reviews.slice(0, 5).map((r) => (
                      <div key={r.id} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                        {r.comment && <p className="text-xs text-muted-foreground">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="glass-panel rounded-xl border border-primary/20 p-6 sticky top-6">
                <div className="text-3xl font-bold text-primary mb-4">
                  {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString()}đ`}
                </div>
                {enrolled ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
                      <p className="text-sm text-green-400 font-semibold">Đã đăng ký</p>
                      <p className="text-xs text-muted-foreground mt-1">Tiến độ: {enrolled.progress}%</p>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${enrolled.progress}%` }} />
                    </div>
                    {enrolled.progress === 100 && (
                      <Link href="/education/certificates">
                        <Button className="w-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          <Award className="w-4 h-4 mr-2" /> Nhận chứng chỉ
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <Button className="w-full bg-primary" onClick={() => enrollMutation.mutate()}
                    disabled={enrollMutation.isPending}>
                    {enrollMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Đăng ký khoá học
                  </Button>
                )}
                <Button variant="outline" className="w-full mt-2" onClick={() => bookmarkMutation.mutate()}>
                  <Bookmark className="w-4 h-4 mr-2" /> Lưu khoá học
                </Button>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Cấp độ</span><span className="text-white">{LEVEL_LABELS[course.level] ?? course.level}</span></div>
                  <div className="flex justify-between"><span>Thời lượng</span><span className="text-white">{course.duration} phút</span></div>
                  <div className="flex justify-between"><span>Bài học</span><span className="text-white">{course.lessons.length}</span></div>
                  <div className="flex justify-between"><span>Bài thi</span><span className="text-white">{course.exams.length}</span></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
