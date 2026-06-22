import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  LISTINGS, RARITY_COLORS, RARITY_LABELS, CATEGORY_META_MARKET,
  type Listing, type MarketRarity, type ListingCategory, type ListingStatus,
} from "@/lib/marketplaceMockData";
import { cn } from "@/lib/utils";
import {
  Search, SlidersHorizontal, LayoutGrid, List, X, Heart, Eye,
  ArrowUpDown, ChevronUp, ChevronDown, Tag, ShoppingCart, Star,
  TrendingDown, Clock,
} from "lucide-react";

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-900/8 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
  </div>
);

const fmtCR = (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M CR` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K CR` : `${v} CR`;
type SortKey = "price_asc" | "price_desc" | "views" | "favorites" | "date" | "discount";

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function ListingDetail({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const rc = RARITY_COLORS[listing.rarity];
  const cm = CATEGORY_META_MARKET[listing.category];
  const discount = Math.round((1 - listing.price / listing.originalValue) * 100);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className={cn("glass-panel rounded-2xl border w-full max-w-md overflow-hidden", rc.border, rc.glow)}>
        <div className={cn("p-5 border-b border-white/5 relative", rc.bg)}>
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg border border-white/10 hover:border-white/30 text-muted-foreground/50 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-4 pr-8">
            <div className={cn("w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl flex-shrink-0", rc.bg, rc.border)}>{listing.image}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border", rc.text, rc.bg, rc.border)}>{RARITY_LABELS[listing.rarity]}</span>
                <span className={cn("text-[9px] font-mono", cm.color)}>{cm.icon} {cm.label}</span>
              </div>
              <h2 className="text-sm font-bold text-white leading-tight">{listing.name}</h2>
              <p className="text-[9px] font-mono text-muted-foreground/40 mt-1">ID: {listing.id} · Người bán: {listing.seller}</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-[10px] font-mono text-muted-foreground/60 italic">{listing.description}</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Giá bán", value: fmtCR(listing.price), color: rc.text },
              { label: "Giá gốc", value: fmtCR(listing.originalValue), color: "text-muted-foreground/60" },
              { label: "Giảm giá", value: discount > 0 ? `-${discount}%` : "–", color: "text-emerald-400" },
              { label: "Số lượng", value: `×${listing.quantity}`, color: "text-white" },
              { label: "Lượt xem", value: listing.views.toLocaleString("vi-VN"), color: "text-muted-foreground/60" },
              { label: "Yêu thích", value: String(listing.favorites), color: "text-red-400" },
            ].map(row => (
              <div key={row.label} className="bg-white/5 border border-white/5 rounded-lg p-2.5">
                <p className="text-[8px] font-mono text-muted-foreground/30 uppercase tracking-widest mb-0.5">{row.label}</p>
                <p className={cn("text-[10px] font-mono font-bold", row.color)}>{row.value}</p>
              </div>
            ))}
          </div>
          {listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {listing.tags.map(t => <span key={t} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground/50">{t}</span>)}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button className={cn("flex-1 py-2.5 rounded-xl font-bold text-xs font-mono uppercase tracking-widest transition-all border", rc.border, rc.bg, rc.text, "hover:brightness-110")}>
              <ShoppingCart className="w-3.5 h-3.5 inline mr-1.5" />Mua ngay
            </button>
            <button className="px-3 py-2.5 rounded-xl border border-white/10 hover:border-red-400/30 text-muted-foreground/50 hover:text-red-400 transition-all">
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Listing Grid Card ────────────────────────────────────────────────────────
function GridCard({ listing, onSelect }: { listing: Listing; onSelect: () => void }) {
  const rc = RARITY_COLORS[listing.rarity];
  const cm = CATEGORY_META_MARKET[listing.category];
  const discount = Math.round((1 - listing.price / listing.originalValue) * 100);
  const statusColor = listing.status === "active" ? "text-emerald-400" : listing.status === "sold" ? "text-gray-400" : "text-red-400";
  const statusLabel = listing.status === "active" ? "Đang bán" : listing.status === "sold" ? "Đã bán" : "Hết hạn";
  return (
    <motion.div onClick={onSelect} className={cn("glass-panel rounded-2xl border p-4 flex flex-col gap-3 group hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden", rc.border, listing.status === "active" ? rc.glow : "opacity-60")}>
      {listing.status !== "active" && <div className="absolute inset-0 bg-black/40 z-20 rounded-2xl flex items-center justify-center"><span className={cn("text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-black/60 border", statusColor)}>{statusLabel}</span></div>}
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl", rc.bg)} />
      <div className="relative z-10 flex flex-col gap-3 h-full">
        <div className="flex items-start justify-between">
          <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center text-2xl", rc.bg, rc.border)}>{listing.image}</div>
          <div className="flex flex-col items-end gap-1">
            <span className={cn("text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border", rc.text, rc.bg, rc.border)}>{RARITY_LABELS[listing.rarity]}</span>
            {discount > 0 && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-400/15 border border-emerald-400/20 text-emerald-400 font-bold"><TrendingDown className="w-2.5 h-2.5 inline mr-0.5" />-{discount}%</span>}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-white line-clamp-2 leading-tight">{listing.name}</p>
          <p className={cn("text-[9px] font-mono mt-0.5", cm.color)}>{cm.icon} {cm.label}</p>
        </div>
        <div className="mt-auto">
          <p className={cn("text-sm font-bold font-mono", rc.text)}>{fmtCR(listing.price)}</p>
          {discount > 0 && <p className="text-[9px] font-mono text-muted-foreground/30 line-through">{fmtCR(listing.originalValue)}</p>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground/40">
            <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{listing.views >= 1000 ? `${(listing.views/1000).toFixed(1)}K` : listing.views}</span>
            <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" />{listing.favorites}</span>
          </div>
          <span className="text-[8px] font-mono text-muted-foreground/30">{listing.seller}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────
function TableRow({ listing, onSelect }: { listing: Listing; onSelect: () => void }) {
  const rc = RARITY_COLORS[listing.rarity];
  const cm = CATEGORY_META_MARKET[listing.category];
  const discount = Math.round((1 - listing.price / listing.originalValue) * 100);
  const statusColor = { active: "text-emerald-400", sold: "text-gray-400", expired: "text-red-400", cancelled: "text-red-500" }[listing.status];
  const statusLabel = { active: "Đang bán", sold: "Đã bán", expired: "Hết hạn", cancelled: "Đã huỷ" }[listing.status];
  return (
    <tr onClick={onSelect} className="border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer group">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center text-lg flex-shrink-0", rc.bg, rc.border)}>{listing.image}</div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{listing.name}</p>
            <p className={cn("text-[9px] font-mono", cm.color)}>{cm.icon} {cm.label}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-3"><span className={cn("text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border", rc.text, rc.bg, rc.border)}>{RARITY_LABELS[listing.rarity]}</span></td>
      <td className="py-3 px-3 text-right"><span className={cn("text-xs font-bold font-mono", rc.text)}>{fmtCR(listing.price)}</span></td>
      <td className="py-3 px-3 text-right"><span className="text-[9px] font-mono text-muted-foreground/30 line-through">{fmtCR(listing.originalValue)}</span></td>
      <td className="py-3 px-3 text-center">{discount > 0 ? <span className="text-[9px] font-mono text-emerald-400 font-bold">-{discount}%</span> : <span className="text-muted-foreground/20">–</span>}</td>
      <td className="py-3 px-3 text-center text-[10px] font-mono text-white/60">×{listing.quantity}</td>
      <td className="py-3 px-3 text-center"><div className="flex items-center justify-center gap-2 text-[9px] font-mono text-muted-foreground/40"><Eye className="w-2.5 h-2.5" />{listing.views >= 1000 ? `${(listing.views/1000).toFixed(1)}K` : listing.views}</div></td>
      <td className="py-3 px-3"><span className={cn("text-[9px] font-mono font-bold", statusColor)}>{statusLabel}</span></td>
      <td className="py-3 px-3 text-[9px] font-mono text-muted-foreground/30">{listing.seller}</td>
    </tr>
  );
}

export default function Listings() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<"all" | ListingCategory>("all");
  const [rarity, setRarity] = useState<"all" | MarketRarity>("all");
  const [status, setStatus] = useState<"all" | ListingStatus>("all");
  const [sort, setSort] = useState<SortKey>("views");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [selected, setSelected] = useState<Listing | null>(null);

  const filtered = useMemo(() => {
    let items = LISTINGS.filter(l => {
      if (cat !== "all" && l.category !== cat) return false;
      if (rarity !== "all" && l.rarity !== rarity) return false;
      if (status !== "all" && l.status !== status) return false;
      if (search) { const q = search.toLowerCase(); if (!l.name.toLowerCase().includes(q) && !l.seller.toLowerCase().includes(q) && !l.description.toLowerCase().includes(q)) return false; }
      return true;
    });
    items.sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "views") return b.views - a.views;
      if (sort === "favorites") return b.favorites - a.favorites;
      if (sort === "date") return new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime();
      if (sort === "discount") return (b.originalValue - b.price) / b.originalValue - (a.originalValue - a.price) / a.originalValue;
      return 0;
    });
    return items;
  }, [search, cat, rarity, status, sort]);

  const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={cn("px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all", active ? "bg-emerald-400/20 border-emerald-400/40 text-emerald-400" : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20")}>{label}</button>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <BG />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-2 h-6 bg-emerald-400 rounded-sm shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                Danh sách sản phẩm
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">{filtered.length} / {LISTINGS.length} SẢN PHẨM</p>
            </div>
            <div className="flex items-center gap-1 glass-panel border border-white/5 rounded-lg p-1">
              <button onClick={() => setView("grid")} className={cn("p-2 rounded-md transition-all", view === "grid" ? "bg-emerald-400/20 text-emerald-400" : "text-muted-foreground/40 hover:text-white")}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setView("table")} className={cn("p-2 rounded-md transition-all", view === "table" ? "bg-emerald-400/20 text-emerald-400" : "text-muted-foreground/40 hover:text-white")}><List className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="glass-panel rounded-xl border border-white/5 p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, người bán, mô tả..."
                className="w-full pl-8 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-emerald-400/40 font-mono" />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-white"><X className="w-3.5 h-3.5" /></button>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground/30" />
              <span className="text-[9px] font-mono text-muted-foreground/30 uppercase">Danh mục:</span>
              <Chip label="Tất cả" active={cat === "all"} onClick={() => setCat("all")} />
              {(["pets","football","world-assets","tickets","items"] as ListingCategory[]).map(c => (
                <Chip key={c} label={CATEGORY_META_MARKET[c].label} active={cat === c} onClick={() => setCat(c)} />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-mono text-muted-foreground/30 uppercase ml-5">Độ hiếm:</span>
              <Chip label="Tất cả" active={rarity === "all"} onClick={() => setRarity("all")} />
              {(["common","rare","epic","legendary","mythic"] as MarketRarity[]).map(r => (
                <Chip key={r} label={RARITY_LABELS[r]} active={rarity === r} onClick={() => setRarity(r)} />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-mono text-muted-foreground/30 uppercase ml-5">Trạng thái:</span>
              {([["all","Tất cả"],["active","Đang bán"],["sold","Đã bán"],["expired","Hết hạn"]] as [string,string][]).map(([k,l]) => (
                <Chip key={k} label={l} active={status === k} onClick={() => setStatus(k as any)} />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/30" />
              <span className="text-[9px] font-mono text-muted-foreground/30 uppercase">Sắp xếp:</span>
              {([["views","Lượt xem"],["favorites","Yêu thích"],["price_desc","Giá cao"],["price_asc","Giá thấp"],["discount","Giảm nhiều"],["date","Mới nhất"]] as [SortKey,string][]).map(([k,l]) => (
                <button key={k} onClick={() => setSort(k)} className={cn("px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all", sort === k ? "bg-emerald-400/20 border-emerald-400/40 text-emerald-400" : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20")}>{l}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="glass-panel rounded-xl border border-white/5 p-16 text-center">
              <p className="text-xs font-mono text-muted-foreground/30 tracking-widest">KHÔNG TÌM THẤY SẢN PHẨM PHÙ HỢP</p>
              <button onClick={() => { setSearch(""); setCat("all"); setRarity("all"); setStatus("all"); }} className="mt-4 text-[10px] font-mono text-emerald-400 hover:text-emerald-300 border border-emerald-400/20 hover:border-emerald-400/40 px-3 py-1.5 rounded-lg transition-all">XÓA BỘ LỌC</button>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filtered.map((l, i) => <GridCard key={l.id} listing={l} onSelect={() => setSelected(l)} />)}
            </div>
          ) : (
            <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-white/10 bg-white/5">
                    {["Sản phẩm","Độ hiếm","Giá bán","Giá gốc","Giảm","SL","Lượt xem","Trạng thái","Người bán"].map(h => (
                      <th key={h} className="py-3 px-3 text-left text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest font-normal first:pl-4">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>{filtered.map(l => <TableRow key={l.id} listing={l} onSelect={() => setSelected(l)} />)}</tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
      <AnimatePresence>{selected && <ListingDetail listing={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </div>
  );
}
