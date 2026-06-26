import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Trophy, Users, Play, CheckCircle, GitBranch } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Tournament {
  id: string; name: string; description: string | null;
  type: string; status: string; matchType: string;
  organizerId: string; maxParticipants: number;
  entryFee: number; prizePool: number;
  currentRound: number; totalRounds: number;
  winnerId: string | null; icon: string | null;
  startAt: string | null; finishedAt: string | null;
}
interface BracketEntry { userId: string; seed: number; isEliminated: boolean; wins: number; losses: number; }
interface TMatch { id: string; round: number; position: number; player1Id: string | null; player2Id: string | null; winnerId: string | null; status: string; }

const STATUS_LABELS: Record<string, string> = {
  UPCOMING: "Sắp diễn ra", REGISTRATION: "Đang đăng ký", IN_PROGRESS: "Đang diễn ra",
  FINISHED: "Đã kết thúc", CANCELLED: "Đã hủy",
};

export default function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const [, navigate] = useLocation();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<BracketEntry[]>([]);
  const [matches, setMatches] = useState<TMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    const [tb] = await Promise.all([
      fetch(`/api/tournaments/${id}/bracket`).then((r) => r.json()),
    ]);
    if ((tb as { ok: boolean; data: { tournament: Tournament; participants: BracketEntry[]; matches: TMatch[] } }).ok) {
      const d = (tb as { ok: boolean; data: { tournament: Tournament; participants: BracketEntry[]; matches: TMatch[] } }).data;
      setTournament(d.tournament);
      setParticipants(d.participants);
      setMatches(d.matches);
    }
  };

  useEffect(() => { fetchData().finally(() => setLoading(false)); }, [id]);

  const handleJoin = async () => {
    if (!accessToken) return;
    setJoining(true); setError(null);
    try {
      const r = await fetch(`/api/tournaments/${id}/join`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } });
      const j = await r.json() as { ok: boolean; error?: string };
      if (!j.ok) { setError(j.error ?? "Lỗi"); return; }
      await fetchData();
    } catch { setError("Không thể kết nối server"); }
    finally { setJoining(false); }
  };

  const handleStart = async () => {
    if (!accessToken) return;
    const r = await fetch(`/api/tournaments/${id}/start`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } });
    const j = await r.json() as { ok: boolean; error?: string };
    if (j.ok) await fetchData();
    else setError(j.error ?? "Lỗi");
  };

  const handleFinish = async () => {
    if (!accessToken || !confirm("Kết thúc giải đấu?")) return;
    const r = await fetch(`/api/tournaments/${id}/finish`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } });
    const j = await r.json() as { ok: boolean; error?: string };
    if (j.ok) await fetchData();
    else setError(j.error ?? "Lỗi");
  };

  if (loading) return <div className="p-6 animate-pulse text-muted-foreground">Đang tải giải đấu...</div>;
  if (!tournament) return <div className="p-6 text-muted-foreground">Giải đấu không tồn tại</div>;

  const rounds = [...new Set(matches.map((m) => m.round))].sort();

  return (
    <div className="p-6 space-y-6">
      <div>
        <button onClick={() => navigate("/tournaments")} className="text-muted-foreground text-sm hover:text-white transition-colors mb-4">← Quay lại</button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-2xl">{tournament.icon ?? "🏆"}</span> {tournament.name}
            </h1>
            {tournament.description && <p className="text-muted-foreground text-sm mt-1">{tournament.description}</p>}
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full bg-white/10 font-mono">{STATUS_LABELS[tournament.status] ?? tournament.status}</span>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Thể thức", value: tournament.type },
          { label: "Chế độ", value: tournament.matchType },
          { label: "Tham gia", value: `${participants.length}/${tournament.maxParticipants}` },
          { label: "Giải thưởng", value: `${tournament.prizePool.toLocaleString()} C`, color: "text-yellow-400" },
        ].map((item) => (
          <div key={item.label} className="bg-white/3 border border-white/5 rounded-xl p-3 text-center">
            <div className="text-xs text-muted-foreground">{item.label}</div>
            <div className={`font-bold text-sm mt-1 ${item.color ?? ""}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</div>}

      {/* Winner banner */}
      {tournament.status === "FINISHED" && tournament.winnerId && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-xl font-bold text-yellow-400">Nhà vô địch!</h2>
          <div className="text-sm text-muted-foreground mt-1 font-mono">{tournament.winnerId}</div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {tournament.status === "REGISTRATION" && (
          <button onClick={handleJoin} disabled={joining}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
            <Users className="w-4 h-4" /> {joining ? "Đang đăng ký..." : "Tham gia giải đấu"}
          </button>
        )}
        {tournament.status === "REGISTRATION" && (
          <button onClick={handleStart}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
            <Play className="w-4 h-4" /> Bắt đầu giải đấu
          </button>
        )}
        {tournament.status === "IN_PROGRESS" && (
          <button onClick={handleFinish}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm font-medium transition-colors">
            <CheckCircle className="w-4 h-4" /> Kết thúc giải đấu
          </button>
        )}
      </div>

      {/* Participants */}
      <div>
        <h2 className="text-sm font-mono text-muted-foreground/60 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Danh sách tham gia ({participants.length})
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {participants.map((p) => (
            <div key={p.userId} className={`flex items-center justify-between px-3 py-2 bg-white/3 border rounded-lg ${p.isEliminated ? "opacity-40 border-white/5" : "border-white/10"}`}>
              <span className="text-xs font-mono">{p.userId.slice(0, 12)}…</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>#{p.seed}</span>
                <span>{p.wins}W/{p.losses}L</span>
                {p.isEliminated && <span className="text-red-400">💀</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bracket */}
      {matches.length > 0 && (
        <div>
          <h2 className="text-sm font-mono text-muted-foreground/60 uppercase tracking-widest mb-3 flex items-center gap-2">
            <GitBranch className="w-4 h-4" /> Bracket
          </h2>
          {rounds.map((round) => (
            <div key={round} className="mb-4">
              <div className="text-xs text-muted-foreground mb-2">Vòng {round}</div>
              <div className="grid gap-2">
                {matches.filter((m) => m.round === round).map((m) => (
                  <div key={m.id} className="flex items-center gap-3 px-4 py-3 bg-white/3 border border-white/5 rounded-xl">
                    <div className="flex-1 text-sm">
                      <div className={m.winnerId === m.player1Id ? "text-green-400 font-medium" : ""}>
                        {m.player1Id ? `${m.player1Id.slice(0, 10)}…` : "BYE"}
                      </div>
                      <div className={m.winnerId === m.player2Id ? "text-green-400 font-medium" : "text-muted-foreground"}>
                        {m.player2Id ? `${m.player2Id.slice(0, 10)}…` : "BYE"}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${m.status === "FINISHED" ? "bg-white/10 text-muted-foreground" : "bg-yellow-500/20 text-yellow-400"}`}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
