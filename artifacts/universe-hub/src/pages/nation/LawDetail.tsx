import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Scale, ThumbsUp, ThumbsDown, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";

export default function LawDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [reason, setReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["law", id],
    queryFn: () => fetch(`/api/nation/laws/${id}`).then(r => r.json()).then(r => r.data),
  });

  const vote = useMutation({
    mutationFn: (v: boolean) => fetch(`/api/nation/laws/${id}/vote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vote: v, reason }) }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["law", id] }),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;
  if (!data) return <div className="text-center py-8 text-muted-foreground">Không tìm thấy luật</div>;

  const l = data.law;
  const totalVotes = (l.votesFor ?? 0) + (l.votesAgainst ?? 0);
  const approvalRate = totalVotes > 0 ? Math.round((l.votesFor / totalVotes) * 100) : 0;

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <Link href="/nation/laws" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách luật
      </Link>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-white">{l.title}</h1>
          <span className={`text-sm px-3 py-1 rounded-full flex-shrink-0 ${l.status === "PASSED" ? "bg-green-500/20 text-green-400" : l.status === "VOTING" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}`}>{l.status}</span>
        </div>
        <p className="text-muted-foreground text-sm mb-4">{l.summary}</p>
        <div className="border-t border-white/10 pt-4">
          <p className="text-sm text-white whitespace-pre-wrap">{l.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10 text-xs text-muted-foreground">
          <span>Đề xuất bởi: {l.proposedBy}</span>
          <span>Ngày tạo: {new Date(l.createdAt).toLocaleDateString("vi-VN")}</span>
        </div>
      </div>

      {/* Voting Results */}
      {totalVotes > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Kết quả biểu quyết</h3>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-green-400 font-semibold">{l.votesFor} ✅</span>
            <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${approvalRate}%` }} />
            </div>
            <span className="text-red-400 font-semibold">{l.votesAgainst} ❌</span>
          </div>
          <p className="text-xs text-center text-muted-foreground">{approvalRate}% ủng hộ — {totalVotes} tổng phiếu</p>
        </div>
      )}

      {/* Vote */}
      {l.status === "VOTING" && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white">Biểu quyết</h3>
          <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" rows={2} placeholder="Lý do (tùy chọn)..." value={reason} onChange={e => setReason(e.target.value)} />
          <div className="flex gap-3">
            <button onClick={() => vote.mutate(true)} disabled={vote.isPending} className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600/20 border border-green-500/30 hover:bg-green-600/30 rounded-lg text-green-400 font-semibold disabled:opacity-50 transition-colors">
              <ThumbsUp className="w-4 h-4" /> Ủng hộ
            </button>
            <button onClick={() => vote.mutate(false)} disabled={vote.isPending} className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 rounded-lg text-red-400 font-semibold disabled:opacity-50 transition-colors">
              <ThumbsDown className="w-4 h-4" /> Phản đối
            </button>
          </div>
          {(vote.data as Record<string, unknown>)?.ok === false && <p className="text-red-400 text-sm text-center">{(vote.data as Record<string, string>)?.error}</p>}
        </div>
      )}

      {/* Vote List */}
      {data.votes && data.votes.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-3">Lịch sử biểu quyết ({data.votes.length})</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(data.votes as Record<string, string>[]).map(v => (
              <div key={v.id} className="flex items-center gap-3 text-sm">
                <span>{v.vote === true || v.vote === "true" ? "✅" : "❌"}</span>
                <span className="text-muted-foreground truncate">{v.userId}</span>
                {v.reason && <span className="text-xs text-muted-foreground/60 truncate">— {v.reason}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
