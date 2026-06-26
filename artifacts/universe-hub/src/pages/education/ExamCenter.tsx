import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, Play, CheckCircle, XCircle, Clock, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Exam { id: string; courseId: string; title: string; duration: number; passingScore: number; maxAttempts: number; }
interface Attempt { id: string; examId: string; status: string; score?: number; submittedAt?: string; }
interface Question { id: string; question: string; type: string; options: string[]; points: number; }
interface ExamDetail extends Exam { questions: Question[]; }

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PASSED: <CheckCircle className="w-4 h-4 text-green-400" />,
  FAILED: <XCircle className="w-4 h-4 text-red-400" />,
  STARTED: <Play className="w-4 h-4 text-blue-400" />,
  PENDING: <Clock className="w-4 h-4 text-yellow-400" />,
  SUBMITTED: <CheckCircle className="w-4 h-4 text-muted-foreground" />,
};

export default function ExamCenter() {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeExam, setActiveExam] = useState<ExamDetail | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const { data: coursesData } = useQuery<{ ok: boolean; data: { id: string; title: string }[] }>({
    queryKey: ["education", "enrolled-courses-for-exams"],
    queryFn: async () => {
      const res = await fetch("/api/education/enrollments", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const enrData = await res.json() as { ok: boolean; data: { courseId: string }[] };
      return {
        ok: true,
        data: enrData.data.map(e => ({ id: e.courseId, title: e.courseId })),
      };
    },
    enabled: !!accessToken,
  });
  const courseIds = (coursesData?.data ?? []).map(c => c.id);

  const { data: allExamsData, isLoading } = useQuery<Exam[]>({
    queryKey: ["education", "all-exams", courseIds],
    queryFn: async () => {
      const results = await Promise.all(
        courseIds.map(id => fetch(`/api/education/courses/${id}/exams`).then(r => r.json()) as Promise<{ ok: boolean; data: Exam[] }>),
      );
      return results.flatMap(r => r.data ?? []);
    },
    enabled: courseIds.length > 0,
  });
  const exams = allExamsData ?? [];

  const startMutation = useMutation({
    mutationFn: async (examId: string) => {
      const res = await fetch(`/api/education/exams/${examId}/start`, {
        method: "POST", headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json() as Promise<{ ok: boolean; data: Attempt }>;
    },
    onSuccess: async (data, examId) => {
      if (data.ok) {
        setActiveAttempt(data.data);
        const examRes = await fetch(`/api/education/exams/${examId}`);
        const examData = await examRes.json() as { ok: boolean; data: ExamDetail };
        if (examData.ok) setActiveExam(examData.data);
      }
    },
    onError: () => toast({ title: "Không thể bắt đầu bài thi", variant: "destructive" }),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!activeAttempt || !activeExam) return null;
      const answerList = activeExam.questions.map(q => ({ questionId: q.id, answer: answers[q.id] ?? null }));
      const res = await fetch("/api/education/exams/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ attemptId: activeAttempt.id, answers: answerList }),
      });
      return res.json() as Promise<{ ok: boolean; data: Attempt }>;
    },
    onSuccess: (data) => {
      if (data) {
        const attempt = data.data;
        toast({
          title: attempt.status === "PASSED" ? "🏆 Chúc mừng vượt qua!" : "❌ Chưa đạt",
          description: `Điểm: ${attempt.score ?? 0}%`,
        });
        setActiveExam(null);
        setActiveAttempt(null);
        setAnswers({});
        void qc.invalidateQueries({ queryKey: ["education"] });
      }
    },
  });

  if (activeExam && activeAttempt) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">{activeExam.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />{activeExam.duration} phút
              </div>
            </div>
            <div className="space-y-4">
              {activeExam.questions.map((q, i) => (
                <div key={q.id} className="glass-panel rounded-xl border border-white/10 p-4">
                  <p className="text-sm font-medium text-white mb-3">{i + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, j) => (
                      <label key={j} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${answers[q.id] === opt ? "bg-primary/20 border border-primary/30" : "hover:bg-white/5"}`}>
                        <input type="radio" name={q.id} value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                          className="text-primary" />
                        <span className="text-sm text-white">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pb-6">
              <Button className="bg-primary flex-1" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
                {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Nộp bài thi
              </Button>
              <Button variant="outline" onClick={() => { setActiveExam(null); setActiveAttempt(null); setAnswers({}); }}>Thoát</Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ClipboardCheck className="w-7 h-7 text-primary" /> Trung tâm Bài thi
            </h1>
            <Link href="/education"><Button variant="outline" size="sm">← Dashboard</Button></Link>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : exams.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ClipboardCheck className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Chưa có bài thi nào. Hãy đăng ký khoá học trước!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map(exam => (
                <div key={exam.id} className="glass-panel rounded-xl border border-white/10 p-4">
                  <h3 className="font-semibold text-white mb-2">{exam.title}</h3>
                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    <div className="flex justify-between"><span>Thời gian</span><span className="text-white">{exam.duration} phút</span></div>
                    <div className="flex justify-between"><span>Điểm qua môn</span><span className="text-white">{exam.passingScore}%</span></div>
                    <div className="flex justify-between"><span>Số lần thi tối đa</span><span className="text-white">{exam.maxAttempts}</span></div>
                  </div>
                  <Button className="w-full bg-primary" size="sm"
                    onClick={() => startMutation.mutate(exam.id)} disabled={startMutation.isPending}>
                    <Play className="w-3 h-3 mr-1" /> Bắt đầu thi
                  </Button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
