import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  RARITY_META, ASSET_TYPE_META, ASSET_STATUS_META,
  type Rarity, type AssetType, type AssetStatus,
} from "@/lib/inventoryMockData";
import { useInventory } from "@/context/InventoryContext";
import type { WorldAsset } from "@/types/inventory";
import { cn } from "@/lib/utils";
import { Search, MapPin, TrendingUp, Coins } from "lucide-react";

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-emerald-500/5 rounded-full blur-[100px]" />
  </div>
);

function AssetCard({ asset, index }: { asset: WorldAsset; index: number }) {
  const rm = RARITY_META[asset.rarity];
  const tm = ASSET_TYPE_META[asset.assetType];
  const sm = ASSET_STATUS_META[asset.assetStatus];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.06, 0.4) }}
      className={cn("glass-panel rounded-2xl border p-5 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300", rm.border, rm.glow)}>
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl", rm.bg)} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center text-2xl flex-shrink-0", rm.bg, rm.border)}>
            {asset.image}
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded border", rm.color, rm.bg, rm.border)}>{rm.label}</div>
            <div className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-white/10", sm.color, sm.bg)}>{sm.label}</div>
          </div>
        </div>

        <p className="text-sm font-bold text-white mb-0.5">{asset.name}</p>
        <div className={cn("inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-white/10 mb-3", tm.color)}>
          {tm.icon} {tm.label}
        </div>

        <p className="text-[10px] text-muted-foreground/60 mb-3 line-clamp-2">{asset.description}</p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-lg bg-white/5 border border-white/5 p-2">
            <p className="text-[9px] font-mono text-muted-foreground/30">GIÁ TRỊ</p>
            <p className="text-xs font-bold font-mono text-emerald-400">{(asset.value/1000).toFixed(0)}K CR</p>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/5 p-2">
            <p className="text-[9px] font-mono text-muted-foreground/30">DIỆN TÍCH</p>
            <p className="text-xs font-bold font-mono text-white">{asset.size.toLocaleString("vi-VN")} m²</p>
          </div>
        </div>

        {asset.income > 0 && (
          <div className="flex items-center gap-1.5 mb-2 px-2 py-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold text-emerald-400">+{asset.income.toLocaleString("vi-VN")} CR / tuần</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground/30">
          <MapPin className="w-3 h-3" />
          {asset.world} · {asset.coordinates}
        </div>
      </div>
    </motion.div>
  );
}

export default function WorldAssets() {
  const { worldAssets } = useInventory();
  const [search, setSearch] = useState("");
  const [filterRarity, setFilterRarity] = useState<"all" | Rarity>("all");
  const [filterType, setFilterType] = useState<"all" | AssetType>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | AssetStatus>("all");

  const totalValue = worldAssets.reduce((s, a) => s + a.value, 0);
  const weeklyIncome = worldAssets.reduce((s, a) => s + a.income, 0);

  const filtered = useMemo(() => worldAssets.filter(a => {
    if (filterRarity !== "all" && a.rarity !== filterRarity) return false;
    if (filterType !== "all" && a.assetType !== filterType) return false;
    if (filterStatus !== "all" && a.assetStatus !== filterStatus) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.world.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [search, filterRarity, filterType, filterStatus, worldAssets]);

  const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={cn("px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all",
      active ? "bg-emerald-400/20 border-emerald-400/40 text-emerald-400" : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20")}>
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
                <span className="w-2 h-6 bg-emerald-400 rounded-sm shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                Tài sản Thế giới
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">{filtered.length} / {worldAssets.length} TÀI SẢN</p>
            </div>
            <div className="flex gap-3">
              <div className="glass-panel rounded-xl border border-emerald-400/20 px-3 py-2">
                <p className="text-[9px] font-mono text-muted-foreground/30">TỔNG GIÁ TRỊ</p>
                <p className="text-sm font-bold font-mono text-emerald-400">{(totalValue/1000000).toFixed(2)}M CR</p>
              </div>
              <div className="glass-panel rounded-xl border border-blue-400/20 px-3 py-2">
                <p className="text-[9px] font-mono text-muted-foreground/30">THU NHẬP / TUẦN</p>
                <p className="text-sm font-bold font-mono text-blue-400">+{weeklyIncome.toLocaleString("vi-VN")} CR</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl border border-white/5 p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc thế giới..."
                className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-emerald-400/40 font-mono" />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "common", "rare", "epic", "legendary"] as const).map(r => (
                <Chip key={r} label={r === "all" ? "Tất cả" : RARITY_META[r as Rarity]?.label ?? r} active={filterRarity === r} onClick={() => setFilterRarity(r)} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip label="Mọi loại" active={filterType === "all"} onClick={() => setFilterType("all")} />
              {(["land","building","monument","portal","resource"] as AssetType[]).map(t => (
                <Chip key={t} label={ASSET_TYPE_META[t].label} active={filterType === t} onClick={() => setFilterType(t)} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip label="Mọi trạng thái" active={filterStatus === "all"} onClick={() => setFilterStatus("all")} />
              {(["owned","renting","developing","idle"] as AssetStatus[]).map(s => (
                <Chip key={s} label={ASSET_STATUS_META[s].label} active={filterStatus === s} onClick={() => setFilterStatus(s)} />
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="glass-panel rounded-xl border border-white/5 p-12 text-center text-muted-foreground/30 text-xs font-mono tracking-widest">
              KHÔNG TÌM THẤY TÀI SẢN PHÙ HỢP
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((a, i) => <AssetCard key={a.id} asset={a} index={i} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
