import { useEffect, useState } from "react";
import { CreditCard, Coins, Gem, TrendingUp, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

interface WalletBalance {
  userId: string;
  credits: number;
  coins: number;
  tokens: number;
  rewardPoints: number;
  weeklyChangePercent: number;
}

export function WalletOverview() {
  const [data, setData]       = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiFetch<WalletBalance>("/wallet/me")
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const trend = data ? `+${data.weeklyChangePercent.toFixed(1)}%` : "+0%";

  const cards = [
    {
      label:  "Tín dụng",
      value:  data?.credits ?? 0,
      icon:   CreditCard,
      color:  "text-blue-400",
      glow:   "shadow-[0_0_20px_rgba(96,165,250,0.15)]",
      bg:     "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label:  "Xu",
      value:  data?.coins ?? 0,
      icon:   Coins,
      color:  "text-cyan-400",
      glow:   "shadow-[0_0_20px_rgba(34,211,238,0.15)]",
      bg:     "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      label:  "Token",
      value:  data?.tokens ?? 0,
      icon:   Gem,
      color:  "text-purple-400",
      glow:   "shadow-[0_0_20px_rgba(192,132,252,0.15)]",
      bg:     "bg-purple-500/10",
      border: "border-purple-500/20",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="glass-panel p-5 rounded-xl border border-white/5 flex items-center justify-center h-28">
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`glass-panel p-5 rounded-xl border ${card.border} ${card.glow} hover:bg-white/5 transition-all duration-300 group cursor-default`}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
              <TrendingUp className="w-3 h-3" />
              <span>{trend}</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">
              {card.label}
            </div>
            <div className={`text-3xl font-bold tracking-tight text-white group-hover:${card.color} transition-colors`}>
              {card.value.toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
