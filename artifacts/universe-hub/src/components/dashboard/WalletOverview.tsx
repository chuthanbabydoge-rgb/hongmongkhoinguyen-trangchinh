import { walletData } from "@/data/mockData";
import { Coins, CreditCard, Gem, TrendingUp } from "lucide-react";

export function WalletOverview() {
  const cards = [
    {
      label: "Credits",
      value: walletData.credits,
      icon: CreditCard,
      color: "text-blue-400",
      glow: "shadow-[0_0_20px_rgba(96,165,250,0.15)]",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      label: "Coins",
      value: walletData.coins,
      icon: Coins,
      color: "text-cyan-400",
      glow: "shadow-[0_0_20px_rgba(34,211,238,0.15)]",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20"
    },
    {
      label: "Tokens",
      value: walletData.tokens,
      icon: Gem,
      color: "text-purple-400",
      glow: "shadow-[0_0_20px_rgba(192,132,252,0.15)]",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    }
  ];

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
              <span>{walletData.trend.split(' ')[0]}</span>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">{card.label}</div>
            <div className={`text-3xl font-bold tracking-tight text-white group-hover:${card.color} transition-colors`}>
              {card.value.toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
