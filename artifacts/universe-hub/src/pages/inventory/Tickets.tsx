import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  RARITY_META, TICKET_TYPE_META, TICKET_STATUS_META,
  type Rarity, type TicketType, type TicketStatus,
} from "@/lib/inventoryMockData";
import { useInventory } from "@/context/InventoryContext";
import type { Ticket } from "@/types/inventory";
import { cn } from "@/lib/utils";
import { Search, MapPin, Clock, CheckCircle2, XCircle, Sparkles } from "lucide-react";

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/8 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-amber-500/5 rounded-full blur-[100px]" />
  </div>
);

function TicketCard({ ticket, index }: { ticket: Ticket; index: number }) {
  const rm = RARITY_META[ticket.rarity];
  const tm = TICKET_TYPE_META[ticket.ticketType];
  const sm = TICKET_STATUS_META[ticket.ticketValidity];

  const StatusIcon = ticket.ticketValidity === "valid" ? CheckCircle2 : ticket.ticketValidity === "used" ? Clock : XCircle;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.07, 0.4) }}
      className={cn("glass-panel rounded-2xl border relative overflow-hidden group hover:-translate-y-1 transition-all duration-300", rm.border, rm.glow, ticket.ticketValidity !== "valid" && "opacity-60")}>
      {/* Top stripe */}
      <div className={cn("h-1.5 w-full", ticket.rarity === "legendary" ? "bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" : ticket.rarity === "epic" ? "bg-purple-500" : ticket.rarity === "rare" ? "bg-blue-500" : "bg-gray-500")} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="text-3xl">{ticket.image}</div>
          <div className="flex flex-col items-end gap-1">
            <div className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded border", rm.color, rm.bg, rm.border)}>{rm.label}</div>
            <div className={cn("flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded border", sm.color, sm.bg, sm.border)}>
              <StatusIcon className="w-2.5 h-2.5" />
              {sm.label}
            </div>
          </div>
        </div>

        <p className="text-sm font-bold text-white mb-1">{ticket.name}</p>
        <p className="text-[10px] text-muted-foreground/50 mb-3">{ticket.event}</p>

        <div className={cn("inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded border mb-3", tm.color, tm.bg, tm.border)}>
          {tm.label}
        </div>

        {/* Dashed divider */}
        <div className="border-t border-dashed border-white/10 my-3" />

        <div className="grid grid-cols-2 gap-y-2 text-[10px] font-mono mb-3">
          <div>
            <p className="text-muted-foreground/30">NGÀY</p>
            <p className="text-white/80 font-bold">{ticket.date}</p>
          </div>
          <div>
            <p className="text-muted-foreground/30">GIỜ</p>
            <p className="text-white/80 font-bold">{ticket.time}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground/30 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> ĐỊA ĐIỂM</p>
            <p className="text-white/80 font-bold">{ticket.venue}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground/30">CHỖ NGỒI</p>
            <p className="text-white/80 font-bold">{ticket.seatInfo}</p>
          </div>
        </div>

        {/* Perks */}
        {ticket.perks.length > 0 && (
          <div className="space-y-1">
            <p className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest">Đặc quyền</p>
            <div className="flex flex-wrap gap-1">
              {ticket.perks.map(perk => (
                <div key={perk} className="flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground/60">
                  <Sparkles className="w-2 h-2 text-amber-400" />
                  {perk}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Barcode aesthetic */}
        <div className="mt-3 pt-3 border-t border-dashed border-white/10 flex items-center justify-between">
          <div className="flex gap-px">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className="bg-white/20" style={{ width: Math.random() > 0.5 ? 2 : 1, height: 20 }} />
            ))}
          </div>
          <p className="text-[10px] font-mono font-bold text-emerald-400">{ticket.value.toLocaleString("vi-VN")} CR</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Tickets() {
  const { tickets } = useInventory();
  const [search, setSearch] = useState("");
  const [filterRarity, setFilterRarity] = useState<"all" | Rarity>("all");
  const [filterType, setFilterType] = useState<"all" | TicketType>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | TicketStatus>("all");

  const filtered = useMemo(() => tickets.filter(t => {
    if (filterRarity !== "all" && t.rarity !== filterRarity) return false;
    if (filterType !== "all" && t.ticketType !== filterType) return false;
    if (filterStatus !== "all" && t.ticketValidity !== filterStatus) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.event.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [search, filterRarity, filterType, filterStatus, tickets]);

  const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={cn("px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all",
      active ? "bg-amber-400/20 border-amber-400/40 text-amber-400" : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20")}>
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
              <span className="w-2 h-6 bg-amber-400 rounded-sm shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
              Vé
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">{filtered.length} / {tickets.length} VÉ</p>
          </div>

          <div className="glass-panel rounded-xl border border-white/5 p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên vé hoặc sự kiện..."
                className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-amber-400/40 font-mono" />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "common", "rare", "epic", "legendary"] as const).map(r => (
                <Chip key={r} label={r === "all" ? "Tất cả" : RARITY_META[r as Rarity]?.label ?? r} active={filterRarity === r} onClick={() => setFilterRarity(r)} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip label="Mọi loại" active={filterType === "all"} onClick={() => setFilterType("all")} />
              {(["match","concert","tournament","vip","festival"] as TicketType[]).map(t => (
                <Chip key={t} label={TICKET_TYPE_META[t].label} active={filterType === t} onClick={() => setFilterType(t)} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip label="Mọi trạng thái" active={filterStatus === "all"} onClick={() => setFilterStatus("all")} />
              {(["valid","used","expired"] as TicketStatus[]).map(s => (
                <Chip key={s} label={TICKET_STATUS_META[s].label} active={filterStatus === s} onClick={() => setFilterStatus(s)} />
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="glass-panel rounded-xl border border-white/5 p-12 text-center text-muted-foreground/30 text-xs font-mono tracking-widest">
              KHÔNG TÌM THẤY VÉ PHÙ HỢP
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((t, i) => <TicketCard key={t.id} ticket={t} index={i} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
