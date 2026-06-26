import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus, Send, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Homework {
  id: string; title: string; description?: string; teacherId: string;
  maxScore: number; dueAt?: string; createdAt: string;
}
interface Submission {
  id: string; homeworkId: string; userId: string;
  content?: string; score?: number; feedback?: string; submittedAt: string;
}

export default function HomeworkCenter() {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedHw, setSelectedHw] = useState<Homework | null>(null);
  const [content, setContent] = useState("");

  const { data, isLoading } = useQuery<{ ok: boolean; data: Homework[] }>({
    queryKey: ["education", "homework"],
    queryFn: async () => {
      const res = await fetch("/api/education/homework", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json() as Promise<{ ok: boolean; data: Homework[] }>;
    },
    enabled: !!accessToken,
  });
  const homeworks = data?.data ?? [];

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!selectedHw) return null;
      const res = await fetch(`/api/education/homework/${selectedHw.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ content }),
      });
      return res.json() as Promise<{ ok: boolean }>;
    },
    onSuccess: (data) => {
      if (data?.ok) {
        toast({ title: "Nộp bài thành công!" });
        setSelectedHw(null);
        setContent("");
        void qc.invalidateQueries({ queryKey: ["education", "homework"] });
      }
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
              <BookOpen className="w-7 h-7 text-primary" /> Trung tâm Bài tập
            </h1>
          </div>

          {selectedHw && (
            <div className="glass-panel rounded-xl border border-primary/20 p-6">
              <h2 className="text-lg font-semibold text-white mb-2">{selectedHw.title}</h2>
              {selectedHw.description && <p className="text-sm text-muted-foreground mb-4">{selectedHw.description}</p>}
              <div className="text-xs text-muted-foreground mb-3">
                Điểm tối đa: <span className="text-white">{selectedHw.maxScore}</span>
                {selectedHw.dueAt && <span className="ml-3">Hạn nộp: <span className="text-yellow-400">{new Date(selectedHw.dueAt).toLocaleDateString("vi-VN")}</span></span>}
              </div>
              <textarea className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white resize-none"
                placeholder="Nhập bài làm của bạn..." value={content}
                onChange={e => setContent(e.target.value)} />
              <div className="flex gap-2 mt-3">
                <Button className="bg-primary" onClick={() => submitMutation.mutate()} disabled={!content || submitMutation.isPending}>
                  {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Nộp bài
                </Button>
                <Button variant="outline" onClick={() => { setSelectedHw(null); setContent(""); }}>Huỷ</Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : homeworks.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Chưa có bài tập nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {homeworks.map(hw => (
                <div key={hw.id} className="glass-panel rounded-xl border border-white/10 p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{hw.title}</h3>
                    {hw.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{hw.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>Điểm: {hw.maxScore}</span>
                      {hw.dueAt && (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Clock className="w-3 h-3" />{new Date(hw.dueAt).toLocaleDateString("vi-VN")}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" className="bg-primary" onClick={() => setSelectedHw(hw)}>
                    <Send className="w-3 h-3 mr-1" />Nộp bài
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
