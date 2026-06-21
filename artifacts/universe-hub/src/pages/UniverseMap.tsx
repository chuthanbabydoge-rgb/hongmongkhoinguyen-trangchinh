import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MODULES, type ModuleConfig } from "@/config/modules";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ExternalLink, Play, Lock, Clock, X, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

const SVG_W = 900;
const SVG_H = 580;
const CX = SVG_W / 2;
const CY = SVG_H / 2;
const ORBIT_R = 210;
const HUB_R = 52;
const NODE_R = 36;

const MODULE_COLORS: Record<string, string> = {
  "world-creator":  "#60a5fa",
  "football":       "#2dd4bf",
  "animals":        "#34d399",
  "safepass":       "#fbbf24",
  "exchange-hub":   "#c084fc",
  "ai-companion":   "#f472b6",
  "xr-worlds":      "#fb923c",
};

const STATUS_LABEL: Record<string, string> = {
  internal:     "LIVE",
  external:     "LIVE",
  "coming-soon":"PENDING",
  disabled:     "OFFLINE",
};

const STATUS_COLOR: Record<string, string> = {
  internal:     "#34d399",
  external:     "#34d399",
  "coming-soon":"#fbbf24",
  disabled:     "#6b7280",
};

function nodePosition(index: number, total: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: CX + ORBIT_R * Math.cos(angle),
    y: CY + ORBIT_R * Math.sin(angle),
  };
}

function HexPath({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3 - Math.PI / 6;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  });
  return <polygon points={pts.join(" ")} />;
}

interface DetailPanelProps {
  module: ModuleConfig;
  color: string;
  onClose: () => void;
}

