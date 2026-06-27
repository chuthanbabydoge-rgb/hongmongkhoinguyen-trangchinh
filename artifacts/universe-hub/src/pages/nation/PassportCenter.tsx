import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Plus, Clock, CheckCircle } from "lucide-react";

export default function PassportCenter() {
  const qc = useQueryClient();
  const { data: passport, isLoading } = useQuery({
    queryKey: ["my-passport"],
    queryFn: () => fetch("/api/nation/passport").then(r => r.json()).then(r => r.data),
  });

  const issue = useMutation({
    mutationFn: () => fetch("/api/nation/passport", { method: "POST" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-passport"] }),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Shield className="w-7 h-7 text-indigo-400" />
        <h1 className="text-2xl font-bold text-white">Trung tâm Hộ chiếu</h1>
      </div>

      {passport ? (
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-8">
          <div className="text-center mb-6">
            <p className="text-6xl mb-3">🛂</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">HỘ CHIẾU UNIVERSE PRIME</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Số hộ chiếu</p>
              <p className="text-xl font-bold text-white font-mono">{passport.passportNumber}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Trạng thái</p>
              <span className={`text-sm px-3 py-1 rounded-full ${passport.status === "VALID" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{passport.status}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ngày cấp</p>
              <p className="text-sm text-white">{new Date(passport.issuedAt).toLocaleDateString("vi-VN")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hết hạn</p>
              <p className="text-sm text-white">{new Date(passport.expiresAt).toLocaleDateString("vi-VN")}</p>
            </div>
          </div>
          {new Date(passport.expiresAt) < new Date() && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
              <Clock className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-300">Hộ chiếu đã hết hạn. Vui lòng gia hạn.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Chưa có hộ chiếu</h2>
          <p className="text-muted-foreground mb-6 text-sm">Bạn cần là công dân Universe Prime trước khi xin hộ chiếu.</p>
          <button onClick={() => issue.mutate()} disabled={issue.isPending} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors disabled:opacity-50">
            {issue.isPending ? "Đang xin cấp..." : "Xin cấp Hộ chiếu"}
          </button>
          {(issue.data as Record<string, unknown>)?.ok === false && <p className="text-red-400 text-sm mt-3">{(issue.data as Record<string, string>)?.error}</p>}
        </div>
      )}
    </div>
  );
}
