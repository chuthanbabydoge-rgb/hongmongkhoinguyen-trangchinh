import { useEffect, useState } from "react";
import { Package, Users, Ticket, Globe, Box, Loader2, AlertTriangle } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/apiClient";

interface InventorySummaryResponse {
  totalAssets:  number;
  pets:         number;
  items:        number;
  tickets:      number;
  worldAssets:  number;
  collectibles: number;
}

export function InventorySummary() {
  const [summary,   setSummary]   = useState<InventorySummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    apiFetch<InventorySummaryResponse>("/inventory/summary")
      .then(data => setSummary(data))
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) {
          setError("Vui lòng đăng nhập để xem kho đồ.");
        } else {
          setError(err instanceof Error ? err.message : "Không thể tải kho đồ.");
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const displayItems = [
    { label: "Thú cưng",   value: summary?.pets         ?? 0, icon: Package },
    { label: "Cầu thủ",    value: summary?.collectibles ?? 0, icon: Users   },
    { label: "Vé",         value: summary?.tickets      ?? 0, icon: Ticket  },
    { label: "Tài sản TG", value: summary?.worldAssets  ?? 0, icon: Globe   },
    { label: "Vật phẩm",   value: summary?.items        ?? 0, icon: Box     },
  ];

  return (
    <div className="glass-panel p-6 rounded-xl border border-white/5">
      <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
        <Box className="w-5 h-5 text-primary" />
        Tổng quan Kho đồ
      </h3>

      {isLoading ? (
        <div className="flex items-center justify-center h-20">
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground/60 py-4">
          <AlertTriangle className="w-4 h-4 text-rose-400/60 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {displayItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-black/40 border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group"
            >
              <item.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary mb-3 transition-colors" />
              <div className="text-2xl font-bold text-white mb-1 group-hover:neon-text">
                {item.value}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono text-center">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
