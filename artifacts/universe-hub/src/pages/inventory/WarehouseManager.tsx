import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  PETS, FOOTBALL_PLAYERS, WORLD_ASSETS, TICKETS, ITEMS,
  RARITY_META,
  type Rarity, type AnyInventoryItem, type ItemStatus,
  type InventoryCategory, STATUS_META,
} from "@/lib/inventoryMockData";
import { CATEGORY_META } from "@/types/inventory";
import { cn } from "@/lib/utils";
import {
  Search, SlidersHorizontal, LayoutGrid, List, X,
  ArrowUpDown, TrendingUp, Package, Calendar,
  ChevronUp, ChevronDown, Eye,
} from "lucide-react";

// ─── Background ───────────────────────────────────────────────────────────────
const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/10 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
    <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-[100px]" />
  </div>
);

// ─── Types ────────────────────────────────────────────────────────────────────
type SortKey = "value" | "quantity" | "date" | "name";
type SortDir = "asc" | "desc";
type ViewMode = "grid" | "table";

// ─── All items merged ─────────────────────────────────────────────────────────
const ALL_ITEMS: AnyInventoryItem[] = [
  ...PETS,
  ...FOOTBALL_PLAYERS,
  ...WORLD_ASSETS,
  ...TICKETS,
  ...ITEMS,
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatValue(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M CR`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K CR`;
  return `${v.toLocaleString("vi-VN")} CR`;
}

function getItemDescription(item: AnyInventoryItem): string {
  if ("description" in item) return item.description as string;
  if ("event" in item) return (item as any).event;
  return "";
}

function getItemSubtitle(item: AnyInventoryItem): string {
  switch (item.category) {
    case "pets":       return `${(item as any).species} • ${(item as any).element}`;
    case "football":   return `${(item as any).position} • ${(item as any).team}`;
    case "world-assets": return `${(item as any).assetType} • ${(item as any).world}`;
    case "tickets":    return `${(item as any).ticketType} • ${(item as any).event}`;
    case "items":      return `${(item as any).itemCategory} • ${(item as any).effect}`;
    default:           return "";
  }
}

function getItemDetail(item: AnyInventoryItem): Record<string, string | number> {
  const base: Record<string, string | number> = {
    "ID": item.id,
    "Độ hiếm": RARITY_META[item.rarity].label,
    "Số lượng": item.quantity,
    "Giá trị": formatValue(item.value),
    "Ngày nhận": new Date(item.createdAt).toLocaleDateString("vi-VN"),
  };
  switch (item.category) {
    case "pets":
      return { ...base, "Loài": (item as any).species, "Nguyên tố": (item as any).element, "Cấp độ": `${(item as any).level}/${(item as any).maxLevel}`, "Sức mạnh": (item as any).power.toLocaleString("vi-VN"), "ATK": (item as any).attack, "DEF": (item as any).defense, "HP": (item as any).hp, "SPD": (item as any).speed, "Trạng thái": (item as any).petStatus };
    case "football":
      return { ...base, "Vị trí": (item as any).position, "Đội": (item as any).team, "Quốc tịch": (item as any).nationality, "Rating": (item as any).rating, "Khả năng đặc biệt": (item as any).specialAbility, "Tốc độ": (item as any).stats.pace, "Dứt điểm": (item as any).stats.shooting, "Chuyền": (item as any).stats.passing, "Rê bóng": (item as any).stats.dribbling };
    case "world-assets":
      return { ...base, "Loại": (item as any).assetType, "Thế giới": (item as any).world, "Tọa độ": (item as any).coordinates, "Diện tích": `${(item as any).size.toLocaleString("vi-VN")} m²`, "Thu nhập/tuần": formatValue((item as any).income), "Trạng thái TS": (item as any).assetStatus };
    case "tickets":
      return { ...base, "Sự kiện": (item as any).event, "Ngày": (item as any).date, "Giờ": (item as any).time, "Địa điểm": (item as any).venue, "Ghế": (item as any).seatInfo, "Hiệu lực": (item as any).ticketValidity };
    case "items":
      return { ...base, "Loại vật phẩm": (item as any).itemCategory, "Hiệu ứng": (item as any).effect, "Sức mạnh": (item as any).power || "–", "Dùng trong": ((item as any).usableIn as string[]).join(", ") };
    default:
      return base;
  }
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────
function Chip({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button onClick={onClick} className={cn(
      "px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all",
      active
        ? color ?? "bg-cyan-400/20 border-cyan-400/40 text-cyan-400"
        : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20"
    )}>
      {label}
    </button>
  );
}

// ─── Sort Button ──────────────────────────────────────────────────────────────
function SortBtn({ label, icon: Icon, sortKey, current, dir, onClick }: {
  label: string; icon: typeof TrendingUp; sortKey: SortKey;
  current: SortKey; dir: SortDir; onClick: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <button onClick={() => onClick(sortKey)} className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase tracking-widest transition-all",
      active ? "bg-cyan-400/15 border-cyan-400/30 text-cyan-400" : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20"
    )}>
      <Icon className="w-3 h-3" />
      {label}
      {active && (dir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
    </button>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────
function GridCard({ item, index, onSelect }: { item: AnyInventoryItem; index: number; onSelect: (i: AnyInventoryItem) => void }) {
  const rm = RARITY_META[item.rarity];
  const cm = CATEGORY_META[item.category];
  const sm = STATUS_META[item.status as ItemStatus] ?? STATUS_META.active;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.35) }}
      onClick={() => onSelect(item)}
      className={cn(
        "glass-panel rounded-2xl border p-4 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 cursor-pointer",
        rm.border, rm.glow
      )}
    >
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl", rm.bg)} />
      <div className="relative z-10 flex flex-col h-full">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center text-2xl flex-shrink-0", rm.bg, rm.border)}>
            {item.image}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border", rm.color, rm.bg, rm.border)}>
              {rm.label}
            </span>
            <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/10", cm.color)}>
              {cm.icon} {cm.label}
            </span>
          </div>
        </div>

        {/* Name */}
        <p className="text-xs font-bold text-white leading-tight mb-1 line-clamp-2">{item.name}</p>
        <p className="text-[9px] font-mono text-muted-foreground/40 mb-3 line-clamp-1">{getItemSubtitle(item)}</p>

        {/* Stats row */}
        <div className="flex gap-2 mt-auto">
          <div className="flex-1 bg-white/5 border border-white/5 rounded-lg p-2 text-center">
            <p className="text-[8px] font-mono text-muted-foreground/30 uppercase">Giá trị</p>
            <p className={cn("text-[10px] font-bold mt-0.5", rm.color)}>{formatValue(item.value)}</p>
          </div>
          <div className="flex-1 bg-white/5 border border-white/5 rounded-lg p-2 text-center">
            <p className="text-[8px] font-mono text-muted-foreground/30 uppercase">Số lượng</p>
            <p className="text-[10px] font-bold text-white mt-0.5">×{item.quantity}</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between mt-2">
          <div className={cn("flex items-center gap-1 text-[8px] font-mono px-1.5 py-0.5 rounded border border-white/10", sm.color)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", sm.dot)} />
            {sm.label}
          </div>
          <div className="flex items-center gap-1 text-[8px] font-mono text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye className="w-3 h-3" /> Chi tiết
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────
function TableRow({ item, index, onSelect }: { item: AnyInventoryItem; index: number; onSelect: (i: AnyInventoryItem) => void }) {
  const rm = RARITY_META[item.rarity];
  const cm = CATEGORY_META[item.category];
  const sm = STATUS_META[item.status as ItemStatus] ?? STATUS_META.active;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.25) }}
      onClick={() => onSelect(item)}
      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center text-lg flex-shrink-0", rm.bg, rm.border)}>
            {item.image}
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{item.name}</p>
            <p className="text-[9px] font-mono text-muted-foreground/40 line-clamp-1">{getItemSubtitle(item)}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-3">
        <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/10", cm.color)}>
          {cm.icon} {cm.label}
        </span>
      </td>
      <td className="py-3 px-3">
        <span className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border", rm.color, rm.bg, rm.border)}>
          {rm.label}
        </span>
      </td>
      <td className="py-3 px-3 text-right">
        <span className={cn("text-xs font-bold", rm.color)}>{formatValue(item.value)}</span>
      </td>
      <td className="py-3 px-3 text-center">
        <span className="text-xs font-mono text-white">×{item.quantity}</span>
      </td>
      <td className="py-3 px-3">
        <div className={cn("inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/10", sm.color)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", sm.dot)} />
          {sm.label}
        </div>
      </td>
      <td className="py-3 px-3 text-right">
        <span className="text-[9px] font-mono text-muted-foreground/40">
          {new Date(item.createdAt).toLocaleDateString("vi-VN")}
        </span>
      </td>
      <td className="py-3 px-3 text-center">
        <Eye className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-cyan-400 transition-colors mx-auto" />
      </td>
    </motion.tr>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ item, onClose }: { item: AnyInventoryItem; onClose: () => void }) {
  const rm = RARITY_META[item.rarity];
  const cm = CATEGORY_META[item.category];
  const sm = STATUS_META[item.status as ItemStatus] ?? STATUS_META.active;
  const details = getItemDetail(item);
  const description = getItemDescription(item);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className={cn("glass-panel rounded-2xl border w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col", rm.border, rm.glow)}
      >
        {/* Modal header */}
        <div className={cn("relative p-5 border-b border-white/5", rm.bg)}>
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg border border-white/10 hover:border-white/30 text-muted-foreground/50 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-4 pr-10">
            <div className={cn("w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl flex-shrink-0", rm.bg, rm.border)}>
              {item.image}
            </div>
            <div className="min-w-0">
              <p className={cn("text-[9px] font-mono font-bold uppercase tracking-widest mb-1", rm.color)}>
                {rm.label} • {cm.label}
              </p>
              <h2 className="text-base font-bold text-white leading-tight mb-1">{item.name}</h2>
              <p className="text-[9px] font-mono text-muted-foreground/50 line-clamp-1">{getItemSubtitle(item)}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className={cn("flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/10", sm.color)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", sm.dot)} />
                  {sm.label}
                </div>
                <span className={cn("text-xs font-bold", rm.color)}>{formatValue(item.value)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="px-5 py-3 border-b border-white/5">
            <p className="text-[10px] font-mono text-muted-foreground/60 italic leading-relaxed">{description}</p>
          </div>
        )}

        {/* Details */}
        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest mb-3">Thông tin chi tiết</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(details).map(([key, val]) => (
              <div key={key} className="bg-white/5 border border-white/5 rounded-lg p-2.5">
                <p className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-0.5">{key}</p>
                <p className="text-[10px] font-mono text-white font-bold truncate" title={String(val)}>{String(val)}</p>
              </div>
            ))}
          </div>

          {/* Perks for tickets */}
          {"perks" in item && Array.isArray((item as any).perks) && (item as any).perks.length > 0 && (
            <div className="mt-4">
              <p className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest mb-2">Quyền lợi</p>
              <div className="flex flex-wrap gap-1.5">
                {((item as any).perks as string[]).map((perk: string) => (
                  <span key={perk} className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20 text-cyan-400">
                    {perk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* UsableIn for items */}
          {"usableIn" in item && Array.isArray((item as any).usableIn) && (
            <div className="mt-4">
              <p className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest mb-2">Dùng trong</p>
              <div className="flex flex-wrap gap-1.5">
                {((item as any).usableIn as string[]).map((u: string) => (
                  <span key={u} className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-400/10 border border-purple-400/20 text-purple-400">
                    {u}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WarehouseManager() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | InventoryCategory>("all");
  const [filterRarity, setFilterRarity] = useState<"all" | Rarity>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | ItemStatus>("all");
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedItem, setSelectedItem] = useState<AnyInventoryItem | null>(null);

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }, [sortKey]);

  const filtered = useMemo(() => {
    let items = ALL_ITEMS.filter(item => {
      if (filterCategory !== "all" && item.category !== filterCategory) return false;
      if (filterRarity !== "all" && item.rarity !== filterRarity) return false;
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        const name = item.name.toLowerCase();
        const sub = getItemSubtitle(item).toLowerCase();
        const desc = getItemDescription(item).toLowerCase();
        if (!name.includes(q) && !sub.includes(q) && !desc.includes(q) && !item.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    items.sort((a, b) => {
      let diff = 0;
      if (sortKey === "value")    diff = a.value - b.value;
      if (sortKey === "quantity") diff = a.quantity - b.quantity;
      if (sortKey === "date")     diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortKey === "name")     diff = a.name.localeCompare(b.name, "vi");
      return sortDir === "asc" ? diff : -diff;
    });

    return items;
  }, [search, filterCategory, filterRarity, filterStatus, sortKey, sortDir]);

  const totalValue = useMemo(() => filtered.reduce((s, i) => s + i.value * i.quantity, 0), [filtered]);

  const categories: Array<{ key: "all" | InventoryCategory; label: string }> = [
    { key: "all", label: "Tất cả" },
    { key: "pets", label: "🐾 Thú cưng" },
    { key: "football", label: "⚽ Cầu thủ" },
    { key: "world-assets", label: "🌍 Tài sản TG" },
    { key: "tickets", label: "🎫 Vé" },
    { key: "items", label: "🎒 Vật phẩm" },
  ];

  const statuses: Array<{ key: "all" | ItemStatus; label: string }> = [
    { key: "all", label: "Tất cả" },
    { key: "active", label: "Hoạt động" },
    { key: "equipped", label: "Đang trang bị" },
    { key: "trading", label: "Giao dịch" },
    { key: "inactive", label: "Không hoạt động" },
    { key: "locked", label: "Khóa" },
    { key: "used", label: "Đã dùng" },
    { key: "expired", label: "Hết hạn" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <BG />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">

          {/* Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-2 h-6 bg-cyan-400 rounded-sm shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
                Trình quản lý Kho hàng
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">
                {filtered.length} / {ALL_ITEMS.length} VẬT PHẨM &nbsp;•&nbsp; TỔNG GIÁ TRỊ {formatValue(totalValue)}
              </p>
            </div>
            {/* View toggle */}
            <div className="flex items-center gap-1 glass-panel border border-white/5 rounded-lg p-1">
              <button onClick={() => setViewMode("grid")} className={cn("p-2 rounded-md transition-all", viewMode === "grid" ? "bg-cyan-400/20 text-cyan-400" : "text-muted-foreground/40 hover:text-white")}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("table")} className={cn("p-2 rounded-md transition-all", viewMode === "table" ? "bg-cyan-400/20 text-cyan-400" : "text-muted-foreground/40 hover:text-white")}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          <div className="glass-panel rounded-xl border border-white/5 p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên, loại, mô tả..."
                className="w-full pl-8 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-cyan-400/40 font-mono"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
              <span className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest">Danh mục:</span>
              {categories.map(c => (
                <Chip key={c.key} label={c.label} active={filterCategory === c.key} onClick={() => setFilterCategory(c.key)} />
              ))}
            </div>

            {/* Rarity filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest ml-5">Độ hiếm:</span>
              <Chip label="Tất cả" active={filterRarity === "all"} onClick={() => setFilterRarity("all")} />
              {(["common", "rare", "epic", "legendary", "mythic"] as Rarity[]).map(r => (
                <Chip key={r} label={RARITY_META[r].label} active={filterRarity === r} onClick={() => setFilterRarity(r)}
                  color={cn(RARITY_META[r].bg, RARITY_META[r].border, RARITY_META[r].color, "border")} />
              ))}
            </div>

            {/* Status filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest ml-5">Trạng thái:</span>
              {statuses.map(s => (
                <Chip key={s.key} label={s.label} active={filterStatus === s.key} onClick={() => setFilterStatus(s.key)} />
              ))}
            </div>

            {/* Sort */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
              <span className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest">Sắp xếp:</span>
              <SortBtn label="Giá trị" icon={TrendingUp} sortKey="value" current={sortKey} dir={sortDir} onClick={handleSort} />
              <SortBtn label="Số lượng" icon={Package} sortKey="quantity" current={sortKey} dir={sortDir} onClick={handleSort} />
              <SortBtn label="Ngày nhận" icon={Calendar} sortKey="date" current={sortKey} dir={sortDir} onClick={handleSort} />
              <SortBtn label="Tên" icon={ArrowUpDown} sortKey="name" current={sortKey} dir={sortDir} onClick={handleSort} />
            </div>
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="glass-panel rounded-xl border border-white/5 p-16 text-center">
              <p className="text-xs font-mono text-muted-foreground/30 tracking-widest">KHÔNG TÌM THẤY VẬT PHẨM PHÙ HỢP</p>
              <button onClick={() => { setSearch(""); setFilterCategory("all"); setFilterRarity("all"); setFilterStatus("all"); }}
                className="mt-4 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 border border-cyan-400/20 hover:border-cyan-400/40 px-3 py-1.5 rounded-lg transition-all">
                XÓA BỘ LỌC
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filtered.map((item, i) => (
                <GridCard key={item.id} item={item} index={i} onSelect={setSelectedItem} />
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="py-3 px-4 text-left text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">Vật phẩm</th>
                      <th className="py-3 px-3 text-left text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">Danh mục</th>
                      <th className="py-3 px-3 text-left text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">Độ hiếm</th>
                      <th className="py-3 px-3 text-right text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">Giá trị</th>
                      <th className="py-3 px-3 text-center text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">SL</th>
                      <th className="py-3 px-3 text-left text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">Trạng thái</th>
                      <th className="py-3 px-3 text-right text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">Ngày nhận</th>
                      <th className="py-3 px-3 text-center text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item, i) => (
                      <TableRow key={item.id} item={item} index={i} onSelect={setSelectedItem} />
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Table footer */}
              <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
                <p className="text-[9px] font-mono text-muted-foreground/30">{filtered.length} VẬT PHẨM</p>
                <p className="text-[9px] font-mono text-cyan-400">TỔNG: {formatValue(totalValue)}</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
