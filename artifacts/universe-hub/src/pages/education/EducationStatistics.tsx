import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Users, BookOpen, Award, Loader2, Star } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";

interface Course { id: string; title: string; students: number; rating: number; level: string; price: number; }
interface Dashboard { completedCourses: number; certificates: unknown[]; totalStudyTime: number; studyStreak: number; }

export default function EducationStatistics() {
  const { accessToken } = useAuth();

  const { data: dashData } = useQuery<{ ok: boolean; data: Dashboard }>({
    queryKey: ["education", "dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/education/dashboard", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json() as Promise<{ ok: boolean; data: Dashboard }>;
    },
    enabled: !!accessToken,
  });

  const { data: coursesData, isLoading } = useQuery<{ ok: boolean; data: Course[] }>({
    queryKey: ["education", "stats-courses"],
    queryFn: async () => (await fetch("/api/education/courses?limit=10")).json() as Promise<{ ok: boolean; data: Course[] }>,
  });

  const dash = dashData?.data;
  const courses = coursesData?.data ?? [];
  const totalStudents = courses.reduce((s, c) => s + c.students, 0);
  const avgRating = courses.length > 0 ? courses.reduce((s, c) => s + c.rating, 0) / courses.length : 0;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-primary" /> Thống kê Giáo dục
          </h1>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Tổng khoá học", value: courses.length, icon: BookOpen, color: "text-blue-400" },
                  { label: "Tổng học viên", value: totalStudents.toLocaleString(), icon: Users, color: "text-green-400" },
                  { label: "Rating trung bình", value: avgRating.toFixed(1), icon: Star, color: "text-yellow-400" },
                  { label: "Chứng chỉ của tôi", value: dash?.certificates.length ?? 0, icon: Award, color: "text-purple-400" },
                ].map(s => (
                  <div key={s.label} className="glass-panel rounded-xl p-4 border border-white/10">
                    <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                    <div className="text-2xl font-bold text-white">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="glass-panel rounded-xl border border-white/10 p-4">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />Top khoá học phổ biến
                </h2>
                <div className="space-y-3">
                  {[...courses].sort((a, b) => b.students - a.students).map((c, i) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <span className="w-6 text-center text-xs font-bold text-muted-foreground">#{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm text-white truncate">{c.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.students}</span>
                          <span className="flex items-center gap-1 text-yellow-400"><Star className="w-3 h-3 fill-yellow-400" />{c.rating.toFixed(1)}</span>
                          <span>{c.price === 0 ? "Miễn phí" : `${c.price.toLocaleString()}đ`}</span>
                        </div>
                      </div>
                      <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-2 bg-primary rounded-full"
                          style={{ width: `${totalStudents > 0 ? (c.students / totalStudents) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel rounded-xl border border-white/10 p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Học tập của tôi</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Khoá đã hoàn thành", value: dash?.completedCourses ?? 0, color: "bg-green-400" },
                      { label: "Streak (phiên)", value: dash?.studyStreak ?? 0, color: "bg-orange-400" },
                      { label: "Tổng thời gian (phút)", value: dash?.totalStudyTime ?? 0, color: "bg-blue-400" },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${s.color}`} />
                          <span className="text-xs text-muted-foreground">{s.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-white">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-panel rounded-xl border border-white/10 p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Phân bố cấp độ</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Cơ bản", level: "BEGINNER", color: "bg-green-400" },
                      { label: "Trung cấp", level: "INTERMEDIATE", color: "bg-blue-400" },
                      { label: "Nâng cao", level: "ADVANCED", color: "bg-purple-400" },
                      { label: "Bậc thầy", level: "MASTER", color: "bg-yellow-400" },
                    ].map(s => {
                      const count = courses.filter(c => c.level === s.level).length;
                      return (
                        <div key={s.level} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${s.color}`} />
                          <span className="text-xs text-muted-foreground flex-1">{s.label}</span>
                          <span className="text-xs text-white">{count}</span>
                          <div className="w-16 h-1.5 bg-white/10 rounded-full">
                            <div className={`h-1.5 rounded-full ${s.color}`}
                              style={{ width: `${courses.length > 0 ? (count / courses.length) * 100 : 0}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
