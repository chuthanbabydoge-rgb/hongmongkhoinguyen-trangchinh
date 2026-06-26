import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { GraduationCap, BookOpen, Award, Clock, TrendingUp, Star, ArrowRight, Loader2, Play } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface Course {
  id: string; title: string; description?: string; thumbnail?: string;
  teacherId: string; level: string; price: number; duration: number;
  rating: number; students: number; status: string;
}
interface Certificate { id: string; courseId: string; verificationCode: string; issuedAt: string; }
interface Dashboard {
  enrolledCourses: Course[];
  completedCourses: number;
  certificates: Certificate[];
  studyStreak: number;
  totalStudyTime: number;
  recentActivity: Course[];
  recommendedCourses: Course[];
}

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Cơ bản", INTERMEDIATE: "Trung cấp", ADVANCED: "Nâng cao", MASTER: "Bậc thầy",
};
const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "text-green-400", INTERMEDIATE: "text-blue-400", ADVANCED: "text-purple-400", MASTER: "text-yellow-400",
};

export default function EducationDashboard() {
  const { accessToken } = useAuth();

  const { data, isLoading } = useQuery<{ ok: boolean; data: Dashboard }>({
    queryKey: ["education", "dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/education/dashboard", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json() as Promise<{ ok: boolean; data: Dashboard }>;
    },
    enabled: !!accessToken,
  });

  const dash = data?.data;

  const { data: coursesData } = useQuery<{ ok: boolean; data: Course[] }>({
    queryKey: ["education", "courses", "featured"],
    queryFn: async () => {
      const res = await fetch("/api/education/courses?limit=6");
      return res.json() as Promise<{ ok: boolean; data: Course[] }>;
    },
  });

  const featuredCourses = coursesData?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-7 h-7 text-primary" />
                Universe Education
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Nền tảng giáo dục của Universe Ecosystem</p>
            </div>
            <div className="flex gap-2">
              <Link href="/education/courses">
                <Button variant="outline" size="sm">Khám phá khoá học</Button>
              </Link>
              <Link href="/education/teachers">
                <Button size="sm" className="bg-primary">Trở thành giáo viên</Button>
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Khoá học đang học", value: dash?.enrolledCourses.length ?? 0, icon: BookOpen, color: "text-blue-400" },
                  { label: "Đã hoàn thành", value: dash?.completedCourses ?? 0, icon: Award, color: "text-green-400" },
                  { label: "Chứng chỉ", value: dash?.certificates.length ?? 0, icon: Award, color: "text-yellow-400" },
                  { label: "Thời gian học (phút)", value: dash?.totalStudyTime ?? 0, icon: Clock, color: "text-purple-400" },
                ].map((stat) => (
                  <div key={stat.label} className="glass-panel rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                  </div>
                ))}
              </div>

              {(dash?.enrolledCourses.length ?? 0) > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">Khoá học của tôi</h2>
                    <Link href="/education/my"><span className="text-xs text-primary hover:underline cursor-pointer">Xem tất cả</span></Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dash!.enrolledCourses.slice(0, 3).map((c) => (
                      <Link key={c.id} href={`/education/courses/${c.id}`}>
                        <div className="glass-panel rounded-xl border border-white/10 hover:border-primary/30 transition-all cursor-pointer overflow-hidden">
                          <div className="h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                            <GraduationCap className="w-12 h-12 text-primary/50" />
                          </div>
                          <div className="p-4">
                            <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1">{c.title}</h3>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs ${LEVEL_COLORS[c.level] ?? "text-white"}`}>{LEVEL_LABELS[c.level] ?? c.level}</span>
                              <div className="flex items-center gap-1 text-yellow-400 text-xs">
                                <Star className="w-3 h-3 fill-yellow-400" />
                                {c.rating.toFixed(1)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Khoá học nổi bật
                  </h2>
                  <Link href="/education/courses"><span className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">Xem tất cả <ArrowRight className="w-3 h-3" /></span></Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredCourses.map((c) => (
                    <Link key={c.id} href={`/education/courses/${c.id}`}>
                      <div className="glass-panel rounded-xl border border-white/10 hover:border-primary/30 transition-all cursor-pointer overflow-hidden group">
                        <div className="h-36 bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center relative">
                          <GraduationCap className="w-14 h-14 text-primary/40" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                            <Play className="w-10 h-10 text-white" />
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2">{c.title}</h3>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className={LEVEL_COLORS[c.level] ?? "text-white"}>{LEVEL_LABELS[c.level] ?? c.level}</span>
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Star className="w-3 h-3 fill-yellow-400" />
                              {c.rating.toFixed(1)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">{c.students.toLocaleString()} học viên</span>
                            <span className="text-sm font-bold text-primary">
                              {c.price === 0 ? "Miễn phí" : `${c.price.toLocaleString()}đ`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
