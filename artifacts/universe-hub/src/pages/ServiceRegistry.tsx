import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SERVICES, type ServiceConfig, type ServiceStatus, type ServiceEnvironment } from "@/config/services";
import {
  Activity,
  AlertTriangle,
  WifiOff,
  Clock,
  Cpu,
  Globe,
  Layers,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_META: Record<ServiceStatus, { label: string; color: string; bg: string; border: string; Icon: typeof Activity }> = {
  online:   { label: "ONLINE",   color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", Icon: Activity },
  degraded: { label: "DEGRADED", color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/30",   Icon: AlertTriangle },
  offline:  { label: "OFFLINE",  color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/30",     Icon: WifiOff },
};

const ENV_META: Record<ServiceEnvironment, { label: string; color: string; bg: string }> = {
  production:  { label: "PROD",  color: "text-blue-300",   bg: "bg-blue-400/10" },
  staging:     { label: "STAGE", color: "text-purple-300", bg: "bg-purple-400/10" },
  development: { label: "DEV",   color: "text-zinc-400",   bg: "bg-zinc-400/10" },
};

const STATUS_ORDER: ServiceStatus[] = ["online", "degraded", "offline"];

function StatusDot({ status }: { status: ServiceStatus }) {
  const colors: Record<ServiceStatus, string> = {
    online:   "bg-emerald-400",
    degraded: "bg-amber-400",
    offline:  "bg-red-500",
  };
  return (
    <span className="relative flex items-center justify-center w-3 h-3">
      {status !== "offline" && (
        <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping", colors[status])} />
      )}
      <span className={cn("relative inline-flex rounded-full w-2.5 h-2.5", colors[status])} />
    </span>
  );
}

function SummaryBar({ services }: { services: ServiceConfig[] }) {
  const counts = {
    online:   services.filter((s) => s.status === "online").length,
    degraded: services.filter((s) => s.status === "degraded").length,
    offline:  services.filter((s) => s.status === "offline").length,
  };
  const total = services.length;

  return (
    <div className="grid grid-cols-3 gap-4">
      {(["online", "degraded", "offline"] as ServiceStatus[]).map((s) => {
        const meta = STATUS_META[s];
        const pct = Math.round((counts[s] / total) * 100);
        return (
          <div
            key={s}
            data-testid={`summary-${s}`}
            className={cn(
              "glass-panel rounded-xl border p-4 flex items-center gap-4 transition-all duration-300",
              meta.border
            )}
          >
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", meta.bg)}>
              <meta.Icon className={cn("w-5 h-5", meta.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{counts[s]}</p>
              <p className={cn("text-[10px] font-mono tracking-widest uppercase", meta.color)}>
                {meta.label} · {pct}%
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ServiceRow({ service, expanded, onToggle }: {
  service: ServiceConfig;
  expanded: boolean;
  onToggle: () => void;
}) {
  const sm = STATUS_META[service.status];
  const em = ENV_META[service.environment];

  return (
    <div
      data-testid={`row-service-${service.id}`}
      className={cn(
        "glass-panel rounded-xl border transition-all duration-300 overflow-hidden",
        sm.border,
        expanded ? "shadow-lg" : "hover:border-white/20"
      )}
    >
      {/* Main row */}
      <button
        onClick={onToggle}
        data-testid={`toggle-service-${service.id}`}
        className="w-full text-left px-6 py-4 flex items-center gap-4 group"
      >
        {/* Status dot */}
        <StatusDot status={service.status} />

        {/* Name + description */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white tracking-wide text-sm uppercase">
            {service.name}
          </p>
          <p className="text-xs text-muted-foreground/60 truncate mt-0.5">
            {service.description}
          </p>
        </div>

        {/* Status badge */}
        <span
          className={cn(
            "hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-widest border",
            sm.color, sm.bg, sm.border
          )}
        >
          <sm.Icon className="w-3 h-3" />
          {sm.label}
        </span>

        {/* Version */}
        <span className="hidden md:block text-xs font-mono text-muted-foreground/70 w-20 text-center">
          {service.version}
        </span>

        {/* Environment */}
        <span
          className={cn(
            "hidden lg:inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest w-14 justify-center",
            em.color, em.bg
          )}
        >
          {em.label}
        </span>

        {/* Latency */}
        <span className="hidden lg:block text-xs font-mono text-muted-foreground/70 w-16 text-right">
          {service.latency}
        </span>

        {/* Expand chevron */}
        <span className="text-muted-foreground/40 group-hover:text-white transition-colors ml-2">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div
          className="px-6 pb-5 border-t border-white/5 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4"
          style={{ animation: "fadeInDown 0.2s ease-out" }}
        >
          <DetailStat icon={Activity} label="Uptime" value={service.uptime} color={sm.color} />
          <DetailStat icon={Cpu} label="Độ trễ" value={service.latency} color="text-blue-300" />
          <DetailStat icon={Globe} label="Môi trường" value={ENV_META[service.environment].label} color={em.color} />
          <DetailStat icon={Layers} label="Phiên bản" value={service.version} color="text-purple-300" />
          <div className="col-span-2 sm:col-span-4 flex items-center gap-2 mt-1">
            <RefreshCw className="w-3 h-3 text-muted-foreground/40" />
            <span className="text-[10px] font-mono text-muted-foreground/40 tracking-wider">
              CẬP NHẬT LẦN CUỐI — {service.lastUpdate}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
        <Icon className={cn("w-3.5 h-3.5", color)} />
      </div>
      <div>
        <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">{label}</p>
        <p className={cn("text-sm font-bold font-mono", color)}>{value}</p>
      </div>
    </div>
  );
}

type SortKey = "name" | "status" | "environment";

export default function ServiceRegistry() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ServiceStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [sortAsc, setSortAsc] = useState(true);

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const filtered = SERVICES.filter(
    (s) => filterStatus === "all" || s.status === filterStatus
  ).sort((a, b) => {
    let cmp = 0;
    if (sortKey === "name") cmp = a.name.localeCompare(b.name);
    else if (sortKey === "status") cmp = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    else if (sortKey === "environment") cmp = a.environment.localeCompare(b.environment);
    return sortAsc ? cmp : -cmp;
  });

  const SortButton = ({ label, k }: { label: string; k: SortKey }) => (
    <button
      onClick={() => handleSort(k)}
      data-testid={`sort-${k}`}
      className={cn(
        "flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase transition-colors",
        sortKey === k ? "text-primary" : "text-muted-foreground/40 hover:text-white"
      )}
    >
      {label}
      {sortKey === k && (
        sortAsc
          ? <ChevronUp className="w-3 h-3" />
          : <ChevronDown className="w-3 h-3" />
      )}
    </button>
  );

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

        <main className="flex-1 p-6 overflow-auto space-y-6">
          {/* Page header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
              <span className="w-2 h-6 bg-primary rounded-sm shadow-[0_0_10px_hsl(var(--primary))]" />
              Đăng ký Dịch vụ
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/40 tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              GIÁM SÁT TRỰC TIẾP — {SERVICES.length} DỊCH VỤ
            </div>
          </div>

          {/* Summary cards */}
          <SummaryBar services={SERVICES} />

          {/* Filter + Sort controls */}
          <div className="glass-panel rounded-xl border border-white/5 px-5 py-3 flex items-center gap-4 flex-wrap">
            <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest mr-1">Lọc</span>
            {(["all", "online", "degraded", "offline"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                data-testid={`filter-${f}`}
                className={cn(
                  "px-3 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all duration-200",
                  filterStatus === f
                    ? "bg-primary/20 border-primary/50 text-primary"
                    : "border-white/10 text-muted-foreground/50 hover:text-white hover:border-white/20"
                )}
              >
                {f === "all" ? "ALL" : STATUS_META[f].label}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-4">
              <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Sắp xếp</span>
              <SortButton label="Tên" k="name" />
              <SortButton label="Trạng thái" k="status" />
              <SortButton label="Môi trường" k="environment" />
            </div>
          </div>

          {/* Column headers */}
          <div className="hidden md:grid grid-cols-[1.5rem_1fr_10rem_6rem_5rem_5rem_2rem] gap-4 px-6 text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">
            <span />
            <span>Dịch vụ</span>
            <span>Trạng thái</span>
            <span className="text-center">Phiên bản</span>
            <span className="text-center">Môi trường</span>
            <span className="text-right">Độ trễ</span>
            <span />
          </div>

          {/* Service rows */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="glass-panel rounded-xl border border-white/5 p-12 text-center text-muted-foreground/40 font-mono text-sm tracking-wider">
                KHÔNG TÌM THẤY DỊCH VỤ PHÙ HỢP
              </div>
            ) : (
              filtered.map((service) => (
                <ServiceRow
                  key={service.id}
                  service={service}
                  expanded={expandedId === service.id}
                  onToggle={() => toggle(service.id)}
                />
              ))
            )}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
