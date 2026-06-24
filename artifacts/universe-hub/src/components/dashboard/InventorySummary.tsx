import { Package, Users, Ticket, Globe, Box, Loader2 } from "lucide-react";
import type { InventorySnapshot } from "@/services/accountBridgeTypes";

interface Props {
  inventory: InventorySnapshot | null;
  loading:   boolean;
}

export function InventorySummary({ inventory, loading }: Props) {
  const items = [
    { label: "Thú cưng",   value: inventory?.pets            ?? 0, icon: Package },
    { label: "Cầu thủ",    value: inventory?.footballPlayers ?? 0, icon: Users   },
    { label: "Vé",         value: inventory?.tickets         ?? 0, icon: Ticket  },
    { label: "Tài sản TG", value: inventory?.worldAssets     ?? 0, icon: Globe   },
    { label: "Vật phẩm",   value: inventory?.items           ?? 0, icon: Box     },
  ];

  return (
    <div className="glass-panel p-6 rounded-xl border border-white/5">
      <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
        <Box className="w-5 h-5 text-primary" />
        Tổng quan Kho đồ
      </h3>

      {loading ? (
        <div className="flex items-center justify-center h-20">
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {items.map((item) => (
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
