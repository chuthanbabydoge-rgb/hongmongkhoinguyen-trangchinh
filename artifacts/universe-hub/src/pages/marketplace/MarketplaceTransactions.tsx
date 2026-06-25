import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  RARITY_COLORS, RARITY_LABELS,
  CATEGORY_META_MARKET, TX_TYPE_META,
  type ListingCategory, type MarketRarity, type TxType,
} from "@/lib/marketplaceMockData";
import { useMarketplace } from "@/context/MarketplaceContext";
import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal, X, ArrowUpDown, Coins, TrendingUp, ArrowLeftRight } from "lucide-react";

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/8 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
  </div>
);

const fmtCR = (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M CR` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K CR` : `${v.toLocaleString("vi-VN")} CR`;
type SortKey = "date" | "price_desc" | "price_asc";

export default function MarketplaceTransactions() {
  const { transactions } = useMarketplace();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<"all" | ListingCategory>("all");
  const [rarity, setRarity] = useState<"all" | MarketRarity>("all");
  const [txType, setTxType] = useState<"all" | TxType>("all");
  const [sort, setSort] = useState<SortKey>("date");

  const filtered = useMemo(() => {
    let items = transactions.filter(t => {
      if (cat !== "all" && t.category !== cat) return false;
      if (rarity !== "all" && t.rarity !== rarity) return false;
      if (txType !== "all" && t.type !== txType) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.itemName.toLowerCase().includes(q) && !t.buyer.toLowerCase().includes(q) && !t.seller.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    items.sort((a, b) => {
      if (sort === "date") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "price_asc") return a.price - b.price;
      return 0;
    });
    return items;
  }, [search, cat, rarity, txType, sort]);

  const totalVolume = filtered.reduce((s, t) => s + t.price, 0);
  const totalFees = filtered.reduce((s, t) => s + t.fee, 0);

  const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={cn("px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all", active ? "bg-blue-400/20 border-blue-400/40 text-blue-400" : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20")}>{label}</button>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <BG />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">
          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
              <span className="w-2 h-6 bg-blue-400 rounded-sm shadow-[0_0_10px_rgba(96,165,250,0.6)]" />
              Giao dịch
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground/30 mt-1">{filtered.length} / {transactions.length} GIAO DỊCH</p>
          </div>

          {/* Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Giao dịch",      value: String(filtered.length),   color: "text-blue-400",    border: "border-blue-400/20",    icon: ArrowLeftRight },
              { label: "Tổng khối lượng",value: fmtCR(totalVolume),       color: "text-emerald-400", border: "border-emerald-400/20", icon: Coins },
              { label: "Tổng phí",       value: fmtCR(totalFees),          color: "text-amber-400",   border: "border-amber-400/20",   icon: TrendingUp },
              { label: "Giá trị TB",     value: filtered.length > 0 ? fmtCR(Math.round(totalVolume / filtered.length)) : "–", color: "text-purple-400", border: "border-purple-400/20", icon: Coins },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className={cn("glass-panel rounded-2xl border p-4", s.border)}>
                <s.icon className={cn("w-4 h-4 mb-2", s.color)} />
                <p className={cn("text-xl font-bold font-mono", s.color)}>{s.value}</p>
                <p className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="glass-panel rounded-xl border border-white/5 p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo vật phẩm, người mua, người bán..."
                className="w-full pl-8 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-blue-400/40 font-mono" />
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
              <span className="text-[9px] font-mono text-muted-foreground/30 uppercase ml-5">Loại giao dịch:</span>
              <Chip label="Tất cả" active={txType === "all"} onClick={() => setTxType("all")} />
              {(["purchase","auction_win","offer_accepted"] as TxType[]).map(t => (
                <Chip key={t} label={TX_TYPE_META[t].label} active={txType === t} onClick={() => setTxType(t)} />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-mono text-muted-foreground/30 uppercase ml-5">Độ hiếm:</span>
              <Chip label="Tất cả" active={rarity === "all"} onClick={() => setRarity("all")} />
              {(["common","rare","epic","legendary","mythic"] as MarketRarity[]).map(r => (
                <Chip key={r} label={RARITY_LABELS[r]} active={rarity === r} onClick={() => setRarity(r)} />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/30" />
              <span className="text-[9px] font-mono text-muted-foreground/30 uppercase">Sắp xếp:</span>
              {([["date","Mới nhất"],["price_desc","Giá cao nhất"],["price_asc","Giá thấp nhất"]] as [SortKey,string][]).map(([k,l]) => (
                <button key={k} onClick={() => setSort(k)} className={cn("px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all", sort === k ? "bg-blue-400/20 border-blue-400/40 text-blue-400" : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20")}>{l}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="glass-panel rounded-xl border border-white/5 p-16 text-center">
              <p className="text-xs font-mono text-muted-foreground/30 tracking-widest">KHÔNG TÌM THẤY GIAO DỊCH</p>
              <button onClick={() => { setSearch(""); setCat("all"); setRarity("all"); setTxType("all"); }} className="mt-4 text-[10px] font-mono text-blue-400 hover:text-blue-300 border border-blue-400/20 hover:border-blue-400/40 px-3 py-1.5 rounded-lg transition-all">XÓA BỘ LỌC</button>
            </div>
          ) : (
            <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      {["#","Vật phẩm","Độ hiếm","Loại GD","Người mua","Người bán","Giá","Phí","Ngày"].map(h => (
                        <th key={h} className="py-3 px-3 text-left text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest font-normal first:pl-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((tx, i) => {
                      const rc = RARITY_COLORS[tx.rarity];
                      const tm = TX_TYPE_META[tx.type];
                      const cm = CATEGORY_META_MARKET[tx.category];
                      return (
                        <motion.tr key={tx.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}
                          className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                          <td className="py-3 pl-4 pr-2 text-[9px] font-mono text-muted-foreground/20">{i + 1}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{tx.itemImage}</span>
                              <div>
                                <p className="text-xs font-bold text-white line-clamp-1">{tx.itemName}</p>
                                <p className={cn("text-[8px] font-mono", cm.color)}>{cm.icon} {cm.label}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3"><span className={cn("text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border", rc.text, rc.bg, rc.border)}>{RARITY_LABELS[tx.rarity]}</span></td>
                          <td className="py-3 px-3"><span className={cn("text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-white/10", tm.color, tm.bg)}>{tm.label}</span></td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-mono font-bold text-white">{tx.buyerAvatar}</div>
                              <span className="text-[10px] font-mono text-muted-foreground/60">{tx.buyer}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-mono font-bold text-white">{tx.sellerAvatar}</div>
                              <span className="text-[10px] font-mono text-muted-foreground/60">{tx.seller}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right"><span className={cn("text-xs font-bold font-mono", rc.text)}>{fmtCR(tx.price)}</span></td>
                          <td className="py-3 px-3 text-right"><span className="text-[9px] font-mono text-muted-foreground/40">{fmtCR(tx.fee)}</span></td>
                          <td className="py-3 px-3 text-right text-[9px] font-mono text-muted-foreground/30">{new Date(tx.date).toLocaleDateString("vi-VN")}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
                <p className="text-[9px] font-mono text-muted-foreground/30">{filtered.length} GIAO DỊCH</p>
                <div className="flex items-center gap-4">
                  <span className="text-[9px] font-mono text-muted-foreground/30">Phí: <span className="text-amber-400">{fmtCR(totalFees)}</span></span>
                  <span className="text-[9px] font-mono text-cyan-400 font-bold">Tổng: {fmtCR(totalVolume)}</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
