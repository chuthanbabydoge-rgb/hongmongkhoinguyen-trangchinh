import { useEffect, useState } from "react";
import { Trophy, Gift } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Season { id: string; name: string; number: number; status: string; startAt: string | null; endAt: string | null; }
interface PvpReward { id: string; tier: string; credits: number; xu: number; tokens: number; claimed: boolean; rewardType: string; }

const TIER_COLORS: Record<string, string> = {
  BRONZE: "text-amber-600", SILVER: "text-slate-400", GOLD: "text-yellow-400",
  PLATINUM: "text-cyan-400", DIAMOND: "text-blue-400", MASTER: "text-purple-400",
  GRANDMASTER: "text-orange-400", LEGEND: "text-red-400",
};

export default function SeasonRewards() {
  const { accessToken } = useAuth();
  const [season, setSeason] = useState<Season | null>(null);
  const [allSeasons, setAllSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/seasons/current").then((r) => r.json()),
      fetch("/api/seasons").then((r) => r.json()),
    ]).then(([cur, all]) => {
      if ((cur as { ok: boolean; data: Season }).ok) setSeason((cur as { ok: boolean; data: Season }).data);
      if ((all as { ok: boolean; data: Season[] }).ok) setAllSeasons((all as { ok: boolean; data: Season[] }).data);
    }).finally(() => setLoading(false));
  }, [accessToken]);

  const TIER_REWARDS = [
    { tier: "BRONZE",      credits: 100,   xu: 50,    tokens: 0,  icon: "🥉" },
    { tier: "SILVER",      credits: 250,   xu: 100,   tokens: 0,  icon: "🥈" },
    { tier: "GOLD",        credits: 500,   xu: 200,   tokens: 1,  icon: "🥇" },
    { tier: "PLATINUM",    credits: 1000,  xu: 400,   tokens: 2,  icon: "💎" },
    { tier: "DIAMOND",     credits: 2000,  xu: 800,   tokens: 5,  icon: "💠" },
    { tier: "MASTER",      credits: 4000,  xu: 1500,  tokens: 10, icon: "🔮" },
    { tier: "GRANDMASTER", credits: 8000,  xu: 3000,  tokens: 20, icon: "⭐" },
    { tier: "LEGEND",      credits: 15000, xu: 6000,  tokens: 50, icon: "👑" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" /> Phần thưởng Mùa giải
        </h1>
        {season && (
          <p className="text-muted-foreground text-sm mt-1">
            Mùa {season.number} — {season.name} •
            <span className={`ml-1 text-xs font-mono ${season.status === "ACTIVE" ? "text-green-400" : "text-muted-foreground"}`}>
              {season.status}
            </span>
          </p>
        )}
      </div>

      {season && (
        <div className="bg-white/3 border border-white/10 rounded-xl p-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Bắt đầu</div>
            <div className="text-sm font-medium">{season.startAt ? new Date(season.startAt).toLocaleDateString("vi-VN") : "—"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Kết thúc</div>
            <div className="text-sm font-medium">{season.endAt ? new Date(season.endAt).toLocaleDateString("vi-VN") : "—"}</div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-mono text-muted-foreground/60 uppercase tracking-widest mb-3">Phần thưởng theo hạng</h2>
        <div className="grid gap-3">
          {TIER_REWARDS.map((reward) => (
            <div key={reward.tier} className="flex items-center justify-between px-4 py-3 bg-white/3 border border-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-xl">{reward.icon}</span>
                <span className={`font-bold text-sm ${TIER_COLORS[reward.tier] ?? ""}`}>{reward.tier}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="text-yellow-400 font-mono">{reward.credits.toLocaleString()} Credits</span>
                <span className="text-blue-400 font-mono">{reward.xu.toLocaleString()} XU</span>
                {reward.tokens > 0 && <span className="text-purple-400 font-mono">{reward.tokens} Token</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-mono text-muted-foreground/60 uppercase tracking-widest mb-3">Lịch sử mùa giải</h2>
        {allSeasons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm bg-white/3 rounded-xl">Chưa có mùa giải nào</div>
        ) : (
          <div className="space-y-2">
            {allSeasons.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3 bg-white/3 border border-white/5 rounded-xl">
                <div>
                  <span className="font-medium text-sm">Mùa {s.number}</span>
                  <span className="text-muted-foreground text-xs ml-2">{s.name}</span>
                </div>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${s.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-muted-foreground"}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
