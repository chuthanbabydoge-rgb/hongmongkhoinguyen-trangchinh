import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  RARITY_META, ELEMENT_META, PET_STATUS_META,
  type Rarity, type PetElement, type PetStatus,
} from "@/lib/inventoryMockData";
import { useInventory } from "@/context/InventoryContext";
import type { Pet } from "@/types/inventory";
import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal, Zap, Shield, Heart, Wind } from "lucide-react";

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-[100px]" />
  </div>
);

function StatBar({ value, max = 1000, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-1 bg-black/40 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn("h-full rounded-full", color)} />
    </div>
  );
}

function PetCard({ pet, index }: { pet: Pet; index: number }) {
  const rm = RARITY_META[pet.rarity];
  const em = ELEMENT_META[pet.element];
  const sm = PET_STATUS_META[pet.petStatus];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.05, 0.4) }}
      className={cn("glass-panel rounded-2xl border p-4 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300", rm.border, rm.glow)}>
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl", rm.bg)} />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center text-2xl", rm.bg, rm.border)}>
              {pet.image}
            </div>
            <div>
              <p className="text-xs font-bold text-white">{pet.name}</p>
              <p className="text-[10px] font-mono text-muted-foreground/50">{pet.species}</p>
            </div>
          </div>
          <div className={cn("flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border", rm.color, rm.bg, rm.border)}>
            {rm.label}
          </div>
        </div>

        {/* Level + Power */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1 rounded-lg bg-white/5 border border-white/5 p-2 text-center">
            <p className="text-[10px] font-mono text-muted-foreground/40">LVL</p>
            <p className="text-sm font-bold text-white">{pet.level}<span className="text-[10px] text-muted-foreground/30">/{pet.maxLevel}</span></p>
          </div>
          <div className="flex-1 rounded-lg bg-white/5 border border-white/5 p-2 text-center">
            <p className="text-[10px] font-mono text-muted-foreground/40">PWR</p>
            <p className={cn("text-sm font-bold", rm.color)}>{pet.power.toLocaleString("vi-VN")}</p>
          </div>
        </div>

        {/* Element + Status */}
        <div className="flex gap-2 mb-3">
          <div className={cn("flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-white/10", em.color, em.bg)}>
            {em.label}
          </div>
          <div className={cn("flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-white/10", sm.color)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", sm.dot)} />
            {sm.label}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-1.5">
          {[
            { label: "ATK", value: pet.attack, icon: Zap,    color: "bg-red-400" },
            { label: "DEF", value: pet.defense, icon: Shield, color: "bg-blue-400" },
            { label: "HP",  value: pet.hp,      icon: Heart,  color: "bg-emerald-400" },
            { label: "SPD", value: pet.speed,   icon: Wind,   color: "bg-cyan-400" },
          ].map(s => (
            <div key={s.label}>
              <div className="flex justify-between text-[9px] font-mono text-muted-foreground/40 mb-0.5">
                <span>{s.label}</span><span>{s.value.toLocaleString("vi-VN")}</span>
              </div>
              <StatBar value={s.value} max={1000} color={s.color} />
            </div>
          ))}
        </div>

        <p className="text-[9px] font-mono text-muted-foreground/30 mt-2">Nhận: {new Date(pet.createdAt).toLocaleDateString("vi-VN")}</p>
      </div>
    </motion.div>
  );
}

export default function Pets() {
  const { pets } = useInventory();
  const [search, setSearch] = useState("");
  const [filterRarity, setFilterRarity] = useState<"all" | Rarity>("all");
  const [filterElement, setFilterElement] = useState<"all" | PetElement>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | PetStatus>("all");

  const filtered = useMemo(() => pets.filter(p => {
    if (filterRarity !== "all" && p.rarity !== filterRarity) return false;
    if (filterElement !== "all" && p.element !== filterElement) return false;
    if (filterStatus !== "all" && p.petStatus !== filterStatus) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.species.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [search, filterRarity, filterElement, filterStatus]);

  const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={cn("px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all",
      active ? "bg-purple-400/20 border-purple-400/40 text-purple-400" : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20")}>
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
          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
              <span className="w-2 h-6 bg-purple-400 rounded-sm shadow-[0_0_10px_rgba(192,132,252,0.6)]" />
              Thú cưng
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">{filtered.length} / {pets.length} THÚ CƯNG</p>
          </div>

          {/* Filters */}
          <div className="glass-panel rounded-xl border border-white/5 p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc loài..."
                className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-purple-400/40 font-mono" />
            </div>
            <div className="flex flex-wrap gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground/30 mt-0.5" />
              {(["all", "common", "rare", "epic", "legendary"] as const).map(r => (
                <Chip key={r} label={r === "all" ? "Tất cả" : RARITY_META[r as Rarity]?.label ?? r} active={filterRarity === r} onClick={() => setFilterRarity(r)} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "fire", "water", "earth", "air", "lightning", "dark", "light"] as const).map(e => (
                <Chip key={e} label={e === "all" ? "Mọi nguyên tố" : ELEMENT_META[e as PetElement]?.label ?? e} active={filterElement === e} onClick={() => setFilterElement(e)} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "active", "resting", "training", "battle"] as const).map(s => (
                <Chip key={s} label={s === "all" ? "Mọi trạng thái" : PET_STATUS_META[s as PetStatus]?.label ?? s} active={filterStatus === s} onClick={() => setFilterStatus(s)} />
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="glass-panel rounded-xl border border-white/5 p-12 text-center text-muted-foreground/30 text-xs font-mono tracking-widest">
              KHÔNG TÌM THẤY THÚ CƯNG PHÙ HỢP
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p, i) => <PetCard key={p.id} pet={p} index={i} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
