import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Sword, Heart, Zap, Shield, Flag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface MatchPlayer {
  userId: string; team: number; hp: number; maxHp: number;
  mana: number; maxMana: number; isAlive: boolean;
  damageDealt: number; kills: number; deaths: number;
  isReady: boolean; isWinner: boolean | null; mmrDelta: number | null;
}
interface Match {
  id: string; type: string; status: string;
  winnerId: string | null; durationSec: number | null;
}

export default function ArenaMatch() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const [, navigate] = useLocation();
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<MatchPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [acting, setActing] = useState(false);

  const fetchMatch = async () => {
    const r = await fetch(`/api/pvp/match/${id}`);
    const j = await r.json() as { ok: boolean; data: { match: Match; players: MatchPlayer[] } };
    if (j.ok) { setMatch(j.data.match); setPlayers(j.data.players); }
  };

  useEffect(() => {
    fetchMatch().finally(() => setLoading(false));
    const interval = setInterval(fetchMatch, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const currentPlayer = players[0];
  const opponents = players.slice(1);

  const handleReady = async () => {
    if (!accessToken || !id) return;
    await fetch(`/api/pvp/match/${id}/ready`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } });
    await fetchMatch();
  };

  const handleAttack = async (targetId: string) => {
    if (!accessToken || !id || acting) return;
    setActing(true);
    try {
      const r = await fetch(`/api/pvp/match/${id}/attack`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ targetId }),
      });
      const j = await r.json() as { ok: boolean; data: { damageDealt: number; killed: boolean } };
      if (j.ok) {
        setActionLog((l) => [`⚔️ Tấn công: ${j.data.damageDealt} sát thương${j.data.killed ? " — ĐỐI THỦ BỊ HẠ!" : ""}`, ...l.slice(0, 9)]);
        await fetchMatch();
      }
    } finally { setActing(false); }
  };

  const handleSurrender = async () => {
    if (!accessToken || !id) return;
    if (!confirm("Bạn chắc chắn muốn đầu hàng?")) return;
    await fetch(`/api/pvp/match/${id}/surrender`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } });
    await fetchMatch();
  };

  if (loading) return <div className="p-6 text-muted-foreground animate-pulse">Đang tải trận đấu...</div>;
  if (!match) return <div className="p-6 text-muted-foreground">Trận đấu không tồn tại</div>;

  const hpPercent = (p: MatchPlayer) => Math.max(0, (p.hp / p.maxHp) * 100);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Sword className="w-5 h-5 text-red-400" /> Arena Match — {match.type}
        </h1>
        <span className={`text-xs px-3 py-1 rounded-full font-mono ${
          match.status === "IN_PROGRESS" ? "bg-green-500/20 text-green-400" :
          match.status === "FINISHED" ? "bg-white/10 text-muted-foreground" :
          "bg-yellow-500/20 text-yellow-400"
        }`}>{match.status}</span>
      </div>

      {/* Match result */}
      {match.status === "FINISHED" && (
        <div className={`rounded-2xl p-6 text-center border ${match.winnerId === currentPlayer?.userId ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
          <div className="text-3xl font-bold mb-2">
            {match.winnerId === currentPlayer?.userId ? "🏆 Chiến thắng!" : "💀 Thất bại"}
          </div>
          {currentPlayer?.mmrDelta !== null && currentPlayer?.mmrDelta !== undefined && (
            <div className={`text-lg font-mono ${currentPlayer.mmrDelta > 0 ? "text-green-400" : "text-red-400"}`}>
              {currentPlayer.mmrDelta > 0 ? "+" : ""}{currentPlayer.mmrDelta} MMR
            </div>
          )}
          <button onClick={() => navigate("/pvp")} className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm transition-colors">
            Về trang PvP
          </button>
        </div>
      )}

      {/* Players */}
      <div className="grid gap-4">
        {players.map((p, i) => (
          <div key={p.userId} className={`bg-white/3 border rounded-xl p-4 ${!p.isAlive ? "opacity-50" : ""} ${i === 0 ? "border-blue-500/30" : "border-red-500/20"}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${i === 0 ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}`}>
                  {i === 0 ? "BẠN" : "ĐỐI THỦ"}
                </span>
                <span className="text-xs text-muted-foreground font-mono">{p.userId.slice(0, 8)}…</span>
                {!p.isAlive && <span className="text-xs text-red-400">💀 Đã bị hạ</span>}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>⚔️ {p.damageDealt}</span>
                <span>☠️ {p.kills}/{p.deaths}</span>
              </div>
            </div>

            {/* HP Bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="w-3 h-3 text-red-400 flex-shrink-0" />
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${hpPercent(p)}%` }} />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-16 text-right">{p.hp}/{p.maxHp}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(p.mana / p.maxMana) * 100}%` }} />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-16 text-right">{p.mana}/{p.maxMana}</span>
              </div>
            </div>

            {/* Action buttons for opponents */}
            {i > 0 && match.status === "IN_PROGRESS" && p.isAlive && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAttack(p.userId)}
                  disabled={acting}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <Sword className="w-3 h-3" /> Tấn công
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      {match.status === "WAITING" && (
        <button onClick={handleReady} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold transition-colors">
          ✅ Sẵn sàng chiến đấu
        </button>
      )}

      {match.status === "IN_PROGRESS" && (
        <button onClick={handleSurrender} className="flex items-center justify-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors mx-auto">
          <Flag className="w-4 h-4" /> Đầu hàng
        </button>
      )}

      {/* Action log */}
      {actionLog.length > 0 && (
        <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-1.5 max-h-40 overflow-y-auto">
          <div className="text-xs font-mono text-muted-foreground/60 uppercase tracking-widest mb-2">Nhật ký chiến đấu</div>
          {actionLog.map((log, i) => (
            <div key={i} className="text-xs font-mono text-muted-foreground">{log}</div>
          ))}
        </div>
      )}
    </div>
  );
}
