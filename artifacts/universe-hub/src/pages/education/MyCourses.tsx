import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BookOpen, GraduationCap, CheckCircle, Clock, Loader2, Award } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface Enrollment {
  id: string; courseId: string; userId: string; progress: number;
  completedAt?: string; enrolledAt: string;
}
interface Course {
  id: string; title: string; description?: string; teacherId: string;
  level: string; price: number; duration: number; rating: number; students: number;
}

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Cơ bản", INTERMEDIATE: "Trung cấp", ADVANCED: "Nâng cao", MASTER: "Bậc thầy",
};

export default function MyCourses() {
  const { accessToken } = useAuth();

  const { data: enrollData, isLoading } = useQuery<{ ok: boolean; data: Enrollment[] }>({
    queryKey: ["education", "enrollments"],
    queryFn: async () => {
      const res = await fetch("/api/education/enrollments", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json() as Promise<{ ok: boolean; data: Enrollment[] }>;
    },
    enabled: !!accessToken,
  });
  const enrollments = enrollData?.data ?? [];

  const courseIds = enrollments.map(e => e.courseId);
  const { data: coursesData } = useQuery<{ ok: boolean; data: Course[] }>({
    queryKey: ["education", "my-courses", courseIds],
    queryFn: async () => {
      const results = await Promise.all(
        courseIds.map(id => fetch(`/api/education/courses/${id}`).then(r => r.json()) as Promise<{ ok: boolean; data: Course }>),
      );
      return { ok: true, data: results.filter(r => r.ok).map(r => r.data) };
    },
    enabled: courseIds.length > 0,
  });
  const courses = coursesData?.data ?? [];

  const completed = enrollments.filter(e => e.completedAt).length;
  const inProgress = enrollments.filter(e => !e.completedAt).length;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-primary" /> Khoá học của tôi
            </h1>
            <Link href="/education/courses"><Button variant="outline" size="sm">Khám phá thêm</Button></Link>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Đang học", value: inProgress, icon: BookOpen, color: "text-blue-400" },
              { label: "Hoàn thành", value: completed, icon: CheckCircle, color: "text-green-400" },
              { label: "Tổng khoá học", value: enrollments.length, icon: GraduationCap, color: "text-primary" },
            ].map(stat => (
              <div key={stat.label} className="glass-panel rounded-xl p-4 border border-white/10">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-20">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground mb-4">Bạn chưa đăng ký khoá học nào</p>
              <Link href="/education/courses"><Button className="bg-primary">Khám phá khoá học</Button></Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enr) => {
                const course = courses.find(c => c.id === enr.courseId);
                return (
                  <div key={enr.id} className="glass-panel rounded-xl border border-white/10 p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-8 h-8 text-primary/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {course?.title ?? `Khoá học #${enr.courseId.slice(0, 8)}`}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        {course && <span>{LEVEL_LABELS[course.level] ?? course.level}</span>}
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />
                          {new Date(enr.enrolledAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/10 rounded-full">
                          <div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${enr.progress}%` }} />
                        </div>
                        <span className="text-xs text-primary font-mono">{enr.progress}%</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {enr.completedAt ? (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle className="w-3 h-3" /> Hoàn thành
                        </span>
                      ) : (
                        <span className="text-xs text-blue-400">Đang học</span>
                      )}
                      <Link href={`/education/courses/${enr.courseId}`}>
                        <Button size="sm" variant="outline" className="text-xs">{enr.progress === 100 ? "Xem lại" : "Tiếp tục"}</Button>
                      </Link>
                      {enr.completedAt && (
                        <Link href="/education/certificates">
                          <Button size="sm" className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            <Award className="w-3 h-3 mr-1" /> Chứng chỉ
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
