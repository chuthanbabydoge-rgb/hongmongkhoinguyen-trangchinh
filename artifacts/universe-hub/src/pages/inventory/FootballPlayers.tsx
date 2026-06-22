import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  FOOTBALL_PLAYERS, RARITY_META, POSITION_META,
  type Rarity, type Position,
} from "@/lib/inventoryMockData";
import { cn } from "@/lib/utils";
import { Search, Star } from "lucide-react";

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px]" />
  </div>
);

const STAT_KEYS: { key: keyof typeof FOOTBALL_PLAYERS[0]["stats"]; label: string; color: string }[] = [
  { key: "pace",      label: "TĐ",  color: "bg-cyan-400" },
  { key: "shooting",  label: "SÚT", color: "bg-red-400" },
  { key: "passing",   label: "PAS", color: "bg-blue-400" },
  { key: "dribbling", label: "DRI", color: "bg-amber-400" },
  { key: "defending", label: "DEF", color: "bg-emerald-400" },
  { key: "physical",  label: "PHY", color: "bg-purple-400" },
];

function PlayerCard({ player, index }: { player: typeof FOOTBALL_PLAYERS[0]; index: number }) {
  const rm = RARITY_META[player.rarity];
  const pm = POSITION_META[player.position];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.05, 0.4) }}
      className={cn("glass-panel rounded-2xl border p-4 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300", rm.border, rm.glow)}>
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl", rm.bg)} />
      <div className="relative z-10">
        {/* Top */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("text-[10px] font-mono font-bold px-2 py-0.5 rounded", pm.color, pm.bg)}>{player.position}</div>
              <span className="text-[10px] font-mono text-muted-foreground/40">{player.flag} {player.nationality}</span>
            </div>
            <p className="text-sm font-bold text-white">{player.name}</p>
            <p className="text-[10px] font-mono text-muted-foreground/40">{player.team}</p>
          </div>
          <div className="text-right">
            <div className={cn("text-2xl font-bold", rm.color)}>{player.rating}</div>
            <div className={cn("text-[9px] font-mono font-bold", rm.color)}>{rm.label}</div>
          </div>
        </div>

        {/* Special ability */}
        <div className="mb-3 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
          <p className="text-[9px] font-mono text-muted-foreground/40">KỸ NĂNG ĐẶC BIỆT</p>
          <p className="text-[10px] font-mono font-bold text-amber-400">{player.specialAbility}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {STAT_KEYS.map(s => (
            <div key={s.key}>
              <div className="flex justify-between text-[9px] font-mono text-muted-foreground/40 mb-0.5">
                <span>{s.label}</span><span className="tabular-nums">{player.stats[s.key]}</span>
              </div>
              <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${player.stats[s.key]}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.03 }}
                  className={cn("h-full rounded-full", s.color)} />
              </div>
            </div>
          ))}
        </div>

        {/* Value + Level */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
          <div className="flex-1 text-center">
            <p className="text-[9px] font-mono text-muted-foreground/30">GIÁ TRỊ</p>
            <p className="text-xs font-bold font-mono text-emerald-400">{(player.value/1000).toFixed(0)}K CR</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-[9px] font-mono text-muted-foreground/30">CẤP ĐỘ</p>
            <p className="text-xs font-bold font-mono text-white">{player.level}/10</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-[9px] font-mono text-muted-foreground/30">NGÀY</p>
            <p className="text-[9px] font-mono text-muted-foreground/40">{player.acquiredAt}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FootballPlayers() {
  const [search, setSearch] = useState("");
  const [filterRarity, setFilterRarity] = useState<"all" | Rarity>("all");
  const [filterPos, setFilterPos] = useState<"all" | Position>("all");

  const POSITIONS: Position[] = ["GK","CB","LB","RB","CDM","CM","CAM","LW","RW","ST"];

  const filtered = useMemo(() => FOOTBALL_PLAYERS.filter(p => {
    if (filterRarity !== "all" && p.rarity !== filterRarity) return false;
    if (filterPos !== "all" && p.position !== filterPos) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.team.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [search, filterRarity, filterPos]);

  const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={cn("px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all",
      active ? "bg-blue-400/20 border-blue-400/40 text-blue-400" : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20")}>
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
              <span className="w-2 h-6 bg-blue-400 rounded-sm shadow-[0_0_10px_rgba(96,165,250,0.6)]" />
              Cầu thủ bóng đá
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">{filtered.length} / {FOOTBALL_PLAYERS.length} CẦU THỦ</p>
          </div>

          <div className="glass-panel rounded-xl border border-white/5 p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc đội..."
                className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-blue-400/40 font-mono" />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "common", "uncommon", "rare", "epic", "legendary"] as const).map(r => (
                <Chip key={r} label={r === "all" ? "Tất cả độ hiếm" : RARITY_META[r as Rarity]?.label ?? r} active={filterRarity === r} onClick={() => setFilterRarity(r)} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip label="Tất cả vị trí" active={filterPos === "all"} onClick={() => setFilterPos("all")} />
              {POSITIONS.map(pos => (
                <Chip key={pos} label={pos} active={filterPos === pos} onClick={() => setFilterPos(pos)} />
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="glass-panel rounded-xl border border-white/5 p-12 text-center text-muted-foreground/30 text-xs font-mono tracking-widest">
              KHÔNG TÌM THẤY CẦU THỦ PHÙ HỢP
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p, i) => <PlayerCard key={p.id} player={p} index={i} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
