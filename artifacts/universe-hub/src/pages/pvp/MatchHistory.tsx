import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Clock, Swords } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Match { id: string; type: string; status: string; isRanked: boolean; finishedAt: string | null; durationSec: number | null; winnerId: string | null; }

export default function MatchHistory() {
  const { accessToken } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetch("/api/pvp/history", { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => r.json())
      .then((j) => { if ((j as { ok: boolean; data: Match[] }).ok) setMatches((j as { ok: boolean; data: Match[] }).data); })
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6 text-slate-400" /> Lịch sử trận đấu
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Tất cả các trận PvP đã tham gia</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Swords className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Chưa có trận đấu nào</p>
          <Link href="/pvp/queue"><span className="text-blue-400 hover:underline text-sm cursor-pointer">Tìm trận ngay!</span></Link>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((m) => (
            <Link key={m.id} href={`/pvp/match/${m.id}`}>
              <div className="flex items-center justify-between px-4 py-4 bg-white/3 border border-white/5 hover:border-white/15 rounded-xl transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Swords className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                  <div>
                    <div className="font-medium text-sm">{m.type}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${m.isRanked ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-muted-foreground"}`}>
                        {m.isRanked ? "Xếp hạng" : "Thường"}
                      </span>
                      <span className="text-xs text-muted-foreground">{m.status}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {m.durationSec && <div>{m.durationSec}s</div>}
                  {m.finishedAt && <div>{new Date(m.finishedAt).toLocaleDateString("vi-VN")}</div>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
