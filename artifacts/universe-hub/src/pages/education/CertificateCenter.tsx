import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Award, CheckCircle, XCircle, Download, Search, Loader2, Shield } from "lucide-react";
import { Link } from "wouter";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Certificate {
  id: string; userId: string; courseId: string; teacherId: string;
  status: string; verificationCode: string; issuedAt: string;
}
interface Enrollment { courseId: string; completedAt?: string; }

export default function CertificateCenter() {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; certificate: Certificate } | null>(null);

  const { data, isLoading } = useQuery<{ ok: boolean; data: Certificate[] }>({
    queryKey: ["education", "certificates"],
    queryFn: async () => {
      const res = await fetch("/api/education/certificates", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json() as Promise<{ ok: boolean; data: Certificate[] }>;
    },
    enabled: !!accessToken,
  });
  const certificates = data?.data ?? [];

  const { data: enrollData } = useQuery<{ ok: boolean; data: Enrollment[] }>({
    queryKey: ["education", "enrollments-for-cert"],
    queryFn: async () => {
      const res = await fetch("/api/education/enrollments", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json() as Promise<{ ok: boolean; data: Enrollment[] }>;
    },
    enabled: !!accessToken,
  });
  const completedCourses = (enrollData?.data ?? []).filter(e => e.completedAt);
  const certCourseIds = new Set(certificates.map(c => c.courseId));
  const eligibleCourses = completedCourses.filter(e => !certCourseIds.has(e.courseId));

  const generateMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch("/api/education/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ courseId }),
      });
      return res.json() as Promise<{ ok: boolean }>;
    },
    onSuccess: () => {
      toast({ title: "🎓 Chứng chỉ đã được cấp!" });
      void qc.invalidateQueries({ queryKey: ["education", "certificates"] });
    },
    onError: () => toast({ title: "Không thể cấp chứng chỉ", variant: "destructive" }),
  });

  const handleVerify = async () => {
    if (!verifyCode.trim()) return;
    const res = await fetch(`/api/education/certificates/verify/${verifyCode.trim()}`);
    const data = await res.json() as { ok: boolean; data: { valid: boolean; certificate: Certificate } };
    if (data.ok) setVerifyResult(data.data);
    else setVerifyResult({ valid: false, certificate: null! });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Award className="w-7 h-7 text-yellow-400" /> Trung tâm Chứng chỉ
            </h1>
            <Link href="/education"><Button variant="outline" size="sm">← Dashboard</Button></Link>
          </div>

          <div className="glass-panel rounded-xl border border-white/10 p-4">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Xác minh chứng chỉ
            </h2>
            <div className="flex gap-2">
              <Input placeholder="Nhập mã xác minh (VD: CERT-ABC123DEFGH)" className="bg-white/5 border-white/10 flex-1"
                value={verifyCode} onChange={e => setVerifyCode(e.target.value)} />
              <Button onClick={handleVerify} className="bg-primary"><Search className="w-4 h-4 mr-1" />Xác minh</Button>
            </div>
            {verifyResult && (
              <div className={`mt-3 p-3 rounded-lg border ${verifyResult.valid ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                {verifyResult.valid ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <div>
                      <p className="font-semibold text-sm">Chứng chỉ hợp lệ!</p>
                      <p className="text-xs">Cấp ngày: {new Date(verifyResult.certificate.issuedAt).toLocaleDateString("vi-VN")}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-5 h-5" />
                    <p className="text-sm">Mã xác minh không hợp lệ hoặc đã bị thu hồi</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {eligibleCourses.length > 0 && (
            <div className="glass-panel rounded-xl border border-yellow-500/20 p-4">
              <h2 className="text-sm font-semibold text-yellow-400 mb-3">🎓 Khoá học đủ điều kiện nhận chứng chỉ</h2>
              <div className="space-y-2">
                {eligibleCourses.map(e => (
                  <div key={e.courseId} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span className="text-sm text-white">Khoá học #{e.courseId.slice(0, 8)}</span>
                    <Button size="sm" className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      onClick={() => generateMutation.mutate(e.courseId)} disabled={generateMutation.isPending}>
                      <Award className="w-3 h-3 mr-1" />Nhận chứng chỉ
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Award className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Chưa có chứng chỉ nào. Hoàn thành khoá học để nhận chứng chỉ!</p>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Chứng chỉ của tôi ({certificates.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map(cert => (
                  <div key={cert.id} className={`glass-panel rounded-xl border p-5 ${cert.status === "ACTIVE" ? "border-yellow-500/30" : "border-white/10"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${cert.status === "ACTIVE" ? "bg-yellow-500/20" : "bg-white/10"}`}>
                        <Award className={`w-6 h-6 ${cert.status === "ACTIVE" ? "text-yellow-400" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">Chứng chỉ hoàn thành</p>
                        <p className="text-xs text-muted-foreground">Khoá học: #{cert.courseId.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Cấp: {new Date(cert.issuedAt).toLocaleDateString("vi-VN")}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-muted-foreground">
                            {cert.verificationCode}
                          </span>
                          {cert.status === "REVOKED" && (
                            <span className="text-xs text-red-400">Đã thu hồi</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
