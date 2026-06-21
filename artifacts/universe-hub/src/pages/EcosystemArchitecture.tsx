import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import {
  Wallet, ShoppingBag, Package, User,
  Hexagon,
  Trophy, Dna, ShieldCheck, ArrowLeftRight, Globe2,
  Glasses, Footprints, TreePine,
  Globe, Cpu, Layers,
  X, ExternalLink, ChevronRight,
} from "lucide-react";

interface ArchNode {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  icon: typeof Hexagon;
  status: "live" | "beta" | "planned";
}

interface ArchLayer {
  id: number;
  label: string;
  labelVi: string;
  subtitle: string;
  color: string;
  glow: string;
  border: string;
  bg: string;
  textColor: string;
  orb: string;
  nodes: ArchNode[];
}

const LAYERS: ArchLayer[] = [
  {
    id: 0,
    label: "Layer 0",
    labelVi: "Tầng 0 — Nền tảng",
    subtitle: "Foundation",
    color: "from-blue-600/20 to-indigo-900/20",
    glow: "shadow-[0_0_40px_rgba(59,130,246,0.12)]",
    border: "border-blue-500/20",
    bg: "bg-blue-500/8",
    textColor: "text-blue-400",
    orb: "bg-blue-500/20",
    nodes: [
      { id: "universe-account",     name: "Universe Account",     nameVi: "Tài khoản Vũ trụ",   description: "Hệ thống xác thực & quản lý danh tính người dùng xuyên suốt hệ sinh thái.",  icon: User,           status: "live" },
      { id: "universe-wallet",      name: "Universe Wallet",      nameVi: "Ví Vũ trụ",           description: "Quản lý tài sản kỹ thuật số, tín dụng, xu và token trong toàn hệ thống.",   icon: Wallet,         status: "live" },
      { id: "universe-inventory",   name: "Universe Inventory",   nameVi: "Kho đồ Vũ trụ",      description: "Kho lưu trữ tập trung cho tất cả vật phẩm, thú cưng và tài sản số.",         icon: Package,        status: "live" },
      { id: "universe-marketplace", name: "Universe Marketplace", nameVi: "Sàn giao dịch Vũ trụ", description: "Nền tảng mua bán, trao đổi tài sản kỹ thuật số giữa người dùng.",           icon: ShoppingBag,    status: "beta" },
    ],
  },
  {
    id: 1,
    label: "Layer 1",
    labelVi: "Tầng 1 — Trung tâm",
    subtitle: "Hub",
    color: "from-cyan-600/20 to-primary/10",
    glow: "shadow-[0_0_40px_rgba(6,182,212,0.12)]",
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/8",
    textColor: "text-cyan-400",
    orb: "bg-cyan-500/20",
    nodes: [
      { id: "universe-hub", name: "Universe Hub", nameVi: "Universe Hub", description: "Cổng điều khiển trung tâm — nơi kết nối người dùng với toàn bộ hệ sinh thái vũ trụ số.", icon: Hexagon, status: "live" },
    ],
  },
  {
    id: 2,
    label: "Layer 2",
    labelVi: "Tầng 2 — Ứng dụng",
    subtitle: "Applications",
    color: "from-violet-600/20 to-purple-900/20",
    glow: "shadow-[0_0_40px_rgba(139,92,246,0.12)]",
    border: "border-violet-500/20",
    bg: "bg-violet-500/8",
    textColor: "text-violet-400",
    orb: "bg-violet-500/20",
    nodes: [
      { id: "football-universe", name: "Football Universe", nameVi: "Vũ trụ Bóng đá",    description: "Mô phỏng AI bóng đá — quản lý câu lạc bộ, cầu thủ và giải đấu trong thế giới ảo.", icon: Trophy,          status: "live" },
      { id: "animal-evolution",  name: "Animal Evolution",  nameVi: "Tiến hóa Động vật",  description: "Tạo và tiến hóa các sinh vật AI độc đáo với di truyền học và trí tuệ nhân tạo.",    icon: Dna,             status: "live" },
      { id: "safepass",          name: "SafePass",          nameVi: "SafePass",             description: "Hệ thống chuyển giao tài sản an toàn và giao dịch bảo mật giữa các ứng dụng.",       icon: ShieldCheck,     status: "beta" },
      { id: "exchange-hub",      name: "Exchange Hub",      nameVi: "Sàn đổi",              description: "Sàn trao đổi tiền tệ kỹ thuật số và tài sản trong hệ sinh thái.",                    icon: ArrowLeftRight,  status: "beta" },
      { id: "world-creator",     name: "World Creator",     nameVi: "Nhà tạo Thế giới",    description: "Công cụ tạo quốc gia, thành phố, hành tinh và nền văn minh trong vũ trụ số.",       icon: Globe2,          status: "live" },
    ],
  },
  {
    id: 3,
    label: "Layer 3",
    labelVi: "Tầng 3 — Thực tế mở rộng",
    subtitle: "XR",
    color: "from-emerald-600/20 to-teal-900/20",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.12)]",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/8",
    textColor: "text-emerald-400",
    orb: "bg-emerald-500/20",
    nodes: [
      { id: "xr-football", name: "XR Football", nameVi: "Bóng đá XR",  description: "Trải nghiệm bóng đá nhập vai thực tế ảo — xem trận đấu, điều khiển cầu thủ trong không gian XR.", icon: Footprints, status: "planned" },
      { id: "xr-zoo",      name: "XR Zoo",      nameVi: "Sở thú XR",   description: "Vườn thú thực tế ảo — tương tác với sinh vật AI trong môi trường XR đắm chìm.",                      icon: TreePine,   status: "planned" },
      { id: "xr-city",     name: "XR City",     nameVi: "Thành phố XR", description: "Đô thị số trong không gian XR — xây dựng, khám phá và tương tác với thành phố thông minh.",          icon: Glasses,    status: "planned" },
    ],
  },
  {
    id: 4,
    label: "Layer 4",
    labelVi: "Tầng 4 — Tương lai",
    subtitle: "Future",
    color: "from-amber-600/20 to-orange-900/20",
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.12)]",
    border: "border-amber-500/20",
    bg: "bg-amber-500/8",
    textColor: "text-amber-400",
    orb: "bg-amber-500/20",
    nodes: [
      { id: "virtual-nation",      name: "Virtual Nation",      nameVi: "Quốc gia Ảo",        description: "Một quốc gia kỹ thuật số hoàn chỉnh — với hiến pháp, kinh tế, chính phủ và công dân số.", icon: Globe,  status: "planned" },
      { id: "digital-twin-earth",  name: "Digital Twin Earth",  nameVi: "Trái đất Song sinh số", description: "Bản sao kỹ thuật số của Trái Đất — mô phỏng khí hậu, địa lý và xã hội loài người.",       icon: Globe2, status: "planned" },
      { id: "metaverse-os",        name: "Metaverse OS",        nameVi: "Hệ điều hành Metaverse", description: "Hệ điều hành nền tảng cho toàn bộ metaverse — quản lý tài nguyên, danh tính và vật lý số.", icon: Cpu,    status: "planned" },
    ],
  },
];

