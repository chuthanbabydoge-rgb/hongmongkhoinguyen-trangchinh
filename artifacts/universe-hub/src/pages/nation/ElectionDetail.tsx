import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Vote, Users, Trophy, ArrowLeft } from "lucide-react";
import { Link, useParams } from "wouter";

export default function ElectionDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["election", id],
    queryFn: () => fetch(`/api/nation/elections/${id}`).then(r => r.json()).then(r => r.data),
  });

  const vote = useMutation({
    mutationFn: (candidateId: string) => fetch(`/api/nation/elections/${id}/vote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ candidateId }) }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["election", id] }),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;
  if (!data) return <div className="text-center py-8 text-muted-foreground">Không tìm thấy bầu cử</div>;

  const e = data.election;
  const candidates = data.candidates ?? [];
  const maxVotes = Math.max(...candidates.map((c: Record<string, number>) => c.votes ?? 0), 1);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <Link href="/nation/elections" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bầu cử
      </Link>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-white">{e.title}</h1>
          <span className={`text-sm px-3 py-1 rounded-full ${e.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : e.status === "ENDED" ? "bg-gray-500/20 text-gray-400" : "bg-blue-500/20 text-blue-400"}`}>{e.status}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{e.description}</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-xs text-muted-foreground">Loại</p><p className="text-sm text-white">{e.electionType}</p></div>
          <div><p className="text-xs text-muted-foreground">Tổng phiếu</p><p className="text-xl font-bold text-white">{e.totalVotes}</p></div>
          <div><p className="text-xs text-muted-foreground">Ứng cử viên</p><p className="text-xl font-bold text-white">{candidates.length}</p></div>
        </div>
      </div>

      {/* Candidates */}
      <div>
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-blue-400" /> Ứng cử viên</h2>
        <div className="space-y-3">
          {(candidates as Record<string, string | number>[]).map((c, i) => (
            <div key={c.id as string} className={`bg-white/5 border rounded-xl p-4 ${c.isWinner ? "border-amber-500/30 bg-amber-900/10" : "border-white/10"}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? "bg-amber-500/30 text-amber-400" : "bg-white/10 text-muted-foreground"}`}>#{i + 1}</div>
                <div className="flex-1">
                  <p className="font-semibold text-white flex items-center gap-2">{c.name as string}{c.isWinner && <Trophy className="w-4 h-4 text-amber-400" />}</p>
                  <p className="text-xs text-muted-foreground">{c.party as string}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{c.votes as number}</p>
                  <p className="text-xs text-muted-foreground">phiếu</p>
                </div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                <div className={`h-full rounded-full ${c.isWinner ? "bg-amber-500" : "bg-blue-500"}`} style={{ width: `${Math.round(((c.votes as number) / maxVotes) * 100)}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{c.platform as string}</p>
              {e.status === "ACTIVE" && (
                <button onClick={() => vote.mutate(c.id as string)} disabled={vote.isPending} className="mt-3 w-full py-2 bg-green-600/20 border border-green-500/30 hover:bg-green-600/30 rounded-lg text-green-400 text-sm font-semibold disabled:opacity-50 transition-colors">
                  {vote.isPending ? "Đang bỏ phiếu..." : "Bỏ phiếu"}
                </button>
              )}
            </div>
          ))}
          {candidates.length === 0 && <p className="text-center text-muted-foreground py-4">Chưa có ứng cử viên</p>}
        </div>
      </div>

      {(vote.data as Record<string, unknown>)?.ok === false && (
        <p className="text-center text-red-400 text-sm">{(vote.data as Record<string, string>)?.error}</p>
      )}
    </div>
  );
}
