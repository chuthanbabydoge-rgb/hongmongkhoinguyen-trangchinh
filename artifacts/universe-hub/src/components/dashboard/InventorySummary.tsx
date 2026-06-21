import { inventoryData } from "@/data/mockData";
import { Package, Users, Ticket, Globe, Box } from "lucide-react";

export function InventorySummary() {
  const items = [
    { label: "Pets", value: inventoryData.pets, icon: Package },
    { label: "Players", value: inventoryData.footballPlayers, icon: Users },
    { label: "Tickets", value: inventoryData.tickets, icon: Ticket },
    { label: "World Assets", value: inventoryData.worldAssets, icon: Globe },
    { label: "Items", value: inventoryData.items, icon: Box },
  ];

  return (
    <div className="glass-panel p-6 rounded-xl border border-white/5">
      <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
        <Box className="w-5 h-5 text-primary" />
        Inventory Summary
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {items.map((item, i) => (
          <div 
            key={item.label}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-black/40 border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group"
          >
            <item.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary mb-3 transition-colors" />
            <div className="text-2xl font-bold text-white mb-1 group-hover:neon-text">{item.value}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono text-center">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
