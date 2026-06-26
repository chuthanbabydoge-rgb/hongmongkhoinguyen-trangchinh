import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Award, BookOpen, Clock, Star, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface Dashboard {
  enrolledCourses: { id: string; title: string; level: string }[];
  completedCourses: number;
  certificates: { id: string; verificationCode: string; issuedAt: string }[];
  studyStreak: number;
  totalStudyTime: number;
}

export default function StudentProfile() {
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

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-primary" /> Hồ sơ Học viên
            </h1>
            <Link href="/education"><Button variant="outline" size="sm">← Education</Button></Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Khoá đang học", value: dash?.enrolledCourses.length ?? 0, icon: BookOpen, color: "text-blue-400" },
                  { label: "Hoàn thành", value: dash?.completedCourses ?? 0, icon: CheckCircle, color: "text-green-400" },
                  { label: "Chứng chỉ", value: dash?.certificates.length ?? 0, icon: Award, color: "text-yellow-400" },
                  { label: "Streak (ngày)", value: dash?.studyStreak ?? 0, icon: Star, color: "text-orange-400" },
                ].map(s => (
                  <div key={s.label} className="glass-panel rounded-xl p-4 border border-white/10 text-center">
                    <s.icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
                    <div className="text-2xl font-bold text-white">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="glass-panel rounded-xl border border-white/10 p-4">
                <h2 className="text-lg font-semibold text-white mb-3">Thống kê học tập</h2>
                <div className="flex items-center gap-4">
                  <Clock className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-xl font-bold text-white">{dash?.totalStudyTime ?? 0} phút</div>
                    <div className="text-xs text-muted-foreground">Tổng thời gian học</div>
                  </div>
                </div>
              </div>

              {(dash?.certificates.length ?? 0) > 0 && (
                <div className="glass-panel rounded-xl border border-white/10 p-4">
                  <h2 className="text-lg font-semibold text-white mb-3">Chứng chỉ đã nhận</h2>
                  <div className="space-y-2">
                    {dash!.certificates.map(cert => (
                      <div key={cert.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                        <Award className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-mono text-muted-foreground">{cert.verificationCode}</p>
                          <p className="text-xs text-muted-foreground">{new Date(cert.issuedAt).toLocaleDateString("vi-VN")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
