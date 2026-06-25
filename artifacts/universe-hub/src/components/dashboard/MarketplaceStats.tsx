import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { apiFetch } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { ShoppingBag, CheckCircle2, TrendingUp, Coins, ArrowRight, Loader2 } from "lucide-react";

interface MarketStats {
  activeListings:    number;
  soldListings:      number;
  totalTransactions: number;
  marketVolume:      number;
}

const fmtCR = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
  : v >= 1_000   ? `${(v / 1_000).toFixed(0)}K`
  : String(v);

export function MarketplaceStats() {
  const [stats,   setStats]   = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ activeListings: number; soldListings: number; totalListings: number; totalTransactions: number; marketVolume: number }>("/marketplace/stats")
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const items = [
    {
      label:  "Đang bán",
      value:  stats?.activeListings ?? 0,
      icon:   ShoppingBag,
      color:  "text-emerald-400",
      bg:     "bg-emerald-400/10",
      border: "border-emerald-400/20",
    },
    {
      label:  "Đã bán",
      value:  stats?.soldListings ?? 0,
      icon:   CheckCircle2,
      color:  "text-blue-400",
      bg:     "bg-blue-400/10",
      border: "border-blue-400/20",
    },
    {
      label:  "Giao dịch",
      value:  stats?.totalTransactions ?? 0,
      icon:   TrendingUp,
      color:  "text-purple-400",
      bg:     "bg-purple-400/10",
      border: "border-purple-400/20",
    },
    {
      label:  "Khối lượng (CR)",
      value:  fmtCR(stats?.marketVolume ?? 0),
      icon:   Coins,
      color:  "text-amber-400",
      bg:     "bg-amber-400/10",
      border: "border-amber-400/20",
      raw:    true,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-mono font-bold text-muted-foreground/50 uppercase tracking-widest">
          Marketplace
        </h2>
        <Link href="/marketplace" className="flex items-center gap-1 text-[10px] font-mono text-primary/70 hover:text-primary transition-colors">
          Xem marketplace <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={cn(
              "glass-panel rounded-xl border p-4 flex flex-col gap-2",
              item.border,
            )}
          >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", item.bg)}>
              {loading
                ? <Loader2 className={cn("w-4 h-4 animate-spin", item.color)} />
                : <item.icon className={cn("w-4 h-4", item.color)} />
              }
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-0.5">
                {item.label}
              </p>
              <p className={cn("text-lg font-bold font-mono", item.color)}>
                {loading ? "—" : (item.raw ? String(item.value) : Number(item.value).toLocaleString("vi-VN"))}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
