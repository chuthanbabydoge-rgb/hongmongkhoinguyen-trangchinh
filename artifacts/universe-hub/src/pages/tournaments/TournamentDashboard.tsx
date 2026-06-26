import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Trophy, Plus, Users, Zap } from "lucide-react";

interface Tournament {
  id: string; name: string; description: string | null;
  type: string; status: string; matchType: string;
  maxParticipants: number; entryFee: number; prizePool: number;
  currentRound: number; totalRounds: number;
  organizerId: string; winnerId: string | null; icon: string | null;
  createdAt: string; startAt: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  UPCOMING: "Sắp diễn ra", REGISTRATION: "Đăng ký", IN_PROGRESS: "Đang diễn ra",
  FINISHED: "Đã kết thúc", CANCELLED: "Đã hủy",
};
const STATUS_COLORS: Record<string, string> = {
  UPCOMING: "text-slate-400 bg-slate-400/10",
  REGISTRATION: "text-green-400 bg-green-400/10",
  IN_PROGRESS: "text-yellow-400 bg-yellow-400/10",
  FINISHED: "text-muted-foreground bg-white/5",
  CANCELLED: "text-red-400 bg-red-400/10",
};

export default function TournamentDashboard() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filter, setFilter] = useState<string>("REGISTRATION");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tournaments${filter ? `?status=${filter}` : ""}`)
      .then((r) => r.json())
      .then((j) => { if ((j as { ok: boolean; data: Tournament[] }).ok) setTournaments((j as { ok: boolean; data: Tournament[] }).data); })
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" /> Universe Tournament
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Giải đấu PvP chính thức — loại trực tiếp, vòng tròn</p>
        </div>
        <Link href="/tournaments/create">
          <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Tạo giải đấu
          </button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { val: "", label: "Tất cả" },
          { val: "REGISTRATION", label: "Đăng ký" },
          { val: "IN_PROGRESS", label: "Đang diễn ra" },
          { val: "FINISHED", label: "Đã kết thúc" },
        ].map((f) => (
          <button
            key={f.val}
            onClick={() => setFilter(f.val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.val ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}</div>
      ) : tournaments.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="mb-2">Chưa có giải đấu nào</p>
          <Link href="/tournaments/create"><span className="text-yellow-400 hover:underline text-sm cursor-pointer">Tạo giải đấu đầu tiên!</span></Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {tournaments.map((t) => (
            <Link key={t.id} href={`/tournaments/${t.id}`}>
              <div className="bg-white/3 border border-white/10 hover:border-yellow-500/30 rounded-2xl p-5 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{t.icon ?? "🏆"}</span>
                      <h2 className="font-bold group-hover:text-yellow-400 transition-colors">{t.name}</h2>
                    </div>
                    {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${STATUS_COLORS[t.status] ?? ""}`}>
                    {STATUS_LABELS[t.status] ?? t.status}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div className="text-center">
                    <div className="text-muted-foreground">Chế độ</div>
                    <div className="font-medium mt-0.5">{t.matchType}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Loại</div>
                    <div className="font-medium mt-0.5">{t.type}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Người tham gia</div>
                    <div className="font-medium mt-0.5 flex items-center justify-center gap-1">
                      <Users className="w-3 h-3" /> {t.maxParticipants}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Giải thưởng</div>
                    <div className="font-medium mt-0.5 text-yellow-400">{t.prizePool.toLocaleString()} Credits</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