function DetailPanel({ module, color, onClose }: DetailPanelProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleAction = () => {
    switch (module.type) {
      case "disabled":
        return;
      case "coming-soon":
        toast({
          title: "Module Offline",
          description: `${module.title} is currently under construction.`,
          className: "bg-black border border-primary text-primary font-mono",
        });
        return;
      case "external":
        if (module.url) window.open(module.url, "_blank", "noopener,noreferrer");
        return;
      case "internal":
        if (module.url) setLocation(module.url);
        return;
    }
  };

  const statusLabel = STATUS_LABEL[module.type];
  const statusColor = STATUS_COLOR[module.type];
  const isDisabled = module.type === "disabled";

  const ActionIcon =
    module.type === "disabled" ? Lock :
    module.type === "coming-soon" ? Clock :
    module.type === "external" ? ExternalLink :
    Play;

  return (
    <div
      data-testid={`detail-panel-${module.id}`}
      className="absolute right-4 top-4 bottom-4 w-72 glass-panel rounded-2xl border border-white/10 p-6 flex flex-col gap-4 z-20 animate-in slide-in-from-right duration-300"
      style={{ borderColor: `${color}40` }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}50` }}
        >
          <module.navIcon className="w-5 h-5" style={{ color }} />
        </div>
        <button
          onClick={onClose}
          data-testid="button-close-detail"
          className="text-muted-foreground hover:text-white transition-colors p-1 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <h3 className="text-lg font-bold uppercase tracking-wider text-white" style={{ textShadow: `0 0 12px ${color}` }}>
          {module.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
      </div>

      <div className="flex items-center gap-2">
        {isDisabled
          ? <WifiOff className="w-3 h-3" style={{ color: statusColor }} />
          : <Wifi className="w-3 h-3" style={{ color: statusColor }} />
        }
        <span
          className="text-xs font-mono tracking-widest"
          style={{ color: statusColor }}
        >
          {statusLabel}
        </span>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">
          {module.type.replace("-", " ")}
        </span>
      </div>

      <div className="mt-auto">
        <button
          onClick={handleAction}
          disabled={isDisabled}
          data-testid={`button-launch-${module.id}`}
          className={cn(
            "w-full py-3 px-4 rounded-lg font-bold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 border",
            isDisabled
              ? "bg-white/5 border-white/10 text-white/30 cursor-not-allowed"
              : "bg-black/50 hover:bg-black/80"
          )}
          style={
            isDisabled
              ? {}
              : { borderColor: `${color}60`, color, boxShadow: `0 0 10px ${color}20` }
          }
        >
          <ActionIcon className="w-3.5 h-3.5" />
          {module.buttonText}
        </button>
      </div>
    </div>
  );
}

export default function UniverseMap() {
  const [selected, setSelected] = useState<ModuleConfig | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const handleNodeClick = (mod: ModuleConfig) => {
    setSelected((prev) => (prev?.id === mod.id ? null : mod));
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col relative z-10 max-w-full overflow-hidden">
        <Header />

        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
              <span className="w-2 h-6 bg-primary rounded-sm shadow-[0_0_10px_hsl(var(--primary))]" />
              Universe Map
            </h1>
            <span className="ml-2 text-xs font-mono text-muted-foreground/50 uppercase tracking-widest">
              {MODULES.length} nodes connected
            </span>
          </div>

          <div className="glass-panel rounded-2xl border border-white/5 relative overflow-hidden">
            {/* Radial glow behind hub */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-48 h-48 rounded-full opacity-10 blur-3xl"
                style={{ background: "hsl(var(--primary))" }}
              />
            </div>

            {/* SVG Graph */}
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full h-auto max-h-[65vh]"
              style={{ minHeight: 320 }}
            >
              <defs>
                {/* Hub glow filter */}
                <filter id="hub-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Node glow filter */}
                <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Orbit ring dashes */}
                <circle id="orbit" cx={CX} cy={CY} r={ORBIT_R} />

                {/* Individual node glow filters per color */}
                {MODULES.map((mod) => {
                  const color = MODULE_COLORS[mod.id] ?? "#60a5fa";
                  return (
                    <filter key={mod.id} id={`glow-${mod.id}`} x="-60%" y="-60%" width="220%" height="220%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feFlood floodColor={color} floodOpacity="0.6" result="color" />
                      <feComposite in="color" in2="blur" operator="in" result="glow" />
                      <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  );
                })}

                {/* Line gradient per module */}
                {MODULES.map((mod, i) => {
                  const color = MODULE_COLORS[mod.id] ?? "#60a5fa";
                  const pos = nodePosition(i, MODULES.length);
                  const gradId = `line-grad-${mod.id}`;
                  return (
                    <linearGradient
                      key={gradId}
                      id={gradId}
                      x1={CX} y1={CY}
                      x2={pos.x} y2={pos.y}
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="hsl(210,100%,56%)" stopOpacity="0.8" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.8" />
                    </linearGradient>
                  );
                })}
              </defs>

              {/* Orbit ring */}
              <circle
                cx={CX} cy={CY} r={ORBIT_R}
                fill="none"
                stroke="hsl(210,100%,56%)"
                strokeOpacity="0.08"
                strokeWidth="1"
                strokeDasharray="4 8"
              />

              {/* Connection lines */}
              {MODULES.map((mod, i) => {
                const pos = nodePosition(i, MODULES.length);
                const color = MODULE_COLORS[mod.id] ?? "#60a5fa";
                const isHov = hovered === mod.id;
                const isSel = selected?.id === mod.id;
                const isActive = isHov || isSel;
                const isOff = mod.type === "disabled";

                return (
                  <g key={`line-${mod.id}`}>
                    {/* Base dim line */}
                    <line
                      x1={CX} y1={CY}
                      x2={pos.x} y2={pos.y}
                      stroke={color}
                      strokeWidth={isActive ? 1.5 : 0.8}
                      strokeOpacity={isOff ? 0.08 : isActive ? 0.5 : 0.15}
                      strokeDasharray={isOff ? "4 8" : undefined}
                    />
                    {/* Animated data-flow line */}
                    {!isOff && (
                      <line
                        x1={CX} y1={CY}
                        x2={pos.x} y2={pos.y}
                        stroke={`url(#line-grad-${mod.id})`}
                        strokeWidth={isActive ? 2 : 1}
                        strokeOpacity={isActive ? 0.9 : 0.4}
                        strokeDasharray="6 20"
                        strokeLinecap="round"
                        style={{
                          animation: `flow-${i % 3} ${1.8 + i * 0.3}s linear infinite`,
                        }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Module nodes */}
              {MODULES.map((mod, i) => {
                const pos = nodePosition(i, MODULES.length);
                const color = MODULE_COLORS[mod.id] ?? "#60a5fa";
                const isHov = hovered === mod.id;
                const isSel = selected?.id === mod.id;
                const isActive = isHov || isSel;
                const isOff = mod.type === "disabled";
                const r = isActive ? NODE_R + 4 : NODE_R;
                const labelLines = mod.title.split(" ");

                return (
                  <g
                    key={mod.id}
                    data-testid={`node-${mod.id}`}
                    style={{ cursor: "pointer", transition: "all 0.2s" }}
                    onClick={() => handleNodeClick(mod)}
                    onMouseEnter={() => setHovered(mod.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {/* Outer ring pulse */}
                    {isActive && (
                      <circle
                        cx={pos.x} cy={pos.y}
                        r={r + 10}
                        fill="none"
                        stroke={color}
                        strokeWidth="1"
                        strokeOpacity="0.3"
                        style={{ animation: "pulse-ring 1.5s ease-out infinite" }}
                      />
                    )}

                    {/* Hex backdrop */}
                    <g filter={isActive ? `url(#glow-${mod.id})` : undefined}>
                      <HexPath
                        cx={pos.x} cy={pos.y} r={r}
                        fill={isActive ? `${color}22` : `${color}10`}
                        stroke={color}
                        strokeWidth={isActive ? 1.5 : 0.8}
                        strokeOpacity={isOff ? 0.3 : 1}
                      />
                    </g>

                    {/* Icon placeholder — module initial letters */}
                    <text
                      x={pos.x} y={pos.y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="'Rajdhani', sans-serif"
                      fill={isOff ? "#6b7280" : color}
                      style={{ pointerEvents: "none", letterSpacing: "0.1em" }}
                    >
                      {mod.title.split(" ").map((w) => w[0]).join("").slice(0, 3)}
                    </text>

                    {/* Label below node */}
                    {labelLines.map((line, li) => (
                      <text
                        key={li}
                        x={pos.x}
                        y={pos.y + r + 14 + li * 13}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="9.5"
                        fontWeight="600"
                        fontFamily="'Rajdhani', sans-serif"
                        fill={isOff ? "#6b7280" : isActive ? "#fff" : "#94a3b8"}
                        style={{ pointerEvents: "none", letterSpacing: "0.08em" }}
                      >
                        {line.toUpperCase()}
                      </text>
                    ))}

                    {/* Status dot */}
                    <circle
                      cx={pos.x + r - 4}
                      cy={pos.y - r + 4}
                      r="4"
                      fill={STATUS_COLOR[mod.type]}
                      style={
                        !isOff
                          ? { animation: "status-pulse 2s ease-in-out infinite" }
                          : {}
                      }
                    />
                  </g>
                );
              })}

              {/* Hub node — center */}
              <g
                data-testid="node-hub"
                onClick={() => setSelected(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Outer rings */}
                <circle
                  cx={CX} cy={CY} r={HUB_R + 16}
                  fill="none"
                  stroke="hsl(210,100%,56%)"
                  strokeWidth="1"
                  strokeOpacity="0.2"
                  strokeDasharray="3 6"
                  style={{ animation: "spin-slow 20s linear infinite" }}
                />
                <circle
                  cx={CX} cy={CY} r={HUB_R + 28}
                  fill="none"
                  stroke="hsl(210,100%,56%)"
                  strokeWidth="0.5"
                  strokeOpacity="0.1"
                  strokeDasharray="2 10"
                  style={{ animation: "spin-slow 30s linear infinite reverse" }}
                />

                {/* Hub hex */}
                <g filter="url(#hub-glow)">
                  <HexPath
                    cx={CX} cy={CY} r={HUB_R}
                    fill="hsl(210,100%,56%,0.12)"
                    stroke="hsl(210,100%,56%)"
                    strokeWidth="1.5"
                  />
                </g>

                {/* Hub label */}
                <text
                  x={CX} y={CY - 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="'Rajdhani', sans-serif"
                  fill="hsl(210,100%,75%)"
                  letterSpacing="0.12em"
                  style={{ pointerEvents: "none" }}
                >
                  UNIVERSE
                </text>
                <text
                  x={CX} y={CY + 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="'Rajdhani', sans-serif"
                  fill="hsl(210,100%,75%)"
                  letterSpacing="0.12em"
                  style={{ pointerEvents: "none" }}
                >
                  HUB
                </text>

                {/* Pulse dot */}
                <circle
                  cx={CX} cy={CY} r={HUB_R + 2}
                  fill="none"
                  stroke="hsl(210,100%,56%)"
                  strokeWidth="1"
                  strokeOpacity="0"
                  style={{ animation: "hub-pulse 2.5s ease-out infinite" }}
                />
              </g>

              <style>{`
                @keyframes flow-0 {
                  from { stroke-dashoffset: 0; }
                  to   { stroke-dashoffset: -52; }
                }
                @keyframes flow-1 {
                  from { stroke-dashoffset: 0; }
                  to   { stroke-dashoffset: -52; }
                }
                @keyframes flow-2 {
                  from { stroke-dashoffset: 0; }
                  to   { stroke-dashoffset: -52; }
                }
                @keyframes hub-pulse {
                  0%   { stroke-dashoffset: 0; stroke-opacity: 0.6; r: ${HUB_R + 2}; }
                  100% { stroke-dashoffset: 0; stroke-opacity: 0;   r: ${HUB_R + 30}; }
                }
                @keyframes pulse-ring {
                  0%   { r: 0;    opacity: 0.5; }
                  100% { r: 30px; opacity: 0;   }
                }
                @keyframes status-pulse {
                  0%, 100% { opacity: 1;   }
                  50%       { opacity: 0.3; }
                }
                @keyframes spin-slow {
                  from { transform-origin: ${CX}px ${CY}px; transform: rotate(0deg); }
                  to   { transform-origin: ${CX}px ${CY}px; transform: rotate(360deg); }
                }
              `}</style>
            </svg>

            {/* Detail panel overlay */}
            {selected && (
              <DetailPanel
                module={selected}
                color={MODULE_COLORS[selected.id] ?? "#60a5fa"}
                onClose={() => setSelected(null)}
              />
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 flex items-center gap-4 pointer-events-none">
              {(["external", "coming-soon", "disabled"] as const).map((type) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: STATUS_COLOR[type] }}
                  />
                  <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">
                    {STATUS_LABEL[type]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