const STATUS_META = {
  live:    { label: "TRỰC TIẾP", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", dot: "bg-emerald-400 animate-pulse" },
  beta:    { label: "THỬ NGHIỆM", color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20",   dot: "bg-amber-400" },
  planned: { label: "SẮP RA MẮT", color: "text-zinc-400",   bg: "bg-zinc-400/10",    border: "border-zinc-400/20",    dot: "bg-zinc-500" },
};

const LAYER_COUNTS = { live: 0, beta: 0, planned: 0 };
LAYERS.forEach((l) => l.nodes.forEach((n) => { LAYER_COUNTS[n.status]++; }));
const TOTAL_NODES = LAYERS.reduce((s, l) => s + l.nodes.length, 0);

function ConnectorLine({ color }: { color: string }) {
  return (
    <div className="relative h-6 flex items-center justify-center w-full pointer-events-none">
      <div className={cn("w-px h-full opacity-30", color)} />
      <div className="absolute flex gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={cn("w-px h-full opacity-10", color)} />
        ))}
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/20" />
    </div>
  );
}

export default function EcosystemArchitecture() {
  const [selected, setSelected] = useState<{ layerId: number; node: ArchNode } | null>(null);

  const reversedLayers = [...LAYERS].reverse();

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <Header />

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-2 h-6 bg-primary rounded-sm shadow-[0_0_10px_hsl(var(--primary))]" />
                Kiến trúc Hệ sinh thái
              </h1>
              <p className="text-xs font-mono text-muted-foreground/40 mt-1 tracking-wider">
                SƠ ĐỒ KIẾN TRÚC TƯƠNG TÁC — {TOTAL_NODES} THÀNH PHẦN · {LAYERS.length} TẦNG
              </p>
            </div>

            {/* Summary chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {(["live", "beta", "planned"] as const).map((s) => (
                <div key={s} className={cn("flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-mono font-bold tracking-widest", STATUS_META[s].color, STATUS_META[s].bg, STATUS_META[s].border)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_META[s].dot)} />
                  {STATUS_META[s].label} · {LAYER_COUNTS[s]}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Architecture diagram */}
            <div className="flex-1 min-w-0 space-y-0">
              {reversedLayers.map((layer, layerIdx) => {
                const isLast = layerIdx === reversedLayers.length - 1;
                return (
                  <div key={layer.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: layerIdx * 0.08, duration: 0.4 }}
                      className={cn(
                        "rounded-2xl border p-4 md:p-5 transition-all duration-300",
                        layer.border,
                        layer.glow,
                        `bg-gradient-to-br ${layer.color}`
                      )}
                    >
                      {/* Layer header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono border", layer.textColor, layer.bg, layer.border)}>
                          {layer.id}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={cn("text-xs font-bold font-mono tracking-widest uppercase", layer.textColor)}>
                              {layer.subtitle}
                            </span>
                            <span className="text-muted-foreground/30 text-xs">·</span>
                            <span className="text-muted-foreground/50 text-[10px] font-mono tracking-wider">{layer.labelVi.split("—")[1]?.trim()}</span>
                          </div>
                        </div>
                        <div className="ml-auto text-[10px] font-mono text-muted-foreground/30">
                          {layer.nodes.length} thành phần
                        </div>
                      </div>

                      {/* Nodes grid */}
                      <div className={cn(
                        "grid gap-3",
                        layer.nodes.length === 1 ? "grid-cols-1 max-w-sm" :
                        layer.nodes.length <= 3 ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" :
                        "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
                      )}>
                        {layer.nodes.map((node, nodeIdx) => {
                          const isSelected = selected?.node.id === node.id;
                          const sm = STATUS_META[node.status];
                          return (
                            <motion.button
                              key={node.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: layerIdx * 0.08 + nodeIdx * 0.04 }}
                              onClick={() => setSelected(isSelected ? null : { layerId: layer.id, node })}
                              data-testid={`node-${node.id}`}
                              className={cn(
                                "relative text-left p-3 md:p-4 rounded-xl border transition-all duration-300 group",
                                "bg-black/30 backdrop-blur-sm",
                                isSelected
                                  ? cn("border-white/30 shadow-lg", layer.glow)
                                  : cn("hover:bg-black/50 hover:border-white/20", layer.border)
                              )}
                            >
                              {/* Glow on selected */}
                              {isSelected && (
                                <div className={cn("absolute inset-0 rounded-xl opacity-10 pointer-events-none", layer.orb)} />
                              )}

                              <div className="flex items-start gap-3">
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all", layer.bg, isSelected ? layer.textColor : "text-white/40 group-hover:" + layer.textColor)}>
                                  <node.icon className={cn("w-4 h-4", isSelected ? layer.textColor : "text-white/40 group-hover:text-white/70")} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className={cn("text-xs font-bold uppercase tracking-wider truncate transition-colors", isSelected ? "text-white" : "text-white/70 group-hover:text-white")}>
                                    {node.nameVi}
                                  </p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", sm.dot)} />
                                    <span className={cn("text-[9px] font-mono tracking-widest", sm.color)}>{sm.label}</span>
                                  </div>
                                </div>
                                <ChevronRight className={cn("w-3 h-3 flex-shrink-0 transition-all text-white/20", isSelected ? "rotate-90 text-white/60" : "group-hover:text-white/40")} />
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>

                    {/* Connector between layers */}
                    {!isLast && (
                      <div className="flex items-center justify-center py-1">
                        <div className="flex flex-col items-center gap-0.5">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className={cn("w-px rounded-full", i === 0 ? "h-2" : i === 1 ? "h-1.5 opacity-60" : "h-1 opacity-30", `bg-gradient-to-b ${reversedLayers[layerIdx].textColor} to-transparent`)} />
                          ))}
                          <div className="w-4 h-px bg-white/10" />
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className={cn("w-px rounded-full", i === 0 ? "h-1 opacity-30" : i === 1 ? "h-1.5 opacity-60" : "h-2", `bg-gradient-to-b from-transparent ${reversedLayers[layerIdx + 1].textColor}`)} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Detail panel */}
            <div className="lg:w-80 xl:w-96 flex-shrink-0">
              <div className="sticky top-4 space-y-4">
                <AnimatePresence mode="wait">
                  {selected ? (
                    <motion.div
                      key={selected.node.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.25 }}
                      className={cn(
                        "glass-panel rounded-2xl border p-5 relative overflow-hidden",
                        LAYERS[selected.layerId].border,
                        LAYERS[selected.layerId].glow
                      )}
                    >
                      <div className={cn("absolute inset-0 opacity-5 pointer-events-none bg-gradient-to-br", LAYERS[selected.layerId].color)} />

                      {/* Close */}
                      <button
                        onClick={() => setSelected(null)}
                        data-testid="detail-close"
                        className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Icon + name */}
                      <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", LAYERS[selected.layerId].bg, LAYERS[selected.layerId].border)}>
                          <selected.node.icon className={cn("w-5 h-5", LAYERS[selected.layerId].textColor)} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{selected.node.nameVi}</p>
                          <p className="text-[10px] font-mono text-muted-foreground/40">{selected.node.name}</p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="relative z-10 mb-4">
                        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold tracking-widest", STATUS_META[selected.node.status].color, STATUS_META[selected.node.status].bg, STATUS_META[selected.node.status].border)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_META[selected.node.status].dot)} />
                          {STATUS_META[selected.node.status].label}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground/70 leading-relaxed relative z-10 mb-4">
                        {selected.node.description}
                      </p>

                      {/* Meta */}
                      <div className={cn("rounded-xl border p-3 space-y-2 relative z-10", LAYERS[selected.layerId].border, LAYERS[selected.layerId].bg)}>
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-muted-foreground/40 uppercase tracking-widest">Tầng</span>
                          <span className={LAYERS[selected.layerId].textColor}>{LAYERS[selected.layerId].labelVi}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-muted-foreground/40 uppercase tracking-widest">ID hệ thống</span>
                          <span className="text-white/60">{selected.node.id}</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="glass-panel rounded-2xl border border-white/5 p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[200px]"
                    >
                      <Layers className="w-8 h-8 text-muted-foreground/20" />
                      <p className="text-muted-foreground/40 text-xs font-mono tracking-wider">
                        Chọn một thành phần<br />để xem chi tiết
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Layer legend */}
                <div className="glass-panel rounded-2xl border border-white/5 p-4 space-y-2">
                  <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest mb-3">Chú giải tầng</p>
                  {[...LAYERS].reverse().map((layer) => (
                    <div key={layer.id} className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full flex-shrink-0", layer.orb.replace("/20", "/60"))} />
                      <span className={cn("text-[10px] font-mono font-bold", layer.textColor)}>{layer.label}</span>
                      <span className="text-[10px] font-mono text-muted-foreground/40 flex-1 truncate">— {layer.subtitle}</span>
                      <span className="text-[10px] font-mono text-muted-foreground/30">{layer.nodes.length}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
