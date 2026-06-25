import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  RARITY_META, ITEM_CATEGORY_META,
  type Rarity, type ItemCategory,
} from "@/lib/inventoryMockData";
import { useInventory } from "@/context/InventoryContext";
import type { InventoryItem } from "@/types/inventory";
import { cn } from "@/lib/utils";
import { Search, Zap, Layers } from "lucide-react";

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/8 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-red-500/5 rounded-full blur-[100px]" />
  </div>
);

function ItemCard({ item, index }: { item: InventoryItem; index: number }) {
  const rm = RARITY_META[item.rarity];
  const cm = ITEM_CATEGORY_META[item.itemCategory];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.4) }}
      className={cn("glass-panel rounded-2xl border p-4 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300", rm.border, rm.glow)}>
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl", rm.bg)} />
      <div className="relative z-10">
        {/* Quantity badge */}
        {item.quantity > 1 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border border-primary/40">
            <span className="text-[9px] font-bold font-mono text-black">{item.quantity > 99 ? "99+" : item.quantity}</span>
          </div>
        )}

        <div className="flex items-start gap-3 mb-3">
          <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center text-2xl flex-shrink-0", rm.bg, rm.border)}>
            {item.image}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{item.name}</p>
            <div className={cn("inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-white/10 mt-0.5", cm.color, cm.bg)}>
              {cm.label}
            </div>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/50 mb-3 line-clamp-2">{item.description}</p>

        {item.effect && (
          <div className="mb-3 px-2 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />
            <p className="text-[10px] font-mono font-bold text-amber-400 truncate">{item.effect}</p>
          </div>
        )}

        <div className="flex gap-2 mb-3">
          <div className={cn("flex-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded border text-center", rm.color, rm.bg, rm.border)}>{rm.label}</div>
          {item.power > 0 && (
            <div className="flex-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded border text-center text-red-400 bg-red-400/10 border-red-400/20">
              PWR {item.power.toLocaleString()}
            </div>
          )}
        </div>

        {/* Usable in */}
        <div className="mb-3">
          <p className="text-[9px] font-mono text-muted-foreground/30 mb-1 flex items-center gap-1"><Layers className="w-2.5 h-2.5" /> Dùng trong</p>
          <div className="flex flex-wrap gap-1">
            {item.usableIn.map(u => (
              <span key={u} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground/50">{u}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="text-[9px] font-mono text-muted-foreground/30">
            x{item.quantity} · {item.value.toLocaleString("vi-VN")} CR / cái
          </div>
          <div className="text-[10px] font-mono font-bold text-emerald-400">
            {(item.value * item.quantity).toLocaleString("vi-VN")} CR
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Items() {
  const { items } = useInventory();
  const [search, setSearch] = useState("");
  const [filterRarity, setFilterRarity] = useState<"all" | Rarity>("all");
  const [filterCat, setFilterCat] = useState<"all" | ItemCategory>("all");
  const [sortBy, setSortBy] = useState<"name" | "value" | "power" | "quantity">("value");

  const filtered = useMemo(() => {
    return items
      .filter(it => {
        if (filterRarity !== "all" && it.rarity !== filterRarity) return false;
        if (filterCat !== "all" && it.itemCategory !== filterCat) return false;
        if (search && !it.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "value")    return (b.value * b.quantity) - (a.value * a.quantity);
        if (sortBy === "power")    return b.power - a.power;
        if (sortBy === "quantity") return b.quantity - a.quantity;
        return a.name.localeCompare(b.name);
      });
  }, [search, filterRarity, filterCat, sortBy, items]);

  const totalValue = useMemo(() => items.reduce((s, i) => s + i.value * i.quantity, 0), [items]);

  const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={cn("px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all",
      active ? "bg-red-400/20 border-red-400/40 text-red-400" : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20")}>
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <BG />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <Header />
        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-2 h-6 bg-red-400 rounded-sm shadow-[0_0_10px_rgba(248,113,113,0.6)]" />
                Vật phẩm
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">{filtered.length} / {items.length} LOẠI VẬT PHẨM</p>
            </div>
            <div className="glass-panel rounded-xl border border-emerald-400/20 px-3 py-2">
              <p className="text-[9px] font-mono text-muted-foreground/30">TỔNG GIÁ TRỊ KHO</p>
              <p className="text-sm font-bold font-mono text-emerald-400">{(totalValue/1000).toFixed(0)}K CR</p>
            </div>
          </div>

          <div className="glass-panel rounded-xl border border-white/5 p-4 space-y-3">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên vật phẩm..."
                  className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-red-400/40 font-mono" />
              </div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none font-mono">
                <option value="value">Theo giá trị</option>
                <option value="power">Theo sức mạnh</option>
                <option value="quantity">Theo số lượng</option>
                <option value="name">Theo tên</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "common", "rare", "epic", "legendary"] as const).map(r => (
                <Chip key={r} label={r === "all" ? "Tất cả" : RARITY_META[r as Rarity]?.label ?? r} active={filterRarity === r} onClick={() => setFilterRarity(r)} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip label="Mọi loại" active={filterCat === "all"} onClick={() => setFilterCat("all")} />
              {(["equipment","consumable","material","decoration","special"] as ItemCategory[]).map(c => (
                <Chip key={c} label={ITEM_CATEGORY_META[c].label} active={filterCat === c} onClick={() => setFilterCat(c)} />
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="glass-panel rounded-xl border border-white/5 p-12 text-center text-muted-foreground/30 text-xs font-mono tracking-widest">
              KHÔNG TÌM THẤY VẬT PHẨM PHÙ HỢP
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((it, i) => <ItemCard key={it.id} item={it} index={i} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
